import { GoogleGenAI } from "@google/genai";

export const config = {
  runtime: 'edge',
};

// This validation logic is self-contained and does not use the shared client
// to avoid circular dependencies or complexities if the client were to change.
const validate = async (key: string): Promise<{ isValid: boolean; message?: string }> => {
    try {
        if (!key) {
            return { isValid: false, message: 'errors.invalidApiKey' };
        }
        const aiInstance = new GoogleGenAI({ apiKey: key });
        // Make a very lightweight, cheap call to validate the key.
        await aiInstance.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: 'ping',
            config: { maxOutputTokens: 1, thinkingConfig: { thinkingBudget: 0 } }
        });
        return { isValid: true };
    } catch (error: any) {
        console.error("API Key validation failed on server:", error.message);
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
}

export default async function handler(req: Request) {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ message: 'Method Not Allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
    }

    try {
        const { key } = await req.json();
        if (!key) {
            return new Response(JSON.stringify({ message: 'API key is required.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }
        const result = await validate(key);
        return new Response(JSON.stringify(result), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (error: any) {
        console.error("[API Validate Key Error]", error);
        return new Response(JSON.stringify({ message: error.message || 'An internal server error occurred.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
