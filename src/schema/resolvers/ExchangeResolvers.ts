import { Exchange } from "@prisma/client"
import { Context } from "src/context"

export const ExchangeQueries = {
  async exchanges(parent: any, args: any, ctx: Context) {
    return [Exchange.BINANCE, Exchange.BITMEX]
  },
}