import { Context } from "src/context";

export const getOrder = async (ctx: Context, orderId: number) => {
  return ctx.prisma.order.findOne({ where: { id: orderId } })
}

export const getOrderSet = async (ctx: Context, orderId: number) => {
  const order = await ctx.prisma.order.findOne({
    where: { id: Number(orderId) },
  })

  if (!order) {
    return new Error("Could not find order!")
  }

  return ctx.prisma.orderSet.findOne({
    where: { id: Number(order.id) },
  })
}

export const getOrderSide = async (ctx: Context, orderId: number) => {
  const order = await ctx.prisma.order.findOne({ where: { id: orderId } })
  return order && order.side
}

export const getOrderType = async (ctx: Context, orderId: number) => {
  const order = await ctx.prisma.order.findOne({ where: { id: orderId } })
  return order && order.orderType
}

export const cancelOrder = async (ctx: Context, orderId: number) => {
  const order = await ctx.prisma.order.findOne({
    where: { id: orderId },
  })
  if (!order) {
    return new Error("Order not found")
  }

  // emit cancel order message

  return order
}