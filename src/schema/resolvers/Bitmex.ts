import { Context } from "../../context";

export const BitmexQueries = {
  async bitmexCurrencies(parent: any, args: any, ctx: Context) {
    return ctx.prisma.bitmexCurrency.findMany()
  },
}

export const BitmexResolvers = {
  async __resolveReference(parent: any, args: any, ctx: Context) {
    return ctx.prisma.bitmexCurrency.findOne({ where: { id: Number(parent.id) } })
  },
}