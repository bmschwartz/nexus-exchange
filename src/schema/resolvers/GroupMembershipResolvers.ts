import { getMemberOrders } from "../../repository/OrderRepository"
import { getMemberPositions } from "../../repository/PositionRepository"
import { getExchangeAccounts } from "../../repository/ExchangeAccountRepository"
import { Context } from "../../context"
import {logger} from "../../logger";

export const GroupMembershipResolvers = {
  async orders(membership: any, args: any, ctx: Context) {
    const {
      input: { limit, offset },
    } = args
    return getMemberOrders(ctx, { limit, offset, membershipId: membership.id })
  },

  async positions(membership: any, args: any, ctx: Context) {
    try {
      const {input: { symbol, exchange, limit, offset, side } } = args
      return getMemberPositions(ctx, { symbol, exchange, limit, offset, side, membershipId: membership.id })
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
    let activeOnly: boolean
    let exchange: string

    if (args.input) {
      activeOnly = args.input.activeOnly
      exchange = args.input.exchange
    }

    try {
      return getExchangeAccounts(ctx, membership.id, activeOnly, exchange)
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
