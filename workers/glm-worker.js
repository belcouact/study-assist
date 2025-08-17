// GLM-4.5 Cloudflare Worker
// This script handles GLM-4.5 API requests as a standalone worker

const GLM_URL = "https://open.bigmodel.cn/api/paas/v4/chat/completions";

// GLM API function
async function callGlmAPI(messages, env, stream = false) {
    try {
        // Get API key from environment
        const GLM_KEY = env.GLM_API_KEY;
        if (!GLM_KEY) {
            throw new Error('GLM API key is not configured');
        }

        console.log('Sending GLM request with messages:', messages);
        console.log('Request URL:', GLM_URL);
        console.log('Stream mode:', stream);

        const requestBody = {
            model: "glm-4.5",
            messages: messages,
            temperature: 0.7,
            max_tokens: 2000
        };

        // Add streaming parameter if requested
        if (stream) {
            requestBody.stream = true;
        }

        const response = await fetch(GLM_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${GLM_KEY}`
            },
            body: JSON.stringify(requestBody)
        });

        console.log('GLM Response status:', response.status);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || errorData.message || `HTTP error! Status: ${response.status}`);
        }

        if (stream) {
            // Return the response stream for streaming mode
            return response;
        } else {
            // Return JSON response for non-streaming mode
            const result = await response.json();
            console.log('Raw GLM API response:', result);
            return result;
        }
    } catch (error) {
        console.error('GLM API call error:', error);
        throw error;
    }
}

// Function to handle streaming response
async function handleStreamingResponse(response) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let lineCount = 0;
    
    return new ReadableStream({
        async start(controller) {
            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    
                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop(); // Keep the last incomplete line in buffer
                    
                    for (const line of lines) {
                        if (line.trim() === '') continue;
                        
                        if (line.startsWith('data: ')) {
                            const data = line.slice(6); // Remove 'data: ' prefix
                            if (data === '[DONE]') {
                                controller.close();
                                return;
                            }
                            
                            try {
                                const parsed = JSON.parse(data);
                                lineCount++;
                                
                                // Send line by line with line number
                                controller.enqueue(JSON.stringify({
                                    line: lineCount,
                                    content: parsed.choices?.[0]?.delta?.content || '',
                                    done: false
                                }) + '\n');
                            } catch (e) {
                                console.error('Error parsing SSE data:', e);
                            }
                        }
                    }
                }
                
                // Send completion signal
                controller.enqueue(JSON.stringify({
                    line: lineCount + 1,
                    content: '',
                    done: true
                }) + '\n');
                
                controller.close();
            } catch (error) {
                console.error('Streaming error:', error);
                controller.error(error);
            }
        }
    });
}

// Main fetch event handler
export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const path = url.pathname;
        
        // CORS headers
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        };

        // Handle CORS preflight requests
        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        try {
            // Health check endpoint
            if (path === '/health' || path === '/api/health') {
                return new Response(JSON.stringify({
                    status: 'ok',
                    message: 'GLM Worker is running',
                    timestamp: new Date().toISOString(),
                    glm_configured: !!env.GLM_API_KEY
                }), {
                    headers: {
                        'Content-Type': 'application/json',
                        ...corsHeaders
                    }
                });
            }

            // Main GLM API endpoint
            if (path === '/chat' || path === '/api/chat' || path === '/') {
                if (request.method !== 'POST') {
                    return new Response(JSON.stringify({
                        error: 'Method not allowed',
                        message: 'Only POST requests are supported'
                    }), {
                        status: 405,
                        headers: {
                            'Content-Type': 'application/json',
                            ...corsHeaders
                        }
                    });
                }

                try {
                    // Parse request body
                    let body;
                    try {
                        body = await request.json();
                    } catch (e) {
                        return new Response(JSON.stringify({
                            error: 'Invalid JSON',
                            message: 'Request body must be valid JSON'
                        }), {
                            status: 400,
                            headers: {
                                'Content-Type': 'application/json',
                                ...corsHeaders
                            }
                        });
                    }

                    let messages;
                    
                    // Handle different request formats
                    if (body.prompt) {
                        // Single prompt format
                        messages = [{
                            role: "user",
                            content: body.prompt.trim()
                        }];
                    } else if (body.messages && Array.isArray(body.messages)) {
                        // Messages array format
                        messages = body.messages;
                    } else {
                        return new Response(JSON.stringify({
                            error: 'Invalid request format',
                            message: 'Request must contain either "prompt" or "messages" field'
                        }), {
                            status: 400,
                            headers: {
                                'Content-Type': 'application/json',
                                ...corsHeaders
                            }
                        });
                    }

                    // Check if streaming is requested
                    const streamMode = body.stream === true || body.stream === 'true';
                    
                    if (streamMode) {
                        // Streaming mode
                        const response = await callGlmAPI(messages, env, true);
                        const stream = await handleStreamingResponse(response);
                        
                        return new Response(stream, {
                            headers: {
                                'Content-Type': 'text/plain; charset=utf-8',
                                'Cache-Control': 'no-cache',
                                'Connection': 'keep-alive',
                                ...corsHeaders
                            }
                        });
                    } else {
                        // Non-streaming mode
                        const result = await callGlmAPI(messages, env, false);
                        
                        // Return the response
                        return new Response(JSON.stringify(result), {
                            headers: {
                                'Content-Type': 'application/json',
                                ...corsHeaders
                            }
                        });
                    }

                } catch (error) {
                    console.error('Error processing GLM request:', error);
                    return new Response(JSON.stringify({
                        error: 'GLM API Error',
                        message: error.message
                    }), {
                        status: 500,
                        headers: {
                            'Content-Type': 'application/json',
                            ...corsHeaders
                        }
                    });
                }
            }

            // GET request - show API info
            if (request.method === 'GET') {
                return new Response(JSON.stringify({
                    message: "GLM-4.5 Worker API is running",
                    endpoints: {
                        health: "GET /health - Health check",
                        chat: "POST /chat - Chat with GLM-4.5"
                    },
                    example: {
                        method: "POST",
                        url: "/chat",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: {
                            messages: [
                                {role: "user", content: "Hello, how are you?"}
                            ]
                        }
                    }
                }), {
                    headers: {
                        'Content-Type': 'application/json',
                        ...corsHeaders
                    }
                });
            }

            // 404 for unknown paths
            return new Response(JSON.stringify({
                error: 'Not found',
                message: 'Endpoint not found'
            }), {
                status: 404,
                headers: {
                    'Content-Type': 'application/json',
                    ...corsHeaders
                }
            });

        } catch (error) {
            console.error('Worker error:', error);
            return new Response(JSON.stringify({
                error: 'Internal server error',
                message: error.message
            }), {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    ...corsHeaders
                }
            });
        }
    }
};