@echo off
echo Deploying GLM Worker with KV storage fallback...
echo.

REM Check if wrangler is installed
where wrangler >nul 2>nul
if %errorlevel% neq 0 (
    echo Wrangler CLI is not installed. Please install it first:
    echo npm install -g wrangler
    echo.
    echo Then login to Cloudflare:
    echo wrangler login
    pause
    exit /b 1
)

REM Deploy the worker
echo Deploying GLM Worker...
wrangler deploy --env production --config wrangler-glm.toml

if %errorlevel% equ 0 (
    echo.
    echo Deployment successful!
    echo.
    echo You can now test the async task API:
    echo POST: https://glm.study-llm.me/api/async-task
    echo GET:  https://glm.study-llm.me/api/async-task?taskId=YOUR_TASK_ID
    echo.
    echo Note: If KV storage is not configured, the system will use in-memory fallback.
) else (
    echo.
    echo Deployment failed. Please check the error messages above.
)

pause