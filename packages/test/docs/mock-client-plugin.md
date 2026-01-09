# mockClientPlugin

A comprehensive testing utility for creating mock environments for dooksa plugins. This plugin provides complete mock implementations of state management methods and plugin actions with call tracking, custom behavior, and cleanup capabilities.

## Overview

The `mockClientPlugin` is designed to simplify testing of dooksa plugins by providing:

- **Complete Mock Environment**: Automatic mocking of plugin methods, actions, and state management
- **Call Tracking**: Monitor method calls, arguments, and return values
- **Custom Implementations**: Override default behavior for specific test scenarios
- **Multiple Plugin Support**: Mock single or multiple plugins simultaneously
- **Named Exports**: Custom mock definitions for external dependencies
- **Automatic Cleanup**: Restore all mocks and clean up test state

## Installation

The plugin is part of the `@dooksa/test` package:

```bash
npm install @dooksa/test
```

## Requirements

MockClientPlugin depends on the node `--experimental-test-module-mocks` flag

## Basic Usage

### Single Plugin Mock

```javascript
import { describe, it } from 'node:test'
import { mockClientPlugin } from '@dooksa/test'

describe('My Plugin Tests', () => {
  it('should test plugin functionality', async (t) => {
    const mock = await mockClientPlugin(t, {
      name: 'variable'
    })

    // Access mocked methods
    mock.method.variableGetValue({ query: 'test' })
    
    // Verify calls
    t.mock.method(mock.method.variableGetValue).callCount(1)

    // Clean up
    mock.restore()
  })
})
```

### Multiple Plugins

```javascript
const mock = await mockClientPlugin(t, {
  name: 'variable',
  modules: ['action', 'component']
})

// All plugin methods are available
mock.method.variableGetValue(...)
mock.method.actionDispatch(...)
mock.method.componentRemove(...)
```

## Configuration Options

### `name` (required)
The primary plugin to mock. This determines which plugin's methods and actions will be available.

```javascript
const mock = await mockClientPlugin(t, { name: 'variable' })
```

### `modules` (optional)
Array of additional plugin names to mock alongside the primary plugin.

```javascript
const mock = await mockClientPlugin(t, {
  name: 'variable',
  modules: ['action', 'component', 'state']
})
```

### `namedExports` (optional)
Array of custom mock definitions for external dependencies or helper functions.

```javascript
const mock = await mockClientPlugin(t, {
  name: 'action',
  namedExports: [
    {
      module: '#client',
      name: 'fetchGetById',
      value: t.mock.fn(() => Promise.resolve({ isEmpty: true }))
    },
    {
      module: '#client',
      name: 'operatorCompare',
      value: t.mock.fn(() => true)
    }
  ]
})
```

## Return Value

The `mockClientPlugin` returns a `MockPlugin` object with the following properties:

### `methods`
Object containing all mocked plugin methods and actions.

```javascript
mock.methods.variableGetValue(...)
mock.methods.stateGetValue(...)
```

### `actions`
Object containing mocked action methods specifically.

```javascript
mock.actions.actionDispatch(...)
```

### `method`
Convenient getter that combines both `methods` and `actions` for easy access.

```javascript
mock.method.variableGetValue(...)  // Same as mock.methods.variableGetValue(...)
mock.method.actionDispatch(...)     // Same as mock.actions.actionDispatch(...)
```

### `schema`
Map of plugin schemas by plugin name.

```javascript
const variableSchema = mock.schema.variable
```

### `setup`
Map of plugin setup functions by plugin name.

```javascript
const variableSetup = mock.setup.variable
```

### `restore()`
Function to clean up all mocks and restore the test environment. Always call this when done.

```javascript
mock.restore()
```

## Mock Method Behavior

### Call Tracking

All mocked methods automatically track their calls:

```javascript
const mock = await mockClientPlugin(t, { name: 'variable' })

// Initially zero calls
console.log(mock.method.stateGetValue.mock.callCount()) // 0

// Make calls
mock.method.stateGetValue({ name: 'test' })
mock.method.stateGetValue({ name: 'test2' })

// Track calls
console.log(mock.method.stateGetValue.mock.callCount()) // 2

// Access call arguments
const firstCall = mock.method.stateGetValue.mock.calls[0]
console.log(firstCall.arguments) // [{ name: 'test' }]

// Access return values
const lastReturn = mock.method.stateGetValue.mock.returned()
console.log(lastReturn) // Last return value
```

