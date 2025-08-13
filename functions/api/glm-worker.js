// GLM-4.5 Model Worker
// This worker connects to the GLM-4.5 model API

// Define the function to be exported
async function glmWorkerOutput(prompt, env) {
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

        // GLM-4.5 API endpoint
        const GLM_URL = "https://open.bigmodel.cn/api/paas/v4/chat/completions";

        // Log the request details
        console.log('Sending request to GLM-4.5 with prompt:', prompt.trim());
        console.log('Request URL:', GLM_URL);

        const response = await fetch(GLM_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${GLM_KEY}`
            },
            body: JSON.stringify({
                model: "glm-4-0520",
                messages: [{
                    role: "user",
                    content: prompt.trim()
                }],
                temperature: 0.7,
                max_tokens: 2000
            })
        });

        // Log the response status
        console.log('Response status:', response.status);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        
        // Log the raw response
        console.log('Raw GLM API response:', result);
        
        // Format the response based on the API structure
        if (result.choices && result.choices[0]?.message?.content) {
            return result.choices[0].message.content;
        } else if (result.message) {
            // Return the message content if it's in the expected format
            return result.message;
        }
        return JSON.stringify(result, null, 2);
    } catch (error) {
        console.error('GLM worker call error:', error);
        throw error;
    }
}

// Export the function - support both CommonJS and ES modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { glmWorkerOutput };
} else {
    // Make it available globally for browser environments
    self.glmWorkerOutput = glmWorkerOutput;
}