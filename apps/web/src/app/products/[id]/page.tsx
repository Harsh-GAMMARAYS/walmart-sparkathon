'use client';

import { useParams } from 'next/navigation';
import { gql, useQuery } from '@apollo/client';
import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';

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

export default function ProductDetailPage() {
  const { id } = useParams();
  const { data, loading, error } = useQuery(GET_PRODUCT, { variables: { id } });
  const [imgIdx, setImgIdx] = useState(0);
  const [fade, setFade] = useState(true);

  // Always define images, even if data is not ready yet
  const images = data?.product?.image || [];
  const hasMultipleImages = images.length > 1;

  // Prefetch all images
  useEffect(() => {
    images.forEach((url: string) => {
      const img = new window.Image();
      img.src = url;
    });
  }, [images]);

  if (loading) return <div className="flex justify-center items-center h-[60vh]"><span className="text-lg">Loading...</span></div>;
  if (error) return <div className="text-red-500 text-center mt-8">Error: {error.message}</div>;

  const product = data?.product;
  if (!product) return <div className="text-center mt-8">Product not found.</div>;

  const handlePrev = () => {
    setFade(false);
    setTimeout(() => {
      setImgIdx((prev) => (prev === 0 ? images.length - 1 : prev - 1));
      setFade(true);
    }, 150);
  };
  const handleNext = () => {
    setFade(false);
    setTimeout(() => {
      setImgIdx((prev) => (prev === images.length - 1 ? 0 : prev + 1));
      setFade(true);
    }, 150);
  };

  return (
    <>
      <Navbar />
      <main className="flex-1 min-h-screen bg-gradient-to-br from-gray-50 to-gray-200">
        <div className="min-h-screen flex items-center justify-center py-8 px-2">
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-6 text-center leading-tight">{product.title}</h1>
            {images.length > 0 && (
              <div className="relative flex flex-col items-center mb-8 w-full">
                <div className="w-full flex justify-center">
                  <img
                    key={imgIdx}
                    src={images[imgIdx]}
                    alt={product.title}
                    className={`max-w-[400px] max-h-[400px] rounded-xl border bg-gray-100 shadow transition-opacity duration-300 ${fade ? 'opacity-100' : 'opacity-0'}`}
                    style={{ objectFit: 'contain' }}
                  />
                </div>
                {hasMultipleImages && (
                  <div className="flex gap-2 mt-4 items-center">
                    <button
                      onClick={handlePrev}
                      className="w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-full text-2xl font-bold shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition disabled:bg-gray-300 disabled:text-gray-400"
                      aria-label="Previous image"
                    >
                      &#8592;
                    </button>
                    <div className="flex gap-1">
                      {images.map((_: string, idx: number) => (
                        <span
                          key={idx}
                          className={`inline-block w-2 h-2 rounded-full ${idx === imgIdx ? 'bg-blue-600' : 'bg-gray-300'}`}
                        />
                      ))}
                    </div>
                    <button
                      onClick={handleNext}
                      className="w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-full text-2xl font-bold shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition disabled:bg-gray-300 disabled:text-gray-400"
                      aria-label="Next image"
                    >
                      &#8594;
                    </button>
                  </div>
                )}
              </div>
            )}
            <div className="w-full flex flex-col md:flex-row md:justify-between gap-6 mb-6">
              <div className="flex-1">
                <div className="mb-2 text-lg"><span className="font-semibold text-gray-700">Brand:</span> <span className="text-gray-900">{product.brand}</span></div>
                <div className="mb-2 text-lg"><span className="font-semibold text-gray-700">Category:</span> <span className="text-gray-900">{product.category}</span></div>
              </div>
              <div className="flex items-center">
                <span className="text-2xl font-bold text-blue-700 mr-2">${product.price}</span>
              </div>
            </div>
            <div className="w-full mb-6">
              <div className="font-semibold text-gray-700 mb-1">Description:</div>
              <div className="text-gray-800 text-base leading-relaxed whitespace-pre-line">{product.description}</div>
            </div>
            <div className="w-full text-xs text-gray-400 text-right">Added: {new Date(product.createdAt).toLocaleString()}</div>
          </div>
        </div>
      </main>
    </>
  );
} 