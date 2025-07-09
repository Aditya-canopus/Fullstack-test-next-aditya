import { ObjectId } from "mongodb"
import { connectToDatabase } from "@/lib/mongodb"

export const typeDefs = `#graphql
  # Writer entity representing book authors
  type Writer {
    id: ID!
    fullName: String!
    country: String
    yearOfBirth: Int
  }

  # Publication entity for library catalog
  type Publication {
    id: ID!
    bookTitle: String!
    writer: Writer!
    category: String!
    releaseYear: Int!
    identifier: String!
  }

  # Available queries for the catalog system
  type Query {
    fetchAllPublications: [Publication!]
    retrievePublicationInfo(id: ID!): Publication
    findPublicationsByCategory(category: String!): [Publication!]
    fetchAllWriters: [Writer!]
    retrieveAllCategories: [String!]
  }

  # Mutations for catalog management
  type Mutation {
    createPublication(bookTitle: String!, writerId: ID!, category: String!, releaseYear: Int!, identifier: String!): Publication
    modifyPublication(id: ID!, bookTitle: String, writerId: ID, category: String, releaseYear: Int, identifier: String): Publication
  }
`

export const resolvers = {
  Query: {
    // Retrieve complete publication catalog
    fetchAllPublications: async () => {
      const { db } = await connectToDatabase()
      return db.collection("books").find({}).toArray()
    },
    // Get detailed information for specific publication
    retrievePublicationInfo: async (_: any, { id }: { id: string }) => {
      const { db } = await connectToDatabase()
      if (!ObjectId.isValid(id)) {
        throw new Error("Publication identifier format is invalid")
      }
      return db.collection("books").findOne({ _id: new ObjectId(id) })
    },
    // Filter publications by literary category
    findPublicationsByCategory: async (_: any, { category }: { category: string }) => {
      const { db } = await connectToDatabase()
      return db.collection("books").find({ genre: category }).toArray()
    },
    // Get all registered writers
    fetchAllWriters: async () => {
      const { db } = await connectToDatabase()
      return db.collection("authors").find({}).toArray()
    },
    // Extract unique publication categories
    retrieveAllCategories: async () => {
      const { db } = await connectToDatabase()
      return db.collection("books").distinct("genre")
    },
  },
  Mutation: {
    // Register new publication in catalog
    createPublication: async (
      _: any,
      {
        bookTitle,
        writerId,
        category,
        releaseYear,
        identifier,
      }: { bookTitle: string; writerId: string; category: string; releaseYear: number; identifier: string },
    ) => {
      const { db } = await connectToDatabase()

      // Verify identifier uniqueness
      const duplicatePublication = await db.collection("books").findOne({ isbn: identifier })
      if (duplicatePublication) {
        throw new Error("This publication identifier already exists in our catalog.")
      }

      // Validate writer existence
      if (!ObjectId.isValid(writerId)) {
        throw new Error("Writer identifier format is incorrect")
      }

      const writerRecord = await db.collection("authors").findOne({ _id: new ObjectId(writerId) })
      if (!writerRecord) {
        throw new Error("Selected writer not found in our database.")
      }

      // Create publication record
      const publicationData = {
        title: bookTitle,
        authorId: new ObjectId(writerId),
        genre: category,
        publicationYear: releaseYear,
        isbn: identifier,
      }

      const insertResult = await db.collection("books").insertOne(publicationData)

      return {
        id: insertResult.insertedId.toString(),
        ...publicationData,
        writer: writerRecord,
      }
    },
    // Update existing publication details
    modifyPublication: async (
      _: any,
      {
        id,
        bookTitle,
        writerId,
        category,
        releaseYear,
        identifier,
      }: {
        id: string
        bookTitle?: string
        writerId?: string
        category?: string
        releaseYear?: number
        identifier?: string
      },
    ) => {
      const { db } = await connectToDatabase()

      // Validate publication ID format
      if (!ObjectId.isValid(id)) {
        throw new Error("Publication identifier format is invalid")
      }

      // Confirm publication exists
      const currentPublication = await db.collection("books").findOne({ _id: new ObjectId(id) })
      if (!currentPublication) {
        throw new Error("Publication not found in catalog.")
      }

      // Check identifier uniqueness if being modified
      if (identifier && identifier !== currentPublication.isbn) {
        const conflictingPublication = await db.collection("books").findOne({
          isbn: identifier,
          _id: { $ne: new ObjectId(id) },
        })
        if (conflictingPublication) {
          throw new Error("Another publication already uses this identifier.")
        }
      }

      // Validate writer if being changed
      if (writerId && writerId !== currentPublication.authorId.toString()) {
        if (!ObjectId.isValid(writerId)) {
          throw new Error("Writer identifier format is incorrect")
        }
        const writerExists = await db.collection("authors").findOne({ _id: new ObjectId(writerId) })
        if (!writerExists) {
          throw new Error("Selected writer not found in database.")
        }
      }

      // Prepare update data
      const modifications: any = {}
      if (bookTitle !== undefined) modifications.title = bookTitle
      if (writerId !== undefined) modifications.authorId = new ObjectId(writerId)
      if (category !== undefined) modifications.genre = category
      if (releaseYear !== undefined) modifications.publicationYear = releaseYear
      if (identifier !== undefined) modifications.isbn = identifier

      // Apply modifications
      await db.collection("books").updateOne({ _id: new ObjectId(id) }, { $set: modifications })

      // Return updated publication
      const updatedPublication = await db.collection("books").findOne({ _id: new ObjectId(id) })
      return updatedPublication
    },
  },
  Publication: {
    id: (parent: any) => parent._id.toString(),
    bookTitle: (parent: any) => parent.title,
    category: (parent: any) => parent.genre,
    releaseYear: (parent: any) => parent.publicationYear,
    identifier: (parent: any) => parent.isbn,
    writer: async (parent: any) => {
      const { db } = await connectToDatabase()
      return db.collection("authors").findOne({ _id: new ObjectId(parent.authorId) })
    },
  },
  Writer: {
    id: (parent: any) => parent._id.toString(),
    fullName: (parent: any) => parent.name,
    country: (parent: any) => parent.nationality,
    yearOfBirth: (parent: any) => parent.birthYear,
  },
}
