import { Context } from '../../context'

export const OrderSetQueries = {
  async orderSet(parent: any, args: any, ctx: Context) {
    const {
      input: { id },
    } = args
    return ctx.prisma.orderSet.findOne({ where: { id: Number(id) } })
  },

  async groupOrderSets(parent: any, args: any, ctx: Context) {
    const {
      input: { groupId },
    } = args
    return ctx.prisma.orderSet.findMany({ where: { groupId: Number(groupId) } })
  },
}

export const OrderSetMutations = {
  async createOrderSet(parent: any, args: any, ctx: Context) {
    const {
      input: {
        groupId,
        description,
        side,
        orderType,
        price,
        stopPrice,
        percent,
      },
    } = args

    if (percent < 1 || percent > 100) {
      return new Error('Percent must be between 1 and 100')
    }
    if (stopPrice) {
      if (side == 'BUY' && stopPrice >= price) {
        return new Error(
          'Stop price must be lower than entry price for BUY orders',
        )
      } else if (side == 'SELL') {
        return new Error(
          'Stop price must be higher than entry price for SELL orders',
        )
      }
    }

    const orderSet = ctx.prisma.orderSet.create({
      data: {
        groupId: Number(groupId),
        description,
        side,
        orderType,
        price,
        stopPrice,
        percent,
      },
    })

    if (!orderSet) {
      return new Error('Unable to create the OrderSet')
    }

    // emit orderset created message

    return orderSet
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
