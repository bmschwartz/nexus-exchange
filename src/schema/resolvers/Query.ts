import { OrderSetQueries } from "./OrderSetResolvers"
import { BinanceQueries } from "./BinanceResolvers"
import { BitmexQueries } from "./BitmexResolvers"
import { ExchangeAccountQueries } from "./ExchangeAccountResolvers";
import { OrderQueries } from "./OrderResolvers";
import { AsyncOperationQueries } from "./AsyncOperationResolvers";
import { PositionQueries } from "./PositionResolvers"

export const Query = {
  ...OrderQueries,
  ...BitmexQueries,
  ...BinanceQueries,
  ...OrderSetQueries,
  ...PositionQueries,
  ...AsyncOperationQueries,
  ...ExchangeAccountQueries,
}
