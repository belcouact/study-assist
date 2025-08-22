// Async task handler for GLM API requests
// Simple in-memory task storage (in production, use a database)
const taskStorage = new Map();
const TASK_TIMEOUT = 5 * 60 * 1000; // 5 minutes timeout
const MAX_TASKS = 100; // Maximum concurrent tasks

// Clean up expired tasks
function cleanupExpiredTasks() {
  const now = Date.now();
  for (const [taskId, task] of taskStorage.entries()) {
    if (now - task.createdAt > TASK_TIMEOUT) {
      taskStorage.delete(taskId);
    }
  }
}

// Generate unique task ID
function generateTaskId() {
  return 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Process async task
async function processAsyncTask(taskData, env) {
  const taskId = generateTaskId();
  
  // Store task with initial status
  taskStorage.set(taskId, {
    id: taskId,
    status: 'pending',
    createdAt: Date.now(),
    data: taskData,
    result: null,
    error: null
  });
  
  // Start processing in background
  processTaskInBackground(taskId, env);
  
  return taskId;
}

// Background task processor
async function processTaskInBackground(taskId, env) {
  const task = taskStorage.get(taskId);
  if (!task) return;
  
  try {
    // Update status to processing
    task.status = 'processing';
    
    // Handle different task types
    const taskType = task.data.type || 'glm';
    
    switch (taskType) {
      case 'kv_test':
        task.result = await processKVTest(task.data, env);
        break;
        
      case 'kv_write':
        task.result = await processKVWrite(task.data, env);
        break;
        
      case 'kv_read':
        task.result = await processKVRead(task.data, env);
        break;
        
      case 'glm':
      default:
        // Forward to GLM API
        const glmResponse = await fetch('https://glm.study-llm.me/functions/api/chat-glm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(task.data)
        });
        
        if (glmResponse.ok) {
          task.result = await glmResponse.json();
        } else {
          const errorText = await glmResponse.text();
          throw new Error(`GLM API error: ${glmResponse.status} - ${errorText}`);
        }
        break;
    }
    
    task.status = 'completed';
  } catch (error) {
    task.status = 'failed';
    task.error = {
      message: error.message
    };
  }
}

// Process KV test task
async function processKVTest(data, env) {
  if (!env || !env.TASKS_KV) {
    throw new Error('KV storage not available');
  }
  
  const testKey = data.key || 'test_key_' + Date.now();
  const testValue = data.value || { test: 'data', timestamp: Date.now() };
  
  try {
    // Write test
    await env.TASKS_KV.put(testKey, JSON.stringify(testValue));
    
    // Read test
    const readValue = await env.TASKS_KV.get(testKey);
    const parsedValue = readValue ? JSON.parse(readValue) : null;
    
    // Delete test
    await env.TASKS_KV.delete(testKey);
    
    return {
      success: true,
      message: 'KV test completed successfully',
      operations: ['write', 'read', 'delete'],
      testKey: testKey,
      testValue: parsedValue
    };
  } catch (error) {
    console.error('KV test failed:', error);
    throw new Error(`KV test failed: ${error.message}`);
  }
}

// Process KV write task
async function processKVWrite(data, env) {
  if (!env || !env.TASKS_KV) {
    throw new Error('KV storage not available');
  }
  
  if (!data.key || data.value === undefined) {
    throw new Error('Key and value are required for KV write operation');
  }
  
  try {
    // Store the data in KV
    await env.TASKS_KV.put(data.key, JSON.stringify(data.value));
    
    // Update index for tracking keys
    await updateKVIndex(env, data.key);
    
    return {
      success: true,
      message: 'KV write completed successfully',
      key: data.key,
      value: data.value
    };
  } catch (error) {
    console.error('KV write failed:', error);
    throw new Error(`KV write failed: ${error.message}`);
  }
}

// Process KV read task
async function processKVRead(data, env) {
  if (!env || !env.TASKS_KV) {
    throw new Error('KV storage not available');
  }
  
  if (!data.key) {
    throw new Error('Key is required for KV read operation');
  }
  
  try {
    // Read the data from KV
    const value = await env.TASKS_KV.get(data.key);
    
    if (value) {
      const parsedValue = JSON.parse(value);
      return {
        success: true,
        message: 'KV read completed successfully',
        key: data.key,
        found: true,
        value: parsedValue
      };
    } else {
      return {
        success: true,
        message: 'Key not found',
        key: data.key,
        found: false,
        value: null
      };
    }
  } catch (error) {
    console.error('KV read failed:', error);
    throw new Error(`KV read failed: ${error.message}`);
  }
}

