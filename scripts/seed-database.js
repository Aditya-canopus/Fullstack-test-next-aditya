import { MongoClient, ObjectId } from "mongodb"

// Use the same connection string format as your app
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = "library"

async function seedDatabase() {
  console.log("🌱 Starting database seeding...")

  console.log("📡 Connecting to MongoDB...")
  console.log("URI:", MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, "//***:***@"))

  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    console.log("✅ Connected to MongoDB successfully!")

    const db = client.db(MONGODB_DB)

    // Clear existing data
    console.log("🧹 Clearing existing data...")
    await db.collection("authors").deleteMany({})
    await db.collection("books").deleteMany({})
    console.log("✅ Existing data cleared")

    // Create authors with ObjectIds
    console.log("👥 Creating authors...")
    const authors = [
      {
        _id: new ObjectId(),
        name: "George Orwell",
        nationality: "British",
        birthYear: 1903,
      },
      {
        _id: new ObjectId(),
        name: "Isaac Asimov",
        nationality: "American",
        birthYear: 1920,
      },
      {
        _id: new ObjectId(),
        name: "Agatha Christie",
        nationality: "British",
        birthYear: 1890,
      },
      {
        _id: new ObjectId(),
        name: "J.K. Rowling",
        nationality: "British",
        birthYear: 1965,
      },
      {
        _id: new ObjectId(),
        name: "Stephen King",
        nationality: "American",
        birthYear: 1947,
      },
    ]

    const authorResult = await db.collection("authors").insertMany(authors)
    console.log(`✅ Created ${authorResult.insertedCount} authors`)

    // Create books
    console.log("📚 Creating books...")
    const books = [
      {
        title: "1984",
        authorId: authors[0]._id,
        genre: "Sci-Fi",
        publicationYear: 1949,
        isbn: "9780451524935",
      },
      {
        title: "Animal Farm",
        authorId: authors[0]._id,
        genre: "Political Satire",
        publicationYear: 1945,
        isbn: "9780451526342",
      },
      {
        title: "Foundation",
        authorId: authors[1]._id,
        genre: "Sci-Fi",
        publicationYear: 1951,
        isbn: "9780553803716",
      },
      {
        title: "I, Robot",
        authorId: authors[1]._id,
        genre: "Sci-Fi",
        publicationYear: 1950,
        isbn: "9780553294385",
      },
      {
        title: "The Murder of Roger Ackroyd",
        authorId: authors[2]._id,
        genre: "Mystery",
        publicationYear: 1926,
        isbn: "9780007527526",
      },
      {
        title: "And Then There Were None",
        authorId: authors[2]._id,
        genre: "Mystery",
        publicationYear: 1939,
        isbn: "9780062073488",
      },
      {
        title: "Harry Potter and the Philosopher's Stone",
        authorId: authors[3]._id,
        genre: "Fantasy",
        publicationYear: 1997,
        isbn: "9780747532699",
      },
      {
        title: "Harry Potter and the Chamber of Secrets",
        authorId: authors[3]._id,
        genre: "Fantasy",
        publicationYear: 1998,
        isbn: "9780747538493",
      },
      {
        title: "The Shining",
        authorId: authors[4]._id,
        genre: "Horror",
        publicationYear: 1977,
        isbn: "9780307743657",
      },
      {
        title: "It",
        authorId: authors[4]._id,
        genre: "Horror",
        publicationYear: 1986,
        isbn: "9781501142970",
      },
      {
        title: "The Stand",
        authorId: authors[4]._id,
        genre: "Horror",
        publicationYear: 1978,
        isbn: "9780307743688",
      },
    ]

    const bookResult = await db.collection("books").insertMany(books)
    console.log(`✅ Created ${bookResult.insertedCount} books`)

    // Create unique index for ISBN to prevent duplicates
    console.log("🔧 Creating indexes...")
    try {
      await db.collection("books").createIndex({ isbn: 1 }, { unique: true })
      console.log("✅ Created unique index on ISBN")
    } catch (indexError) {
      console.log("ℹ️ Index may already exist, continuing...")
    }

    // Display summary
    console.log("\n📊 Database seeding completed successfully!")
    console.log(`📖 Total Authors: ${authors.length}`)
    console.log(`📚 Total Books: ${books.length}`)
    console.log(`🏷️ Genres: ${[...new Set(books.map((book) => book.genre))].join(", ")}`)

    // Test the data
    console.log("\n🧪 Testing data retrieval...")
    const bookCount = await db.collection("books").countDocuments()
    const authorCount = await db.collection("authors").countDocuments()
    console.log(`✅ Verified: ${bookCount} books and ${authorCount} authors in database`)

    return {
      success: true,
      authorsCreated: authors.length,
      booksCreated: books.length,
      genres: [...new Set(books.map((book) => book.genre))],
    }
  } catch (error) {
    console.error("❌ Error seeding database:", error)

    if (error.message.includes("ENOTFOUND")) {
      console.error("💡 This looks like a network/DNS issue. Check your internet connection.")
    } else if (error.message.includes("authentication failed")) {
      console.error("💡 Authentication failed. Check your MongoDB username and password.")
    } else if (error.message.includes("duplicate key")) {
      console.error("💡 Duplicate data detected. The script may have run before.")
    }

    throw error
  } finally {
    await client.close()
    console.log("🔌 MongoDB connection closed")
  }
}

// Run the seeder
seedDatabase()
  .then((result) => {
    console.log("🎉 Seeding completed successfully!", result)
  })
  .catch((error) => {
    console.error("💥 Seeding failed:", error.message)
  })
