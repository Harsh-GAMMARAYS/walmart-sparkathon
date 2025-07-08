'use client';

import { Navbar } from '@/components/Navbar';
import { gql, useQuery } from '@apollo/client';

const GET_PRODUCTS = gql`
  query {
    products {
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
  const { data, loading, error } = useQuery(GET_PRODUCTS);

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-8">
            Browse Products
          </h1>
          {loading && <p>Loading...</p>}
          {error && <p className="text-red-500">Error: {error.message}</p>}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data?.products?.map((product: any) => (
              <div
                key={product.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700"
              >
                {product.image && (
                  <img
                    src={product.image}
                    alt={product.title}
                    className="aspect-w-1 aspect-h-1 w-full object-cover bg-gray-200 dark:bg-gray-700"
                  />
                )}
                <div className="p-4">
                  <div className="font-semibold text-lg text-gray-900 dark:text-white mb-2">{product.title}</div>
                  <div className="text-gray-600 dark:text-gray-300 mb-1">{product.brand}</div>
                  <div className="text-blue-700 font-bold mb-1">${product.price}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">{product.category}</div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 mt-2 line-clamp-2">{product.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
} 