import { getOrderSet, getGroupOrderSets, createOrderSet, updateOrderSet, getOrders, getOrderSide } from "../../repository/OrderSetRepository"
import { Context } from "src/context"

export const OrderSetQueries = {
  async orderSet(parent: any, args: any, ctx: Context) {
    const {
      input: { id: orderSetId },
    } = args
    return getOrderSet(ctx, Number(orderSetId))
  },

  async groupOrderSets(parent: any, args: any, ctx: Context) {
    const {
      input: { groupId },
    } = args
    return getGroupOrderSets(ctx, Number(groupId))
  },
}

export const OrderSetMutations = {
  async createOrderSet(parent: any, args: any, ctx: Context) {
    const {
      input: {
        groupId,
        exchangeAccountIds,
        symbol,
        exchange,
        description,
        side,
        orderType,
        price,
        stopPrice,
        percent,
      },
    } = args

    return createOrderSet(ctx, { groupId, exchangeAccountIds, symbol, exchange, description, side, orderType, price, stopPrice, percent })
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
    return getOrderSet(ctx, Number(orderSet.id))
  },

  async orders({ id: orderSetId }: any, args: any, ctx: Context) {
    return getOrders(ctx, orderSetId)
  },

  async orderSide({ id: orderSetId }: any, args: any, ctx: Context) {
    return getOrderSide(ctx, orderSetId)
  },
}
