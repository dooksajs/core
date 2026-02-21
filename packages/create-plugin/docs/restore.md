# Restore Functionality

The `restore()` function is a development-only utility provided by `createPlugin`. It is the primary mechanism for ensuring test isolation by resetting both the plugin's internal state and its implementation logic.

## Purpose

When testing Dooksa plugins, you often need to:
1.  **Modify State**: Change internal data to test different scenarios.
2.  **Mock Logic**: Replace real methods with mocks using `createObservableInstance`.

Without `restore()`, these changes would persist across tests, causing "test pollution" where one test fails because of side effects from a previous one.

## How It Works

The `restore()` function performs two critical actions:

1.  **Resets Data**: It deep-clones the original `data` object provided in the plugin options and overwrites the current plugin context. This reverts any state changes made during the test.
2.  **Resets Implementation**: It resets the internal "Bridge" handlers (`context.__handlers__`) to point back to the original function implementations. This effectively disconnects any mocks created by `createObservableInstance`.

## Usage Patterns

### 1. Cleaning Up After Mocks

This is the most common use case. When you use `createObservableInstance`, you are "hijacking" the plugin. You **must** call `restore()` to return it to normal.

```javascript
import { describe, it, beforeEach, afterEach } from 'node:test'
import { myPlugin } from '#core'

describe('My Plugin', () => {
  beforeEach(function() {
    // Hijack implementation with mocks
    myPlugin.createObservableInstance(this)
  })

  afterEach(() => {
    // CRITICAL: Restore original implementation and state
    myPlugin.restore()
  })

  it('should use mocks', () => {
    // ...
  })
})
```

### 2. Resetting State in Integration Tests

Even without mocks, if you are testing stateful behavior, you should restore between tests.

```javascript
test('stateful behavior', async (t) => {
  const plugin = createPlugin('counter', {
    data: { count: 0 },
    methods: {
      increment() { this.count++ }
    }
  })

  await t.test('first increment', () => {
    plugin.counterIncrement()
    assert.equal(plugin.count, 1)
    // Restore state for next test
    plugin.restore()
  })

  await t.test('second increment', () => {
    // Count starts at 0 again because of restore()
    plugin.counterIncrement()
    assert.equal(plugin.count, 1)
    plugin.restore()
  })
})
```

## Best Practices

*   **Always use `afterEach`**: Placing `restore()` in `afterEach` ensures it runs even if a test fails, preventing cascading failures.
*   **Restore All Involved Plugins**: If your test touches multiple plugins (e.g., `state`, `api`, `user`), make sure to restore all of them.

```javascript
afterEach(() => {
  userPlugin.restore()
  state.restore()
  api.restore()
})
```

*   **Check Availability**: Remember that `restore()` is only available in development builds. If you are writing tests that might run against production builds, check for its existence (though typically tests run in dev mode).

```javascript
if (plugin.restore) {
  plugin.restore()
}
```
