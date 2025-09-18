import React, { useState, useEffect } from 'react';
import { Tab } from './types';
import Header from './components/Header';
import VideoGenerator from './components/VideoGenerator';
import ImageGenerator from './components/ImageGenerator';
import ImageEditor from './components/ImageEditor';
import TabButton from './components/TabButton';
import ApiKeyManager from './components/ApiKeyManager';
import { initializeGemini } from './services/geminiService';

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string | null>(() => {
    // Check for key in local storage on initial load
    return localStorage.getItem('geminiApiKey');
  });
  const [activeTab, setActiveTab] = useState<Tab>(Tab.VIDEO_GENERATION);

  useEffect(() => {
    if (apiKey) {
      try {
        initializeGemini(apiKey);
      } catch (error) {
        console.error("Failed to initialize Gemini with stored API key:", error);
        // Clear invalid key
        localStorage.removeItem('geminiApiKey');
        setApiKey(null);
      }
    }
  }, [apiKey]);

  const handleSetApiKey = (key: string) => {
    localStorage.setItem('geminiApiKey', key);
    setApiKey(key);
    // Initialization is handled by the useEffect hook
  };

  const handleChangeApiKey = () => {
    localStorage.removeItem('geminiApiKey');
    setApiKey(null);
    // This will cause the ApiKeyManager to be rendered
  };

  const renderContent = () => {
    switch (activeTab) {
      case Tab.VIDEO_GENERATION:
        return <VideoGenerator />;
      case Tab.IMAGE_GENERATION:
        return <ImageGenerator />;
      case Tab.IMAGE_EDITING:
        return <ImageEditor />;
      default:
        return null;
    }
  };

  if (!apiKey) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 font-sans flex items-center justify-center p-4">
        <main>
          <ApiKeyManager onSetApiKey={handleSetApiKey} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="bg-gray-800 rounded-xl shadow-2xl p-6 md:p-8">
          <div className="flex justify-center border-b border-gray-700 mb-6">
            <TabButton
              label="Generate Video"
              isActive={activeTab === Tab.VIDEO_GENERATION}
              onClick={() => setActiveTab(Tab.VIDEO_GENERATION)}
            />
            <TabButton
              label="Generate Image"
              isActive={activeTab === Tab.IMAGE_GENERATION}
              onClick={() => setActiveTab(Tab.IMAGE_GENERATION)}
            />
            <TabButton
              label="Edit Image"
              isActive={activeTab === Tab.IMAGE_EDITING}
              onClick={() => setActiveTab(Tab.IMAGE_EDITING)}
            />
          </div>
          <div className="transition-opacity duration-300 ease-in-out">
            {renderContent()}
          </div>
        </div>
      </main>
      <footer className="text-center py-6 text-gray-500 text-sm">
        <p>Powered by Google Gemini API</p>
        <button
          onClick={handleChangeApiKey}
          className="mt-2 text-indigo-400 hover:text-indigo-300 hover:underline focus:outline-none"
          aria-label="Change API Key"
        >
          Change API Key
        </button>
      </footer>
    </div>
  );
};

export default App;
