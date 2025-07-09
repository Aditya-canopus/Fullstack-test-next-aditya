const { MongoClient, ObjectId } = require("mongodb")

// Load environment configuration
require("dotenv").config({ path: ".env.local" })

const DATABASE_CONNECTION = process.env.MONGODB_URI || "mongodb://localhost:27017"
const CATALOG_DATABASE = "library"

async function populateCatalog() {
  if (!DATABASE_CONNECTION) {
    console.error("Database connection string missing from .env.local")
    process.exit(1)
  }

  console.log("Establishing connection:", DATABASE_CONNECTION.replace(/\/\/([^:]+):([^@]+)@/, "//***:***@"))

  const dbClient = new MongoClient(DATABASE_CONNECTION)

  try {
    await dbClient.connect()
    console.log("Successfully connected to catalog database")
    const catalogDb = dbClient.db(CATALOG_DATABASE)

    // Clear existing catalog data
    await catalogDb.collection("authors").deleteMany({})
    await catalogDb.collection("books").deleteMany({})
    console.log("Existing catalog data cleared.")

    // Create writer profiles
    const writerProfiles = [
      { _id: new ObjectId(), name: "George Orwell", nationality: "British", birthYear: 1903 },
      { _id: new ObjectId(), name: "Isaac Asimov", nationality: "American", birthYear: 1920 },
      { _id: new ObjectId(), name: "Agatha Christie", nationality: "British", birthYear: 1890 },
      { _id: new ObjectId(), name: "J.K. Rowling", nationality: "British", birthYear: 1965 },
      { _id: new ObjectId(), name: "Stephen King", nationality: "American", birthYear: 1947 },
    ]
    await catalogDb.collection("authors").insertMany(writerProfiles)
    console.log("Writer profiles created:", writerProfiles.length)

    // Add publication records
    const publicationCatalog = [
      { title: "1984", authorId: writerProfiles[0]._id, genre: "Sci-Fi", publicationYear: 1949, isbn: "9780451524935" },
      {
        title: "Animal Farm",
        authorId: writerProfiles[0]._id,
        genre: "Political Satire",
        publicationYear: 1945,
        isbn: "9780451526342",
      },
      {
        title: "Foundation",
        authorId: writerProfiles[1]._id,
        genre: "Sci-Fi",
        publicationYear: 1951,
        isbn: "9780553803716",
      },
      {
        title: "I, Robot",
        authorId: writerProfiles[1]._id,
        genre: "Sci-Fi",
        publicationYear: 1950,
        isbn: "9780553294385",
      },
      {
        title: "The Murder of Roger Ackroyd",
        authorId: writerProfiles[2]._id,
        genre: "Mystery",
        publicationYear: 1926,
        isbn: "9780007527526",
      },
      {
        title: "And Then There Were None",
        authorId: writerProfiles[2]._id,
        genre: "Mystery",
        publicationYear: 1939,
        isbn: "9780062073488",
      },
      {
        title: "Harry Potter and the Philosopher's Stone",
        authorId: writerProfiles[3]._id,
        genre: "Fantasy",
        publicationYear: 1997,
        isbn: "9780747532699",
      },
      {
        title: "Harry Potter and the Chamber of Secrets",
        authorId: writerProfiles[3]._id,
        genre: "Fantasy",
        publicationYear: 1998,
        isbn: "9780747538493",
      },
      {
        title: "The Shining",
        authorId: writerProfiles[4]._id,
        genre: "Horror",
        publicationYear: 1977,
        isbn: "9780307743657",
      },
      { title: "It", authorId: writerProfiles[4]._id, genre: "Horror", publicationYear: 1986, isbn: "9781501142970" },
      {
        title: "The Stand",
        authorId: writerProfiles[4]._id,
        genre: "Horror",
        publicationYear: 1978,
        isbn: "9780307743688",
      },
    ]

    await catalogDb.collection("books").insertMany(publicationCatalog)
    console.log("Publication records added:", publicationCatalog.length)

    // Create unique constraint for ISBN
    await catalogDb.collection("books").createIndex({ isbn: 1 }, { unique: true })
    console.log("Unique ISBN constraint established.")

    console.log("Catalog population completed successfully!")
  } catch (error) {
    console.error("Catalog population failed:", error)
    process.exit(1)
  } finally {
    await dbClient.close()
    console.log("Database connection terminated.")
  }
}

populateCatalog()
