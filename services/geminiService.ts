import { GoogleGenAI, Modality } from "@google/genai";
import { GenerateVideosOperation } from '../types';

// Cache for the GoogleGenAI instance to avoid re-creating it on every call.
let aiInstance: GoogleGenAI | null = null;
let lastUsedApiKey: string | null = null;

/**
 * Gets a cached instance of the GoogleGenAI client.
 * If the API key changes, it creates a new instance.
 */
const getAiInstance = (apiKey: string): GoogleGenAI => {
    if (!aiInstance || lastUsedApiKey !== apiKey) {
        aiInstance = new GoogleGenAI({ apiKey });
        lastUsedApiKey = apiKey;
    }
    return aiInstance;
};

// Re-export GenerateVideosOperation for components that use it.
export type { GenerateVideosOperation };

/**
 * Validates a Gemini API key by making a lightweight, inexpensive call.
 */
export const validateApiKey = async (apiKey: string): Promise<{ isValid: boolean, message?: string }> => {
    try {
        if (!apiKey) {
            return { isValid: false, message: 'errors.invalidApiKey' };
        }
        const ai = getAiInstance(apiKey);
        // Make a very lightweight, cheap call to validate the key.
        await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: 'ping',
            config: { maxOutputTokens: 1, thinkingConfig: { thinkingBudget: 0 } }
        });
        return { isValid: true };
    } catch (error: any) {
        console.error("API Key validation failed:", error.message);
        let messageKey = 'errors.invalidApiKeyDefault';
        const errorMessage = error.message || '';

        if (errorMessage.includes('API key not valid')) {
            messageKey = 'errors.invalidApiKey';
        } else if (errorMessage.includes('permission denied')) {
            messageKey = 'errors.permissionDenied';
        } else if (errorMessage.includes('RESOURCE_EXHAUSTED')) {
            messageKey = 'errors.quotaExceeded';
        }
        
        return { isValid: false, message: messageKey };
    }
};

/**
 * Requests video generation or extension using the Gemini API.
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
    const ai = getAiInstance(apiKey);
    const request: any = { model, prompt };
    if (image) {
        request.image = { imageBytes: image.data, mimeType: image.mimeType };
    }
    if (video) {
        request.video = { videoBytes: video.data, mimeType: video.mimeType };
    }
    
    const config: any = {
        numberOfVideos: 1,
        aspectRatio: aspectRatio,
        generateAudio: true,
    };
    if (negativePrompt) {
        config.negativePrompt = negativePrompt;
    }
    request.config = config;

    const operation = await ai.models.generateVideos(request);
    return operation as GenerateVideosOperation;
};

/**
 * Checks the status of a video generation operation.
 */
export const checkVideoOperationStatus = async (apiKey: string, operation: any): Promise<GenerateVideosOperation> => {
    const ai = getAiInstance(apiKey);
    const result = await ai.operations.getVideosOperation({ operation });
    return result as GenerateVideosOperation;
};

/**
 * Fetches the generated video file from a URI.
 * The API key is appended to the URI for authorization.
 */
export const fetchVideoFromUri = async (apiKey: string, uri: string): Promise<Blob> => {
    const response = await fetch(`${uri}&key=${apiKey}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch video: ${response.statusText}`);
    }
    return response.blob();
};


/**
 * Requests image generation using the Gemini API.
 */
export const generateImage = async (apiKey: string, prompt: string, aspectRatio: string): Promise<string> => {
    const ai = getAiInstance(apiKey);
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: aspectRatio as "1:1" | "3:4" | "4:3" | "9:16" | "16:9",
        },
    });

    const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
    const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
    return imageUrl;
};

/**
 * Requests image editing using the Gemini API.
 */
export const editImage = async (apiKey: string, prompt: string, image: { mimeType: string; data: string }): Promise<{ imageUrl: string | null; text: string }> => {
    const ai = getAiInstance(apiKey);
    const imagePart = { inlineData: { data: image.data, mimeType: image.mimeType } };
    const textPart = { text: prompt };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: { parts: [imagePart, textPart] },
        config: { responseModalities: [Modality.IMAGE, Modality.TEXT] },
    });

    let imageUrl: string | null = null;
    let text = '';

    if (response.candidates && response.candidates.length > 0 && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.text) {
                text += part.text;
            } else if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                const mimeType = part.inlineData.mimeType;
                imageUrl = `data:${mimeType};base64,${base64ImageBytes}`;
            }
        }
    }
    
    return { imageUrl, text };
};