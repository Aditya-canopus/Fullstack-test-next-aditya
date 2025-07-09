import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    console.log("🚀 Initiating catalog population process...")

    const { db } = await connectToDatabase()

    console.log("🗑️ Removing existing catalog entries...")
    await db.collection("authors").deleteMany({})
    await db.collection("books").deleteMany({})
    console.log("✨ Catalog cleared successfully")

    console.log("👨‍💼 Generating writer profiles...")
    const authorProfiles = [
      { _id: new ObjectId(), name: "George Orwell", nationality: "British", birthYear: 1903 },
      { _id: new ObjectId(), name: "Isaac Asimov", nationality: "American", birthYear: 1920 },
      { _id: new ObjectId(), name: "Agatha Christie", nationality: "British", birthYear: 1890 },
      { _id: new ObjectId(), name: "J.K. Rowling", nationality: "British", birthYear: 1965 },
      { _id: new ObjectId(), name: "Stephen King", nationality: "American", birthYear: 1947 },
    ]

    const writerInsertResult = await db.collection("authors").insertMany(authorProfiles)
    console.log(`✅ Successfully created ${writerInsertResult.insertedCount} writer profiles`)

    console.log("📖 Adding publication entries...")
    const bookCatalog = [
      { title: "1984", authorId: authorProfiles[0]._id, genre: "Sci-Fi", publicationYear: 1949, isbn: "9780451524935" },
      {
        title: "Animal Farm",
        authorId: authorProfiles[0]._id,
        genre: "Political Satire",
        publicationYear: 1945,
        isbn: "9780451526342",
      },
      {
        title: "Foundation",
        authorId: authorProfiles[1]._id,
        genre: "Sci-Fi",
        publicationYear: 1951,
        isbn: "9780553803716",
      },
      {
        title: "I, Robot",
        authorId: authorProfiles[1]._id,
        genre: "Sci-Fi",
        publicationYear: 1950,
        isbn: "9780553294385",
      },
      {
        title: "The Murder of Roger Ackroyd",
        authorId: authorProfiles[2]._id,
        genre: "Mystery",
        publicationYear: 1926,
        isbn: "9780007527526",
      },
      {
        title: "And Then There Were None",
        authorId: authorProfiles[2]._id,
        genre: "Mystery",
        publicationYear: 1939,
        isbn: "9780062073488",
      },
      {
        title: "Harry Potter and the Philosopher's Stone",
        authorId: authorProfiles[3]._id,
        genre: "Fantasy",
        publicationYear: 1997,
        isbn: "9780747532699",
      },
      {
        title: "Harry Potter and the Chamber of Secrets",
        authorId: authorProfiles[3]._id,
        genre: "Fantasy",
        publicationYear: 1998,
        isbn: "9780747538493",
      },
      {
        title: "The Shining",
        authorId: authorProfiles[4]._id,
        genre: "Horror",
        publicationYear: 1977,
        isbn: "9780307743657",
      },
      { title: "It", authorId: authorProfiles[4]._id, genre: "Horror", publicationYear: 1986, isbn: "9781501142970" },
      {
        title: "The Stand",
        authorId: authorProfiles[4]._id,
        genre: "Horror",
        publicationYear: 1978,
        isbn: "9780307743688",
      },
    ]

    const publicationInsertResult = await db.collection("books").insertMany(bookCatalog)
    console.log(`✅ Successfully added ${publicationInsertResult.insertedCount} publications`)

    console.log("🔧 Establishing database constraints...")
    try {
      await db.collection("books").createIndex({ isbn: 1 }, { unique: true })
      console.log("✅ ISBN uniqueness constraint created")
    } catch (indexError) {
      console.log("ℹ️ Constraint may already exist, proceeding...")
    }

    const categoryList = [...new Set(bookCatalog.map((publication) => publication.genre))]

    return NextResponse.json({
      success: true,
      message: "Catalog population completed successfully! 🎊",
      statistics: {
        writersCreated: authorProfiles.length,
        publicationsAdded: bookCatalog.length,
        categoriesAvailable: categoryList,
        writerSummary: authorProfiles.map((writer) => ({ name: writer.name, nationality: writer.nationality })),
        publicationSummary: bookCatalog.map((book) => ({
          title: book.title,
          genre: book.genre,
          year: book.publicationYear,
        })),
      },
    })
  } catch (populationError) {
    console.error("❌ Catalog population failed:", populationError)

    let errorDescription = "An unexpected error occurred during population"

    if (populationError instanceof Error) {
      if (populationError.message.includes("ENOTFOUND")) {
        errorDescription = "Network connectivity issue. Please check your internet connection."
      } else if (populationError.message.includes("authentication failed")) {
        errorDescription = "Database authentication failed. Please verify your credentials."
      } else if (populationError.message.includes("duplicate key")) {
        errorDescription = "Duplicate data detected. The population may have been run previously."
      } else {
        errorDescription = populationError.message
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: errorDescription,
        technicalDetails: populationError instanceof Error ? populationError.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Catalog population service. Send POST request to populate database.",
    instructions: "Use POST method to this endpoint to fill the database with sample catalog data.",
  })
}
