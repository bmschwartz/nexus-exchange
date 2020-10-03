import { FindManyOrderSetArgs, OrderSet } from "@prisma/client";
import { Context } from "src/context";

export interface IOrderSetsResult {
  orderSets: OrderSet[]
  hasMore: Boolean
}

export interface IOrderSetsInput {
  groupId: number
  pageSize?: number
  after?: string
}

const DEFAULT_PAGE_SIZE = 25

export const getGroupOrderSets = async (ctx: Context, { groupId, pageSize, after }: IOrderSetsInput): Promise<IOrderSetsResult> => {
  pageSize = pageSize || DEFAULT_PAGE_SIZE

  const findArgs: FindManyOrderSetArgs = {
    take: pageSize,
    where: { groupId },
    orderBy: { id: "desc" }
  }

  if (after) {
    findArgs.skip = 1
    findArgs.cursor = { id: Number(after) }
  }

  const orderSets = await ctx.prisma.orderSet.findMany(findArgs)

  const lastOrderSet = await ctx.prisma.orderSet.findFirst({
    where: { groupId },
    orderBy: { id: "asc" }
  })

  return {
    orderSets,
    hasMore: lastOrderSet.id !== orderSets[orderSets.length - 1].id,
  }
}