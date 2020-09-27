import { getOrders } from "../../repository/GroupMembershipRepository"
import { getExchangeAccounts } from "../../repository/ExchangeAccountRepository"
import { Context } from "../../context"

export const GroupMembershipResolvers = {
  async orders(membership: any, args: any, ctx: Context) {
    return getOrders(ctx, Number(membership.id))
  },
  async exchangeAccounts(membership: any, args: any, ctx: Context) {
    return getExchangeAccounts(ctx, Number(membership.id))
  },
}
