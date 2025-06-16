// Types based on Hugging Face ecommerce-items dataset
// https://huggingface.co/datasets/ivanleomk/ecommerce-items

export type Category = 'Tops' | 'Bottoms';

export type SubCategory = 
  | 'Blouses' 
  | 'Jeans' 
  | 'T-Shirts' 
  | 'Skirts' 
  | 'Sweaters & Knits';

export type Brand = 'H&M' | 'Zara' | 'Uniqlo';

export type Product = {
  id: number;
  title: string;
  category: Category;
  subcategory: SubCategory;
  brand: Brand;
  description: string;
  image: string; // URL to the product image
};

// API response type for product endpoints
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
}; 