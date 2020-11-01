import { Exchange, OperationType, OrderSet } from "@prisma/client";
import { Context } from "../context";
import { asyncForEach } from "../helper"
import { getPendingBinanceAccountOperations } from "./AsyncOperationRepository";
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
  try {
    opId = await ctx.messenger.sendCreateBinanceAccount(ctx.userId, account.id, apiKey, apiSecret)
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

const validateApiKeyAndSecret = async (exchange: Exchange, apiKey: string, apiSecret: string): Promise<boolean> => {
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

  const pendingAccountOps = await getPendingBinanceAccountOperations(ctx.prisma, Number(accountId))

  if (pendingAccountOps && pendingAccountOps.length > 0) {
    return { error: "Already updating account" }
  }

  if (!account.active) {
    await ctx.prisma.exchangeAccount.delete({ where: { id: Number(accountId) } })
    const operation = await ctx.prisma.asyncOperation.create({
      data: {
        payload: { accountId: Number(accountId) },
        success: true,
        complete: true,
        userId: ctx.userId,
        opType: OperationType.DELETE_BINANCE_ACCOUNT,
      }
    })
    return { operationId: operation.id }
  }

  let opId: number

  try {
    if (account.active) {
      opId = await ctx.messenger.sendDeleteBinanceAccount(ctx.userId, account.id)
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

  const pendingAccountOps = await getPendingBinanceAccountOperations(ctx.prisma, accountId)

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
    opId = await ctx.messenger.sendUpdateBinanceAccount(ctx.userId, account.id, apiKey, apiSecret)
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

  const pendingAccountOps = await getPendingBinanceAccountOperations(ctx.prisma, accountId)

  if (pendingAccountOps && pendingAccountOps.length > 0) {
    return { error: "Already updating account" }
  }

  const { apiKey, apiSecret } = account

  let opId: number
  try {
    if (account.active) {
      opId = await ctx.messenger.sendDeleteBinanceAccount(ctx.userId, account.id, true)
    } else {
      opId = await ctx.messenger.sendCreateBinanceAccount(ctx.userId, account.id, apiKey, apiSecret)
    }
  } catch {
    return {
      error: "Unable to connect to exchange"
    }
  }

  return { operationId: opId }
}

export const createOrderForExchangeAccounts = async (
  ctx: Context,
  orderSet: OrderSet,
  membershipIds: number[],
): Promise<any> => {
  const { side, exchange, symbol, orderType, price, stopPrice } = orderSet

  await asyncForEach(membershipIds, async (membershipId: number) => {
    const exchangeAccount = await ctx.prisma.exchangeAccount.findOne({
      where: { ExchangeAccount_exchange_membershipId_key: { exchange, membershipId } }
    })
    if (!exchangeAccount) {
      return
    }
    await createOrder(ctx, orderSet.id, exchangeAccount.id, side, exchange, symbol, orderType, price, stopPrice)

    // TODO emit order created message ?
  })
}
