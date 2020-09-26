import { getOrders } from "../../repository/GroupMembershipRepository"
import { Context } from "../../context"

export const GroupMembershipResolvers = {
  async orders(membership: any, args: any, ctx: Context) {
    const { exchange } = args
    return getOrders(ctx, Number(membership.id), exchange)
  },
}
