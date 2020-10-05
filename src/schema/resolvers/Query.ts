import { OrderSetQueries } from "./OrderSetResolvers"
import { BinanceQueries } from "./BinanceResolvers"
import { BitmexQueries } from "./BitmexResolvers"
import { ExchangeAccountQueries } from "./ExchangeAccountResolvers";

export const Query = {
  ...BitmexQueries,
  ...BinanceQueries,
  ...OrderSetQueries,
  ...ExchangeAccountQueries,
}
