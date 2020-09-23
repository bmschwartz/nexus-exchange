import { getOrders } from "../../controllers/GroupMembershipController"
import { Context } from "../../context"

export const GroupMembershipResolvers = {
  async orders(membership: any, args: any, ctx: Context) {
    return getOrders(ctx, Number(membership.id))
  },
}
