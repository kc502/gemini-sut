import React, { useState, useEffect } from 'react';
import { Tab } from './types';
import Header from './components/Header';
import VideoGenerator from './components/VideoGenerator';
import ImageGenerator from './components/ImageGenerator';
import ImageEditor from './components/ImageEditor';
import TabButton from './components/TabButton';
import ApiKeyManager from './components/ApiKeyManager';
import { initializeGoogleGenAI } from './services/geminiService';

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string | null>(() => localStorage.getItem('gemini-api-key'));
  const [isInitialized, setIsInitialized] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>(Tab.VIDEO_GENERATION);

  useEffect(() => {
    if (apiKey) {
      try {
        initializeGoogleGenAI(apiKey);
        localStorage.setItem('gemini-api-key', apiKey);
        setIsInitialized(true);
      } catch (error) {
        console.error("Failed to initialize GoogleGenAI", error);
        // In a real app, you might want to show an error toast to the user
        setIsInitialized(false);
        setApiKey(null); // Clear invalid key
        localStorage.removeItem('gemini-api-key');
      }
    } else {
      localStorage.removeItem('gemini-api-key');
      setIsInitialized(false);
    }
  }, [apiKey]);

  const handleSetApiKey = (key: string) => {
    setApiKey(key);
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

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {!isInitialized ? (
          <ApiKeyManager onSetApiKey={handleSetApiKey} />
        ) : (
          <div className="bg-gray-800 rounded-xl shadow-2xl p-6 md:p-8">
            <div className="flex justify-end mb-2">
              <button
                onClick={() => setApiKey(null)}
                className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors duration-200"
              >
                Change API Key
              </button>
            </div>
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
        )}
      </main>
      <footer className="text-center py-6 text-gray-500 text-sm">
        <p>Powered by Google Gemini API</p>
      </footer>
    </div>
  );
};

export default App;
