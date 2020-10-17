import { rule, shield } from "graphql-shield"

const isAuthenticated = rule()((parent, args, { userId }) => {
  return !!userId
})

export const permissions = shield({
  Query: {
    orderSet: isAuthenticated,

    asyncOperationStatus: isAuthenticated,
  },
  Mutation: {
    createOrderSet: isAuthenticated,
    updateOrderSet: isAuthenticated,

    cancelOrder: isAuthenticated,
  },
})
