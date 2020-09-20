import { OrderSet, OrderSide, OrderType, Exchange } from "@prisma/client";
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

  const error = getOrderSetInputError()

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

  // emit orderset created message

  return orderSet
}

export const updateOrderSet = async (ctx: Context): Promise<OrderSet | null> => {

}

export const getOrders = async (ctx: Context): Promise<Orders[] | null> => {

}

export const getOrderSide = async (ctx: Context): Promise<OrderSide | null> => {

}

export const getOrderSetInputError = async (symbol: String, exchange: Exchange, percent: number, side: OrderSide, price?: number, stopPrice?: number): Error | undefined => {
  /**
   * If BUY:
   *  If market:
   *    Need to know current price
   */
  if (percent < 1 || percent > 100) {
    return new Error("Percent must be between 1 and 100")
  }
  if (price && stopPrice) {
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
}