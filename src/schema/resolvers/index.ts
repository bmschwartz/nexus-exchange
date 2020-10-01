import { Query } from "./Query"
import { Mutation } from "./Mutation"
import { OrderSetResolvers } from "./OrderSetResolvers"
import { OrderResolvers } from "./OrderResolvers"
import { GroupResolvers } from "./GroupResolvers";
import { GroupMembershipResolvers } from "./GroupMembershipResolvers"
import { BinanceResolvers } from "./BinanceResolvers"
import { BitmexResolvers } from "./BitmexResolvers"
import { ExchangeAccountResolvers } from "./ExchangeAccountResolvers";

export const resolvers: any = {
  Query,
  Mutation,
  Order: OrderResolvers,
  Group: GroupResolvers,
  OrderSet: OrderSetResolvers,
  BitmexCurrency: BitmexResolvers,
  BinanceCurrency: BinanceResolvers,
  GroupMembership: GroupMembershipResolvers,
  ExchangeAccount: ExchangeAccountResolvers,
}
