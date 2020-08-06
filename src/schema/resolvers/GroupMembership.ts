import { Context } from '../../context'

export const GroupMembershipResolvers = {
  async orders(membership: any, args: any, ctx: Context) {
    return ctx.prisma.order.findMany({
      where: { membershipId: Number(membership.id) },
    })
  },
}
