import React from 'react';
import ApiKeyManager from './ApiKeyManager';

interface ApiKeyModalProps {
  isOpen: boolean;
  onSetApiKey: (key: string) => void;
  onClose: () => void;
  showCloseButton: boolean;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onSetApiKey, onClose, showCloseButton }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center z-50 transition-opacity duration-300"
      aria-modal="true"
      role="dialog"
    >
      <div className="relative w-full max-w-lg mx-4">
        {showCloseButton && (
          <button 
            onClick={onClose} 
            className="absolute -top-3 -right-3 bg-gray-700 rounded-full p-2 text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 transition-colors"
            aria-label="Close API Key Manager"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        <ApiKeyManager onSetApiKey={onSetApiKey} />
      </div>
    </div>
  );
};

export default ApiKeyModal;
