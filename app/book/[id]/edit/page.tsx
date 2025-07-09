"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { gql, useQuery, useMutation } from "@apollo/client"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/Pressable"
import { Input } from "@/components/ui/TextField"
import { Label } from "@/components/ui/FormLabel"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/DropSelector"
import { Alert, AlertDescription } from "@/components/ui/NoticeBox"
import { ArrowLeft, Save, Loader2 } from "lucide-react"

const FETCH_PUBLICATION_FOR_EDITING = gql`
  query FetchPublicationForEditing($id: ID!) {
    retrievePublicationInfo(id: $id) {
      id
      bookTitle
      category
      releaseYear
      identifier
      writer {
        id
        fullName
      }
    }
  }
`

const FETCH_WRITERS_AND_CATEGORIES = gql`
  query FetchWritersAndCategories {
    fetchAllWriters {
      id
      fullName
    }
    retrieveAllCategories
  }
`

const MODIFY_PUBLICATION = gql`
  mutation ModifyPublication($id: ID!, $bookTitle: String, $writerId: ID, $category: String, $releaseYear: Int, $identifier: String) {
    modifyPublication(id: $id, bookTitle: $bookTitle, writerId: $writerId, category: $category, releaseYear: $releaseYear, identifier: $identifier) {
      id
      bookTitle
      category
      releaseYear
      identifier
      writer {
        id
        fullName
      }
    }
  }
`

const AVAILABLE_CATEGORIES = [
  "Sci-Fi",
  "Fantasy",
  "Mystery",
  "Horror",
  "Romance",
  "Thriller",
  "Biography",
  "History",
  "Self-Help",
  "Business",
  "Science",
  "Philosophy",
  "Poetry",
  "Drama",
  "Comedy",
  "Adventure",
  "Political Satire",
  "Non-Fiction",
  "Children",
  "Young Adult",
]

