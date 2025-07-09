import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ApolloProvider } from "@/lib/apollo-provider"
import Link from "next/link"
import { Library } from "lucide-react"

const interFont = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CatalogPro - Advanced Publication Management",
  description: "Comprehensive digital catalog system for modern library operations and publication tracking.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={interFont.className}>
        <ApolloProvider>
          <div className="min-h-screen bg-gray-100">
            {/* Primary Navigation Header */}
            <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                  <Link href="/" className="flex items-center space-x-3">
                    <div className="bg-purple-600 p-2 rounded-lg">
                      <Library className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-gray-900">CatalogPro</h1>
                      <p className="text-xs text-gray-500">Publication Management Suite</p>
                    </div>
                  </Link>

                  <div className="flex items-center space-x-4">
                    <Link
                      href="/book/add"
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                    >
                      Register Publication
                    </Link>
                  </div>
                </div>
              </div>
            </header>

            {/* Main Application Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>

            {/* Application Footer */}
            <footer className="bg-white border-t border-gray-200 mt-16">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="text-center text-sm text-gray-500">
                  © {new Date().getFullYear()} CatalogPro Publication Management Suite. Powered by GraphQL & Next.js.
                </div>
              </div>
            </footer>
          </div>
        </ApolloProvider>
      </body>
    </html>
  )
}
