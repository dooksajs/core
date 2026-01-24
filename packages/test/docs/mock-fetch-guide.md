# Mock-Fetch User Guide

The `mock-fetch.js` utility provides a comprehensive set of functions for mocking the global `fetch` API in Node.js tests. This allows you to test HTTP request behavior without making actual network calls.

## Overview

The mock-fetch utility provides four main functions:

1. **`createMockFetch`** - General-purpose mock for fetch requests
2. **`createMockFetchWithCache`** - Mock with cache behavior simulation
3. **`createMockFetchError`** - Mock for network error scenarios
4. **`createMockFetchHttpError`** - Mock for HTTP error responses (404, 500, etc.)

## Installation

Import the functions from the test package:

```javascript
import {
  createMockFetch,
  createMockFetchWithCache,
  createMockFetchError,
  createMockFetchHttpError
} from '@dooksa/test'
```

## Basic Usage

All mock functions follow the same pattern:

```javascript
import { describe, it } from 'node:test'
import { createMockFetch } from '@dooksa/test'

describe('My API tests', () => {
  it('should handle API response', async (t) => {
    // Create mock
    const mock = createMockFetch(t, {
      response: { data: 'test' }
    })

    // Use mock.fetch instead of global.fetch
    const response = await mock.fetch('http://api.example.com/data')
    const data = await response.json()

    // Assertions
    console.log(data) // { data: 'test' }

    // Restore original fetch
    mock.restore()
  })
})
```

**Important:** Always call `mock.restore()` after each test to restore the original `global.fetch`.

---

## 1. createMockFetch

The most flexible mock function for testing various fetch scenarios.

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `response` | Object \| Function | `{ data: 'mock-response' }` | Response data or function that returns response |
| `status` | Number | `200` | HTTP status code |
| `ok` | Boolean | `true` | Whether response is OK |
| `error` | Error | `null` | Error to throw (for testing failures) |
| `onRequest` | Function | `null` | Callback called with request details |

### Examples

#### Simple Successful Response

```javascript
const mock = createMockFetch(t, {
  response: { user: { id: 1, name: 'John' } }
})

const response = await mock.fetch('http://api.example.com/users/1')
const data = await response.json()
// data = { user: { id: 1, name: 'John' } }
```

#### Custom Response Per Request

```javascript
const mock = createMockFetch(t, {
  response: (url, options) => ({
    url,
    method: options.method || 'GET',
    timestamp: Date.now()
  })
})

const response = await mock.fetch('http://api.example.com/data', { method: 'POST' })
const data = await response.json()
// data = { url: 'http://api.example.com/data', method: 'POST', timestamp: 1234567890 }
```

#### Error Scenario

```javascript
const mock = createMockFetch(t, {
  error: new Error('Network connection failed')
})

try {
  await mock.fetch('http://api.example.com/data')
} catch (error) {
  console.log(error.message) // 'Network connection failed'
}
```

#### Custom Status Codes

```javascript
// 404 Not Found
const mock = createMockFetch(t, {
  response: { error: 'User not found' },
  status: 404,
  ok: false
})

const response = await mock.fetch('http://api.example.com/users/999')
console.log(response.status) // 404
console.log(response.ok) // false
```

#### Request Tracking

```javascript
const mock = createMockFetch(t, {
  response: { success: true },
  onRequest: (url, options) => {
    console.log('Request to:', url)
    console.log('Options:', options)
  }
})

await mock.fetch('http://api.example.com/data')
await mock.fetch('http://api.example.com/users')

// Get all requests
console.log(mock.requests)
// [
//   { url: 'http://api.example.com/data', options: {}, timestamp: ... },
//   { url: 'http://api.example.com/users', options: {}, timestamp: ... }
// ]

// Get last request
console.log(mock.getLastRequest())
// { url: 'http://api.example.com/users', options: {}, timestamp: ... }

// Filter requests by URL
const apiRequests = mock.getRequestsByURL(/api\.example\.com/)
console.log(apiRequests.length) // 2

// Verify request count
mock.verifyRequestCount(2) // Passes
mock.verifyRequestCount(3) // Throws error

// Clear request history
mock.clearRequests()
console.log(mock.requests.length) // 0
```

#### Malformed JSON Response

```javascript
const mock = createMockFetch(t, {
  response: {
    json: async () => {
      throw new SyntaxError('Unexpected token')
    }
  }
})

const response = await mock.fetch('http://api.example.com/data')
try {
  await response.json()
} catch (error) {
  console.log(error.message) // 'Unexpected token'
}
```

#### Special Response Object

```javascript
const mock = createMockFetch(t, {
  response: {
    ok: true,
    status: 200,
    json: async () => ({ custom: 'data' }),
    text: async () => 'custom text',
    headers: new Headers({ 'content-type': 'application/json' }),
    statusText: 'Custom OK'
  }
})

const response = await mock.fetch('http://api.example.com/data')
console.log(response.statusText) // 'Custom OK'
console.log(await response.json()) // { custom: 'data' }
```

---

## 2. createMockFetchWithCache

Simulates caching behavior for testing API plugin cache functionality.

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `cache` | Map | `new Map()` | Pre-populated cache |
| `onCacheHit` | Function | `null` | Callback when cache is hit |
| `onCacheMiss` | Function | `null` | Callback when cache is missed |

### How It Works

- URLs starting with `/_/` are treated as cacheable
- Cache key is extracted by removing the `/_/` prefix
- Query parameters are included in the cache key
- Cache misses generate mock data automatically

### Examples

#### Basic Cache Hit/Miss

```javascript
const cache = new Map()
cache.set('collection1', { data: 'cached' })

const mock = createMockFetchWithCache(t, { cache })

// First call - cache miss (generates new data)
const response1 = await mock.fetch('/_/collection1')
const data1 = await response1.json()
// data1 = [{ id: 'test-123', collection: 'collection1', item: { name: 'test', value: 42 } }]

// Second call - cache hit (returns cached data)
const response2 = await mock.fetch('/_/collection1')
const data2 = await response2.json()
// data2 = { data: 'cached' }
```

#### Pre-populated Cache

```javascript
const cache = new Map()
cache.set('users', { items: [{ id: 1, name: 'John' }] })
cache.set('posts', { items: [{ id: 1, title: 'Hello' }] })

const mock = createMockFetchWithCache(t, { cache })

const users = await mock.fetch('/_/users').then(r => r.json())
const posts = await mock.fetch('/_/posts').then(r => r.json())

console.log(users) // { items: [{ id: 1, name: 'John' }] }
console.log(posts) // { items: [{ id: 1, title: 'Hello' }] }
```

#### Cache Callbacks

```javascript
const cache = new Map()
cache.set('collection1', { data: 'cached' })

let hitCount = 0
let missCount = 0

const mock = createMockFetchWithCache(t, {
  cache,
  onCacheHit: (key) => {
    hitCount++
    console.log(`Cache hit for: ${key}`)
  },
  onCacheMiss: (key) => {
    missCount++
    console.log(`Cache miss for: ${key}`)
  }
})

await mock.fetch('/_/collection1') // Cache hit
await mock.fetch('/_/collection2') // Cache miss
await mock.fetch('/_/collection1') // Cache hit

console.log(`Hits: ${hitCount}, Misses: ${missCount}`) // Hits: 2, Misses: 1
```

#### Cache Tracking

```javascript
const cache = new Map()
cache.set('collection1', { data: 'cached' })

const mock = createMockFetchWithCache(t, { cache })

await mock.fetch('/_/collection2') // Cache miss
await mock.fetch('/_/collection1') // Cache hit
await mock.fetch('/_/collection3') // Cache miss

console.log(mock.getCacheHitCount()) // 1
console.log(mock.getCacheMissCount()) // 2
console.log(mock.cacheHits) // Array of cache hit details
console.log(mock.cacheMisses) // Array of cache miss details

// Clear tracking data
mock.clearTracking()
console.log(mock.getCacheHitCount()) // 0
console.log(mock.getCacheMissCount()) // 0
```

#### Query Parameters

```javascript
const cache = new Map()
cache.set('collection1', { data: 'cached' })

const mock = createMockFetchWithCache(t, { cache })

// Query params are included in cache key
// This will be a cache miss because 'collection1?param=value' != 'collection1'
const response = await mock.fetch('/_/collection1?param=value')
const data = await response.json()
// data = [{ id: 'test-123', collection: 'collection1', item: { name: 'test', value: 42 } }]
```

---

## 3. createMockFetchError

Simulates network errors for testing error handling.

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `message` | String | `'Network error'` | Error message |
| `error` | Error | `new Error(message)` | Custom error object |

### Examples

#### Basic Network Error

```javascript
const mock = createMockFetchError(t)

try {
  await mock.fetch('http://api.example.com/data')
} catch (error) {
  console.log(error.message) // 'Network error'
}
```

#### Custom Error Message

```javascript
const mock = createMockFetchError(t, {
  message: 'Connection timeout'
})

try {
  await mock.fetch('http://api.example.com/data')
} catch (error) {
  console.log(error.message) // 'Connection timeout'
}
```

#### Custom Error Object

```javascript
const customError = new Error('ECONNREFUSED')
customError.code = 'ECONNREFUSED'
customError.errno = -111

const mock = createMockFetchError(t, {
  error: customError
})

try {
  await mock.fetch('http://api.example.com/data')
} catch (error) {
  console.log(error.message) // 'ECONNREFUSED'
  console.log(error.code) // 'ECONNREFUSED'
  console.log(error.errno) // -111
}
```

---

## 4. createMockFetchHttpError

Simulates HTTP error responses (404, 500, etc.) without network errors.

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `status` | Number | `404` | HTTP status code |
| `statusText` | String | `'Not Found'` | Status text |
| `body` | Object | `{ error: 'Resource not found' }` | Response body |

### Examples

#### Basic HTTP Error

```javascript
const mock = createMockFetchHttpError(t)

const response = await mock.fetch('http://api.example.com/nonexistent')

console.log(response.ok) // false
console.log(response.status) // 404
console.log(response.statusText) // 'Not Found'

const data = await response.json()
console.log(data) // { error: 'Resource not found' }
```

#### Custom Status Code

```javascript
const mock = createMockFetchHttpError(t, {
  status: 500,
  statusText: 'Internal Server Error'
})

const response = await mock.fetch('http://api.example.com/api')

console.log(response.status) // 500
console.log(response.statusText) // 'Internal Server Error'
```

#### Custom Response Body

```javascript
const mock = createMockFetchHttpError(t, {
  status: 401,
  statusText: 'Unauthorized',
  body: {
    error: 'Invalid credentials',
    code: 'AUTH_ERROR',
    details: 'Token expired'
  }
})

const response = await mock.fetch('http://api.example.com/login')
const data = await response.json()

console.log(data)
// {
//   error: 'Invalid credentials',
//   code: 'AUTH_ERROR',
//   details: 'Token expired'
// }
```

---

## Common Patterns

### Pattern 1: Testing API Calls

```javascript
import { describe, it } from 'node:test'
import { strictEqual } from 'node:assert'
import { createMockFetch } from '@dooksa/test'

describe('API Client', () => {
  it('should fetch user data', async (t) => {
    const mock = createMockFetch(t, {
      response: {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com'
      }
    })

    // Replace global.fetch
    global.fetch = mock.fetch

    // Your API client code
    const response = await fetch('http://api.example.com/users/1')
    const user = await response.json()

    strictEqual(user.id, 1)
    strictEqual(user.name, 'John Doe')

    // Restore
    mock.restore()
  })
})
```

### Pattern 2: Testing Error Handling

```javascript
describe('Error Handling', () => {
  it('should handle network errors', async (t) => {
    const mock = createMockFetchError(t, {
      message: 'Network connection failed'
    })

    global.fetch = mock.fetch

    try {
      await fetch('http://api.example.com/data')
      throw new Error('Should have thrown')
    } catch (error) {
      strictEqual(error.message, 'Network connection failed')
    }

    mock.restore()
  })

  it('should handle HTTP errors', async (t) => {
    const mock = createMockFetchHttpError(t, {
      status: 404,
      statusText: 'Not Found'
    })

    global.fetch = mock.fetch

    const response = await fetch('http://api.example.com/nonexistent')
    
    strictEqual(response.ok, false)
    strictEqual(response.status, 404)

    mock.restore()
  })
})
```

### Pattern 3: Testing Cache Behavior

```javascript
describe('Cache Behavior', () => {
  it('should use cache on second request', async (t) => {
    const cache = new Map()
    const mock = createMockFetchWithCache(t, { cache })

    global.fetch = mock.fetch

    // First request - cache miss
    const response1 = await fetch('/_/users')
    const data1 = await response1.json()

    // Second request - cache hit
    const response2 = await fetch('/_/users')
    const data2 = await response2.json()

    // Verify cache hit
    strictEqual(mock.getCacheHitCount(), 1)
    strictEqual(mock.getCacheMissCount(), 1)

    mock.restore()
  })
})
```

### Pattern 4: Request Verification

```javascript
describe('Request Verification', () => {
  it('should make correct number of requests', async (t) => {
    const mock = createMockFetch(t, {
      response: { success: true }
    })

    global.fetch = mock.fetch

    await fetch('http://api.example.com/endpoint1')
    await fetch('http://api.example.com/endpoint2')
    await fetch('http://api.example.com/endpoint1')

    // Verify request count
    mock.verifyRequestCount(3)

    // Get requests by URL
    const endpoint1Requests = mock.getRequestsByURL(/endpoint1/)
    strictEqual(endpoint1Requests.length, 2)

    mock.restore()
  })
})
```

### Pattern 5: Dynamic Responses

```javascript
describe('Dynamic Responses', () => {
  it('should return different data based on URL', async (t) => {
    const mock = createMockFetch(t, {
      response: (url, options) => {
        if (url.includes('/users/1')) {
          return { id: 1, name: 'John' }
        } else if (url.includes('/users/2')) {
          return { id: 2, name: 'Jane' }
        }
        return { error: 'Not found' }
      }
    })

    global.fetch = mock.fetch

    const response1 = await fetch('http://api.example.com/users/1')
    const user1 = await response1.json()
    strictEqual(user1.name, 'John')

    const response2 = await fetch('http://api.example.com/users/2')
    const user2 = await response2.json()
    strictEqual(user2.name, 'Jane')

    mock.restore()
  })
})
```

---

## Best Practices

### 1. Always Restore After Tests

```javascript
// Good
const mock = createMockFetch(t, { response: { data: 'test' } })
try {
  // Your test code
} finally {
  mock.restore() // Always restore, even if test fails
}

// Better - use afterEach hook
afterEach(() => {
  if (mock) {
    mock.restore()
  }
})
```

### 2. Use Descriptive Test Names

```javascript
// Good
it('should handle 404 error for non-existent user', async (t) => {
  // Test implementation
})

// Avoid
it('test 1', async (t) => {
  // Test implementation
})
```

### 3. Test Both Success and Failure Cases

```javascript
describe('API Client', () => {
  it('should successfully fetch data', async (t) => {
    const mock = createMockFetch(t, {
      response: { data: 'success' }
    })
    // Test success case
  })

  it('should handle network errors', async (t) => {
    const mock = createMockFetchError(t, {
      message: 'Network failure'
    })
    // Test error case
  })

  it('should handle HTTP errors', async (t) => {
    const mock = createMockFetchHttpError(t, {
      status: 500
    })
    // Test HTTP error case
  })
})
```

### 4. Use Request Tracking for Verification

```javascript
const mock = createMockFetch(t, {
  response: { success: true },
  onRequest: (url, options) => {
    // Log requests for debugging
    console.log(`Request: ${url}`, options)
  }
})

// Make requests
await mock.fetch('http://api.example.com/endpoint1')
await mock.fetch('http://api.example.com/endpoint2')

// Verify
mock.verifyRequestCount(2)
const endpoint1Requests = mock.getRequestsByURL(/endpoint1/)
strictEqual(endpoint1Requests.length, 1)
```

### 5. Combine with Test Hooks

```javascript
import { describe, it, beforeEach, afterEach } from 'node:test'

describe('API Tests', () => {
  let mock
  let originalFetch

  beforeEach((t) => {
    originalFetch = global.fetch
    mock = createMockFetch(t, {
      response: { data: 'test' }
    })
    global.fetch = mock.fetch
  })

  afterEach(() => {
    if (mock) {
      mock.restore()
    }
    if (originalFetch) {
      global.fetch = originalFetch
    }
  })

  it('test 1', async () => {
    // Uses mock.fetch
    const response = await fetch('http://api.example.com/data')
    // Test assertions
  })

  it('test 2', async () => {
    // Uses mock.fetch
    const response = await fetch('http://api.example.com/data')
    // Test assertions
  })
})
```

---

## Troubleshooting

### Issue: Tests not using mock

**Problem:** Tests are making real network calls.

**Solution:** Ensure you're using `mock.fetch` and not `global.fetch` directly:

```javascript
// Wrong
const response = await global.fetch('http://api.example.com/data')

// Correct
const response = await mock.fetch('http://api.example.com/data')

// Or replace global.fetch
global.fetch = mock.fetch
const response = await fetch('http://api.example.com/data')
```

### Issue: Tests failing after restore

**Problem:** Tests fail after calling `mock.restore()`.

**Solution:** Make sure to restore only once and at the right time:

```javascript
// Wrong - restoring too early
mock.restore()
await mock.fetch('http://api.example.com/data') // Error!

// Correct - restore after all fetch calls
await mock.fetch('http://api.example.com/data')
await mock.fetch('http://api.example.com/users')
mock.restore()
```

### Issue: Cache not working as expected

**Problem:** Cache hits/misses not behaving correctly.

**Solution:** Remember that cache keys include the full URL after `/_/`:

```javascript
const cache = new Map()
cache.set('users', { data: 'cached' })

const mock = createMockFetchWithCache(t, { cache })

// This will be a cache HIT
await mock.fetch('/_/users')

// This will be a cache MISS (different key)
await mock.fetch('/_/users?page=1')

// This will be a cache MISS (different key)
await mock.fetch('/_/user') // Note: singular vs plural
```

### Issue: Request tracking not working

**Problem:** `mock.requests` is empty or doesn't contain expected data.

**Solution:** Ensure you're using the mock's fetch method:

```javascript
const mock = createMockFetch(t, { response: { data: 'test' } })

// Wrong - using global.fetch directly
await global.fetch('http://api.example.com/data')
console.log(mock.requests.length) // 0

// Correct - using mock.fetch
await mock.fetch('http://api.example.com/data')
console.log(mock.requests.length) // 1
```

---

## API Reference

### createMockFetch(t, options)

**Returns:** Object with the following properties:

- `fetch` - Mock fetch function
- `requests` - Getter that returns array of all requests
- `getLastRequest()` - Returns the last request or `undefined`
- `getRequestsByURL(pattern)` - Returns requests matching URL pattern
- `clearRequests()` - Clears request history
- `verifyRequestCount(count)` - Throws error if request count doesn't match
- `restore()` - Restores original `global.fetch`

### createMockFetchWithCache(t, options)

**Returns:** Object with the following properties:

- `fetch` - Mock fetch function
- `cache` - The cache Map
- `cacheHits` - Array of cache hit details
- `cacheMisses` - Array of cache miss details
- `getCacheHitCount()` - Returns number of cache hits
- `getCacheMissCount()` - Returns number of cache misses
- `clearTracking()` - Clears tracking data
- `restore()` - Restores original `global.fetch`

### createMockFetchError(t, options)

**Returns:** Object with the following properties:

- `fetch` - Mock fetch function that throws error
- `restore()` - Restores original `global.fetch`

### createMockFetchHttpError(t, options)

**Returns:** Object with the following properties:

- `fetch` - Mock fetch function that returns HTTP error response
- `restore()` - Restores original `global.fetch`

---

## Summary

The mock-fetch utility provides comprehensive mocking capabilities for testing HTTP requests in Node.js:

- **`createMockFetch`** - General-purpose mock with request tracking and callbacks
- **`createMockFetchWithCache`** - Cache behavior simulation
- **`createMockFetchError`** - Network error simulation
- **`createMockFetchHttpError`** - HTTP error response simulation

All functions follow the same pattern: create mock, use `mock.fetch`, and call `mock.restore()` when done.

For more examples, see the test file: `packages/test/test/mock-fetch.test.js`
