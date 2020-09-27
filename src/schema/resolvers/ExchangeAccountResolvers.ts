import { getExchangeAccount } from "../../repository/ExchangeAccountRepository"
import { Context } from "../../context"

export const ExchangeAccountResolvers = {
  async __resolveReference({ id: accountId }: any, args: any, ctx: Context) {
    return getExchangeAccount(ctx, accountId)
  },
  async membership(account: any, args: any, ctx: Context) {
    return {
      id: account.membershipId,
    }
  },
}

// export const ExchangeAccountMutations = {
//   async createExchangeAccount(parent: any, args: any, ctx: Context) {
//     const { membershipId, apiKey, apiSecret, exchange } = args
//     return createExchangeAccount(ctx, membershipId, apiKey, apiSecret, exchange)
//   },
// }
