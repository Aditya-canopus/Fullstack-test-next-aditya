"use client"

import { useQuery, gql } from "@apollo/client"
import { notFound, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/Pressable"
import { Badge } from "@/components/ui/StatusTag"
import { ArrowLeft, Edit, BookOpen, Calendar, User, Hash, Globe, Loader2 } from "lucide-react"

const RETRIEVE_PUBLICATION_DETAILS = gql`
  query RetrievePublicationDetails($id: ID!) {
    retrievePublicationInfo(id: $id) {
      id
      bookTitle
      category
      releaseYear
      identifier
      writer {
        id
        fullName
        country
        yearOfBirth
      }
    }
  }
`

export default function PublicationDetailsPage() {
  const routeParams = useParams()
  const publicationId = routeParams.id as string

  const { data, loading, error } = useQuery(RETRIEVE_PUBLICATION_DETAILS, {
    variables: { id: publicationId },
    errorPolicy: "all",
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto" />
          <p className="text-gray-600">Retrieving publication information...</p>
        </div>
      </div>
    )
  }

  if (error) {
    console.error("Publication retrieval failed:", error)
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
        <div className="text-center space-y-4">
          <div className="mx-auto h-12 w-12 text-red-500">
            <BookOpen className="h-12 w-12" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Publication Not Located</h2>
          <p className="text-gray-600">
            The requested publication cannot be found or may have been removed from the catalog.
          </p>
          <Link href="/">
            <Button className="bg-purple-600 hover:bg-purple-700">Return to Catalog</Button>
          </Link>
        </div>
      </div>
    )
  }

  const publicationData = data?.retrievePublicationInfo

  if (!publicationData) {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Navigation Controls */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Return to Catalog
        </Link>

        <Link href={`/book/${publicationData.id}/edit`}>
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Edit className="mr-2 h-4 w-4" />
            Modify Publication
          </Button>
        </Link>
      </div>

      {/* Publication Information Display */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {/* Publication Header */}
        <div className="bg-purple-50 border-b border-purple-100 px-6 py-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">{publicationData.bookTitle}</h1>
              <p className="text-purple-700 font-medium">authored by {publicationData.writer.fullName}</p>
            </div>
            <Badge className="bg-purple-100 text-purple-800 border-purple-200">{publicationData.category}</Badge>
          </div>
        </div>

        {/* Detailed Information */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Publication Specifications */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Publication Specifications</h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <dt className="flex items-center text-sm font-medium text-gray-500 mb-2">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Literary Category
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">{publicationData.category}</dd>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <dt className="flex items-center text-sm font-medium text-gray-500 mb-2">
                      <Calendar className="h-4 w-4 mr-2" />
                      Release Year
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">{publicationData.releaseYear}</dd>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 sm:col-span-2">
                    <dt className="flex items-center text-sm font-medium text-gray-500 mb-2">
                      <Hash className="h-4 w-4 mr-2" />
                      Publication Identifier
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900 font-mono">{publicationData.identifier}</dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Writer Profile */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Writer Profile</h3>
              <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                <div>
                  <dt className="flex items-center text-sm font-medium text-gray-500 mb-1">
                    <User className="h-4 w-4 mr-2" />
                    Full Name
                  </dt>
                  <dd className="text-base font-semibold text-gray-900">{publicationData.writer.fullName}</dd>
                </div>

                {publicationData.writer.country && (
                  <div>
                    <dt className="flex items-center text-sm font-medium text-gray-500 mb-1">
                      <Globe className="h-4 w-4 mr-2" />
                      Country of Origin
                    </dt>
                    <dd className="text-base font-semibold text-gray-900">{publicationData.writer.country}</dd>
                  </div>
                )}

                {publicationData.writer.yearOfBirth && (
                  <div>
                    <dt className="flex items-center text-sm font-medium text-gray-500 mb-1">
                      <Calendar className="h-4 w-4 mr-2" />
                      Birth Year
                    </dt>
                    <dd className="text-base font-semibold text-gray-900">{publicationData.writer.yearOfBirth}</dd>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
