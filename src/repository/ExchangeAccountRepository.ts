import { Exchange } from "@prisma/client";
import { Context } from "src/context";

export const getExchangeAccount = async (ctx: Context, accountId: number) => {
  return ctx.prisma.exchangeAccount.findOne({ where: { id: accountId } })
}

export const getExchangeAccounts = async (ctx: Context, membershipId: number) => {
  return ctx.prisma.exchangeAccount.findMany({ where: { membershipId } })
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