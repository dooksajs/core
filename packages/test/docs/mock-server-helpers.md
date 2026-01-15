# Mock Server Helpers Documentation

## Overview

The mock server helpers provide utilities for creating mock Express request/response objects and invoking registered routes during testing. These helpers are automatically available through the `mockPlugin` function but can also be used independently.

## Import

```javascript
import { 
  createRequest, 
  createResponse, 
  invokeRoute 
} from '@dooksa/test/src/plugins/mock-server-helpers.js'
```

## API Reference

### `createRequest(overrides)`

Creates a mock Express request object with sensible defaults that can be overridden.

#### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `overrides` | `Object` | No | `{}` | Properties to override on the request |

#### Returns

`Object` - Mock Express request object

#### Default Properties

```javascript
{
  method: 'GET',
  path: '/',
  params: {},
  query: {},
  body: {},
  cookies: {},
  signedCookies: {},
  headers: {},
  userId: null
}
```

#### Usage Examples

```javascript
// Basic request
const request = createRequest()

// Override specific properties
const postRequest = createRequest({
  method: 'POST',
  path: '/_/api/users',
  body: { name: 'John', email: 'john@example.com' },
  headers: { 'content-type': 'application/json' }
})

// With URL parameters
const paramRequest = createRequest({
  method: 'GET',
  path: '/_/users/123',
  params: { id: '123' }
})

// With query parameters
const queryRequest = createRequest({
  method: 'GET',
  path: '/_/users',
  query: { page: 1, limit: 10 }
})

// Authenticated request
const authRequest = createRequest({
  method: 'GET',
  path: '/_/profile',
  userId: 'user-123',
  headers: { 'authorization': 'Bearer token' }
})
```

### `createResponse()`

Creates a mock Express response object with tracking capabilities and standard Express methods.

#### Returns

`Object` - Mock Express response object with the following properties and methods:

**Properties:**
- `statusCode` (number): HTTP status code (default: 200)
- `headers` (Object): Response headers
- `body` (*): Response body content
- `cookies` (Object): Set cookies

**Methods:**
- `status(code)` - Set HTTP status code
- `send(data)` - Send response body
- `json(data)` - Send JSON response
- `html(data)` - Send HTML response
- `set(key, value)` - Set response headers
- `cookie(name, value, options)` - Set cookies

#### Usage Examples

```javascript
// Basic response
const response = createResponse()

// JSON response
response.status(200).json({ success: true, data: { id: 1 } })

// HTML response
response.status(200).html('<h1>Hello World</h1>')

// With headers
response
  .status(201)
  .set('Content-Type', 'application/json')
  .set('X-Custom-Header', 'value')
  .json({ created: true })

// With cookies
response
  .status(200)
  .cookie('session', 'abc123', { httpOnly: true, maxAge: 3600 })
  .json({ loggedIn: true })

// Chaining methods
const res = createResponse()
  .status(200)
  .set('Cache-Control', 'no-cache')
  .json({ data: 'value' })

// Access response state
console.log(res.statusCode)  // 200
console.log(res.body)        // { data: 'value' }
console.log(res.headers)     // { 'Cache-Control': 'no-cache' }
```

### `invokeRoute(app, path, request, response)`

Invokes a registered route handler with the provided request and response objects. This function handles middleware chains and route parameter matching.

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `app` | `Object` | Yes | Mock Express app with registered routes |
| `path` | `string` | Yes | Route path to invoke (must match registered route) |
| `request` | `Object` | Yes | Mock request object |
| `response` | `Object` | Yes | Mock response object |

#### Returns

`Promise<Object>` - The response object after handler execution

#### Usage Examples

```javascript
// Basic route invocation
const mock = await mockPlugin(t, { name: 'server', platform: 'server' })
mock.server.setup.server()

const request = createRequest({
  method: 'GET',
  path: '/_/component'
})
const response = createResponse()

await invokeRoute(mock.app, '/_/component', request, response)

// With middleware
const mock = await mockPlugin(t, {
  name: 'server',
  platform: 'server',
  serverModules: ['server', 'middleware']
})

mock.server.setup.server()

// Register middleware
mock.server.method.middlewareSet({
  name: 'auth',
  handler: (req, res, next) => {
    req.userId = 'user-123'
    next()
  }
})

const request = createRequest({
  method: 'GET',
  path: '/_/profile'
})
const response = createResponse()

await invokeRoute(mock.app, '/_/profile', request, response)

// Check response
console.log(response.statusCode)  // 200
console.log(response.body)        // Profile data
```

## Integration with mockPlugin

These helpers are automatically available through the `mockPlugin` return object:

```javascript
const mock = await mockPlugin(t, { name: 'server', platform: 'server' })

// Access helpers from mock object
const request = mock.createRequest({ method: 'POST', body: { data: 'value' } })
const response = mock.createResponse()

await mock.invokeRoute('/_/api/endpoint', request, response)
```

## Complete Testing Example

