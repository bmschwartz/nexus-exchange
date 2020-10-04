import { getExchangeAccounts } from "../../repository/ExchangeAccountRepository"
import { Context } from "../../context"

export const GroupMembershipResolvers = {
  async exchangeAccounts(membership: any, args: any, ctx: Context) {
    return getExchangeAccounts(ctx, Number(membership.id))
  },
}
