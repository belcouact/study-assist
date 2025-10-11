# WS Feedback Worker

This is a dedicated Cloudflare Worker for handling feedback submissions for the WS (Workstation) application.

## Features

- Stores feedback data in a dedicated KV namespace (`kv-ws-feedback`)
- Supports CRUD operations (Create, Read, Update, Delete) for feedback entries
- Tracks feedback status (pending, completed)
- Handles device information collection
- Provides REST API endpoints for feedback management

## API Endpoints

### POST /api/feedback
Submit a new feedback entry.

**Request Body:**
```json
{
  "feedbackType": "bug|suggestion|other",
  "subject": "Feedback subject",
  "userName": "User name",
  "userEmail": "user@example.com",
  "message": "Detailed feedback message",
  "deviceInfo": {
    "userAgent": "Browser user agent string",
    "screenSize": "Screen resolution",
    "viewport": "Viewport dimensions"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Feedback submitted successfully",
  "data": {
    "id": "unique-feedback-id",
    "feedbackType": "bug",
    "subject": "Feedback subject",
    "userName": "User name",
    "userEmail": "user@example.com",
    "message": "Detailed feedback message",
    "deviceInfo": {
      "userAgent": "Browser user agent string",
      "screenSize": "Screen resolution",
      "viewport": "Viewport dimensions"
    },
    "status": "pending",
    "submitTime": "2023-07-20T12:00:00.000Z"
  }
}
```

### GET /api/feedback
Get all feedback entries.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "unique-feedback-id",
      "feedbackType": "bug",
      "subject": "Feedback subject",
      "userName": "User name",
      "userEmail": "user@example.com",
      "message": "Detailed feedback message",
      "deviceInfo": {
        "userAgent": "Browser user agent string",
        "screenSize": "Screen resolution",
        "viewport": "Viewport dimensions"
      },
      "status": "pending",
      "submitTime": "2023-07-20T12:00:00.000Z"
    },
    // More feedback entries...
  ]
}
```

### GET /api/feedback/{id}
Get a specific feedback entry by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "unique-feedback-id",
    "feedbackType": "bug",
    "subject": "Feedback subject",
    "userName": "User name",
    "userEmail": "user@example.com",
    "message": "Detailed feedback message",
    "deviceInfo": {
      "userAgent": "Browser user agent string",
      "screenSize": "Screen resolution",
      "viewport": "Viewport dimensions"
    },
    "status": "pending",
    "submitTime": "2023-07-20T12:00:00.000Z"
  }
}
```

### PUT /api/feedback/{id}
Update a feedback entry (typically to change status).

**Request Body:**
```json
{
  "status": "completed"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Feedback updated successfully",
  "data": {
    "id": "unique-feedback-id",
    "feedbackType": "bug",
    "subject": "Feedback subject",
    "userName": "User name",
    "userEmail": "user@example.com",
    "message": "Detailed feedback message",
    "deviceInfo": {
      "userAgent": "Browser user agent string",
      "screenSize": "Screen resolution",
      "viewport": "Viewport dimensions"
    },
    "status": "completed",
    "submitTime": "2023-07-20T12:00:00.000Z",
    "updateTime": "2023-07-20T13:00:00.000Z"
  }
}
```

### DELETE /api/feedback/{id}
Delete a feedback entry.

**Response:**
```json
{
  "success": true,
  "message": "Feedback deleted successfully"
}
```

## Deployment

1. Install Wrangler CLI:
   ```
   npm install -g wrangler
   ```

2. Login to Cloudflare:
   ```
   wrangler login
   ```

3. Deploy the worker:
   ```
   wrangler deploy --config wrangler-ws-feedback.toml
   ```

## Configuration

The worker is configured to use the following settings:

- **KV Namespace**: `kv-ws-feedback` (ID: 6ccff624a0bb47fa9fa025974fbbe435)
- **Domain**: ws-feedback.study-llm.me
- **Route Pattern**: ws-feedback.study-llm.me/api/*

## Files

- `workers/ws-feedback-worker.js`: The Cloudflare Worker script
- `wrangler-ws-feedback.toml`: Configuration file for deployment
- `ws/feedback.html`: Feedback submission form
- `ws/feedback-admin.html`: Admin interface for managing feedback

## Usage

1. Users can submit feedback through the feedback form at `ws/feedback.html`.
2. Administrators can view and manage feedback through the admin interface at `ws/feedback-admin.html`.
3. The feedback data is stored in the KV namespace and can be accessed through the API endpoints.