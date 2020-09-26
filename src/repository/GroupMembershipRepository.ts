import { Exchange } from "@prisma/client";
import { Context } from "src/context";

export const getOrders = async (ctx: Context, id: number, orderExchange?: Exchange) => {
    return ctx.prisma.order.findMany({
        where: {
            membershipId: id,
            orderSet: {
                exchange: {
                    equals: orderExchange
                }
            }
        },
    })
}