### Custom Implementations

Override default behavior for specific test scenarios:

```javascript
const mock = await mockClientPlugin(t, { name: 'variable' })

// Simple return value
mock.method.stateGetValue.mock.mockImplementation(() => ({ isEmpty: true }))

// Conditional logic
mock.method.stateGetValue.mock.mockImplementation((args) => {
  if (args.name === 'variable/scopes') {
    return {
      isEmpty: false,
      item: ['scope-1', 'scope-2']
    }
  }
  if (args.name === 'variable/values') {
    return {
      isEmpty: false,
      item: { user_name: 'John Doe' }
    }
  }
  return { isEmpty: true }
})

// Promise-based
mock.method.actionDispatch.mock.mockImplementation(() => 
  Promise.resolve({ success: true, data: { id: '123' } })
)
```

### Resetting Mocks

```javascript
// Reset call tracking
mock.method.variableGetValue.mock.reset()

// Clear implementation
mock.method.variableGetValue.mock.mockImplementation(undefined)

// Restore original behavior
mock.method.variableGetValue.mock.restore()
```

## State Management Mocking

The plugin automatically mocks all state management methods:

- `stateAddListener`
- `stateDeleteListener`
- `stateDeleteValue`
- `stateFind`
- `stateGenerateId`
- `stateGetSchema`
- `stateGetValue`
- `stateSetValue`
- `stateUnsafeSetValue`

```javascript
const mock = await mockClientPlugin(t, { name: 'variable' })

// Mock state operations
mock.method.stateGetValue({ name: 'variable/values' })
mock.method.stateSetValue({ name: 'variable/values', value: { data: 'test' } })
mock.method.stateAddListener({ name: 'variable/values', handler: () => {} })
```

## Plugin Action Method Mocking

Plugin actions are automatically converted to camelCase method names:

```javascript
// Original action: "variable_getValue" becomes "variableGetValue"
mock.method.variableGetValue({ query: 'test' }, { context: { rootId: 'root' } })

// Original action: "action_dispatch" becomes "actionDispatch"
mock.method.actionDispatch({ id: 'test-action', payload: { data: 'test' } })
```

### Context Injection

Action methods automatically receive context parameters:

```javascript
const mock = await mockClientPlugin(t, { name: 'variable' })

// The context parameter is automatically injected
mock.method.variableGetValue(
  { query: 'user.name' },
  { context: { rootId: 'app-root' } }
)
```

## Advanced Usage Patterns

### Complex Plugin Combinations

```javascript
const mock = await mockClientPlugin(t, {
  name: 'variable',
  modules: ['action', 'component', 'state'],
  namedExports: [
    {
      module: '#client',
      name: 'fetchGetById',
      value: t.mock.fn(() => Promise.resolve({ isEmpty: true }))
    },
    {
      module: '#client',
      name: 'operatorCompare',
      value: t.mock.fn(() => true)
    }
  ]
})

// All methods from all plugins are available
mock.method.variableGetValue(...)
mock.method.actionDispatch(...)
mock.method.componentRemove(...)
mock.method.stateGetValue(...)
mock.method.fetchGetById(...)
```

### Sequential Operations

```javascript
const mock = await mockClientPlugin(t, { name: 'variable' })

// Mock state to return specific data
mock.method.stateGetValue.mock.mockImplementation((args) => {
  if (args.name === 'variable/scopes') {
    return { isEmpty: false, item: ['scope-1', 'scope-2'] }
  }
  if (args.name === 'variable/values') {
    return { isEmpty: false, item: { 'test-key': 'test-value' } }
  }
  return { isEmpty: true }
})

// Perform sequential operations
const scopes = mock.method.stateGetValue({ name: 'variable/scopes' })
const values = mock.method.stateGetValue({ name: 'variable/values' })

// Verify all calls were tracked
console.log(mock.method.stateGetValue.mock.callCount()) // 2
```

### Conditional Logic Testing

```javascript
const mock = await mockClientPlugin(t, { name: 'action' })

// Mock actionIfElse with conditional logic
mock.method.actionIfElse.mock.mockImplementation(() => ['seq-1', 'seq-2'])

const result = mock.method.actionIfElse(
  {
    if: [{ op: '==', from: 'user.role', to: 'admin' }],
    then: ['admin-seq'],
    else: ['user-seq']
  },
  () => {},
  { context: {}, payload: {}, blockValues: {} }
)

// Verify the mock was called with correct parameters
console.log(mock.method.actionIfElse.mock.callCount()) // 1
```

