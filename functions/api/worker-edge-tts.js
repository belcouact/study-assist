/**
 * TTS Worker Script
 * To be deployed on Cloudflare Workers at worker-edge-tts.study-llm.me
 * 
 * This worker calls Microsoft's Edge TTS API to convert text to speech.
 */

const CONNECT_TIMEOUT = 10000;
const TTS_ENDPOINT = 'https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1';
const DEFAULT_VOICE = 'zh-CN-XiaoxiaoNeural';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0';
const TRUSTED_TOKEN = '6A5AA1D4EAFF4E9FB37E23D68491D6F4';

// Main worker fetch handler
export function onRequest(context) {
    const request = context.request;
    // CORS headers for preflight requests
    if (request.method === 'OPTIONS') {
        return handleCors(request);
    }
    
    // Handle API routes
    const url = new URL(request.url);
    
    // Default to root path handler for TTS
    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ 
            error: 'Method not allowed. Only POST requests are supported.'
        }), {
            status: 405,
            headers: corsHeaders('application/json')
        });
    }
    
    return handleTtsRequest(request);
}

// Handle CORS preflight requests
function handleCors(request) {
    // Use the CORS configuration from wrangler.toml
    return new Response(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept',
            'Access-Control-Max-Age': '86400'
        }
    });
}

// Create CORS headers for responses
function corsHeaders(contentType) {
    return {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept'
    };
}

// Handle TTS API requests
async function handleTtsRequest(request) {
    try {
        // Parse JSON request
        let requestData;
        try {
            requestData = await request.json();
        } catch (error) {
            return new Response(JSON.stringify({ 
                error: 'Invalid JSON in request body' 
            }), {
                status: 400,
                headers: corsHeaders('application/json')
            });
        }
        
        // Validate the request data
        const { text, voice } = requestData;
        
        if (!text) {
            return new Response(JSON.stringify({ 
                error: 'No text provided in request' 
            }), {
                status: 400,
                headers: corsHeaders('application/json')
            });
        }
        
        // Generate SSML for the TTS request
        const ssml = generateSSML(text, voice || DEFAULT_VOICE);
        
        // Get TTS audio from Microsoft Edge TTS API
        const ttsResponse = await fetchTTSAudio(ssml);
        
        if (!ttsResponse.ok) {
            let errorMessage = `Microsoft Edge TTS API responded with status: ${ttsResponse.status}`;
            try {
                const errorBody = await ttsResponse.text();
                errorMessage += ` - ${errorBody}`;
            } catch (e) {
                // Ignore text parsing errors
                console.error('Failed to parse error response:', e);
            }
            
            console.error('TTS API Error:', errorMessage);
            
            return new Response(JSON.stringify({ 
                error: errorMessage 
            }), {
                status: ttsResponse.status,
                headers: corsHeaders('application/json')
            });
        }
        
        // Return the audio response
        const audioBuffer = await ttsResponse.arrayBuffer();
        
        return new Response(audioBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'audio/mpeg',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'no-cache',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept'
            }
        });
        
    } catch (error) {
        console.error('TTS Request Error:', error);
        
        return new Response(JSON.stringify({ 
            error: `Internal server error: ${error.message}` 
        }), {
            status: 500,
            headers: corsHeaders('application/json')
        });
    }
}

// Generate SSML markup for the TTS request
function generateSSML(text, voice) {
    // Sanitize inputs to prevent SSML injection
    const sanitizedText = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    
    // Generate the SSML
    return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
        <voice name="${voice}">
            ${sanitizedText}
        </voice>
    </speak>`;
}

// Connect to Microsoft Edge TTS API with proper headers
async function fetchTTSAudio(ssml) {
    // Create a connection to the TTS service with Microsoft Edge headers
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONNECT_TIMEOUT);
    
    try {
        const response = await fetch(TTS_ENDPOINT + '?TrustedClientToken=' + TRUSTED_TOKEN, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/ssml+xml',
                'X-Microsoft-OutputFormat': 'audio-16khz-32kbitrate-mono-mp3',
                'User-Agent': USER_AGENT,
                'Authorization': 'Bearer ' + TRUSTED_TOKEN
            },
            body: ssml,
            signal: controller.signal
        });
        
        return response;
    } finally {
        clearTimeout(timeoutId);
    }
}