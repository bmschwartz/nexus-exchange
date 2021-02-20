import { OrderSet, Position } from "@prisma/client";
import { Context } from "src/context";

export interface OrderSetsInput {
  groupId: string
  limit?: number
  offset?: number
}

export interface OrderSetResult {
  totalCount: number
  orderSets: OrderSet[]
}

export interface GroupPositionsResult {
  totalCount: number
  positions: Position[]
}

export const getGroupOrderSets = async (
  ctx: Context,
  { groupId, limit, offset }: OrderSetsInput,
): Promise<OrderSetResult> => {
  const orderSets = await ctx.prisma.orderSet.findMany({
    take: limit,
    skip: offset,
    where: { groupId },
    orderBy: { createdAt: "desc" },
  })
  const orderSetCount = await ctx.prisma.orderSet.count({
    where: { groupId },
  })

  return {
    orderSets,
    totalCount: orderSetCount,
  }
}
