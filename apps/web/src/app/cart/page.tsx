'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { gql, useQuery } from '@apollo/client';

const GET_PRODUCT = gql`
  query GetProduct($id: ID!) {
    product(id: $id) {
      id
      title
      price
      brand
      category
      image
    }
  }
`;

// Component for displaying recently viewed products with thumbnails
function RecentlyViewedProduct({ productId }: { productId: string }) {
  const { data, loading, error } = useQuery(GET_PRODUCT, {
    variables: { id: productId }
  });

  if (loading) {
    return (
      <div className="flex items-center space-x-3 p-2">
        <div className="w-16 h-16 bg-gray-200 rounded-lg animate-pulse"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error || !data?.product) {
    return null;
  }

  const product = data.product;

  return (
    <Link href={`/products/${productId}`} className="block">
      <div className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
        <div className="flex-shrink-0">
          <img
            src={product.image?.[0] || '/placeholder-image.jpg'}
            alt={product.title}
            className="w-16 h-16 object-contain bg-gray-50 rounded-lg border"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
            {product.title}
          </div>
          <div className="text-xs text-gray-500 mb-1">
            {product.brand}
          </div>
          <div className="text-sm font-bold text-green-600">
            ${product.price}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function CartPage() {
  const { user, getSessionData, removeFromCart, updateCartQuantity, cartTotal, cartItemsCount } = useAuth();
  const router = useRouter();
  const sessionData = getSessionData();
  const cartItems = sessionData.cart;

  // Redirect to sign in if trying to checkout without being logged in
  const handleCheckout = () => {
    if (!user) {
      router.push('/auth/signin?returnTo=/cart');
      return;
    }
    // TODO: Implement checkout flow
    alert('Checkout functionality coming soon!');
  };

  if (cartItems.length === 0) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4">
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="mb-4">
                <svg className="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
                  <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13v6a1 1 0 001 1h9a1 1 0 001-1v-6"/>
                  <circle cx="9" cy="21" r="1"/>
                  <circle cx="20" cy="21" r="1"/>
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
              <p className="text-gray-600 mb-6">Add some products to get started!</p>
              <Link 
                href="/products"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-block"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md">
                <div className="p-6 border-b border-gray-200">
                  <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
                  <p className="text-gray-600">{cartItemsCount} {cartItemsCount === 1 ? 'item' : 'items'}</p>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {cartItems.map((item) => (
                    <div key={item.id} className="p-6">
                      <div className="flex items-start space-x-4">
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          <img
                            src={item.image || '/placeholder-image.jpg'}
                            alt={item.title}
                            className="w-24 h-24 object-contain bg-gray-50 rounded-lg border"
                          />
                        </div>
                        
                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <Link href={`/products/${item.id}`} className="text-lg font-medium text-gray-900 hover:text-blue-600 line-clamp-2">
                            {item.title}
                          </Link>
                          <p className="text-sm text-gray-500 mt-1">
                            Added {new Date(item.addedAt).toLocaleDateString()}
                          </p>
                          <div className="mt-4 flex items-center space-x-4">
                            {/* Quantity Controls */}
                            <div className="flex items-center border border-gray-300 rounded-lg">
                              <button
                                onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                                className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 text-gray-800 disabled:text-gray-400"
                                disabled={item.quantity <= 1}
                              >
                                −
                              </button>
                              <span className="w-12 text-center text-sm font-medium text-gray-900">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                                className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 text-gray-800"
                              >
                                +
                              </button>
                            </div>
                            
                            {/* Remove Button */}
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-red-600 hover:text-red-700 text-sm font-medium"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                        
                        {/* Price */}
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900">
                            ${(item.price * item.quantity).toFixed(2)}
                          </div>
                          {item.quantity > 1 && (
                            <div className="text-sm text-gray-500">
                              ${item.price.toFixed(2)} each
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Continue Shopping */}
                <div className="p-6 border-t border-gray-200">
                  <Link 
                    href="/products"
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    ← Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal ({cartItemsCount} {cartItemsCount === 1 ? 'item' : 'items'})</span>
                    <span className="font-medium text-gray-900">${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium text-green-600">FREE</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium text-gray-900">${(cartTotal * 0.08).toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-gray-900">Total</span>
                      <span className="text-gray-900">${(cartTotal * 1.08).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                {/* User Status */}
                {!user && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700 mb-2">
                      Sign in to save your cart and checkout faster
                    </p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => router.push('/auth/signin?returnTo=/cart')}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Sign In
                      </button>
                      <span className="text-gray-400 text-sm">|</span>
                      <button
                        onClick={() => router.push('/auth/signup?returnTo=/cart')}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Create Account
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors mb-4"
                >
                  {user ? 'Proceed to Checkout' : 'Sign in to Checkout'}
                </button>
                
                {/* Security Notice */}
                <div className="text-xs text-gray-500 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <svg className="w-4 h-4 text-green-600 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    Secure Checkout
                  </div>
                  <p>Your payment information is protected</p>
                </div>
              </div>
              
              {/* Recently Viewed */}
              {sessionData.viewedProducts.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Recently Viewed</h3>
                  <div className="space-y-4">
                    {sessionData.viewedProducts.slice(0, 3).map((productId) => (
                      <RecentlyViewedProduct key={productId} productId={productId} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
} 