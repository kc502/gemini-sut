import React, { useState } from 'react';
import { Tab } from './types';
import Header from './components/Header';
import VideoGenerator from './components/VideoGenerator';
import ImageGenerator from './components/ImageGenerator';
import ImageEditor from './components/ImageEditor';
import TabButton from './components/TabButton';
import ApiKeyManager from './components/ApiKeyManager';
import { initializeGemini } from './services/geminiService';
import { useLanguage } from './contexts/LanguageContext';

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>(Tab.IMAGE_GENERATION);
  const { t } = useLanguage();

  const handleSetApiKey = (key: string) => {
    try {
        initializeGemini(key);
        setApiKey(key);
    } catch (error) {
        console.error("Failed to initialize Gemini service:", error);
        // Here you could add UI feedback for initialization errors
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case Tab.IMAGE_GENERATION:
        return <ImageGenerator />;
      case Tab.IMAGE_EDITING:
        return <ImageEditor />;
      case Tab.VIDEO_GENERATION:
        return <VideoGenerator />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <Header />
      
      <main>
           <div className="container mx-auto px-4 py-8">
            {apiKey ? (
                <div className="bg-gray-800 rounded-xl shadow-2xl p-6 md:p-8">
                  
                  <div className="flex justify-center border-b border-gray-700 mb-6">
                    <TabButton
                      label={t.tabs.imageGeneration}
                      isActive={activeTab === Tab.IMAGE_GENERATION}
                      onClick={() => setActiveTab(Tab.IMAGE_GENERATION)}
                    />
                    <TabButton
                      label={t.tabs.imageEditing}
                      isActive={activeTab === Tab.IMAGE_EDITING}
                      onClick={() => setActiveTab(Tab.IMAGE_EDITING)}
                    />
                    <TabButton
                      label={t.tabs.videoGeneration}
                      isActive={activeTab === Tab.VIDEO_GENERATION}
                      onClick={() => setActiveTab(Tab.VIDEO_GENERATION)}
                    />
                  </div>
                  <div className="transition-opacity duration-300 ease-in-out">
                    {renderContent()}
                  </div>
                </div>
              ) : (
                <ApiKeyManager onSetApiKey={handleSetApiKey} />
              )
            }
          </div>
      </main>
      
      <footer className="text-center py-6 text-gray-500 text-sm">
        <p>Powered by Google Gemini API</p>
      </footer>
    </div>
  );
};

export default App;