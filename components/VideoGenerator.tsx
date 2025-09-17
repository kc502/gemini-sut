import React, { useState, useCallback, useEffect } from 'react';
import { generateVideo, checkVideoOperationStatus, fetchVideoFromUri } from '../services/geminiService';
import { fileToBase64 } from '../utils/fileUtils';
import LoadingSpinner from './LoadingSpinner';
import type { GenerateVideosOperation } from '@google/genai';

const loadingMessages = [
    "Warming up the digital director's chair...",
    "Assembling pixels into a masterpiece...",
    "Teaching polygons how to act...",
    "Rendering the final cut, this can take a moment...",
    "Adding sound... just kidding, it's silent film for now!",
    "Finalizing your cinematic vision...",
];

const videoModels = {
    "Veo 2": "veo-2.0-generate-001",
    "Veo 3 Preview": "veo-3.0-preview-001",
    "Veo 3 Fast Preview": "veo-3.0-fast-preview-001",
};

const videoAspectRatios = ["16:9", "9:16", "1:1"];
const videoResolutions = ["720p", "1080p"];

const VideoGenerator: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [selectedModel, setSelectedModel] = useState(videoModels["Veo 2"]);
    const [aspectRatio, setAspectRatio] = useState(videoAspectRatios[0]);
    const [resolution, setResolution] = useState(videoResolutions[0]);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
    const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);

    useEffect(() => {
        // FIX: Use `ReturnType<typeof setInterval>` for correct typing of interval ID in browser environment.
        let interval: ReturnType<typeof setInterval>;
        if (isLoading) {
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
    }, [isLoading]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            setGeneratedVideoUrl(null);
        }
    };

    const handleSubmit = useCallback(async () => {
        if (!prompt) {
            setError('Please enter a prompt.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedVideoUrl(null);
        setLoadingMessage(loadingMessages[0]);

        try {
            const imageBase64 = imageFile ? await fileToBase64(imageFile) : undefined;
            let operation: GenerateVideosOperation = await generateVideo(prompt, selectedModel, aspectRatio, resolution, imageBase64);

            while (!operation.done) {
                await new Promise(resolve => setTimeout(resolve, 10000)); // Poll every 10 seconds
                operation = await checkVideoOperationStatus(operation);
            }

            if (operation.response?.generatedVideos?.[0]?.video?.uri) {
                const videoUri = operation.response.generatedVideos[0].video.uri;
                const videoBlob = await fetchVideoFromUri(videoUri);
                setGeneratedVideoUrl(URL.createObjectURL(videoBlob));
            } else {
                throw new Error("Video generation completed but no video URI was found.");
            }

        } catch (err: any) {
            console.error(err);
            setError(err.message || 'An unexpected error occurred during video generation.');
        } finally {
            setIsLoading(false);
        }
    }, [prompt, imageFile, selectedModel, aspectRatio, resolution]);

    return (
        <div className="space-y-6">
            <div>
                <label htmlFor="prompt-video" className="block text-sm font-medium text-gray-300 mb-2">Your Vision (Prompt)</label>
                <textarea
                    id="prompt-video"
                    rows={3}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md p-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    placeholder="e.g., A neon hologram of a cat driving at top speed"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                />
            </div>
            
            <div>
                <label htmlFor="video-model" className="block text-sm font-medium text-gray-300 mb-2">Video Model</label>
                <select
                    id="video-model"
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md p-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                >
                    {Object.entries(videoModels).map(([name, id]) => <option key={id} value={id}>{name}</option>)}
                </select>
            </div>

            <div>
                <label htmlFor="video-aspect-ratio" className="block text-sm font-medium text-gray-300 mb-2">Aspect Ratio</label>
                <select
                    id="video-aspect-ratio"
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md p-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                >
                    {videoAspectRatios.map(ar => <option key={ar} value={ar}>{`${ar} ${ar === '16:9' ? '(Landscape)' : ar === '9:16' ? '(Portrait)' : '(Square)'}`}</option>)}
                </select>
            </div>

            <div>
                <label htmlFor="video-resolution" className="block text-sm font-medium text-gray-300 mb-2">Resolution</label>
                <select
                    id="video-resolution"
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md p-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                >
                    {videoResolutions.map(res => <option key={res} value={res}>{res}</option>)}
                </select>
            </div>

            <div>
                 <label htmlFor="image-upload-video" className="block text-sm font-medium text-gray-300 mb-2">Inspiration Image (Optional)</label>
                <input
                    type="file"
                    id="image-upload-video"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700"
                />
            </div>
            
            <button
                onClick={handleSubmit}
                disabled={isLoading || !prompt}
                className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-md hover:bg-indigo-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors duration-300"
            >
                {isLoading ? 'Conjuring Video...' : 'Generate Video'}
            </button>
            
            {error && <div className="bg-red-900/50 border border-red-700 text-red-300 p-3 rounded-md">{error}</div>}

            {isLoading && <LoadingSpinner message={loadingMessage} />}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {imagePreview && (
                  <div className="bg-gray-700/50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-2 text-center text-gray-300">Your Image</h3>
                      <img src={imagePreview} alt="Uploaded preview" className="rounded-md mx-auto max-h-80" />
                  </div>
              )}
               {generatedVideoUrl && (
                <div className={`bg-gray-700/50 p-4 rounded-lg ${!imagePreview && 'md:col-span-2'}`}>
                    <h3 className="text-lg font-semibold mb-2 text-center text-gray-300">Generated Video</h3>
                    <video controls autoPlay loop src={generatedVideoUrl} className="w-full rounded-md" />
                </div>
               )}
            </div>
        </div>
    );
};

export default VideoGenerator;