# Mock Plugin Documentation

## Overview

The `mockPlugin` function is a comprehensive testing utility that creates a complete mock environment for Dooksa plugins. It enables isolated unit testing by providing mock implementations of plugin dependencies, state management, HTTP routes, and database operations.

### Key Features

- **Complete Plugin Mocking**: Mock any server or client plugin with all its dependencies
- **Automatic Global Fetch Mocking**: Automatically mocks `global.fetch` for client-side plugins that depend on fetch
- **Express Integration**: Built-in mock Express server for HTTP route testing
- **Database Seeding**: Pre-populate mock database with test data
- **State Management**: Automatic state setup and synchronization
- **Request Tracking**: Monitor all HTTP requests and responses
- **Custom Mock Exports**: Override specific module exports for fine-grained control


## Installation

This function is part of the `@dooksa/test` package and is automatically available when you import from the test utilities.

```javascript
import { mockPlugin } from '@dooksa/test'
```

## API Reference

### `mockPlugin(context, options)`

Creates a complete mock environment for server or client plugins.

#### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `context` | `TestContext` | Yes | - | Node.js TestContext for creating mocks |
| `options` | `Object` | Yes | - | Configuration object |
| `options.name` | `string` | Yes | - | Name of the primary plugin to mock |
| `options.platform` | `string` | No | `'client'` | Platform: `'client'` or `'server'` |
| `options.serverModules` | `Array<string\|DsPluginExport>` | No | `[]` | Additional server plugin names to mock |
| `options.clientModules` | `Array<string\|DsPluginExport>` | No | `[]` | Client plugin names to mock |
| `options.namedExports` | `MockPluginNamedExports[]` | No | `[]` | Array of mock definitions |
| `options.seedData` | `SeedData[]` | No | `[]` | Seed data for mock database |

#### Returns

`Promise<MockPlugin>` - A complete mock environment with the following structure:

```typescript
interface MockPlugin {
  client: MockPluginPlatform
  server: MockPluginPlatform
  app: MockExpressApp
  createRequest: Function
  createResponse: Function
  invokeRoute: Function
  restore: Function
  fetchMock: {
    fetch: Function
    requests: Array<{ url: string, method: string, path: string, query: Object, timestamp: number }>
  }
}
```

### Type Definitions

#### MockPluginPlatform

```typescript
interface MockPluginPlatform {
  methods: { [key: string]: Mock<Function> }
  actions: { [key: string]: Mock<Function> }
  method: { [key: string]: Mock<Function> } // Combined methods and actions
  schema: { [key: string]: Object }
  setup: { [key: string]: Function }
}
```

#### MockPluginNamedExports

```typescript
interface MockPluginNamedExports {
  module: string  // '#server', '#client', or module path
  name: string    // Export name
  value: *        // Mock value
}
```

#### SeedData

```typescript
interface SeedData {
  collection: string  // Collection name
  item: Object        // Data items
}
```

### Global Fetch Mocking

The `mockPlugin` function automatically mocks `global.fetch` to route requests through the mock Express server. This enables seamless integration testing between client and server components.

**Key Features:**
- Automatically enabled for all mockPlugin instances
- Routes fetch requests through mock Express app
- Converts Express responses to Fetch Response objects
- Tracks all fetch requests in `mock.fetchMock.requests`

```javascript
const mock = await mockPlugin(t, {
  name: 'fetch',
  platform: 'client',
  serverModules: ['http', 'database', userPlugin],
  clientModules: ['state']
})

// global.fetch is now mocked
// Access fetch mock tracking
console.log(mock.fetchMock.requests)
```

## Usage Examples

### Basic Client Plugin Mock

```javascript
import { test, describe } from 'node:test'
import { mockPlugin } from '@dooksa/test'
import { strictEqual } from 'node:assert'

describe('Variable Plugin', () => {
  test('should mock variable methods', async (t) => {
    const mock = await mockPlugin(t, {
      name: 'variable'
    })

    // Access mocked methods
    const { variableGetValue, variableSetValue } = mock.client.method

    // Use the mocks
    variableSetValue.mockReturnValueOnce('test-value')
    const result = variableGetValue({ name: 'testVar' })
    
    strictEqual(result, 'test-value')
    
    mock.restore()
  })
})
```