export default function ModifyPublicationPage() {
  const pageRouter = useRouter()
  const routeParams = useParams()
  const publicationId = routeParams.id as string

  const [modificationForm, setModificationForm] = useState({
    bookTitle: "",
    writerId: "",
    category: "",
    releaseYear: "",
    identifier: "",
  })
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({})

  const {
    data: publicationData,
    loading: publicationLoading,
    error: publicationError,
  } = useQuery(FETCH_PUBLICATION_FOR_EDITING, {
    variables: { id: publicationId },
    errorPolicy: "all",
  })

  const { data: writersAndCategoriesData, loading: dataFetching } = useQuery(FETCH_WRITERS_AND_CATEGORIES)

  const [modifyPublication, { loading: modificationInProgress, error: modificationError }] = useMutation(
    MODIFY_PUBLICATION,
    {
      onCompleted: () => {
        pageRouter.push(`/book/${publicationId}`)
      },
      refetchQueries: ["FetchCatalogData", "RetrievePublicationDetails"],
    },
  )

  useEffect(() => {
    if (publicationData?.retrievePublicationInfo) {
      const publication = publicationData.retrievePublicationInfo
      setModificationForm({
        bookTitle: publication.bookTitle,
        writerId: publication.writer.id,
        category: publication.category,
        releaseYear: publication.releaseYear.toString(),
        identifier: publication.identifier,
      })
    }
  }, [publicationData])

  const validateModificationForm = () => {
    const formErrors: { [key: string]: string } = {}

    if (!modificationForm.bookTitle.trim()) formErrors.bookTitle = "Publication title cannot be empty."
    if (!modificationForm.writerId) formErrors.writerId = "Please select a writer from the list."
    if (!modificationForm.category) formErrors.category = "Literary category must be specified."

    const yearValue = Number.parseInt(modificationForm.releaseYear, 10)
    if (!modificationForm.releaseYear) {
      formErrors.releaseYear = "Release year is mandatory."
    } else if (isNaN(yearValue) || yearValue < 1000 || yearValue > new Date().getFullYear()) {
      formErrors.releaseYear = `Release year must be between 1000 and ${new Date().getFullYear()}.`
    }

    if (!modificationForm.identifier.trim()) {
      formErrors.identifier = "Publication identifier is required."
    } else if (!/^\d{13}$/.test(modificationForm.identifier.replace(/[-\s]/g, ""))) {
      formErrors.identifier = "Identifier must contain exactly 13 digits (formatting characters will be removed)."
    }

    setValidationErrors(formErrors)
    return Object.keys(formErrors).length === 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setModificationForm((previous) => ({ ...previous, [name]: value }))
    if (validationErrors[name]) {
      setValidationErrors((previous) => ({ ...previous, [name]: "" }))
    }
  }

  const handleSelectionChange = (fieldName: string) => (selectedValue: string) => {
    setModificationForm((previous) => ({ ...previous, [fieldName]: selectedValue }))
    if (validationErrors[fieldName]) {
      setValidationErrors((previous) => ({ ...previous, [fieldName]: "" }))
    }
  }

  const handleFormSubmission = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateModificationForm()) {
      const cleanedIdentifier = modificationForm.identifier.replace(/[-\s]/g, "")
      modifyPublication({
        variables: {
          id: publicationId,
          bookTitle: modificationForm.bookTitle,
          writerId: modificationForm.writerId,
          category: modificationForm.category,
          releaseYear: Number.parseInt(modificationForm.releaseYear, 10),
          identifier: cleanedIdentifier,
        },
      })
    }
  }

  if (publicationLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto" />
          <p className="text-gray-600">Loading publication information...</p>
        </div>
      </div>
    )
  }

  if (publicationError || !publicationData?.retrievePublicationInfo) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Publication Not Located</h2>
          <p className="text-gray-600">
            The publication you're attempting to modify cannot be found or may have been removed.
          </p>
          <Link href="/">
            <Button className="bg-purple-600 hover:bg-purple-700">Return to Catalog</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Navigation */}
      <Link
        href={`/book/${publicationId}`}
        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Return to Publication Details
      </Link>

      {/* Modification Form */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="bg-purple-50 border-b border-purple-100 px-6 py-4">
          <h1 className="text-xl font-bold text-gray-900">Modify Publication</h1>
          <p className="text-sm text-gray-600 mt-1">Update the publication information using the form below</p>
        </div>

        <form onSubmit={handleFormSubmission} className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Publication Title */}
            <div className="lg:col-span-2">
              <Label htmlFor="bookTitle" className="text-sm font-medium text-gray-700">
                Publication Title *
              </Label>
              <Input
                id="bookTitle"
                name="bookTitle"
                value={modificationForm.bookTitle}
                onChange={handleInputChange}
                placeholder="Enter the complete publication title"
                className={`mt-1 ${validationErrors.bookTitle ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-purple-500 focus:ring-purple-500"}`}
              />
              {validationErrors.bookTitle && <p className="text-sm text-red-600 mt-1">{validationErrors.bookTitle}</p>}
            </div>

            {/* Writer Selection */}
            <div>
              <Label htmlFor="writerId" className="text-sm font-medium text-gray-700">
                Writer *
              </Label>
              <Select
                name="writerId"
                onValueChange={handleSelectionChange("writerId")}
                value={modificationForm.writerId}
              >
                <SelectTrigger
                  className={`mt-1 ${validationErrors.writerId ? "border-red-500" : "border-gray-300 focus:border-purple-500"}`}
                >
                  <SelectValue placeholder={dataFetching ? "Loading writers..." : "Choose a writer"} />
                </SelectTrigger>
                <SelectContent>
                  {writersAndCategoriesData?.fetchAllWriters.map((writer: any) => (
                    <SelectItem key={writer.id} value={writer.id}>
                      {writer.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {validationErrors.writerId && <p className="text-sm text-red-600 mt-1">{validationErrors.writerId}</p>}
            </div>

            {/* Category Selection */}
            <div>
              <Label htmlFor="category" className="text-sm font-medium text-gray-700">
                Literary Category *
              </Label>
              <Select
                name="category"
                onValueChange={handleSelectionChange("category")}
                value={modificationForm.category}
              >
                <SelectTrigger
                  className={`mt-1 ${validationErrors.category ? "border-red-500" : "border-gray-300 focus:border-purple-500"}`}
                >
                  <SelectValue placeholder="Select literary category" />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {validationErrors.category && <p className="text-sm text-red-600 mt-1">{validationErrors.category}</p>}
            </div>

            {/* Release Year */}
            <div>
              <Label htmlFor="releaseYear" className="text-sm font-medium text-gray-700">
                Release Year *
              </Label>
              <Input
                id="releaseYear"
                name="releaseYear"
                type="number"
                min="1000"
                max={new Date().getFullYear()}
                value={modificationForm.releaseYear}
                onChange={handleInputChange}
                placeholder="e.g., 2024"
                className={`mt-1 ${validationErrors.releaseYear ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-purple-500 focus:ring-purple-500"}`}
              />
              {validationErrors.releaseYear && (
                <p className="text-sm text-red-600 mt-1">{validationErrors.releaseYear}</p>
              )}
            </div>

            {/* Publication Identifier */}
            <div>
              <Label htmlFor="identifier" className="text-sm font-medium text-gray-700">
                Publication Identifier *
              </Label>
              <Input
                id="identifier"
                name="identifier"
                value={modificationForm.identifier}
                onChange={handleInputChange}
                placeholder="978-0-123456-78-9"
                className={`mt-1 ${validationErrors.identifier ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-purple-500 focus:ring-purple-500"}`}
              />
              <p className="text-xs text-gray-500 mt-1">
                Provide 13-digit identifier (hyphens and spaces will be automatically removed)
              </p>
              {validationErrors.identifier && (
                <p className="text-sm text-red-600 mt-1">{validationErrors.identifier}</p>
              )}
            </div>
          </div>

          {modificationError && (
            <Alert variant="destructive">
              <AlertDescription>
                <strong>Modification Failed:</strong> {modificationError.message}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <Link href={`/book/${publicationId}`}>
              <Button variant="outline" type="button">
                Cancel Modifications
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={modificationInProgress || dataFetching}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {modificationInProgress ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Applying Changes...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Apply Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
