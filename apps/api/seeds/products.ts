import { Product } from '../models/Product';
import mongoose from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';
import { uploadBase64Image } from '../config/cloudinary';

interface ProductData {
  products: Array<{
    [key: string]: any;
  }>;
}

export async function seedProducts(): Promise<void> {
  try {
    const filePath = path.join(__dirname, 'data', 'ecommerce-items.json');
    
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    let productsData: ProductData;
    
    try {
      const jsonData = JSON.parse(fileContent);
      
      if (Array.isArray(jsonData)) {
        productsData = { products: jsonData };
      } else if (jsonData.products && Array.isArray(jsonData.products)) {
        productsData = jsonData;
      } else {
        throw new Error('Invalid JSON structure');
      }
    } catch (jsonError) {
      
      const lines = fileContent.split('\n');
      const validProducts: any[] = [];
      let totalLines = 0;
      let skippedLines = 0;
      let currentObject = '';
      let inObject = false;
      let objectDepth = 0;
      let imageUploadSuccess = 0;
      let imageUploadFailed = 0;
      
      for (const line of lines) {
        totalLines++;
        const trimmedLine = line.trim();
        
        if (!trimmedLine) {
          skippedLines++;
          continue;
        }
        
        const openBraces = (trimmedLine.match(/{/g) || []).length;
        const closeBraces = (trimmedLine.match(/}/g) || []).length;
        objectDepth += openBraces - closeBraces;
        
        if (trimmedLine.startsWith('{')) {
          inObject = true;
          currentObject = trimmedLine;
        }
        else if (inObject) {
          currentObject += trimmedLine;
          
          if (objectDepth === 0) {
            try {
              const product = JSON.parse(currentObject);
              
              const productData: {
                title: string;
                category: string;
                subcategory: string;
                brand: string;
                description: string;
                stock: number;
                image?: string;
              } = {
                title: product.title || product.name,
                category: product.category || 'Uncategorized',
                subcategory: product.subcategory || product.category || 'General',
                brand: product.brand || 'Generic',
                description: product.description || product.title || product.name,
                stock: Math.floor(Math.random() * 100)
              };
              
              try {
                if (product.image) {
                  if (typeof product.image === 'string') {
                    if (product.image.startsWith('http')) {
                      productData.image = product.image;
                      console.log(`Using existing image URL for product: ${productData.title}`);
                    }
                  } else if (typeof product.image === 'object') {
                    let base64Data: string | undefined;
                    
                    if (product.image.bytes) {
                      base64Data = product.image.bytes;
                    } else if (product.image.data) {
                      base64Data = product.image.data;
                    } else if (product.image.base64) {
                      base64Data = product.image.base64;
                    }
                    
                    if (base64Data) {
                      if (base64Data.length > 1000000) { // 1MB limit
                        console.log(`⚠️ Image data too large for ${productData.title}, using placeholder`);
                        productData.image = 'https://via.placeholder.com/500x500?text=Product+Image';
                      } else {
                        console.log(`\nAttempting to upload image for product: ${productData.title}`);
                        console.log('Image data type:', typeof base64Data);
                        console.log('Image data length:', base64Data.length);
                        console.log('Image data preview:', base64Data.substring(0, 50) + '...');
                        
                        try {
                          const imageUrl = await uploadBase64Image(base64Data);
                          if (imageUrl && imageUrl.startsWith('http')) {
                            productData.image = imageUrl;
                            console.log('Image uploaded successfully to Cloudinary:', imageUrl);
                            imageUploadSuccess++;
                          } else {
                            console.warn(`Invalid Cloudinary URL received for ${productData.title}`);
                            productData.image = 'https://via.placeholder.com/500x500?text=Product+Image';
                            imageUploadFailed++;
                          }
                        } catch (uploadError) {
                          console.warn(`Upload failed for ${productData.title}:`, uploadError);
                          productData.image = 'https://via.placeholder.com/500x500?text=Product+Image';
                          imageUploadFailed++;
                        }
                      }
                    } else {
                      console.log(`Skipping image for ${productData.title}: No valid image data found`);
                      productData.image = 'https://via.placeholder.com/500x500?text=Product+Image';
                      imageUploadFailed++;
                    }
                  } else {
                    console.log(`Skipping image for ${productData.title}: Invalid image format`);
                    productData.image = 'https://via.placeholder.com/500x500?text=Product+Image';
                    imageUploadFailed++;
                  }
                } else {
                  console.log(`No image found for product: ${productData.title}`);
                  productData.image = 'https://via.placeholder.com/500x500?text=Product+Image';
                }
              } catch (error) {
                console.warn(`Error processing image for ${productData.title}:`, error);
                productData.image = 'https://via.placeholder.com/500x500?text=Product+Image';
                imageUploadFailed++;
              }
              
              const requiredFields = ['title', 'category', 'subcategory', 'brand', 'description'] as const;
              const missingFields = requiredFields.filter(field => !productData[field]);
              
              if (missingFields.length === 0) {
                validProducts.push(productData);
              } else {
                console.warn(`Skipping product due to missing required fields: ${missingFields.join(', ')}`);
                skippedLines++;
              }
            } catch (error: unknown) {
              if (error instanceof Error) {
                console.warn('Skipping invalid product object:', error.message);
              } else {
                console.warn('Skipping invalid product object: Unknown error');
              }
              skippedLines++;
            }
            inObject = false;
            currentObject = '';
          }
        }
      }
      
      productsData = { products: validProducts };
      console.log(`\n📊 Processing Summary:
        - Total lines processed: ${totalLines}
        - Products successfully parsed: ${productsData.products.length}
        - Lines skipped: ${skippedLines}
        - Images uploaded successfully: ${imageUploadSuccess}
        - Images failed to upload: ${imageUploadFailed}
      `);
    }
    
    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products from database');
    
    // Insert new products from JSON file
    console.log(`Attempting to insert ${productsData.products.length} products...`);
    const result = await Product.insertMany(productsData.products);
    console.log(`Successfully inserted ${result.length} products`);
    
    console.log('Products seeded successfully!');
  } catch (error) {
    console.error('Error seeding products:', error);
    throw error;
  }
} 