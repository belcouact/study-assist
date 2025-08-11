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

  console.log('Storing data in D1:', {
      dataLength: data.length,
      database,
      table,
      batchSize,
      dataType: typeof data
    })

  try {
    // Get D1 database client - ensure this matches your Cloudflare Workers D1 binding
    // The binding name should correspond to your actual D1 database
    const DB = globalThis[database.toUpperCase()];
    const d1Database = `cloudflare-d1-${database}`;
    
    if (!DB) {
      throw new Error(`D1 database not available. Ensure D1 binding named "${database.toUpperCase()}" is configured.`)
    }
    
    console.log('Using D1 database binding:', { binding: database.toUpperCase(), database: d1Database });

    // Clear existing data for this table
    try {
      const deleteResult = await DB.prepare(`DELETE FROM ${table}`).run();
      deletedCount = deleteResult.meta.changes;
      console.log(`Cleared existing data from ${database}.${table}: ${deletedCount} records deleted`);
    } catch (deleteError) {
      console.warn(`Warning: Could not clear existing data from ${database}.${table}:`, deleteError.message);
      // Continue even if delete fails (table might not exist yet)
    }

    // Validate data
    const validData = data.filter(record => {
      if (record === null || record === undefined || typeof record !== 'object') {
        invalidRecords++;
        return false;
      }
      return true;
    })

    // Store data in batches
    if (validData.length > 0) {
      // Get column names from first valid record
      const columns = Object.keys(validData[0]);
      const placeholders = validData.map((_, i) => 
        `(${columns.map((_, j) => `$${i * columns.length + j + 1}`).join(',')})`
      ).join(',');

      // Flatten values for prepared statement
      const values = validData.flatMap(record => 
        columns.map(column => record[column])
      );

      // Create insert statement
      const insertQuery = `INSERT INTO ${table} (${columns.join(',')}) VALUES ${placeholders}`;
      console.log(`Executing insert query: ${insertQuery.substring(0, 100)}...`);

      // Execute batch insert
      const result = await DB.prepare(insertQuery).bind(...values).run();
      insertedCount = result.meta.changes;
      console.log(`Inserted ${insertedCount} records into ${database}.${table}`);
    }

    const duration = Date.now() - startTime
    console.log('D1 storage complete:', {
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
      totalRecords: data.length,
      database: {
        name: database,
        table: table,
        status: 'active',
        storageLocation: d1Database,
        recordsStored: insertedCount,
        binding: database.toUpperCase()
      }
    }

  } catch (error) {
    console.error('Storage error:', error)
    throw new Error(`Failed to store data: ${error.message}`)
  }
}