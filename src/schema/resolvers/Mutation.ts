import { OrderMutations } from "./OrderResolvers"
import { OrderSetMutations } from "./OrderSetResolvers"
import { ExchangeAccountMutations } from "./ExchangeAccountResolvers";
import { PositionMutations } from "./PositionResolvers";

export const Mutation = {
  ...OrderMutations,
  ...OrderSetMutations,
  ...PositionMutations,
  ...ExchangeAccountMutations,
}
