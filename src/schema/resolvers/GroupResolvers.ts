import { Context } from "../../context"
import { getOrderSet } from "../../repository/OrderSetRepository"
import { getGroupOrderSets } from "../../repository/GroupRepository"

export const GroupResolvers = {
  async orderSet(group: any, args: any, ctx: Context) {
    return getOrderSet(ctx, Number(args.input.id))
  },

  async orderSets(group: any, { limit, offset }: any, ctx: Context) {
    return getGroupOrderSets(ctx, { limit, offset, groupId: Number(group.id) })
  },
}
