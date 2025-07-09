import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { gql } from 'graphql-tag';
import 'dotenv/config';
import mongoose from 'mongoose';
import { Product } from './models/Product';
import cors from 'cors';
import Typesense from 'typesense';

async function connectDB(): Promise<void> {
  try {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) throw new Error('MONGODB_URI not defined!');
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB!');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

// GraphQL schema
const typeDefs = gql`
  type Product {
    id: ID!
    title: String!
    category: String!
    subcategory: String!
    brand: String!
    description: String!
    image: [String]
    price: Float!
    createdAt: String!
    tags: [String]
    color: String
  }

  type ProductSuggestion {
    id: ID!
    title: String!
    brand: String!
    category: String!
  }

  input ProductInput {
    title: String!
    category: String!
    subcategory: String!
    brand: String!
    description: String!
    image: [String]
    price: Float
    tags: [String]
    color: String
  }

  type Query {
    products(limit: Int, offset: Int): [Product!]!
    product(id: ID!): Product
    productsByCategory(category: String!): [Product!]!
    productsByBrand(brand: String!): [Product!]!
    searchProducts(query: String!): [Product!]!
    productSuggestions(query: String!): [ProductSuggestion!]!
  }

  type Mutation {
    createProduct(input: ProductInput!): Product!
    updateProduct(id: ID!, input: ProductInput!): Product!
    deleteProduct(id: ID!): Boolean!
  }
`;

const typesenseClient = new Typesense.Client({
  nodes: [
    {
      host: 'localhost',
      port: 8108,
      protocol: 'http',
    },
  ],
  apiKey: 'xyz',
  connectionTimeoutSeconds: 10,
});

// GraphQL resolvers
const resolvers = {
  Query: {
    products: async (_: any, args: { limit?: number; offset?: number }) => {
      const { limit = 30, offset = 0 } = args;
      return await Product.find().skip(offset).limit(limit);
    },
    product: async (_: any, { id }: { id: string }) => await Product.findById(id),
    productsByCategory: async (_: any, { category }: { category: string }) => 
      await Product.find({ category }),
    productsByBrand: async (_: any, { brand }: { brand: string }) => 
      await Product.find({ brand }),
    searchProducts: async (_: any, { query }: { query: string }) => {
      if (!query || query.trim() === "") return [];
      const searchResults = await typesenseClient.collections('products').documents().search({
        q: query,
        query_by: 'title,description,brand,category,subcategory,tags,color',
        per_page: 40,
      });
      return (searchResults.hits || []).map((hit: any) => hit.document);
    },
    productSuggestions: async (_: any, { query }: { query: string }) => {
      if (!query || query.trim() === "") return [];
      const suggestResults = await typesenseClient.collections('products').documents().search({
        q: query,
        query_by: 'title,brand,category,tags,color',
        per_page: 10,
      });
      return (suggestResults.hits || []).map((hit: any) => ({
        id: hit.document.id,
        title: hit.document.title,
        brand: hit.document.brand,
        category: hit.document.category,
      }));
    }
  },
  Mutation: {
    createProduct: async (_: any, { input }: { input: any }) => {
      const newProduct = new Product(input);
      return await newProduct.save();
    },
    updateProduct: async (_: any, { id, input }: { id: string, input: any }) => {
      return await Product.findByIdAndUpdate(id, input, { new: true });
    },
    deleteProduct: async (_: any, { id }: { id: string }) => {
      const result = await Product.findByIdAndDelete(id);
      return !!result;
    }
  }
};

// Apollo Server with Express
async function startServer(): Promise<void> {
  await connectDB(); 
  const app = express();

  app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
  }));

  const server = new ApolloServer({
    typeDefs,
    resolvers
  });

  await server.start();
  server.applyMiddleware({ app: app as any });

  const PORT = process.env.PORT;
  app.listen(PORT, () => {
    console.log(`Server ready at http://localhost:${PORT}${server.graphqlPath}`);
  });
}

startServer().catch(error => {
  console.error('Server start error:', error);
});
