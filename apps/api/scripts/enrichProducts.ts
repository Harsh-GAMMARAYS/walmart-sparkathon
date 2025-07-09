import * as dotenv from 'dotenv';
dotenv.config({ path: require('path').resolve(__dirname, '../.env') });
import mongoose from 'mongoose';
import { Product } from '../models/Product';

const COLOR_NAMES = [
  'red', 'blue', 'green', 'black', 'white', 'yellow', 'pink', 'purple', 'orange', 'gray', 'brown', 'beige', 'gold', 'silver', 'navy', 'maroon', 'olive', 'teal', 'lime', 'aqua', 'fuchsia'
];

function extractTags(product: any): string[] {
  const text = [
    product.title,
    product.description,
    product.brand,
    product.category,
    product.subcategory
  ].join(' ').toLowerCase();
  const words = Array.from(new Set(text.split(/\W+/).filter(w => w.length > 2 && ![
    'the','and','for','with','from','this','that','you','are','but','not','all','any','can','has','have','was','will','one','two','new','set','use','now','out','get','our','see','top','off','per','day','may','who','his','her','she','him','its','had','did','how','why','let','put','big','buy','add','use','see','fit','run','fun','yes','no','on','in','at','by','to','of','as','is','it','or','an','be','if','so','do','up','go','us','we','me','my','your','their','them','they','he','i','a'
  ].includes(w))));
  return words;
}

function extractColor(product: any): string {
  const text = (product.title + ' ' + product.description).toLowerCase();
  return COLOR_NAMES.find(color => text.includes(color)) || '';
}

async function enrichProducts() {
  await mongoose.connect(process.env.MONGODB_URI || '', { dbName: process.env.DB_NAME });
  const products = await Product.find();
  let updated = 0;
  for (const product of products) {
    const tags = extractTags(product);
    const color = extractColor(product);
    product.tags = tags;
    product.color = color;
    await product.save();
    updated++;
    if (updated % 50 === 0) console.log(`Updated ${updated} products...`);
  }
  console.log(`Enriched ${updated} products with tags and color.`);
  await mongoose.disconnect();
}

enrichProducts().catch(err => {
  console.error('Error enriching products:', err);
  process.exit(1);
}); 