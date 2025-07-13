'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  address?: string;
  phone?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  sessionId: string;
}

export interface SessionData {
  cart: CartItem[];
  viewedProducts: string[];
  searchHistory: string[];
  lastActivity: string;
}

export interface CartItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
  addedAt: string;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, address?: string, phone?: string) => Promise<boolean>;
  logout: () => void;
  addToCart: (product: any) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  trackProductView: (productId: string) => void;
  trackSearch: (query: string) => void;
  getSessionData: () => SessionData;
  resetCartQuantities: () => void;
  cartItemsCount: number;
  cartTotal: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Session Management
const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const getStoredSessionId = (): string => {
  if (typeof window === 'undefined') return generateSessionId();
  
  let sessionId = localStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem('sessionId', sessionId);
  }
  return sessionId;
};

const getStoredSessionData = (sessionId: string): SessionData => {
  if (typeof window === 'undefined') {
    return { cart: [], viewedProducts: [], searchHistory: [], lastActivity: new Date().toISOString() };
  }
  
  const stored = localStorage.getItem(`sessionData_${sessionId}`);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error('Error parsing session data:', error);
    }
  }
  
  return { cart: [], viewedProducts: [], searchHistory: [], lastActivity: new Date().toISOString() };
};

const saveSessionData = (sessionId: string, data: SessionData) => {
  if (typeof window === 'undefined') return;
  
  data.lastActivity = new Date().toISOString();
  localStorage.setItem(`sessionData_${sessionId}`, JSON.stringify(data));
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    sessionId: ''
  });
  
  const [sessionData, setSessionData] = useState<SessionData>({
    cart: [],
    viewedProducts: [],
    searchHistory: [],
    lastActivity: new Date().toISOString()
  });

  const fetchUserActivity = async (token: string) => {
    // Fetch user's stored activity data from backend
    try {
      const response = await fetch('http://localhost:4000/user/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update frontend session state with user's stored data
        if (data.user && data.user.activity) {
          // Clean up any inflated quantities before setting the data
          const cleanedCart = (data.user.activity.cart || []).map((item: any) => ({
            ...item,
            quantity: item.quantity > 10 ? 1 : item.quantity // Reset quantities over 10 to 1
          }));
          
          setSessionData({
            cart: cleanedCart,
            viewedProducts: data.user.activity.viewedProducts || [],
            searchHistory: data.user.activity.searchHistory || [],
            lastActivity: data.user.activity.lastActivity || new Date().toISOString()
          });
        }
      }
    } catch (error) {
      console.error('Fetch user activity error:', error);
    }
  };

  // Initialize session
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const sessionId = getStoredSessionId();
    const storedSessionData = getStoredSessionData(sessionId);
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('authUser');

    setAuthState(prev => ({
      ...prev,
      sessionId,
      token: storedToken,
      user: storedUser ? JSON.parse(storedUser) : null,
      isLoading: false
    }));
    
    setSessionData(storedSessionData);

    // If user is already logged in, fetch their activity data from backend
    if (storedToken && storedUser) {
      fetchUserActivity(storedToken);
    }
  }, []);

  // Save session data whenever it changes
  useEffect(() => {
    if (authState.sessionId) {
      saveSessionData(authState.sessionId, sessionData);
    }
  }, [sessionData, authState.sessionId]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:4000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const data = await response.json();
        const user: User = {
          id: data.user.id || 'temp-id',
          name: data.user.name,
          email: data.user.email,
          address: data.user.address,
          phone: data.user.phone
        };

        // Store auth data
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('authUser', JSON.stringify(user));
        
        setAuthState(prev => ({
          ...prev,
          user,
          token: data.token
        }));

        // Migrate session data to user account (this already loads the merged cart)
        await migrateSessionToUser(data.token, authState.sessionId, sessionData);
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (name: string, email: string, password: string, address?: string, phone?: string): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:4000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, address, phone })
      });

      if (response.ok) {
        const data = await response.json();
        const user: User = {
          id: data.user.id || 'temp-id',
          name: data.user.name,
          email: data.user.email,
          address: data.user.address,
          phone: data.user.phone
        };

        // Store auth data
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('authUser', JSON.stringify(user));
        
        setAuthState(prev => ({
          ...prev,
          user,
          token: data.token
        }));

        // Migrate session data to user account (this already loads the merged cart)
        await migrateSessionToUser(data.token, authState.sessionId, sessionData);
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Register error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint
      if (authState.token) {
        await fetch('http://localhost:4000/auth/logout', {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${authState.token}`,
            'Content-Type': 'application/json' 
          }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    }

    // Note: We don't clear the user's chat history on logout
    // so it can be restored when they log back in
    // The chat interface will handle showing guest mode properly

    // Clear auth data
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    
    setAuthState(prev => ({
      ...prev,
      user: null,
      token: null
    }));

    // Reset session data but keep session ID for guest shopping
    setSessionData({
      cart: [],
      viewedProducts: [],
      searchHistory: [],
      lastActivity: new Date().toISOString()
    });
  };

  const migrateSessionToUser = async (token: string, currentSessionId: string, currentSessionData: SessionData) => {
    // Send session data to backend to merge with user account
    try {
      const response = await fetch('http://localhost:4000/user/migrate-session', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId: currentSessionId,
          sessionData: currentSessionData
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update frontend session state with merged data from backend
        if (data.activity) {
          // Clean up any inflated quantities before setting the data
          const cleanedCart = (data.activity.cart || []).map((item: any) => ({
            ...item,
            quantity: item.quantity > 10 ? 1 : item.quantity // Reset quantities over 10 to 1
          }));
          
          setSessionData({
            cart: cleanedCart,
            viewedProducts: data.activity.viewedProducts || [],
            searchHistory: data.activity.searchHistory || [],
            lastActivity: data.activity.lastActivity || new Date().toISOString()
          });
        }
      }
    } catch (error) {
      console.error('Session migration error:', error);
    }
  };

  const syncCartWithBackend = async (updatedSessionData: SessionData) => {
    // Sync cart changes with backend if user is logged in
    if (authState.token) {
      try {
        await fetch('http://localhost:4000/user/sync-cart', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authState.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            cart: updatedSessionData.cart
          })
        });
      } catch (error) {
        console.error('Cart sync error:', error);
      }
    }
  };

  const resetCartQuantities = () => {
    // Reset any inflated quantities to reasonable values
    setSessionData(prev => {
      const newSessionData = {
        ...prev,
        cart: prev.cart.map(item => ({
          ...item,
          quantity: item.quantity > 5 ? 1 : item.quantity // Reset quantities over 5 to 1
        }))
      };
      
      // Sync with backend if user is logged in
      if (authState.token) {
        syncCartWithBackend(newSessionData);
      }
      
      return newSessionData;
    });
  };

  const addToCart = (product: any) => {
    const cartItem: CartItem = {
      id: product.id,
      title: product.title,
      price: product.price,
      quantity: 1,
      image: product.image?.[0],
      addedAt: new Date().toISOString()
    };

    setSessionData(prev => {
      const existingItem = prev.cart.find(item => item.id === product.id);
      let newSessionData;
      
      if (existingItem) {
        newSessionData = {
          ...prev,
          cart: prev.cart.map(item =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        };
      } else {
        newSessionData = {
          ...prev,
          cart: [...prev.cart, cartItem]
        };
      }

      // Sync with backend if user is logged in
      syncCartWithBackend(newSessionData);
      
      return newSessionData;
    });
  };

  const removeFromCart = (productId: string) => {
    setSessionData(prev => {
      const newSessionData = {
        ...prev,
        cart: prev.cart.filter(item => item.id !== productId)
      };
      
      // Sync with backend if user is logged in
      syncCartWithBackend(newSessionData);
      
      return newSessionData;
    });
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setSessionData(prev => {
      const newSessionData = {
        ...prev,
        cart: prev.cart.map(item =>
          item.id === productId ? { ...item, quantity } : item
        )
      };
      
      // Sync with backend if user is logged in
      syncCartWithBackend(newSessionData);
      
      return newSessionData;
    });
  };

  const trackProductView = (productId: string) => {
    setSessionData(prev => ({
      ...prev,
      viewedProducts: [
        productId,
        ...prev.viewedProducts.filter(id => id !== productId)
      ].slice(0, 50) // Keep last 50 viewed products
    }));
  };

  const trackSearch = (query: string) => {
    if (!query.trim()) return;
    
    setSessionData(prev => ({
      ...prev,
      searchHistory: [
        query.trim(),
        ...prev.searchHistory.filter(q => q !== query.trim())
      ].slice(0, 20) // Keep last 20 searches
    }));
  };

  const getSessionData = (): SessionData => sessionData;

  const cartItemsCount = sessionData.cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = sessionData.cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  const value: AuthContextType = {
    ...authState,
    login,
    register,
    logout,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    trackProductView,
    trackSearch,
    getSessionData,
    resetCartQuantities,
    cartItemsCount,
    cartTotal
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 