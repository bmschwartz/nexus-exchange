import { Query } from "./Query"
import { Mutation } from "./Mutation"
import { OrderSetResolvers } from "./OrderSet"
import { OrderResolvers } from "./Order"
import { GroupMembershipResolvers } from "./GroupMembership"
import { BinanceResolvers } from "./Binance"
import { BitmexResolvers } from "./Bitmex"

export const resolvers: any = {
  Query,
  Mutation,
  Order: OrderResolvers,
  OrderSet: OrderSetResolvers,
  BitmexCurrency: BitmexResolvers,
  BinanceCurrency: BinanceResolvers,
  GroupMembership: GroupMembershipResolvers,
}
