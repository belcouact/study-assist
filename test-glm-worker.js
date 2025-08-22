// Local test script for GLM Worker error handling
// This script simulates the enhanced error handling we added to glm-worker.js

// Mock environment variables
const mockEnv = {
    GLM_API_KEY: '9fbf536a32af4fb6aa1f4747192cb038.dqpE1fqciLXyvuQg',
    TASKS_KV: {
        get: async (key) => {
            console.log(`[KV GET] Attempting to get key: ${key}`);
            // Simulate KV storage
            if (globalThis.kvStorage && globalThis.kvStorage.has(key)) {
                const value = globalThis.kvStorage.get(key);
                console.log(`[KV GET] Found key: ${key}`);
                return value;
            }
            console.log(`[KV GET] Key not found: ${key}`);
            return null;
        },
        put: async (key, value) => {
            console.log(`[KV PUT] Storing key: ${key}`);
            if (!globalThis.kvStorage) {
                globalThis.kvStorage = new Map();
            }
            globalThis.kvStorage.set(key, value);
        }
    }
};

// Mock globalThis.tasks for fallback
if (!globalThis.tasks) {
    globalThis.tasks = new Map();
}

// Mock fetch function
globalThis.fetch = async (url, options) => {
    console.log(`[FETCH] Request to: ${url}`);
    console.log(`[FETCH] Options:`, JSON.stringify(options, null, 2));
    
    // Simulate different error scenarios
    if (url.includes('timeout')) {
        return new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Request timeout')), 1000);
        });
    }
    
    if (url.includes('error')) {
        return {
            ok: false,
            status: 500,
            text: async () => 'Internal Server Error',
            json: async () => ({ error: { message: 'Internal Server Error' } })
        };
    }
    
    // Successful response
    return {
        ok: true,
        status: 200,
        json: async () => ({
            choices: [{
                message: {
                    content: 'Mock GLM response'
                }
            }]
        })
    };
};

