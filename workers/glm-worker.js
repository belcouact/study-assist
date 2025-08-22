// GLM-4.5 Cloudflare Worker - Optimized for Performance
// This script handles GLM-4.5 API requests as a standalone worker

const GLM_URL = "https://open.bigmodel.cn/api/paas/v4/chat/completions";

// Task storage now uses Cloudflare KV instead of in-memory Map

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
    console.log('GLM API call initiated:', 'Messages count:', messages.length, 'Streaming:', stream);
    
    try {
        // Get API key from environment
        const GLM_KEY = env.GLM_API_KEY;
        if (!GLM_KEY) {
            console.error('GLM API key is missing');
            throw new Error('GLM API key is not configured');
        }
        console.log('GLM API key is available, preparing request');

        // Create cache key for non-streaming requests
        const cacheKey = stream ? null : JSON.stringify({ messages, model: "glm-4.5" });
        console.log('Cache key generated:', 'Length:', cacheKey ? cacheKey.length : 0, 'Will cache:', !stream);
        
        // Check cache for non-streaming requests
        if (cacheKey && requestCache.has(cacheKey)) {
            const cached = requestCache.get(cacheKey);
            const cacheAge = Date.now() - cached.timestamp;
            console.log('Cache entry found:', 'Age (ms):', cacheAge, 'Max age (ms):', CACHE_TTL * 1000);
            
            if (cacheAge < CACHE_TTL * 1000) {
                console.log('Cache hit for GLM request, returning cached data');
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
        console.log('GLM API request body prepared:', JSON.stringify(requestBody));

        // Optimized fetch with timeout and connection hints
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
            console.error('GLM API call timeout after', DEFAULT_TIMEOUT, 'ms');
            controller.abort();
        }, DEFAULT_TIMEOUT);
        
        try {
            console.log('Sending request to GLM API:', GLM_URL);
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
            console.log('GLM API response received:', 'Status:', response.status, 'OK:', response.ok);

            if (!response.ok) {
                const errorData = await response.json().catch(() => {
                    console.warn('Failed to parse error response as JSON');
                    return {};
                });
                const errorMessage = errorData.error?.message || errorData.message || `HTTP error! Status: ${response.status}`;
                console.error('GLM API error:', 'Status:', response.status, 'Message:', errorMessage, 'Error data:', JSON.stringify(errorData));
                throw new Error(errorMessage);
            }

            if (stream) {
                // Return the response stream for streaming mode
                const duration = Date.now() - startTime;
                console.log(`GLM streaming request completed in ${duration}ms`);
                return response;
            } else {
                // Return JSON response for non-streaming mode
                console.log('Parsing GLM API JSON response');
                const result = await response.json();
                console.log('GLM API response parsed successfully:', 'Has choices:', !!result.choices, 'Choices count:', result.choices?.length || 0);
                
                // Cache the result
                if (cacheKey) {
                    requestCache.set(cacheKey, {
                        data: result,
                        timestamp: Date.now()
                    });
                    console.log('GLM API response cached');
                }
                
                const duration = Date.now() - startTime;
                console.log(`GLM request completed in ${duration}ms`);
                return result;
            }
        } catch (fetchError) {
            clearTimeout(timeoutId);
            if (fetchError.name === 'AbortError') {
                console.error('GLM API call aborted due to timeout');
                throw new Error('Request timeout');
            }
            console.error('GLM API fetch error:', 'Name:', fetchError.name, 'Message:', fetchError.message, 'Stack:', fetchError.stack);
            throw fetchError;
        }
    } catch (error) {
        console.error('GLM API call error:', 'Error:', error.message, 'Stack:', error.stack);
        throw error;
    }
}

