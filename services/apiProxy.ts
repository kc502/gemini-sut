import { GenerateVideosOperation } from '../types';

/**
 * A helper function to make POST requests to the backend proxy endpoints.
 * @param endpoint The API route to call (e.g., '/api/generate-image').
 * @param body The request payload.
 * @returns The JSON response from the proxy.
 */
async function apiPost<T>(endpoint: string, body: object): Promise<T> {
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        // Try to parse the error message from the proxy's JSON response
        const errorData = await response.json().catch(() => ({ message: `Request failed with status: ${response.status}` }));
        // The error from the proxy might be a simple message or a structured Gemini error.
        // We wrap it in a stringified object to be parsed by the error handler.
        throw new Error(JSON.stringify({ error: errorData }));
    }
    
    // For video fetch, the proxy returns a blob directly
    if (endpoint === '/api/fetch-video') {
        return response.blob() as Promise<T>;
    }

    return response.json();
}


/**
 * PROXY (Client-Side): Requests video generation via the backend.
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
    return apiPost<GenerateVideosOperation>('/api/generate-video', {
        apiKey, prompt, model, aspectRatio, negativePrompt, image, video
    });
};

/**
 * PROXY (Client-Side): Checks video operation status via the backend.
 */
export const proxyCheckVideoOperationStatus = async (apiKey: string, operation: any): Promise<GenerateVideosOperation> => {
    return apiPost<GenerateVideosOperation>('/api/check-video-status', { apiKey, operation });
};

/**
 * PROXY (Client-Side): Fetches the generated video via the backend.
 */
export const proxyFetchVideoFromUri = async (apiKey: string, uri: string): Promise<Blob> => {
    return apiPost<Blob>('/api/fetch-video', { apiKey, uri });
};

/**
 * PROXY (Client-Side): Requests image generation via the backend.
 */
export const proxyGenerateImage = async (apiKey: string, prompt: string, aspectRatio: string): Promise<string> => {
    const result = await apiPost<{ imageUrl: string }>('/api/generate-image', { apiKey, prompt, aspectRatio });
    return result.imageUrl;
};

/**
 * PROXY (Client-Side): Requests image editing via the backend.
 */
export const proxyEditImage = async (apiKey: string, prompt: string, image: { mimeType: string; data: string }): Promise<{ imageUrl: string | null; text: string }> => {
    return apiPost<{ imageUrl: string | null; text: string }>('/api/edit-image', { apiKey, prompt, image });
};

/**
 * PROXY (Client-Side): Validates an API key via the backend.
 */
export const proxyValidateApiKey = async (key: string): Promise<{ isValid: boolean; message?: string }> => {
    if (!key.trim()) {
        return { isValid: false };
    }
    return apiPost<{ isValid: boolean; message?: string }>('/api/validate-key', { key });
};
