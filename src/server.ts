import { ApolloServer } from "apollo-server"
import { buildFederatedSchema } from "@apollo/federation"
import { applyMiddleware } from "graphql-middleware"
import * as dotenv from "dotenv"

import { typeDefs } from "./schema/types"
import { resolvers } from "./schema/resolvers"
import { createContext } from "./context"
import { permissions } from "./permissions"
import { bootstrap } from "./bootstrap"

dotenv.config()

const port = process.env.PORT || 4001
const graphVariant = process.env.APOLLO_GRAPH_VARIANT || "current"

const server = new ApolloServer({
  schema: applyMiddleware(
    buildFederatedSchema([{ typeDefs, resolvers }]),
    permissions,
  ),
  engine: {
    graphVariant,
  },
  context: createContext,
  introspection: true,
})

server.listen({ port }).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`)
  bootstrap()
})