### Server Plugin with Dependencies

```javascript
test('should mock server plugin with dependencies', async (t) => {
  const mock = await mockPlugin(t, {
    name: 'component',
    platform: 'server',
    serverModules: ['database', 'http', 'page'],
    clientModules: ['component', 'page']
  })

  // Setup HTTP server
  mock.server.setup.http()
  
  // Mock middleware
  mock.server.method.middlewareSet({
    name: 'user/auth',
    handler (req, res, next) {
      req.userId = 'user-1'
      next()
    }
  })
  
  // Setup component
  mock.server.setup.component()

  mock.restore()
})
```

### Database Seeding

```javascript
test('should seed database', async (t) => {
  const mock = await mockPlugin(t, {
    name: 'action',
    platform: 'server',
    serverModules: ['database'],
    seedData: [
      {
        collection: 'action/blocks',
        item: {
          'block-1': {
            method: 'testAction',
            value: 'test-value'
          }
        }
      },
      {
        collection: 'action/sequences',
        item: {
          'sequence-1': ['block-1']
        }
      }
    ]
  })

  const { stateGetValue } = mock.client.method

  const blockResult = stateGetValue({
    name: 'action/blocks',
    id: 'block-1'
  })

  // Verify seeded data
  deepStrictEqual(blockResult.item, {
    method: 'testAction',
    value: 'test-value'
  })

  mock.restore()
})
```

### HTTP Route Testing

```javascript
test('should test HTTP routes', async (t) => {
  const mock = await mockPlugin(t, {
    name: 'component',
    platform: 'server',
    serverModules: ['http', 'database', 'page', 'middleware']
  })

  // Setup HTTP server
  mock.server.setup.http()

  // Mock middleware
  mock.server.method.middlewareSet({
    name: 'user/auth',
    handler (req, res, next) {
      req.userId = 'user-1'
      next()
    }
  })

  // Setup component
  mock.server.setup.component()

  // Start HTTP server
  await mock.server.method.httpStart()

  // Create request and response
  const request = mock.createRequest({
    method: 'GET',
    path: '/_/component',
    query: {}
  })
  const response = mock.createResponse()

  // Invoke route
  await mock.invokeRoute('/_/component', request, response)

  // Verify route was called
  strictEqual(mock.app.get.mock.callCount(), 1)
  strictEqual(response.statusCode, 200)

  mock.restore()
})
```

### Custom Named Exports

```javascript
test('should mock custom named exports', async (t) => {
  const mock = await mockPlugin(t, {
    name: 'custom-plugin',
    platform: 'server',
    namedExports: [
      {
        module: '#server',
        name: 'customFunction',
        value: () => 'mocked-value'
      },
      {
        module: '#client',
        name: 'anotherFunction',
        value: () => 'client-mocked'
      }
    ]
  })

  // Custom functions are available in methods
  const result = mock.server.method.customFunction()
  strictEqual(result, 'mocked-value')

  mock.restore()
})
```

### Testing Setup Functions

```javascript
test('should execute setup functions', async (t) => {
  const mock = await mockPlugin(t, {
    name: 'database',
    platform: 'server',
    serverModules: ['http']
  })

  // Setup functions are stored but not auto-executed
  // Execute them manually
  if (mock.server.setup.http) {
    mock.server.setup.http()
  }

  if (mock.server.setup.database) {
    mock.server.setup.database()
  }

  // Now test with setup complete
  await mock.server.method.httpStart()

  mock.restore()
})
```

### Testing Client Plugins with Fetch

