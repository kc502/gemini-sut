import React, { useState, useEffect } from 'react';
import { Tab } from './types';
import Header from './components/Header';
import VideoGenerator from './components/VideoGenerator';
import ImageGenerator from './components/ImageGenerator';
import ImageEditor from './components/ImageEditor';
import TabButton from './components/TabButton';
import ApiKeyModal from './components/ApiKeyModal';
import { initializeGemini } from './services/geminiService';

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string | null>(() => {
    // Check for key in local storage on initial load
    return localStorage.getItem('geminiApiKey');
  });
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>(Tab.VIDEO_GENERATION);

  useEffect(() => {
    if (apiKey) {
      try {
        initializeGemini(apiKey);
        setIsApiKeyModalOpen(false); // Close modal on successful initialization
      } catch (error) {
        console.error("Failed to initialize Gemini with stored API key:", error);
        // Clear invalid key and re-open modal
        localStorage.removeItem('geminiApiKey');
        setApiKey(null);
        setIsApiKeyModalOpen(true);
      }
    } else {
      // If no API key, open the modal
      setIsApiKeyModalOpen(true);
    }
  }, [apiKey]);

  const handleSetApiKey = (key: string) => {
    localStorage.setItem('geminiApiKey', key);
    setApiKey(key);
  };

  const handleManageApiKeyClick = () => {
    setIsApiKeyModalOpen(true);
  };

  const handleCloseModal = () => {
    // Only allow closing the modal if an API key is already set.
    if (apiKey) {
      setIsApiKeyModalOpen(false);
    }
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
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onSetApiKey={handleSetApiKey}
        onClose={handleCloseModal}
        showCloseButton={!!apiKey}
      />

      <Header onManageApiKeyClick={handleManageApiKeyClick} />
      
      <main className={`container mx-auto px-4 py-8 transition-filter duration-300 ${isApiKeyModalOpen ? 'blur-sm pointer-events-none' : ''}`}>
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
      
      <footer className={`text-center py-6 text-gray-500 text-sm transition-filter duration-300 ${isApiKeyModalOpen ? 'blur-sm' : ''}`}>
        <p>Powered by Google Gemini API</p>
      </footer>
    </div>
  );
};

export default App;
