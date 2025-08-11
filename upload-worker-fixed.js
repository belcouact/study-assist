// Cloudflare Worker for handling large dataset uploads
// Fixed version with comprehensive error handling and debugging

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // Enable CORS for all origins
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  }

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders
    })
  }

  // Handle GET request for health check
  if (request.method === 'GET') {
    return new Response(JSON.stringify({
      success: true,
      message: 'Worker is healthy',
      supportedMethods: ['POST', 'GET', 'OPTIONS'],
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    })
  }

  // Only handle POST requests for uploads
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({
      success: false,
      error: 'Method not allowed',
      allowedMethods: ['POST', 'GET', 'OPTIONS']
    }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    })
  }

  try {
    const url = new URL(request.url)
    const database = url.searchParams.get('database') || 'default'
    const table = url.searchParams.get('table') || 'lab_warehouse'
    const batchSize = parseInt(url.searchParams.get('batchSize')) || 50
    console.log('Upload parameters:', { database, table, batchSize })

    // Parse JSON data from request body
    const body = await request.json()
    
    // Debug logging
    console.log('Request received:', {
      method: request.method,
      url: request.url,
      database,
      batchSize,
      bodyKeys: Object.keys(body),
      bodyType: typeof body
    })

    // Extract data - handle different formats
    let data = body.data || body.rows || body
    
    if (!Array.isArray(data)) {
      console.error('Invalid data format - expected array, got:', typeof data)
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid data format: expected array',
        receivedType: typeof data,
        details: 'Data must be an array of objects'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      })
    }

    console.log('Processing upload:', {
      dataLength: data.length,
      database,
      batchSize,
      sampleRecord: data[0] || 'No data'
    })

    // Store data in KV
    const result = await storeInDatabase(data, database, table, batchSize)
    
    return new Response(JSON.stringify({
      success: true,
      details: result
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    })

  } catch (error) {
    console.error('Worker error:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Internal server error',
      stack: error.stack
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    })
  }
}

async function storeInDatabase(data, database, table, batchSize) {
  const startTime = Date.now()
  let insertedCount = 0
  let deletedCount = 0
  let invalidRecords = 0

  console.log('Storing data:', {
      dataLength: data.length,
      database,
      table,
      batchSize,
      dataType: typeof data
    })

  try {
    // Get KV namespace
    const DATA_KV = DATA
    
    if (!DATA_KV) {
      throw new Error('KV namespace not available')
    }

    // Clear existing data for this database
    const existingKeys = await DATA_KV.list({ prefix: `${database}:${table}:` })
    if (existingKeys.keys.length > 0) {
      await DATA_KV.delete(existingKeys.keys.map(k => k.name))
      deletedCount = existingKeys.keys.length
    }

    // Validate and store new data
    const validData = data.filter(record => {
      if (record === null || record === undefined) {
        invalidRecords++
        return false
      }
      return true
    })

    // Store data in batches
    const batches = []
    for (let i = 0; i < validData.length; i += batchSize) {
      batches.push(validData.slice(i, i + batchSize))
    }

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex]
      const key = `${database}:${table}:batch_${batchIndex}`
      await DATA_KV.put(key, JSON.stringify(batch))
      insertedCount += batch.length
    }

    const duration = Date.now() - startTime
    console.log('Storage complete:', {
      insertedCount,
      deletedCount,
      invalidRecords,
      duration: `${duration}ms`,
      database,
      table
    })

    return {
      insertedCount,
      deletedCount,
      invalidRecords,
      duration: `${duration}ms`,
      totalRecords: data.length
    }

  } catch (error) {
    console.error('Storage error:', error)
    throw new Error(`Failed to store data: ${error.message}`)
  }
}