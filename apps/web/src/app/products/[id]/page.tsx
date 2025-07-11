'use client';

import { useParams } from 'next/navigation';
import { gql, useQuery } from '@apollo/client';
import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { ChatWidget } from '@/components/ChatWidget';
import Link from 'next/link';
import { getDepartmentForCategory } from '@/utils/departments';

const GET_PRODUCT = gql`
  query GetProduct($id: ID!) {
    product(id: $id) {
      id
      title
      price
      brand
      category
      image
      description
      createdAt
    }
  }
`;

const GET_SIMILAR_PRODUCTS = gql`
  query GetSimilarProducts($category: String!) {
    productsByCategory(category: $category) {
      id
      title
      price
      brand
      category
      image
    }
  }
`;

const GET_ALL_PRODUCTS_FOR_FALLBACK = gql`
  query GetAllProductsForFallback {
    products(limit: 100) {
      id
      title
      price
      brand
      category
      image
    }
  }
`;

export default function ProductDetailPage() {
  const { id } = useParams();
  const { data, loading, error } = useQuery(GET_PRODUCT, { variables: { id } });
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const product = data?.product;
  const images = product?.image || [];

  // Check if product is clothing-related
  const isClothingItem = (category: string) => {
    const department = getDepartmentForCategory(category);
    return department === "Women's Clothing" || 
           department === "Men's Clothing" || 
           category.toLowerCase().includes('clothing') ||
           category.toLowerCase().includes('fashion');
  };

  // Get similar products from the same category
  const { data: similarData } = useQuery(GET_SIMILAR_PRODUCTS, {
    variables: { 
      category: product?.category || ''
    },
    skip: !product?.category
  });

  // Fallback query to get more products if needed
  const { data: allProductsData } = useQuery(GET_ALL_PRODUCTS_FOR_FALLBACK, {
    skip: !product?.category || (similarData?.productsByCategory?.length || 0) >= 4
  });

  // Smart similar products logic
  const getSimilarProducts = () => {
    if (!product) return [];

    // First try exact category match
    let exactMatches = similarData?.productsByCategory?.filter((p: any) => p.id !== id) || [];
    
    if (exactMatches.length >= 4) {
      return exactMatches.slice(0, 8);
    }

    // For clothing items, try broader matching
    if (isClothingItem(product.category)) {
      const allProducts = allProductsData?.products || [];
      const clothingProducts = allProducts.filter((p: any) => 
        p.id !== id && isClothingItem(p.category)
      );
      
      // Combine exact matches with other clothing items
      const combined = [
        ...exactMatches,
        ...clothingProducts.filter((p: any) => 
          !exactMatches.some((exact: any) => exact.id === p.id)
        )
      ];
      
      return combined.slice(0, 8);
    }

    // For non-clothing items, try department-based matching
    const currentDepartment = getDepartmentForCategory(product.category);
    if (currentDepartment !== "Other") {
      const allProducts = allProductsData?.products || [];
      const departmentProducts = allProducts.filter((p: any) => 
        p.id !== id && getDepartmentForCategory(p.category) === currentDepartment
      );
      
      const combined = [
        ...exactMatches,
        ...departmentProducts.filter((p: any) => 
          !exactMatches.some((exact: any) => exact.id === p.id)
        )
      ];
      
      return combined.slice(0, 8);
    }

    return exactMatches.slice(0, 8);
  };

  const similarProducts = getSimilarProducts();

  // Prefetch all images
  useEffect(() => {
    images.forEach((url: string) => {
      const img = new window.Image();
      img.src = url;
    });
  }, [images]);

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="bg-white min-h-screen px-6 py-8">
          <div className="flex justify-center items-center h-[60vh]">
            <span className="text-lg text-gray-900">Loading product...</span>
          </div>
        </main>
        <ChatWidget />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <main className="bg-white min-h-screen px-6 py-8">
          <div className="text-red-500 text-center mt-8">Error: {error.message}</div>
        </main>
        <ChatWidget />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Navbar />
        <main className="bg-white min-h-screen px-6 py-8">
          <div className="text-center mt-8 text-gray-900">Product not found.</div>
        </main>
        <ChatWidget />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="bg-white min-h-screen">
        <div className="w-full px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Product Images - Left Side */}
            <div className="lg:col-span-3">
              <div className="sticky top-6">
                <div className="flex gap-4">
                  {/* Thumbnail Images - Vertical on Left */}
                  {images.length > 1 && (
                    <div className="flex flex-col gap-2 w-20">
                      {images.map((image: string, index: number) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`w-16 h-16 rounded-lg border-2 overflow-hidden ${
                            selectedImageIndex === index ? 'border-blue-600' : 'border-gray-200'
                          }`}
                        >
                          <img
                            src={image}
                            alt={`${product.title} view ${index + 1}`}
                            className="w-full h-full object-contain bg-gray-50"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {/* Main Image */}
                  <div className="flex-1">
                    <img
                      src={images[selectedImageIndex] || '/placeholder-image.jpg'}
                      alt={product.title}
                      className="w-full h-[600px] object-contain bg-gray-50 rounded-lg border"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Product Details & Purchase Options - Right Side */}
            <div className="lg:col-span-1">
              <div className="space-y-6">
                
                {/* Product Title & Price */}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-3 leading-tight">
                    {product.title}
                  </h1>
                  <div className="text-2xl font-bold text-green-600 mb-2">
                    ${product.price}
                  </div>
                  <div className="text-sm text-gray-600 mb-4">
                    Price when purchased online
                  </div>
                </div>

                {/* Brand & Category */}
                <div className="pb-4 border-b border-gray-200">
                  <div className="text-sm text-gray-600 mb-1">
                    <span className="font-medium">Brand:</span> {product.brand}
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Category:</span> {product.category}
                  </div>
                </div>

                {/* Purchase Options Card */}
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  {/* Quantity Selector */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity:
                    </label>
                    <div className="flex items-center w-fit">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-10 h-10 flex items-center justify-center border-2 border-gray-400 rounded-l-lg bg-white hover:bg-gray-100 text-gray-700 font-bold text-lg"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-16 h-10 text-center border-t-2 border-b-2 border-gray-400 bg-white text-gray-900 font-medium"
                        min="1"
                      />
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-10 h-10 flex items-center justify-center border-2 border-gray-400 rounded-r-lg bg-white hover:bg-gray-100 text-gray-700 font-bold text-lg"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <button className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors mb-4">
                    Add to cart
                  </button>

                  {/* Try on Virtually Button - Only for Clothing */}
                  {product && isClothingItem(product.category) && (
                    <button className="w-full bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors mb-4 flex items-center justify-center gap-2">
                      <span>👗</span>
                      Try on virtually
                    </button>
                  )}

                  {/* Service Features */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-600">🚚</span>
                      <span className="text-gray-700">Free shipping</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-blue-600">📦</span>
                      <span className="text-gray-700">Free 90-day returns</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-blue-600">⭐</span>
                      <span className="text-gray-700">Sold by Walmart</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button className="flex-1 border border-gray-300 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                    Add to list
                  </button>
                  <button className="flex-1 border border-gray-300 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                    Add to registry
                  </button>
                </div>

                {/* Product Description */}
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">About this item</h3>
                  <div className="text-gray-700 text-sm leading-relaxed">
                    {product.description || 'No description available.'}
                  </div>
                </div>

                {/* Product Info */}
                <div className="text-xs text-gray-500 pt-4 border-t border-gray-200">
                  Product added: {new Date(product.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Products Section */}
        {similarProducts.length > 0 && (
          <div className="w-full px-8 py-8 border-t border-gray-200 bg-gray-50">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Popular Items in this category</h2>
              <p className="text-gray-600">Best-selling items that customers love</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {similarProducts.map((product: any) => (
                <Link key={product.id} href={`/products/${product.id}`}>
                  <div className="bg-white rounded-lg p-4 hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-200 group">
                    {/* Product Image */}
                    {product.image && product.image.length > 0 && (
                      <div className="relative overflow-hidden rounded-lg mb-3 bg-gray-50 h-40">
                        <img
                          src={product.image[0]}
                          alt={product.title}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    
                    {/* Product Details */}
                    <div className="space-y-2">
                      <div className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight">
                        {product.title}
                      </div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide">
                        {product.brand}
                      </div>
                      <div className="text-lg font-bold text-green-600">
                        ${product.price}
                      </div>
                      
                      {/* Add to Cart Button */}
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          // Add to cart logic here
                        }}
                        className="w-full bg-blue-600 text-white font-medium py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors text-sm mt-2"
                      >
                        Add to cart
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
      <ChatWidget />
    </>
  );
} 