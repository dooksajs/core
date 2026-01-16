# @dooksa/test

Centralized testing utilities and mocks for Dooksa packages. This package provides a comprehensive set of tools for writing reliable, consistent tests across the Dooksa ecosystem.

## Installation

This package is part of the Dooksa monorepo and should be used as a workspace dependency.

```bash
pnpm add @dooksa/test
```

## Features

- **Plugin Mocking** - Complete mock environments for Dooksa plugins
- **State Management** - Mock state with full method support
- **Utility Mocks** - Mock versions of common utilities (getValue, generateId, fetch)
- **Assertion Helpers** - Convenient assertion functions for common test patterns
- **Test Factories** - Factory functions for creating test data

## Quick Start

```javascript
import { describe, it } from 'node:test'
import { strictEqual } from 'node:assert'
import { mockPlugin, createContext, assertStateSet } from '@dooksa/test'

describe('My Test', async (t) => {
  const mock = await mockPlugin(t, {
    name: 'action',
    modules: ['variable', 'state']
  })

  it('should set state correctly', async () => {
    const context = createContext({ id: 'test-123' })
    
    // Execute your action
    await mock.plugin.dispatch({
      id: 'my-action',
      context
    })

    // Assert state was set
    assertStateSet(mock, 'variable/values', 'test-123', { key: 'value' })
  })
})
```

## API Reference

### Plugins

#### `mockPlugin(context, options)`
Creates a complete mock environment for a Dooksa plugin.

**Parameters:**
- `context` - Node.js TestContext
- `options.name` - Plugin name to mock
- `options.platform` - 'client' or 'server' (default: 'client')
- `options.modules` - Additional plugin names to mock
- `options.namedExports` - Pre-defined mock functions

**Returns:** Mock environment with plugin, modules, and state methods

#### `mockPluginModule(context, name, platform)`
Mock an individual plugin module.

#### `mockPluginModuleContext(context, namedExports, platform)`
Mock plugin module context for imports.

### Utilities

#### `createMockGetValue(t)`
Creates a mock getValue function that supports dot notation and array queries.

#### `createMockGenerateId(t)`
Creates a mock generateId function that returns consistent test IDs.

#### `createMockFetch(t, options)`
Creates a mock fetch function with request tracking.

**Options:**
- `response` - Response data or function
- `status` - HTTP status code (default: 200)
- `ok` - Whether response is OK (default: true)
- `error` - Error to throw
- `onRequest` - Callback for request tracking

#### `createMockFetchWithCache(t, options)`
Creates a mock fetch with cache behavior simulation.

#### `createMockFetchError(t, options)`
Creates a mock fetch that always throws an error.

#### `createMockFetchServerError(t, options)`
Creates a mock fetch that returns HTTP error responses.

#### `mockWindowLocationSearch(context, search)`
Mocks window.location.search for testing.

### Assertions

#### `assertActionDispatched(mock, actionId)`
Assert that an action was dispatched.

#### `assertStateSet(mock, name, id, expectedValue)`
Assert that state was set with specific values.

#### `assertStateNotSet(mock, name, id)`
Assert that state was not set.

#### `assertMethodCalled(mock, methodName, expectedParam)`
Assert that a method was called.

#### `assertNoMethodCalls(mock)`
Assert that no methods were called.

#### `assertBlockStructure(compiled, expected)`
Assert that a compiled action has the correct structure.

### Factories

#### `createContext(overrides)`
Creates a test context object.

#### `createMockAction(id, steps, dependencies, methods)`
Creates a compiled action for testing.

#### `createMockPlugin(name, config)`
Creates a mock plugin using createPlugin.

#### `createMockState(overrides)`
Creates a mock state object.

## Examples

### Testing Action Execution

```javascript
import { mockPlugin, createContext, assertStateSet } from '@dooksa/test'

const mock = await mockPlugin(t, {
  name: 'action',
  modules: ['variable', 'state']
})

const context = createContext({ id: 'component-123' })

await mock.plugin.dispatch({
  id: 'test-action',
  context,
  payload: { data: 'test' }
})

assertStateSet(mock, 'variable/values', 'component-123', {
  key: 'value'
})
```

### Testing Conditional Logic

```javascript
import { mockPlugin, createMockAction, assertMethodCalled } from '@dooksa/test'

const action = createMockAction('test', [
  {
    $id: 'condition',
    action_ifElse: {
      if: [{ op: '==', from: 'status', to: 'active' }],
      then: [{ $sequenceRef: 0 }],
      else: [{ $sequenceRef: 1 }]
    }
  }
])

// Test the condition logic
const mock = await mockPlugin(t, { name: 'action' })
// ... execute and assert
```

### Testing Fetch Operations

```javascript
import { createMockFetch } from '@dooksa/test'

const mock = createMockFetch(t, {
  response: { data: [{ id: '1', name: 'Test' }] }
})

// Replace global fetch
global.fetch = mock.fetch

// Execute fetch operation
const response = await fetch('/_/collection')
const data = await response.json()

// Verify requests
mock.verifyRequestCount(1)
const lastRequest = mock.getLastRequest()
strictEqual(lastRequest.url, '/_/collection')
```

## Best Practices

1. **Use descriptive test IDs** - Makes debugging easier
2. **Clean up mocks** - Use `mock.restore()` in teardown
3. **Assert specific values** - Don't just check if methods were called
4. **Test error cases** - Use error mocks to test failure paths
5. **Use factories** - Reuse factory functions for consistency

## Migration from Old Mocks

If you're migrating from `packages/plugins/mock`:

```javascript
// Old
import { mockPlugin } from '#mock'

// New
import { mockPlugin } from '@dooksa/test'
```

The new package provides the same functionality with better organization and additional utilities.

## License

AGPL-3.0-or-later