### State Operations with Dependencies

```javascript
const mock = await mockClientPlugin(t, { name: 'variable' })

// Mock state methods to return interdependent data
mock.method.stateGetValue.mock.mockImplementation((args) => {
  if (args.name === 'variable/scopes') {
    return { isEmpty: false, item: ['scope-1', 'scope-2'] }
  }
  if (args.name === 'variable/values') {
    return { 
      isEmpty: false, 
      item: { 'scope-1': 'value1', 'scope-2': 'value2' } 
    }
  }
  return { isEmpty: true }
})

// Test operations that depend on each other
const scopes = mock.method.stateGetValue({ name: 'variable/scopes' })
const values = mock.method.stateGetValue({ 
  name: 'variable/values', 
  id: 'scope-1' 
})
```

## Error Handling

### Multiple Restore Calls

```javascript
const mock = await mockClientPlugin(t, { name: 'variable' })

// Safe to call multiple times
mock.restore()
mock.restore() // No error
mock.restore() // Still no error
```

### Restore with Errors

```javascript
const mock = await mockClientPlugin(t, {
  name: 'variable',
  namedExports: [
    {
      module: '#client',
      name: 'errorFunction',
      value: t.mock.fn(() => {
        throw new Error('Mock error')
      })
    }
  ]
})

// Restore handles errors gracefully
mock.restore() // No error thrown
```

### Plugin with No State

```javascript
// Works with plugins that don't have state
const mock = await mockClientPlugin(t, { name: 'string' })
mock.restore()
```

## Testing Scenarios

### Unit Testing Plugin Methods

```javascript
import { describe, it } from 'node:test'
import { strictEqual, deepStrictEqual } from 'node:assert'
import { mockClientPlugin } from '@dooksa/test'

describe('Variable Plugin', () => {
  it('should get variable value with query', async (t) => {
    const mock = await mockClientPlugin(t, { name: 'variable' })

    // Mock state to return test data
    mock.method.stateGetValue.mock.mockImplementation((args) => {
      if (args.name === 'variable/scopes') {
        return { isEmpty: false, item: ['default'] }
      }
      if (args.name === 'variable/values') {
        return { 
          isEmpty: false, 
          item: { user_name: 'John Doe' } 
        }
      }
      return { isEmpty: true }
    })

    // Test the method
    const result = mock.method.variableGetValue(
      { query: 'user.name' },
      { context: { rootId: 'root' } }
    )

    // Verify behavior
    strictEqual(mock.method.stateGetValue.mock.callCount(), 2)
    
    mock.restore()
  })
})
```

### Integration Testing Multiple Plugins

```javascript
describe('Integration Tests', () => {
  it('should work with complex plugin combinations', async (t) => {
    const mock = await mockClientPlugin(t, {
      name: 'variable',
      modules: ['action', 'component'],
      namedExports: [
        {
          module: '#client',
          name: 'fetchGetById',
          value: t.mock.fn(() => Promise.resolve({ isEmpty: true }))
        }
      ]
    })

    // Test interactions between plugins
    mock.method.stateGetValue.mock.mockImplementation(() => ({
      isEmpty: false,
      item: { data: 'test' }
    }))

    const varResult = mock.method.variableGetValue({ query: 'test' })
    const actionResult = await mock.method.actionDispatch({ id: 'test' })

    // Verify all plugins were called
    strictEqual(mock.method.variableGetValue.mock.callCount(), 1)
    strictEqual(mock.method.actionDispatch.mock.callCount(), 1)
    strictEqual(mock.method.fetchGetById.mock.callCount(), 0)

    mock.restore()
  })
})
```

### Testing Error Conditions

```javascript
describe('Error Handling', () => {
  it('should handle state errors gracefully', async (t) => {
    const mock = await mockClientPlugin(t, { name: 'variable' })

    // Mock state to throw error
    mock.method.stateGetValue.mock.mockImplementation(() => {
      throw new Error('State error')
    })

    // Test error handling
    try {
      mock.method.variableGetValue({ query: 'test' })
      t.fail('Should have thrown error')
    } catch (error) {
      t.ok(error.message.includes('State error'))
    }

    mock.restore()
  })
})
```