// Update KV index
async function updateKVIndex(env, key) {
  try {
    const indexData = await env.TASKS_KV.get('kv_index');
    let keys = indexData ? JSON.parse(indexData) : [];
    
    // Add new key to index if not already present
    if (!keys.includes(key)) {
      keys.unshift(key); // Add to beginning for newest first
    }
    
    // Limit index size (keep latest 1000 keys)
    if (keys.length > 1000) {
      keys = keys.slice(0, 1000);
    }
    
    await env.TASKS_KV.put('kv_index', JSON.stringify(keys));
    console.log('KV index updated, total keys:', keys.length);
  } catch (error) {
    console.error('Failed to update KV index:', error);
    // Don't throw error to avoid breaking main functionality
  }
}

// Get task status and result
function getTaskStatus(taskId) {
  const task = taskStorage.get(taskId);
  if (!task) {
    return null;
  }
  
  return {
    id: task.id,
    status: task.status,
    createdAt: task.createdAt,
    result: task.result,
    error: task.error
  };
}

export async function onRequest(context) {
  const { request, env } = context;
  
  // Clean up expired tasks
  cleanupExpiredTasks();
  
  // Handle OPTIONS method for CORS preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400"
      }
    });
  }
  
  try {
    const url = new URL(request.url);
    const pathname = url.pathname;
    
    // Handle task submission (POST)
    if (request.method === 'POST' && pathname === '/functions/api/async-task') {
      const body = await request.json();
      
      // Check if we have too many tasks
      if (taskStorage.size >= MAX_TASKS) {
        return new Response(JSON.stringify({
          error: "Too many tasks",
          message: "服务器当前处理任务过多，请稍后再试"
        }), {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization"
          }
        });
      }
      
      // Create and process async task
      const taskId = await processAsyncTask(body, env);
      
      return new Response(JSON.stringify({
        taskId: taskId,
        status: 'pending',
        message: '任务已提交，正在处理中'
      }), {
        status: 202,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }
      });
    }
    
    // Handle direct KV operations (POST)
    if (request.method === 'POST' && pathname === '/api/kv') {
      if (!env || !env.TASKS_KV) {
        return new Response(JSON.stringify({
          error: 'KV storage not available',
          message: 'KV存储不可用'
        }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
      
      const body = await request.json();
      const operation = body.operation;
      
      try {
        let result;
        
        switch (operation) {
          case 'write':
            if (!body.key || body.value === undefined) {
              throw new Error('Key and value are required for write operation');
            }
            await env.TASKS_KV.put(body.key, JSON.stringify(body.value));
            await updateKVIndex(env, body.key);
            result = {
              success: true,
              message: 'KV write completed successfully',
              key: body.key,
              value: body.value
            };
            break;
            
          case 'read':
            if (!body.key) {
              throw new Error('Key is required for read operation');
            }
            const value = await env.TASKS_KV.get(body.key);
            if (value) {
              result = {
                success: true,
                message: 'KV read completed successfully',
                key: body.key,
                found: true,
                value: JSON.parse(value)
              };
            } else {
              result = {
                success: true,
                message: 'Key not found',
                key: body.key,
                found: false,
                value: null
              };
            }
            break;
            
          case 'delete':
            if (!body.key) {
              throw new Error('Key is required for delete operation');
            }
            await env.TASKS_KV.delete(body.key);
            result = {
              success: true,
              message: 'KV delete completed successfully',
              key: body.key
            };
            break;
            
          case 'list':
            const indexData = await env.TASKS_KV.get('kv_index');
            const keys = indexData ? JSON.parse(indexData) : [];
            result = {
              success: true,
              message: 'KV list completed successfully',
              keys: keys,
              count: keys.length
            };
            break;
            
          default:
            throw new Error('Invalid operation');
        }
        
        return new Response(JSON.stringify(result), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
        
      } catch (error) {
        return new Response(JSON.stringify({
          error: 'KV operation failed',
          message: error.message
        }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
    }
    
    // Handle task status query (GET)
    if (request.method === 'GET' && pathname.startsWith('/functions/api/async-task/')) {
  const taskId = pathname.split('/').pop();
  
  if (!taskId || taskId === 'async-task') {
    return new Response(JSON.stringify({
      error: "Task ID is required",
      message: "任务ID是必需的"
    }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      }
    });
  }
  
  const taskStatus = getTaskStatus(taskId);
  
  if (!taskStatus) {
    return new Response(JSON.stringify({
      error: "Task not found",
      message: "任务不存在或已过期"
    }), {
      status: 404,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      }
    });
  }
  
  return new Response(JSON.stringify(taskStatus), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "https://study-llm.me",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
}
    
    // Handle unsupported methods
    return new Response(JSON.stringify({
      error: "Method not allowed",
      message: "不支持的请求方法"
    }), {
      status: 405,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "https://study-llm.me",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({
      error: "Internal server error",
      message: error.message
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "https://study-llm.me",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      }
    });
  }
}

export const config = {
  runtime: 'edge',
  maxDuration: 180
};