// functions/api/ninjas.js
export const onRequestOptions = async ({ request }) => {
  // Optional CORS preflight support (adjust allowed origin as needed)
  const headers = {
    'Access-Control-Allow-Origin': '*',            // tighten in production
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
  return new Response(null, { headers });
};

export const onRequestGet = async ({ request, env }) => {
  const url = new URL(request.url);
  const endpoint = url.searchParams.get('endpoint') || 'country';
  
  if (endpoint === 'countryflag') {
    return handleCountryFlag(request, env);
  }
  
  if (endpoint === 'advice') {
    return handleAdvice(request, env);
  }
  
  if (endpoint === 'horoscope') {
    return handleHoroscope(request, env);
  }
  
  return handleCountryData(request, env);
};

async function handleCountryData(request, env) {
  const url = new URL(request.url);
  const name = url.searchParams.get('name') || '';
  if (!name) {
    return Response.json({ error: "Missing 'name' query param" }, { status: 400 });
  }

  // Build upstream request (per API Ninjas docs)
  const upstream = new URL('https://api.api-ninjas.com/v1/country');
  upstream.searchParams.set('name', name);

  // (Optional) Edge cache: try to serve from Cloudflare cache first
  const cacheKey = new Request(upstream.toString(), { headers: { 'X-Api-Key': 'omitted' } });
  const cache = caches.default; // Cloudflare Cache API
  let cached = await cache.match(cacheKey);
  if (cached) return cached; // cache hit

  const res = await fetch(upstream.toString(), {
    headers: { 'X-Api-Key': env.API_NINJAS_KEY }, // secret from CF
  });

  // Pass through response body/status; set cache headers if OK
  const text = await res.text();
  const headers = new Headers(res.headers);
  headers.set('Content-Type', headers.get('Content-Type') || 'application/json');
  // Cache for 12 hours at the edge (tune for your use case)
  if (res.ok) headers.set('Cache-Control', 'public, s-maxage=43200');

  const out = new Response(text, { status: res.status, headers });

  // Store in Cloudflare's edge cache (respects Cache-Control, Set-Cookie cannot be cached)
  if (res.ok) await cache.put(cacheKey, out.clone());
  return out;
}

async function handleCountryFlag(request, env) {
  const url = new URL(request.url);
  const country = url.searchParams.get('country') || '';
  if (!country) {
    return Response.json({ error: "Missing 'country' query param" }, { status: 400 });
  }

  // Build upstream request for country flag
  const upstream = new URL('https://api.api-ninjas.com/v1/countryflag');
  upstream.searchParams.set('country', country);

  // (Optional) Edge cache: try to serve from Cloudflare cache first
  const cacheKey = new Request(upstream.toString(), { headers: { 'X-Api-Key': 'omitted' } });
  const cache = caches.default; // Cloudflare Cache API
  let cached = await cache.match(cacheKey);
  if (cached) return cached; // cache hit

  const res = await fetch(upstream.toString(), {
    headers: { 'X-Api-Key': env.API_NINJAS_KEY }, // secret from CF
  });

  // Pass through response body/status; set cache headers if OK
  const text = await res.text();
  const headers = new Headers(res.headers);
  headers.set('Content-Type', headers.get('Content-Type') || 'application/json');
  // Cache for 12 hours at the edge (tune for your use case)
  if (res.ok) headers.set('Cache-Control', 'public, s-maxage=43200');

  const out = new Response(text, { status: res.status, headers });

  // Store in Cloudflare's edge cache (respects Cache-Control, Set-Cookie cannot be cached)
  if (res.ok) await cache.put(cacheKey, out.clone());
  return out;
}

async function handleAdvice(request, env) {
  // Build upstream request for advice
  const upstream = new URL('https://api.api-ninjas.com/v1/advice');

  // (Optional) Edge cache: try to serve from Cloudflare cache first
  const cacheKey = new Request(upstream.toString(), { headers: { 'X-Api-Key': 'omitted' } });
  const cache = caches.default; // Cloudflare Cache API
  let cached = await cache.match(cacheKey);
  if (cached) return cached; // cache hit

  const res = await fetch(upstream.toString(), {
    headers: { 'X-Api-Key': env.API_NINJAS_KEY }, // secret from CF
  });

  // Pass through response body/status; set cache headers if OK
  const text = await res.text();
  const headers = new Headers(res.headers);
  headers.set('Content-Type', headers.get('Content-Type') || 'application/json');
  // Cache for 12 hours at the edge (tune for your use case)
  if (res.ok) headers.set('Cache-Control', 'public, s-maxage=43200');

  const out = new Response(text, { status: res.status, headers });

  // Store in Cloudflare's edge cache (respects Cache-Control, Set-Cookie cannot be cached)
  if (res.ok) await cache.put(cacheKey, out.clone());
  return out;
}

async function handleHoroscope(request, env) {
  const url = new URL(request.url);
  const zodiac = url.searchParams.get('zodiac') || 'aries';
  
  // Build upstream request for horoscope
  const upstream = new URL('https://api.api-ninjas.com/v1/horoscope');
  upstream.searchParams.set('zodiac', zodiac);

  // (Optional) Edge cache: try to serve from Cloudflare cache first
  const cacheKey = new Request(upstream.toString(), { headers: { 'X-Api-Key': 'omitted' } });
  const cache = caches.default; // Cloudflare Cache API
  let cached = await cache.match(cacheKey);
  if (cached) return cached; // cache hit

  const res = await fetch(upstream.toString(), {
    headers: { 'X-Api-Key': env.API_NINJAS_KEY }, // secret from CF
  });

  // Pass through response body/status; set cache headers if OK
  const text = await res.text();
  const headers = new Headers(res.headers);
  headers.set('Content-Type', headers.get('Content-Type') || 'application/json');
  // Cache for 12 hours at the edge (tune for your use case)
  if (res.ok) headers.set('Cache-Control', 'public, s-maxage=43200');

  const out = new Response(text, { status: res.status, headers });

  // Store in Cloudflare's edge cache (respects Cache-Control, Set-Cookie cannot be cached)
  if (res.ok) await cache.put(cacheKey, out.clone());
  return out;
}
