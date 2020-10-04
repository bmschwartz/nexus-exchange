import { OrderSetQueries } from "./OrderSetResolvers"
import { BinanceQueries } from "./BinanceResolvers"
import { BitmexQueries } from "./BitmexResolvers"
import { ExchangeQueries } from "./ExchangeResolvers";

export const Query = {
  ...BitmexQueries,
  ...BinanceQueries,
  ...ExchangeQueries,
  ...OrderSetQueries,
}
