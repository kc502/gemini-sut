import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { validateApiKey } from '../services/geminiService';

interface ApiKeyManagerProps {
  onSetApiKey: (key: string) => void;
}

const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({ onSetApiKey }) => {
  const { t } = useLanguage();
  const [keyInput, setKeyInput] = useState('');
  const [validationStatus, setValidationStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!keyInput.trim()) {
      setValidationStatus('idle');
      setError(null);
      return;
    }

    setValidationStatus('validating');
    setError(null);

    const debounceTimer = setTimeout(async () => {
      // Basic length check to avoid unnecessary API calls for clearly invalid keys.
      if (keyInput.length < 30) {
        setValidationStatus('invalid');
        setError(t.errors.invalidApiKey);
        return;
      }

      const result = await validateApiKey(keyInput);

      if (result.isValid) {
        setValidationStatus('valid');
        setError(null);
        onSetApiKey(keyInput); // Automatically proceed on valid key
      } else {
        setValidationStatus('invalid');
        const errorMessageKey = result.message as keyof typeof t.errors;
        setError(errorMessageKey ? t.errors[errorMessageKey] : t.errors.invalidApiKeyDefault);
      }
    }, 500); // 500ms debounce delay

    return () => clearTimeout(debounceTimer);
  }, [keyInput, t, onSetApiKey]);

  const getStatusIndicator = () => {
    switch (validationStatus) {
      case 'validating':
        return (
          <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        );
      case 'valid':
        return (
          <svg className="h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'invalid':
         return (
          <svg className="h-6 w-6 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'idle':
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
      
      <div className="space-y-4">
        <div className="relative">
            <input
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder={t.apiKeyManager.placeholder}
              className="w-full bg-gray-700 border border-gray-600 rounded-md p-3 pr-10 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              aria-label="API Key Input"
              aria-invalid={validationStatus === 'invalid'}
              aria-describedby="api-key-error"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                {getStatusIndicator()}
            </div>
        </div>
      </div>

      {error && <div id="api-key-error" className="mt-4 bg-red-900/50 border border-red-700 text-red-300 p-3 rounded-md">{error}</div>}

      <p className="text-xs text-gray-500 mt-6">
        {t.apiKeyManager.getApiKeyText.part1}
        <a 
          href="https://aistudio.google.com/app/apikey" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-indigo-400 hover:underline"
        >
          Google AI Studio
        </a>
        {t.apiKeyManager.getApiKeyText.part2}
      </p>
    </div>
  );
};

export default ApiKeyManager;