# KV Endpoint Deployment Guide

## Issue
The KV endpoint `/api/kv` is returning 500 Internal Server Error because the TASKS_KV binding is not available in the worker environment.

## Root Cause
The worker code is correctly implemented and the wrangler configuration shows proper KV binding, but the deployed worker instance may not have the latest configuration applied.

## Solution
### 1. Deploy the Worker
Run the following command to deploy the GLM worker with the latest KV binding configuration:

```bash
npm run deploy:glm
```

This command uses the wrangler-glm.toml configuration which includes:
- KV namespace binding: TASKS_KV
- KV namespace ID: 7fad284aa9f449d99b40e39b4eb249d9

### 2. Verify Deployment
After deployment, check the Cloudflare Workers dashboard to ensure:
1. The worker is deployed successfully
2. The KV binding is visible in the worker settings
3. The binding name is "TASKS_KV"

### 3. Test the KV Endpoint
Use the test-kv.html page to test the KV operations:
- Write a test key/value pair
- Read the value back
- Check the browser console for detailed logs

## Troubleshooting
If the issue persists after deployment:

### Check KV Namespace
1. Go to Cloudflare Dashboard > Workers & Pages > KV
2. Verify the KV namespace exists
3. Note the exact KV namespace ID
4. Update wrangler-glm.toml if needed

### Check Worker Settings
1. Go to Cloudflare Dashboard > Workers & Pages
2. Select the glm-worker
3. Check Settings > Variables > KV Namespace Bindings
4. Ensure TASKS_KV is properly bound

### Check Logs
The enhanced logging will show:
- Environment availability
- TASKS_KV binding status
- Available methods on TASKS_KV object

## Configuration Files
### wrangler-glm.toml
```toml
[[env.production.kv_namespaces]]
binding = "TASKS_KV"
id = "7fad284aa9f449d99b40e39b4eb249d9"

[[env.development.kv_namespaces]]
binding = "TASKS_KV"
id = "7fad284aa9f449d99b40e39b4eb249d9"
```

### Worker Code
The KV endpoint is implemented in `workers/glm-worker.js` at the `/api/kv` route.

## Expected Behavior
After successful deployment:
- KV endpoint should return 200 OK
- Write operations should store data
- Read operations should retrieve data
- Delete operations should remove data

## Contact
If issues persist, check the Cloudflare Workers documentation or contact support.