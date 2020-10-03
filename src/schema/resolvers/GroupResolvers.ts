import { Context } from "../../context"
import { getGroupOrderSets } from "../../repository/GroupRepository"

export const GroupResolvers = {
  async orderSets(group: any, { limit, offset }: any, ctx: Context) {
    return getGroupOrderSets(ctx, { limit, offset, groupId: Number(group.id) })
  },
}
