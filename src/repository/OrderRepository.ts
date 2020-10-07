import { Exchange, Order, OrderSide, OrderStatus, OrderType } from "@prisma/client";
import { Context } from "src/context";

export interface MemberOrdersInput {
  membershipId: number
  limit?: number
  offset?: number
}

export interface MemberOrdersResult {
  totalCount: number
  orders: Order[]
}

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
    return { success: false, error: "Order not found" }
  }

  if (order.status !== OrderStatus.NEW && order.status !== OrderStatus.PARTIALLY_FILLED) {
    return { success: false, error: "Order can't be canceled" }
  }

  await ctx.prisma.order.update({
    where: { id: orderId },
    data: { status: OrderStatus.CANCELED }
  })

  // todo emit cancel order message

  return { success: true, error: null }
}

export const createOrder = async (
  ctx: Context,
  orderSetId: number,
  exchangeAccountId: number,
  side: OrderSide,
  exchange: Exchange,
  symbol: string,
  orderType: OrderType,
  price?: number | null,
  stopPrice?: number | null,
) => {
  return ctx.prisma.order.create({
    data: {
      exchange,
      side,
      symbol,
      orderType,
      price,
      stopPrice,
      status: "NEW",
      exchangeAccount: { connect: { id: exchangeAccountId } },
      orderSet: { connect: { id: orderSetId } }
    }
  })
}

export const getMemberOrders = async (ctx: Context, { membershipId, limit, offset }: MemberOrdersInput): Promise<MemberOrdersResult | Error> => {
  const exchangeAccounts = await ctx.prisma.exchangeAccount.findMany({
    where: { membershipId }
  })

  if (!exchangeAccounts) {
    return new Error("Can't find exchanges for this membership")
  }

  const accountIds = exchangeAccounts.map(account => account.id)

  const orders: Order[] = await ctx.prisma.order.findMany({
    take: limit,
    skip: offset,
    where: { exchangeAccountId: { in: accountIds } },
    orderBy: { createdAt: "desc" },
  })
  const orderCount = await ctx.prisma.order.count({
    where: { exchangeAccountId: { in: accountIds } },
  })

  return {
    orders,
    totalCount: orderCount
  }
}