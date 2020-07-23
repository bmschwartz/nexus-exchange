import { Context } from "../../context";

export const OrderSetQueries = {
  async groupOrderSets(parent: any, args: any, ctx: Context) {
    const { input: { groupId } } = args
    return ctx.prisma.orderSet.findMany({ where: { groupId: Number(groupId) } })
  }
}

export const OrderSetMutations = {
  async createOrderSet(parent: any, args: any, ctx: Context) {
    const { input: { groupId, description } } = args

    return ctx.prisma.orderSet.create({
      data: { groupId, description }
    })
  }
}

export const OrderSetResolvers = {
  async __resolveReference(orderSet: any, args: any, ctx: Context) {
    return ctx.prisma.orderSet.findOne({ where: { id: Number(orderSet.id) } })
  },

  async orders({ id: orderSetId }: any, args: any, ctx: Context) {
    return ctx.prisma.order.findMany({ where: { orderSetId: Number(orderSetId) } })
  }
}