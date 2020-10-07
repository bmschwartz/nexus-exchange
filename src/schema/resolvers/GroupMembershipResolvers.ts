import { getExchangeAccounts } from "../../repository/ExchangeAccountRepository"
import { getMemberOrders } from "../../repository/OrderRepository"
import { Context } from "../../context"

export const GroupMembershipResolvers = {
  async orders(membership: any, { limit, offset }: any, ctx: Context) {
    return getMemberOrders(ctx, { limit, offset, membershipId: Number(membership.id) })
  },
  async exchangeAccounts(membership: any, args: any, ctx: Context) {
    return getExchangeAccounts(ctx, Number(membership.id))
  },
}
