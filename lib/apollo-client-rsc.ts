import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client"
import { registerApolloClient } from "@apollo/experimental-nextjs-app-support/rsc"

// Determine appropriate base URL for GraphQL endpoint
const determineBaseUrl = () => {
  // Use Vercel URL in production
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  // Fallback to local development server
  const serverPort = process.env.PORT || 3000
  return `http://localhost:${serverPort}`
}

// Register Apollo client for server-side rendering
export const { getClient } = registerApolloClient(() => {
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
      // Absolute URI required for server-side operations
      uri: `${determineBaseUrl()}/api/graphql`,
    }),
  })
})
