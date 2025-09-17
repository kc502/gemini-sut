import React, { useState, useEffect, useRef } from 'react';
import { validateApiKey } from '../services/geminiService';

interface ApiKeyManagerProps {
  onSetApiKey: (key: string) => void;
}

const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({ onSetApiKey }) => {
  const [key, setKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    if (!key.trim()) {
      setIsLoading(false);
      setError(null);
      return;
    }

    debounceTimeout.current = setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      const isValid = await validateApiKey(key.trim());
      setIsLoading(false);

      if (isValid) {
        onSetApiKey(key.trim());
      } else {
        if (key.trim()) {
          setError('Invalid API Key. Please check the key and try again.');
        }
      }
    }, 700); // Debounce validation by 700ms

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [key, onSetApiKey]);

  return (
    <div className="bg-gray-800 rounded-xl shadow-2xl p-6 md:p-8 text-center">
      <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">Enter Your Gemini API Key</h2>
      <p className="text-gray-400 mb-6">
        To use this application, please provide your Google Gemini API key. Your key will be stored securely in your browser's local storage.
      </p>
      <div className="relative max-w-lg mx-auto">
        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="Paste your API key here to begin"
          className={`w-full bg-gray-700 border ${error ? 'border-red-500' : 'border-gray-600'} rounded-md p-3 pr-10 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition`}
          aria-label="Gemini API Key Input"
          autoFocus
        />
        {isLoading && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
      </div>
      {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
       <p className="text-xs text-gray-500 mt-4">
        You can get your API key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">Google AI Studio</a>.
      </p>
    </div>
  );
};

export default ApiKeyManager;
