# White Client

A secure authentication and API client package for Node.js applications. White Client provides JWT-based authentication with automatic signature generation and validation for secure API communications.

## Features

- 🔐 JWT-based authentication with automatic signature generation
- 🛡️ Request body hashing for integrity verification
- ⚡ Database integration for app management
- 🚀 Easy-to-use client and server initialization
- 📦 CLI tools for client management and migration

## Installation

```bash
npm install @core/white-client
```

## Prerequisites

- Node.js 14+
- PostgreSQL database
- `@core/db` package for database operations

## Quick Start

### 1. Initialize the White Client Server

The server component handles authentication validation for incoming requests.

```typescript
import initServer from '@core/white-client';
import { createPool } from '@core/db';

// Initialize database pool
const databasePool = createPool({
  host: 'localhost',
  port: 5432,
  database: 'your_database',
  user: 'your_user',
  password: 'your_password'
});

// Initialize White Client server
const validateRequest = initServer({
  database: databasePool,
  secretKey: 'your-secret-key',
  maxTimestampDrift: 5000 // 5 seconds
});

// Use in your Express.js middleware
app.use('/api', async (req, res, next) => {
  try {
    const result = await validateRequest({
      path: req.path,
      headers: req.headers,
      method: req.method,
      body: req.body
    });
    
    req.user = result; // Attach validated user data
    next();
  } catch (error) {
    res.status(401).json({ error: error.message, code: error.code });
  }
});
```

### 2. Using White Client Client

The client component generates authenticated requests to White Client protected APIs.

```typescript
import initClient from '@core/white-client/client';

// Initialize the client
const request = initClient({
  appId: 'your-app-id',
  secretKey: 'your-secret-key',
  apiUrl: 'https://api.example.com',
  fetcher: fetch // or your preferred HTTP client
});

// Make authenticated requests
const response = await request('/api/users', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
});

// POST request with body
const createUser = await request('/api/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: {
    name: 'John Doe',
    email: 'john@example.com'
  }
});
```

### 3. Creating and Connecting as White Client

#### Step 1: Database Migration

First, run the database migration to create the necessary tables:

```bash
# Using the CLI tool
npx white-client generateMigration

# Or manually run the migration
# The migration creates:
# - integrated_app table
# - integrated_app_key table
```

#### Step 2: Register a New App

```typescript
import { createModel } from '@core/db';

// Create app record
const appModel = createModel(databasePool, 'integrated_app');
const appKeyModel = createModel(databasePool, 'integrated_app_key');

// Insert new app
const [app] = await appModel().insert({
  name: 'My Application',
  config: {
    description: 'My app description',
    permissions: ['read', 'write']
  }
}).returning('*');

// Generate key pair for the app
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});

// Store the keys
await appKeyModel().insert({
  app_id: app.id,
  private_key: privateKey,
  public_key: publicKey
});

console.log('App created:', {
  appId: app.uuid,
  secretKey: app.secret_key
});
```

#### Step 3: Configure Your Application

```typescript
// In your application configuration
const whiteClientConfig = {
  appId: 'your-app-uuid',
  secretKey: 'your-secret-key',
  apiUrl: 'https://your-api-server.com',
  fetcher: fetch
};

// Initialize the client
const apiClient = initClient(whiteClientConfig);
```

## API Reference

### Server Functions

#### `initServer(props)`

Initializes the White Client server for request validation.

**Parameters:**
- `props.database` - Database pool instance
- `props.secretKey` - Secret key for JWT validation
- `props.maxTimestampDrift` - Maximum allowed timestamp drift in milliseconds

**Returns:** Validation function that can be used as middleware

### Client Functions

#### `initClient(props)`

Initializes the White Client for making authenticated requests.

**Parameters:**
- `props.appId` - Application ID (UUID)
- `props.secretKey` - Secret key for signing requests
- `props.apiUrl` - Base URL of the API server
- `props.fetcher` - HTTP client function (fetch, axios, etc.)

**Returns:** Request function for making authenticated API calls

### CLI Commands

#### Generate Client ID
```bash
npx white-client generate-client-id
```

#### Generate JWT Token
```bash
npx white-client generate file:clients.json secretKey:your-secret algorithm:HS256
```

#### Verify JWT Token
```bash
npx white-client verify token:your-jwt-token secretKey:your-secret algorithm:HS256
```

#### Generate Migration
```bash
npx white-client generateMigration
```

## Database Schema

### `integrated_app` Table
- `id` - Primary key
- `uuid` - Unique identifier for the app
- `name` - Application name
- `secret_key` - MD5 hash of UUID (auto-generated)
- `config` - JSON configuration
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp
- `deleted_at` - Soft delete timestamp

