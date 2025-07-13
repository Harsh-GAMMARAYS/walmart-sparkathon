'use client';

import { useState, useEffect } from 'react';
import { ChatInterface } from './ChatInterface';

interface AISearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
  imageSearchResults?: any;
}

export function AISearchModal({ isOpen, onClose, initialQuery, imageSearchResults }: AISearchModalProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      // Re-enable body scroll when modal closes
      document.body.style.overflow = 'unset';
    }

    // Cleanup function
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 250); // Match the animation duration
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleEscapeKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      return () => {
        document.removeEventListener('keydown', handleEscapeKey);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ease-out ${
        isAnimating ? 'backdrop-blur-md' : 'bg-transparent'
      }`}
      onClick={handleBackdropClick}
    >
      <div
        className={`relative w-[90vw] h-[90vh] bg-white rounded-2xl shadow-2xl transition-all duration-300 ease-out transform ${
          isAnimating
            ? 'scale-100 opacity-100 translate-y-0'
            : 'scale-95 opacity-0 translate-y-8'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with close button */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-white rounded-t-2xl border-b border-gray-200">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <img src="/ai-icon.svg" alt="AI" className="w-6 h-6" />
                <h2 className="text-xl font-bold text-gray-900">AI Shopping Assistant</h2>
              </div>
              {initialQuery && (
                <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  Searching: "{initialQuery}"
                </div>
              )}
            </div>
            <button
              onClick={handleClose}
              className="flex items-center justify-center w-8 h-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close AI Search"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="h-full pt-16 pb-4">
          <div className="h-full bg-gray-50 rounded-b-2xl overflow-hidden">
            <ChatInterface initialQuery={initialQuery} imageSearchResults={imageSearchResults} />
          </div>
        </div>
      </div>
    </div>
  );
} 