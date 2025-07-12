'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { X } from 'lucide-react';

export function BetaModal() {
  const [isVisible, setIsVisible] = useState(true);
  const modalRef = React.useRef<HTMLDivElement>(null);

  // Close the modal
  const handleClose = useCallback(() => {
    setIsVisible(false);
  }, []);

  // Handle click outside the modal
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      handleClose();
    }
  }, [handleClose]);

  // Handle escape key
  const handleEscape = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      handleClose();
    }
  }, [handleClose]);

  // Set up event listeners
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [handleClickOutside, handleEscape]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div 
        ref={modalRef}
        className="relative p-6 w-full max-w-md bg-white rounded-lg shadow-lg dark:bg-gray-800"
      >
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          aria-label="Close"
        >
          <X size={20} />
        </button>
        <div className="text-center">
          <h2 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">
            Template Builder (Beta)
          </h2>
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            This template builder is currently in beta mode. It's being actively tested and improved, so you might encounter some rough edges or incomplete features.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Your feedback is valuable as we continue to enhance this tool!
          </p>
          <button
            onClick={handleClose}
            className="px-4 py-2 mt-6 w-full text-white bg-blue-600 rounded-md transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Got It!
          </button>
        </div>
      </div>
    </div>
  );
}

