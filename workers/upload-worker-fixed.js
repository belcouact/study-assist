// Cloudflare Worker for Large Dataset Upload to db_gore
// Optimized for 50k+ rows with timeout prevention and async processing

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

// Configuration
const MAX_BATCH_SIZE = 1000; // Adjust based on database performance
const MAX_CONCURRENT_BATCHES = 5; // Prevent overwhelming database
const RETRY_ATTEMPTS = 3; // Retry failed batches
const RETRY_DELAY_MS = 1000; // Initial retry delay

async function handleRequest(request) {
  // CORS configuration
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  // Health check endpoint
  if (request.method === 'GET') {
    return new Response(JSON.stringify({
      success: true,
      message: 'Worker is healthy',
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }

  // Only accept POST requests
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
    });
  }

  try {
    // Parse request parameters
    const url = new URL(request.url);
    const database = url.searchParams.get('database') || 'db_gore';
    const table = url.searchParams.get('table') || 'lab_warehouse';
    let batchSize = parseInt(url.searchParams.get('batchSize')) || 500;

    // Ensure batch size is within limits
    batchSize = Math.min(Math.max(batchSize, 100), MAX_BATCH_SIZE);

    // Parse JSON data from request body
    const body = await request.json();
    let data = body.data || body.rows || body;

    // Validate data format
    if (!Array.isArray(data)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid data format: expected array',
        receivedType: typeof data
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    if (data.length === 0) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Data array cannot be empty'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    // Log upload start
    console.log(`Starting upload to ${database}.${table}: ${data.length} records`);

    // Process data in batches
    const batches = [];
    for (let i = 0; i < data.length; i += batchSize) {
      batches.push(data.slice(i, i + batchSize));
    }

    // Process batches with concurrency control
    const results = [];
    const semaphore = new Semaphore(MAX_CONCURRENT_BATCHES);

    const batchPromises = batches.map(async (batch, index) => {
      await semaphore.acquire();
      try {
        const result = await processBatch(batch, table, index);
        results.push(result);
        return result;
      } finally {
        semaphore.release();
      }
    });

    // Wait for all batches to complete
    await Promise.all(batchPromises);

    // Calculate total inserted records
    const totalInserted = results.reduce((sum, result) => sum + result.inserted, 0);
    const failedBatches = results.filter(result => result.failed).length;

    // Log upload completion
    console.log(`Upload completed: ${totalInserted}/${data.length} records inserted`);

    return new Response(JSON.stringify({
      success: true,
      message: `Upload completed successfully`,
      details: {
        totalRecords: data.length,
        insertedCount: totalInserted,
        batchCount: batches.length,
        failedBatches: failedBatches,
        batchSize: batchSize
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });

  } catch (error) {
    console.error('Worker error:', error);
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
    });
  }
}

// Semaphore class for concurrency control
class Semaphore {
  constructor(limit) {
    this.limit = limit;
    this.count = 0;
    this.queue = [];
  }

  async acquire() {
    if (this.count < this.limit) {
      this.count++;
      return;
    }

    return new Promise(resolve => {
      this.queue.push(resolve);
    });
  }

  release() {
    if (this.queue.length > 0) {
      const resolve = this.queue.shift();
      resolve();
    } else {
      this.count--;
    }
  }
}

// Process a single batch with retry logic
async function processBatch(batch, table, batchNumber) {
  let attempts = 0;
  let lastError;

  while (attempts < RETRY_ATTEMPTS) {
    try {
      attempts++;
      const inserted = await insertIntoDbGore(batch, table);
      console.log(`Batch ${batchNumber} (attempt ${attempts}): Inserted ${inserted} records`);
      return {
        batchNumber,
        inserted,
        failed: false
      };
    } catch (error) {
      lastError = error;
      console.error(`Batch ${batchNumber} (attempt ${attempts}) failed:`, error);

      if (attempts < RETRY_ATTEMPTS) {
        const delay = RETRY_DELAY_MS * Math.pow(2, attempts - 1); // Exponential backoff
        console.log(`Retrying batch ${batchNumber} in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  console.error(`Batch ${batchNumber} failed after ${RETRY_ATTEMPTS} attempts`);
  return {
    batchNumber,
    inserted: 0,
    failed: true,
    error: lastError.message
  };
}

// Insert batch into db_gore database
async function insertIntoDbGore(batch, table) {
  // Check if D1 database binding exists
  if (!env.DB_GORE) {
    throw new Error('DB_GORE database binding not found');
  }

  if (batch.length === 0) {
    return 0;
  }

  // Prepare insert query with parameterized values
  const columns = Object.keys(batch[0]).join(', ');
  const placeholders = batch.map((_, i) => 
    `(${Object.keys(batch[0]).map((_, j) => `$${i * Object.keys(batch[0]).length + j + 1}`).join(', ')})`
  ).join(', ');

  // Flatten the batch values for parameterized query
  const values = batch.flatMap(row => Object.values(row));

  const query = `INSERT INTO ${table} (${columns}) VALUES ${placeholders}`;

  try {
    // Execute the query using D1 database
    const result = await env.DB_GORE.prepare(query)
      .bind(...values)
      .run();

    return result.meta.changes || 0;
  } catch (error) {
    console.error('Error inserting into db_gore:', error);
    throw error;
  }
}