// Async task processing function
async function processAsyncTask(taskId, taskInput, env) {
    console.log('Starting async task processing:', taskId, 'Input:', JSON.stringify(taskInput));
    
    try {
        // Get task from KV storage
        let taskData;
        if (env.TASKS_KV) {
            taskData = await env.TASKS_KV.get(taskId);
            console.log('KV storage access result for task:', taskId, 'Data found:', !!taskData);
        } else {
            console.warn('KV storage not available for task:', taskId);
        }
        
        if (!taskData) {
            console.error('Task not found in KV storage:', taskId);
            // Try fallback to in-memory storage
            if (globalThis.tasks && globalThis.tasks.has(taskId)) {
                taskData = JSON.stringify(globalThis.tasks.get(taskId));
                console.log('Found task in in-memory storage:', taskId);
            } else {
                console.error('Task not found in any storage:', taskId);
                return;
            }
        }
        
        const task = JSON.parse(taskData);
        console.log('Task parsed successfully:', taskId, 'Current status:', task.status);
        
        // Update task status to processing
        task.status = 'processing';
        console.log('Updating task status to processing:', taskId);
        
        // Save to KV storage if available, otherwise use in-memory storage
        if (env.TASKS_KV) {
            await env.TASKS_KV.put(taskId, JSON.stringify(task));
            console.log('Task status updated in KV storage:', taskId);
        } else if (globalThis.tasks) {
            globalThis.tasks.set(taskId, task);
            console.warn('KV storage not available, using in-memory fallback for status update:', taskId);
        }
        
        // Handle different task types
        const taskType = taskInput.type || 'glm';
        console.log('Processing task type:', taskType, 'for task:', taskId);
        
        let result;
        
        switch (taskType) {
            case 'kv_test':
                console.log('Processing KV test task:', taskId);
                result = await processKVTest(taskId, taskInput, env);
                break;
                
            case 'kv_write':
                console.log('Processing KV write task:', taskId);
                result = await processKVWrite(taskId, taskInput, env);
                break;
                
            case 'kv_read':
                console.log('Processing KV read task:', taskId);
                result = await processKVRead(taskId, taskInput, env);
                break;
                
            case 'glm':
            default:
                console.log('Processing GLM task:', taskId);
                result = await processGLMTask(taskId, taskInput, env);
                break;
        }
        
        console.log('Task processing completed:', taskId, 'Result type:', typeof result);
        
        // Update task with result
        task.status = 'completed';
        task.result = result;
        task.completedAt = Date.now();
        console.log('Task result updated:', taskId, 'New status:', task.status);
        
        // Save to KV storage if available, otherwise use in-memory storage
        if (env.TASKS_KV) {
            await env.TASKS_KV.put(taskId, JSON.stringify(task));
            console.log('Task result saved to KV storage:', taskId);
        } else if (globalThis.tasks) {
            globalThis.tasks.set(taskId, task);
            console.warn('KV storage not available, using in-memory fallback for result:', taskId);
        }
        
        console.log('Async task completed successfully:', taskId);
        
    } catch (error) {
        console.error('Async task failed:', taskId, 'Error:', error.message, 'Stack:', error.stack);
        
        // Update task with error
        let task;
        
        // Try to get task from KV storage first
        if (env.TASKS_KV) {
            const taskData = await env.TASKS_KV.get(taskId);
            if (taskData) {
                task = JSON.parse(taskData);
                console.log('Retrieved task from KV storage for error handling:', taskId);
            }
        }
        
        // Fallback to in-memory storage
        if (!task && globalThis.tasks && globalThis.tasks.has(taskId)) {
            task = globalThis.tasks.get(taskId);
            console.log('Retrieved task from in-memory storage for error handling:', taskId);
        }
        
        if (task) {
            task.status = 'failed';
            task.error = {
                message: error.message,
                stack: error.stack,
                timestamp: Date.now()
            };
            task.completedAt = Date.now();
            console.log('Task error status updated:', taskId, 'Error:', error.message);
            
            // Save to KV storage if available, otherwise use in-memory storage
            if (env.TASKS_KV) {
                await env.TASKS_KV.put(taskId, JSON.stringify(task));
                console.log('Task error saved to KV storage:', taskId);
            } else if (globalThis.tasks) {
                globalThis.tasks.set(taskId, task);
                console.warn('KV storage not available, using in-memory fallback for error:', taskId);
            }
        } else {
            console.error('Could not find task to update with error:', taskId);
        }
    }
}

// Function to process KV test tasks
async function processKVTest(taskId, taskInput, env) {
    console.log('Processing KV test task:', taskId);
    
    try {
        // Test KV storage availability
        if (!env.TASKS_KV) {
            throw new Error('KV storage not available');
        }
        
        // Test write operation
        const testKey = `test_${taskId}_${Date.now()}`;
        const testValue = JSON.stringify({
            taskId,
            timestamp: Date.now(),
            message: 'KV test value'
        });
        
        await env.TASKS_KV.put(testKey, testValue);
        console.log('KV write test successful:', testKey);
        
        // Test read operation
        const retrievedValue = await env.TASKS_KV.get(testKey);
        if (!retrievedValue) {
            throw new Error('Failed to retrieve test value from KV');
        }
        
        console.log('KV read test successful:', testKey);
        
        // Test delete operation
        await env.TASKS_KV.delete(testKey);
        console.log('KV delete test successful:', testKey);
        
        // Verify deletion
        const deletedValue = await env.TASKS_KV.get(testKey);
        if (deletedValue) {
            throw new Error('Failed to delete test value from KV');
        }
        
        console.log('KV deletion verification successful:', testKey);
        
        return {
            success: true,
            message: 'KV test completed successfully',
            operations: ['write', 'read', 'delete', 'verify']
        };
    } catch (error) {
        console.error('KV test failed:', taskId, 'Error:', error.message);
        throw error;
    }
}

