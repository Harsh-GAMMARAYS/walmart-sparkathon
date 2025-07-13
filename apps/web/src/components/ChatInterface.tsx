'use client';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';

// Extend Window interface for Speech Recognition
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

type Message = {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
};

type ProductData = {
  id: string;
  title: string;
  brand: string;
  price: number;
  description: string;
  thumbnail: string;
  link: string;
};

// Product Card Component
const ProductCard = ({ product }: { product: ProductData }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow w-full max-w-sm">
      <div className="aspect-square relative mb-3 overflow-hidden rounded-md bg-gray-100">
        <Image
          src={product.thumbnail}
          alt={product.title}
          fill
          className="object-cover"
          onError={(e) => {
            // Fallback to placeholder if image fails to load
            const target = e.target as HTMLImageElement;
            target.src = 'https://via.placeholder.com/200x200?text=No+Image';
          }}
        />
      </div>
      <div className="space-y-2">
        <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">
          {product.brand}
        </div>
        <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">
          {product.title}
        </h3>
        <div className="flex items-center justify-between pt-2">
          <span className="text-lg font-bold text-green-600">
            ${product.price.toFixed(2)}
          </span>
          <button
            onClick={() => window.open(product.link, '_blank')}
            className="bg-blue-500 text-white px-3 py-1.5 rounded-md hover:bg-blue-600 transition-colors text-xs font-medium"
          >
            View Product
          </button>
        </div>
      </div>
    </div>
  );
};

// Function to get user-specific chat storage key
const getChatStorageKey = (userId: string | null) => {
  return userId ? `walmart_ai_chat_history_${userId}` : 'walmart_ai_chat_history_guest';
};

// Function to render messages with product cards and clickable links
const renderMessageContent = (text: string) => {
  // Check for product cards
  const productCardMatch = text.match(/\[PRODUCT_CARDS_START\]([\s\S]*?)\[PRODUCT_CARDS_END\]/);
  
  if (productCardMatch) {
    try {
      const productsData = JSON.parse(productCardMatch[1]) as ProductData[];
      const beforeCards = text.substring(0, productCardMatch.index);
      const afterCards = text.substring(productCardMatch.index! + productCardMatch[0].length);
      
      return (
        <div className="space-y-4">
          {/* Text before product cards */}
          {beforeCards && (
            <div className="text-sm whitespace-pre-wrap">
              {renderTextWithLinks(beforeCards)}
            </div>
          )}
          
          {/* Product Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
            {productsData.map((product, index) => (
              <ProductCard key={product.id || index} product={product} />
            ))}
          </div>
          
          {/* Text after product cards */}
          {afterCards && (
            <div className="text-sm whitespace-pre-wrap">
              {renderTextWithLinks(afterCards)}
            </div>
          )}
        </div>
      );
    } catch (error) {
      console.error('Error parsing product cards:', error);
      // Fallback to regular text rendering
      return <div className="text-sm whitespace-pre-wrap">{renderTextWithLinks(text)}</div>;
    }
  }
  
  // No product cards, render as regular text with links
  return <div className="text-sm whitespace-pre-wrap">{renderTextWithLinks(text)}</div>;
};

// Function to render text with clickable links (helper function)
const renderTextWithLinks = (text: string) => {
  // First handle "View Product: URL" patterns
  let processedText = text.replace(
    /🔗 View Product: (https?:\/\/[^\s\]\)]+)/g,
    (match, url) => {
      return `<PRODUCT_LINK>${url}</PRODUCT_LINK>`;
    }
  );
  
  // Then handle regular URLs
  const urlRegex = /(https?:\/\/[^\s\]\)]+)/g;
  processedText = processedText.replace(urlRegex, (match) => {
    if (!match.includes('PRODUCT_LINK')) {
      return `<REGULAR_LINK>${match}</REGULAR_LINK>`;
    }
    return match;
  });
  
  // Split by our custom tags and render
  const parts = processedText.split(/(<PRODUCT_LINK>.*?<\/PRODUCT_LINK>|<REGULAR_LINK>.*?<\/REGULAR_LINK>)/);
  
  return parts.map((part, index) => {
    if (part.startsWith('<PRODUCT_LINK>')) {
      const url = part.replace(/<\/?PRODUCT_LINK>/g, '');
      return (
        <a
          key={index}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition-colors font-medium text-sm ml-2"
          onClick={(e) => {
            e.preventDefault();
            window.open(url, '_blank');
          }}
        >
          🛍️ View Product
        </a>
      );
    } else if (part.startsWith('<REGULAR_LINK>')) {
      const url = part.replace(/<\/?REGULAR_LINK>/g, '');
      return (
        <a
          key={index}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-600 underline break-all"
          onClick={(e) => {
            e.preventDefault();
            window.open(url, '_blank');
          }}
        >
          {url}
        </a>
      );
    }
    return part;
  });
};

