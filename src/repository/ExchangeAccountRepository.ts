import { Exchange, ExchangeAccount, OperationType, OrderSet } from "@prisma/client";
import { Context } from "../context";
import { asyncForEach } from "../helper"
import { createAsyncOperation, getPendingAccountOperations } from "./AsyncOperationRepository";
import { createOrder } from "./OrderRepository";

export const getExchangeAccount = async (ctx: Context, accountId: number) => {
  return ctx.prisma.exchangeAccount.findOne({ where: { id: accountId } })
}

export const getExchangeAccounts = async (ctx: Context, membershipId: number) => {
  return ctx.prisma.exchangeAccount.findMany({ where: { membershipId }, orderBy: { exchange: "asc" } })
}

export const getOrders = async (ctx: Context, id: number) => {
  return ctx.prisma.order.findMany({
    where: { exchangeAccountId: id },
  })
}

export const getPositions = async (ctx: Context, id: number) => {
  return ctx.prisma.position.findMany({
    where: { exchangeAccountId: id },
  })
}

export const createExchangeAccount = async (ctx: Context, membershipId: number, apiKey: string, apiSecret: string, exchange: Exchange) => {
  if (!ctx.userId) {
    return {
      error: "No user found!"
    }
  }

  const accountCount = await ctx.prisma.exchangeAccount.count({
    where: {
      AND: {
        exchange,
        membershipId,
      }
    }
  })

  if (accountCount > 0) {
    return {
      error: `${exchange} account already exists for this membership`
    }
  }

  // TODO: Verify the api key and secret are valid with exchange
  const isValidApiKeyAndSecret = await validateApiKeyAndSecret(exchange, apiKey, apiSecret)

  if (!isValidApiKeyAndSecret) {
    return {
      error: `Invalid API key pair for ${exchange}`
    }
  }

  const account = await ctx.prisma.exchangeAccount.create({
    data: {
      active: false,
      apiKey,
      exchange,
      apiSecret,
      membershipId,
    }
  })

  let opId: number
  console.log("about to send create account")
  try {
    switch (exchange) {
      case Exchange.BINANCE:
        console.log("creating binance")
        opId = await ctx.messenger.sendCreateBinanceAccount(account.id, apiKey, apiSecret)
        break
      case Exchange.BITMEX:
        console.log("creating bitmex")
        opId = await ctx.messenger.sendCreateBitmexAccount(account.id, apiKey, apiSecret)
        break
    }
  } catch {
    await ctx.prisma.exchangeAccount.delete({ where: { id: account.id } })
    return {
      error: "Unable to connect to exchange"
    }
  }

  return {
    operationId: opId
  }
}

export const validateApiKeyAndSecret = async (exchange: Exchange, apiKey: string, apiSecret: string): Promise<boolean> => {
  // TODO: This function
  return true
}

export const deleteExchangeAccount = async (ctx: Context, accountId: Number) => {
  if (!ctx.userId) {
    return { error: "No user found!" }
  }
  const account = await ctx.prisma.exchangeAccount.findOne({ where: { id: Number(accountId) } })

  if (!account) {
    return { error: "Could not find the account" }
  }

  const pendingAccountOps = await getPendingAccountOperations(ctx.prisma, Number(accountId))

  if (pendingAccountOps && pendingAccountOps.length > 0) {
    return { error: "Already updating account" }
  }

  if (!account.active) {
    let opType: OperationType
    switch (account.exchange) {
      case Exchange.BINANCE:
        opType = OperationType.DELETE_BINANCE_ACCOUNT
        break
      case Exchange.BITMEX:
        opType = OperationType.DELETE_BITMEX_ACCOUNT
        break
    }

    await ctx.prisma.exchangeAccount.delete({ where: { id: Number(accountId) } })
    const operation = await createAsyncOperation(
      ctx.prisma,
      { accountId: Number(accountId), success: true, complete: true },
      opType
    )

    if (!operation) {
      return { error: "Could not delete account" }
    }

    return { operationId: operation.id }
  }

  let opId: number

  try {
    if (account.active) {
      switch (account.exchange) {
        case Exchange.BINANCE:
          opId = await ctx.messenger.sendDeleteBinanceAccount(account.id)
          break
        case Exchange.BITMEX:
          opId = await ctx.messenger.sendDeleteBitmexAccount(account.id)
          break
      }
    } else {
      return { error: "Account is inactive" }
    }
  } catch {
    return {
      error: "Unable to connect to exchange"
    }
  }

  return {
    operationId: opId
  }
}