```javascript
import { test, describe, beforeEach, afterEach } from 'node:test'
import { mockPlugin, createMockFetch } from '@dooksa/test'
import { strictEqual, ok } from 'node:assert'

describe('Fetch Plugin Integration', () => {
  let mock

  beforeEach(async (t) => {
    // Setup mock with server dependencies
    mock = await mockPlugin(t, {
      name: 'fetch',
      platform: 'client',
      serverModules: ['http', 'database', userPlugin],
      clientModules: ['state'],
      seedData: [
        {
          collection: 'user/profiles',
          item: {
            'user-1': { name: 'John', email: 'john@example.com' }
          }
        }
      ]
    })

    // Setup HTTP server and database
    mock.server.setup.http()
    mock.server.setup.database()
    await mock.server.method.httpStart()

    // Setup fetch plugin
    mock.client.setup.fetch({ hostname: 'http://localhost:6362' })
  })

  afterEach(() => {
    if (mock) mock.restore()
  })

  test('should fetch data through mock server', async () => {
    // This uses the automatically mocked global.fetch
    const result = await mock.client.method.fetchGetAll({
      collection: 'user/profiles'
    })

    strictEqual(result.length, 1)
    strictEqual(result[0].item.name, 'John')
  })

  test('should handle custom fetch responses', async () => {
    // Override global.fetch for specific test
    const customFetch = createMockFetch(t, {
      response: [{ id: 'custom', item: { name: 'Custom' } }]
    })
    global.fetch = customFetch.fetch

    const result = await mock.client.method.fetchGetAll({
      collection: 'custom/data'
    })

    strictEqual(result[0].item.name, 'Custom')
  })

  test('should track fetch requests', async () => {
    await mock.client.method.fetchGetAll({
      collection: 'user/profiles',
      where: "role == 'admin'"
    })

    // Verify fetch was called with correct URL
    strictEqual(mock.fetchMock.requests.length, 1)
    ok(mock.fetchMock.requests[0].url.includes('user/profiles'))
    ok(mock.fetchMock.requests[0].url.includes('role'))
  })
})
```

## Helper Functions

### `createRequest(overrides)`

Creates a mock Express request object.

```javascript
const request = mock.createRequest({
  method: 'POST',
  path: '/_/api',
  body: { data: 'value' },
  headers: { 'content-type': 'application/json' }
})
```

**Default Properties:**
- `method`: 'GET'
- `path`: '/'
- `params`: `{}`
- `query`: `{}`
- `body`: `{}`
- `cookies`: `{}`
- `signedCookies`: `{}`
- `headers`: `{}`
- `userId`: `null`

### `createResponse()`

Creates a mock Express response object with tracking capabilities.

```javascript
const response = mock.createResponse()

response.status(200).json({ success: true })

// Access response state
console.log(response.statusCode) // 200
console.log(response.body) // { success: true }
console.log(response.headers) // { 'Content-Type': 'application/json' }
```

**Methods:**
- `status(code)` - Set HTTP status code
- `send(data)` - Send response body
- `json(data)` - Send JSON response
- `html(data)` - Send HTML response
- `set(key, value)` - Set headers
- `cookie(name, value, options)` - Set cookies

### `invokeRoute(app, path, request, response)`

Manually invokes a registered route handler.

```javascript
const response = mock.createResponse()
const request = mock.createRequest({
  method: 'GET',
  path: '/_/component'
})

await mock.invokeRoute('/_/component', request, response)
```

## Mock Platform Properties

### Accessing Mocks

```javascript
const mock = await mockPlugin(t, { name: 'variable' })

// Individual methods
const setValue = mock.client.methods.variableSetValue
const getValue = mock.client.methods.variableGetValue

// Combined methods and actions
const allMethods = mock.client.method

// Actions only
const actions = mock.client.actions

// Schemas
const schemas = mock.client.schema

// Setup functions
const setups = mock.client.setup
```

### Mock Assertions

```javascript
// Check if called
strictEqual(mock.client.methods.variableSetValue.mock.callCount(), 1)

// Check call arguments
deepStrictEqual(
  mock.client.methods.variableSetValue.mock.calls[0].arguments,
  [{ name: 'test', value: 'value' }]
)

// Mock return value
mock.client.methods.variableGetValue.mockReturnValueOnce('mocked')
```

## Best Practices

### 1. Always Restore Mocks

Always call `mock.restore()` in a `finally` block or after assertions to clean up:

```javascript
test('example', async (t) => {
  const mock = await mockPlugin(t, { name: 'variable' })
  
  try {
    // Your test code
  } finally {
    mock.restore()
  }
})
```

