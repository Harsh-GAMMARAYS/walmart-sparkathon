'use client';

import { useParams, useRouter } from 'next/navigation';
import { gql, useQuery } from '@apollo/client';
import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { ChatWidget } from '@/components/ChatWidget';
import { VirtualTryOnModal } from '@/components/VirtualTryOnModal';
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
  const router = useRouter();
  const { data, loading, error } = useQuery(GET_PRODUCT, { variables: { id } });
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showVirtualTryOn, setShowVirtualTryOn] = useState(false);
  const { user, addToCart, trackProductView, isLoading: authLoading } = useAuth();

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

  // Track product view
  useEffect(() => {
    if (id && typeof id === 'string') {
      trackProductView(id);
    }
  }, [id]); // Remove trackProductView from dependencies to avoid infinite loop

  const handleAddToCart = () => {
    if (authLoading) return;

    if (!user) {
      // Redirect to sign in with return URL
      const returnUrl = encodeURIComponent(`/products/${id}`);
      router.push(`/auth/signin?returnTo=${returnUrl}`);
      return;
    }

    if (product) {
      // Add product with quantity
      for (let i = 0; i < quantity; i++) {
        addToCart(product);
      }
      // Optional: Show success message
      alert(`Added ${quantity} ${quantity === 1 ? 'item' : 'items'} to cart!`);
    }
  };

  const handleCreateAccount = () => {
    if (authLoading) return;
    
    const returnUrl = encodeURIComponent(`/products/${id}`);
    router.push(`/auth/signup?returnTo=${returnUrl}`);
  };

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
                  <button 
                    onClick={handleAddToCart}
                    disabled={authLoading}
                    className={`w-full font-bold py-3 px-4 rounded-lg transition-colors mb-4 flex items-center justify-center gap-2 ${
                      authLoading 
                        ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {authLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Loading...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13v6a1 1 0 001 1h9a1 1 0 001-1v-6"/>
                          <circle cx="9" cy="21" r="1"/>
                          <circle cx="20" cy="21" r="1"/>
                        </svg>
                        {user ? 'Add to cart' : 'Sign in to Add to Cart'}
                      </>
                    )}
                  </button>
                  
                  {!user && !authLoading && (
                    <div className="text-center mb-4">
                      <p className="text-sm text-gray-600 mb-2">
                        <button 
                          onClick={handleCreateAccount}
                          className="text-blue-600 hover:text-blue-700 underline font-medium"
                        >
                          Create an account
                        </button> to save items and checkout faster
                      </p>
                    </div>
                  )}

                  {/* Try on Virtually Button - Only for specific product */}
                  {product && product.id === '68541f4acdb26551257a6c37' && (
                    <button 
                      onClick={() => setShowVirtualTryOn(true)}
                      className="w-full bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors mb-4 flex items-center justify-center gap-2"
                    >
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
                          
                          if (authLoading) return;
                          
                          if (!user) {
                            const returnUrl = encodeURIComponent(`/products/${product.id}`);
                            router.push(`/auth/signin?returnTo=${returnUrl}`);
                          } else {
                            addToCart(product);
                            alert('Added to cart!');
                          }
                        }}
                        disabled={authLoading}
                        className={`w-full font-medium py-2 px-3 rounded-lg transition-colors text-sm mt-2 ${
                          authLoading 
                            ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {authLoading ? 'Loading...' : (user ? 'Add to cart' : 'Sign in to add')}
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
      
      {/* Virtual Try-On Modal */}
      <VirtualTryOnModal 
        isOpen={showVirtualTryOn}
        onClose={() => setShowVirtualTryOn(false)}
        productImage={images[selectedImageIndex] || '/placeholder-image.jpg'}
        productTitle={product?.title || 'Product'}
      />
    </>
  );
} 