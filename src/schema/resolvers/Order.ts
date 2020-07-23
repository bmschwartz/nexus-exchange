import { Context } from "../../context";

export const OrderResolvers = {
  async __resolveReference(order: any, args: any, ctx: Context) {
    return ctx.prisma.order.findOne({ where: { id: Number(order.id) } })
  },
  async orderSet({ id: orderId }: any, args: any, ctx: Context) {
    const order = await ctx.prisma.order.findOne({ where: { id: Number(orderId) } })

    if (!order) {
      throw new Error("Could not find order!")
    }

    return ctx.prisma.orderSet.findOne({
      where: { id: order.id }
    })
  },

  async membership(order: any, args: any, ctx: Context) {
    return {
      id: order.membershipId
    }
  },
}