// Function to process KV write tasks
async function processKVWrite(taskId, taskInput, env) {
    console.log('Processing KV write task:', taskId);
    
    try {
        if (!env.TASKS_KV) {
            throw new Error('KV storage not available');
        }
        
        const { key, value, ttl } = taskInput;
        
        if (!key || value === undefined) {
            throw new Error('Key and value are required for KV write operation');
        }
        
        const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
        
        if (ttl) {
            await env.TASKS_KV.put(key, stringValue, { expirationTtl: ttl });
            console.log('KV write with TTL successful:', key, 'TTL:', ttl);
        } else {
            await env.TASKS_KV.put(key, stringValue);
            console.log('KV write successful:', key);
        }
        
        return {
            success: true,
            message: 'KV write completed successfully',
            key,
            ttl: ttl || null
        };
    } catch (error) {
        console.error('KV write failed:', taskId, 'Error:', error.message);
        throw error;
    }
}

// Function to process KV read tasks
async function processKVRead(taskId, taskInput, env) {
    console.log('Processing KV read task:', taskId);
    
    try {
        if (!env.TASKS_KV) {
            throw new Error('KV storage not available');
        }
        
        const { key } = taskInput;
        
        if (!key) {
            throw new Error('Key is required for KV read operation');
        }
        
        const value = await env.TASKS_KV.get(key);
        
        if (value === null) {
            return {
                success: true,
                message: 'Key not found in KV storage',
                key,
                found: false
            };
        }
        
        // Try to parse as JSON, fall back to string if not valid JSON
        let parsedValue;
        try {
            parsedValue = JSON.parse(value);
        } catch (e) {
            parsedValue = value;
        }
        
        console.log('KV read successful:', key);
        
        return {
            success: true,
            message: 'KV read completed successfully',
            key,
            found: true,
            value: parsedValue
        };
    } catch (error) {
        console.error('KV read failed:', taskId, 'Error:', error.message);
        throw error;
    }
}

// Function to process GLM tasks
async function processGLMTask(taskId, taskInput, env) {
    console.log('Processing GLM task:', taskId);
    
    try {
        const { messages, stream } = taskInput;
        
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            throw new Error('Valid messages array is required for GLM task');
        }
        
        // Call GLM API
        const result = await callGlmAPI(messages, env, stream || false);
        
        if (stream) {
            // For streaming, we can't return the stream directly in an async task
            // Instead, we'll return a success message and the streaming will be handled separately
            return {
                success: true,
                message: 'GLM streaming task initiated',
                taskId,
                streaming: true
            };
        } else {
            // For non-streaming, return the result
            const content = result.choices?.[0]?.message?.content || 'No response from GLM';
            
            console.log('GLM task completed successfully:', taskId);
            
            return {
                success: true,
                message: 'GLM task completed successfully',
                taskId,
                content,
                usage: result.usage || null
            };
        }
    } catch (error) {
        console.error('GLM task failed:', taskId, 'Error:', error.message);
        throw error;
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

            // Async task endpoint
            if (path === '/api/async-task' || path === '/functions/api/async-task') {
                if (request.method === 'POST') {
                    // Submit new task
                    try {
                        const body = await request.json();
                        const taskId = 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                        
                        // Store task in KV storage with fallback
                        const taskData = {
                            id: taskId,
                            status: 'pending',
                            input: body,
                            createdAt: Date.now(),
                            result: null,
                            error: null
                        };
                        
                        // Check if KV storage is available
                        if (env.TASKS_KV) {
                            await env.TASKS_KV.put(taskId, JSON.stringify(taskData));
                        } else {
                            // Fallback to in-memory storage if KV is not available
                            if (!globalThis.tasks) {
                                globalThis.tasks = new Map();
                            }
                            globalThis.tasks.set(taskId, taskData);
                            console.warn('KV storage not available, using in-memory fallback');
                        }
                        
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
                    
                    let task;
                    
                    // Try to get task from KV storage first
                    if (env.TASKS_KV) {
                        const taskData = await env.TASKS_KV.get(taskId);
                        if (taskData) {
                            task = JSON.parse(taskData);
                        }
                    }
                    
                    // Fallback to in-memory storage if KV is not available or task not found
                    if (!task && globalThis.tasks && globalThis.tasks.has(taskId)) {
                        task = globalThis.tasks.get(taskId);
                        console.warn('KV storage not available or task not found, using in-memory fallback');
                    }
                    
                    if (!task) {
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