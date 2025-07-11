'use client';

import { Navbar } from '@/components/Navbar';
import { ChatWidget } from '@/components/ChatWidget';
import { gql, useQuery } from '@apollo/client';
import Link from 'next/link';
import { DEPARTMENT_MAPPING } from '@/utils/departments';

// Product type interface
interface Product {
  id: string;
  title: string;
  price: number;
  brand: string;
  category: string;
  image: string[];
}

// GraphQL queries for homepage data
const GET_FEATURED_PRODUCTS = gql`
  query FeaturedProducts {
    products(limit: 12) {
      id
      title
      price
      brand
      category
      image
    }
  }
`;

const GET_PRODUCTS_BY_DEPARTMENT = gql`
  query ProductsByDepartment($category: String!) {
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

// Component for featured product tile
function FeaturedProductTile({ product, className = "" }: { product: Product, className?: string }) {
  return (
    <Link href={`/products/${product.id}`}>
      <div className={`bg-white rounded-lg p-3 hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-100 group ${className}`}>
        {product.image && product.image.length > 0 && (
          <div className="relative overflow-hidden rounded-lg mb-2 bg-gray-50">
            <img
              src={product.image[0]}
              alt={product.title}
              className="w-full h-24 object-contain group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        <div className="text-sm font-semibold text-[#002264] mb-1 line-clamp-2 leading-tight">{product.title}</div>
        <div className="text-xs text-gray-500 mb-1 uppercase tracking-wide">{product.brand}</div>
        <div className="text-lg font-bold text-green-600">${product.price}</div>
      </div>
    </Link>
  );
}

// Component for department showcase
function DepartmentShowcase({ title, products, bgGradient = "from-blue-50 to-blue-100" }: { title: string, products: Product[], bgGradient?: string }) {
  if (!products || products.length === 0) return null;
  
  const featuredProduct = products[0];
  const otherProducts = products.slice(1, 7); // Show up to 6 other products instead of 3

  return (
    <div className={`bg-gradient-to-br ${bgGradient} rounded-xl p-6 shadow-md border border-white/50`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-[#002264]">{title}</h3>
        <Link href={`/products?department=${encodeURIComponent(title)}`}>
          <button className="text-sm font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1">
            Shop all <span>→</span>
          </button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Main featured product */}
        <Link href={`/products/${featuredProduct.id}`}>
          <div className="bg-white rounded-lg p-4 hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-100 group">
            {featuredProduct.image && featuredProduct.image.length > 0 && (
              <div className="relative overflow-hidden rounded-lg mb-3 bg-gray-50">
                <img
                  src={featuredProduct.image[0]}
                  alt={featuredProduct.title}
                  className="w-full h-32 object-contain group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}
            <div className="text-sm font-semibold text-[#002264] mb-2 line-clamp-2">{featuredProduct.title}</div>
            <div className="text-lg font-bold text-green-600">${featuredProduct.price}</div>
          </div>
        </Link>
        
        {/* Grid of other products - now shows more */}
        <div className="grid grid-cols-2 gap-3">
          {otherProducts.map((product: Product) => (
            <Link key={product.id} href={`/products/${product.id}`}>
              <div className="bg-white rounded-lg p-3 hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-100 group">
                {product.image && product.image.length > 0 && (
                  <div className="relative overflow-hidden rounded mb-2 bg-gray-50">
                    <img
                      src={product.image[0]}
                      alt={product.title}
                      className="w-full h-16 object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="text-xs font-semibold text-[#002264] truncate mb-1">{product.title}</div>
                <div className="text-sm font-bold text-green-600">${product.price}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { data: featuredData, loading: featuredLoading } = useQuery(GET_FEATURED_PRODUCTS);
  
  // Get products for different departments
  const { data: womenData } = useQuery(GET_PRODUCTS_BY_DEPARTMENT, { 
    variables: { category: "Women's Clothing" } 
  });
  const { data: menData } = useQuery(GET_PRODUCTS_BY_DEPARTMENT, { 
    variables: { category: "Men's Clothing" } 
  });
  const { data: homeGardenData } = useQuery(GET_PRODUCTS_BY_DEPARTMENT, { 
    variables: { category: "Home" } 
  });

  // Get additional products for Home & Garden to ensure we have enough
  const { data: additionalHomeData } = useQuery(GET_PRODUCTS_BY_DEPARTMENT, { 
    variables: { category: "Home Décor" } 
  });

  // Group products by department for showcase
  const departmentProducts = {
    "Women's Clothing": womenData?.productsByCategory || [],
    "Men's Clothing": menData?.productsByCategory || [],
    "Home & Garden": [
      ...(homeGardenData?.productsByCategory || []),
      ...(additionalHomeData?.productsByCategory || [])
    ].slice(0, 8) // Combine and limit to 8 products
  };

  if (featuredLoading) {
    return (
      <>
        <Navbar />
        <main className="flex-1 bg-gradient-to-br from-gray-50 via-white to-blue-50 min-h-screen px-6 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                <span className="text-lg font-semibold text-[#002264]">Loading amazing products...</span>
              </div>
            </div>
          </div>
        </main>
        <ChatWidget />
      </>
    );
  }

  const featuredProducts = featuredData?.products || [];

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-gradient-to-br from-gray-50 via-white to-blue-50 min-h-screen px-6 py-6">
        {/* Hero Section with Featured Products */}
        <div className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Main Hero Tile - Walmart Style */}
            <div 
              className="lg:col-span-2 rounded-xl p-8 text-white relative overflow-hidden min-h-[300px] flex items-center"
              style={{
                background: `linear-gradient(135deg, rgba(227, 120, 75, 0.9), rgba(227, 120, 75, 0.7)), url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            >
              {/* Content positioned like Walmart's layout */}
              <div className="relative z-10 max-w-md">
                <h1 className="text-4xl font-bold mb-4 leading-tight">Discover Amazing Products</h1>
                <p className="text-xl mb-6 opacity-95">Shop thousands of items with great prices and fast delivery</p>
                <Link href="/products">
                  <button className="bg-white text-orange-600 font-bold px-8 py-4 rounded-full hover:bg-gray-100 transition text-lg shadow-lg">
                    Shop Deals
                  </button>
                </Link>
              </div>
            </div>
            
            {/* Featured Product Highlight */}
            {featuredProducts.length > 0 && (
              <div className="bg-gradient-to-br from-[#5fc3f5] to-[#5fc3f5]/80 rounded-xl p-6 shadow-md border border-white/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-[#002264]">Featured Today</h3>
                  <span className="bg-white text-orange-600 text-xs font-semibold px-2 py-1 rounded-full shadow-sm">HOT</span>
                </div>
                <FeaturedProductTile product={featuredProducts[0]} />
              </div>
            )}
          </div>
        </div>

        {/* Department Showcases */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <DepartmentShowcase 
            title="Women's Clothing" 
            products={departmentProducts["Women's Clothing"]} 
            bgGradient="from-[#5fc3f5] to-[#5fc3f5]/80"
          />
          <DepartmentShowcase 
            title="Men's Clothing" 
            products={departmentProducts["Men's Clothing"]} 
            bgGradient="from-[#5fc3f5] to-[#5fc3f5]/80"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <DepartmentShowcase 
            title="Home & Garden" 
            products={departmentProducts["Home & Garden"]} 
            bgGradient="from-[#5fc3f5] to-[#5fc3f5]/80"
          />
          
          {/* Quick Shop */}
          <div className="bg-gradient-to-br from-[#5fc3f5] to-[#5fc3f5]/80 rounded-xl p-6 shadow-md border border-white/50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-[#002264]">Quick Shop</h3>
              <span className="text-white text-sm font-bold bg-white/20 px-3 py-1 rounded-full">Browse All</span>
            </div>
            <div className="space-y-8">
              {Object.keys(DEPARTMENT_MAPPING).slice(0, 5).map((dept) => (
                <Link key={dept} href={`/products?department=${encodeURIComponent(dept)}`}>
                  <div className="bg-white rounded-lg p-3 hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 group">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-[#002264] group-hover:text-blue-600 transition-colors text-base">{dept}</span>
                        <div className="text-xs text-gray-500 mt-1">Shop {dept.toLowerCase()} collection</div>
                      </div>
                      <span className="text-gray-400 group-hover:text-blue-600 transition-colors text-lg">→</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            
            <div className="mt-6 text-center">
              <Link href="/products">
                <button className="bg-white text-[#002264] font-bold px-6 py-2 rounded-full hover:bg-gray-50 transition-colors shadow-lg text-sm">
                  Shop All Departments →
                </button>
              </Link>
            </div>
          </div>

          {/* Trending Products */}
          {featuredProducts.length > 3 && (
            <div className="bg-gradient-to-br from-[#5fc3f5] to-[#5fc3f5]/80 rounded-xl p-6 shadow-md border border-white/50">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-[#002264]">Trending Now</h3>
                <span className="bg-white text-red-600 text-xs font-semibold px-3 py-1 rounded-full shadow-sm">🔥 HOT DEALS</span>
              </div>
              
              {/* Compact Product Grid */}
              <div className="grid grid-cols-3 gap-3">
                {featuredProducts.slice(1, 4).map((product: Product) => (
                  <Link key={product.id} href={`/products/${product.id}`}>
                    <div className="bg-white rounded-lg p-3 hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 group relative">
                      {product.image && product.image.length > 0 && (
                        <div className="relative overflow-hidden rounded-lg mb-2 bg-gray-50 h-24">
                          <img
                            src={product.image[0]}
                            alt={product.title}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                          />
                          {/* Add to Cart Icon Overlay */}
                          <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <button 
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                // Add to cart logic here
                              }}
                              className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors shadow-lg text-xs"
                              title="Add to cart"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      )}
                      <div className="space-y-1">
                        <div className="text-xs font-bold text-[#002264] line-clamp-2 leading-tight">{product.title}</div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide">{product.brand}</div>
                        <div className="text-sm font-bold text-green-600">${product.price}</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              
              <div className="mt-4 text-center">
                <Link href="/products">
                  <button className="bg-white text-[#002264] font-bold px-4 py-2 rounded-full hover:bg-gray-50 transition-colors shadow-lg text-xs">
                    View All Trending Products →
                  </button>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Recently Added Section */}
        {featuredProducts.length > 0 && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 mb-6 border border-white/50 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-[#002264] mb-2">Recently Added</h2>
                  <p className="text-[#002264]/70">Check out our newest arrivals and best deals</p>
                </div>
                <Link href="/products">
                  <button className="bg-orange-600 text-white font-bold px-6 py-3 rounded-full hover:bg-orange-700 transition-colors shadow-lg">
                    View All Products →
                  </button>
                </Link>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {featuredProducts.slice(0, 6).map((product: Product) => (
                <FeaturedProductTile key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </main>
      <ChatWidget />
    </>
  );
}
