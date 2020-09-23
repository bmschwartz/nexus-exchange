import { cancelOrder, getOrder, getOrderSet, getOrderSide, getOrderType } from "../../controllers/OrderController"
import { Context } from "../../context"

export const OrderResolvers = {
  async __resolveReference({ id: orderId }: any, args: any, ctx: Context) {
    return getOrder(ctx, orderId)
  },
  async orderSet({ id: orderId }: any, args: any, ctx: Context) {
    return getOrderSet(ctx, orderId)
  },

  async side({ id: orderId }: any, args: any, ctx: Context) {
    return getOrderSide(ctx, orderId)
  },

  async orderType({ id: orderId }: any, args: any, ctx: Context) {
    return getOrderType(ctx, orderId)
  },

  async membership(order: any, args: any, ctx: Context) {
    return {
      id: order.membershipId,
    }
  },
}

export const OrderMutations = {
  async cancelOrder(parent: any, args: any, ctx: Context) {
    return cancelOrder(ctx, Number(parent.orderId))
  },
}
