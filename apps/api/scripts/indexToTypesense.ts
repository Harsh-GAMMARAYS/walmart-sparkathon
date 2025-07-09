import * as dotenv from 'dotenv';
dotenv.config({ path: require('path').resolve(__dirname, '../.env') });
import mongoose from 'mongoose';
import { Product } from '../models/Product';
import Typesense from 'typesense';

const TYPESENSE_API_KEY = 'xyz';
const TYPESENSE_HOST = 'localhost';
const TYPESENSE_PORT = 8108;
const TYPESENSE_PROTOCOL = 'http';

const client = new Typesense.Client({
  nodes: [
    {
      host: TYPESENSE_HOST,
      port: TYPESENSE_PORT,
      protocol: TYPESENSE_PROTOCOL,
    },
  ],
  apiKey: TYPESENSE_API_KEY,
  connectionTimeoutSeconds: 10,
});

const COLLECTION_NAME = 'products';

const schema = {
  name: COLLECTION_NAME,
  fields: [
    { name: 'id', type: 'string' as const },
    { name: 'title', type: 'string' as const },
    { name: 'brand', type: 'string' as const, facet: true },
    { name: 'category', type: 'string' as const, facet: true },
    { name: 'subcategory', type: 'string' as const, facet: true },
    { name: 'description', type: 'string' as const },
    { name: 'image', type: 'string[]' as const, optional: true },
    { name: 'price', type: 'float' as const, facet: true },
    { name: 'tags', type: 'string[]' as const, facet: true, optional: true },
    { name: 'color', type: 'string' as const, facet: true, optional: true },
    { name: 'createdAt', type: 'string' as const, optional: true },
  ],
  default_sorting_field: 'price',
};

async function ensureCollection() {
  try {
    await client.collections(COLLECTION_NAME).retrieve();
    console.log('Typesense collection already exists.');
  } catch (e) {
    console.log('Creating Typesense collection...');
    await client.collections().create(schema);
    console.log('Typesense collection created.');
  }
}

async function indexProducts() {
  await mongoose.connect(process.env.MONGODB_URI || '', { dbName: process.env.DB_NAME });
  await ensureCollection();
  const products = await Product.find();
  const documents = products.map((p: any) => ({
    id: p._id.toString(),
    title: p.title,
    brand: p.brand,
    category: p.category,
    subcategory: p.subcategory,
    description: p.description,
    image: p.image,
    price: p.price,
    tags: p.tags || [],
    color: p.color || '',
    createdAt: p.createdAt ? p.createdAt.toISOString() : '',
  }));
  // Typesense recommends upserting in batches
  const BATCH_SIZE = 100;
  for (let i = 0; i < documents.length; i += BATCH_SIZE) {
    const batch = documents.slice(i, i + BATCH_SIZE);
    await client.collections(COLLECTION_NAME).documents().import(batch, { action: 'upsert' });
    console.log(`Indexed ${Math.min(i + BATCH_SIZE, documents.length)} / ${documents.length} products...`);
  }
  console.log('All products indexed to Typesense!');
  await mongoose.disconnect();
}

indexProducts().catch(err => {
  console.error('Error indexing products to Typesense:', err);
  process.exit(1);
}); 