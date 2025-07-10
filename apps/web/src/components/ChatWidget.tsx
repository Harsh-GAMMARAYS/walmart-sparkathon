'use client';

import { useState, useEffect } from 'react';
import { ChatInterface } from './ChatInterface';

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);

  // Handle open/close with animation
  const handleOpen = () => {
    setVisible(true);
    setTimeout(() => setOpen(true), 10);
  };

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    if (!open && visible) {
      const timeout = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [open, visible]);

  return (
    <>
      {/* Floating Open Button */}
      {!open && (
        <button
          className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white rounded-full shadow-lg w-14 h-14 flex items-center justify-center hover:bg-blue-700 transition"
          onClick={handleOpen}
          aria-label="Open chat"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      )}
      {/* Popup Chat Window with animation */}
      {visible && (
        <div
          className={`fixed top-[80px] right-6 bottom-6 mr-20 z-50 w-[45vw] max-w-2xl bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden
            transition-all duration-300 transform
            ${open ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-8 pointer-events-none'}
          `}
        >
          <div className="flex items-center px-4 py-2" style={{ background: '#232F3E' }}>
            <span className="font-bold text-white">AI Assistant</span>
          </div>
          <ChatInterface />
        </div>
      )}
      {/* Floating Close Button */}
      {open && (
        <button
          className="fixed bottom-6 right-6 z-[60] bg-blue-600 text-white rounded-full shadow-lg w-14 h-14 flex items-center justify-center hover:bg-blue-700 transition"
          onClick={handleClose}
          aria-label="Close chat"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      )}
    </>
  );
} 