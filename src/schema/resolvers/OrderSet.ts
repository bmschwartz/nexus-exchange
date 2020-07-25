import { Context } from "../../context";

export const OrderSetQueries = {
  async orderSet(parent: any, args: any, ctx: Context) {
    const { input: { id } } = args
    return ctx.prisma.orderSet.findOne({ where: { id: Number(id) } })
  },

  async groupOrderSets(parent: any, args: any, ctx: Context) {
    const { input: { groupId } } = args
    return ctx.prisma.orderSet.findMany({ where: { groupId: Number(groupId) } })
  }
}

export const OrderSetMutations = {
  async createOrderSet(parent: any, args: any, ctx: Context) {
    const { input: { groupId, description } } = args

    const orderSet = ctx.prisma.orderSet.create({
      data: { groupId: Number(groupId), description }
    })

    if (!orderSet) {
      return null
    }

    // emit orderset created message

    return orderSet
  },

  async updateOrderSet(parent: any, args: any, ctx: Context) {
    const { input: { orderSetId, description } } = args

    const orderSet = ctx.prisma.orderSet.update({
      where: { id: Number(orderSetId) },
      data: { description }
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
    return ctx.prisma.order.findMany({ where: { orderSetId: Number(orderSetId) } })
  }
}