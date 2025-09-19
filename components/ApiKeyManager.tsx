import React, { useState, useEffect, useRef } from 'react';
import { validateApiKey } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';
import { useApiKey } from '../contexts/ApiKeyContext';

type ValidationStatus = 'idle' | 'loading' | 'valid' | 'invalid';

// Fix: Add ApiKeyManagerProps interface to accept an optional onSetApiKey prop, resolving the type error in ApiKeyModal.tsx.
interface ApiKeyManagerProps {
  onSetApiKey?: (key: string) => void;
}

const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({ onSetApiKey }) => {
  const [key, setKey] = useState('');
  const [status, setStatus] = useState<ValidationStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { t } = useLanguage();
  const { setApiKey: setApiKeyFromContext } = useApiKey();
  // Fix: Use the onSetApiKey prop if provided, otherwise fall back to the context function.
  const handleSetApiKey = onSetApiKey || setApiKeyFromContext;

  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    const trimmedKey = key.trim();
    if (!trimmedKey) {
      setStatus('idle');
      setError(null);
      return;
    }

    setStatus('loading');
    setError(null);

    debounceTimeout.current = setTimeout(async () => {
      const result = await validateApiKey(trimmedKey);
      
      if (result.isValid) {
        setStatus('valid');
        setError(null);
        setTimeout(() => {
            handleSetApiKey(trimmedKey);
        }, 500); // Brief pause to show success state
      } else {
        setStatus('invalid');
        const errorKey = result.message?.split('.')[1] as keyof typeof t['errors'];
        const errorMessage = errorKey && t.errors[errorKey] ? t.errors[errorKey] : t.errors.invalidApiKeyDefault;
        setError(errorMessage);
      }
    }, 700); // Debounce validation by 700ms

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [key, handleSetApiKey, t]);

  const borderColor = () => {
    switch (status) {
      case 'valid': return 'border-green-500';
      case 'invalid': return 'border-red-500';
      default: return 'border-gray-600';
    }
  };

  const renderStatusIcon = () => {
    switch (status) {
      case 'loading':
        return (
          <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        );
      case 'valid':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'invalid':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl shadow-2xl p-6 md:p-8 text-center">
      <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">{t.apiKeyManager.title}</h2>
      <p className="text-gray-400 mb-6">
        {t.apiKeyManager.description}
      </p>
      <div className="relative max-w-lg mx-auto">
        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder={t.apiKeyManager.placeholder}
          className={`w-full bg-gray-700 border ${borderColor()} rounded-md p-3 pr-10 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
          aria-label="Gemini API Key Input"
          autoFocus
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          {renderStatusIcon()}
        </div>
      </div>
      {status === 'invalid' && error && <p className="text-red-400 text-sm mt-2">{error}</p>}
       <p className="text-xs text-gray-500 mt-4">
        {t.apiKeyManager.getApiKeyText.part1} <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">Google AI Studio</a>{t.apiKeyManager.getApiKeyText.part2}
      </p>
    </div>
  );
};

export default ApiKeyManager;
