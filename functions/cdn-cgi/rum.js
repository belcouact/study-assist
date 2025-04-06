// Handle Real User Monitoring (RUM) requests from Cloudflare
export async function onRequest(context) {
  // Just return a simple success response
  // In a real implementation, this would process analytics data
  return new Response(JSON.stringify({
    success: true,
    message: "RUM metrics received"
  }), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store, no-cache",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
} 