### `integrated_app_key` Table
- `id` - Primary key
- `app_id` - Foreign key to integrated_app
- `private_key` - RSA private key
- `public_key` - RSA public key
- `created_at` - Creation timestamp
- `deleted_at` - Soft delete timestamp

## Security Features

1. **JWT Token Validation**: All requests must include valid JWT tokens
2. **Request Body Hashing**: POST/PUT/PATCH requests include HMAC-SHA256 body hashes
3. **Timestamp Validation**: Tokens expire after 5 seconds by default
4. **Method Validation**: HTTP method must match the token
5. **Path Validation**: Request path must match the token

## Error Codes

- `APP_ID_REQUIRED` - Missing app-id header
- `AUTHORIZATION_REQUIRED` - Missing authorization header
- `INVALID_AUTHORIZATION_TOKEN` - Malformed authorization token
- `APP_NOT_FOUND` - Invalid app ID
- `TOKEN_EXPIRED` - Token has expired
- `METHOD_NOT_MATCH` - HTTP method doesn't match token
- `PATH_NOT_MATCH` - Request path doesn't match token
- `BAD_HASHED_BODY` - Request body hash doesn't match

## Environment Variables

```bash
# Optional environment variables for CLI
WC_SECRET_KEY=your-default-secret-key
WC_ALGORITHM=HS256
```

## Examples

### Express.js Integration

```typescript
import express from 'express';
import initServer from '@core/white-client';

const app = express();
const validateRequest = initServer({
  database: databasePool,
  secretKey: process.env.SECRET_KEY,
  maxTimestampDrift: 5000
});

// Protected route
app.get('/api/protected', async (req, res) => {
  try {
    const user = await validateRequest({
      path: req.path,
      headers: req.headers,
      method: req.method,
      body: req.body
    });
    
    res.json({ message: 'Access granted', user });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});
```

### React/Node.js Client

```typescript
import initClient from '@core/white-client/client';

const apiClient = initClient({
  appId: 'your-app-id',
  secretKey: 'your-secret-key',
  apiUrl: 'https://api.example.com',
  fetcher: fetch
});

// Fetch data
const users = await apiClient('/api/users');

// Create resource
const newUser = await apiClient('/api/users', {
  method: 'POST',
  body: { name: 'John Doe', email: 'john@example.com' }
});
```

## Third-Party Integration Guide

This section explains how external developers can integrate their applications with your White Client server.

### For External Developers

#### 1. Request App Registration

To integrate with our White Client server, external developers need to:

1. **Contact the server administrator** to request app registration
2. **Provide application details**:
   - Application name
   - Description
   - Intended use case
   - API endpoints they plan to access
   - Security requirements

#### 2. Receive Integration Credentials

Once approved, developers will receive:
- **App ID (UUID)**: Unique identifier for their application
- **Secret Key**: For signing requests (MD5 hash)
- **API Base URL**: The White Client server endpoint
- **Integration Documentation**: This guide

#### 3. Install White Client SDK

```bash
npm install @core/white-client
```

#### 4. Initialize the Client

```typescript
import initClient from '@core/white-client/client';

// Initialize with provided credentials
const apiClient = initClient({
  appId: 'your-provided-app-id',
  secretKey: 'your-provided-secret-key',
  apiUrl: 'https://your-white-client-server.com',
  fetcher: fetch // or axios, node-fetch, etc.
});
```

#### 5. Make Authenticated Requests

```typescript
// GET request
const users = await apiClient('/api/users');

// POST request with body
const newUser = await apiClient('/api/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: {
    name: 'John Doe',
    email: 'john@example.com'
  }
});

// PUT request
const updatedUser = await apiClient('/api/users/123', {
  method: 'PUT',
  body: {
    name: 'Jane Doe'
  }
});
```

### Integration Examples

#### Node.js/Express Application

```typescript
// app.js
import express from 'express';
import initClient from '@core/white-client/client';

const app = express();
app.use(express.json());

// Initialize White Client
const apiClient = initClient({
  appId: process.env.WHITE_CLIENT_APP_ID,
  secretKey: process.env.WHITE_CLIENT_SECRET_KEY,
  apiUrl: process.env.WHITE_CLIENT_API_URL,
  fetcher: fetch
});

// Use in your routes
app.get('/sync-users', async (req, res) => {
  try {
    const users = await apiClient('/api/users');
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000);
```

#### React Application

