export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ message: 'Method Not Allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
    }
    
    try {
        // Fix: API key is no longer passed from the client. It's retrieved from server environment variables.
        const { uri } = await req.json();
        const apiKey = process.env.API_KEY;

        if (!apiKey || !uri) {
            return new Response(JSON.stringify({ message: 'Missing uri in request or API key on server.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        const videoUrl = `${uri}&key=${apiKey}`;
        const videoResponse = await fetch(videoUrl);

        if (!videoResponse.ok) {
            throw new Error(`Failed to fetch video: ${videoResponse.statusText}`);
        }

        // Create a new response that streams the video body back to the client.
        return new Response(videoResponse.body, {
            status: 200,
            headers: {
                'Content-Type': videoResponse.headers.get('Content-Type') || 'video/mp4',
                'Content-Length': videoResponse.headers.get('Content-Length') || '',
                 // Add a cache control header to suggest caching
                'Cache-Control': 'public, max-age=3600',
            }
        });

    } catch (error: any) {
        console.error('[API Fetch Video Error]', error);
        return new Response(JSON.stringify({ message: error.message || 'Error fetching video.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
