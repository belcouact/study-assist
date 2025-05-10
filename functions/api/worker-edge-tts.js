// Microsoft Edge TTS endpoint
const EDGE_TTS_URL = "https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1";

// Function to generate TTS using Edge speech API
async function generateTTS(text, voice) {
    try {
        // Create SSML document
        const SSML = `
            <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
                <voice name="${voice}">
                    ${text}
                </voice>
            </speak>`;

        // Log request details
        console.log('Sending TTS request:', { text: text.substring(0, 100) + '...', voice });

        const response = await fetch(EDGE_TTS_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/ssml+xml',
                'X-Microsoft-OutputFormat': 'audio-16khz-32kbitrate-mono-mp3',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36 Edg/113.0.1774.35'
            },
            body: SSML
        });

        // Log response status
        console.log('TTS response status:', response.status);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
        }

        // Get the audio data
        const audioData = await response.arrayBuffer();
        
        return audioData;
    } catch (error) {
        console.error('TTS error:', error);
        throw error;
    }
}

// Main request handler that handles all HTTP methods
export async function onRequest(context) {
    // Get the request method
    const { request } = context;
    const method = request.method.toUpperCase();

    // Set common CORS headers
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle OPTIONS request (CORS preflight)
    if (method === 'OPTIONS') {
        return new Response(null, {
            status: 204,
            headers: {
                ...corsHeaders,
                'Access-Control-Max-Age': '86400'
            }
        });
    }

    // Handle GET request
    if (method === 'GET') {
        return new Response(JSON.stringify({
            success: false,
            error: 'This endpoint only supports POST requests'
        }), {
            status: 405,
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json',
                'Allow': 'POST, OPTIONS'
            }
        });
    }

    // Handle POST request
    if (method === 'POST') {
        try {
            let requestData;

            try {
                requestData = await request.json();
            } catch (e) {
                return new Response(JSON.stringify({
                    success: false,
                    error: "Invalid JSON in request body"
                }), {
                    status: 400,
                    headers: {
                        ...corsHeaders,
                        'Content-Type': 'application/json'
                    }
                });
            }

            // Validate required parameters
            const { text, voice } = requestData;
            if (!text) {
                return new Response(JSON.stringify({
                    success: false,
                    error: "Missing required parameter: text"
                }), {
                    status: 400,
                    headers: {
                        ...corsHeaders,
                        'Content-Type': 'application/json'
                    }
                });
            }

            // Use default voice if not provided
            const selectedVoice = voice || 'zh-CN-XiaoxiaoNeural';

            try {
                // Generate TTS directly and return audio
                const audioData = await generateTTS(text, selectedVoice);
                
                // Return the audio response
                return new Response(audioData, {
                    status: 200,
                    headers: {
                        ...corsHeaders,
                        'Content-Type': 'audio/mpeg',
                        'Cache-Control': 'no-cache'
                    }
                });
            } catch (error) {
                console.error('TTS generation error:', error);
                return new Response(JSON.stringify({
                    success: false,
                    error: error.message || 'Failed to generate TTS'
                }), {
                    status: 500,
                    headers: {
                        ...corsHeaders,
                        'Content-Type': 'application/json'
                    }
                });
            }
        } catch (error) {
            console.error('Request handler error:', error);
            return new Response(JSON.stringify({
                success: false,
                error: 'Internal server error'
            }), {
                status: 500,
                headers: {
                    ...corsHeaders,
                    'Content-Type': 'application/json'
                }
            });
        }
    }

    // Handle any other HTTP methods
    return new Response(JSON.stringify({
        success: false,
        error: 'Method not allowed'
    }), {
        status: 405,
        headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'Allow': 'POST, OPTIONS'
        }
    });
}