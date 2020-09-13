import { Context } from "src/context";

export const getOrders = async (ctx: Context, id: number) => {
    return ctx.prisma.order.findMany({
        where: { membershipId: id },
    })
}