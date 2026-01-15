# Mock Express Module Documentation

## Overview

The mock Express module provides a complete mock implementation of the Express.js framework for testing Dooksa server plugins. It replaces the real `express()` function with a mock that tracks route registrations and provides testable HTTP functionality.

## Import

```javascript
import { createMockExpressModule } from '@dooksa/test/src/plugins/mock-express-module.js'
```

## API Reference

### `createMockExpressModule(context, mock)`

Creates a mock Express module that can be used to replace the real Express module during testing.

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `context` | `TestContext` | Yes | Node.js TestContext for creating mocks |
| `mock` | `Object` | Yes | Object to store the mock app reference |

#### Returns

`Mock<Function> & { json: Function, urlencoded: Function, static: Function, Router: Function }`

A mocked express function with all standard Express properties and methods.

## Mock Express App Structure

When you call the mocked `express()` function, it returns an app object with the following properties:

### HTTP Method Handlers

```javascript
const app = express()

// All methods are mocks that track registrations
app.get(path, ...handlers)
app.post(path, ...handlers)
app.put(path, ...handlers)
app.delete(path, ...handlers)
```

### Middleware Registration

```javascript
app.use(handler)           // Global middleware
app.use(path, handler)     // Path-specific middleware
```

### Server Lifecycle

```javascript
const server = app.listen(port, callback)  // Start server
server.close(callback)                     // Stop server
server.on(event, handler)                  // Event handling
```

### Getters

```javascript
const routes = app.routes      // Array of registered routes
const middleware = app.middleware  // Array of registered middleware
```

## Mock Express App Properties

### `app.get` (Mock Function)

Tracks GET route registrations.

**Calls structure:**
```javascript
app.get.mock.calls[0]  // First call
app.get.mock.calls[0].arguments  // [path, ...handlers]
```

### `app.post` (Mock Function)

Tracks POST route registrations.

### `app.put` (Mock Function)

Tracks PUT route registrations.

### `app.delete` (Mock Function)

Tracks DELETE route registrations.

### `app.use` (Mock Function)

Tracks middleware registrations.

### `app.listen` (Mock Function)

Mock server listen method that:
- Returns a mock server object
- Calls the callback asynchronously
- Provides `close()` and `on()` methods

### `app.routes` (Getter)

Returns an array of all registered routes:

```javascript
[
  {
    method: 'get',
    path: '/_/component',
    handlers: [Function, Function]
  },
  {
    method: 'post',
    path: '/_/database',
    handlers: [Function]
  }
]
```

### `app.middleware` (Getter)

Returns an array of all registered middleware:

```javascript
[
  Function,  // Global middleware
  { path: '/_/api', handler: Function }  // Path-specific middleware
]
```

## Express Module Properties

The mock Express module also includes standard Express utilities:

### `express.json()`

Returns a middleware function that parses JSON bodies.

```javascript
const middleware = express.json()
// Returns: (req, res, next) => next()
```

### `express.urlencoded(options)`

Returns a middleware function that parses URL-encoded bodies.

```javascript
const middleware = express.urlencoded({ extended: true })
// Returns: (req, res, next) => next()
```

### `express.static(path, options)`

Returns a middleware function for serving static files.

```javascript
const middleware = express.static('public')
// Returns: (req, res, next) => next()
```

### `express.Router()`

Creates a mock Express Router.

```javascript
const router = express.Router()

router.get('/users', handler)
router.post('/users', handler)

// Access router routes
const routes = router._getRoutes()
const middleware = router._getMiddleware()
```

## Usage with mockPlugin

The mock Express module is automatically used by `mockPlugin` when server modules are included:

```javascript
const mock = await mockPlugin(t, {
  name: 'server',
  platform: 'server',
  serverModules: ['server']
})

// The mock app is available
console.log(mock.app)  // Mock Express app
```

## Complete Example

