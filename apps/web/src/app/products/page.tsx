'use client';

import { Navbar } from '@/components/Navbar';
import { gql, useQuery } from '@apollo/client';
import Link from 'next/link';
import { SidebarFilter } from '@/components/SidebarFilter';
import { useMemo, useState, useEffect } from 'react';

const GET_PRODUCTS = gql`
  query Products($limit: Int, $offset: Int) {
    products(limit: $limit, offset: $offset) {
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

export default function ProductsPage() {
  const PAGE_SIZE = 30;
  const [page, setPage] = useState(0);
  const { data, loading, error, refetch } = useQuery(GET_PRODUCTS, {
    variables: { limit: PAGE_SIZE, offset: page * PAGE_SIZE },
    fetchPolicy: 'cache-and-network',
  });

  // Extract unique categories and brands from products
  const categories = useMemo<string[]>(() => {
    if (!data?.products) return [];
    return Array.from(new Set(data.products.map((p: any) => p.category)));
  }, [data]);
  const brands = useMemo<string[]>(() => {
    if (!data?.products) return [];
    return Array.from(new Set(data.products.map((p: any) => p.brand)));
  }, [data]);

  // Filter state
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);

  // Handlers
  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };
  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  // Filter products
  const filteredProducts = useMemo(() => {
    if (!data?.products) return [];
    return data.products.filter((p: any) => {
      const inCategory = selectedCategories.length === 0 || selectedCategories.includes(p.category);
      const inBrand = selectedBrands.length === 0 || selectedBrands.includes(p.brand);
      const inPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
      return inCategory && inBrand && inPrice;
    });
  }, [data, selectedCategories, selectedBrands, priceRange]);

  // Refetch when page changes
  useEffect(() => {
    refetch({ limit: PAGE_SIZE, offset: page * PAGE_SIZE });
  }, [page, refetch]);

  return (
    <>
      <Navbar />
      <main className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-200">
        <SidebarFilter
          categories={categories}
          brands={brands}
          selectedCategories={selectedCategories}
          selectedBrands={selectedBrands}
          priceRange={priceRange}
          toggleCategory={toggleCategory}
          toggleBrand={toggleBrand}
          setPriceRange={setPriceRange}
        />
        <div className="flex-1 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-8">
            Browse Products
          </h1>
          {loading && <p>Loading...</p>}
          {error && <p className="text-red-500">Error: {error.message}</p>}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product: any) => (
              <Link href={`/products/${product.id}`} key={product.id}>
                <div
                  className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200 cursor-pointer hover:shadow-lg transition flex flex-col h-full"
                >
                  {product.image && product.image.length > 0 && (
                    <img
                      src={product.image[0]}
                      alt={product.title}
                      className="w-full h-56 object-contain bg-gray-100 border-b border-gray-200"
                    />
                  )}
                  <div className="p-4 flex flex-col flex-1">
                    <div className="font-semibold text-lg text-gray-900 mb-1 line-clamp-2">{product.title}</div>
                    <div className="text-sm text-gray-600 mb-1">{product.brand}</div>
                    <div className="text-lg font-bold text-blue-600 mb-1">${product.price}</div>
                    <div className="text-xs text-gray-500 mb-1">{product.category}</div>
                    <div className="text-xs text-gray-400 mt-auto line-clamp-2">{product.description}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="flex justify-center items-center gap-4 mt-10">
            <button
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md transition disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              Previous
            </button>
            <span className="font-semibold text-lg">Page {page + 1}</span>
            <button
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md transition disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
              onClick={() => setPage((p) => p + 1)}
              disabled={data?.products?.length < PAGE_SIZE}
            >
              Next
            </button>
          </div>
        </div>
      </main>
    </>
  );
} 