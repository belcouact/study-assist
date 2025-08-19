// Text Generation Functions
const DS_URL = "https://chat-api.study-llm.me";

// Define the function to be exported
async function workerChatOutput(prompt, env) {
    try {
        // Validate input
        if (!prompt || prompt.trim() === '') {
            throw new Error('Please enter a valid prompt');
        }

        // Get API key from environment
        const DS_KEY = env.DEEPSEEK_API_KEY;
        if (!DS_KEY) {
            throw new Error('API key not configured');
        }

        // Log the request details
        console.log('Sending request with prompt:', prompt.trim());
        console.log('Request URL:', DS_URL);

        const response = await fetch(DS_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${DS_KEY}`
            },
            body: JSON.stringify({
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
        console.log('Raw API response:', result);
        
        // Format the response based on the API structure
        if (result.choices && result.choices[0]?.message?.content) {
            return result.choices[0].message.content;
        } else if (result.message) {
            // Return the message content if it's in the expected format
            return result.message;
        }
        return JSON.stringify(result, null, 2);
    } catch (error) {
        console.error('Worker call error:', error);
        throw error;
    }
}

// Export for ES modules (Cloudflare Workers/Vercel)
export { workerChatOutput };