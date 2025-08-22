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
async function processAsyncTask(taskData) {
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
  processTaskInBackground(taskId);
  
  return taskId;
}

// Background task processor
async function processTaskInBackground(taskId) {
  const task = taskStorage.get(taskId);
  if (!task) return;
  
  try {
    // Update status to processing
    task.status = 'processing';
    
    // Handle different task types
    const taskType = task.data.type || 'glm';
    
    switch (taskType) {
      case 'kv_test':
        task.result = await processKVTest(task.data);
        break;
        
      case 'kv_write':
        task.result = await processKVWrite(task.data);
        break;
        
      case 'kv_read':
        task.result = await processKVRead(task.data);
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
async function processKVTest(data) {
  // Simulate KV test operations
  const testKey = data.key || 'test_key_' + Date.now();
  const testValue = data.value || { test: 'data', timestamp: Date.now() };
  
  // Simulate KV operations (in real implementation, these would use actual KV storage)
  return {
    success: true,
    message: 'KV test completed successfully',
    operations: ['write', 'read', 'delete'],
    testKey: testKey
  };
}

// Process KV write task
async function processKVWrite(data) {
  if (!data.key || data.value === undefined) {
    throw new Error('Key and value are required for KV write operation');
  }
  
  // Simulate KV write (in real implementation, this would use actual KV storage)
  return {
    success: true,
    message: 'KV write completed successfully',
    key: data.key,
    value: data.value
  };
}

// Process KV read task
async function processKVRead(data) {
  if (!data.key) {
    throw new Error('Key is required for KV read operation');
  }
  
  // Simulate KV read (in real implementation, this would use actual KV storage)
  // For demo purposes, return a mock response
  const mockData = {
    'test_key_': { message: 'Hello KV Storage!', timestamp: new Date().toISOString() }
  };
  
  const value = mockData[data.key] || null;
  
  return {
    success: true,
    message: value ? 'KV read completed successfully' : 'Key not found',
    key: data.key,
    found: !!value,
    value: value
  };
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
      const taskId = await processAsyncTask(body);
      
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