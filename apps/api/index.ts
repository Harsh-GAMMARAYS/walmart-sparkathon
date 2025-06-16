import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { gql } from 'graphql-tag';
import 'dotenv/config';
import mongoose from 'mongoose';
import { Product } from './models/Product';
import { Application } from 'express';

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
    image: String
    stock: Int!
    createdAt: String!
  }

  input ProductInput {
    title: String!
    category: String!
    subcategory: String!
    brand: String!
    description: String!
    image: String
    stock: Int
  }

  type Query {
    hello: String
    products: [Product!]!
    product(id: ID!): Product
    productsByCategory(category: String!): [Product!]!
    productsByBrand(brand: String!): [Product!]!
    searchProducts(query: String!): [Product!]!
  }

  type Mutation {
    createProduct(input: ProductInput!): Product!
    updateProduct(id: ID!, input: ProductInput!): Product!
    deleteProduct(id: ID!): Boolean!
  }
`;

// GraphQL resolvers
const resolvers = {
  Query: {
    products: async () => await Product.find(),
    product: async (_: any, { id }: { id: string }) => await Product.findById(id),
    productsByCategory: async (_: any, { category }: { category: string }) => 
      await Product.find({ category }),
    productsByBrand: async (_: any, { brand }: { brand: string }) => 
      await Product.find({ brand }),
    searchProducts: async (_: any, { query }: { query: string }) => 
      await Product.find({
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { brand: { $regex: query, $options: 'i' } }
        ]
      })
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
