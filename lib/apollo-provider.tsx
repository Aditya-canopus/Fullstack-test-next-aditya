"use client"

import type React from "react"

import { ApolloLink, HttpLink } from "@apollo/client"
import {
  ApolloNextAppProvider,
  NextSSRApolloClient,
  NextSSRInMemoryCache,
  SSRMultipartLink,
} from "@apollo/experimental-nextjs-app-support/ssr"

// Determine base URL for GraphQL operations
const getApplicationBaseUrl = () => {
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  const applicationPort = process.env.PORT || 3000
  return `http://localhost:${applicationPort}`
}

// Create Apollo client instance with SSR support
function createApolloClient() {
  const graphqlEndpoint = new HttpLink({
    // Use absolute URL for server-side, relative for client-side
    uri: typeof window === "undefined" ? `${getApplicationBaseUrl()}/api/graphql` : "/api/graphql",
  })

  return new NextSSRApolloClient({
    cache: new NextSSRInMemoryCache(),
    link:
      typeof window === "undefined"
        ? ApolloLink.from([
            new SSRMultipartLink({
              stripDefer: true,
            }),
            graphqlEndpoint,
          ])
        : graphqlEndpoint,
  })
}

// Apollo provider wrapper for the application
export function ApolloProvider({ children }: React.PropsWithChildren) {
  return <ApolloNextAppProvider makeClient={createApolloClient}>{children}</ApolloNextAppProvider>
}
