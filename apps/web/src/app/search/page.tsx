"use client";

import { useSearchParams } from "next/navigation";
import { gql, useQuery } from "@apollo/client";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { SidebarFilter } from '@/components/SidebarFilter';
import { useMemo, useState } from 'react';
import { getDepartmentsFromCategories, getCategoriesForDepartment } from '@/utils/departments';

const SEARCH_PRODUCTS = gql`
  query SearchProducts($query: String!) {
    searchProducts(query: $query) {
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

export default function SearchPage() {
  const params = useSearchParams();
  const query = params.get("query") || "";
  const { data, loading, error } = useQuery(SEARCH_PRODUCTS, {
    variables: { query },
    skip: !query,
  });

  // Extract unique categories and brands from search results
  const categories = useMemo<string[]>(() => {
    if (!data?.searchProducts) return [];
    return Array.from(new Set(data.searchProducts.map((p: any) => p.category)));
  }, [data]);
  
  const brands = useMemo<string[]>(() => {
    if (!data?.searchProducts) return [];
    return Array.from(new Set(data.searchProducts.map((p: any) => p.brand)));
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
    if (!data?.searchProducts) return [];
    return data.searchProducts.filter((p: any) => {
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
          <h1 className="text-3xl font-bold tracking-tight text-blue-700 dark:text-blue-400 mb-8">
            Search Results for "{query}"
          </h1>
          {loading && <p>Loading...</p>}
          {error && <p className="text-red-500">Error: {error.message}</p>}
          {!loading && data?.searchProducts?.length === 0 && (
            <p className="text-gray-500 text-lg">No products found matching your search.</p>
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
                    <div className="text-xs text-gray-400 mt-auto">{product.description}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </>
  );
} 