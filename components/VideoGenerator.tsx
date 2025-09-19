import React, { useState, useCallback, useEffect } from 'react';
import { generateVideo, checkVideoOperationStatus, fetchVideoFromUri } from '../services/geminiService';
import { type GenerateVideosOperation } from '../types';
import { blobToParts } from '../utils/fileUtils';
import LoadingSpinner from '../contexts/LoadingSpinner';
import CustomDropdown from './CustomDropdown';
import { useLanguage } from '../contexts/LanguageContext';
import { getFriendlyErrorMessage } from '../utils/errorUtils';
import { useApiKey } from '../contexts/ApiKeyContext';

const videoModels = [
    { id: 'veo-2.0-generate-001', name: 'Veo 3 fast' },
    { id: 'veo-2.0-generate-001', name: 'Veo 3' },
    { id: 'veo-2.0-generate-001', name: 'Veo 2' },
];

const VideoGenerator: React.FC = () => {
    const { t } = useLanguage();
    const { apiKey } = useApiKey();
    
    const [prompt, setPrompt] = useState('');
    const [negativePrompt, setNegativePrompt] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
    const [generatedVideoBlob, setGeneratedVideoBlob] = useState<Blob | null>(null);
    const [loadingMessage, setLoadingMessage] = useState(t.videoGenerator.loadingMessages[0]);
    const [selectedModelName, setSelectedModelName] = useState(videoModels[0].name);
    const model = videoModels.find(m => m.name === selectedModelName)?.id || videoModels[0].id;

    const aspectRatioOptions = [
        { value: "16:9", labelKey: 'aspectRatioLandscape' as keyof typeof t.common },
        { value: "9:16", labelKey: 'aspectRatioPortrait' as keyof typeof t.common },
    ];
    
    const dropdownOptions = aspectRatioOptions.map(opt => `${t.common[opt.labelKey]} (${opt.value})`);
    
    const [selectedAspectRatioOption, setSelectedAspectRatioOption] = useState(dropdownOptions[0]);
    
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (isLoading) {
             const loadingMessages = t.videoGenerator.loadingMessages;
            interval = setInterval(() => {
                setLoadingMessage(prev => {
                    const currentIndex = loadingMessages.indexOf(prev);
                    const nextIndex = (currentIndex + 1) % loadingMessages.length;
                    return loadingMessages[nextIndex];
                });
            }, 3000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isLoading, t]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            setGeneratedVideoUrl(null);
            setGeneratedVideoBlob(null);
        }
    };

    const runVideoGeneration = useCallback(async (
        imageForGeneration?: { mimeType: string; data: string },
        videoForExtension?: { mimeType: string; data: string }
    ) => {
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
        setGeneratedVideoUrl(null);
        if(!videoForExtension) setGeneratedVideoBlob(null); // Do not clear blob if extending
        setLoadingMessage(t.videoGenerator.loadingMessages[0]);

        try {
            const aspectRatioValue = selectedAspectRatioOption.match(/\(([^)]+)\)/)?.[1] || aspectRatioOptions[0].value;
            let operation: GenerateVideosOperation = await generateVideo(apiKey, prompt, model, aspectRatioValue, negativePrompt, imageForGeneration, videoForExtension);

            while (!operation.done) {
                await new Promise(resolve => setTimeout(resolve, 10000)); // Poll every 10 seconds
                operation = await checkVideoOperationStatus(apiKey, operation);
            }

            if (operation.error) {
                 throw new Error(operation.error.message || 'An error occurred during video processing.');
            }
            
            if (operation.response?.generatedVideos?.[0]?.video?.uri) {
                const videoUri = operation.response.generatedVideos[0].video.uri;
                const videoBlob = await fetchVideoFromUri(apiKey, videoUri);
                setGeneratedVideoBlob(videoBlob);
                setGeneratedVideoUrl(URL.createObjectURL(videoBlob));
            } else {
                throw new Error(t.videoGenerator.errorNoUri);
            }
        } catch (err: any) {
            console.error(err);
            setError(getFriendlyErrorMessage(err, t));
        } finally {
            setIsLoading(false);
        }
    }, [prompt, model, selectedAspectRatioOption, negativePrompt, t, apiKey]);

    const handleGenerate = useCallback(async () => {
        if (imageFile) {
            const imageParts = await blobToParts(imageFile);
            runVideoGeneration(imageParts);
        } else {
            runVideoGeneration();
        }
    }, [imageFile, runVideoGeneration]);

    const handleExtend = useCallback(async () => {
        if (!generatedVideoBlob) {
            setError(t.videoGenerator.errorNoExtend);
            return;
        }
        const videoParts = await blobToParts(generatedVideoBlob);
        runVideoGeneration(undefined, videoParts);
    }, [generatedVideoBlob, runVideoGeneration, t]);

    const handleDownload = () => {
        if (!generatedVideoBlob) return;
        const link = document.createElement('a');
        link.href = URL.createObjectURL(generatedVideoBlob);
        link.download = `generated-video-${Date.now()}.mp4`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            {/* Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="prompt-video-gen" className="block text-sm font-medium text-gray-300 mb-2">{t.common.promptLabel}</label>
                    <textarea
                        id="prompt-video-gen"
                        rows={4}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md p-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        placeholder={t.videoGenerator.promptPlaceholder}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="neg-prompt-video-gen" className="block text-sm font-medium text-gray-300 mb-2">{t.common.negativePromptLabel}</label>
                    <textarea
                        id="neg-prompt-video-gen"
                        rows={4}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md p-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        placeholder={t.common.negativePromptPlaceholder}
                        value={negativePrompt}
                        onChange={(e) => setNegativePrompt(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CustomDropdown
                    label={t.common.modelLabel}
                    options={videoModels.map(m => m.name)}
                    value={selectedModelName}
                    onChange={setSelectedModelName}
                />
                <CustomDropdown
                    label={t.common.aspectRatioLabel}
                    options={dropdownOptions}
                    value={selectedAspectRatioOption}
                    onChange={setSelectedAspectRatioOption}
                />
            </div>

            <div>
                <label htmlFor="image-upload-video" className="block text-sm font-medium text-gray-300 mb-2">{t.common.imageUploadLabel}</label>
                 <input
                    type="file"
                    id="image-upload-video"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700"
                />
            </div>

            <button
                onClick={handleGenerate}
                disabled={isLoading || !prompt}
                className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-md hover:bg-indigo-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors duration-300"
            >
                {isLoading ? t.videoGenerator.generatingButton : t.videoGenerator.generateButton}
            </button>
            
            {error && <div className="bg-red-900/50 border border-red-700 text-red-300 p-3 rounded-md whitespace-pre-wrap">{error}</div>}

            {/* Results */}
            {isLoading && <LoadingSpinner message={loadingMessage} />}

            {(imagePreview && !generatedVideoUrl) && (
                 <div className="bg-gray-700/50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2 text-center text-gray-300">{t.common.yourImage}</h3>
                    <div className="flex justify-center">
                        <img src={imagePreview} alt="Preview for video generation" className="rounded-md max-h-60" />
                    </div>
                </div>
            )}
            
            {generatedVideoUrl && (
                <div className="bg-gray-700/50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2 text-center text-gray-300">{t.videoGenerator.generatedVideoTitle}</h3>
                    <div className="flex justify-center">
                        <video src={generatedVideoUrl} controls className="rounded-md w-full max-w-2xl" />
                    </div>
                    <div className="flex justify-center items-center gap-4 mt-4">
                         <button
                            onClick={handleExtend}
                            disabled={isLoading}
                            className="bg-gray-600 text-white font-bold py-2 px-4 rounded-md hover:bg-gray-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors duration-300 inline-flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" /></svg>
                            {t.videoGenerator.extendButton}
                        </button>
                        <button
                            onClick={handleDownload}
                            disabled={!generatedVideoBlob}
                            className="bg-indigo-500 text-white font-bold py-2 px-4 rounded-md hover:bg-indigo-600 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors duration-300 inline-flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            {t.videoGenerator.downloadButton}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VideoGenerator;