Or use a helper:

```javascript
test('example', async (t) => {
  const mock = await mockPlugin(t, { name: 'variable' })
  t.after(() => mock.restore())
  
  // Your test code
})
```

### 2. Include Required Dependencies

The `state` plugin is automatically included for client mocks. For server plugins, include all dependencies:

```javascript
const mock = await mockPlugin(t, {
  name: 'component',
  platform: 'server',
  serverModules: ['database', 'http', 'page', 'middleware']
})
```

### 3. Setup Before Testing

Execute setup functions before testing:

```javascript
mock.server.setup.http()
mock.server.setup.component()
await mock.server.method.httpStart()
```

### 4. Use Named Exports for Custom Mocks

When you need specific behavior from dependencies:

```javascript
namedExports: [
  {
    module: '#server',
    name: 'databaseGetValue',
    value: () => ({ item: { custom: 'data' }, isEmpty: false })
  }
]
```

### 5. Seed Data for Database Tests

Use `seedData` to populate mock database:

```javascript
seedData: [
  {
    collection: 'users',
    item: {
      'user-1': { name: 'John', email: 'john@example.com' }
    }
  }
]
```

## Common Patterns

### Testing HTTP Endpoints

```javascript
test('GET /_/component returns components', async (t) => {
  const mock = await mockPlugin(t, {
    name: 'component',
    platform: 'server',
    serverModules: ['http', 'database', 'page']
  })

  mock.server.setup.http()
  mock.server.setup.component()
  await mock.server.method.httpStart()

  const request = mock.createRequest({
    method: 'GET',
    path: '/_/component',
    query: { pageId: 'page-1' }
  })
  const response = mock.createResponse()

  await mock.invokeRoute('/_/component', request, response)

  strictEqual(response.statusCode, 200)
  strictEqual(response.headers['Content-Type'], 'application/json')
  ok(Array.isArray(response.body))

  mock.restore()
})
```

### Testing Actions

```javascript
test('action dispatch', async (t) => {
  const mock = await mockPlugin(t, {
    name: 'action',
    platform: 'client',
    clientModules: ['action', 'state']
  })

  const { actionDispatch } = mock.client.method

  // Mock the action result
  actionDispatch.mockResolvedValueOnce({ success: true })

  const result = await actionDispatch({
    actionId: 'test-action',
    payload: { data: 'value' }
  })

  deepStrictEqual(result, { success: true })

  mock.restore()
})
```

### Testing Middleware

```javascript
test('middleware chain', async (t) => {
  const mock = await mockPlugin(t, {
    name: 'http',
    platform: 'server',
    serverModules: ['http', 'middleware']
  })

  mock.server.setup.http()

  // Register middleware
  const middlewareCalls = []
  mock.server.method.middlewareSet({
    name: 'test-middleware',
    handler: (req, res, next) => {
      middlewareCalls.push('called')
      next()
    }
  })

  // Test middleware execution
  const request = mock.createRequest()
  const response = mock.createResponse()
  
  await mock.invokeRoute('/_/test', request, response)

  strictEqual(middlewareCalls.length, 1)

  mock.restore()
})
```

### Testing Client Plugins with Fetch Integration

```javascript
test('client plugin with fetch integration', async (t) => {
  // Setup complete environment with server and client
  const mock = await mockPlugin(t, {
    name: 'myClientPlugin',
    platform: 'client',
    serverModules: ['http', 'database'],
    clientModules: ['state', 'fetch'],
    seedData: [
      {
        collection: 'api/data',
        item: {
          'item-1': { name: 'Test', value: 123 }
        }
      }
    ]
  })

  // Setup server
  mock.server.setup.http()
  mock.server.setup.database()
  
  // Register API route
  mock.server.method.httpSetRoute({
    path: '/api/data',
    handlers: [mock.server.method.databaseGetValue(['api/data'])]
  })
  
  await mock.server.method.httpStart()

  // Setup client fetch
  mock.client.setup.fetch({ hostname: 'http://localhost:6362' })

  // Test client method that uses fetch internally
  const result = await mock.client.method.myClientPluginGetData()

  // Verify fetch was called
  strictEqual(mock.fetchMock.requests.length, 1)
  ok(mock.fetchMock.requests[0].url.includes('/api/data'))

  // Verify result
  strictEqual(result.item.name, 'Test')

  mock.restore()
})
```