interface ChatInterfaceProps {
  initialQuery?: string;
  imageSearchResults?: any;
}

export function ChatInterface({ initialQuery, imageSearchResults }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [hasAutoSubmitted, setHasAutoSubmitted] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, isLoading: authLoading, getSessionData } = useAuth();

  // Reset initial load state when component mounts
  useEffect(() => {
    setIsInitialLoad(true);
  }, []);

  // Get browsing context for more personalized responses
  const getBrowsingContext = () => {
    const sessionData = getSessionData();
    return {
      searchHistory: sessionData.searchHistory.slice(0, 5), // Last 5 searches
      viewedProducts: sessionData.viewedProducts.slice(0, 10), // Last 10 viewed products
      cartItems: sessionData.cart.map(item => ({
        id: item.id,
        title: item.title,
        price: item.price,
        quantity: item.quantity
      })),
      cartTotal: sessionData.cart.reduce((total, item) => total + (item.price * item.quantity), 0),
      lastActivity: sessionData.lastActivity
    };
  };

  // Initialize welcome messages with browsing context
  const getWelcomeMessage = (user: any): Message => {
    const browsingContext = getBrowsingContext();
    const hasRecentActivity = browsingContext.searchHistory.length > 0 || browsingContext.viewedProducts.length > 0 || browsingContext.cartItems.length > 0;
    
    if (user) {
      let welcomeContent = `Hello ${user.name}! I'm your Walmart shopping assistant.`;
      
      if (hasRecentActivity) {
        welcomeContent += `\n\n🛍️ I can see you've been browsing our store`;
        
        if (browsingContext.searchHistory.length > 0) {
          welcomeContent += ` and recently searched for: ${browsingContext.searchHistory.slice(0, 2).join(', ')}`;
        }
        
        if (browsingContext.cartItems.length > 0) {
          welcomeContent += `. You have ${browsingContext.cartItems.length} item${browsingContext.cartItems.length > 1 ? 's' : ''} in your cart`;
        }
        
        welcomeContent += `.\n\nI can help you find more products, answer questions about items you've viewed, or assist with your shopping cart.`;
      } else {
        welcomeContent += ` How can I help you find what you're looking for today?`;
      }
      
      return {
        id: 'welcome',
        content: welcomeContent,
        role: 'assistant',
        timestamp: new Date(),
      };
    } else {
      let guestContent = `Hello Guest! I'm your Walmart shopping assistant.`;
      
      if (hasRecentActivity) {
        guestContent += `\n\n🛍️ I can see you've been browsing our store`;
        
        if (browsingContext.searchHistory.length > 0) {
          guestContent += ` and recently searched for: ${browsingContext.searchHistory.slice(0, 2).join(', ')}`;
        }
        
        if (browsingContext.cartItems.length > 0) {
          guestContent += `. You have ${browsingContext.cartItems.length} item${browsingContext.cartItems.length > 1 ? 's' : ''} in your cart`;
        }
        
        guestContent += `.\n\nI can help you find products, but for the best experience with personalized recommendations, order history, and saved preferences, please sign up or log in.`;
      } else {
        guestContent += `\n\nI can help you find products, but for the best experience with personalized recommendations, order history, and saved preferences, please sign up or log in to access all features.`;
      }
      
      guestContent += `\n\nHow can I help you today?`;
      
      return {
        id: 'welcome-guest',
        content: guestContent,
        role: 'assistant',
        timestamp: new Date(),
      };
    }
  };

  // Load chat history based on user state
  useEffect(() => {
    if (authLoading) return; // Wait for auth to load
    
    const userId = user?.id || null;
    const chatStorageKey = getChatStorageKey(userId);
    
    // If user changed (login/logout), clear current messages and load new ones
    if (currentUserId !== userId) {
      setCurrentUserId(userId);
      setIsInitialLoad(true); // Reset initial load state for new user
      
      // For guest users, always start fresh (no persistent history)
      if (!userId) {
        setMessages([getWelcomeMessage(user)]);
        return;
      }
      
      // For logged-in users, load their saved history
      const savedMessages = localStorage.getItem(chatStorageKey);
      if (savedMessages) {
        try {
          const parsedMessages = JSON.parse(savedMessages).map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
          setMessages(parsedMessages);
        } catch (error) {
          console.error('Error loading chat history:', error);
          // If parsing fails, start with welcome message
          setMessages([getWelcomeMessage(user)]);
        }
      } else {
        // No saved messages, start with welcome message
        setMessages([getWelcomeMessage(user)]);
      }
    }
  }, [user, authLoading, currentUserId]);

  // Save messages to localStorage whenever messages change (only for logged-in users)
  useEffect(() => {
    if (messages.length > 0 && currentUserId) {
      const chatStorageKey = getChatStorageKey(currentUserId);
      localStorage.setItem(chatStorageKey, JSON.stringify(messages));
    }
  }, [messages, currentUserId]);

  // Auto-scroll to bottom when new messages arrive (but not on initial load)
  useEffect(() => {
    if (shouldAutoScroll && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setShouldAutoScroll(false);
    }
  }, [messages, shouldAutoScroll]);

  // Position at bottom on initial load without animation
  useEffect(() => {
    if (messages.length > 0 && isInitialLoad) {
      // Use setTimeout to ensure DOM is ready, then position instantly
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
        setIsInitialLoad(false);
      }, 100);
    }
  }, [messages, isInitialLoad]);

  // Focus input after AI response
  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading]);

  // Auto-submit initial query from AI search
  useEffect(() => {
    if (initialQuery && !hasAutoSubmitted && !authLoading && messages.length > 0 && !isLoading) {
      setHasAutoSubmitted(true);
      setInput(initialQuery);
      
      // Small delay to ensure UI is ready
      setTimeout(() => {
        const userMessage: Message = {
          id: Date.now().toString(),
          content: initialQuery,
          role: 'user',
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setShouldAutoScroll(true);

        // Submit the query
        submitQuery(initialQuery);
      }, 100);
    }
  }, [initialQuery, hasAutoSubmitted, authLoading, messages.length, isLoading]);

  // Handle image search results
  useEffect(() => {
    if (imageSearchResults && !hasAutoSubmitted && !authLoading && messages.length > 0) {
      setHasAutoSubmitted(true);
      
      setTimeout(() => {
        const userMessage: Message = {
          id: Date.now().toString(),
          content: 'I uploaded an image to find similar products.',
          role: 'user',
          timestamp: new Date(),
        };

        // Format image search results as product cards
        let resultsContent = 'Here are similar products I found based on your image:\n\n';
        
        if (imageSearchResults.agent_output?.llm_output) {
          const products = imageSearchResults.agent_output.llm_output;
          const formattedProducts = products.map((product: any, index: number) => ({
            id: product.id || `image-result-${index}`,
            title: product.title || product.description || 'Product',
            brand: product.brand || 'Walmart',
            price: product.price || 0,
            description: product.description || '',
            thumbnail: (product.real_image && product.real_image[0]) || product.image || '',
            link: product.id ? `http://localhost:3000/products/${product.id}` : '#'
          }));

          resultsContent += `[PRODUCT_CARDS_START]${JSON.stringify(formattedProducts)}[PRODUCT_CARDS_END]`;
        } else {
          resultsContent += 'Sorry, I couldn\'t find similar products for your image. Please try with a clearer image or different product.';
        }

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: resultsContent,
          role: 'assistant',
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage, assistantMessage]);
        setShouldAutoScroll(true);
      }, 100);
    }
  }, [imageSearchResults, hasAutoSubmitted, authLoading, messages.length]);

  const submitQuery = async (query: string) => {
    try {
      const token = localStorage.getItem('authToken');
      
      // Prepare context: last 5 messages for context
      const recentMessages = messages.slice(-5).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Get browsing context for personalized responses
      const browsingContext = getBrowsingContext();

      const response = await fetch('http://localhost:8000/ai/agentQuery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ 
          query_type: "text",
          content: { text_query: query },
          uid: user?.id || "guest",
          action: "toolagent",
          context: recentMessages.length > 0 ? recentMessages : undefined,
          user: user ? { name: user.name, id: user.id } : undefined,
          browsingContext: browsingContext
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('AI Response:', data);

      const content =
        data.agent_output?.llm_output ||
        data.llm_output ||
        "Sorry, I couldn't get a response from the AI.";

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: content,
        role: 'assistant',
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
      setShouldAutoScroll(true);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, something went wrong. Please try again.",
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setShouldAutoScroll(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const query = input.trim();
    const userMessage: Message = {
      id: Date.now().toString(),
      content: query,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setShouldAutoScroll(true);

    // Use the shared submitQuery function
    await submitQuery(query);
  };

  const clearHistory = () => {
    const chatStorageKey = getChatStorageKey(currentUserId);
    localStorage.removeItem(chatStorageKey);
    setMessages([]);
    const welcomeMessage = getWelcomeMessage(user);
    setMessages([welcomeMessage]);
    setIsInitialLoad(true); // Reset to position at bottom without animation
  };

  // Voice search functionality
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  const handleVoiceSearch = () => {
    if (isListening) {
      recognition?.stop();
      setIsListening(false);
    } else {
      recognition?.start();
      setIsListening(true);
    }
  };

  // Image upload functionality
  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }

    setIsUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:8000/ai/imageSearch', {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Image search response:', data);

      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        content: 'I uploaded an image to find similar products.',
        role: 'user',
        timestamp: new Date(),
      };

              // Format image search results as product cards
        let resultsContent = 'Here are similar products I found based on your image:\n\n';
        
        if (data.agent_output?.llm_output) {
          const products = data.agent_output.llm_output;
          const formattedProducts = products.map((product: any, index: number) => ({
            id: product.id || `image-result-${index}`,
            title: product.title || product.description || 'Product',
            brand: product.brand || 'Walmart',
            price: product.price || 0,
            description: product.description || '',
            thumbnail: (product.real_image && product.real_image[0]) || product.image || '',
            link: product.id ? `http://localhost:3000/products/${product.id}` : '#'
          }));

          resultsContent += `[PRODUCT_CARDS_START]${JSON.stringify(formattedProducts)}[PRODUCT_CARDS_END]`;
        } else {
          resultsContent += 'Sorry, I couldn\'t find similar products for your image. Please try with a clearer image or different product.';
        }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: resultsContent,
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      setShouldAutoScroll(true);
    } catch (error) {
      console.error('Image search error:', error);
      alert('Failed to search by image. Please try again.');
    } finally {
      setIsUploadingImage(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-gray-800 relative">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading chat...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 relative">
      {/* Header */}
      <div className="flex-shrink-0 p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {user ? `AI Assistant - ${user.name}` : 'AI Assistant - Guest'}
          </h3>
          <div className="flex items-center space-x-2">
            {!user && (
              <div className="flex items-center space-x-2 mr-4">
                <a
                  href="/auth/signin"
                  className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
                >
                  Sign In
                </a>
                <a
                  href="/auth/signup"
                  className="text-xs bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition-colors"
                >
                  Sign Up
                </a>
              </div>
            )}
            <button
              onClick={clearHistory}
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 px-2 py-1 rounded"
            >
              Clear History
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
              }`}
            >
              {renderMessageContent(message.content)}
              <span className="text-xs opacity-70 mt-1 block">
                {message.timestamp.toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form - Fixed at bottom */}
      <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={user ? "Type your message..." : "Type your message... (Sign in for full features)"}
              disabled={isLoading}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 pr-20 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            />
            {/* Voice and Image buttons inside input */}
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
              {/* Voice Search Button */}
              <button
                type="button"
                onClick={handleVoiceSearch}
                disabled={isLoading}
                className={`p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors ${
                  isListening ? 'bg-red-100 text-red-600' : 'text-gray-400'
                }`}
                title={isListening ? 'Stop Recording' : 'Voice Search'}
              >
                {isListening ? (
                  <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                )}
              </button>
              
              {/* Image Upload Button */}
              <button
                type="button"
                onClick={handleImageUpload}
                disabled={isLoading || isUploadingImage}
                className={`p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors ${
                  isUploadingImage ? 'bg-blue-100 text-blue-600' : 'text-gray-400'
                }`}
                title={isUploadingImage ? 'Uploading...' : 'Image Search'}
              >
                {isUploadingImage ? (
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </form>
        
        {/* Hidden file input for image upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
} 