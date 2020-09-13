import { OrderSetQueries } from "./OrderSetResolvers"
import { BinanceQueries } from "./BinanceResolvers"
import { BitmexQueries } from "./BitmexResolvers"

export const Query = {
  ...BitmexQueries,
  ...BinanceQueries,
  ...OrderSetQueries,
}
