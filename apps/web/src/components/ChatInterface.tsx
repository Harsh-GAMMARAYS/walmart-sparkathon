'use client';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

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
        <p className="text-xs text-gray-600 line-clamp-2">
          {product.description}
        </p>
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

const CHAT_STORAGE_KEY = 'walmart_ai_chat_history';

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

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load chat history from localStorage on component mount
  useEffect(() => {
    const savedMessages = localStorage.getItem(CHAT_STORAGE_KEY);
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(parsedMessages);
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    } else {
      // Add welcome message for new chats
      const welcomeMessage: Message = {
        id: 'welcome',
        content: "I'm functioning properly and ready to help with any questions or tasks you may have. How can I assist you today?",
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, []);

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input after AI response
  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      role: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      // Prepare context: last 5 messages for context
      const recentMessages = messages.slice(-5).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await fetch('http://localhost:4000/ai/agentQuery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ 
          query: input.trim(),
          context: recentMessages.length > 0 ? recentMessages : undefined
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
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, something went wrong. Please try again.",
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = () => {
    localStorage.removeItem(CHAT_STORAGE_KEY);
    setMessages([]);
    const welcomeMessage: Message = {
      id: 'welcome-new',
      content: "Chat history cleared! How can I help you today?",
      role: 'assistant',
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 relative">
      {/* Header */}
      <div className="flex-shrink-0 p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-gray-900 dark:text-white">AI Assistant</h3>
          <button
            onClick={clearHistory}
            className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 px-2 py-1 rounded"
          >
            Clear History
          </button>
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
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
} 