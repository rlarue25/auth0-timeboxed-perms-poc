# Express API

A basic Express.js REST API with Auth0 authentication middleware.

## Installation

```bash
npm install
```

## Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Update the `.env` file with your Auth0 credentials:
```
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_AUDIENCE=https://your-api-identifier
PORT=3000
```

### Getting Auth0 Credentials

1. Sign up at [Auth0](https://auth0.com)
2. Create a new API in your Auth0 dashboard
3. Use the **Domain** and **Identifier** (audience) from your API settings

## Running the Server

```bash
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### Public Endpoints (No Authentication Required)

#### GET /
- Returns a welcome message
- Response: `{ "message": "Welcome to the Express API!" }`

#### GET /api/public
- Public endpoint accessible without authentication
- Response: `{ "message": "...", "timestamp": "..." }`

### Protected Endpoints (Authentication Required)

All protected endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

#### GET /api/protected
- Protected endpoint requiring valid JWT
- Response: `{ "message": "...", "user": {...}, "timestamp": "..." }`

#### GET /api/profile
- Returns authenticated user profile information
- Response: `{ "message": "...", "userId": "...", "permissions": [], "scope": "..." }`

## Testing with curl

### Public Endpoint
```bash
curl http://localhost:3000/api/public
```

### Protected Endpoint (requires token)
```bash
curl http://localhost:3000/api/protected \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get User Profile (requires token)
```bash
curl http://localhost:3000/api/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Getting a Test Token

1. Go to your Auth0 Dashboard
2. Navigate to your API settings
3. Go to the "Test" tab
4. Copy the test token provided
5. Use it in the Authorization header as shown above

## Error Responses

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Invalid or missing token"
}
```
