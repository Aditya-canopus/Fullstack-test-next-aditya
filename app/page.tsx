"use client"

import { useMemo, useState } from "react"
import { useSuspenseQuery, gql } from "@apollo/client"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/Pressable"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/DropSelector"
import { Input } from "@/components/ui/TextField"
import { Badge } from "@/components/ui/StatusTag"
import { Eye, Search, Filter, BookOpen } from "lucide-react"

const FETCH_CATALOG_DATA = gql`
  query FetchCatalogData {
    fetchAllPublications {
      id
      bookTitle
      writer {
        id
        fullName
      }
      category
      releaseYear
    }
    retrieveAllCategories
  }
`

export default function CatalogHomePage() {
  const navigationRouter = useRouter()
  const urlParameters = useSearchParams()
  const activeCategory = urlParameters.get("category") || "all"
  const [searchQuery, setSearchQuery] = useState("")

  const { data } = useSuspenseQuery(FETCH_CATALOG_DATA)
  const { fetchAllPublications: publicationList, retrieveAllCategories: categoryList } = data

  const filteredPublications = useMemo(() => {
    let processedList = publicationList

    // Apply category filtering
    if (activeCategory !== "all") {
      processedList = processedList.filter((publication: any) => publication.category === activeCategory)
    }

    // Apply search filtering
    if (searchQuery.trim()) {
      const searchTerm = searchQuery.toLowerCase()
      processedList = processedList.filter(
        (publication: any) =>
          publication.bookTitle.toLowerCase().includes(searchTerm) ||
          publication.writer.fullName.toLowerCase().includes(searchTerm),
      )
    }

    return processedList
  }, [publicationList, activeCategory, searchQuery])

  const updateCategoryFilter = (category: string) => {
    const urlParams = new URLSearchParams(window.location.search)
    if (category === "all") {
      urlParams.delete("category")
    } else {
      urlParams.set("category", category)
    }
    navigationRouter.push(`?${urlParams.toString()}`)
  }

  const navigateToPublication = (publicationId: string) => {
    navigationRouter.push(`/book/${publicationId}`)
  }

  return (
    <div className="space-y-6">
      {/* Catalog Overview Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Publication Catalog</h1>
            <p className="text-gray-600">Browse and manage your digital publication collection</p>
          </div>
          <div className="text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
            Total Entries: {publicationList.length}
          </div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Publication Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search publications or writers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
            <Select value={activeCategory} onValueChange={updateCategoryFilter}>
              <SelectTrigger className="pl-10 border-gray-300 focus:border-purple-500">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categoryList.map((category: string) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-center md:justify-end">
            <span className="text-sm text-gray-600">
              Displaying {filteredPublications.length} of {publicationList.length} publications
            </span>
          </div>
        </div>
      </div>

      {/* Publications Data Table */}
      {filteredPublications.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Publication Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Writer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Release Year
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Operations
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPublications.map((publication: any) => (
                  <tr key={publication.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                            <BookOpen className="h-5 w-5 text-purple-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{publication.bookTitle}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{publication.writer.fullName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200">
                        {publication.category}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{publication.releaseYear}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigateToPublication(publication.id)}
                        className="text-purple-600 hover:text-purple-900 hover:bg-purple-50"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Inspect
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-12 shadow-sm">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <BookOpen className="h-12 w-12" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No publications located</h3>
            <p className="mt-2 text-sm text-gray-500">
              {searchQuery || activeCategory !== "all"
                ? "Consider modifying your search criteria or filter settings."
                : "Begin by registering your first publication in the catalog."}
            </p>
            <div className="mt-6">
              <Link href="/book/add">
                <Button className="bg-purple-600 hover:bg-purple-700">Register First Publication</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
