import { getMemberOrders } from "../../repository/OrderRepository"
import { getMemberPositions } from "../../repository/PositionRepository"
import { getExchangeAccounts } from "../../repository/ExchangeAccountRepository"
import { Context } from "../../context"
import {logger} from "../../logger";

export const GroupMembershipResolvers = {
  async orders(membership: any, { limit, offset }: any, ctx: Context) {
    return getMemberOrders(ctx, { limit, offset, membershipId: membership.id })
  },

  async positions(membership: any, args: any, ctx: Context) {
    try {
      const {input: {symbol, exchange, limit, offset}} = args
      return getMemberPositions(ctx, { symbol, exchange, limit, offset, membershipId: membership.id })
    } catch (e) {
      logger.info({
        message: "[GroupMembershipResolvers.positions] Error getting positions",
        membershipId: membership.id,
        error: e,
      })
      return null
    }
  },

  async exchangeAccounts(membership: any, args: any, ctx: Context) {
    try {
      return getExchangeAccounts(ctx, membership.id)
    } catch (e) {
      logger.info({
        message: "[GroupMembershipResolvers.exchangeAccounts] Error getting exchange accounts",
        membershipId: membership.id,
        error: e,
      })
    }
    return null
  },
}
