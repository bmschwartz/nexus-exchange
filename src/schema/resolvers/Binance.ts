import { Context } from '../../context'

export const BinanceQueries = {
  async binanceCurrencies(parent: any, args: any, ctx: Context) {
    return ctx.prisma.binanceCurrency.findMany()
  },
}

export const BinanceResolvers = {
  async __resolveReference(parent: any, args: any, ctx: Context) {
    return ctx.prisma.binanceCurrency.findOne({
      where: { id: Number(parent.id) },
    })
  },
}
