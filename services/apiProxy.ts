import { GoogleGenAI, Modality } from "@google/genai";
import { GenerateVideosOperation } from '../types';

/**
 * Creates a Gemini AI instance for a single request.
 * @param apiKey The API key for this request.
 */
const getAiInstance = (apiKey: string): GoogleGenAI => {
    if (!apiKey) {
        throw new Error("API key is required.");
    }
    return new GoogleGenAI({ apiKey });
};

/**
 * PROXY: Requests video generation.
 */
export const proxyGenerateVideo = async (
    apiKey: string,
    prompt: string, 
    model: string,
    aspectRatio: string,
    negativePrompt: string,
    image?: {mimeType: string; data: string},
    video?: {mimeType: string; data: string}
): Promise<GenerateVideosOperation> => {
    const aiInstance = getAiInstance(apiKey);
    
    const request: any = { model, prompt };
    if (image) {
        request.image = {
            imageBytes: image.data,
            mimeType: image.mimeType,
        };
    }
    if (video) {
        request.video = {
            videoBytes: video.data,
            mimeType: video.mimeType,
        };
    }
    
    const config: any = {
        numberOfVideos: 1,
        aspectRatio: aspectRatio as "16:9" | "9:16",
    };

    if (negativePrompt) {
        config.negativePrompt = negativePrompt;
    }

    request.config = config;

    return await aiInstance.models.generateVideos(request) as GenerateVideosOperation;
};

/**
 * PROXY: Checks the status of a video generation operation.
 */
export const proxyCheckVideoOperationStatus = async (apiKey: string, operation: any): Promise<GenerateVideosOperation> => {
    const aiInstance = getAiInstance(apiKey);
    return await aiInstance.operations.getVideosOperation({ operation }) as GenerateVideosOperation;
};

/**
 * PROXY: Fetches the generated video file from a URI.
 */
export const proxyFetchVideoFromUri = async (apiKey: string, uri: string): Promise<Blob> => {
     if (!apiKey) {
        throw new Error("API Key is not available for fetching video.");
    }
    const response = await fetch(`${uri}&key=${apiKey}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch video: ${response.statusText}`);
    }
    return response.blob();
};


/**
 * PROXY: Requests image generation.
 */
export const proxyGenerateImage = async (apiKey: string, prompt: string, aspectRatio: string): Promise<string> => {
    const aiInstance = getAiInstance(apiKey);
    const response = await aiInstance.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: aspectRatio as "1:1" | "16:9" | "9:16" | "4:3" | "3:4",
        },
    });

    const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
    const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
    return imageUrl;
};

/**
 * PROXY: Requests image editing.
 */
export const proxyEditImage = async (apiKey: string, prompt: string, image: { mimeType: string; data: string }): Promise<{ imageUrl: string | null; text: string }> => {
    const aiInstance = getAiInstance(apiKey);

    const imagePart = {
        inlineData: {
            data: image.data,
            mimeType: image.mimeType,
        },
    };
    const textPart = { text: prompt };

    const response = await aiInstance.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: {
            parts: [imagePart, textPart],
        },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
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

/**
 * PROXY: Validates an API key by making a lightweight test call to the Gemini API.
 */
export const proxyValidateApiKey = async (key: string): Promise<{ isValid: boolean; message?: string }> => {
    try {
        if (!key) {
            return { isValid: false, message: 'errors.invalidApiKey' };
        }
        const aiInstance = getAiInstance(key);
        // A very lightweight call to check if the key is valid and has permissions.
        await aiInstance.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: 'hello',
            config: {
                maxOutputTokens: 1,
                thinkingConfig: { thinkingBudget: 0 }
            }
        });
        return { isValid: true };
    } catch (error: any) {
        console.error("API Key validation failed:", error);
        let messageKey = 'errors.invalidApiKeyDefault';
        const errorMessage = error.message || '';

        if (errorMessage.includes('API key not valid')) {
            messageKey = 'errors.invalidApiKey';
        } else if (errorMessage.includes('permission denied')) {
            messageKey = 'errors.permissionDenied';
        } else if (errorMessage.includes('RESOURCE_EXHAUSTED')) {
            messageKey = 'errors.quotaExceeded';
        } else if (error.toString().toLowerCase().includes('network')) {
             messageKey = 'errors.validationNetwork';
        }
        return { isValid: false, message: messageKey };
    }
};