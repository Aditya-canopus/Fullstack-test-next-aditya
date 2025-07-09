import { connectToDatabase } from "@/lib/mongodb"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const { db } = await connectToDatabase()

    // Try to list collections to test the connection
    const collections = await db.listCollections().toArray()

    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      collections: collections.map((c) => c.name),
    })
  } catch (error) {
    console.error("Database test failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
