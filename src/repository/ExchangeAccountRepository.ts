import { Exchange, OrderSet } from "@prisma/client";
import { Context } from "src/context";
import { asyncForEach } from "../helper"
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
  const accountCount = await ctx.prisma.exchangeAccount.count({
    where: {
      AND: {
        exchange,
        membershipId,
      }
    }
  })

  if (accountCount > 0) {
    return new Error(`${exchange} account already exists for that membership`)
  }

  // TODO: Verify the api key and secret are valid with exchange
  const isValidApiKeyAndSecret = await validateApiKeyAndSecret(exchange, apiKey, apiSecret)

  if (!isValidApiKeyAndSecret) {
    return new Error(`Invalid API key pair for ${exchange}`)
  }

  return ctx.prisma.exchangeAccount.create({
    data: {
      active: true,
      apiKey,
      apiSecret,
      membershipId,
      exchange
    }
  })
}

const validateApiKeyAndSecret = async (exchange: Exchange, apiKey: string, apiSecret: string): Promise<boolean> => {
  return true
}

export const deleteExchangeAccount = async (ctx: Context, accountId: Number) => {
  const deletedAccount = await ctx.prisma.exchangeAccount.delete({ where: { id: Number(accountId) } })
  return deletedAccount && deletedAccount.id === accountId
}

export const updateExchangeAccount = async (ctx: Context, accountId: number, apiKey: string, apiSecret: string) => {
  const account = await ctx.prisma.exchangeAccount.findOne({ where: { id: accountId } })

  if (!account) {
    return { success: false, error: new Error("Account not found") }
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

  return {
    success: updatedAccount.apiKey === apiKey && updatedAccount.apiSecret === apiSecret,
    error: null
  }
}

export const toggleExchangeAccountActive = async (ctx: Context, accountId: Number): Promise<any> => {
  const account = await ctx.prisma.exchangeAccount.findOne({ where: { id: Number(accountId) }, select: { active: true } })
  if (!account) {
    return false
  }

  await ctx.prisma.exchangeAccount.update({ where: { id: Number(accountId) }, data: { active: !account.active } })

  return true
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
