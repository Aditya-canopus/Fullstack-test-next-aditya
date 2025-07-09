"use client"

import { useState } from "react"
import { Button } from "@/components/ui/Pressable"
import { Alert, AlertDescription } from "@/components/ui/NoticeBox"
import { Loader2, Database, CheckCircle, XCircle } from "lucide-react"

export default function CatalogPopulationPage() {
  const [populationInProgress, setPopulationInProgress] = useState(false)
  const [populationResult, setPopulationResult] = useState<any>(null)
  const [populationError, setPopulationError] = useState<string | null>(null)

  const initiateCatalogPopulation = async () => {
    setPopulationInProgress(true)
    setPopulationResult(null)
    setPopulationError(null)

    try {
      const response = await fetch("/api/seed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const responseData = await response.json()

      if (responseData.success) {
        setPopulationResult(responseData)
      } else {
        setPopulationError(responseData.error || "Catalog population process failed")
      }
    } catch (networkError) {
      setPopulationError(networkError instanceof Error ? networkError.message : "Network communication error occurred")
    } finally {
      setPopulationInProgress(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-purple-100 p-2 rounded-lg">
            <Database className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Catalog Population Service</h1>
            <p className="text-sm text-gray-600">Initialize your MongoDB database with sample catalog data</p>
          </div>
        </div>

        <Button
          onClick={initiateCatalogPopulation}
          disabled={populationInProgress}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          {populationInProgress ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Populating Catalog...
            </>
          ) : (
            <>
              <Database className="mr-2 h-4 w-4" />
              Initialize Catalog
            </>
          )}
        </Button>

        {populationError && (
          <Alert variant="destructive" className="mt-4">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Population Failed:</strong> {populationError}
            </AlertDescription>
          </Alert>
        )}

        {populationResult && (
          <Alert className="mt-4 border-purple-200 bg-purple-50">
            <CheckCircle className="h-4 w-4 text-purple-600" />
            <AlertDescription className="text-purple-800">
              <strong>Success!</strong> {populationResult.message}
              <div className="mt-2 space-y-1 text-sm">
                <div>👨‍💼 Writers created: {populationResult.statistics.writersCreated}</div>
                <div>📖 Publications added: {populationResult.statistics.publicationsAdded}</div>
                <div>🏷️ Categories available: {populationResult.statistics.categoriesAvailable.join(", ")}</div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {populationResult && populationResult.statistics && (
          <div className="mt-6 space-y-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Writers Created:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {populationResult.statistics.writerSummary.map((writer: any, index: number) => (
                  <div key={index} className="text-sm bg-white p-2 rounded-lg border">
                    {writer.name} ({writer.nationality})
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Publications Added:</h3>
              <div className="grid grid-cols-1 gap-2">
                {populationResult.statistics.publicationSummary.map((publication: any, index: number) => (
                  <div key={index} className="text-sm bg-white p-2 rounded-lg border">
                    {publication.title} ({publication.genre}, {publication.year})
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
