import { GoogleGenAI, Modality } from "@google/genai";

// Module-level variables to hold the initialized client and API key.
let ai: GoogleGenAI | null = null;
let apiKey: string | null = null;

/**
 * Initializes the Gemini AI service with the provided API key.
 * This must be called before any other service function.
 * @param key The user's Google Gemini API key.
 */
export const initializeGemini = (key: string) => {
    apiKey = key;
    ai = new GoogleGenAI({ apiKey });
};


/**
 * Returns the initialized GoogleGenAI instance.
 * Throws an error if the service has not been initialized.
 */
const getAiInstance = (): GoogleGenAI => {
    if (!ai) {
        throw new Error("Gemini AI service not initialized. Please provide an API key.");
    }
    return ai;
};

// Define a type for the video generation operation object, as it's not exported by the SDK.
export interface GenerateVideosOperation {
    name: string;
    done: boolean;
    response?: {
        generatedVideos?: Array<{
            video?: {
                uri: string;
            };
        }>;
    };
    error?: any;
    metadata?: any;
}

/**
 * Requests video generation or extension.
 */
export const generateVideo = async (
    prompt: string, 
    model: string, 
    image?: {mimeType: string; data: string},
    video?: {mimeType: string; data: string}
): Promise<GenerateVideosOperation> => {
    const aiInstance = getAiInstance();

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
    request.config = {
        numberOfVideos: 1,
    };

    const operation: any = await aiInstance.models.generateVideos(request);
    return operation as GenerateVideosOperation;
};

/**
 * Checks the status of a video generation operation.
 */
export const checkVideoOperationStatus = async (operation: any): Promise<GenerateVideosOperation> => {
    const aiInstance = getAiInstance();
    const updatedOperation: any = await aiInstance.operations.getVideosOperation({ operation });
    return updatedOperation as GenerateVideosOperation;
};

/**
 * Fetches the generated video file from a URI.
 * @param uri The video URI provided by the Gemini API.
 * @returns A Blob containing the video data.
 */
export const fetchVideoFromUri = async (uri: string): Promise<Blob> => {
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
 * Requests image generation.
 * @returns A base64 encoded data URL for the generated image.
 */
export const generateImage = async (prompt: string, aspectRatio: string): Promise<string> => {
    const aiInstance = getAiInstance();
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
 * Requests image editing. This function is added to resolve an error in the ImageEditor component.
 * @param prompt The editing instructions.
 * @param image The image to edit, as a base64 encoded string with mime type.
 * @returns An object containing the edited image URL and any accompanying text.
 */
export const editImage = async (prompt: string, image: { mimeType: string; data: string }): Promise<{ imageUrl: string | null; text: string }> => {
    const aiInstance = getAiInstance();

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
 * Validates an API key by making a lightweight test call to the Gemini API.
 * @param key The API key to validate.
 * @returns An object with a boolean `isValid` and an optional error `message`.
 */
export const validateApiKey = async (key: string): Promise<{ isValid: boolean; message?: string }> => {
    if (!key || key.trim().length === 0) {
        return { isValid: false }; // No message needed, UI handles empty input
    }
    
    try {
        const validationAi = new GoogleGenAI({ apiKey: key });
        // Use a minimal, low-cost request for validation
        await validationAi.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: 'h', // Minimal prompt
            config: {
                thinkingConfig: { thinkingBudget: 0 } // Fastest response
            }
        });
        return { isValid: true };
    } catch (error: any) {
        console.error("API Key Validation Error:", error);
        if (error.message && (error.message.includes('API key not valid') || error.message.includes('invalid'))) {
            return { isValid: false, message: 'The provided API key is not valid. Please check and try again.' };
        }
        if (error.message && error.message.includes('permission denied')) {
            return { isValid: false, message: 'Permission denied. Please ensure your API key is enabled for the Gemini API.' };
        }
        return { isValid: false, message: 'Could not validate the API key. Please check your network connection.' };
    }
};