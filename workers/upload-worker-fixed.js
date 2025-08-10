/**
 * 修复版Cloudflare Worker - 解决CORS和连接问题
 * 部署地址：https://lab-upload.study-llm.me/upload
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Cache-Control, Origin',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Allow-Credentials': 'true'
};

function createCorsResponse(body, status = 200, additionalHeaders = {}) {
  return new Response(body, {
    status,
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      ...additionalHeaders
    }
  });
}

function createErrorResponse(message, status = 400) {
  return createCorsResponse(
    JSON.stringify({ success: false, error: message }),
    status
  );
}

// 处理OPTIONS预检请求
function handleOptions() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS
  });
}

// 解析multipart/form-data
async function parseMultipartFormData(request) {
  try {
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('multipart/form-data')) {
      return null;
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const database = formData.get('database');
    const batchSize = parseInt(formData.get('batchSize') || '1000', 10);

    if (!file) {
      throw new Error('No file provided');
    }

    const text = await file.text();
    const data = JSON.parse(text);

    return {
      data,
      database: database || 'DB',
      batchSize,
      filename: file.name
    };
  } catch (error) {
    console.error('Error parsing multipart form data:', error);
    return null;
  }
}

// 解析JSON数据 - 简化版本
async function parseJsonData(request) {
  try {
    const body = await request.json();
    
    // 直接获取数据，简化逻辑
    const data = body.data || body;
    const database = body.database || 'DB';
    const batchSize = body.batchSize || 1000;
    const filename = body.filename || 'uploaded_data.json';
    
    return {
      data: Array.isArray(data) ? data : [data],
      database: database,
      batchSize: batchSize,
      filename: filename
    };
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return null;
  }
}

// 模拟数据库存储
async function storeInDatabase(data, database, batchSize) {
  console.log('Storing data:', {
    dataLength: Array.isArray(data) ? data.length : 'Not array',
    database,
    batchSize,
    dataType: typeof data
  });

  if (!Array.isArray(data)) {
    throw new Error('Data must be an array');
  }

  const totalRecords = data.length;
  const totalBatches = Math.ceil(totalRecords / batchSize);
  
  // 模拟处理延迟
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // 验证数据格式 - 更宽松的验证
  const invalidRecords = data.filter(record => 
    record === null || record === undefined
  );
  
  if (invalidRecords.length > 0) {
    console.warn(`Found ${invalidRecords.length} invalid records`);
  }

  // 模拟存储到不同数据库
  const dbInfo = {
    database,
    recordsStored: totalRecords,
    batchesProcessed: totalBatches,
    storageLocation: `cloudflare-kv-${database.toLowerCase()}`,
    timestamp: new Date().toISOString(),
    invalidRecords: invalidRecords.length
  };

  return dbInfo;
}

// 主处理函数
async function handleUpload(request) {
  try {
    console.log('Worker received request:', {
      method: request.method,
      url: request.url,
      headers: Object.fromEntries(request.headers.entries())
    });

    if (request.method === 'OPTIONS') {
      console.log('Handling OPTIONS preflight');
      return handleOptions();
    }

    // 支持GET方法用于健康检查
    if (request.method === 'GET') {
      console.log('Handling GET request');
      return createCorsResponse(JSON.stringify({
        success: true,
        message: 'Upload endpoint is ready',
        method: 'GET',
        supported_methods: ['POST', 'OPTIONS'],
        timestamp: new Date().toISOString()
      }));
    }

    if (request.method !== 'POST') {
      console.log(`Method ${request.method} not allowed`);
      return createErrorResponse('Method not allowed', 405);
    }

    let uploadData;
    
    // 尝试解析不同格式的数据
    uploadData = await parseMultipartFormData(request);
    if (!uploadData) {
      uploadData = await parseJsonData(request);
    }
    
    if (!uploadData) {
      return createErrorResponse('Invalid request format. Expected multipart/form-data or application/json');
    }

    const { data, database, batchSize, filename } = uploadData;

    // 验证必需字段
    if (!data) {
      return createErrorResponse('No data provided');
    }

    if (!Array.isArray(data)) {
      return createErrorResponse('Data must be an array');
    }

    if (data.length === 0) {
      return createErrorResponse('Empty data array provided');
    }

    // 存储数据
    const dbInfo = await storeInDatabase(data, database, batchSize);

    // 返回成功响应
    return createCorsResponse(JSON.stringify({
      success: true,
      message: `Successfully uploaded ${data.length} records to ${database}`,
      details: {
        filename,
        recordsProcessed: data.length,
        batches: Math.ceil(data.length / batchSize),
        database: dbInfo,
        processingTime: Date.now()
      }
    }));

  } catch (error) {
    console.error('Upload error:', error);
    return createErrorResponse(error.message || 'Internal server error', 500);
  }
}

// Worker入口点
addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // 支持带查询参数的路径
  const pathname = url.pathname;
  
  if (pathname === '/upload' || pathname.startsWith('/upload')) {
    event.respondWith(handleUpload(event.request));
  } else if (pathname === '/' || pathname === '') {
    // 根路径健康检查
    event.respondWith(createCorsResponse(JSON.stringify({
      success: true,
      message: 'Cloudflare Worker is running',
      endpoints: {
        upload: 'POST /upload',
        cors: 'OPTIONS /upload'
      },
      timestamp: new Date().toISOString()
    })));
  } else {
    event.respondWith(createErrorResponse('Not found', 404));
  }
});