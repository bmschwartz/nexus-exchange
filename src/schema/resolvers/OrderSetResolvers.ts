import { getOrderSet, getGroupOrderSets, createOrderSet } from "src/controllers/OrderSetController"
import { Context } from "../../context"

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
        description,
        side,
        symbol,
        exchange,
        orderType,
        price,
        stopPrice,
        percent,
      },
    } = args

    return createOrderSet(ctx, { groupId, symbol, exchange, description, side, orderType, price, stopPrice, percent })
  },

  async updateOrderSet(parent: any, args: any, ctx: Context) {
    const {
      input: { orderSetId, description },
    } = args

    const orderSet = ctx.prisma.orderSet.update({
      where: { id: Number(orderSetId) },
      data: { description },
    })

    if (!orderSet) {
      return null
    }

    // emit orderset updated message

    return orderSet
  },
}

export const OrderSetResolvers = {
  async __resolveReference(orderSet: any, args: any, ctx: Context) {
    return ctx.prisma.orderSet.findOne({ where: { id: Number(orderSet.id) } })
  },

  async orders({ id: orderSetId }: any, args: any, ctx: Context) {
    return ctx.prisma.order.findMany({
      where: { orderSetId: Number(orderSetId) },
    })
  },

  async orderSide({ id }: any, args: any, ctx: Context) {
    const orderSet = await ctx.prisma.orderSet.findOne({ where: { id } })
    return orderSet && orderSet.side
  },
}
