import { GoogleGenAI } from "@google/genai";

// This is a server-side file.
// IMPORTANT: Do not import or use this file in any client-side code.

/**
 * Creates a Gemini AI instance for a single request.
 * @param apiKey The API key for this request.
 */
export const getAiInstance = (apiKey: string): GoogleGenAI => {
    if (!apiKey) {
        throw new Error("API key is missing.");
    }
    return new GoogleGenAI({ apiKey });
};
