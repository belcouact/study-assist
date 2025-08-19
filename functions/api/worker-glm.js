// GLM Worker Output Function
// This file provides the workerGlmOutput function for chat-glm.js

async function workerGlmOutput(prompt, env) {
  try {
    // Get API key from environment
    const GLM_KEY = env.GLM_API_KEY || env.DEEPSEEK_API_KEY;
    if (!GLM_KEY) {
      throw new Error('Neither GLM API key nor DeepSeek API key is configured');
    }
    
    // GLM API endpoint
    const GLM_URL = "https://open.bigmodel.cn/api/paas/v4/chat/completions";
    
    // Create messages array from prompt
    const messages = [{
      role: "user",
      content: prompt.trim()
    }];
    
    console.log('Sending GLM request with prompt:', prompt);
    
    const response = await fetch(GLM_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GLM_KEY}`
      },
      body: JSON.stringify({
        model: "glm-4.5",
        messages: messages,
        temperature: 0.7,
        max_tokens: 2000
      })
    });
    
    console.log('GLM Response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || errorData.message || `GLM API error: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('Raw GLM API response:', result);
    
    // Extract the content from the response
    const content = result.choices?.[0]?.message?.content || "No response from GLM";
    
    return content;
  } catch (error) {
    console.error('GLM API call error:', error);
    throw error;
  }
}

// Export the function for CommonJS
module.exports = { workerGlmOutput };

// Also export as ES module for compatibility
export { workerGlmOutput };