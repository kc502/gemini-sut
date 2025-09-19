

import React, { useState, useCallback } from 'react';
import { editImage } from '../services/geminiService';
import { blobToParts } from '../utils/fileUtils';
import LoadingSpinner from './LoadingSpinner';

const ImageEditor: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);
    const [responseText, setResponseText] = useState<string>('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setOriginalImageUrl(URL.createObjectURL(file));
            setEditedImageUrl(null);
            setResponseText('');
        }
    };

    const handleSubmit = useCallback(async () => {
        if (!prompt || !imageFile) {
            setError('Please provide both an image and an editing prompt.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setEditedImageUrl(null);
        setResponseText('');
        
        try {
            const imageBase64 = await blobToParts(imageFile);
            const result = await editImage(prompt, imageBase64);
            if(result.imageUrl) {
                setEditedImageUrl(result.imageUrl);
            } else {
                setError("The model did not return an edited image.");
            }
            setResponseText(result.text);

        } catch (err: any) {
            console.error(err);
            setError(err.message || 'An unexpected error occurred during image editing.');
        } finally {
            setIsLoading(false);
        }
    }, [prompt, imageFile]);
    
    const handleDownload = () => {
        if (!editedImageUrl) return;
        const link = document.createElement('a');
        link.href = editedImageUrl;
        link.download = `edited-image-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            <div>
                <label htmlFor="image-upload-edit" className="block text-sm font-medium text-gray-300 mb-2">Original Image</label>
                <input
                    type="file"
                    id="image-upload-edit"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700"
                />
            </div>
            
            <div>
                <label htmlFor="prompt-image-edit" className="block text-sm font-medium text-gray-300 mb-2">Editing Instructions (Prompt)</label>
                <textarea
                    id="prompt-image-edit"
                    rows={3}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md p-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    placeholder="e.g., add a llama next to the main subject"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                />
            </div>

            <button
                onClick={handleSubmit}
                disabled={isLoading || !prompt || !imageFile}
                className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-md hover:bg-indigo-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors duration-300"
            >
                {isLoading ? 'Editing in Progress...' : 'Edit Image'}
            </button>
            
            {error && <div className="bg-red-900/50 border border-red-700 text-red-300 p-3 rounded-md">{error}</div>}
            
            {isLoading && <LoadingSpinner message="Applying your creative edits..." />}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {originalImageUrl && (
                    <div className="bg-gray-700/50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold mb-2 text-center text-gray-300">Original</h3>
                        <img src={originalImageUrl} alt="Original for editing" className="rounded-md mx-auto max-h-96" />
                    </div>
                )}
                {editedImageUrl && (
                    <div className="bg-gray-700/50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold mb-2 text-center text-gray-300">Edited</h3>
                        <img src={editedImageUrl} alt="Edited result" className="rounded-md mx-auto max-h-96" />
                        {responseText && <p className="text-gray-400 mt-4 text-sm italic">{responseText}</p>}
                        <div className="text-center mt-4">
                            <button
                                onClick={handleDownload}
                                className="bg-indigo-500 text-white font-bold py-2 px-4 rounded-md hover:bg-indigo-600 transition-colors duration-300 inline-flex items-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                                Download Edited Image
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImageEditor;