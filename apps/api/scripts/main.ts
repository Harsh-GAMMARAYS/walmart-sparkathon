import * as dotenv from 'dotenv';
dotenv.config();
import * as path from 'path';
import * as fs from 'fs';
import { seedProducts } from '../seeds/products';
import mongoose from 'mongoose';

const possibleEnvPaths = [
  path.resolve(__dirname, '..', '.env'),
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), 'apps', 'api', '.env')
];

let envLoaded = false;
for (const envPath of possibleEnvPaths) {
  if (fs.existsSync(envPath)) {
    console.log('Found .env file at:', envPath);
    dotenv.config({ path: envPath });
    envLoaded = true;
    break;
  }
}

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/walmart-sparkathon');
    console.log('Connected to MongoDB!');

    console.log('🌱 Seeding products...');
    await seedProducts();
    console.log('Database seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
  }
}

seed();