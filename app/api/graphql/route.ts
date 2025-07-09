import { ApolloServer } from "@apollo/server"
import { startServerAndCreateNextHandler } from "@as-integrations/next"
import { typeDefs, resolvers } from "@/graphql/schema"

// Initialize GraphQL server for catalog management
const catalogServer = new ApolloServer({
  typeDefs,
  resolvers,
})

// Create Next.js compatible handler
const requestHandler = startServerAndCreateNextHandler(catalogServer)

// Export handlers for both GET and POST requests
export { requestHandler as GET, requestHandler as POST }
