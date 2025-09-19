import React, { useState, useCallback, useEffect } from 'react';
import { generateVideo, checkVideoOperationStatus, fetchVideoFromUri } from '../services/geminiService';
import { type GenerateVideosOperation } from '../types';
import { blobToParts } from '../utils/fileUtils';
import LoadingSpinner from './LoadingSpinner';
import CustomDropdown from './CustomDropdown';
import { useLanguage } from '../contexts/LanguageContext';
import { useApiKey } from '../contexts/ApiKeyContext';
import { getFriendlyErrorMessage } from '../utils/errorUtils';

const videoModels = [
    { id: 'veo-2.0-generate-001', name: 'Veo 3 fast' },
    { id: 'veo-2.0-generate-001', name: 'Veo 3' },
    { id: 'veo-2.0-generate-001', name: 'Veo 2' },
];

const aspectRatios = ["16:9", "9:16"];

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
    const [aspectRatio, setAspectRatio] = useState("16:9");
    const model = videoModels.find(m => m.name === selectedModelName)?.id || videoModels[0].id;

    const getAspectRatioLabel = (ar: string): string => {
        switch(ar) {
            case "16:9":
                return t.common.aspectRatioLandscape;
            case "9:16":
                return t.common.aspectRatioPortrait;
            default:
                return ar;
        }
    }
    
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
        if (!apiKey) {
            setError("API Key is missing.");
            return;
        }
        if (!prompt) {
            setError(t.common.errorPromptRequired);
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedVideoUrl(null);
        setGeneratedVideoBlob(null);
        setLoadingMessage(t.videoGenerator.loadingMessages[0]);

        try {
            let operation: GenerateVideosOperation = await generateVideo(apiKey, prompt, model, aspectRatio, negativePrompt, imageForGeneration, videoForExtension);

            while (!operation.done) {
                await new Promise(resolve => setTimeout(resolve, 10000)); // Poll every 10 seconds
                operation = await checkVideoOperationStatus(apiKey, operation);
            }

            if (operation.error) {
                 throw new Error(operation.error.message || 'An error occurred during video processing on the backend.');
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
    }, [apiKey, prompt, model, aspectRatio, negativePrompt, t]);

    const handleSubmit = useCallback(async () => {
        const imageBase64 = imageFile ? await blobToParts(imageFile) : undefined;
        runVideoGeneration(imageBase64, undefined);
    }, [imageFile, runVideoGeneration]);

    const handleExtendVideo = useCallback(async () => {
        if (!generatedVideoBlob) {
            setError(t.videoGenerator.errorNoExtend);
            return;
        }
        // Clear the image so it's not sent with the extension request.
        setImageFile(null);
        setImagePreview(null);
        const videoBase64 = await blobToParts(generatedVideoBlob);
        runVideoGeneration(undefined, videoBase64);
    }, [generatedVideoBlob, runVideoGeneration, t]);

    const handleDownload = () => {
        if (!generatedVideoUrl) return;
        const link = document.createElement('a');
        link.href = generatedVideoUrl;
        link.download = `generated-video-${Date.now()}.mp4`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            <div>
                <label htmlFor="prompt-video" className="block text-sm font-medium text-gray-300 mb-2">{t.common.promptLabel}</label>
                <textarea
                    id="prompt-video"
                    rows={3}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md p-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    placeholder={t.videoGenerator.promptPlaceholder}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                />
            </div>
            
            <div>
                <label htmlFor="negative-prompt-video" className="block text-sm font-medium text-gray-300 mb-2">{t.common.negativePromptLabel}</label>
                <textarea
                    id="negative-prompt-video"
                    rows={2}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md p-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    placeholder={t.common.negativePromptPlaceholder}
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                />
            </div>
            
            <div>
                <CustomDropdown
                    label={t.common.modelLabel}
                    options={videoModels.map(m => m.name)}
                    value={selectedModelName}
                    onChange={setSelectedModelName}
                />
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">{t.common.aspectRatioLabel}</label>
                <div className="flex space-x-2 flex-wrap gap-2">
                    {aspectRatios.map(ar => (
                        <button
                            key={ar}
                            onClick={() => setAspectRatio(ar)}
                            className={`px-4 py-2 rounded-md transition-colors duration-200 text-sm font-medium ${aspectRatio === ar ? 'bg-indigo-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
                        >
                            {`${getAspectRatioLabel(ar)} (${ar})`}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                 <div className="flex-1">
                     <label htmlFor="image-upload-video" className="block text-sm font-medium text-gray-300 mb-2">{t.common.imageUploadLabel}</label>
                    <input
                        type="file"
                        id="image-upload-video"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700"
                    />
                </div>
                 <div className="flex-1">
                     <label className="block text-sm font-medium text-gray-300 mb-2 invisible">Extend Video</label>
                    <button
                        onClick={handleExtendVideo}
                        disabled={isLoading || !generatedVideoUrl}
                        className={`w-full font-bold py-2.5 px-4 rounded-full transition-colors duration-300 ${isLoading || !generatedVideoUrl ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}
                    >
                        {t.videoGenerator.extendButton}
                    </button>
                </div>
            </div>
            
            <button
                onClick={handleSubmit}
                disabled={isLoading || !prompt}
                className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-md hover:bg-indigo-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors duration-300"
            >
                {isLoading ? t.videoGenerator.generatingButton : t.videoGenerator.generateButton}
            </button>
            
            {error && <div className="bg-red-900/50 border border-red-700 text-red-300 p-3 rounded-md whitespace-pre-wrap">{error}</div>}

            {isLoading && <LoadingSpinner message={loadingMessage} />}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {imagePreview && (
                  <div className="bg-gray-700/50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-2 text-center text-gray-300">{t.common.yourImage}</h3>
                      <img src={imagePreview} alt="Uploaded preview" className="rounded-md mx-auto max-h-80" />
                  </div>
              )}
               {generatedVideoUrl && (
                <div className={`bg-gray-700/50 p-4 rounded-lg ${!imagePreview ? 'md:col-span-2' : ''}`}>
                    <h3 className="text-lg font-semibold mb-2 text-center text-gray-300">{t.videoGenerator.generatedVideoTitle}</h3>
                    <video controls autoPlay loop src={generatedVideoUrl} className="w-full rounded-md" />
                    <div className="text-center mt-4">
                        <button
                            onClick={handleDownload}
                            className="bg-indigo-500 text-white font-bold py-2 px-4 rounded-md hover:bg-indigo-600 transition-colors duration-300 inline-flex items-center gap-2"
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
        </div>
    );
};

export default VideoGenerator;