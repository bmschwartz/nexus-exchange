import { getOrders } from "../../repository/GroupMembershipRepository"
import { getExchangeAccounts } from "../../repository/ExchangeAccountRepository"
import { Context } from "../../context"
import { getGroupOrderSets } from "src/repository/GroupRepository"

export const GroupResolvers = {
  async orders(group: any, args: any, ctx: Context) {
    return getOrders(ctx, Number(group.id))
  },
  async exchangeAccounts(group: any, args: any, ctx: Context) {
    return getExchangeAccounts(ctx, Number(group.id))
  },

  async orderSets({ id: groupId }: any, args: any, ctx: Context) {
    return getGroupOrderSets(ctx, Number(groupId))
  },
}
