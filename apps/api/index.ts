import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { gql } from 'graphql-tag';
import 'dotenv/config';
import mongoose from 'mongoose';
import { Product } from './models/Product';
import cors from 'cors';
import Typesense from 'typesense';
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import aiRoutes from './routes/ai';
import { aiService } from './services/aiService';
import GraphQLJSON from 'graphql-type-json';

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
  scalar JSON

  type AgentQueryResponse {
    llm_output: String
    raw_output: JSON
    action: String
  }

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
  }

  type Query {
    agentQuery(query: String!, userId: String, context: JSON): AgentQueryResponse
    products(limit: Int, offset: Int): [Product!]!
    product(id: ID!): Product
    productsByCategory(category: String!): [Product!]!
    productsByBrand(brand: String!): [Product!]!
    searchProducts(query: String!): [Product!]!
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
  JSON: GraphQLJSON,
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
    searchProducts: async (_: any, { query }: { query: string }) => 
      await Product.find({
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { brand: { $regex: query, $options: 'i' } }
        ]
      }),
    agentQuery: async (_: any, { query, userId, context }: { query: string, userId?: string, context?: any[] }) => {
      return await aiService.getAgentQueryResponse(query, userId, context);
    }
  },
};

// Apollo Server with Express
async function startServer(): Promise<void> {
  await connectDB(); 
  const app = express();

  app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
  }));

  app.use(express.json());
  app.use('/auth', authRoutes);
  app.use('/user', userRoutes);
  app.use('/ai', aiRoutes);

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
      // Extract user from JWT token for GraphQL context
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
          const jwt = require('jsonwebtoken');
          const JWT_SECRET = process.env.JWT_SECRET || 'changeme';
          const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
          return { user: { userId: decoded.userId } };
        } catch (err) {
        }
      }
      return { user: null };
    }
  });

  await server.start();
  server.applyMiddleware({ app: app as any });

  const PORT = process.env.PORT;
  app.listen(PORT, () => {
    console.log(`Server ready at http://localhost:${PORT}${server.graphqlPath}`);
    console.log(`AI Service URL: ${process.env.AI_SERVICE_URL || 'http://localhost:8000'}`);
  });
}

startServer().catch(error => {
  console.error('Server start error:', error);
});
