# Testing Dooksa Plugins

This guide provides comprehensive instructions for testing Dooksa plugins using the `createPluginTester` utility from the `@dooksa/test` package.

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [API Reference](#api-reference)
4. [Testing Modes](#testing-modes)
5. [Common Testing Patterns](#common-testing-patterns)
6. [State Seeding & Management](#state-seeding--management)
7. [Mocking Methods](#mocking-methods)
8. [Verification & Assertions](#verification--assertions)
9. [Testing Scenarios](#testing-scenarios)
10. [Best Practices](#best-practices)
11. [Troubleshooting](#troubleshooting)
12. [Complete Examples](#complete-examples)

## Introduction

The `createPluginTester` utility provides a powerful way to test Dooksa plugins by creating observable instances that track method calls while optionally executing real logic. This enables comprehensive testing of plugin behavior, state management, and method interactions.

### Key Features

- **Spy Mode**: Track method calls while executing real logic
- **Mock Mode**: Track method calls while silencing real logic
- **State Management**: Seed and verify plugin state
- **Method Mocking**: Replace method implementations for testing
- **Automatic Cleanup**: Restore plugins to original state after tests

## Getting Started

### Installation

The `createPluginTester` utility is part of the `@dooksa/test` package:

```bash
npm install @dooksa/test --save-dev
```

### Basic Setup

```javascript
import { describe, it } from 'node:test'
import { strictEqual } from 'node:assert'
import { createPluginTester } from '@dooksa/test'
import { myPlugin } from '#core'

describe('My Plugin Tests', () => {
  it('should test plugin method', async (t) => {
    const tester = createPluginTester(t)
    
    // Create observable instance
    const plugin = tester.spy('myPlugin', myPlugin)
    
    // Test the plugin
    const result = plugin.myPluginMethod()
    
    strictEqual(result, expectedValue)
    
    // Clean up
    tester.restoreAll()
  })
})
```

### Test Helper Pattern

For complex plugins with dependencies, create a setup helper:

```javascript
import { describe, it } from 'node:test'
import { strictEqual } from 'node:assert'
import { createPluginTester, mockStateData } from '@dooksa/test'
import { myPlugin, dependencyPlugin } from '#core'

/**
 * Helper function to set up the plugin with dependencies
 * @param {import('node:test').TestContext} t - Test context
 * @param {Object} [options] - Configuration object
 * @param {Object} [options.state] - State data to seed
 * @returns {Object} Object with tester and plugin instances
 */
function setupPlugin (t, options = { state: [] }) {
  const tester = createPluginTester(t)

  // Create observable instances of required plugins
  const depPlugin = tester.spy('dependency', dependencyPlugin)
  const mainPlugin = tester.spy('myPlugin', myPlugin)

  // Setup mock state data
  const stateData = mockStateData([myPlugin, dependencyPlugin])
  depPlugin.setup(stateData)

  // Seed state if provided
  if (options.state) {
    options.state.forEach(({ collection, item }) => {
      if (Array.isArray(item)) {
        item.forEach((data, index) => {
          depPlugin.stateSetValue({
            name: collection,
            value: data,
            options: { id: Object.keys(data)[0] }
          })
        })
      } else {
        depPlugin.stateSetValue({
          name: collection,
          value: item
        })
      }
    })
  }

  return {
    tester,
    mainPlugin,
    depPlugin
  }
}
```

## API Reference

### `createPluginTester(testContext)`

Creates a plugin tester utility for a specific test suite.

**Parameters:**
- `testContext` (import('node:test').TestContext): The context from `test((t) => ...)`

**Returns:** A `PluginTester` object with the following methods:

#### `spy(alias, plugin)`

Hijacks the plugin but executes the real logic. The plugin behaves normally (returns real values, update state), but all calls are tracked in `.observe`.

**Parameters:**
- `alias` (string): Alias for the test (e.g., 'auth', 'user')
- `plugin` (Object): The real plugin imported from core

**Returns:** The observable instance

**Example:**
```javascript
const plugin = tester.spy('user', userPlugin)
const result = plugin.userGetName()
// Real method executes, but call is tracked
```

#### `mock(alias, plugin)`

Hijacks the plugin and silences the real logic. The real implementation is replaced with a no-op (returns undefined), preventing side effects (network calls, DB writes, etc.).

**Parameters:**
- `alias` (string): Alias for the test
- `plugin` (Object): The real plugin

**Returns:** The observable instance with silenced methods

**Example:**
```javascript
const plugin = tester.mock('api', apiPlugin)
const result = plugin.apiFetchData()
// Returns undefined, no network call made
```

#### `restoreAll()`

Restores all hijacked plugins to their original state. Call this in `test.afterEach()` to prevent test pollution.

**Returns:** void

**Example:**
```javascript
test.afterEach(() => {
  tester.restoreAll()
})
```

#### `plugins`

Access registered observables by key.

**Example:**
```javascript
// Check call count for 'auth' plugin's 'login' action
assert.equal(tester.plugins.auth.observe.login.mock.callCount(), 1)
```

## Testing Modes

### Spy Mode

Use `spy()` when you want to:
- Execute real plugin logic
- Track method calls and arguments
- Verify state changes
- Test integration between methods

**When to use:**
- Testing method implementations
- Verifying state updates
- Testing plugin behavior with real logic
- Integration testing

**Example:**
```javascript
it('should increment counter', async (t) => {
  const tester = createPluginTester(t)
  const counter = tester.spy('counter', counterPlugin)
  
  const result = counter.counterIncrement()
  
  strictEqual(result, 1)
  strictEqual(counter.counterGetCount(), 1)
  
  tester.restoreAll()
})
```

### Mock Mode

Use `mock()` when you want to:
- Prevent side effects (network calls, file I/O)
- Test error conditions
- Isolate specific behavior
- Control return values

**When to use:**
- Testing error handling
- Preventing external API calls
- Testing conditional logic
- Isolating specific functionality

**Example:**
```javascript
it('should handle API failure', async (t) => {
  const tester = createPluginTester(t)
  const api = tester.mock('api', apiPlugin)
  
  // Mock the fetch method to throw an error
  api.observe.fetch.mock.mockImplementation(() => {
    throw new Error('Network error')
  })
  
  const result = api.apiFetchData()
  
  strictEqual(result, undefined)
  
  tester.restoreAll()
})
```

### Comparison Table

| Feature | Spy Mode | Mock Mode |
|---------|----------|-----------|
| **Real Logic** | Executes | Silenced |
| **Side Effects** | Allowed | Prevented |
| **Return Values** | Real values | Undefined (or mocked) |
| **Use Case** | Integration testing | Unit testing |
| **Performance** | Slower (real execution) | Faster (no-op) |
| **State Changes** | Applied | Not applied |

## Common Testing Patterns

### 1. Simple Method Testing

Test a single method with direct input and output:

```javascript
import { describe, it } from 'node:test'
import { strictEqual } from 'node:assert'
import { createPluginTester } from '@dooksa/test'
import { string } from '#core'

describe('String plugin - replace action', () => {
  it('should replace single character', async (t) => {
    const tester = createPluginTester(t)
    const stringPlugin = tester.spy('string', string)

    const result = stringPlugin.stringReplace({
      value: '111',
      pattern: '1',
      replacement: '0'
    })

    strictEqual(result, '011')

    tester.restoreAll()
  })
})
```

### 2. State-Based Testing

Test plugins that interact with state:

```javascript
import { describe, it } from 'node:test'
import { strictEqual } from 'node:assert'
import { createPluginTester, mockStateData } from '@dooksa/test'
import { variable, state } from '#core'

describe('Variable plugin - getValue action', () => {
  it('should get value from specific scope', async (t) => {
    const tester = createPluginTester(t)
    
    // Setup dependencies
    const statePlugin = tester.spy('state', state)
    const variablePlugin = tester.spy('variable', variable)
    
    // Setup mock state data
    const stateData = mockStateData([variable])
    statePlugin.setup(stateData)
    
    // Seed state
    statePlugin.stateSetValue({
      name: 'variable/values',
      value: {
        'test-var': 'test-value'
      },
      options: {
        id: 'scope-1'
      }
    })
    
    // Test the method
    const result = variablePlugin.variableGetValue({
      scope: 'scope-1',
      query: 'test-var'
    }, { context: {} })
    
    strictEqual(result, 'test-value')
    
    tester.restoreAll()
  })
})
```

### 3. Testing with Dependencies

Test plugins that depend on other plugins:

```javascript
import { describe, it } from 'node:test'
import { strictEqual } from 'node:assert'
import { createPluginTester, mockStateData } from '@dooksa/test'
import { action, state, api } from '#core'

describe('Action plugin - dispatch', () => {
  it('should dispatch action with dependencies', async (t) => {
    const tester = createPluginTester(t)
    
    // Setup all required plugins
    const statePlugin = tester.spy('state', state)
    const actionPlugin = tester.spy('action', action)
    const apiPlugin = tester.spy('api', api)
    
    // Setup mock state data
    const stateData = mockStateData([action])
    statePlugin.setup(stateData)
    
    // Setup API
    apiPlugin.setup({ hostname: 'http://localhost:3000' })
    
    // Setup action plugin with actions
    actionPlugin.setup({
      actions: {
        test_action: (params, context) => params.value
      }
    })
    
    // Test the action
    const result = await actionPlugin.actionDispatch({
      id: 'test-action',
      context: {},
      payload: { value: 'hello' }
    })
    
    strictEqual(result, 'hello')
    
    tester.restoreAll()
  })
})
```

### 4. Testing Async Operations

Test asynchronous plugin methods:

```javascript
import { describe, it } from 'node:test'
import { strictEqual } from 'node:assert'
import { createPluginTester } from '@dooksa/test'
import { api } from '#core'

describe('API plugin - fetch', () => {
  it('should fetch data asynchronously', async (t) => {
    const tester = createPluginTester(t)
    const apiPlugin = tester.spy('api', api)
    
    apiPlugin.setup({ hostname: 'http://localhost:3000' })
    
    // Mock the fetch method
    apiPlugin.observe.fetch.mock.mockImplementation(async () => {
      return { data: 'test-data' }
    })
    
    const result = await apiPlugin.apiFetch('/test')
    
    strictEqual(result.data, 'test-data')
    
    tester.restoreAll()
  })
})
```

### 5. Testing Conditional Logic

Test if/else branches and conditional execution:

```javascript
import { describe, it } from 'node:test'
import { strictEqual } from 'node:assert'
import { createPluginTester } from '@dooksa/test'
import { action } from '#core'

describe('Action plugin - conditional logic', () => {
  it('should execute then branch for true condition', async (t) => {
    const tester = createPluginTester(t)
    const actionPlugin = tester.spy('action', action)
    
    // Mock action methods
    const handleActive = t.mock.fn(() => true)
    const handleInactive = t.mock.fn(() => false)
    
    actionPlugin.setup({
      actions: {
        handleActive,
        handleInactive
      }
    })
    
    // Test conditional execution
    // (Assuming actionDispatch handles ifElse logic)
    await actionPlugin.actionDispatch({
      id: 'ifelse-test',
      context: {},
      payload: { condition: true }
    })
    
    // Verify correct branch executed
    strictEqual(handleActive.mock.callCount(), 1)
    strictEqual(handleInactive.mock.callCount(), 0)
    
    tester.restoreAll()
  })
})
```

## State Seeding & Management

### Using `mockStateData`

The `mockStateData` helper creates initial state data for plugins:

```javascript
import { mockStateData } from '@dooksa/test'
import { myPlugin, dependencyPlugin } from '#core'

// Create mock state data for multiple plugins
const stateData = mockStateData([myPlugin, dependencyPlugin])

// Setup plugins with mock state
statePlugin.setup(stateData)
```

### Seeding State in Tests

Seed state before testing plugin methods:

```javascript
it('should get value from state', async (t) => {
  const tester = createPluginTester(t)
  const statePlugin = tester.spy('state', state)
  const myPlugin = tester.spy('myPlugin', myPlugin)
  
  // Setup mock state data
  const stateData = mockStateData([myPlugin])
  statePlugin.setup(stateData)
  
  // Seed state with test data
  statePlugin.stateSetValue({
    name: 'myPlugin/data',
    value: {
      'item-1': 'value-1',
      'item-2': 'value-2'
    },
    options: { id: 'scope-1' }
  })
  
  // Test plugin method that reads from state
  const result = myPlugin.myPluginGetValue({
    scope: 'scope-1',
    query: 'item-1'
  })
  
  strictEqual(result, 'value-1')
  
  tester.restoreAll()
})
```

### State Seeding Strategies

#### 1. Direct State Seeding

For simple state structures:

```javascript
statePlugin.stateSetValue({
  name: 'variable/values',
  value: {
    'var-1': 'value-1',
    'var-2': 'value-2'
  },
  options: { id: 'scope-1' }
})
```

#### 2. Array-Based Seeding

For multiple items in the same collection:

```javascript
const state = [
  { collection: 'variable/values', item: { 'var-1': 'value-1' } },
  { collection: 'variable/values', item: { 'var-2': 'value-2' } }
]

state.forEach(({ collection, item }) => {
  statePlugin.stateSetValue({
    name: collection,
    value: item,
    options: { id: Object.keys(item)[0] }
  })
})
```

#### 3. Complex Nested State

For deeply nested state structures:

```javascript
statePlugin.stateSetValue({
  name: 'user/profile',
  value: {
    'user-123': {
      name: 'John Doe',
      email: 'john@example.com',
      settings: {
        theme: 'dark',
        notifications: true
      }
    }
  },
  options: { id: 'scope-1' }
})
```

### Verifying State Changes

Verify that state was updated correctly:

```javascript
it('should update state correctly', async (t) => {
  const tester = createPluginTester(t)
  const statePlugin = tester.spy('state', state)
  const myPlugin = tester.spy('myPlugin', myPlugin)
  
  // Setup mock state data
  const stateData = mockStateData([myPlugin])
  statePlugin.setup(stateData)
  
  // Call method that updates state
  await myPlugin.myPluginSetValue({
    scope: 'scope-1',
    values: [{ id: 'var-1', value: 'new-value' }]
  })
  
  // Verify state was updated
  const stateValue = statePlugin.stateGetValue({
    name: 'myPlugin/values',
    id: 'scope-1'
  })
  
  strictEqual(stateValue.item['var-1'], 'new-value')
  
  tester.restoreAll()
})
```

## Mocking Methods

### Using `t.mock.fn()`

Create mock functions using Node.js test context:

```javascript
it('should call mocked method', async (t) => {
  const tester = createPluginTester(t)
  const plugin = tester.spy('myPlugin', myPlugin)
  
  // Create a mock function
  const mockMethod = t.mock.fn(() => 'mocked result')
  
  // Replace plugin method with mock
  plugin.setup({
    actions: {
      myAction: mockMethod
    }
  })
  
  // Call the action
  const result = plugin.myPluginMyAction()
  
  // Verify mock was called
  strictEqual(mockMethod.mock.callCount(), 1)
  strictEqual(result, 'mocked result')
  
  tester.restoreAll()
})
```

### Mocking with Custom Implementation

Replace method implementation for testing:

```javascript
it('should handle error condition', async (t) => {
  const tester = createPluginTester(t)
  const plugin = tester.spy('myPlugin', myPlugin)
  
  // Mock method to throw error
  plugin.observe.myMethod.mock.mockImplementation(() => {
    throw new Error('Test error')
  })
  
  // Test error handling
  try {
    plugin.myPluginMyMethod()
    // Should not reach here
    strictEqual(true, false)
  } catch (error) {
    strictEqual(error.message, 'Test error')
  }
  
  tester.restoreAll()
})
```

### Mocking Return Values

Control what mocked methods return:

```javascript
it('should return mocked value', async (t) => {
  const tester = createPluginTester(t)
  const plugin = tester.spy('myPlugin', myPlugin)
  
  // Mock method to return specific value
  plugin.observe.myMethod.mock.mockImplementation(() => {
    return 'mocked-value'
  })
  
  const result = plugin.myPluginMyMethod()
  
  strictEqual(result, 'mocked-value')
  
  tester.restoreAll()
})
```

### Mocking Async Methods

Mock asynchronous methods:

```javascript
it('should handle async mock', async (t) => {
  const tester = createPluginTester(t)
  const plugin = tester.spy('myPlugin', myPlugin)
  
  // Mock async method
  plugin.observe.fetchData.mock.mockImplementation(async () => {
    return { data: 'async-data' }
  })
  
  const result = await plugin.myPluginFetchData()
  
  strictEqual(result.data, 'async-data')
  
  tester.restoreAll()
})
```

## Verification & Assertions

### Checking Method Calls

Verify that methods were called:

```javascript
it('should call method once', async (t) => {
  const tester = createPluginTester(t)
  const plugin = tester.spy('myPlugin', myPlugin)
  
  plugin.myPluginMyMethod()
  
  // Check call count
  strictEqual(plugin.observe.myMethod.mock.callCount(), 1)
  
  tester.restoreAll()
})
```

### Checking Call Arguments

Verify method was called with correct arguments:

```javascript
it('should call method with correct arguments', async (t) => {
  const tester = createPluginTester(t)
  const plugin = tester.spy('myPlugin', myPlugin)
  
  plugin.myPluginMyMethod('arg1', 'arg2')
  
  // Check arguments of first call
  const firstCall = plugin.observe.myMethod.mock.calls[0]
  strictEqual(firstCall.arguments[0], 'arg1')
  strictEqual(firstCall.arguments[1], 'arg2')
  
  tester.restoreAll()
})
```

### Checking Return Values

Verify method returns expected values:

```javascript
it('should return expected value', async (t) => {
  const tester = createPluginTester(t)
  const plugin = tester.spy('myPlugin', myPlugin)
  
  const result = plugin.myPluginMyMethod()
  
  strictEqual(result, 'expected-value')
  
  tester.restoreAll()
})
```

### Checking State Values

Verify state was updated correctly:

```javascript
it('should update state correctly', async (t) => {
  const tester = createPluginTester(t)
  const statePlugin = tester.spy('state', state)
  const plugin = tester.spy('myPlugin', myPlugin)
  
  // Setup and seed state
  const stateData = mockStateData([plugin])
  statePlugin.setup(stateData)
  
  // Call method that updates state
  plugin.myPluginUpdateValue('new-value')
  
  // Verify state
  const stateValue = statePlugin.stateGetValue({
    name: 'myPlugin/value',
    id: 'scope-1'
  })
  
  strictEqual(stateValue.item, 'new-value')
  
  tester.restoreAll()
})
```

### Checking Mock Results

Verify mock execution results:

```javascript
it('should execute mock correctly', async (t) => {
  const tester = createPluginTester(t)
  const plugin = tester.spy('myPlugin', myPlugin)
  
  const mockMethod = t.mock.fn(() => 'result')
  plugin.setup({
    actions: {
      myAction: mockMethod
    }
  })
  
  plugin.myPluginMyAction()
  
  // Check mock results
  strictEqual(mockMethod.mock.results.length, 1)
  strictEqual(mockMethod.mock.results[0].type, 'return')
  strictEqual(mockMethod.mock.results[0].value, 'result')
  
  tester.restoreAll()
})
```

## Testing Scenarios

### 1. Basic Method Testing

Test simple method with input/output:

```javascript
describe('String plugin - replace', () => {
  it('should replace text', async (t) => {
    const tester = createPluginTester(t)
    const stringPlugin = tester.spy('string', string)
    
    const result = stringPlugin.stringReplace({
      value: 'hello world',
      pattern: 'world',
      replacement: 'universe'
    })
    
    strictEqual(result, 'hello universe')
    
    tester.restoreAll()
  })
})
```

### 2. State Management Testing

Test state reading and writing:

```javascript
describe('Variable plugin - scope access', () => {
  it('should get value from specific scope', async (t) => {
    const tester = createPluginTester(t)
    const statePlugin = tester.spy('state', state)
    const variablePlugin = tester.spy('variable', variable)
    
    // Setup mock state data
    const stateData = mockStateData([variable])
    statePlugin.setup(stateData)
    
    // Seed state
    statePlugin.stateSetValue({
      name: 'variable/values',
      value: { 'test-var': 'test-value' },
      options: { id: 'scope-1' }
    })
    
    // Test method
    const result = variablePlugin.variableGetValue({
      scope: 'scope-1',
      query: 'test-var'
    }, { context: {} })
    
    strictEqual(result, 'test-value')
    
    tester.restoreAll()
  })
})
```

### 3. Action Dispatch Testing

Test action dispatch with sequences:

```javascript
describe('Action plugin - dispatch', () => {
  it('should dispatch action with sequence', async (t) => {
    const tester = createPluginTester(t)
    const statePlugin = tester.spy('state', state)
    const actionPlugin = tester.spy('action', action)
    
    // Setup mock state data
    const stateData = mockStateData([action])
    statePlugin.setup(stateData)
    
    // Seed action sequence
    statePlugin.stateSetValue({
      name: 'action/sequences',
      value: {
        'test-action': [
          {
            $id: 'step1',
            action_testMethod: { value: 'test' }
          }
        ]
      },
      options: { replace: true }
    })
    
    // Setup action method
    actionPlugin.setup({
      actions: {
        action_testMethod: (params) => params.value
      }
    })
    
    // Dispatch action
    const result = await actionPlugin.actionDispatch({
      id: 'test-action',
      context: {},
      payload: {}
    })
    
    strictEqual(result, 'test')
    
    tester.restoreAll()
  })
})
```

### 4. Error Handling Testing

Test error conditions:

```javascript
describe('Plugin - error handling', () => {
  it('should throw error for invalid input', async (t) => {
    const tester = createPluginTester(t)
    const plugin = tester.spy('myPlugin', myPlugin)
    
    // Mock method to throw error
    plugin.observe.myMethod.mock.mockImplementation(() => {
      throw new Error('Invalid input')
    })
    
    // Test error handling
    try {
      plugin.myPluginMyMethod()
      // Should not reach here
      strictEqual(true, false)
    } catch (error) {
      strictEqual(error.message, 'Invalid input')
    }
    
    tester.restoreAll()
  })
})
```

### 5. Async Operation Testing

Test asynchronous operations:

```javascript
describe('API plugin - async operations', () => {
  it('should fetch data asynchronously', async (t) => {
    const tester = createPluginTester(t)
    const apiPlugin = tester.spy('api', api)
    
    // Mock async fetch
    apiPlugin.observe.fetch.mock.mockImplementation(async () => {
      return { data: 'async-data' }
    })
    
    const result = await apiPlugin.apiFetch('/test')
    
    strictEqual(result.data, 'async-data')
    
    tester.restoreAll()
  })
})
```

### 6. Conditional Logic Testing

Test if/else branches:

```javascript
describe('Action plugin - conditional logic', () => {
  it('should execute correct branch', async (t) => {
    const tester = createPluginTester(t)
    const actionPlugin = tester.spy('action', action)
    
    const handleTrue = t.mock.fn(() => 'true-branch')
    const handleFalse = t.mock.fn(() => 'false-branch')
    
    actionPlugin.setup({
      actions: {
        handleTrue,
        handleFalse
      }
    })
    
    // Test true branch
    await actionPlugin.actionDispatch({
      id: 'ifelse-true',
      context: {},
      payload: { condition: true }
    })
    
    strictEqual(handleTrue.mock.callCount(), 1)
    strictEqual(handleFalse.mock.callCount(), 0)
    
    tester.restoreAll()
  })
})
```

### 7. Edge Cases Testing

Test edge cases and boundary conditions:

```javascript
describe('Variable plugin - edge cases', () => {
  it('should handle empty scope', async (t) => {
    const tester = createPluginTester(t)
    const statePlugin = tester.spy('state', state)
    const variablePlugin = tester.spy('variable', variable)
    
    const stateData = mockStateData([variable])
    statePlugin.setup(stateData)
    
    // Seed empty scope
    statePlugin.stateSetValue({
      name: 'variable/values',
      value: {},
      options: { id: 'empty-scope' }
    })
    
    const result = variablePlugin.variableGetValue({
      scope: 'empty-scope',
      query: 'any-var'
    }, { context: {} })
    
    strictEqual(result, undefined)
    
    tester.restoreAll()
  })
  
  it('should handle null values', async (t) => {
    const tester = createPluginTester(t)
    const statePlugin = tester.spy('state', state)
    const variablePlugin = tester.spy('variable', variable)
    
    const stateData = mockStateData([variable])
    statePlugin.setup(stateData)
    
    // Seed null value
    statePlugin.stateSetValue({
      name: 'variable/values',
      value: { 'null-var': null },
      options: { id: 'scope-1' }
    })
    
    const result = variablePlugin.variableGetValue({
      scope: 'scope-1',
      query: 'null-var'
    }, { context: {} })
    
    strictEqual(result, null)
    
    tester.restoreAll()
  })
})
```

### 8. Integration Testing

Test multiple plugins working together:

```javascript
describe('Integration - user authentication', () => {
  it('should authenticate user with dependencies', async (t) => {
    const tester = createPluginTester(t)
    
    // Setup all required plugins
    const statePlugin = tester.spy('state', state)
    const authPlugin = tester.spy('auth', auth)
    const apiPlugin = tester.spy('api', api)
    
    // Setup mock state data
    const stateData = mockStateData([auth])
    statePlugin.setup(stateData)
    
    // Setup API
    apiPlugin.setup({ hostname: 'http://localhost:3000' })
    
    // Mock API response
    apiPlugin.observe.fetch.mock.mockImplementation(async () => {
      return { token: 'test-token', user: { id: 1, name: 'John' } }
    })
    
    // Test authentication
    const result = await authPlugin.authLogin({
      username: 'john',
      password: 'secret'
    })
    
    strictEqual(result.token, 'test-token')
    strictEqual(result.user.name, 'John')
    
    tester.restoreAll()
  })
})
```

## Best Practices

### 1. Always Use Setup Helpers

Create reusable setup functions for complex plugins:

```javascript
function setupPlugin (t, options = { state: [] }) {
  const tester = createPluginTester(t)
  const statePlugin = tester.spy('state', state)
  const mainPlugin = tester.spy('myPlugin', myPlugin)
  
  const stateData = mockStateData([myPlugin])
  statePlugin.setup(stateData)
  
  // Seed state if provided
  if (options.state) {
    options.state.forEach(({ collection, item }) => {
      statePlugin.stateSetValue({
        name: collection,
        value: item,
        options: { id: Object.keys(item)[0] }
      })
    })
  }
  
  return { tester, mainPlugin, statePlugin }
}
```

### 2. Always Clean Up

Call `restoreAll()` after each test:

```javascript
it('should test plugin', async (t) => {
  const tester = createPluginTester(t)
  const plugin = tester.spy('myPlugin', myPlugin)
  
  // Test code...
  
  tester.restoreAll() // Always clean up
})
```

Use `test.afterEach()` for automatic cleanup:

```javascript
describe('My Plugin', () => {
  let tester
  
  test.afterEach(() => {
    if (tester) {
      tester.restoreAll()
    }
  })
  
  it('should test plugin', async (t) => {
    tester = createPluginTester(t)
    const plugin = tester.spy('myPlugin', myPlugin)
    
    // Test code...
  })
})
```

### 3. Use Descriptive Test Names

Make test names clear and descriptive:

```javascript
// Good
it('should get value from specific scope', async (t) => { ... })
it('should handle empty scopes array', async (t) => { ... })
it('should apply prefix and suffix to query', async (t) => { ... })

// Avoid
it('test 1', async (t) => { ... })
it('test 2', async (t) => { ... })
```

### 4. Test One Thing Per Test

Keep tests focused on a single behavior:

```javascript
// Good - separate tests for different behaviors
it('should replace single character', async (t) => { ... })
it('should replace multiple characters', async (t) => { ... })
it('should handle empty pattern', async (t) => { ... })

// Avoid - testing multiple things in one test
it('should handle various replacement scenarios', async (t) => {
  // Tests single char, multiple chars, empty pattern, etc.
})
```

### 5. Use Spy for Integration Tests

Use `spy()` when testing real logic and state changes:

```javascript
it('should update state correctly', async (t) => {
  const tester = createPluginTester(t)
  const plugin = tester.spy('myPlugin', myPlugin)
  
  // Real logic executes, state is updated
  plugin.myPluginUpdateValue('new-value')
  
  // Verify state was updated
  strictEqual(plugin.myPluginGetValue(), 'new-value')
  
  tester.restoreAll()
})
```

### 6. Use Mock for Unit Tests

Use `mock()` when testing isolated behavior:

```javascript
it('should handle API error', async (t) => {
  const tester = createPluginTester(t)
  const api = tester.mock('api', apiPlugin)
  
  // Mock to throw error
  api.observe.fetch.mock.mockImplementation(() => {
    throw new Error('Network error')
  })
  
  // Test error handling without making real network calls
  const result = api.apiFetchData()
  
  strictEqual(result, undefined)
  
  tester.restoreAll()
})
```

### 7. Seed State Before Testing

Always seed state before testing state-dependent methods:

```javascript
it('should get value from state', async (t) => {
  const tester = createPluginTester(t)
  const statePlugin = tester.spy('state', state)
  const plugin = tester.spy('myPlugin', myPlugin)
  
  // Seed state first
  statePlugin.stateSetValue({
    name: 'myPlugin/data',
    value: { 'key': 'value' },
    options: { id: 'scope-1' }
  })
  
  // Then test method that reads from state
  const result = plugin.myPluginGetValue({ scope: 'scope-1', query: 'key' })
  
  strictEqual(result, 'value')
  
  tester.restoreAll()
})
```

### 8. Verify Mock Calls

Check that mocked methods were called correctly:

```javascript
it('should call method with correct arguments', async (t) => {
  const tester = createPluginTester(t)
  const plugin = tester.spy('myPlugin', myPlugin)
  
  const mockMethod = t.mock.fn(() => 'result')
  plugin.setup({
    actions: {
      myAction: mockMethod
    }
  })
  
  plugin.myPluginMyAction('arg1', 'arg2')
  
  // Verify call count
  strictEqual(mockMethod.mock.callCount(), 1)
  
  // Verify arguments
  const firstCall = mockMethod.mock.calls[0]
  strictEqual(firstCall.arguments[0], 'arg1')
  strictEqual(firstCall.arguments[1], 'arg2')
  
  tester.restoreAll()
})
```

### 9. Test Edge Cases

Don't forget to test edge cases:

```javascript
describe('Edge cases', () => {
  it('should handle empty string', async (t) => { ... })
  it('should handle null values', async (t) => { ... })
  it('should handle undefined values', async (t) => { ... })
  it('should handle missing properties', async (t) => { ... })
  it('should handle empty arrays', async (t) => { ... })
})
```

### 10. Use Descriptive Assertions

Use clear assertion messages:

```javascript
// Good
strictEqual(result, 'expected-value', 'Should return expected value')
strictEqual(callCount, 1, 'Method should be called once')

// Avoid
strictEqual(result, 'expected-value')
strictEqual(callCount, 1)
```

## Troubleshooting

### Common Issues

#### 1. Test Pollution

**Problem:** State from one test affects another test.

**Solution:** Always call `tester.restoreAll()` after each test.

```javascript
it('should test plugin', async (t) => {
  const tester = createPluginTester(t)
  const plugin = tester.spy('myPlugin', myPlugin)
  
  // Test code...
  
  tester.restoreAll() // Clean up state
})
```

#### 2. Mock Not Working

**Problem:** Mock implementation doesn't seem to be called.

**Solution:** Ensure you're mocking the correct method and using the observable instance.

```javascript
// Correct - mock on observable instance
plugin.observe.myMethod.mock.mockImplementation(() => 'mocked')

// Incorrect - trying to mock directly
plugin.myMethod = () => 'mocked' // This won't work
```

#### 3. State Not Updated

**Problem:** State changes aren't reflected in tests.

**Solution:** Ensure you're using `spy()` mode and that state plugin is properly set up.

```javascript
// Correct - use spy mode
const statePlugin = tester.spy('state', state)
const plugin = tester.spy('myPlugin', myPlugin)

// Setup mock state data
const stateData = mockStateData([plugin])
statePlugin.setup(stateData)
```

#### 4. Dependencies Not Available

**Problem:** Plugin methods fail because dependencies aren't set up.

**Solution:** Create observable instances of all required dependencies.

```javascript
const tester = createPluginTester(t)

// Setup all required plugins
const dep1 = tester.spy('dep1', dependency1)
const dep2 = tester.spy('dep2', dependency2)
const mainPlugin = tester.spy('main', mainPlugin)

// Setup dependencies
dep1.setup()
dep2.setup()
```

#### 5. Async Tests Not Waiting

**Problem:** Async tests complete before assertions run.

**Solution:** Use `async/await` properly and ensure promises are awaited.

```javascript
// Correct
it('should test async', async (t) => {
  const tester = createPluginTester(t)
  const plugin = tester.spy('myPlugin', myPlugin)
  
  const result = await plugin.myAsyncMethod()
  
  strictEqual(result, 'expected')
  
  tester.restoreAll()
})

// Incorrect - missing await
it('should test async', async (t) => {
  const tester = createPluginTester(t)
  const plugin = tester.spy('myPlugin', myPlugin)
  
  const result = plugin.myAsyncMethod() // Missing await
  
  strictEqual(result, 'expected') // Will fail
  
  tester.restoreAll()
})
```

#### 6. Mock Call Count Wrong

**Problem:** Mock call count is different than expected.

**Solution:** Check that you're checking the correct mock and that tests are isolated.

```javascript
// Verify you're checking the right mock
strictEqual(mockMethod.mock.callCount(), 1)

// Check all calls
console.log(mockMethod.mock.calls) // Inspect all calls
```

#### 7. Restore Not Working

**Problem:** Plugin state isn't reset between tests.

**Solution:** Ensure `restoreAll()` is called and check for test pollution.

```javascript
// Use afterEach for automatic cleanup
test.afterEach(() => {
  tester.restoreAll()
})
```

### Debugging Tips

#### 1. Inspect Mock Calls

```javascript
console.log('Call count:', mockMethod.mock.callCount())
console.log('All calls:', mockMethod.mock.calls)
console.log('All results:', mockMethod.mock.results)
```

#### 2. Inspect State

```javascript
const stateValue = statePlugin.stateGetValue({
  name: 'myPlugin/data',
  id: 'scope-1'
})
console.log('State value:', stateValue)
```

#### 3. Check Observable State

```javascript
console.log('Method called:', plugin.observe.myMethod.mock.callCount())
console.log('Method arguments:', plugin.observe.myMethod.mock.calls)
```

#### 4. Verify Plugin Setup

```javascript
console.log('Plugin methods:', Object.keys(plugin))
console.log('Observable methods:', Object.keys(plugin.observe))
```

### Error Messages

#### "Cannot read property 'mock' of undefined"

**Cause:** Trying to access mock on a method that doesn't exist.

**Solution:** Check method name and ensure plugin is properly set up.

```javascript
// Check available methods
console.log('Available methods:', Object.keys(plugin.observe))

// Ensure method exists before mocking
if (plugin.observe.myMethod) {
  plugin.observe.myMethod.mock.mockImplementation(...)
}
```

#### "State not found"

**Cause:** State plugin not properly set up or state not seeded.

**Solution:** Ensure state plugin is created with `spy()` and mock state data is set up.

```javascript
const statePlugin = tester.spy('state', state)
const stateData = mockStateData([myPlugin])
statePlugin.setup(stateData)
```

#### "Plugin not restored"

**Cause:** Tests are polluting each other's state.

**Solution:** Always call `restoreAll()` after each test.

```javascript
test.afterEach(() => {
  tester.restoreAll()
})
```

## Complete Examples

### Example 1: Testing a Simple Plugin

```javascript
import { describe, it } from 'node:test'
import { strictEqual } from 'node:assert'
import { createPluginTester } from '@dooksa/test'
import { string } from '#core'

describe('String Plugin Tests', () => {
  let tester
  
  test.afterEach(() => {
    if (tester) {
      tester.restoreAll()
    }
  })
  
  describe('stringReplace', () => {
    it('should replace single character', async (t) => {
      tester = createPluginTester(t)
      const stringPlugin = tester.spy('string', string)
      
      const result = stringPlugin.stringReplace({
        value: '111',
        pattern: '1',
        replacement: '0'
      })
      
      strictEqual(result, '011')
    })
    
    it('should replace multiple characters', async (t) => {
      tester = createPluginTester(t)
      const stringPlugin = tester.spy('string', string)
      
      const result = stringPlugin.stringReplace({
        value: 'hello world',
        pattern: 'world',
        replacement: 'universe'
      })
      
      strictEqual(result, 'hello universe')
    })
    
    it('should handle empty pattern', async (t) => {
      tester = createPluginTester(t)
      const stringPlugin = tester.spy('string', string)
      
      const result = stringPlugin.stringReplace({
        value: 'hello',
        pattern: '',
        replacement: 'X'
      })
      
      strictEqual(result, 'Xhello')
    })
  })
})
```

### Example 2: Testing State-Dependent Plugin

```javascript
import { describe, it } from 'node:test'
import { strictEqual, deepStrictEqual } from 'node:assert'
import { createPluginTester, mockStateData } from '@dooksa/test'
import { variable, state } from '#core'

describe('Variable Plugin Tests', () => {
  let tester
  
  test.afterEach(() => {
    if (tester) {
      tester.restoreAll()
    }
  })
  
  function setupVariablePlugin (t, options = { state: [] }) {
    tester = createPluginTester(t)
    
    const statePlugin = tester.spy('state', state)
    const variablePlugin = tester.spy('variable', variable)
    
    const stateData = mockStateData([variable])
    statePlugin.setup(stateData)
    
    if (options.state) {
      options.state.forEach(({ collection, item }) => {
        if (Array.isArray(item)) {
          item.forEach((data, index) => {
            statePlugin.stateSetValue({
              name: collection,
              value: data,
              options: { id: Object.keys(data)[0] }
            })
          })
        } else {
          statePlugin.stateSetValue({
            name: collection,
            value: item
          })
        }
      })
    }
    
    return { tester, variablePlugin, statePlugin }
  }
  
  describe('variableGetValue', () => {
    it('should get value from specific scope', async (t) => {
      const { tester, variablePlugin, statePlugin } = setupVariablePlugin(t)
      
      statePlugin.stateSetValue({
        name: 'variable/values',
        value: {
          'test-var': 'test-value'
        },
        options: {
          id: 'scope-1'
        }
      })
      
      const result = variablePlugin.variableGetValue({
        scope: 'scope-1',
        query: 'test-var'
      }, { context: {} })
      
      strictEqual(result, 'test-value')
    })
    
    it('should get nested value using dot notation', async (t) => {
      const { tester, variablePlugin, statePlugin } = setupVariablePlugin(t)
      
      statePlugin.stateSetValue({
        name: 'variable/values',
        value: {
          user: {
            profile: {
              name: 'John Doe'
            }
          }
        },
        options: {
          id: 'scope-1'
        }
      })
      
      const result = variablePlugin.variableGetValue({
        scope: 'scope-1',
        query: 'user.profile.name'
      }, { context: {} })
      
      strictEqual(result, 'John Doe')
    })
    
    it('should handle empty scope', async (t) => {
      const { tester, variablePlugin, statePlugin } = setupVariablePlugin(t)
      
      statePlugin.stateSetValue({
        name: 'variable/values',
        value: {},
        options: {
          id: 'empty-scope'
        }
      })
      
      const result = variablePlugin.variableGetValue({
        scope: 'empty-scope',
        query: 'any-var'
      }, { context: {} })
      
      strictEqual(result, undefined)
    })
  })
  
  describe('variableSetValue', () => {
    it('should set value in specific scope', async (t) => {
      const { tester, variablePlugin, statePlugin } = setupVariablePlugin(t)
      
      await variablePlugin.variableSetValue({
        scope: 'scope-1',
        values: [
          {
            id: 'var-1',
            value: 'test-value'
          }
        ]
      }, { context: { id: 'component-1' } })
      
      const values = statePlugin.stateGetValue({
        name: 'variable/values',
        id: 'scope-1'
      })
      
      strictEqual(values.item['var-1'], 'test-value')
    })
    
    it('should generate ID automatically', async (t) => {
      const { tester, variablePlugin, statePlugin } = setupVariablePlugin(t)
      
      statePlugin.stateSetValue({
        name: 'variable/values',
        value: {},
        options: {
          id: 'scope-1',
          replace: true
        }
      })
      
      await variablePlugin.variableSetValue({
        scope: 'scope-1',
        values: [
          {
            value: 'auto-generated-value'
          }
        ]
      }, { context: { id: 'component-1' } })
      
      const values = statePlugin.stateGetValue({
        name: 'variable/values',
        id: 'scope-1'
      })
      
      const keys = Object.keys(values.item)
      strictEqual(keys.length, 1)
      strictEqual(values.item[keys[0]], 'auto-generated-value')
    })
  })
})
```

### Example 3: Testing Action Dispatch

```javascript
import { describe, it } from 'node:test'
import { strictEqual } from 'node:assert'
import { createPluginTester, mockStateData } from '@dooksa/test'
import { createAction } from '@dooksa/create-action'
import { action, state, api } from '#core'

describe('Action Plugin Tests', () => {
  let tester
  
  test.afterEach(() => {
    if (tester) {
      tester.restoreAll()
    }
  })
  
  function setupActionPlugin (t, options = {
    actions: {},
    lazyLoadAction: () => {},
    state: []
  }) {
    tester = createPluginTester(t)
    
    const statePlugin = tester.spy('state', state)
    const actionPlugin = tester.spy('action', action)
    const apiPlugin = tester.spy('api', api)
    
    const stateData = mockStateData([action])
    statePlugin.setup(stateData)
    
    const defaultActions = {}
    
    for (let i = 0; i < actionPlugin.actions.length; i++) {
      const action = actionPlugin.actions[i]
      defaultActions[action.name] = action.method
    }
    
    for (let i = 0; i < apiPlugin.actions.length; i++) {
      const action = apiPlugin.actions[i]
      defaultActions[action.name] = action.method
    }
    
    for (let i = 0; i < statePlugin.actions.length; i++) {
      const action = statePlugin.actions[i]
      defaultActions[action.name] = action.method
    }
    
    apiPlugin.setup({ hostname: 'http://localhost:3000' })
    
    actionPlugin.setup({
      actions: {
        ...defaultActions,
        ...options.actions
      },
      lazyLoadAction: options.lazyLoadAction
    })
    
    if (options.state) {
      options.state.forEach(({ collection, item }) => {
        if (Array.isArray(item)) {
          item.forEach((data, index) => {
            statePlugin.stateSetValue({
              name: collection,
              value: data,
              options: { id: Object.keys(data)[0] }
            })
          })
        } else {
          statePlugin.stateSetValue({
            name: collection,
            value: item
          })
        }
      })
    }
    
    return {
      tester,
      actionPlugin,
      statePlugin
    }
  }
  
  function seedActionState (statePlugin, sequences, blocks, blockSequences) {
    if (sequences) {
      statePlugin.stateSetValue({
        name: 'action/sequences',
        value: sequences,
        options: { replace: true }
      })
    }
    
    if (blocks) {
      statePlugin.stateSetValue({
        name: 'action/blocks',
        value: blocks,
        options: { replace: true }
      })
    }
    
    if (blockSequences) {
      statePlugin.stateSetValue({
        name: 'action/blockSequences',
        value: blockSequences,
        options: { replace: true }
      })
    }
  }
  
  describe('actionDispatch', () => {
    it('should dispatch action with simple sequence', async (t) => {
      const actionData = createAction('test-dispatch', [
        {
          $id: 'step1',
          action_dispatch_test: {
            id: 'test-component',
            payload: { value: 'hello' }
          }
        }
      ], { action_dispatch_test: true })
      
      const { tester, actionPlugin, statePlugin } = setupActionPlugin(t)
      
      seedActionState(statePlugin,
        { 'test-dispatch': actionData.sequences },
        actionData.blocks,
        actionData.blockSequences
      )
      
      actionPlugin.setup({
        actions: {
          action_dispatch_test: (params, context) => {
            return { dispatched: params }
          }
        }
      })
      
      const result = await actionPlugin.actionDispatch({
        id: 'test-dispatch',
        context: {
          id: 'ctx-1',
          rootId: 'root-1'
        },
        payload: { data: 'test' }
      })
      
      strictEqual(result.dispatched.id, 'test-component')
      strictEqual(result.dispatched.payload.value, 'hello')
    })
    
    it('should handle conditional logic', async (t) => {
      const actionData = createAction('ifelse-test', [
        {
          action_ifElse: {
            if: [{
              op: '==',
              left: 'active',
              right: 'active'
            }],
            then: [{ $sequenceRef: 'handleActive' }],
            else: [{ $sequenceRef: 'handleInactive' }]
          }
        },
        {
          $id: 'handleActive',
          handleActive: '$null'
        },
        {
          $id: 'handleInactive',
          handleInactive: '$null'
        }
      ], {
        handleActive: true,
        handleInactive: true,
        action_ifElse: true
      })
      
      const handleActiveResult = t.mock.fn(() => true)
      const handleInactiveResult = t.mock.fn(() => false)
      
      const { tester, actionPlugin, statePlugin } = setupActionPlugin(t, {
        actions: {
          handleActive: handleActiveResult,
          handleInactive: handleInactiveResult
        }
      })
      
      seedActionState(statePlugin,
        { 'ifelse-test': actionData.sequences },
        actionData.blocks,
        actionData.blockSequences
      )
      
      await actionPlugin.actionDispatch({
        id: 'ifelse-test',
        context: {},
        payload: {}
      })
      
      strictEqual(handleActiveResult.mock.callCount(), 1)
      strictEqual(handleInactiveResult.mock.callCount(), 0)
    })
  })
})
```

### Example 4: Testing with Mock Mode

```javascript
import { describe, it } from 'node:test'
import { strictEqual } from 'node:assert'
import { createPluginTester } from '@dooksa/test'
import { api } from '#core'

describe('API Plugin Tests (Mock Mode)', () => {
  let tester
  
  test.afterEach(() => {
    if (tester) {
      tester.restoreAll()
    }
  })
  
  describe('apiFetch', () => {
    it('should return mocked data', async (t) => {
      tester = createPluginTester(t)
      const apiPlugin = tester.mock('api', api)
      
      // Mock the fetch method
      apiPlugin.observe.fetch.mock.mockImplementation(async () => {
        return { data: 'mocked-data' }
      })
      
      const result = await apiPlugin.apiFetch('/test')
      
      strictEqual(result.data, 'mocked-data')
    })
    
    it('should handle mocked error', async (t) => {
      tester = createPluginTester(t)
      const apiPlugin = tester.mock('api', api)
      
      // Mock to throw error
      apiPlugin.observe.fetch.mock.mockImplementation(() => {
        throw new Error('Network error')
      })
      
      try {
        await apiPlugin.apiFetch('/test')
        // Should not reach here
        strictEqual(true, false)
      } catch (error) {
        strictEqual(error.message, 'Network error')
      }
    })
    
    it('should verify mock was called', async (t) => {
      tester = createPluginTester(t)
      const apiPlugin = tester.mock('api', api)
      
      // Mock the fetch method
      apiPlugin.observe.fetch.mock.mockImplementation(async () => {
        return { data: 'test' }
      })
      
      await apiPlugin.apiFetch('/test')
      
      // Verify mock was called
      strictEqual(apiPlugin.observe.fetch.mock.callCount(), 1)
      
      // Verify arguments
      const firstCall = apiPlugin.observe.fetch.mock.calls[0]
      strictEqual(firstCall.arguments[0], '/test')
    })
  })
})
```

### Example 5: Testing Edge Cases

```javascript
import { describe, it } from 'node:test'
import { strictEqual, deepStrictEqual, ok } from 'node:assert'
import { createPluginTester, mockStateData } from '@dooksa/test'
import { variable, state } from '#core'

describe('Variable Plugin - Edge Cases', () => {
  let tester
  
  test.afterEach(() => {
    if (tester) {
      tester.restoreAll()
    }
  })
  
  function setupVariablePlugin (t, options = { state: [] }) {
    tester = createPluginTester(t)
    
    const statePlugin = tester.spy('state', state)
    const variablePlugin = tester.spy('variable', variable)
    
    const stateData = mockStateData([variable])
    statePlugin.setup(stateData)
    
    if (options.state) {
      options.state.forEach(({ collection, item }) => {
        if (Array.isArray(item)) {
          item.forEach((data, index) => {
            statePlugin.stateSetValue({
              name: collection,
              value: data,
              options: { id: Object.keys(data)[0] }
            })
          })
        } else {
          statePlugin.stateSetValue({
            name: collection,
            value: item
          })
        }
      })
    }
    
    return { tester, variablePlugin, statePlugin }
  }
  
  describe('getValue - edge cases', () => {
    it('should handle empty string value', async (t) => {
      const { tester, variablePlugin, statePlugin } = setupVariablePlugin(t)
      
      statePlugin.stateSetValue({
        name: 'variable/values',
        value: {
          'empty-string': ''
        },
        options: {
          id: 'scope-1'
        }
      })
      
      const result = variablePlugin.variableGetValue({
        scope: 'scope-1',
        query: 'empty-string'
      }, { context: {} })
      
      strictEqual(result, '')
    })
    
    it('should handle null value', async (t) => {
      const { tester, variablePlugin, statePlugin } = setupVariablePlugin(t)
      
      statePlugin.stateSetValue({
        name: 'variable/values',
        value: {
          'null-value': null
        },
        options: {
          id: 'scope-1'
        }
      })
      
      const result = variablePlugin.variableGetValue({
        scope: 'scope-1',
        query: 'null-value'
      }, { context: {} })
      
      strictEqual(result, null)
    })
    
    it('should handle undefined value', async (t) => {
      const { tester, variablePlugin, statePlugin } = setupVariablePlugin(t)
      
      statePlugin.stateSetValue({
        name: 'variable/values',
        value: {
          'undefined-value': undefined
        },
        options: {
          id: 'scope-1'
        }
      })
      
      const result = variablePlugin.variableGetValue({
        scope: 'scope-1',
        query: 'undefined-value'
      }, { context: {} })
      
      strictEqual(result, undefined)
    })
    
    it('should handle missing nested property', async (t) => {
      const { tester, variablePlugin, statePlugin } = setupVariablePlugin(t)
      
      statePlugin.stateSetValue({
        name: 'variable/values',
        value: {
          user: {
            name: 'John'
          }
        },
        options: {
          id: 'scope-1'
        }
      })
      
      const result = variablePlugin.variableGetValue({
        scope: 'scope-1',
        query: 'user.profile.name'
      }, { context: {} })
      
      strictEqual(result, undefined)
    })
    
    it('should handle array values', async (t) => {
      const { tester, variablePlugin, statePlugin } = setupVariablePlugin(t)
      
      statePlugin.stateSetValue({
        name: 'variable/values',
        value: {
          'array-var': ['a', 'b', 'c']
        },
        options: {
          id: 'scope-1'
        }
      })
      
      const result = variablePlugin.variableGetValue({
        scope: 'scope-1',
        query: 'array-var.1'
      }, { context: {} })
      
      strictEqual(result, 'b')
    })
    
    it('should handle complex nested queries', async (t) => {
      const { tester, variablePlugin, statePlugin } = setupVariablePlugin(t)
      
      statePlugin.stateSetValue({
        name: 'variable/values',
        value: {
          data: {
            items: [
              {
                id: 1,
                name: 'Item 1'
              },
              {
                id: 2,
                name: 'Item 2'
              }
            ]
          }
        },
        options: {
          id: 'scope-1'
        }
      })
      
      const result = variablePlugin.variableGetValue({
        scope: 'scope-1',
        query: 'data.items.1.name'
      }, { context: {} })
      
      strictEqual(result, 'Item 2')
    })
  })
})
```

## Summary

This guide provides comprehensive instructions for testing Dooksa plugins using the `createPluginTester` utility. Key takeaways:

1. **Use `spy()` for integration tests** - Execute real logic and verify state changes
2. **Use `mock()` for unit tests** - Prevent side effects and isolate behavior
3. **Always clean up** - Call `restoreAll()` after each test
4. **Seed state before testing** - Use `mockStateData()` and `stateSetValue()`
5. **Mock methods when needed** - Use `t.mock.fn()` for controlled behavior
6. **Test edge cases** - Don't forget null, undefined, empty values
7. **Use setup helpers** - Create reusable test setup functions
8. **Verify assertions** - Check call counts, arguments, and return values

For more examples, check out the test files in `packages/plugins/test/core/`:
- `variable.spec.js` - Scope-based testing patterns
- `action.spec.js` - Action dispatch and conditional logic
- `strings.spec.js` - Simple method testing
- `regex.spec.js` - Complex pattern testing
- `operator.spec.js` - Operator testing patterns