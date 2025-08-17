// Data Analysis API using GLM-4.5
const { workerGlmOutput } = require('./worker-glm');

async function handleDataAnalysis(request, env) {
    try {
        // Only handle POST requests
        if (request.method !== 'POST') {
            return new Response('Method not allowed', { status: 405 });
        }

        // Parse request body
        const body = await request.json();
        const { prompt, data, chartType, analysisGoal } = body;

        if (!prompt) {
            return new Response(
                JSON.stringify({ error: 'Prompt is required' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Call GLM-4.5 API
        const result = await workerGlmOutput(prompt, env);

        // Return the response
        return new Response(
            JSON.stringify({ 
                success: true, 
                content: result,
                timestamp: new Date().toISOString()
            }),
            { 
                status: 200, 
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type'
                }
            }
        );

    } catch (error) {
        console.error('Data analysis error:', error);
        return new Response(
            JSON.stringify({ 
                error: 'Internal server error',
                message: error.message,
                timestamp: new Date().toISOString()
            }),
            { 
                status: 500, 
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}

// Handle OPTIONS requests for CORS
async function handleOptions() {
    return new Response(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    });
}

// Export the handler
module.exports = {
    handleDataAnalysis,
    handleOptions
};

// For browser environments
if (typeof window !== 'undefined') {
    window.handleDataAnalysis = handleDataAnalysis;
    window.handleOptions = handleOptions;
}