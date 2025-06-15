# 🗄️ Backend API Setup Instructions - For Vedika

## 📚 **What You're Building**
You're building the **backend API** that will handle:
- Product data (storing and retrieving apparel items)
- User management and preferences
- AI integration endpoints (connecting to Manodeep's AI service)
- Database operations with MongoDB

## 🛠️ **Tech Stack You'll Use**
- **Node.js** → JavaScript runtime for server
- **TypeScript** → Strongly typed JavaScript (REQUIRED for this project)
- **GraphQL** → Modern API query language (better than REST)
- **Apollo Server** → GraphQL server framework
- **MongoDB Atlas** → Cloud database for storing data

## 🚨 **Important: TypeScript is Required**
We're using TypeScript for better code quality and team collaboration:
- ✅ **Catch errors before runtime**
- ✅ **Better IDE support and autocomplete**
- ✅ **Easier for teammates to understand your code**
- ✅ **Industry standard for modern backend development**

---

## 🏗️ **Understanding Our Project Structure**

### **What is a Monorepo?**
A monorepo is like having multiple related projects in one big folder:
```
walmart-sparkathon/
├── apps/web     → Harshit's Next.js website
├── apps/api     → YOUR backend server ✨
├── apps/mobile  → Dristant's mobile app
├── apps/ai      → Manodeep's AI service
```
**Benefit**: Everyone can share code and work together easily!

### **What is Turborepo?**
Turborepo helps run multiple apps at once:
- `pnpm dev --filter api` → Runs ONLY your backend
- `turbo run dev` → Runs ALL apps together
- Caches builds to make everything faster

### **What is pnpm?**
pnpm is like npm, but faster and better for monorepos:
- `pnpm install` → Installs dependencies
- `pnpm add <package name>` → Adds new packages
- Works across all apps in the monorepo

---

## 🚀 **Step-by-Step Setup**

### **1️⃣ Initialize Your API**
```bash
# Go to your folder
cd apps/api

# Create package.json
npm init -y

# Install dependencies
pnpm add apollo-server-express graphql express mongoose dotenv
pnpm add -D nodemon @types/node @types/express @types/mongoose typescript ts-node

# Initialize TypeScript config
npx tsc --init
```

### **2️⃣ Create Basic Files**
Create these files in `apps/api/`:

**`index.ts`** (Main server file - using TypeScript): (EXAMPLE)
```typescript
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { gql } from 'graphql-tag';

// Define TypeScript types first
interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
}

// Your GraphQL schema will go here(just an example)
const typeDefs = gql`
  type Query {
    hello: String
    products: [Product]
  }
  
  type Product {
    id: ID!
    name: String!
    price: Float!
    image: String
  }
`;

// Your API logic will go here(just an example)
const resolvers = {
  Query: {
    hello: (): string => 'Hello from Walmart Sparkathon API!',
    products: (): Product[] => [
      { id: '1', name: 'Cool Jacket', price: 59.99, image: 'jacket.jpg' }
    ]
  }
};

async function startServer(): Promise<void> {
  const app = express();
  const server = new ApolloServer({ typeDefs, resolvers });
  
  await server.start();
  server.applyMiddleware({ app });
  
  app.listen(4000, () => {
    console.log('🚀 API Server ready at http://localhost:4000/graphql');
  });
}

startServer().catch(error => {
  console.error('Error starting server:', error);
});
```

**`package.json`** scripts section:
```json
{
  "scripts": {
    "dev": "nodemon --exec ts-node index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

**`tsconfig.json`** (TypeScript configuration):
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

### **3️⃣ Test Your Setup**
```bash
# Run your API
pnpm dev

# Visit http://localhost:4000/graphql
# You should see GraphQL Playground!
```

---

## 📖 **Learning Resources**

### **GraphQL Basics**
- **What is GraphQL?** → A way to ask for exactly the data you need
- **Query Example**: 
  ```graphql
  query {
    products {
      name
      price
    }
  }
  ```
- **Mutation Example** (for creating/updating):
  ```graphql
  mutation {
    addProduct(name: "New Shirt", price: 25.99) {
      id
      name
    }
  }
  ```

### **MongoDB Connection (TypeScript)** (EXAMPLE)
```typescript
import mongoose from 'mongoose';

// Define interface for Product document
interface IProduct extends mongoose.Document {
  name: string;
  price: number;
  category: string;
  image?: string;
}

// Create Product schema with TypeScript
const productSchema = new mongoose.Schema<IProduct>({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  image: { type: String }
});

// Create Product model
const Product = mongoose.model<IProduct>('Product', productSchema);

// Connect to MongoDB Atlas
async function connectDB(): Promise<void> {
  try {
    await mongoose.connect('your-mongodb-connection-string');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
  }
}
```

---

## 🎯 **Your Main Tasks**

1. **Set up basic GraphQL server** (use example above)
2. **Connect to MongoDB Atlas** (create free account)
3. **Create product queries** (so web/mobile can get product data)
4. **Create user management** (sign up, login, preferences)
5. **Add endpoints for AI integration** (to connect with Manodeep's service)

---

## 🆘 **Need Help?**

### **Common Issues:**
- **Port already in use** → Change port to 4001, 4002, etc.
- **Dependencies not installing** → Run `pnpm install` from root directory first
- **GraphQL errors** → Check syntax in typeDefs and resolvers

### **Testing Your API:**
- Use GraphQL Playground at `http://localhost:4000/graphql`
- Test queries and mutations before connecting to frontend

### **Resources:**
- [GraphQL Tutorial](https://graphql.org/learn/)
- [Apollo Server Docs](https://www.apollographql.com/docs/apollo-server/)
- [MongoDB Atlas Setup](https://www.mongodb.com/docs/atlas/getting-started/)
