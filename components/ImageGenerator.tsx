
import React, { useState, useCallback } from 'react';
import { generateImage } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';

const aspectRatios = ["1:1", "16:9", "9:16", "4:3", "3:4"];

const ImageGenerator: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState("1:1");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

    const handleSubmit = useCallback(async () => {
        if (!prompt) {
            setError('Please enter a prompt.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedImageUrl(null);

        try {
            const imageUrl = await generateImage(prompt, aspectRatio);
            setGeneratedImageUrl(imageUrl);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'An unexpected error occurred during image generation.');
        } finally {
            setIsLoading(false);
        }
    }, [prompt, aspectRatio]);

    const handleDownload = () => {
        if (!generatedImageUrl) return;
        const link = document.createElement('a');
        link.href = generatedImageUrl;
        link.download = `generated-image-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            <div>
                <label htmlFor="prompt-image-gen" className="block text-sm font-medium text-gray-300 mb-2">Your Idea (Prompt)</label>
                <textarea
                    id="prompt-image-gen"
                    rows={3}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md p-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    placeholder="e.g., A robot holding a red skateboard."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                />
            </div>

            <div>
                <label htmlFor="aspect-ratio" className="block text-sm font-medium text-gray-300 mb-2">Aspect Ratio</label>
                <select
                    id="aspect-ratio"
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md p-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                >
                    {aspectRatios.map(ar => <option key={ar} value={ar}>{ar}</option>)}
                </select>
            </div>

            <button
                onClick={handleSubmit}
                disabled={isLoading || !prompt}
                className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-md hover:bg-indigo-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors duration-300"
            >
                {isLoading ? 'Creating Image...' : 'Generate Image'}
            </button>
            
            {error && <div className="bg-red-900/50 border border-red-700 text-red-300 p-3 rounded-md">{error}</div>}
            
            {isLoading && <LoadingSpinner message="Generating your image..." />}
            
            {generatedImageUrl && (
                <div className="bg-gray-700/50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2 text-center text-gray-300">Generated Image</h3>
                    <img src={generatedImageUrl} alt="Generated from prompt" className="rounded-md mx-auto max-h-96" />
                    <div className="text-center mt-4">
                        <button
                            onClick={handleDownload}
                            className="bg-indigo-500 text-white font-bold py-2 px-4 rounded-md hover:bg-indigo-600 transition-colors duration-300 inline-flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            Download Image
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageGenerator;