/**
 * API Route Handler for various API endpoints
 */

export async function onRequest(context) {
  const { request, env, params } = context;
  const { pathname } = new URL(request.url);
  
  // Handle OPTIONS request for CORS
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
      },
    });
  }
    // API endpoints routing
  if (pathname.startsWith('/api/')) {
    // Handle API routes
    
    // Environment variable API
    if (pathname.startsWith('/api/env/')) {
      // Forward the request to the env handler
      return await import('./api/env.js')
        .then(module => module.onRequest(context))
        .catch(error => {
          console.error('Error loading env module:', error);
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Internal server error loading env module' 
          }), {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          });
        });
    }
    
    // Edge TTS API
    if (pathname === '/api/edge-tts') {
      // Forward the request to the edge-tts handler
      return await import('./api/edge-tts-route.js')
        .then(module => module.onRequest(context))
        .catch(error => {
          console.error('Error loading edge-tts-route module:', error);
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Internal server error loading worker-edge-tts module' 
          }), {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          });
        });
    }
    
    // TTS API
    if (pathname === '/api/tts') {
      // Forward the request to the tts handler
      return await import('./api/tts-route.js')
        .then(module => module.onRequest(context))
        .catch(error => {
          console.error('Error loading tts-route module:', error);
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Internal server error loading tts module' 
          }), {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          });
        });
    }
    
    // Ark Image API
    if (pathname === '/api/ark-image') {
      // Forward the request to the ark-image handler
      return await import('./api/ark-image-route.js')
        .then(module => module.onRequest(context))
        .catch(error => {
          console.error('Error loading ark-image-route module:', error);
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Internal server error loading ark-image module' 
          }), {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          });
        });
    }
    
    // Chat API
    if (pathname === '/api/chat') {
      // Forward the request to the chat handler
      return await import('./api/chat.js')
        .then(module => module.onRequest(context))
        .catch(error => {
          console.error('Error loading chat module:', error);
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Internal server error loading chat module' 
          }), {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          });
        });
    }
    
    // GLM API
    if (pathname === '/api/glm') {
      // Forward the request to the glm handler
      return await import('./api/glm-route.js')
        .then(module => module.onRequest(context))
        .catch(error => {
          console.error('Error loading glm-route module:', error);
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Internal server error loading glm module' 
          }), {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          });
        });
    }
    

    
    // Database Query API
    if (pathname.startsWith('/api/db/query/')) {
      const queryPath = pathname.replace('/api/db/query/', '');
      
      // Forward the request to the database query handler
      return await import('./api/db-query.js')
        .then(module => {
          // Add queryPath to context
          context.queryPath = queryPath;
          return module.onRequest(context);
        })
        .catch(error => {
          console.error('Error loading db-query module:', error);
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Internal server error loading db-query module' 
          }), {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          });
        });
    }
    
    // Database Query API for ws routes
    if (pathname.startsWith('/ws/api/db/query/')) {
      const queryPath = pathname.replace('/ws/api/db/query/', '');
      
      // Forward the request to the database query handler
      return await import('./api/db/[action]/[table].js')
        .then(module => {
          // Set up context for query action
          context.params = { action: 'query', table: queryPath };
          return module.onRequest(context);
        })
        .catch(error => {
          console.error('Error loading db-query module:', error);
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Internal server error loading db-query module' 
          }), {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          });
        });
    }
    
    // Database Upload API for ws routes
    if (pathname.startsWith('/ws/api/db/upload/')) {
      const uploadPath = pathname.replace('/ws/api/db/upload/', '');
      
      // Forward the request to the database upload handler
      return await import('./api/db/[action]/[table].js')
        .then(module => {
          // Set up context for upload action
          context.params = { action: 'upload', table: uploadPath };
          return module.onRequest(context);
        })
        .catch(error => {
          console.error('Error loading db-upload module:', error);
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Internal server error loading db-upload module' 
          }), {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          });
        });
    }
    
    // Handle unknown API endpoints
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'API endpoint not found' 
    }), {
      status: 404,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
  
  // For non-API routes, pass through to next handler
  return context.next();
}