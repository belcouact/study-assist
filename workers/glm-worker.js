// GLM-4.5 Cloudflare Worker - Optimized for Performance
// This script handles GLM-4.5 API requests as a standalone worker

const GLM_URL = "https://open.bigmodel.cn/api/paas/v4/chat/completions";

// Performance optimization constants
const DEFAULT_TIMEOUT = 60000; // 60 seconds timeout
const MAX_TOKENS = 10000;
const TEMPERATURE = 0.7;
const CACHE_TTL = 300; // 5 minutes cache

// Simple in-memory cache for identical requests
const requestCache = new Map();

// Optimized GLM API function with connection pooling and caching
async function callGlmAPI(messages, env, stream = false) {
    const startTime = Date.now();
    
    try {
        // Get API key from environment
        const GLM_KEY = env.GLM_API_KEY;
        if (!GLM_KEY) {
            throw new Error('GLM API key is not configured');
        }

        // Create cache key for non-streaming requests
        const cacheKey = stream ? null : JSON.stringify({ messages, model: "glm-4.5" });
        
        // Check cache for non-streaming requests
        if (cacheKey && requestCache.has(cacheKey)) {
            const cached = requestCache.get(cacheKey);
            if (Date.now() - cached.timestamp < CACHE_TTL * 1000) {
                console.log('Cache hit for GLM request');
                return cached.data;
            }
        }

        // Optimized request body
        const requestBody = {
            model: "glm-4.5",
            messages: messages,
            temperature: TEMPERATURE,
            max_tokens: MAX_TOKENS
        };

        // Add streaming parameter if requested
        if (stream) {
            requestBody.stream = true;
        }

        // Optimized fetch with timeout and connection hints
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);
        
        try {
            const response = await fetch(GLM_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${GLM_KEY}`,
                    "User-Agent": "GLM-Worker/1.0",
                    "Accept": stream ? "text/event-stream" : "application/json"
                },
                body: JSON.stringify(requestBody),
                signal: controller.signal,
                // Cloudflare specific optimizations
                cf: {
                    cacheEverything: false,
                    cacheTtl: 0,
                    connectTimeout: 5000,
                    readTimeout: 25000
                }
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error?.message || errorData.message || `HTTP error! Status: ${response.status}`);
            }

            if (stream) {
                // Return the response stream for streaming mode
                console.log(`GLM streaming request completed in ${Date.now() - startTime}ms`);
                return response;
            } else {
                // Return JSON response for non-streaming mode
                const result = await response.json();
                
                // Cache the result
                if (cacheKey) {
                    requestCache.set(cacheKey, {
                        data: result,
                        timestamp: Date.now()
                    });
                }
                
                console.log(`GLM request completed in ${Date.now() - startTime}ms`);
                return result;
            }
        } catch (fetchError) {
            clearTimeout(timeoutId);
            if (fetchError.name === 'AbortError') {
                throw new Error('Request timeout');
            }
            throw fetchError;
        }
    } catch (error) {
        console.error('GLM API call error:', error);
        throw error;
    }
}

// Async task processing function
async function processAsyncTask(taskId, taskInput, env) {
    try {
        if (!global.tasks) {
            console.error('Tasks storage not initialized');
            return;
        }
        
        const task = global.tasks.get(taskId);
        if (!task) {
            console.error('Task not found:', taskId);
            return;
        }
        
        // Update task status to processing
        task.status = 'processing';
        global.tasks.set(taskId, task);
        
        // Extract messages from task input
        let messages;
        if (taskInput.prompt) {
            messages = [{
                role: "user",
                content: taskInput.prompt.trim()
            }];
        } else if (taskInput.messages && Array.isArray(taskInput.messages)) {
            messages = taskInput.messages;
        } else {
            throw new Error('Invalid task input format');
        }
        
        // Call GLM API
        const result = await callGlmAPI(messages, env, false);
        
        // Extract content from GLM response
        const content = result.choices?.[0]?.message?.content || 'No response from GLM';
        
        // Update task with result
        task.status = 'completed';
        task.result = { output: content };
        task.completedAt = Date.now();
        global.tasks.set(taskId, task);
        
        console.log('Async task completed:', taskId);
        
    } catch (error) {
        console.error('Async task failed:', taskId, error);
        
        if (global.tasks && global.tasks.has(taskId)) {
            const task = global.tasks.get(taskId);
            task.status = 'failed';
            task.error = {
                message: error.message,
                timestamp: Date.now()
            };
            task.completedAt = Date.now();
            global.tasks.set(taskId, task);
        }
    }
}

// Optimized function to handle streaming response with immediate flushing
async function handleStreamingResponse(response) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8', { stream: true });
    let buffer = '';
    let lineCount = 0;
    
    return new ReadableStream({
        async start(controller) {
            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    
                    // Decode the chunk and process immediately
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
                                const content = parsed.choices?.[0]?.delta?.content || '';
                                
                                // Send content immediately when received
                                if (content) {
                                    lineCount++;
                                    
                                    // Send streaming response immediately
                                    controller.enqueue(JSON.stringify({
                                        line: lineCount,
                                        content: content,
                                        done: false,
                                        timestamp: Date.now()
                                    }) + '\n');
                                }
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
                    done: true,
                    timestamp: Date.now()
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
            'Access-Control-Allow-Origin': 'https://study-llm.me',
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

            // Async task endpoint
            if (path === '/api/async-task' || path === '/functions/api/async-task') {
                if (request.method === 'POST') {
                    // Submit new task
                    try {
                        const body = await request.json();
                        const taskId = 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                        
                        // Store task in memory (in production, use KV storage)
                        if (!global.tasks) {
                            global.tasks = new Map();
                        }
                        
                        global.tasks.set(taskId, {
                            id: taskId,
                            status: 'pending',
                            input: body,
                            createdAt: Date.now(),
                            result: null,
                            error: null
                        });
                        
                        // Process task asynchronously
                        ctx.waitUntil(processAsyncTask(taskId, body, env));
                        
                        return new Response(JSON.stringify({
                            taskId: taskId,
                            status: 'pending',
                            message: 'Task submitted successfully'
                        }), {
                            headers: {
                                'Content-Type': 'application/json',
                                ...corsHeaders
                            }
                        });
                    } catch (error) {
                        return new Response(JSON.stringify({
                            error: 'Invalid request',
                            message: error.message
                        }), {
                            status: 400,
                            headers: {
                                'Content-Type': 'application/json',
                                ...corsHeaders
                            }
                        });
                    }
                } else if (request.method === 'GET') {
                    // Get task status
                    const taskId = url.searchParams.get('taskId');
                    if (!taskId) {
                        return new Response(JSON.stringify({
                            error: 'Missing taskId',
                            message: 'taskId parameter is required'
                        }), {
                            status: 400,
                            headers: {
                                'Content-Type': 'application/json',
                                ...corsHeaders
                            }
                        });
                    }
                    
                    if (!global.tasks || !global.tasks.has(taskId)) {
                        return new Response(JSON.stringify({
                            error: 'Task not found',
                            message: 'Invalid taskId'
                        }), {
                            status: 404,
                            headers: {
                                'Content-Type': 'application/json',
                                ...corsHeaders
                            }
                        });
                    }
                    
                    const task = global.tasks.get(taskId);
                    return new Response(JSON.stringify(task), {
                        headers: {
                            'Content-Type': 'application/json',
                            ...corsHeaders
                        }
                    });
                } else {
                    return new Response(JSON.stringify({
                        error: 'Method not allowed',
                        message: 'Only GET and POST requests are supported'
                    }), {
                        status: 405,
                        headers: {
                            'Content-Type': 'application/json',
                            ...corsHeaders
                        }
                    });
                }
            }
            
            // Main GLM API endpoint
            if (path === '/chat' || path === '/api/chat' || path === '/' || path === '/api/glm' || path === '/functions/api/chat-glm') {
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
                        
                        // Return the response in the expected format
                        let responseData;
                        if (path === '/functions/api/chat-glm') {
                            // For chat-glm endpoint, return {output: content} format
                            const content = result.choices?.[0]?.message?.content || 'No response from GLM';
                            responseData = { output: content };
                        } else {
                            // For other endpoints, return original GLM response
                            responseData = result;
                        }
                        
                        return new Response(JSON.stringify(responseData), {
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