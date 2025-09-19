import React, { useState, useCallback, useEffect } from 'react';
import { generateVideo, checkVideoOperationStatus, fetchVideoFromUri, type GenerateVideosOperation } from '../services/geminiService';
import { blobToParts } from '../utils/fileUtils';
import LoadingSpinner from './LoadingSpinner';

const loadingMessages = [
    "ဒါရိုက်တာနေရာကို အသင့်ပြင်နေသည်...",
    "အကောင်းဆုံး ပုံထွက်အောင် ဖန်တီးနေသည်...",
    "AI ကို သရုပ်ဆောင်နည်း သင်ပေးနေသည်...",
    "နောက်ဆုံး အဆင့် ဖန်တီးနေသည်၊ ခဏစောင့်ပါ...",
    "သင်၏ ရုပ်ရှင်ကို အပြီးသတ်နေသည်...",
];

const videoModels = [
    { id: 'veo-3.0-generate-001-fast', name: 'Veo 3 (Fast)' },
    { id: 'veo-3.0-generate-001', name: 'Veo 3' },
    { id: 'veo-2.0-generate-001', name: 'Veo 2' },
];

const resolutions = ["1080p", "720p"];
const aspectRatios = ["16:9", "9:16"];


const VideoGenerator: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
    const [generatedVideoBlob, setGeneratedVideoBlob] = useState<Blob | null>(null);
    const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);
    const [model, setModel] = useState(videoModels[0].id);
    const [resolution, setResolution] = useState(resolutions[0]);
    const [aspectRatio, setAspectRatio] = useState(aspectRatios[0]);

    useEffect(() => {
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
            setGeneratedVideoBlob(null);
        }
    };

    const runVideoGeneration = useCallback(async (
        imageForGeneration?: { mimeType: string; data: string },
        videoForExtension?: { mimeType: string; data: string }
    ) => {
        if (!prompt) {
            setError('ကျေးဇူးပြု၍ prompt တစ်ခုထည့်ပါ။');
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedVideoUrl(null);
        setGeneratedVideoBlob(null);
        setLoadingMessage(loadingMessages[0]);

        try {
            let operation: GenerateVideosOperation = await generateVideo(prompt, model, imageForGeneration, videoForExtension);

            while (!operation.done) {
                await new Promise(resolve => setTimeout(resolve, 10000)); // Poll every 10 seconds
                operation = await checkVideoOperationStatus(operation);
            }

            if (operation.error) {
                 throw new Error(operation.error.message || 'An error occurred during video processing on the backend.');
            }
            
            if (operation.response?.generatedVideos?.[0]?.video?.uri) {
                const videoUri = operation.response.generatedVideos[0].video.uri;
                const videoBlob = await fetchVideoFromUri(videoUri);
                setGeneratedVideoBlob(videoBlob);
                setGeneratedVideoUrl(URL.createObjectURL(videoBlob));
            } else {
                throw new Error("Video generation completed but no video URI was found.");
            }
        } catch (err: any) {
            console.error(err);
            const errorMessage = typeof err === 'object' && err !== null && 'message' in err ? String(err.message) : 'An unexpected error occurred during video generation.';
            
            // Attempt to parse a JSON error message if it's a string
            if (typeof err.message === 'string' && err.message.startsWith('{')) {
                try {
                    const parsedError = JSON.parse(err.message);
                    setError(`Error: ${parsedError.error.message} (Code: ${parsedError.error.code}, Status: ${parsedError.error.status})`);
                } catch (parseError) {
                    setError(errorMessage);
                }
            } else {
                setError(errorMessage);
            }

        } finally {
            setIsLoading(false);
        }
    }, [prompt, model]);

    const handleSubmit = useCallback(async () => {
        const imageBase64 = imageFile ? await blobToParts(imageFile) : undefined;
        runVideoGeneration(imageBase64, undefined);
    }, [imageFile, runVideoGeneration]);

    const handleExtendVideo = useCallback(async () => {
        if (!generatedVideoBlob) {
            setError("No video available to extend.");
            return;
        }
        // Clear the image so it's not sent with the extension request.
        setImageFile(null);
        setImagePreview(null);
        const videoBase64 = await blobToParts(generatedVideoBlob);
        runVideoGeneration(undefined, videoBase64);
    }, [generatedVideoBlob, runVideoGeneration]);

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
                <label htmlFor="prompt-video" className="block text-sm font-medium text-gray-300 mb-2">သင်၏ စိတ်ကူး (Prompt)</label>
                <textarea
                    id="prompt-video"
                    rows={3}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md p-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    placeholder="e.g., A neon hologram of a cat driving at top speed"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 <div>
                    <label htmlFor="model-select-video" className="block text-sm font-medium text-gray-300 mb-2">Model</label>
                    <select 
                        id="model-select-video" 
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md p-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    >
                        {videoModels.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                 </div>
                 <div>
                    <label htmlFor="resolution-select" className="block text-sm font-medium text-gray-300 mb-2">Resolution</label>
                    <select 
                        id="resolution-select" 
                        value={resolution}
                        onChange={(e) => setResolution(e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md p-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    >
                        {resolutions.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                 </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Aspect Ratio</label>
                    <div className="flex space-x-2 flex-wrap gap-2">
                        {aspectRatios.map(ar => (
                            <button
                                key={ar}
                                onClick={() => setAspectRatio(ar)}
                                className={`flex-1 px-4 py-2 rounded-md transition-colors duration-200 text-sm font-medium ${aspectRatio === ar ? 'bg-indigo-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
                            >
                                {ar}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
                 <div className="flex-1">
                     <label htmlFor="image-upload-video" className="block text-sm font-medium text-gray-300 mb-2">ပုံထည့်သွင်းရန် (Image Upload)</label>
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
                        ဗီဒီယို ဆက်ရန် (Extend Video)
                    </button>
                </div>
            </div>
            
            <button
                onClick={handleSubmit}
                disabled={isLoading || !prompt}
                className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-md hover:bg-indigo-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors duration-300"
            >
                {isLoading ? 'ဗီဒီယို ဖန်တီးနေသည်...' : 'ဗီဒီယို ဖန်တီးမည်'}
            </button>
            
            {error && <div className="bg-red-900/50 border border-red-700 text-red-300 p-3 rounded-md">{error}</div>}

            {isLoading && <LoadingSpinner message={loadingMessage} />}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {imagePreview && (
                  <div className="bg-gray-700/50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-2 text-center text-gray-300">သင်၏ ပုံ</h3>
                      <img src={imagePreview} alt="Uploaded preview" className="rounded-md mx-auto max-h-80" />
                  </div>
              )}
               {generatedVideoUrl && (
                <div className={`bg-gray-700/50 p-4 rounded-lg ${!imagePreview ? 'md:col-span-2' : ''}`}>
                    <h3 className="text-lg font-semibold mb-2 text-center text-gray-300">ဖန်တီးပြီး ဗီဒီယို</h3>
                    <video controls autoPlay loop src={generatedVideoUrl} className="w-full rounded-md" />
                    <div className="text-center mt-4">
                        <button
                            onClick={handleDownload}
                            className="bg-indigo-500 text-white font-bold py-2 px-4 rounded-md hover:bg-indigo-600 transition-colors duration-300 inline-flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            ဗီဒီယိုကို Download ရယူမည်
                        </button>
                    </div>
                </div>
               )}
            </div>
        </div>
    );
};

export default VideoGenerator;