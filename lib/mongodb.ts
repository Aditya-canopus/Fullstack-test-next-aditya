import { MongoClient, type Db } from "mongodb"

const DATABASE_URI = process.env.MONGODB_URI || "mongodb://localhost:27017"
const CATALOG_NAME = "library"

let connectionCache: MongoClient | null = null
let databaseCache: Db | null = null

if (!DATABASE_URI) {
  throw new Error("Database connection string must be defined in .env.local file")
}

export async function connectToDatabase() {
  // Return cached connection if available
  if (connectionCache && databaseCache) {
    return { client: connectionCache, db: databaseCache }
  }

  try {
    console.log("Initializing database connection...")
    console.log("Target URI:", DATABASE_URI.replace(/\/\/([^:]+):([^@]+)@/, "//***:***@")) // Mask credentials

    const dbClient = await MongoClient.connect(DATABASE_URI, {
      serverSelectionTimeoutMS: 10000, // 10 second timeout
      connectTimeoutMS: 10000, // 10 second connection timeout
      socketTimeoutMS: 45000, // 45 second socket timeout
    })

    const catalogDatabase = dbClient.db(CATALOG_NAME)

    // Verify connection with ping
    await catalogDatabase.admin().ping()

    // Cache successful connection
    connectionCache = dbClient
    databaseCache = catalogDatabase

    console.log("Database connection established successfully.")
    return { client: dbClient, db: catalogDatabase }
  } catch (connectionError) {
    console.error("Database connection failed:", connectionError)

    // Provide specific error guidance
    if (connectionError instanceof Error) {
      if (connectionError.message.includes("ENOTFOUND")) {
        throw new Error("Database hostname resolution failed. Verify network connectivity and connection string.")
      } else if (connectionError.message.includes("authentication failed")) {
        throw new Error("Database authentication rejected. Verify credentials.")
      } else if (connectionError.message.includes("ECONNREFUSED")) {
        throw new Error("Database connection refused. Ensure database service is running.")
      } else if (connectionError.message.includes("SSL") || connectionError.message.includes("TLS")) {
        throw new Error("Secure connection failed. Check SSL/TLS configuration.")
      } else {
        throw new Error(`Database connection error: ${connectionError.message}`)
      }
    }

    throw new Error("Unable to establish database connection.")
  }
}
