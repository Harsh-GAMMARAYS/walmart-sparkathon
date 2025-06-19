import { Product } from '../models/Product';
import * as fs from 'fs';
import * as path from 'path';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});


const uploadImageByUrl = async (imageUrl: string) => {
  try {
    const res = await cloudinary.uploader.upload(imageUrl, {
      folder: 'walmart-sparkathon',
    });
    return res.secure_url;
  } catch (err) {
    console.error(`Failed to upload image: ${imageUrl}`, err);
    return 'https://via.placeholder.com/500x500?text=Image+Unavailable';
  }
};


export async function seedProducts(): Promise<void> {
  try {
    const filePath = path.join(__dirname, 'data', 'ecommerce-items.json');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const productsArray = JSON.parse(fileContent);
    const products: any[] = [];
    for (const product of productsArray) {
      const requiredFields = ['title', 'category', 'subcategory', 'brand', 'description', 'price'];
      const missing = requiredFields.filter(f => !product[f]);
      if (missing.length > 0) {
        console.warn(`Skipping product due to missing fields: ${missing.join(', ')} (title: ${product.title || 'N/A'})`);
        continue;
      }
      const images: string[] = [];
      if (product.image) {
        try {
          const imageArr = JSON.parse(product.image);
          if (Array.isArray(imageArr)) {
            for (const imgUrl of imageArr) {
              const cloudinaryUrl = await uploadImageByUrl(imgUrl);
              images.push(cloudinaryUrl);
            }
          }
        } catch (e) {
          console.warn('Failed to parse image array for product:', product.title);
        }
      }
      const allPlaceholders = images.length > 0 && images.every(url => url.includes('placeholder.com'));
      if (allPlaceholders) {
        console.warn(`All image uploads failed for "${product.title}" — skipping product`);
        continue;
      }
      products.push({
        title: product.title,
        category: product.category,
        subcategory: product.subcategory,
        brand: product.brand,
        description: product.description,
        image: images,
        price: product.price,
      });
    }
    await Product.deleteMany({});
    await Product.insertMany(products);
    console.log(`Seeded ${products.length} products.`);
  } catch (error) {
    throw error;
  }
}