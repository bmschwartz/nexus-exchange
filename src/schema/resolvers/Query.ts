import { OrderSetQueries } from './OrderSet'
import { BinanceQueries } from './Binance'
import { BitmexQueries } from './Bitmex'

export const Query = {
  ...BitmexQueries,
  ...BinanceQueries,
  ...OrderSetQueries,
}
