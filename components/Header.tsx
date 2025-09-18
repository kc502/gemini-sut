import React from 'react';

interface HeaderProps {
    onManageApiKeyClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onManageApiKeyClick }) => (
  <header className="bg-gray-800 shadow-lg">
    <div className="container mx-auto px-4 py-6 relative flex justify-center items-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">
          Gemini Multimedia Suite
        </h1>
        <p className="text-md text-gray-400 mt-2">
          Create and Edit Videos & Images with AI
        </p>
      </div>
      <div className="absolute right-4">
        <button
            onClick={onManageApiKeyClick}
            className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md transition-colors duration-300 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500"
            aria-label="Manage API Key"
        >
            Manage API Key
        </button>
      </div>
    </div>
  </header>
);

export default Header;
