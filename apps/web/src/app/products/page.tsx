'use client';

import { Navbar } from '@/components/Navbar';
import { gql, useQuery } from '@apollo/client';
import Link from 'next/link';
import { SidebarFilter } from '@/components/SidebarFilter';
import { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { getDepartmentsFromCategories, getCategoriesForDepartment } from '@/utils/departments';

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
  const searchParams = useSearchParams();
  
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

  // Extract departments from categories
  const departments = useMemo<string[]>(() => {
    return getDepartmentsFromCategories(categories);
  }, [categories]);

  // Filter state
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);

  // Initialize filters from URL parameters
  useEffect(() => {
    const departmentParam = searchParams.get('department');
    if (departmentParam && departments.includes(departmentParam)) {
      setSelectedDepartments([departmentParam]);
    }
  }, [searchParams, departments]);

  // Handlers
  const toggleDepartment = (dept: string) => {
    setSelectedDepartments((prev) => {
      const newSelected = prev.includes(dept) ? prev.filter((d) => d !== dept) : [...prev, dept];
      
      // When departments change, clear category selections to avoid conflicts
      if (newSelected.length !== prev.length) {
        setSelectedCategories([]);
      }
      
      return newSelected;
    });
  };

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

  // Get categories that should be shown based on selected departments
  const visibleCategories = useMemo(() => {
    if (selectedDepartments.length === 0) {
      return categories;
    }
    
    const departmentCategories = new Set<string>();
    selectedDepartments.forEach(dept => {
      const deptCategories = getCategoriesForDepartment(dept, categories);
      deptCategories.forEach(cat => departmentCategories.add(cat));
    });
    
    return Array.from(departmentCategories);
  }, [selectedDepartments, categories]);

  // Filter products
  const filteredProducts = useMemo(() => {
    if (!data?.products) return [];
    
    return data.products.filter((p: any) => {
      // Department filtering
      const matchesDepartment = selectedDepartments.length === 0 || 
        selectedDepartments.some(dept => {
          const deptCategories = getCategoriesForDepartment(dept, categories);
          return deptCategories.includes(p.category);
        });

      // Category filtering
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(p.category);
      
      // Brand filtering
      const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(p.brand);
      
      // Price filtering
      const matchesPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
      
      return matchesDepartment && matchesCategory && matchesBrand && matchesPrice;
    });
  }, [data, selectedDepartments, selectedCategories, selectedBrands, priceRange, categories]);

  // Refetch when page changes
  useEffect(() => {
    refetch({ limit: PAGE_SIZE, offset: page * PAGE_SIZE });
  }, [page, refetch]);

  // Clear filters function
  const clearAllFilters = () => {
    setSelectedDepartments([]);
    setSelectedCategories([]);
    setSelectedBrands([]);
    setPriceRange([0, 10000]);
    // Update URL to remove parameters
    window.history.pushState({}, '', '/products');
  };

  const hasActiveFilters = selectedDepartments.length > 0 || selectedCategories.length > 0 || selectedBrands.length > 0 || priceRange[0] > 0 || priceRange[1] < 10000;

  return (
    <>
      <Navbar />
      <main className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-200">
        <SidebarFilter
          departments={departments}
          categories={visibleCategories}
          brands={brands}
          selectedDepartments={selectedDepartments}
          selectedCategories={selectedCategories}
          selectedBrands={selectedBrands}
          priceRange={priceRange}
          toggleDepartment={toggleDepartment}
          toggleCategory={toggleCategory}
          toggleBrand={toggleBrand}
          setPriceRange={setPriceRange}
        />
        <div className="flex-1 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-black">
                Browse Products
                {selectedDepartments.length > 0 && (
                  <span className="text-2xl font-normal text-blue-600 block mt-1">
                    {selectedDepartments.join(', ')}
                  </span>
                )}
              </h1>
              <p className="text-gray-800 mt-2">
                {filteredProducts.length} products found
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="ml-4 text-blue-600 hover:text-blue-800 underline text-sm"
                  >
                    Clear all filters
                  </button>
                )}
              </p>
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="mb-6 flex flex-wrap gap-2">
              {selectedDepartments.map(dept => (
                <span key={dept} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  Dept: {dept}
                  <button onClick={() => toggleDepartment(dept)} className="ml-1 text-blue-600 hover:text-blue-800">×</button>
                </span>
              ))}
              {selectedCategories.map(cat => (
                <span key={cat} className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  {cat}
                  <button onClick={() => toggleCategory(cat)} className="ml-1 text-green-600 hover:text-green-800">×</button>
                </span>
              ))}
              {selectedBrands.map(brand => (
                <span key={brand} className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                  {brand}
                  <button onClick={() => toggleBrand(brand)} className="ml-1 text-purple-600 hover:text-purple-800">×</button>
                </span>
              ))}
              {(priceRange[0] > 0 || priceRange[1] < 10000) && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                  ${priceRange[0]} - ${priceRange[1]}
                  <button onClick={() => setPriceRange([0, 10000])} className="ml-1 text-yellow-600 hover:text-yellow-800">×</button>
                </span>
              )}
            </div>
          )}

          {loading && <div className="text-center py-8"><span className="text-lg text-black">Loading products...</span></div>}
          {error && <div className="text-red-500 text-center py-8">Error: {error.message}</div>}
          
          {!loading && filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-black mb-2">No products found</h3>
              <p className="text-gray-800 mb-4">Try adjusting your filters to see more results.</p>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product: any) => (
              <Link href={`/products/${product.id}`} key={product.id}>
                <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200 cursor-pointer hover:shadow-lg transition flex flex-col h-full">
                  {product.image && product.image.length > 0 && (
                    <img
                      src={product.image[0]}
                      alt={product.title}
                      className="w-full h-56 object-contain bg-gray-100 border-b border-gray-200"
                    />
                  )}
                  <div className="p-4 flex flex-col flex-1">
                    <div className="font-semibold text-lg text-gray-900 mb-1">{product.title}</div>
                    <div className="text-sm text-gray-600 mb-1">{product.brand}</div>
                    <div className="text-lg font-bold text-blue-600 mb-1">${product.price}</div>
                    <div className="text-xs text-gray-500 mb-1">{product.category}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
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