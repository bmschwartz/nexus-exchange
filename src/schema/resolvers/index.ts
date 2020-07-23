import { Query } from "./Query";
import { Mutation } from "./Mutation";
import { OrderSetResolvers } from "./OrderSet";
import { OrderResolvers } from "./Order";

export const resolvers: any = {
  Query,
  Mutation,
  Order: OrderResolvers,
  OrderSet: OrderSetResolvers,
}