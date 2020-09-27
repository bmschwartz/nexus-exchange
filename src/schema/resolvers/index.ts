import { Query } from "./Query"
import { Mutation } from "./Mutation"
import { OrderSetResolvers } from "./OrderSetResolvers"
import { OrderResolvers } from "./OrderResolvers"
import { GroupMembershipResolvers } from "./GroupMembershipResolvers"
import { BinanceResolvers } from "./BinanceResolvers"
import { BitmexResolvers } from "./BitmexResolvers"
import { ExchangeAccountResolvers } from "./ExchangeAccountResolvers";

export const resolvers: any = {
  Query,
  Mutation,
  Order: OrderResolvers,
  OrderSet: OrderSetResolvers,
  BitmexCurrency: BitmexResolvers,
  BinanceCurrency: BinanceResolvers,
  GroupMembership: GroupMembershipResolvers,
  ExchangeAccount: ExchangeAccountResolvers,
}
