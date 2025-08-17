// Data Analysis Route Handler
const { handleDataAnalysis, handleOptions } = require('./data-analysis');

async function dataAnalysisRoute(request, env) {
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
        return handleOptions();
    }

    // Handle POST requests for data analysis
    if (request.method === 'POST') {
        return handleDataAnalysis(request, env);
    }

    // Return 405 for other methods
    return new Response('Method not allowed', { status: 405 });
}

// Export the route handler
module.exports = {
    dataAnalysisRoute
};

// For browser environments
if (typeof window !== 'undefined') {
    window.dataAnalysisRoute = dataAnalysisRoute;
}