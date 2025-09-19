import React, { useState, useCallback, useRef } from 'react';
import { generateImage } from '../services/geminiService';
import LoadingSpinner from '../contexts/LoadingSpinner';
import { useLanguage } from '../contexts/LanguageContext';
import { getFriendlyErrorMessage } from '../utils/errorUtils';
import { useApiKey } from '../contexts/ApiKeyContext';
import CustomDropdown from './CustomDropdown';
import { Tab } from '../types';

interface ImageGeneratorProps {
  setActiveTab: (tab: Tab) => void;
  setImageForEditing: (imageUrl: string | null) => void;
}

const ImageGenerator: React.FC<ImageGeneratorProps> = ({ setActiveTab, setImageForEditing }) => {
    const { t } = useLanguage();
    const { apiKey } = useApiKey();

    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
    const promptRef = useRef<HTMLTextAreaElement>(null);

    const aspectRatioOptions = [
        { value: "16:9", labelKey: 'aspectRatioLandscape' as keyof typeof t.common },
        { value: "9:16", labelKey: 'aspectRatioPortrait' as keyof typeof t.common },
    ];
    
    const dropdownOptions = aspectRatioOptions.map(opt => `${t.common[opt.labelKey]} (${opt.value})`);
    
    const [selectedAspectRatioOption, setSelectedAspectRatioOption] = useState(dropdownOptions[0]);

    const handleSubmit = useCallback(async () => {
        if (!prompt) {
            setError(t.common.errorPromptRequired);
            return;
        }
        if (!apiKey) {
            setError("API Key is not set.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedImageUrl(null);

        try {
            const aspectRatioValue = selectedAspectRatioOption.match(/\(([^)]+)\)/)?.[1] || aspectRatioOptions[0].value;
            const imageUrl = await generateImage(apiKey, prompt, aspectRatioValue);
            setGeneratedImageUrl(imageUrl);
        } catch (err: any) {
            console.error(err);
            setError(getFriendlyErrorMessage(err, t));
        } finally {
            setIsLoading(false);
        }
    }, [prompt, selectedAspectRatioOption, t, apiKey]);

    const handleDownload = () => {
        if (!generatedImageUrl) return;
        const link = document.createElement('a');
        link.href = generatedImageUrl;
        link.download = `generated-image-${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleEditImage = () => {
        if (generatedImageUrl) {
            setImageForEditing(generatedImageUrl);
            setActiveTab(Tab.IMAGE_EDITING);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <label htmlFor="prompt-image-gen" className="block text-sm font-medium text-gray-300 mb-2">{t.common.promptLabel}</label>
                <textarea
                    id="prompt-image-gen"
                    ref={promptRef}
                    rows={3}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md p-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    placeholder={t.imageGenerator.promptPlaceholder}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                />
            </div>

            <CustomDropdown
                label={t.common.aspectRatioLabel}
                options={dropdownOptions}
                value={selectedAspectRatioOption}
                onChange={setSelectedAspectRatioOption}
            />

            <button
                onClick={handleSubmit}
                disabled={isLoading || !prompt}
                className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-md hover:bg-indigo-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors duration-300"
            >
                {isLoading ? t.imageGenerator.generatingButton : t.imageGenerator.generateButton}
            </button>
            
            {error && <div className="bg-red-900/50 border border-red-700 text-red-300 p-3 rounded-md whitespace-pre-wrap">{error}</div>}
            
            {isLoading && <LoadingSpinner message={t.imageGenerator.loadingMessage} />}
            
            {generatedImageUrl && (
                <div className="bg-gray-700/50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2 text-center text-gray-300">{t.imageGenerator.generatedImageTitle}</h3>
                    <div className="flex justify-center">
                        <img src={generatedImageUrl} alt="Generated from prompt" className="rounded-md max-h-96" />
                    </div>
                    <div className="flex justify-center items-center gap-4 mt-4">
                        <button
                            onClick={handleEditImage}
                            className="bg-gray-600 text-white font-bold py-2 px-4 rounded-md hover:bg-gray-500 transition-colors duration-300 inline-flex items-center gap-2"
                        >
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                                <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                           </svg>
                            {t.imageGenerator.editPromptButton}
                        </button>
                        <button
                            onClick={handleDownload}
                            className="bg-indigo-500 text-white font-bold py-2 px-4 rounded-md hover:bg-indigo-600 transition-colors duration-300 inline-flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            {t.imageGenerator.downloadButton}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageGenerator;