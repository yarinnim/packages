# Ajax Package

A powerful and flexible HTTP client built on top of the Fetch API, providing a simple interface for making HTTP requests with built-in authentication, error handling, and request/response processing.

## Features

- Automatic authentication header injection
- Built-in error handling and response parsing
- Support for URL parameters and query strings
- Form data handling
- Configurable request options
- Type-safe request/response handling
- Automatic content-type handling
- Device ID and language header injection

## Installation

Add the package to your `package.json`:

```json
{
  "dependencies": {
    "@core/ajax": "^1.0.0"
  }
}
```

Add the package reference to your `tsconfig.json`:

```json
{
  "references": [
    {"path": "../../packages/ajax"}
  ]
}
```

## Usage

### Basic Requests

```typescript
import ajax from '@core/ajax';

// Simple GET request
ajax('/api/users')
  .then(data => {
    console.log(data);
  })
  .catch(error => {
    console.error(error);
  });

// POST request with JSON body
ajax('/api/users', {
  method: 'post',
  body: {
    name: 'John Doe',
    email: 'john@example.com'
  }
}).then(response => {
  console.log(response);
});
```

### URL Parameters and Query Strings

```typescript
// Using URL parameters
ajax('/api/users/:id', {
  params: {
    id: 123
  }
});

// Using query strings
ajax('/api/search', {
  query: {
    q: 'search term',
    page: 1,
    limit: 10
  }
});

// Combining both
ajax('/api/users/:id/posts', {
  params: {
    id: 123
  },
  query: {
    page: 1,
    limit: 20
  }
});
```

### Form Data

```typescript
// File upload
const formData = new FormData();
formData.append('file', fileInput.files[0]);

ajax('/api/upload', {
  method: 'post',
  body: formData
});

// Regular form submission
const formData = new FormData();
formData.append('username', 'john');
formData.append('password', 'secret');

ajax('/api/login', {
  method: 'post',
  body: formData
});
```

### Custom Headers and Options

```typescript
// Adding custom headers
ajax('/api/protected', {
  headers: {
    'Custom-Header': 'value'
  }
});

// Using different request modes
ajax('/api/cors', {
  mode: 'cors',
  credentials: 'include'
});

// Cache control
ajax('/api/data', {
  cache: 'no-cache'
});
```

### Error Handling

```typescript
ajax('/api/error')
  .catch(error => {
    // error will be automatically parsed if it's JSON
    console.error(error.code);    // HTTP status code
    console.error(error.message); // Error message
  });
```

## API Reference

### `ajax(url: string, props?: object)`

Makes an HTTP request to the specified URL with optional configuration.

#### Parameters

- `url`: The URL to send the request to
- `props`: Optional request configuration object
  - `method`: HTTP method (default: 'get')
  - `body`: Request body (object or FormData)
  - `headers`: Custom headers
  - `params`: URL parameters
  - `query`: Query string parameters
  - `mode`: Request mode ('cors', 'no-cors', 'same-origin')
  - `cache`: Cache mode ('default', 'no-cache', 'reload', 'force-cache', 'only-if-cache')
  - `credentials`: Credentials mode ('same-origin', 'include', 'omit')
  - `redirect`: Redirect mode ('follow', 'manual', 'error')

### Available Constants

```typescript
import { mode, cache, credential, redirect, contentType } from '@core/ajax';

// Request modes
mode.cors      // 'cors'
mode.noCors    // 'no-cors'
mode.sameOrigin // 'same-origin'

// Cache modes
cache.default     // 'default'
cache.noCache     // 'no-cache'
cache.reload      // 'reload'
cache.forceCache  // 'force-cache'
cache.onlyIfCache // 'only-if-cache'

// Credential modes
credential.sameOrigin // 'same-origin'
credential.include    // 'include'
credential.omit       // 'omit'

// Redirect modes
redirect.follow  // 'follow'
redirect.manual  // 'manual'
redirect.error   // 'error'

// Content types
contentType.JSON        // 'application/json;charset=UTF-8'
contentType.URL_ENCODED // 'application/x-www-form-urlencoded'
```

## Automatic Features

### Authentication
The package automatically injects the Authorization header using the access token from your identity system.

### Headers
The following headers are automatically added to all requests:
- `Authorization`: Bearer token (if available)
- `Accept`: application/json
- `device-id`: Device identifier
- `Language`: User language preference
- `Content-Type`: application/json (for non-form requests)

### Response Handling
- JSON responses are automatically parsed
- Non-JSON responses are returned as text
- HTTP errors (status >= 300) are automatically caught and parsed

## License

MIT
