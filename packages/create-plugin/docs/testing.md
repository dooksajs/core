# Testing Dooksa Plugins

This guide explains how to test Dooksa plugins using the native Node.js test runner (`node:test`) and the built-in testing utilities provided by `@dooksa/create-plugin`.

## Overview

Dooksa plugins are designed with testability in mind. Each plugin created with `createPlugin` includes special methods in development environments (`DEV`) to facilitate mocking and state restoration.

**Key Concepts:**
- **Observable Instances**: Mocked versions of your plugin that track method calls and arguments.
- **Bridge Hijacking**: The ability to redirect internal plugin logic to your mocks without changing imports.
- **State Restoration**: Resetting plugin state and logic between tests to ensure isolation.

## Basic Setup

We use the standard `node:test` runner. No additional test framework is required.

### 1. Import Dependencies

```javascript
import { describe, it, beforeEach, afterEach } from 'node:test'
import { strictEqual, deepStrictEqual } from 'node:assert'
import { myPlugin } from '#core' // Import your plugin
```

### 2. Create Observable Instance

In your `beforeEach` hook, create an observable instance of your plugin. This "hijacks" the original plugin, meaning any code that imports `myPlugin` will now execute the logic in your observable instance.

```javascript
describe('My Plugin', () => {
  let observable

  beforeEach(function() {
    // Pass the test context (this) to create mocks
    observable = myPlugin.createObservableInstance(this)
  })

  // ...
})
```

### 3. Restore State

In your `afterEach` hook, restore the plugin to its original state. This resets any data changes and removes the mocks, ensuring the next test starts clean.

```javascript
  afterEach(() => {
    myPlugin.restore()
  })
```

## Writing Tests

### Testing Methods

You can call methods directly on the observable instance and assert on the results or the call history.

```javascript
  it('should increment counter', () => {
    // Call the method
    const result = observable.myPluginIncrement()

    // Assert result
    strictEqual(result, 1)

    // Assert call history (using node:test mock API)
    strictEqual(observable.observe.increment.mock.callCount(), 1)
  })
```

### Mocking Implementation

You can replace the implementation of a method for specific tests using `mock.mockImplementation`.

```javascript
  it('should handle errors', (t) => {
    // Mock the implementation to throw
    observable.observe.fetchData.mock.mockImplementation(() => {
      throw new Error('Network Error')
    })

    // Test error handling
    assert.throws(() => observable.myPluginFetchData(), /Network Error/)
  })
```

### Testing Actions

Actions are tested similarly to methods. The `createObservableInstance` helper wraps actions so you can call them directly with parameters.

```javascript
  it('should dispatch login action', () => {
    observable.myPluginLogin({ username: 'user', password: 'pass' })

    const call = observable.observe.login.mock.calls[0]
    deepStrictEqual(call.arguments[0], { username: 'user', password: 'pass' })
  })
```

## Integration Testing

For more complex scenarios involving multiple plugins (e.g., `state`, `api`), you need to setup the environment.

### Setting up State

If your plugin interacts with the global `state` plugin, you should initialize it with a schema.

```javascript
import { state, myPlugin } from '#core'
import { createState } from '../helpers/index.js' // Or your own helper

describe('Integration', () => {
  beforeEach(function() {
    // Create observable instances for all involved plugins
    state.createObservableInstance(this)
    myPlugin.createObservableInstance(this)

    // Setup state with plugin schemas
    const stateData = createState([myPlugin])
    state.setup(stateData)
  })

  afterEach(() => {
    state.restore()
    myPlugin.restore()
  })
})
```

### Mocking the Backend (API)

If your plugin makes API calls, use the `createTestServer` helper to mock backend responses.

```javascript
import { createTestServer } from '../helpers/index.js'
import { api } from '#core'

describe('API Integration', () => {
  let testServer = createTestServer()

  beforeEach(async function() {
    // Start test server
    const hostname = await testServer.start()
    
    // Setup API plugin
    api.setup({ hostname })
    
    // ... setup other plugins
  })

  afterEach(async () => {
    await testServer.restore()
    api.restore()
  })
  
  // ... tests
})
```

## Example: Complete Test File

Here is a complete example of testing a plugin that interacts with state.

```javascript
import { describe, it, beforeEach, afterEach } from 'node:test'
import { strictEqual } from 'node:assert'
import { userPlugin, state } from '#core'
import { createState } from '../helpers/index.js'

describe('User Plugin', () => {
  let userObservable
  let stateObservable

  beforeEach(function() {
    // 1. Create observables
    userObservable = userPlugin.createObservableInstance(this)
    stateObservable = state.createObservableInstance(this)

    // 2. Setup state
    // Create initial state based on userPlugin's schema
    const initialState = createState([userPlugin])
    state.setup(initialState)
    
    // 3. Setup plugin (if needed)
    if (userPlugin.setup) {
      userPlugin.setup()
    }
  })

  afterEach(() => {
    // 4. Restore everything
    userPlugin.restore()
    state.restore()
  })

  it('should update user name', () => {
    // Execute action
    userObservable.userUpdateProfile({ name: 'Alice' })

    // Verify state update
    const user = state.stateGetValue({ 
      name: 'user/profile', 
      id: 'current' 
    })
    
    strictEqual(user.item.name, 'Alice')
  })
})
```

## Best Practices

1.  **Always Restore**: Always call `.restore()` on every modified plugin in `afterEach`. Failing to do so will cause test pollution.
2.  **Use `beforeEach` for Observables**: Create your observables in `beforeEach` so you get a fresh mock context for every test.
3.  **Isolate Tests**: Do not rely on state from previous tests.
4.  **Mock External Dependencies**: Use `createTestServer` or mock the `api` plugin methods to avoid real network requests.