```javascript
import { test, describe } from 'node:test'
import { mockPlugin } from '@dooksa/test'
import { deepStrictEqual, ok } from 'node:assert'

describe('Express Mock Testing', () => {
  test('should track route registrations', async (t) => {
    const mock = await mockPlugin(t, {
      name: 'server',
      platform: 'server',
      serverModules: ['server']
    })

    // Setup Server plugin (registers routes)
    mock.server.setup.server()

    // Check that routes were registered
    ok(mock.app.get.mock.callCount() > 0)
    ok(mock.app.post.mock.callCount() > 0)

    // Inspect registered routes
    const routes = mock.app.routes
    ok(Array.isArray(routes))
    ok(routes.length > 0)

    // Check specific route
    const getRoute = routes.find(r => r.method === 'get' && r.path === '/_/server')
    ok(getRoute)
    ok(getRoute.handlers.length > 0)

    mock.restore()
  })

  test('should track middleware registrations', async (t) => {
    const mock = await mockPlugin(t, {
      name: 'server',
      platform: 'server',
      serverModules: ['server', 'middleware']
    })

    mock.server.setup.server()

    // Register custom middleware
    mock.server.method.middlewareSet({
      name: 'custom/middleware',
      handler: (req, res, next) => {
        req.custom = 'value'
        next()
      }
    })

    // Check middleware tracking
    ok(mock.app.use.mock.callCount() > 0)

    // Inspect middleware
    const middleware = mock.app.middleware
    ok(Array.isArray(middleware))
    ok(middleware.length > 0)

    mock.restore()
  })

  test('should mock server lifecycle', async (t) => {
    const mock = await mockPlugin(t, {
      name: 'server',
      platform: 'server',
      serverModules: ['server']
    })

    mock.server.setup.server()

    // Start server
    const server = await mock.server.method.serverStart()

    // Verify server object
    ok(server)
    ok(typeof server.close === 'function')
    ok(typeof server.on === 'function')

    // Track event listeners
    const errorHandler = () => {}
    server.on('error', errorHandler)

    // Close server
    let closed = false
    await server.close(() => {
      closed = true
    })

    ok(closed)

    mock.restore()
  })
})
```

## Testing HTTP Routes

```javascript
test('should test complete HTTP flow', async (t) => {
  const mock = await mockPlugin(t, {
    name: 'component',
    platform: 'server',
    serverModules: ['server', 'database', 'page', 'middleware']
  })

  // Setup HTTP server
  mock.server.setup.server()

  // Register middleware
  mock.server.method.middlewareSet({
    name: 'user/auth',
    handler: (req, res, next) => {
      if (req.headers.authorization) {
        req.userId = 'user-123'
        next()
      } else {
        res.status(401).json({ error: 'Unauthorized' })
      }
    }
  })

  // Setup component
  mock.server.setup.component()

  // Start server
  await mock.server.method.serverStart()

  // Verify routes were registered
  const routes = mock.app.routes
  const getComponentRoute = routes.find(
    r => r.method === 'get' && r.path === '/_/component'
  )
  ok(getComponentRoute)

  // Test the route
  const request = mock.createRequest({
    method: 'GET',
    path: '/_/component',
    headers: { authorization: 'Bearer token' }
  })
  const response = mock.createResponse()

  await mock.invokeRoute('/_/component', request, response)

  deepStrictEqual(response.statusCode, 200)
  deepStrictEqual(response.headers['Content-Type'], 'application/json')

  mock.restore()
})
```

## Router Testing

```javascript
test('should mock Express Router', async (t) => {
  const mock = await mockPlugin(t, {
    name: 'server',
    platform: 'server'
  })

  const express = mock.app.constructor  // Get the mock express function
  const router = express.Router()

  // Register routes on router
  router.get('/users', (req, res) => {
    res.json([{ id: 1, name: 'John' }])
  })

  router.post('/users', (req, res) => {
    res.status(201).json({ id: 2, name: 'Jane' })
  })

  // Access router internals
  const routes = router._getRoutes()
  deepStrictEqual(routes.length, 2)
  deepStrictEqual(routes[0].method, 'get')
  deepStrictEqual(routes[1].method, 'post')

  mock.restore()
})
```