// Enhanced callGlmAPI function (copied from glm-worker.js with modifications for testing)
async function callGlmAPI(messages, env, stream = false) {
    const startTime = Date.now();
    console.log('GLM API call initiated:', 'Messages count:', messages.length, 'Streaming:', stream);
    
    try {
        const GLM_URL = "https://open.bigmodel.cn/api/paas/v4/chat/completions";
        const DEFAULT_TIMEOUT = 30000;
        const CACHE_TTL = 300;
        const requestCache = globalThis.requestCache || new Map();
        
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
        
        // Prepare request body
        const requestBody = {
            model: "glm-4.5",
            messages: messages
        };
        
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
                    "Authorization": `Bearer ${GLM_KEY}`
                },
                body: JSON.stringify(requestBody),
                signal: controller.signal
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

// Enhanced processAsyncTask function (copied from glm-worker.js)
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
        
        // Extract messages from task input
        let messages;
        if (taskInput.prompt) {
            messages = [{
                role: "user",
                content: taskInput.prompt.trim()
            }];
            console.log('Using prompt format for messages:', taskId, 'Prompt length:', taskInput.prompt.length);
        } else if (taskInput.messages && Array.isArray(taskInput.messages)) {
            messages = taskInput.messages;
            console.log('Using messages array format:', taskId, 'Messages count:', messages.length);
        } else {
            console.error('Invalid task input format:', taskId, 'Input:', JSON.stringify(taskInput));
            throw new Error('Invalid task input format');
        }
        
        // Check GLM API key
        if (!env.GLM_API_KEY) {
            console.error('GLM API key not configured:', taskId);
            throw new Error('GLM API key is not configured');
        }
        console.log('GLM API key is configured:', taskId);
        
        // Call GLM API
        console.log('Calling GLM API for task:', taskId);
        const result = await callGlmAPI(messages, env, false);
        console.log('GLM API call successful for task:', taskId, 'Result keys:', Object.keys(result));
        
        // Extract content from GLM response
        const content = result.choices?.[0]?.message?.content || 'No response from GLM';
        console.log('Content extracted for task:', taskId, 'Content length:', content.length);
        
        // Update task with result
        task.status = 'completed';
        task.result = { output: content };
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

// Test scenarios
async function runTests() {
    console.log('=== Starting GLM Worker Error Handling Tests ===\n');
    
    // Test 1: Successful task processing
    console.log('Test 1: Successful task processing');
    const taskId1 = 'test_task_1';
    const taskInput1 = {
        prompt: 'Hello, please respond with a greeting'
    };
    
    // Create initial task
    const task1 = {
        id: taskId1,
        status: 'pending',
        input: taskInput1,
        createdAt: Date.now()
    };
    
    // Store task in KV
    await mockEnv.TASKS_KV.put(taskId1, JSON.stringify(task1));
    
    // Process task
    await processAsyncTask(taskId1, taskInput1, mockEnv);
    
    // Check result
    const result1 = await mockEnv.TASKS_KV.get(taskId1);
    console.log('Test 1 Result:', result1);
    console.log('---\n');
    
    // Test 2: API timeout error
    console.log('Test 2: API timeout error');
    const taskId2 = 'test_task_2';
    const taskInput2 = {
        prompt: 'This should timeout'
    };
    
    // Create initial task
    const task2 = {
        id: taskId2,
        status: 'pending',
        input: taskInput2,
        createdAt: Date.now()
    };
    
    // Store task in KV
    await mockEnv.TASKS_KV.put(taskId2, JSON.stringify(task2));
    
    // Temporarily modify fetch to simulate timeout
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (url, options) => {
        if (url.includes('open.bigmodel.cn')) {
            return new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Request timeout')), 100);
            });
        }
        return originalFetch(url, options);
    };
    
    // Process task (should fail with timeout)
    await processAsyncTask(taskId2, taskInput2, mockEnv);
    
    // Check result
    const result2 = await mockEnv.TASKS_KV.get(taskId2);
    console.log('Test 2 Result:', result2);
    console.log('---\n');
    
    // Restore original fetch
    globalThis.fetch = originalFetch;
    
    // Test 3: Invalid input format
    console.log('Test 3: Invalid input format');
    const taskId3 = 'test_task_3';
    const taskInput3 = {
        invalidField: 'This should cause an error'
    };
    
    // Create initial task
    const task3 = {
        id: taskId3,
        status: 'pending',
        input: taskInput3,
        createdAt: Date.now()
    };
    
    // Store task in KV
    await mockEnv.TASKS_KV.put(taskId3, JSON.stringify(task3));
    
    // Process task (should fail with invalid input)
    await processAsyncTask(taskId3, taskInput3, mockEnv);
    
    // Check result
    const result3 = await mockEnv.TASKS_KV.get(taskId3);
    console.log('Test 3 Result:', result3);
    console.log('---\n');
    
    // Test 4: Missing API key
    console.log('Test 4: Missing API key');
    const taskId4 = 'test_task_4';
    const taskInput4 = {
        prompt: 'This should fail due to missing API key'
    };
    
    // Create initial task
    const task4 = {
        id: taskId4,
        status: 'pending',
        input: taskInput4,
        createdAt: Date.now()
    };
    
    // Store task in KV
    await mockEnv.TASKS_KV.put(taskId4, JSON.stringify(task4));
    
    // Create environment without API key
    const envWithoutKey = {
        ...mockEnv,
        GLM_API_KEY: null
    };
    
    // Process task (should fail with missing API key)
    await processAsyncTask(taskId4, taskInput4, envWithoutKey);
    
    // Check result
    const result4 = await mockEnv.TASKS_KV.get(taskId4);
    console.log('Test 4 Result:', result4);
    console.log('---\n');
    
    console.log('=== All tests completed ===');
}

// Run the tests
runTests().catch(console.error);