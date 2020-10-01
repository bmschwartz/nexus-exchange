import { OrderSet } from "@prisma/client";
import { Context } from "src/context";

export const getGroupOrderSets = async (ctx: Context, groupId: number): Promise<OrderSet[]> => {
    return ctx.prisma.orderSet.findMany({ where: { groupId } })
}