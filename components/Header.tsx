import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const Header: React.FC = () => {
  const { locale, setLocale, t } = useLanguage();

  return (
    <header className="bg-gray-800 shadow-lg">
      <div className="container mx-auto px-4 py-6 relative flex justify-center items-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">
            Banana & Veo Gen
          </h1>
          <p className="text-md text-gray-400 mt-2">
            {t.header.subtitle}
          </p>
        </div>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center space-x-2">
            <button 
              onClick={() => setLocale('my')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${locale === 'my' ? 'bg-indigo-600 text-white font-bold' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
            >
              MY
            </button>
            <button 
              onClick={() => setLocale('en')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${locale === 'en' ? 'bg-indigo-600 text-white font-bold' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
            >
              EN
            </button>
        </div>
      </div>
    </header>
  );
};

export default Header;