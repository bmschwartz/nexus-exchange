import { Context } from "../../context"
import { getOrders } from "../../repository/OrderSetRepository"
import { getExchangeAccount, createExchangeAccount, getExchangeAccounts } from "../../repository/ExchangeAccountRepository"

export const ExchangeAccountQueries = {
  async exchangeAccounts(parent: any, args: any, ctx: Context) {
    const { input: { membershipId } } = args
    return getExchangeAccounts(ctx, Number(membershipId))
  },
}

export const ExchangeAccountResolvers = {
  async __resolveReference({ id: accountId }: any, args: any, ctx: Context) {
    return getExchangeAccount(ctx, accountId)
  },
  async membership(account: any, args: any, ctx: Context) {
    return {
      id: account.membershipId,
    }
  },
  async orders(account: any, args: any, ctx: Context) {
    return getOrders(ctx, Number(account.membershipId))
  },
}

export const ExchangeAccountMutations = {
  async createExchangeAccount(parent: any, args: any, ctx: Context) {
    const {
      input: {
        membershipId, apiKey, apiSecret, exchange
      }
    } = args

    return createExchangeAccount(ctx, Number(membershipId), apiKey, apiSecret, exchange)
  },

  async deleteExchangeAccount(parent: any, args: any, ctx: Context) {
    const { input: { id: accountId } } = args

    const deletedAccount = await ctx.prisma.exchangeAccount.delete({ where: { id: Number(accountId) } })

    return deletedAccount && deletedAccount.id === accountId
  }
}
