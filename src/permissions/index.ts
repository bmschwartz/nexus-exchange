import { rule, shield } from 'graphql-shield'

const isAuthenticated = rule()((parent, args, { userId }) => {
  return !!userId
})

export const permissions = shield({
  Query: {
    // OrderSet Queries
    orderSet: isAuthenticated,
    groupOrderSets: isAuthenticated,
  },
  Mutation: {
    // OrderSet Mutations
    createOrderSet: isAuthenticated,
    updateOrderSet: isAuthenticated,

    // Order Mutations
    cancelOrder: isAuthenticated,
  },
})
