import { OrderMutations } from "./OrderResolvers"
import { OrderSetMutations } from "./OrderSetResolvers"

export const Mutation = {
  ...OrderMutations,
  ...OrderSetMutations,
}
