import { GoogleGenAI, Modality, GenerateContentResponse, GenerateVideosOperation } from "@google/genai";

let ai: GoogleGenAI | null = null;
let currentApiKey: string | null = null;

export const initializeGemini = (apiKey: string) => {
    ai = new GoogleGenAI({ apiKey });
    currentApiKey = apiKey;
};

const getAiInstance = (): GoogleGenAI => {
    if (!ai) {
        throw new Error("Gemini AI service not initialized. Please set a valid API key.");
    }
    return ai;
};

export const validateApiKey = async (apiKey: string): Promise<boolean> => {
    if (!apiKey) return false;
    try {
        const tempAi = new GoogleGenAI({ apiKey });
        // Make a lightweight, non-streaming call to check for authentication errors.
        await tempAi.models.generateContent({ model: 'gemini-2.5-flash', contents: 'Hi' });
        return true;
    } catch (error: any) {
        // Any error during this test is considered a validation failure.
        console.error("API Key validation failed:", error.message);
        return false;
    }
};


export const generateVideo = async (prompt: string, model: string, aspectRatio: string, resolution: string, image?: {mimeType: string; data: string}): Promise<GenerateVideosOperation> => {
    const aiInstance = getAiInstance();
    const imagePart = image ? { imageBytes: image.data, mimeType: image.mimeType } : undefined;

    return await aiInstance.models.generateVideos({
        model,
        prompt,
        image: imagePart,
        config: {
            numberOfVideos: 1,
            aspectRatio: aspectRatio as "16:9" | "9:16" | "1:1",
            resolution: resolution as "720p" | "1080p",
        }
    });
};

export const checkVideoOperationStatus = async (operation: GenerateVideosOperation): Promise<GenerateVideosOperation> => {
    const aiInstance = getAiInstance();
    return await aiInstance.operations.getVideosOperation({ operation });
};

export const fetchVideoFromUri = async (uri: string): Promise<Blob> => {
    if (!currentApiKey) {
        throw new Error("API Key is not available for fetching video.");
    }
    const response = await fetch(`${uri}&key=${currentApiKey}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch video: ${response.statusText}`);
    }
    return response.blob();
};


export const generateImage = async (prompt: string, aspectRatio: string): Promise<string> => {
    const aiInstance = getAiInstance();
    const response = await aiInstance.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/png',
            aspectRatio: aspectRatio as "1:1" | "3:4" | "4:3" | "9:16" | "16:9",
        },
    });

    const base64ImageBytes = response.generatedImages[0].image.imageBytes;
    return `data:image/png;base64,${base64ImageBytes}`;
};

export const editImage = async (prompt: string, image: {mimeType: string, data: string}): Promise<{ text: string, imageUrl: string | null }> => {
    const aiInstance = getAiInstance();
    const response: GenerateContentResponse = await aiInstance.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: {
            parts: [
                {
                    inlineData: {
                        data: image.data,
                        mimeType: image.mimeType,
                    },
                },
                {
                    text: prompt,
                },
            ],
        },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });

    let resultText = "";
    let resultImageUrl: string | null = null;

    for (const part of response.candidates[0].content.parts) {
        if (part.text) {
            resultText += part.text;
        } else if (part.inlineData) {
            const base64ImageBytes: string = part.inlineData.data;
            resultImageUrl = `data:image/png;base64,${base64ImageBytes}`;
        }
    }
    return { text: resultText, imageUrl: resultImageUrl };
};
