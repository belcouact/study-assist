// Handle the Speculation-Rules API request
export async function onRequest(context) {
  return new Response(JSON.stringify({
    // Empty rules set to prevent 404 errors
    prefetch: [{ source: "list", urls: [] }],
    prerender: [{ source: "list", urls: [] }]
  }), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600"
    }
  });
} 