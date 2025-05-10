// Microsoft Edge TTS endpoint - updated to match current Edge browser implementation
const EDGE_TTS_URL = "https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=6A5AA1D4EAFF4E9FB37E23D68491D6F4";

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
                'Authority': 'speech.platform.bing.com',
                'Path': '/consumer/speech/synthesize/readaloud/edge/v1',
                'Sec-CH-UA': '"Microsoft Edge";v="119"',
                'Sec-CH-UA-Mobile': '?0',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0',
                'Sec-CH-UA-Platform': '"Windows"',
                'Accept': '*/*',
                'Origin': 'edge://settings',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Dest': 'empty',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': 'en-US,en;q=0.9',
                'Content-Type': 'application/ssml+xml',
                'X-Microsoft-OutputFormat': 'audio-16khz-32kbitrate-mono-mp3',
                'Authorization': 'Bearer ${context.env.EDGE_TTS_TOKEN}',
                'Referer': 'edge://settings/'
            },
            body: SSML
        });

        // Log response status and headers for debugging
        console.log('TTS response status:', response.status);
        console.log('TTS response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
            const errorText = await response.text();
            console.error('TTS error response:', errorText);
            try {
                const errorData = JSON.parse(errorText);
                throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
            } catch (e) {
                throw new Error(`HTTP error! Status: ${response.status}, Response: ${errorText}`);
            }
        }

        // Get the audio data
        const audioData = await response.arrayBuffer();
        if (audioData.byteLength === 0) {
            throw new Error('Received empty audio data from TTS service');
        }
        
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