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
    
    // Forward to GLM API
    const glmResponse = await fetch('https://glm.study-llm.me/functions/api/chat-glm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(task.data)
    });
    
    if (glmResponse.ok) {
      const result = await glmResponse.json();
      task.status = 'completed';
      task.result = result;
    } else {
      const errorText = await glmResponse.text();
      task.status = 'failed';
      task.error = {
        status: glmResponse.status,
        message: errorText
      };
    }
  } catch (error) {
    task.status = 'failed';
    task.error = {
      message: error.message
    };
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
        "Access-Control-Allow-Origin": "https://study-llm.me",
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
            "Access-Control-Allow-Origin": "https://study-llm.me",
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
          "Access-Control-Allow-Origin": "https://study-llm.me",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }
      });
    }
    
    // Handle task status query (GET)
    if (request.method === 'GET' && pathname.startsWith('/functions/api/async-task/')) {
      const taskId = pathname.split('/').pop();
      const taskStatus = getTaskStatus(taskId);
      
      if (!taskStatus) {
        return new Response(JSON.stringify({
          error: "Task not found",
          message: "任务不存在或已过期"
        }), {
          status: 404,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "https://study-llm.me",
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