## Best Practices

### 1. Always Call restore()

```javascript
// Good
const mock = await mockClientPlugin(t, { name: 'variable' })
try {
  // ... tests ...
} finally {
  mock.restore()
}

// Better - use test framework cleanup
const mock = await mockClientPlugin(t, { name: 'variable' })
t.after(() => mock.restore())
```

### 2. Mock Before Testing

```javascript
// Set up mocks first
const mock = await mockClientPlugin(t, { name: 'variable' })
mock.method.stateGetValue.mock.mockImplementation(() => ({ isEmpty: true }))

// Then test
const result = mock.method.variableGetValue({ query: 'test' })
```

### 3. Use Specific Mock Implementations

```javascript
// Instead of generic mocks
mock.method.stateGetValue.mock.mockImplementation(() => ({ isEmpty: true }))

// Use specific implementations for different scenarios
mock.method.stateGetValue.mock.mockImplementation((args) => {
  if (args.name === 'variable/scopes') {
    return { isEmpty: false, item: ['scope-1'] }
  }
  return { isEmpty: true }
})
```

### 4. Verify Call Counts

```javascript
// Check that methods were called as expected
strictEqual(mock.method.stateGetValue.mock.callCount(), 2)
strictEqual(mock.method.variableGetValue.mock.callCount(), 1)
```

### 5. Test Multiple Scenarios

```javascript
describe('Multiple Scenarios', () => {
  it('should handle empty state', async (t) => {
    const mock = await mockClientPlugin(t, { name: 'variable' })
    mock.method.stateGetValue.mock.mockImplementation(() => ({ isEmpty: true }))
    
    const result = mock.method.variableGetValue({ query: 'test' })
    strictEqual(result.isEmpty, true)
    
    mock.restore()
  })

  it('should handle populated state', async (t) => {
    const mock = await mockClientPlugin(t, { name: 'variable' })
    mock.method.stateGetValue.mock.mockImplementation(() => ({
      isEmpty: false,
      item: { value: 'test' }
    }))
    
    const result = mock.method.variableGetValue({ query: 'test' })
    strictEqual(result.value, 'test')
    
    mock.restore()
  })
})
```

## API Reference

### Function Signature

```typescript
async function mockClientPlugin(
  context: TestContext,
  options: {
    name: string
    modules?: string[]
    namedExports?: Array<{
      module: string
      name: string
      value: any
    }>
  }
): Promise<MockPlugin>
```

### MockPlugin Type

```typescript
interface MockPlugin {
  methods: { [key: string]: Mock<Function> }
  actions: { [key: string]: Mock<Function> }
  method: { [key: string]: Mock<Function> }
  schema: { [key: string]: Object }
  setup: { [key: string]: Function }
  restore: () => void
}
```

### MockStateMethods Type

```typescript
interface MockStateMethods {
  stateAddListener: Mock<Function>
  stateDeleteListener: Mock<Function>
  stateDeleteValue: Mock<Function>
  stateFind: Mock<Function>
  stateGenerateId: Mock<Function>
  stateGetSchema: Mock<Function>
  stateGetValue: Mock<Function>
  stateSetValue: Mock<Function>
  stateUnsafeSetValue: Mock<Function>
}
```

## Common Issues and Solutions

### Issue: Methods not available

**Problem**: `mock.method.variableGetValue is undefined`

**Solution**: Ensure the plugin name is correct and the plugin exists in the client modules.

### Issue: State methods not working

**Problem**: State methods return unexpected values

**Solution**: Mock the state methods explicitly:

```javascript
mock.method.stateGetValue.mock.mockImplementation(() => ({ isEmpty: true }))
```

### Issue: Mock not cleaning up properly

**Problem**: Tests interfere with each other

**Solution**: Always call `mock.restore()` in a `finally` block or use test framework cleanup hooks.

### Issue: Named exports not available

**Problem**: Custom named exports don't appear in `mock.method`

**Solution**: Ensure the named export is defined in the `namedExports` array with the correct module path.

## Related

- [Node.js Test Runner](https://nodejs.org/api/test.html)
- [Mocking in Node.js](https://nodejs.org/api/test.html#mocking)
- [Dooksa Plugin System](../plugins/README.md)