```javascript
import { test, describe } from 'node:test'
import { mockPlugin } from '@dooksa/test'
import { deepStrictEqual, ok } from 'node:assert'

describe('HTTP Route Testing', () => {
  test('should handle GET request with middleware', async (t) => {
    // Setup mock environment
    const mock = await mockPlugin(t, {
      name: 'component',
      platform: 'server',
      serverModules: ['server', 'database', 'page', 'middleware']
    })

    // Setup HTTP server
    mock.server.setup.server()

    // Register authentication middleware
    mock.server.method.middlewareSet({
      name: 'user/auth',
      handler: (req, res, next) => {
        // Simulate auth check
        if (req.headers.authorization) {
          req.userId = 'authenticated-user'
          next()
        } else {
          res.status(401).json({ error: 'Unauthorized' })
        }
      }
    })

    // Setup component
    mock.server.setup.component()
    await mock.server.method.serverStart()

    // Create authenticated request
    const request = mock.createRequest({
      method: 'GET',
      path: '/_/component',
      query: { pageId: 'page-1' },
      headers: { authorization: 'Bearer token' }
    })
    const response = mock.createResponse()

    // Invoke the route
    await mock.invokeRoute('/_/component', request, response)

    // Assertions
    deepStrictEqual(response.statusCode, 200)
    deepStrictEqual(response.headers['Content-Type'], 'application/json')
    ok(Array.isArray(response.body))
    ok(mock.app.get.mock.callCount() > 0)

    mock.restore()
  })

  test('should handle POST request with body', async (t) => {
    const mock = await mockPlugin(t, {
      name: 'database',
      platform: 'server',
      serverModules: ['server', 'database']
    })

    mock.server.setup.server()
    mock.server.setup.database()
    await mock.server.method.serverStart()

    const request = mock.createRequest({
      method: 'POST',
      path: '/_/database',
      body: {
        collection: 'users',
        item: { name: 'John', email: 'john@example.com' }
      },
      headers: { 'content-type': 'application/json' }
    })
    const response = mock.createResponse()

    await mock.invokeRoute('/_/database', request, response)

    deepStrictEqual(response.statusCode, 201)
    ok(response.body.id)  // Should return created item with ID

    mock.restore()
  })
})
```

## Best Practices

### 1. Always Use Helpers for Consistency

```javascript
// ✅ Good
const request = mock.createRequest({ method: 'GET', path: '/_/test' })
const response = mock.createResponse()

// ❌ Avoid manual creation
const request = { method: 'GET', path: '/_/test', ... }  // Missing defaults
```

### 2. Override Only What You Need

```javascript
// ✅ Good - minimal overrides
const request = mock.createRequest({
  method: 'POST',
  body: { data: 'value' }
})

// ❌ Avoid - recreating entire object
const request = {
  method: 'POST',
  path: '/_/test',
  params: {},
  query: {},
  body: { data: 'value' },
  cookies: {},
  signedCookies: {},
  headers: {},
  userId: null
}
```

### 3. Check Response State

```javascript
const response = mock.createResponse()

await mock.invokeRoute('/_/endpoint', request, response)

// Verify all aspects
deepStrictEqual(response.statusCode, 200)
deepStrictEqual(response.headers['Content-Type'], 'application/json')
ok(Array.isArray(response.body))
ok(!response.body.isEmpty)
```

### 4. Handle Middleware Chains

```javascript
// Register middleware in order
mock.server.method.middlewareSet({
  name: 'logger',
  handler: (req, res, next) => {
    console.log(req.method, req.path)
    next()
  }
})

mock.server.method.middlewareSet({
  name: 'auth',
  handler: (req, res, next) => {
    if (req.headers.authorization) {
      req.userId = 'user-123'
      next()
    } else {
      res.status(401).json({ error: 'Unauthorized' })
    }
  }
})

// invokeRoute will execute them in sequence
```

### 5. Test Error Scenarios

```javascript
// Test 404
const notFoundRequest = mock.createRequest({
  method: 'GET',
  path: '/_/nonexistent'
})
const notFoundResponse = mock.createResponse()

await mock.invokeRoute('/_/nonexistent', notFoundRequest, notFoundResponse)
deepStrictEqual(notFoundResponse.statusCode, 404)

// Test 401
const unauthorizedRequest = mock.createRequest({
  method: 'GET',
  path: '/_/protected',
  headers: {}  // No auth header
})
const unauthorizedResponse = mock.createResponse()

await mock.invokeRoute('/_/protected', unauthorizedRequest, unauthorizedResponse)
deepStrictEqual(unauthorizedResponse.statusCode, 401)
```

## Troubleshooting

### Route Not Found Error

**Problem**: `Error: Route not found: /_/endpoint`

**Solutions**:
1. Ensure HTTP plugin is setup: `mock.server.setup.server()`
2. Verify routes are registered before invoking
3. Check path matches exactly (including `/_/` prefix)
4. Call `await mock.server.method.serverStart()` if needed

### Middleware Not Executing

**Problem**: Middleware handlers not being called

**Solutions**:
1. Register middleware before invoking routes
2. Ensure middleware calls `next()` to continue the chain
3. Verify middleware name matches what's expected

### Response Not Updated

**Problem**: Response object remains unchanged after invokeRoute

**Solutions**:
1. Ensure handlers are actually calling response methods
2. Check that handlers are async and awaited properly
3. Verify route path matches exactly

## See Also

- [Mock Plugin](./mock-plugin.md)
- [Mock Express Module](./mock-express-module.md)
