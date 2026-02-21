# Technical Reference: create-plugin

This document provides complete technical documentation for the `@dooksa/create-plugin` package, including architecture, API details, and implementation patterns.

## Architecture Overview

### Bridge Architecture

The `createPlugin` function employs a **Bridge architecture** to decouple the public API from the internal implementation. This design enables advanced features like runtime mocking and hot-swapping of logic without breaking references.

```
┌─────────────────────────────────────────────────────────────┐
│                    Plugin Object (Frozen)                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Bridge Methods (Stable)                             │  │
│  │  - plugin.myMethod()                                 │  │
│  │  - plugin.myAction()                                 │  │
│  └──────────────────────────────────────────────────────┘  │
│                              │                               │
│                              ▼                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Internal Registry (context.__handlers__)             │  │
│  │  - myMethod: Implementation Function                  │  │
│  │  - myAction: Implementation Function                  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**Key Characteristics:**
- **Immutability**: The returned plugin object is deeply frozen and cannot be modified directly.
- **Stable References**: The methods exposed on the plugin object are "Bridges" that forward calls to the internal `__handlers__` registry.
- **Testability**: In development environments (`DEV` label in code), the `__handlers__` can be hijacked to point to mocked implementations using `createObservableInstance`.

## API Reference

### `createPlugin(name, options)`

Creates a new, immutable Dooksa plugin instance.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | `string` | Yes | Unique plugin identifier (used for namespacing) |
| `options` | `DsPluginOptions` | Yes | Plugin configuration object |

**Returns:** `DsPluginExport` - Frozen plugin object.

### Options Object

```typescript
interface DsPluginOptions {
  dependencies?: DsPluginGetters[]
  state?: {
    defaults?: Record<string, any>
    schema: Record<string, DataSchema>
  }
  metadata?: DsPluginMetadata
  data?: Record<string, any>
  actions?: DsPluginActions
  methods?: DsPluginMethods
  privateMethods?: DsPluginMethods
  setup?: Function
}
```

#### `name`
The unique identifier for the plugin. This is used to namespace all methods and actions (e.g., a method `get` in plugin `storage` becomes `storageGet`).

#### `data`
Initial state for the plugin instance. These values are copied into the plugin's internal context and are accessible via `this` within methods and actions.

```javascript
data: {
  count: 0,
  cache: {}
}
```

#### `methods`
Public methods exposed by the plugin. They are automatically namespaced.

```javascript
methods: {
  increment() {
    // 'this' refers to the plugin context
    this.count++
    return this.count
  }
}
// Usage: plugin.pluginNameIncrement()
```

#### `privateMethods`
Internal methods that are not exposed on the public API but can be used internally by other methods/actions.

#### `actions`
Actions are specialized methods designed for the Dooksa ecosystem (Visual Programming, etc.). They receive parameters as the first argument and a context object as the second.

```javascript
actions: {
  login: {
    metadata: { title: 'Login' },
    method(params, context) {
      // context contains .context (plugin context), .payload, etc.
      return this.doLogin(params.username)
    }
  }
}
```

## Development & Testing APIs

In development environments, the plugin exposes additional methods to facilitate testing.

### `createObservableInstance(testContext)`

Creates a mocked instance of the plugin for testing purposes. This method "hijacks" the original plugin's bridge, redirecting all calls to the mocked instance. This allows you to test code that imports the original plugin, while asserting against the mocked instance.

**Parameters:**
- `testContext`: The test context object (e.g., from `node:test`).

**Returns:** An observable plugin instance with:
- **`observe`**: An object containing spies/mocks for all methods and actions.
- **Mocked Methods**: Methods that mirror the plugin's API but wrap the logic in `testContext.mock.fn`.

**Mechanism:**
1.  Creates a fresh isolated instance of the plugin logic.
2.  Wraps all methods and actions with `testContext.mock.fn`.
3.  **Redirects** the original plugin's `__handlers__` to point to these new mocked methods.
4.  Any call to `originalPlugin.someMethod()` now executes the mock in the observable instance.

### `restore()`

Restores the plugin to its original state. This is crucial for test isolation.

**Behavior:**
- Resets `context.__handlers__` to point back to the original implementations.
- Resets internal `data` (context) to its initial values.

**Usage:**
Always call `restore()` in your test cleanup (e.g., `afterEach`).

```javascript
import { afterEach, beforeEach, describe, it } from 'node:test'
import { myPlugin } from '#core'

describe('My Plugin', () => {
  let observable

  beforeEach(function() {
    // Hijack myPlugin with an observable mock
    observable = myPlugin.createObservableInstance(this)
  })

  afterEach(() => {
    // Restore original behavior and state
    myPlugin.restore()
  })

  it('should track calls', () => {
    myPlugin.myPluginMethod()
    // Assert against the observable
    assert.strictEqual(observable.observe.method.mock.callCount(), 1)
  })
})
```
