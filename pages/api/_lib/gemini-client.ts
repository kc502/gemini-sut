import { GoogleGenAI } from "@google/genai";

// This is a server-side file.
// IMPORTANT: Do not import or use this file in any client-side code.

/**
 * Creates a Gemini AI instance for a single request.
 * It securely retrieves the API key from the server's environment variables.
 */
export const getAiInstance = (): GoogleGenAI => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("API key is not configured on the server.");
    }
    return new GoogleGenAI({ apiKey });
};
