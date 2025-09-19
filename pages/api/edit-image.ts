import { getAiInstance } from './_lib/gemini-client';
import { Modality } from "@google/genai";

export const config = {
  runtime: 'edge', 
};

export default async function handler(req: Request) {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ message: 'Method Not Allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
    }

    try {
        const { apiKey, prompt, image } = await req.json();

        if (!apiKey || !prompt || !image) {
            return new Response(JSON.stringify({ message: 'Missing required parameters: apiKey, prompt, or image.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }
        
        const aiInstance = getAiInstance(apiKey);

        const imagePart = { inlineData: { data: image.data, mimeType: image.mimeType } };
        const textPart = { text: prompt };

        const response = await aiInstance.models.generateContent({
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
        
        return new Response(JSON.stringify({ imageUrl, text }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        console.error('[API Edit Image Error]', error);
        return new Response(JSON.stringify({ message: error.message || 'An internal server error occurred.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
