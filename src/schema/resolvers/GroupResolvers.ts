import { Context } from "../../context"
import { getOrderSet } from "../../repository/OrderSetRepository"
import { getGroupOrderSets, getGroupPositions } from "../../repository/GroupRepository"

export const GroupResolvers = {
  async orderSet(group: any, args: any, ctx: Context) {
    return getOrderSet(ctx, Number(args.input.id))
  },

  async orderSets(group: any, { limit, offset }: any, ctx: Context) {
    return getGroupOrderSets(ctx, { limit, offset, groupId: Number(group.id) })
  },

  async positions(group: any, { symbol, limit, offset }: any, ctx: Context) {
    return getGroupPositions(ctx, { symbol, limit, offset, groupId: Number(group.id) })
  },

  async symbolsWithPosition(group: any, args: any, ctx: Context) {
    // TODO This function...
    return {
      binance: [],
      bitmex: []
    }
  },

  async position(group: any, { id: positionId }: any, ctx: Context) {
    // TODO This function...
    return null
  }
}
