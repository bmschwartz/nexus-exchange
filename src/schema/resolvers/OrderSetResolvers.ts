import { getOrderSet, createOrderSet, updateOrderSet, getOrders, getOrderSide } from "../../repository/OrderSetRepository"
import { Context } from "src/context"

export const OrderSetQueries = {
  async orderSet(parent: any, args: any, ctx: Context) {
    const {
      input: { id: orderSetId },
    } = args
    return getOrderSet(ctx, orderSetId)
  },
}

export const OrderSetMutations = {
  async createOrderSet(parent: any, args: any, ctx: Context) {
    const {
      input: {
        groupId,
        membershipIds,
        symbol,
        exchange,
        description,
        side,
        orderType,
        price,
        stopPrice,
        percent,
        leverage,
        stopTriggerType,
        trailingStopPercent,
      },
    } = args

    const orderSet = await createOrderSet(ctx, { groupId, membershipIds, symbol, exchange, description, side, orderType, leverage, price, stopPrice, percent, stopTriggerType, trailingStopPercent })
    return { orderSet }
  },

  async updateOrderSet(parent: any, args: any, ctx: Context) {
    const {
      input: { orderSetId, description },
    } = args

    return updateOrderSet(ctx, { orderSetId, description })
  },
}

export const OrderSetResolvers = {
  async __resolveReference(orderSet: any, args: any, ctx: Context) {
    return getOrderSet(ctx, orderSet.id)
  },

  async orders({ id: orderSetId }: any, { limit, offset }: any, ctx: Context) {
    return getOrders(ctx, { limit, offset, orderSetId })
  },

  async side({ id: orderSetId }: any, args: any, ctx: Context) {
    return getOrderSide(ctx, orderSetId)
  },
}
