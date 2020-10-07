import { OrderSetQueries } from "./OrderSetResolvers"
import { BinanceQueries } from "./BinanceResolvers"
import { BitmexQueries } from "./BitmexResolvers"
import { ExchangeAccountQueries } from "./ExchangeAccountResolvers";
import { OrderQueries } from "./OrderResolvers";

export const Query = {
  ...OrderQueries,
  ...BitmexQueries,
  ...BinanceQueries,
  ...OrderSetQueries,
  ...ExchangeAccountQueries,
}
