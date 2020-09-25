import { getBinanceCurrencies, getBinanceCurrency } from "../../repository/BinanceRepository"
import { Context } from "../../context"

export const BinanceQueries = {
  async binanceCurrencies(parent: any, args: any, ctx: Context) {
    return getBinanceCurrencies(ctx)
  },
}

export const BinanceResolvers = {
  async __resolveReference(parent: any, args: any, ctx: Context) {
    return getBinanceCurrency(ctx, Number(parent.id))
  },
}
