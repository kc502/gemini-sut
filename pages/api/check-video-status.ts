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
        const { apiKey, operation } = await req.json();

        if (!apiKey || !operation) {
            return new Response(JSON.stringify({ message: 'Missing apiKey or operation data.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }
        
        const aiInstance = getAiInstance(apiKey);
        const result = await aiInstance.operations.getVideosOperation({ operation }) as GenerateVideosOperation;
        
        return new Response(JSON.stringify(result), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        console.error('[API Check Video Status Error]', error);
        return new Response(JSON.stringify({ message: error.message || 'An internal server error occurred.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
