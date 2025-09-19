import { getAiInstance } from './_lib/gemini-client';

export const config = {
  runtime: 'edge', 
};

export default async function handler(req: Request) {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ message: 'Method Not Allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
    }

    try {
        const { apiKey, prompt, aspectRatio } = await req.json();

        if (!apiKey || !prompt || !aspectRatio) {
            return new Response(JSON.stringify({ message: 'Missing required parameters: apiKey, prompt, or aspectRatio.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }
        
        const aiInstance = getAiInstance(apiKey);

        const response = await aiInstance.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/jpeg',
              aspectRatio: aspectRatio as any,
            },
        });
    
        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
        
        return new Response(JSON.stringify({ imageUrl }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        console.error('[API Generate Image Error]', error);
        return new Response(JSON.stringify({ message: error.message || 'An internal server error occurred.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
