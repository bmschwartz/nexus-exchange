import { Context } from '../../context'

export const OrderResolvers = {
  async __resolveReference(order: any, args: any, ctx: Context) {
    return ctx.prisma.order.findOne({ where: { id: Number(order.id) } })
  },
  async orderSet({ id: orderId }: any, args: any, ctx: Context) {
    const order = await ctx.prisma.order.findOne({
      where: { id: Number(orderId) },
    })

    if (!order) {
      return new Error('Could not find order!')
    }

    return ctx.prisma.orderSet.findOne({
      where: { id: Number(order.id) },
    })
  },

  async side({ id }: any, args: any, ctx: Context) {
    const order = await ctx.prisma.order.findOne({ where: { id } })
    return order && order.side
  },

  async orderType({ id }: any, args: any, ctx: Context) {
    const order = await ctx.prisma.order.findOne({ where: { id } })
    return order && order.orderType
  },

  async membership(order: any, args: any, ctx: Context) {
    return {
      id: order.membershipId,
    }
  },
}

export const OrderMutations = {
  async cancelOrder(parent: any, args: any, ctx: Context) {
    const {
      input: { orderId },
    } = args
    const order = await ctx.prisma.order.findOne({
      where: { id: Number(orderId) },
    })
    if (!order) {
      return new Error('Order not found')
    }

    // emit cancel order message

    return order
  },
}
