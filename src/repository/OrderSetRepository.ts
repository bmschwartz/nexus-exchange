import { OrderSet, OrderSide, OrderType, Exchange, Order, BitmexCurrency, BinanceCurrency } from "@prisma/client";
import { Context } from "src/context";

interface CreateOrderSetInput {
  groupId: number;
  percent: number;
  side: OrderSide;
  symbol: string;
  exchange: Exchange;
  orderType: OrderType;
  description?: string;
  price?: number;
  stopPrice?: number
}

interface UpdateOrderSetInput {
  orderSetId: number;
  description?: string;
}

type Currency =
  | BinanceCurrency
  | BitmexCurrency

export const getOrderSet = async (ctx: Context, orderSetId: number): Promise<OrderSet | null> => {
  return ctx.prisma.orderSet.findOne({ where: { id: orderSetId } })
}

export const getGroupOrderSets = async (ctx: Context, groupId: number): Promise<OrderSet[] | null> => {
  return ctx.prisma.orderSet.findMany({ where: { groupId } })
}

export const createOrderSet = async (ctx: Context, data: CreateOrderSetInput): Promise<OrderSet | null | Error> => {
  const {
    groupId,
    description,
    side,
    exchange,
    symbol,
    orderType,
    price,
    stopPrice,
    percent
  } = data

  const error = await getOrderSetInputError(
    ctx,
    symbol,
    exchange,
    percent,
    side,
    price,
    stopPrice
  )

  if (error) {
    return error
  }

  const orderSet = ctx.prisma.orderSet.create({
    data: {
      groupId: Number(groupId),
      description,
      exchange,
      symbol,
      side,
      orderType,
      price,
      stopPrice,
      percent,
    },
  })

  if (!orderSet) {
    return new Error("Unable to create the OrderSet")
  }

  // TODO: emit orderset created message

  return orderSet
}

export const updateOrderSet = async (ctx: Context, data: UpdateOrderSetInput): Promise<OrderSet | null> => {
  const { orderSetId, description } = data
  const orderSet = ctx.prisma.orderSet.update({
    where: { id: Number(orderSetId) },
    data: { description },
  })

  if (!orderSet) {
    return null
  }

  // emit orderset updated message

  return orderSet
}

export const getOrders = async (ctx: Context, orderSetId: number): Promise<Order[] | null> => {
  return ctx.prisma.order.findMany({
    where: { orderSetId: Number(orderSetId) },
  })
}

export const getOrderSide = async (ctx: Context, orderSetId: number): Promise<OrderSide | null> => {
  const orderSet = await ctx.prisma.orderSet.findOne({ where: { id: orderSetId } })
  return orderSet && orderSet.side
}

export const getOrderSetInputError = async (ctx: Context, symbol: string, exchange: Exchange, percent: number, side: OrderSide, price?: number, stopPrice?: number): Promise<Error | undefined> => {
  if (!exchangeExists(exchange)) {
    return new Error("Exchange does not exist")
  }

  const currency = await getCurrency(ctx, exchange, symbol)
  if (!currency) {
    return new Error("Currency does not exist")
  }

  if (percent < 1 || percent > 100) {
    return new Error("Percent must be between 1 and 100")
  }

  if (price) {
    // limit order
    if (stopPrice) {
      if (side === OrderSide.BUY && stopPrice >= price) {
        return new Error(
          "Stop price must be lower than entry price for BUY orders",
        )
      } else if (side === OrderSide.SELL) {
        return new Error(
          "Stop price must be higher than entry price for SELL orders",
        )
      }
    }
  } else {
    // market order
    if (stopPrice) {
      if (side === OrderSide.BUY)
        currency.lastPrice
    }
  }

  return
}

const getCurrency = async (ctx: Context, exchange: Exchange, symbol: string): Promise<Currency | null | undefined> => {
  switch (exchange) {
    case Exchange.BINANCE:
      return ctx.prisma.binanceCurrency.findOne({ where: { symbol } })
    case Exchange.BITMEX:
      return ctx.prisma.bitmexCurrency.findOne({ where: { symbol } })
    default:
      return
  }
}

const exchangeExists = (exchange: Exchange): boolean => {
  switch (exchange) {
    case Exchange.BINANCE:
    case Exchange.BITMEX:
      return true
    default:
      return false
  }
}