import { OrderMutations } from './Order'
import { OrderSetMutations } from './OrderSet'

export const Mutation = {
  ...OrderMutations,
  ...OrderSetMutations,
}
