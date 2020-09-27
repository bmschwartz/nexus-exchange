import { getBitmexCurrencies, getBitmexCurrencyById } from "../../repository/BitmexRepository"
import { Context } from "../../context"

export const BitmexQueries = {
  async bitmexCurrencies(parent: any, args: any, ctx: Context) {
    return getBitmexCurrencies(ctx)
  },
}

export const BitmexResolvers = {
  async __resolveReference(parent: any, args: any, ctx: Context) {
    return getBitmexCurrencyById(ctx, Number(parent.id))
  },
}
