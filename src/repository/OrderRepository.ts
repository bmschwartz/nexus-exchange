import { Exchange, Order, OrderSide, OrderStatus, OrderType, StopTriggerType } from "@prisma/client";
import { Context } from "../context";

export interface MemberOrdersInput {
  membershipId: string
  limit?: number
  offset?: number
}

export interface MemberOrdersResult {
  totalCount: number
  orders: Order[]
}

export const getOrder = async (ctx: Context, orderId: string) => {
  return ctx.prisma.order.findUnique({ where: { id: orderId } })
}

export const getOrderSet = async (ctx: Context, orderId: string) => {
  const order = await ctx.prisma.order.findUnique({
    where: { id: orderId },
  })

  if (!order) {
    return new Error("Could not find order!")
  }

  return ctx.prisma.orderSet.findUnique({
    where: { id: order.id },
  })
}

export const getOrderSide = async (ctx: Context, orderId: string) => {
  const order = await ctx.prisma.order.findUnique({ where: { id: orderId } })
  return order && order.side
}

export const getOrderType = async (ctx: Context, orderId: string) => {
  const order = await ctx.prisma.order.findUnique({ where: { id: orderId } })
  return order && order.orderType
}

export const cancelOrder = async (ctx: Context, orderId: string) => {
  const order = await ctx.prisma.order.findUnique({
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

interface CreateOrderData {
  side: OrderSide;
  exchange: Exchange;
  symbol: string;
  orderType: OrderType;
  closeOrder: boolean;
  percent: number;
  leverage: number;
  price: number | null;
  stopPrice: number | null;
  trailingStopPercent: number | null;
  stopTriggerType: StopTriggerType | null;
}

export const createOrder = async (
  ctx: Context,
  orderSetId: string,
  exchangeAccountId: string,
  orderData: CreateOrderData,
) => {
  const { percent, ...realOrderData } = orderData

  let order: Order

  try {
    order = await ctx.prisma.order.create({
      data: {
        ...realOrderData,
        status: OrderStatus.NEW,
        exchangeAccount: { connect: { id: exchangeAccountId } },
        orderSet: { connect: { id: orderSetId } },
      },
    })
  } catch (e) {
    console.error(e)
    return
  }

  if (!order) {
    return null
  }

  let opId: string
  try {
    switch (orderData.exchange) {
      case Exchange.BINANCE:
        opId = ""  // TODO: Fix me
        break
      case Exchange.BITMEX:
        const { id: orderId, clOrderId, clOrderLinkId, closeOrder } = order
        if (closeOrder) {
          opId = await ctx.messenger.sendCloseBitmexPosition(exchangeAccountId, { orderId, clOrderId, clOrderLinkId, ...orderData })
        } else {
          opId = await ctx.messenger.sendCreateBitmexOrder(exchangeAccountId, { orderId, clOrderId, clOrderLinkId, ...orderData })
        }
        break
    }
  } catch {
    await ctx.prisma.order.delete({ where: { id: order.id } })
    return {
      error: "Unable to connect to exchange",
    }
  }

  return order
}

export const getMemberOrders = async (ctx: Context, { membershipId, limit, offset }: MemberOrdersInput): Promise<MemberOrdersResult | Error> => {
  const exchangeAccounts = await ctx.prisma.exchangeAccount.findMany({
    where: { membershipId },
  })

  if (!exchangeAccounts) {
    return { orders: [], totalCount: 0}
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
