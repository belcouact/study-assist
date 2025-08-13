// GLM-4.5 Text Generation Functions
const GLM_URL = "https://open.bigmodel.cn/api/paas/v4/chat/completions";

// Define the function to be exported
async function workerGlmOutput(prompt, env) {
    try {
        // Validate input
        if (!prompt || prompt.trim() === '') {
            throw new Error('Please enter a valid prompt');
        }

        // Get API key from environment
        const GLM_KEY = env.GLM_API_KEY;
        if (!GLM_KEY) {
            throw new Error('GLM API key not configured');
        }

        // Log the request details
        console.log('Sending GLM request with prompt:', prompt.trim());
        console.log('Request URL:', GLM_URL);

        const response = await fetch(GLM_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${GLM_KEY}`
            },
            body: JSON.stringify({
                model: "glm-4.5",
                messages: [{
                    role: "user",
                    content: prompt.trim()
                }],
                temperature: 0.7,
                max_tokens: 2000
            })
        });

        // Log the response status
        console.log('GLM Response status:', response.status);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || errorData.message || `HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        
        // Log the raw response
        console.log('Raw GLM API response:', result);
        
        // Format the response based on the GLM API structure
        if (result.choices && result.choices[0]?.message?.content) {
            return result.choices[0].message.content;
        } else if (result.message) {
            // Return the message content if it's in the expected format
            return result.message;
        }
        return JSON.stringify(result, null, 2);
    } catch (error) {
        console.error('GLM Worker call error:', error);
        throw error;
    }
}

// Export the function - support both CommonJS and ES modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { workerGlmOutput };
} else {
    // Make it available globally for browser environments
    self.workerGlmOutput = workerGlmOutput;
}