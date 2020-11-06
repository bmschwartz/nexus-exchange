import { Context } from "../../context"
import { getOrders, getPositions } from "../../repository/ExchangeAccountRepository"
import {
  getExchangeAccount,
  getExchangeAccounts,
  createExchangeAccount as runCreateExchangeAccount,
  deleteExchangeAccount as runDeleteExchangeAccount,
  updateExchangeAccount as runUpdateExchangeAccount,
  toggleExchangeAccountActive as runToggleExchangeAccountActive
} from "../../repository/ExchangeAccountRepository"

export const ExchangeAccountQueries = {
  async exchangeAccount(parent: any, args: any, ctx: Context) {
    const { input: { id: accountId } } = args
    return getExchangeAccount(ctx, Number(accountId))
  },
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
    return getOrders(ctx, Number(account.id))
  },
  async positions(account: any, args: any, ctx: Context) {
    return getPositions(ctx, Number(account.id))
  },
}

export const ExchangeAccountMutations = {
  async createExchangeAccount(parent: any, args: any, ctx: Context) {
    const {
      input: {
        membershipId, apiKey, apiSecret, exchange
      }
    } = args

    return runCreateExchangeAccount(ctx, Number(membershipId), apiKey, apiSecret, exchange)
  },

  async deleteExchangeAccount(parent: any, args: any, ctx: Context) {
    const { input: { id: accountId } } = args

    return runDeleteExchangeAccount(ctx, Number(accountId))
  },

  async updateExchangeAccount(parent: any, args: any, ctx: Context) {
    const { input: { id: accountId, apiKey, apiSecret } } = args

    return runUpdateExchangeAccount(ctx, Number(accountId), apiKey, apiSecret)
  },

  async toggleExchangeAccountActive(parent: any, args: any, ctx: Context) {
    const { input: { id: accountId } } = args

    return runToggleExchangeAccountActive(ctx, Number(accountId))
  }
}