```typescript
// apiService.ts
import initClient from '@core/white-client/client';

const apiClient = initClient({
  appId: process.env.REACT_APP_WHITE_CLIENT_APP_ID,
  secretKey: process.env.REACT_APP_WHITE_CLIENT_SECRET_KEY,
  apiUrl: process.env.REACT_APP_WHITE_CLIENT_API_URL,
  fetcher: fetch
});

export const userService = {
  getUsers: () => apiClient('/api/users'),
  createUser: (userData: any) => apiClient('/api/users', {
    method: 'POST',
    body: userData
  }),
  updateUser: (id: string, userData: any) => apiClient(`/api/users/${id}`, {
    method: 'PUT',
    body: userData
  })
};

// Component usage
import { userService } from './apiService';

const UserList = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    userService.getUsers()
      .then(setUsers)
      .catch(console.error);
  }, []);

  return (
    <div>
      {users.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
};
```

#### Python Application

```python
# white_client.py
import requests
import json
import time
import hashlib
import hmac
import jwt

class WhiteClient:
    def __init__(self, app_id, secret_key, api_url):
        self.app_id = app_id
        self.secret_key = secret_key
        self.api_url = api_url
    
    def _create_signature(self, path, method='GET', body=None):
        timestamp = int(time.time() * 1000)
        
        # Hash the body if provided
        hashed_body = ''
        if body and method.upper() != 'GET':
            hashed_body = hmac.new(
                self.secret_key.encode(),
                json.dumps(body, sort_keys=True).encode(),
                hashlib.sha256
            ).hexdigest()
        
        # Create JWT payload
        payload = {
            'path': path,
            'iat': timestamp,
            'method': method.upper(),
            'body': hashed_body
        }
        
        return jwt.encode(payload, self.secret_key, algorithm='HS256')
    
    def request(self, path, method='GET', body=None, headers=None):
        signature = self._create_signature(path, method, body)
        
        request_headers = {
            'app-id': self.app_id,
            'Authorization': f'Bearer {signature}',
            'Content-Type': 'application/json',
            **(headers or {})
        }
        
        url = f"{self.api_url}{path}"
        
        if method.upper() == 'GET':
            response = requests.get(url, headers=request_headers)
        elif method.upper() == 'POST':
            response = requests.post(url, json=body, headers=request_headers)
        elif method.upper() == 'PUT':
            response = requests.put(url, json=body, headers=request_headers)
        elif method.upper() == 'DELETE':
            response = requests.delete(url, headers=request_headers)
        
        return response.json()

# Usage
client = WhiteClient(
    app_id='your-app-id',
    secret_key='your-secret-key',
    api_url='https://your-white-client-server.com'
)

# Make requests
users = client.request('/api/users')
new_user = client.request('/api/users', 'POST', {'name': 'John Doe'})
```

### Environment Configuration

#### For Node.js Applications

```bash
# .env
WHITE_CLIENT_APP_ID=your-app-id
WHITE_CLIENT_SECRET_KEY=your-secret-key
WHITE_CLIENT_API_URL=https://your-white-client-server.com
```

#### For React Applications

```bash
# .env.local
REACT_APP_WHITE_CLIENT_APP_ID=your-app-id
REACT_APP_WHITE_CLIENT_SECRET_KEY=your-secret-key
REACT_APP_WHITE_CLIENT_API_URL=https://your-white-client-server.com
```

### Best Practices for Integration

#### 1. Error Handling

```typescript
const handleApiCall = async (apiCall: () => Promise<any>) => {
  try {
    return await apiCall();
  } catch (error) {
    switch (error.code) {
      case 'TOKEN_EXPIRED':
        // Retry the request
        return await apiCall();
      case 'APP_NOT_FOUND':
        // Check your app ID configuration
        throw new Error('Invalid app configuration');
      case 'AUTHORIZATION_REQUIRED':
        // Check your secret key
        throw new Error('Invalid authentication');
      default:
        throw error;
    }
  }
};
```

#### 2. Request Retry Logic

```typescript
const retryRequest = async (requestFn: () => Promise<any>, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      if (error.code === 'TOKEN_EXPIRED' && i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        continue;
      }
      throw error;
    }
  }
};
```

#### 3. Security Considerations

- **Never expose your secret key** in client-side code
- **Use environment variables** for all credentials
- **Implement proper error handling** for authentication failures
- **Validate responses** before processing data
- **Use HTTPS** for all API communications

### Support and Documentation

For integration support:

- **Documentation**: This README and API documentation
- **Code Examples**: Available in our GitHub repository
- **Support**: Contact the server administrator for technical support
- **Updates**: Subscribe to notifications for API changes

### API Rate Limits

- **Default**: 1000 requests per hour per app
- **Burst**: Up to 100 requests per minute
- **Headers**: Rate limit information included in response headers

```typescript
// Check rate limits
const response = await apiClient('/api/users');
const rateLimit = {
  limit: response.headers['x-ratelimit-limit'],
  remaining: response.headers['x-ratelimit-remaining'],
  reset: response.headers['x-ratelimit-reset']
};
```

## License

ISC
