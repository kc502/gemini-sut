import { getAiInstance } from './_lib/gemini-client';
import { GenerateVideosOperation } from '../../types';

export const config = {
  runtime: 'edge', 
};

export default async function handler(req: Request) {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ message: 'Method Not Allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
    }

    try {
        const { apiKey, prompt, model, aspectRatio, negativePrompt, image, video } = await req.json();

        if (!apiKey || !prompt || !model) {
            return new Response(JSON.stringify({ message: 'Missing required parameters.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }
        
        const aiInstance = getAiInstance(apiKey);
        
        const request: any = { model, prompt };
        if (image) {
            request.image = { imageBytes: image.data, mimeType: image.mimeType };
        }
        if (video) {
            request.video = { videoBytes: video.data, mimeType: video.mimeType };
        }
        
        const config: any = {
            numberOfVideos: 1,
            aspectRatio: aspectRatio,
        };
        if (negativePrompt) {
            config.negativePrompt = negativePrompt;
        }
        request.config = config;

        const result = await aiInstance.models.generateVideos(request) as GenerateVideosOperation;
        
        return new Response(JSON.stringify(result), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        console.error('[API Generate Video Error]', error);
        return new Response(JSON.stringify({ message: error.message || 'An internal server error occurred.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
