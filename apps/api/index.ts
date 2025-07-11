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

  type AIProduct {
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
    aiConfidence: Float
    aiReason: String
  }

  type AIRecommendationResponse {
    products: [AIProduct!]!
    explanation: String!
    confidence: Float!
    suggestions: [String!]!
    totalFound: Int!
  }

  type VirtualTryOnResponse {
    processedImage: String!
    confidence: Float!
    processingTime: Float!
    product: Product!
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

  input UserPreferencesInput {
    style: String
    budget: Float
    size: String
    color: String
    occasion: String
  }

  input AIRecommendationInput {
    query: String!
    userPreferences: UserPreferencesInput
  }

  input VirtualTryOnInput {
    userImage: String!
    productId: ID!
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
    getAIRecommendations(input: AIRecommendationInput!): AIRecommendationResponse!
    generateVirtualTryOn(input: VirtualTryOnInput!): VirtualTryOnResponse!
    searchWithAIContext(query: String!, context: String): AIRecommendationResponse!
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
    },
    getAIRecommendations: async (_: any, { input }: { input: any }, context: any) => {
      if (!context.user) {
        throw new Error('Authentication required');
      }

      const aiResponse = await aiService.getRecommendations({
        ...input,
        userId: context.user.userId
      });

      // Map AI recommendations to actual products
      const recommendedProducts = [];
      for (const aiProduct of aiResponse.products) {
        try {
          const product = await Product.findById(aiProduct.id);
          if (product) {
            recommendedProducts.push({
              ...product.toObject(),
              aiConfidence: aiProduct.confidence,
              aiReason: aiProduct.reason
            });
          }
        } catch (error) {
          console.error(`Product ${aiProduct.id} not found:`, error);
        }
      }

      return {
        products: recommendedProducts,
        explanation: aiResponse.explanation,
        confidence: aiResponse.confidence,
        suggestions: aiResponse.suggestions,
        totalFound: recommendedProducts.length
      };
    },
    generateVirtualTryOn: async (_: any, { input }: { input: any }, context: any) => {
      if (!context.user) {
        throw new Error('Authentication required');
      }

      const product = await Product.findById(input.productId);
      if (!product) {
        throw new Error('Product not found');
      }

      const aiResponse = await aiService.generateVirtualTryOn({
        ...input,
        userId: context.user.userId
      });

      return {
        processedImage: aiResponse.processedImage,
        confidence: aiResponse.confidence,
        processingTime: aiResponse.processingTime,
        product
      };
    },
    searchWithAIContext: async (_: any, { query, context: contextParam }: { query: string, context?: string }, graphqlContext: any) => {
      if (!graphqlContext.user) {
        throw new Error('Authentication required');
      }

      const aiResponse = await aiService.searchWithContext(query, contextParam);

      // Map AI recommendations to actual products
      const recommendedProducts = [];
      for (const aiProduct of aiResponse.products) {
        try {
          const product = await Product.findById(aiProduct.id);
          if (product) {
            recommendedProducts.push({
              ...product.toObject(),
              aiConfidence: aiProduct.confidence,
              aiReason: aiProduct.reason
            });
          }
        } catch (error) {
          console.error(`Product ${aiProduct.id} not found:`, error);
        }
      }

      return {
        products: recommendedProducts,
        explanation: aiResponse.explanation,
        confidence: aiResponse.confidence,
        suggestions: aiResponse.suggestions,
        totalFound: recommendedProducts.length
      };
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
    console.log(`AI Service URL: ${process.env.AI_SERVICE_URL || 'http://localhost:4001'}`);
  });
}

startServer().catch(error => {
  console.error('Server start error:', error);
});
