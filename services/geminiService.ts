// Define types to replace SDK imports, as we are now using a proxy.
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

// Store the API key provided by the user.
let currentApiKey: string | null = null;

/**
 * Initializes the service with the user's API key.
 * @param apiKey The Gemini API key.
 */
export const initializeGemini = (apiKey: string) => {
    currentApiKey = apiKey;
};

/**
 * A helper function to make requests to our backend proxy.
 * This abstracts away the fetch logic and automatically includes the API key.
 * @param endpoint The proxy endpoint to hit (e.g., '/generate-video').
 * @param body The request body.
 * @returns The JSON response from the proxy.
 */
const proxyFetch = async (endpoint: string, body: object) => {
    if (!currentApiKey) {
        throw new Error("Gemini AI service not initialized. Please set a valid API key.");
    }

    const response = await fetch(`/api${endpoint}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...body, apiKey: currentApiKey }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || `An error occurred with the proxy service at ${endpoint}.`);
    }

    return response.json();
};

/**
 * Validates an API key by sending it to a proxy endpoint for verification.
 * @param apiKey The API key to validate.
 * @returns True if the key is valid, false otherwise.
 */
export const validateApiKey = async (apiKey: string): Promise<boolean> => {
    if (!apiKey) return false;
    try {
        // This endpoint does not use the stored currentApiKey, as it's for validation.
        const response = await fetch('/api/validate-key', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ apiKey }),
        });
        if (response.ok) {
            const data = await response.json();
            // Assuming the proxy returns a { valid: boolean } payload
            return data.valid;
        }
        return false;
    } catch (error) {
        console.error("API Key validation request failed:", error);
        return false;
    }
};

/**
 * Requests video generation through the proxy.
 */
export const generateVideo = async (prompt: string, model: string, aspectRatio: string, resolution: string, image?: {mimeType: string; data: string}): Promise<GenerateVideosOperation> => {
    return proxyFetch('/generate-video', { prompt, model, aspectRatio, resolution, image });
};

/**
 * Checks the status of a video generation operation through the proxy.
 */
export const checkVideoOperationStatus = async (operation: GenerateVideosOperation): Promise<GenerateVideosOperation> => {
    return proxyFetch('/video-status', { operation });
};

/**
 * Fetches the generated video file from a URI via the proxy.
 * The proxy handles appending the API key to the final request to Google's servers.
 * @param uri The video URI provided by the Gemini API.
 * @returns A Blob containing the video data.
 */
export const fetchVideoFromUri = async (uri: string): Promise<Blob> => {
    if (!currentApiKey) {
        throw new Error("API Key is not available for fetching video.");
    }

    // This request is special, it needs to get a blob back, not JSON.
    const response = await fetch(`/api/fetch-video`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uri, apiKey: currentApiKey })
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch video via proxy: ${response.statusText}`);
    }
    return response.blob();
};

/**
 * Requests image generation through the proxy.
 * @returns A data URL for the generated image.
 */
export const generateImage = async (prompt: string, aspectRatio: string): Promise<string> => {
    const result = await proxyFetch('/generate-image', { prompt, aspectRatio });
    if (!result || !result.imageUrl) {
        throw new Error("Proxy did not return a valid image URL.");
    }
    return result.imageUrl;
};

/**
 * Requests image editing through the proxy.
 * @returns An object containing the model's text response and the edited image URL.
 */
export const editImage = async (prompt: string, image: {mimeType: string, data: string}): Promise<{ text: string, imageUrl: string | null }> => {
    return proxyFetch('/edit-image', { prompt, image });
};