## Troubleshooting
</parameter>

### Plugin Not Found Error

**Problem**: `Failed to find plugin "xyz" in form the "server" platform`

**Solution**: Ensure the plugin exists in the correct platform directory and the name is correct.

### State Not Available

**Problem**: State methods not available in mock

**Solution**: The `state` plugin is automatically included for client mocks. For server mocks, add it to `clientModules`:

```javascript
clientModules: ['state', 'action']
```

### Mock Not Returning Expected Values

**Problem**: Mock functions return undefined or default values

**Solution**: Use `namedExports` to provide specific return values:

```javascript
namedExports: [
  {
    module: '#server',
    name: 'databaseGetValue',
    value: () => ({ item: { id: '1' }, isEmpty: false })
  }
]
```

### Routes Not Found

**Problem**: `invokeRoute` throws "Route not found"

**Solution**: Ensure:
1. HTTP plugin is setup: `mock.server.setup.http()`
2. Routes are registered before invoking
3. Path matches exactly (including `/_/` prefix)

### Fetch Not Working

**Problem**: `global.fetch` is not mocked or fetch requests fail

**Solution**: The `mockPlugin` function automatically mocks `global.fetch` for all instances. If fetch requests are failing:

1. **Check HTTP server setup**: Ensure the HTTP server is started
   ```javascript
   mock.server.setup.http()
   await mock.server.method.httpStart()
   ```

2. **Verify routes are registered**: Make sure your routes are set up before making fetch calls
   ```javascript
   mock.server.method.httpSetRoute({
     path: '/api/data',
     handlers: [mock.server.method.databaseGetValue(['data'])]
   })
   ```

3. **Check fetch plugin setup**: For fetch plugin tests, ensure it's configured
   ```javascript
   mock.client.setup.fetch({ hostname: 'http://localhost:6362' })
   ```

4. **Access fetch mock tracking**: Use `mock.fetchMock.requests` to debug
   ```javascript
   console.log(mock.fetchMock.requests) // See all fetch calls
   ```

### Fetch Mock Returns Wrong Data

**Problem**: Fetch calls return unexpected results

**Solution**: The fetch mock routes through the mock Express server. Ensure:
- The database has the correct seed data
- The HTTP routes are properly configured
- The URL path matches the registered route

```javascript
// Check what's happening
console.log('Requests:', mock.fetchMock.requests)
console.log('Database:', mock.client.method.stateGetValue({ name: 'your/collection', id: 'item-1' }))
```

## Performance Considerations

1. **Minimize Mock Scope**: Only mock what you need
2. **Reuse Mocks**: Share mocks between related tests when appropriate
3. **Clean Up**: Always restore mocks to prevent memory leaks
4. **Async Handling**: Use `await` for setup functions that perform async operations

## Integration with Test Frameworks

### Node.js Test Runner

```javascript
import { test, describe, before, after } from 'node:test'
import { mockPlugin } from '@dooksa/test'

describe('Plugin Tests', () => {
  let mock

  before(async () => {
    mock = await mockPlugin(t, { name: 'variable' })
  })

  after(() => {
    if (mock) mock.restore()
  })

  test('test 1', async () => {
    // Use mock
  })
})
```

### Jest

```javascript
import { mockPlugin } from '@dooksa/test'

describe('Plugin Tests', () => {
  let mock

  beforeEach(async () => {
    mock = await mockPlugin({ name: 'variable' })
  })

  afterEach(() => {
    if (mock) mock.restore()
  })

  test('test 1', async () => {
    // Use mock
  })
})
```

## See Also

- [Mock Server Helpers](./mock-server-helpers.md)
- [Mock Express Module](./mock-express-module.md)
- [Mock State Data](./mock-state-data.md)
- [Mock Database Seed](./mock-database-seed.md)
