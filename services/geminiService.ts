import { GenerateVideosOperation } from '../types';
import {
    proxyGenerateVideo,
    proxyCheckVideoOperationStatus,
    proxyFetchVideoFromUri,
    proxyGenerateImage,
    proxyEditImage,
    proxyValidateApiKey,
} from './apiProxy';

// Re-export GenerateVideosOperation for components that use it.
export type { GenerateVideosOperation };

/**
 * Requests video generation or extension.
 * This function now acts as a client-side wrapper for the API proxy call.
 */
export const generateVideo = async (
    apiKey: string,
    prompt: string, 
    model: string,
    aspectRatio: string,
    negativePrompt: string,
    image?: {mimeType: string; data: string},
    video?: {mimeType: string; data: string}
): Promise<GenerateVideosOperation> => {
    if (!apiKey) throw new Error("API Key is required for this operation.");
    return proxyGenerateVideo(apiKey, prompt, model, aspectRatio, negativePrompt, image, video);
};

/**
 * Checks the status of a video generation operation.
 */
export const checkVideoOperationStatus = async (apiKey: string, operation: any): Promise<GenerateVideosOperation> => {
    if (!apiKey) throw new Error("API Key is required for this operation.");
    return proxyCheckVideoOperationStatus(apiKey, operation);
};

/**
 * Fetches the generated video file from a URI.
 */
export const fetchVideoFromUri = async (apiKey: string, uri: string): Promise<Blob> => {
    if (!apiKey) throw new Error("API Key is required for this operation.");
    return proxyFetchVideoFromUri(apiKey, uri);
};


/**
 * Requests image generation.
 */
export const generateImage = async (apiKey: string, prompt: string, aspectRatio: string): Promise<string> => {
    if (!apiKey) throw new Error("API Key is required for this operation.");
    return proxyGenerateImage(apiKey, prompt, aspectRatio);
};

/**
 * Requests image editing.
 */
export const editImage = async (apiKey: string, prompt: string, image: { mimeType: string; data: string }): Promise<{ imageUrl: string | null; text: string }> => {
    if (!apiKey) throw new Error("API Key is required for this operation.");
    return proxyEditImage(apiKey, prompt, image);
};

/**
 * Validates an API key by calling the proxy validation function.
 */
export const validateApiKey = async (key: string): Promise<{ isValid: boolean; message?: string }> => {
    return proxyValidateApiKey(key);
};