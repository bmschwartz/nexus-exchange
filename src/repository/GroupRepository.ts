import { OrderSet } from "@prisma/client";
import { Context } from "src/context";


export interface IOrderSetsInput {
  groupId: number
  limit?: number
  offset?: number
}

export interface IOrderSetResult {
  totalCount: number
  orderSets: OrderSet[]
}


export const getGroupOrderSets = async (ctx: Context, { groupId, limit, offset }: IOrderSetsInput): Promise<IOrderSetResult> => {
  const orderSets = await ctx.prisma.orderSet.findMany({
    take: limit,
    skip: offset,
    where: { groupId },
    orderBy: { createdAt: "desc" },
  })
  const orderSetCount = await ctx.prisma.orderSet.count({
    where: { groupId }
  })

  return {
    orderSets,
    totalCount: orderSetCount
  }
}