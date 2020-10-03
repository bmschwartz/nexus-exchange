import { Context } from "../../context"
import { getGroupOrderSets } from "../../repository/GroupRepository"

export const GroupResolvers = {
  async orderSets(group: any, { pageSize, after }: any, ctx: Context) {
    const { orderSets, hasMore } = await getGroupOrderSets(ctx, { after, pageSize, groupId: Number(group.id) })

    return {
      hasMore,
      orderSets,
      cursor: orderSets.length ? orderSets[orderSets.length - 1].id : null,
    }
  },
}
