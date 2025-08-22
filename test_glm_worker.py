#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Local test script for GLM Worker error handling
This script simulates the enhanced error handling we added to glm-worker.js
"""

import json
import asyncio
import time
from datetime import datetime
from typing import Dict, Any, Optional, List
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class MockKVStorage:
    """Mock KV storage for testing"""
    def __init__(self):
        self.storage = {}
    
    async def get(self, key: str) -> Optional[str]:
        logger.info(f"[KV GET] Attempting to get key: {key}")
        if key in self.storage:
            logger.info(f"[KV GET] Found key: {key}")
            return self.storage[key]
        logger.info(f"[KV GET] Key not found: {key}")
        return None
    
    async def put(self, key: str, value: str) -> None:
        logger.info(f"[KV PUT] Storing key: {key}")
        self.storage[key] = value

class MockEnvironment:
    """Mock environment for testing"""
    def __init__(self, api_key: str = None, kv_storage: MockKVStorage = None):
        self.GLM_API_KEY = api_key or "9fbf536a32af4fb6aa1f4747192cb038.dqpE1fqciLXyvuQg"
        self.TASKS_KV = kv_storage or MockKVStorage()

class MockFetchResponse:
    """Mock fetch response"""
    def __init__(self, ok: bool, status: int, data: Any = None):
        self.ok = ok
        self.status = status
        self._data = data
    
    async def json(self) -> Any:
        return self._data
    
    async def text(self) -> str:
        return str(self._data)

async def mock_fetch(url: str, options: Dict[str, Any] = None) -> MockFetchResponse:
    """Mock fetch function"""
    logger.info(f"[FETCH] Request to: {url}")
    logger.info(f"[FETCH] Options: {json.dumps(options, indent=2)}")
    
    # Simulate different error scenarios
    if "timeout" in url:
        await asyncio.sleep(2)  # Simulate timeout
        raise Exception("Request timeout")
    
    if "error" in url:
        return MockFetchResponse(
            ok=False,
            status=500,
            data={"error": {"message": "Internal Server Error"}}
        )
    
    # Successful response
    return MockFetchResponse(
        ok=True,
        status=200,
        data={
            "choices": [{
                "message": {
                    "content": "Mock GLM response"
                }
            }]
        }
    )

async def call_glm_api(messages: List[Dict[str, str]], env: MockEnvironment, stream: bool = False) -> Dict[str, Any]:
    """Enhanced callGlmAPI function (adapted from glm-worker.js)"""
    start_time = time.time()
    logger.info(f"GLM API call initiated: Messages count: {len(messages)}, Streaming: {stream}")
    
    try:
        GLM_URL = "https://open.bigmodel.cn/api/paas/v4/chat/completions"
        DEFAULT_TIMEOUT = 30
        CACHE_TTL = 300
        
        # Initialize cache if not exists
        if not hasattr(call_glm_api, "request_cache"):
            call_glm_api.request_cache = {}
        
        GLM_KEY = env.GLM_API_KEY
        if not GLM_KEY:
            logger.error("GLM API key is missing")
            raise Exception("GLM API key is not configured")
        logger.info("GLM API key is available, preparing request")
        
        # Create cache key for non-streaming requests
        cache_key = None if stream else json.dumps({"messages": messages, "model": "glm-4.5"})
        logger.info(f"Cache key generated: Length: {len(cache_key) if cache_key else 0}, Will cache: {not stream}")
        
        # Check cache for non-streaming requests
        if cache_key and cache_key in call_glm_api.request_cache:
            cached = call_glm_api.request_cache[cache_key]
            cache_age = time.time() - cached["timestamp"]
            logger.info(f"Cache entry found: Age (s): {cache_age}, Max age (s): {CACHE_TTL}")
            
            if cache_age < CACHE_TTL:
                logger.info("Cache hit for GLM request, returning cached data")
                return cached["data"]
        
        # Prepare request body
        request_body = {
            "model": "glm-4.5",
            "messages": messages
        }
        
        if stream:
            request_body["stream"] = True
        logger.info(f"GLM API request body prepared: {json.dumps(request_body)}")
        
        # Simulate timeout handling
        try:
            logger.info(f"Sending request to GLM API: {GLM_URL}")
            
            # Simulate different scenarios based on messages
            if any("timeout" in msg.get("content", "") for msg in messages):
                response = await mock_fetch(GLM_URL + "/timeout", {"method": "POST"})
            elif any("error" in msg.get("content", "") for msg in messages):
                response = await mock_fetch(GLM_URL + "/error", {"method": "POST"})
            else:
                response = await mock_fetch(GLM_URL, {"method": "POST"})
            
            logger.info(f"GLM API response received: Status: {response.status}, OK: {response.ok}")
            
            if not response.ok:
                try:
                    error_data = await response.json()
                except:
                    logger.warning("Failed to parse error response as JSON")
                    error_data = {}
                
                error_message = error_data.get("error", {}).get("message") or error_data.get("message") or f"HTTP error! Status: {response.status}"
                logger.error(f"GLM API error: Status: {response.status}, Message: {error_message}, Error data: {json.dumps(error_data)}")
                raise Exception(error_message)
            
            if stream:
                duration = time.time() - start_time
                logger.info(f"GLM streaming request completed in {duration:.2f}s")
                return response
            else:
                logger.info("Parsing GLM API JSON response")
                result = await response.json()
                logger.info(f"GLM API response parsed successfully: Has choices: {bool(result.get('choices'))}, Choices count: {len(result.get('choices', []))}")
                
                # Cache the result
                if cache_key:
                    call_glm_api.request_cache[cache_key] = {
                        "data": result,
                        "timestamp": time.time()
                    }
                    logger.info("GLM API response cached")
                
                duration = time.time() - start_time
                logger.info(f"GLM request completed in {duration:.2f}s")
                return result
        
        except Exception as fetch_error:
            if "timeout" in str(fetch_error).lower():
                logger.error("GLM API call aborted due to timeout")
                raise Exception("Request timeout")
            logger.error(f"GLM API fetch error: Type: {type(fetch_error).__name__}, Message: {str(fetch_error)}")
            raise fetch_error
    
    except Exception as error:
        logger.error(f"GLM API call error: Error: {str(error)}")
        raise error

async def process_async_task(task_id: str, task_input: Dict[str, Any], env: MockEnvironment) -> None:
    """Enhanced processAsyncTask function (adapted from glm-worker.js)"""
    logger.info(f"Starting async task processing: {task_id}, Input: {json.dumps(task_input)}")
    
    try:
        # Initialize in-memory tasks if not exists
        if not hasattr(process_async_task, "tasks"):
            process_async_task.tasks = {}
        
        # Get task from KV storage
        task_data = None
        if env.TASKS_KV:
            task_data = await env.TASKS_KV.get(task_id)
            logger.info(f"KV storage access result for task: {task_id}, Data found: {bool(task_data)}")
        else:
            logger.warning(f"KV storage not available for task: {task_id}")
        
        if not task_data:
            logger.error(f"Task not found in KV storage: {task_id}")
            # Try fallback to in-memory storage
            if task_id in process_async_task.tasks:
                task_data = json.dumps(process_async_task.tasks[task_id])
                logger.info(f"Found task in in-memory storage: {task_id}")
            else:
                logger.error(f"Task not found in any storage: {task_id}")
                return
        
        task = json.loads(task_data)
        logger.info(f"Task parsed successfully: {task_id}, Current status: {task.get('status')}")
        
        # Update task status to processing
        task["status"] = "processing"
        logger.info(f"Updating task status to processing: {task_id}")
        
        # Save to KV storage if available, otherwise use in-memory storage
        if env.TASKS_KV:
            await env.TASKS_KV.put(task_id, json.dumps(task))
            logger.info(f"Task status updated in KV storage: {task_id}")
        else:
            process_async_task.tasks[task_id] = task
            logger.warning(f"KV storage not available, using in-memory fallback for status update: {task_id}")
        
        # Extract messages from task input
        messages = None
        if task_input.get("prompt"):
            messages = [{
                "role": "user",
                "content": task_input["prompt"].strip()
            }]
            logger.info(f"Using prompt format for messages: {task_id}, Prompt length: {len(task_input['prompt'])}")
        elif task_input.get("messages") and isinstance(task_input["messages"], list):
            messages = task_input["messages"]
            logger.info(f"Using messages array format: {task_id}, Messages count: {len(messages)}")
        else:
            logger.error(f"Invalid task input format: {task_id}, Input: {json.dumps(task_input)}")
            raise Exception("Invalid task input format")
        
        # Check GLM API key
        if not env.GLM_API_KEY:
            logger.error(f"GLM API key not configured: {task_id}")
            raise Exception("GLM API key is not configured")
        logger.info(f"GLM API key is configured: {task_id}")
        
        # Call GLM API
        logger.info(f"Calling GLM API for task: {task_id}")
        result = await call_glm_api(messages, env, False)
        logger.info(f"GLM API call successful for task: {task_id}, Result keys: {list(result.keys())}")
        
        # Extract content from GLM response
        content = result.get("choices", [{}])[0].get("message", {}).get("content", "No response from GLM")
        logger.info(f"Content extracted for task: {task_id}, Content length: {len(content)}")
        
        # Update task with result
        task["status"] = "completed"
        task["result"] = {"output": content}
        task["completedAt"] = int(time.time() * 1000)
        logger.info(f"Task result updated: {task_id}, New status: {task['status']}")
        
        # Save to KV storage if available, otherwise use in-memory storage
        if env.TASKS_KV:
            await env.TASKS_KV.put(task_id, json.dumps(task))
            logger.info(f"Task result saved to KV storage: {task_id}")
        else:
            process_async_task.tasks[task_id] = task
            logger.warning(f"KV storage not available, using in-memory fallback for result: {task_id}")
        
        logger.info(f"Async task completed successfully: {task_id}")
        
    except Exception as error:
        logger.error(f"Async task failed: {task_id}, Error: {str(error)}")
        
        # Update task with error
        task = None
        
        # Try to get task from KV storage first
        if env.TASKS_KV:
            task_data = await env.TASKS_KV.get(task_id)
            if task_data:
                task = json.loads(task_data)
                logger.info(f"Retrieved task from KV storage for error handling: {task_id}")
        
        # Fallback to in-memory storage
        if not task and hasattr(process_async_task, "tasks") and task_id in process_async_task.tasks:
            task = process_async_task.tasks[task_id]
            logger.info(f"Retrieved task from in-memory storage for error handling: {task_id}")
        
        if task:
            task["status"] = "failed"
            task["error"] = {
                "message": str(error),
                "timestamp": int(time.time() * 1000)
            }
            task["completedAt"] = int(time.time() * 1000)
            logger.info(f"Task error status updated: {task_id}, Error: {str(error)}")
            
            # Save to KV storage if available, otherwise use in-memory storage
            if env.TASKS_KV:
                await env.TASKS_KV.put(task_id, json.dumps(task))
                logger.info(f"Task error saved to KV storage: {task_id}")
            else:
                process_async_task.tasks[task_id] = task
                logger.warning(f"KV storage not available, using in-memory fallback for error: {task_id}")
        else:
            logger.error(f"Could not find task to update with error: {task_id}")

async def run_tests():
    """Run test scenarios"""
    print("=== Starting GLM Worker Error Handling Tests ===\n")
    
    # Test 1: Successful task processing
    print("Test 1: Successful task processing")
    task_id_1 = "test_task_1"
    task_input_1 = {
        "prompt": "Hello, please respond with a greeting"
    }
    
    # Create initial task
    task_1 = {
        "id": task_id_1,
        "status": "pending",
        "input": task_input_1,
        "createdAt": int(time.time() * 1000)
    }
    
    # Create environment
    env = MockEnvironment()
    
    # Store task in KV
    await env.TASKS_KV.put(task_id_1, json.dumps(task_1))
    
    # Process task
    await process_async_task(task_id_1, task_input_1, env)
    
    # Check result
    result_1 = await env.TASKS_KV.get(task_id_1)
    print(f"Test 1 Result: {result_1}")
    print("---\n")
    
    # Test 2: API timeout error
    print("Test 2: API timeout error")
    task_id_2 = "test_task_2"
    task_input_2 = {
        "prompt": "This should timeout"
    }
    
    # Create initial task
    task_2 = {
        "id": task_id_2,
        "status": "pending",
        "input": task_input_2,
        "createdAt": int(time.time() * 1000)
    }
    
    # Store task in KV
    await env.TASKS_KV.put(task_id_2, json.dumps(task_2))
    
    # Process task (should fail with timeout)
    await process_async_task(task_id_2, task_input_2, env)
    
    # Check result
    result_2 = await env.TASKS_KV.get(task_id_2)
    print(f"Test 2 Result: {result_2}")
    print("---\n")
    
    # Test 3: Invalid input format
    print("Test 3: Invalid input format")
    task_id_3 = "test_task_3"
    task_input_3 = {
        "invalidField": "This should cause an error"
    }
    
    # Create initial task
    task_3 = {
        "id": task_id_3,
        "status": "pending",
        "input": task_input_3,
        "createdAt": int(time.time() * 1000)
    }
    
    # Store task in KV
    await env.TASKS_KV.put(task_id_3, json.dumps(task_3))
    
    # Process task (should fail with invalid input)
    await process_async_task(task_id_3, task_input_3, env)
    
    # Check result
    result_3 = await env.TASKS_KV.get(task_id_3)
    print(f"Test 3 Result: {result_3}")
    print("---\n")
    
    # Test 4: Missing API key
    print("Test 4: Missing API key")
    task_id_4 = "test_task_4"
    task_input_4 = {
        "prompt": "This should fail due to missing API key"
    }
    
    # Create initial task
    task_4 = {
        "id": task_id_4,
        "status": "pending",
        "input": task_input_4,
        "createdAt": int(time.time() * 1000)
    }
    
    # Store task in KV
    await env.TASKS_KV.put(task_id_4, json.dumps(task_4))
    
    # Create environment without API key
    env_without_key = MockEnvironment(api_key=None)
    
    # Process task (should fail with missing API key)
    await process_async_task(task_id_4, task_input_4, env_without_key)
    
    # Check result
    result_4 = await env.TASKS_KV.get(task_id_4)
    print(f"Test 4 Result: {result_4}")
    print("---\n")
    
    print("=== All tests completed ===")

if __name__ == "__main__":
    asyncio.run(run_tests())