import { Context } from "../../context"
import { getGroupOrderSets } from "../../repository/GroupRepository"

export const GroupResolvers = {
  async orderSets(group: any, args: any, ctx: Context) {
    return getGroupOrderSets(ctx, Number(group.id))
  },
}
