// Middleware to handle response headers
export async function onRequest(context) {
  const { request, next } = context;
  
  // Get the response from the next middleware or page
  const response = await next();
  
  // Clone the response so we can modify headers
  const newResponse = new Response(response.body, response);
  
  // Remove the problematic Speculation-Rules header that's causing 404 errors
  // This is a temporary fix until the proper speculation endpoint is working
  newResponse.headers.delete("Speculation-Rules");
  
  // Add security headers
  newResponse.headers.set("X-Content-Type-Options", "nosniff");
  newResponse.headers.set("X-Frame-Options", "DENY");
  newResponse.headers.set("X-XSS-Protection", "1; mode=block");
  
  return newResponse;
} 