import { shield } from "graphql-shield"
import {
  ExchangeAccountPermissions,
  ExchangeAccountMutationPermissions,
  ExchangeAccountQueryPermissions,
} from "./exchangeAccount";
import {
  OrderMutationPermissions,
  OrderPermissions,
  OrderQueryPermissions,
} from "./order";
import {
  OrderSetMutationPermissions,
  OrderSetPermissions,
  OrderSetQueryPermissions,
} from "./orderSet";
import {
  PositionMutationPermissions,
  PositionQueryPermissions,
  PositionPermissions,
} from "./position";

export const permissions = shield({
  Query: {
    ...OrderQueryPermissions,
    ...OrderSetQueryPermissions,
    ...PositionQueryPermissions,
    ...ExchangeAccountQueryPermissions,
  },
  Mutation: {
    ...OrderMutationPermissions,
    ...OrderSetMutationPermissions,
    ...PositionMutationPermissions,
    ...ExchangeAccountMutationPermissions,
  },
  Order: OrderPermissions,
  OrderSet: OrderSetPermissions,
  Position: PositionPermissions,
  ExchangeAccount: ExchangeAccountPermissions,
})
