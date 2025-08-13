# GLM-4.5 API Integration for Cloudflare Workers

This guide explains how to set up and use the GLM-4.5 model integration with Cloudflare Workers in your study-assist project.

## Files Created

1. **`functions/api/worker-glm.js`** - Core worker function that handles GLM-4.5 API communication
2. **`functions/api/chat-glm.js`** - HTTP request handler for GLM-4.5 chat endpoints
3. **`functions/api/glm-route.js`** - Route handler that forwards `/api/glm` requests to the chat handler
4. **`functions/[[path]].js`** - Updated to include GLM API routing
5. **`test-glm.html`** - Test page for verifying GLM-4.5 API functionality

## Setup Instructions

### 1. Environment Variables

You need to add your GLM API key to your Cloudflare Workers environment variables:

```bash
# For local development
# Add to .env file or wrangler.toml
GLM_API_KEY = "your_glm_api_key_here"
```

### 2. Cloudflare Workers Configuration

Add the environment variable to your Cloudflare Workers project:

1. Go to your Cloudflare Workers dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Add a new variable:
   - Variable name: `GLM_API_KEY`
   - Value: Your GLM API key from BigModel.cn

### 3. API Usage

The GLM-4.5 API is available at `/api/glm` and supports two request formats:

#### Simple Prompt Format

```javascript
const response = await fetch('/api/glm', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    prompt: 'Hello, can you help me with my homework?'
  })
});

const data = await response.json();
console.log(data.output); // GLM-4.5 response
```

#### Messages Array Format

```javascript
const response = await fetch('/api/glm', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    messages: [
      {role: 'system', content: 'You are a helpful tutor'},
      {role: 'user', content: 'Explain photosynthesis in simple terms'}
    ]
  })
});

const data = await response.json();
console.log(data.choices[0].message.content); // GLM-4.5 response
```

### 4. Testing

Open `test-glm.html` in your browser to test the GLM-4.5 API integration:

1. Enter a prompt in the textarea
2. Click "Send to GLM-4.5"
3. View the response in the response area

## API Details

### Endpoint
- **URL**: `/api/glm`
- **Method**: `POST`
- **Content-Type**: `application/json`

### Request Body Options

#### Option 1: Simple Prompt
```json
{
  "prompt": "Your question here"
}
```

#### Option 2: Messages Array
```json
{
  "messages": [
    {"role": "system", "content": "System message"},
    {"role": "user", "content": "User message"}
  ]
}
```

### Response Format

#### Success Response
```json
{
  "output": "GLM-4.5 response text here"
}
```

Or for messages array format:
```json
{
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "GLM-4.5 response text here"
      }
    }
  ],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 20,
    "total_tokens": 30
  }
}
```

#### Error Response
```json
{
  "error": "Error description",
  "message": "Detailed error message"
}
```

## Configuration Parameters

The GLM-4.5 worker uses the following default parameters:
- **Model**: `glm-4.5`
- **Temperature**: `0.7`
- **Max tokens**: `2000`
- **API URL**: `https://open.bigmodel.cn/api/paas/v4/chat/completions`

## Troubleshooting

### Common Issues

1. **API Key Not Configured**
   - Error: "GLM API key not configured"
   - Solution: Add `GLM_API_KEY` to your Cloudflare Workers environment variables

2. **Invalid API Key**
   - Error: "HTTP error! Status: 401"
   - Solution: Verify your GLM API key is correct and has proper permissions

3. **Rate Limiting**
   - Error: "HTTP error! Status: 429"
   - Solution: Wait and try again, or check your API quota

4. **Invalid Request Format**
   - Error: "Missing prompt or messages in request body"
   - Solution: Ensure your request body includes either `prompt` or `messages` field

### Debugging

1. Check the browser console for error messages
2. Use the Network tab in browser dev tools to inspect API requests
3. Verify environment variables are set correctly in Cloudflare Workers dashboard
4. Check Cloudflare Workers logs for detailed error information

## Deployment

1. **Local Development**:
   ```bash
   npm run dev
   # Or use wrangler
   npx wrangler dev
   ```

2. **Production Deployment**:
   ```bash
   npx wrangler deploy
   ```

3. **Environment Variables for Production**:
   Make sure to set `GLM_API_KEY` in your production environment through the Cloudflare dashboard or wrangler:
   ```bash
   npx wrangler secret put GLM_API_KEY
   ```

## Security Considerations

1. **API Key Security**:
   - Never commit your API key to version control
   - Use environment variables or secrets management
   - Rotate your API keys regularly

2. **Request Validation**:
   - The worker validates input prompts and handles errors gracefully
   - CORS headers are properly configured for web browser access

3. **Rate Limiting**:
   - Consider implementing rate limiting at the application level
   - Monitor your API usage to avoid exceeding quotas

## Integration with Existing Features

The GLM-4.5 integration follows the same pattern as existing API integrations in your project:
- DeepSeek API (`/api/chat`)
- TTS API (`/api/tts`)
- Database API (`/api/db/*`)

This makes it easy to integrate GLM-4.5 into your existing study assist features.

## Support

For issues related to:
- **GLM API**: Contact BigModel.cn support
- **Cloudflare Workers**: Check Cloudflare documentation
- **Project Integration**: Review existing code patterns in the `functions/api/` directory