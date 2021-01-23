import { getMemberOrders } from "../../repository/OrderRepository"
import { getMemberPositions } from "../../repository/PositionRepository"
import { getExchangeAccounts } from "../../repository/ExchangeAccountRepository"
import { Context } from "../../context"

export const GroupMembershipResolvers = {
  async orders(membership: any, { limit, offset }: any, ctx: Context) {
    return getMemberOrders(ctx, { limit, offset, membershipId: membership.id })
  },

  async positions(membership: any, { limit, offset }: any, ctx: Context) {
    return getMemberPositions(ctx, { limit, offset, membershipId: membership.id })
  },

  async exchangeAccounts(membership: any, args: any, ctx: Context) {
    return getExchangeAccounts(ctx, membership.id)
  },
}