export const updateExchangeAccount = async (ctx: Context, accountId: number, apiKey: string, apiSecret: string) => {
  if (!ctx.userId) {
    return {
      error: "No user found!"
    }
  }

  const account = await ctx.prisma.exchangeAccount.findOne({ where: { id: accountId } })

  if (!account) {
    return { success: false, error: new Error("Account not found") }
  }

  const pendingAccountOps = await getPendingAccountOperations(ctx.prisma, accountId)

  if (pendingAccountOps && pendingAccountOps.length > 0) {
    return { error: "Already updating account" }
  }

  // TODO: Verify the api key and secret are valid with exchange
  const isValidApiKeyAndSecret = await validateApiKeyAndSecret(account.exchange, apiKey, apiSecret)

  if (!isValidApiKeyAndSecret) {
    return { success: false, error: new Error(`Invalid API key pair for ${account.exchange}`) }
  }

  const updatedAccount = await ctx.prisma.exchangeAccount.update({ where: { id: Number(accountId) }, data: { apiKey, apiSecret } })

  if (!updatedAccount) {
    return {
      success: false, error: new Error(`Unable to update ${account.exchange} account`)
    }
  }

  let opId: number
  try {
    switch (account.exchange) {
      case Exchange.BINANCE:
        opId = await ctx.messenger.sendUpdateBinanceAccount(account.id, apiKey, apiSecret)
        break
      case Exchange.BITMEX:
        opId = await ctx.messenger.sendUpdateBitmexAccount(account.id, apiKey, apiSecret)
        break
    }
  } catch {
    await ctx.prisma.exchangeAccount.delete({ where: { id: account.id } })
    return {
      error: "Unable to connect to exchange"
    }
  }

  return {
    operationId: opId
  }

}

export const toggleExchangeAccountActive = async (ctx: Context, accountId: number): Promise<any> => {
  if (!ctx.userId) {
    return { error: "No user found!" }
  }

  const account = await ctx.prisma.exchangeAccount.findOne({ where: { id: Number(accountId) } })
  if (!account) {
    return { error: "Account not found" }
  }

  const pendingAccountOps = await getPendingAccountOperations(ctx.prisma, accountId)

  if (pendingAccountOps && pendingAccountOps.length > 0) {
    return { error: "Already updating account" }
  }

  const { apiKey, apiSecret } = account

  let opId: number
  try {
    switch (account.exchange) {
      case Exchange.BINANCE:
        if (account.active) {
          opId = await ctx.messenger.sendDeleteBinanceAccount(account.id, true)
        } else {
          opId = await ctx.messenger.sendCreateBinanceAccount(account.id, apiKey, apiSecret)
        }
        break
      case Exchange.BITMEX:
        if (account.active) {
          opId = await ctx.messenger.sendDeleteBitmexAccount(account.id, true)
        } else {
          opId = await ctx.messenger.sendCreateBitmexAccount(account.id, apiKey, apiSecret)
        }
        break
    }
  } catch {
    return {
      error: "Unable to connect to exchange"
    }
  }

  return { operationId: opId }
}

export const createOrdersForExchangeAccounts = async (
  ctx: Context,
  orderSet: OrderSet,
  membershipIds: number[],
): Promise<any> => {
  const { side, exchange, symbol, orderType, price, stopPrice } = orderSet

  const unresolvedExchangeAccounts = await Promise.allSettled(
    membershipIds
      .map(async (membershipId: number) =>
        ctx.prisma.exchangeAccount.findOne({
          where: { ExchangeAccount_exchange_membershipId_key: { exchange, membershipId } }
        })
      ).filter(Boolean)
  )

  const exchangeAccounts = unresolvedExchangeAccounts.map((result: PromiseSettledResult<ExchangeAccount | null>) => {
    return result.status === "fulfilled" ? result.value : null
  }).filter(Boolean)

  if (!exchangeAccounts.length) {
    return
  }

  const exchangeAccountIds = exchangeAccounts
    .map((account: ExchangeAccount | null) => account ? account.id : null)
    .filter(Boolean)

  const orders = await Promise.allSettled(
    exchangeAccountIds
      .map((accountId: number | null) =>
        accountId ? createOrder(ctx, orderSet.id, accountId, side, exchange, symbol, orderType, price, stopPrice) : null
      )
      .filter(Boolean)
  )

  console.log(orders)
}