## Mock Call Inspection

```javascript
test('should inspect mock calls', async (t) => {
  const mock = await mockPlugin(t, {
    name: 'server',
    platform: 'server',
    serverModules: ['server']
  })

  mock.server.setup.server()

  // Check GET calls
  const getCalls = mock.app.get.mock.calls
  ok(getCalls.length > 0)

  // Inspect first GET call
  const firstGet = getCalls[0]
  deepStrictEqual(firstGet.arguments[0], '/_/server')  // Path
  ok(typeof firstGet.arguments[1] === 'function')    // Handler

  // Check call count
  deepStrictEqual(mock.app.get.mock.callCount(), getCalls.length)

  // Check POST calls
  const postCalls = mock.app.post.mock.calls
  ok(postCalls.length > 0)

  mock.restore()
})
```

## Best Practices

### 1. Verify Route Registration

```javascript
// After setup, verify routes exist
mock.server.setup.server()

const routes = mock.app.routes
const route = routes.find(r => r.path === '/_/expected')
ok(route, 'Route should be registered')
```

### 2. Check Middleware Order

```javascript
// Middleware is executed in registration order
const middleware = mock.app.middleware
deepStrictEqual(middleware.length, 2)
ok(typeof middleware[0] === 'function')  // First middleware
ok(typeof middleware[1] === 'function')  // Second middleware
```

### 3. Test Server Lifecycle

```javascript
// Verify server starts and stops correctly
const server = await mock.server.method.serverStart()
ok(server)

let closed = false
await server.close(() => { closed = true })
ok(closed)
```

### 4. Inspect Mock Arguments

```javascript
// Verify handlers were registered with correct paths
const getCall = mock.app.get.mock.calls.find(
  call => call.arguments[0] === '/_/component'
)
ok(getCall)
ok(getCall.arguments[1])  // Handler exists
```

## Troubleshooting

### Routes Not Being Tracked

**Problem**: `mock.app.routes` is empty

**Solutions**:
1. Ensure you're calling setup functions: `mock.server.setup.server()`
2. Verify the plugin actually registers routes
3. Check that you're using the mock app: `mock.app` not `express()`

### Middleware Not Appearing

**Problem**: `mock.app.middleware` is empty

**Solutions**:
1. Call `mock.server.method.middlewareSet()` to register middleware
2. Verify the plugin uses `app.use()` internally
3. Check that middleware is registered before route invocation

### Server Not Starting

**Problem**: `serverStart()` doesn't work

**Solutions**:
1. Ensure HTTP plugin is setup: `mock.server.setup.server()`
2. Verify the method exists: `mock.server.method.serverStart`
3. Check if it's async and needs `await`

### Mock Calls Undefined

**Problem**: `mock.app.get.mock.calls` is undefined

**Solutions**:
1. Verify you're using the mock app from `mockPlugin`
2. Check that methods are actually called during setup
3. Use `mock.app.get.mock.callCount()` to verify calls were made

## Integration with Other Mocks

The Express mock works seamlessly with other mockPlugin features:

```javascript
const mock = await mockPlugin(t, {
  name: 'server',
  platform: 'server',
  serverModules: ['server', 'database', 'middleware'],
  seedData: [
    {
      collection: 'users',
      item: { 'user-1': { name: 'John' } }
    }
  ]
})

// Express mock
mock.server.setup.server()
const routes = mock.app.routes

// Database mock
mock.server.setup.database()

// Middleware mock
mock.server.method.middlewareSet({ name: 'auth', handler: ... })

// All work together
await mock.invokeRoute('/_/users', request, response)
```

## See Also

- [Mock Plugin](./mock-plugin.md)
- [Mock Server Helpers](./mock-server-helpers.md)
