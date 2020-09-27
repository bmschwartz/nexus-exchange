import { OrderMutations } from "./OrderResolvers"
import { OrderSetMutations } from "./OrderSetResolvers"
import { ExchangeAccountMutations } from "./ExchangeAccountResolvers";

export const Mutation = {
  ...OrderMutations,
  ...OrderSetMutations,
  ...ExchangeAccountMutations,
}
