# Technical Reference: create-plugin

This document provides complete technical documentation for the `@dooksa/create-plugin` package, including architecture, API details, and implementation patterns.

## Architecture Overview

### Bridge Pattern

The create-plugin package uses a **Bridge architecture** to enable testability and runtime behavior swapping:

```
┌─────────────────────────────────────────────────────────────┐
│                    Plugin Export (Stable)                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Bridge Functions (Stable References)                │  │
│  │  - plugin.methodName()                               │  │
│  │  - plugin.actionName()                               │  │
│  └──────────────────────────────────────────────────────┘  │
│                              │                               │
│                              ▼                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Implementation Registry (_impl)                      │  │
│  │  - methodName: Function                               │  │
│  │  - actionName: Function                               │  │
│  └──────────────────────────────────────────────────────┘  │
│                              │                               │
│                              ▼                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Actual Implementation                                │  │
│  │  - Bound to plugin context                           │  │
│  │  - Can be swapped for mocking                        │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**Key Benefits:**
- **Stable References**: Exported functions maintain the same reference
- **Runtime Swapping**: Implementation can be changed without breaking imports
- **Testability**: Easy to mock for unit tests
- **No Circular Dependencies**: Bridges decouple exports from implementation

### Context System

All plugin functions share a common context:

```javascript
const context = {
  _impl: { /* implementation registry */ },
  name: 'pluginName',
  // Data properties
  dataProperty: 'value',
  // State properties
  stateProperty: 42,
  // Method references
  methodName: function() { /* ... */ }
}
```

## API Reference

### `createPlugin(name, options)`

Creates a new Dooksa plugin instance.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | `string` | Yes | Unique plugin identifier (used for namespacing) |
| `options` | `DsPluginOptions` | Yes | Plugin configuration object |

**Returns:** `DsPluginExport` - Plugin object with the following properties:

| Property | Type | Description |
|----------|------|-------------|
| `name` | `string` | Plugin name |
| `metadata` | `DsPluginMetadata` | Plugin metadata (if provided) |
| `dependencies` | `DsPluginGetters[]` | Plugin dependencies (if provided) |
| `state` | `DsPluginStateExport` | State management object (if provided) |
| `actions` | `DsPluginAction[]` | Action metadata array (if provided) |
| `setup` | `Function` | Setup function (if provided) |
| `createObservableInstance` | `Function` | Test helper (DEV mode only) |
| `restore` | `Function` | Restore function (DEV mode only) |

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

#### `dependencies`

Array of plugin instances that this plugin depends on.

**Type:** `DsPluginGetters[]`

**Example:**
```javascript
const storagePlugin = createPlugin('storage', { /* ... */ })
const userPlugin = createPlugin('user', {
  dependencies: [storagePlugin],
  // ...
})
```

#### `state`

State management configuration for a global state plugin.

**Type:** `{ schema: Record<string, DataSchema> }`

**Important:** This property is used for metadata about a global state plugin, not for internal plugin state management.

**Schema Types:**
- `string` - Text data (default: `''`)
- `number` - Numeric data (default: `0`)
- `boolean` - Boolean flag (default: `true`)
- `object` - Key-value object (default: `{}`)
- `array` - Ordered list (default: `[]`)
- `collection` - Collection with ID-based access (default: `{}`)

**Example:**
```javascript
// Global state plugin
const statePlugin = createPlugin('globalState', {
  metadata: { title: 'Global State' },
  state: {
    schema: {
      users: { type: 'collection' },
      settings: { type: 'object' }
    }
  }
})
```

**Note:** For internal plugin state, use the `data` property instead.

#### `data`

Initial data values that are copied to the plugin context.

**Type:** `Record<string, any>`

**Example:**
```javascript
data: {
  count: 0,
  users: [],
  settings: {
    theme: 'dark'
  }
}
```

**Note:** This is the recommended way to manage internal plugin state.

#### `metadata`

Plugin metadata information.

**Type:** `DsPluginMetadata`

**Properties:**
- `title` (string): Plugin display name
- `description` (string): Plugin description
- `component` (string): Component ID (optional)
- `icon` (string): Icon name (optional)

**Example:**
```javascript
metadata: {
  title: 'User Management',
  description: 'Handles user authentication and profiles',
  component: 'user-manager',
  icon: 'mdi-account'
}
```

#### `data`

Initial data values that are copied to the plugin context.

**Type:** `Record<string, any>`

**Example:**
```javascript
data: {
  users: [],
  settings: {
    theme: 'dark'
  }
}
```

#### `actions`

Named actions with metadata and parameters. Actions are exported operations that can be used both programmatically (like methods) and by the visual programming plugin (action.js) to build user interfaces.

**Type:** `DsPluginActions`

**Structure:**
```typescript
interface DsPluginActions {
  [key: string]: {
    metadata: DsPluginMetadata | DsPluginMetadata[]
    parameters?: DataSchema
    method: (params: any, context: ActionContext) => any
  }
}
```

**Key Features:**
- **Programmatic Usage**: Can be called directly from other plugins like methods
- **Visual Programming**: Rich metadata enables UI generation by the visual programming plugin
- **Structured Parameters**: Schema-based parameters enable validation and auto-generated forms

**Example:**
```javascript
actions: {
  login: {
    metadata: {
      title: 'User Login',
      description: 'Authenticate a user',
      icon: 'mdi-login',           // For visual UI
      category: 'authentication'   // For organization
    },
    parameters: {
      type: 'object',
      properties: {
        username: { type: 'string', required: true },
        password: { type: 'string', required: true }
      }
    },
    method({ username, password }, context) {
      // context.context - Plugin context (this)
      // context.payload - Action parameters
      return { success: true, user: username }
    }
  }
}
```

**Visual Programming Integration:**
The visual programming plugin (action.js) uses action metadata to:
1. Display actions in a searchable list with titles and descriptions
2. Generate forms based on the parameters schema
3. Validate user input before calling the action
4. Show help text and tooltips

**When to Use Actions vs Methods:**
- **Actions**: When the operation should be available to visual programming, needs rich metadata, or requires structured parameters
- **Methods**: When the operation is internal to your plugin, doesn't need UI generation, or requires simple function signatures

#### `methods`

Public methods exposed on the plugin.

**Type:** `DsPluginMethods`

**Structure:**
```typescript
interface DsPluginMethods {
  [key: string]: Function
}
```

**Example:**
```javascript
methods: {
  getCount() {
    return this.count
  },
  increment() {
    this.count++
    return this.count
  }
}
```

#### `privateMethods`

Internal methods not exposed externally.

**Type:** `DsPluginMethods`

**Example:**
```javascript
privateMethods: {
  validateInput(value) {
    if (typeof value !== 'number') {
      throw new Error('Must be a number')
    }
    return value
  }
}
```

#### `setup`

Initialization function called when plugin is created.

**Type:** `Function`

**Context:** Has access to full plugin context via `this`

**Example:**
```javascript
setup() {
  // Initialize plugin
  this.initialize()
  return 'ready'
}
```

## State Management

### Schema System

The schema system provides type-safe state management with validation.

**Supported Types:**

| Type | Default | Description |
|------|---------|-------------|
| `string` | `''` | Text data |
| `number` | `0` | Numeric data |
| `boolean` | `true` | Boolean flag |
| `object` | `{}` | Key-value object |
| `array` | `[]` | Ordered list |
| `collection` | `{}` | Collection with ID-based access |

### Schema Validation

Schemas can include validation rules:

```javascript
state: {
  schema: {
    user: {
      type: 'object',
      properties: {
        name: { type: 'string', required: true },
        age: { type: 'number', minimum: 0, maximum: 120 },
        email: { type: 'string', pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$' }
      },
      required: ['name', 'email']
    }
  }
}
```

### Data Access

Data is accessible via the plugin context:

```javascript
methods: {
  updateCount(value) {
    this.count = value  // Direct assignment
    return this.count
  }
}
```

**Note:** For internal plugin state, use the `data` property and access it via `this` in methods.

## Actions

### Action Context

Actions receive a special context object as the second parameter:

```typescript
interface ActionContext {
  context: Record<string, any>  // Plugin context (this)
  payload: any                  // Action parameters
  blockValues: Record<string, any>  // Block-specific values
}
```

**Example:**
```javascript
actions: {
  save: {
    method(params, context) {
      // Access plugin context
      const pluginContext = context.context
      
      // Access action parameters
      const payload = context.payload
      
      // Access block values
      const blockValues = context.blockValues
      
      return 'saved'
    }
  }
}
```

### Action Metadata Variants

Actions can have multiple metadata variants:

```javascript
actions: {
  save: {
    metadata: [
      {
        id: 'local',
        title: 'Save Locally',
        description: 'Save to local storage'
      },
      {
        id: 'remote',
        title: 'Save Remotely',
        description: 'Save to server'
      }
    ],
    method() { /* ... */ }
  }
}
```

## Testing & Mocking

### Observable Instances

In development mode, plugins can create observable (mocked) instances for testing.

**API:**

```typescript
function createObservableInstance(
  testContext: TestContext
): DsPluginObservable
```

**Returns:** Observable instance with:

| Property | Type | Description |
|----------|------|-------------|
| `name` | `string` | Plugin name |
| `metadata` | `DsPluginMetadata` | Plugin metadata |
| `observe` | `Record<string, Mock>` | Mock tracking objects |
| `testMethodName` | `Function` | Namespaced method/action |
| `state` | `DsPluginStateExport` | State management |
| `actions` | `DsPluginAction[]` | Action metadata |

**Example:**
```javascript
import { test } from 'node:test'

test('plugin behavior', async (t) => {
  const plugin = createPlugin('counter', {
    // ... plugin definition
  })

  const observable = plugin.createObservableInstance(t)

  // Call method
  const result = observable.testIncrement()

  // Verify mock
  t.assert(observable.observe.increment.mock.calls.length === 1)
  t.assert(result === 1)
})
```

### Mock Tracking

Mock objects provide access to call history:

```typescript
interface Mock {
  calls: Array<{
    arguments: any[]
    result: { type: 'return' | 'throw', value: any }
  }>
  results: Array<{ type: 'return' | 'throw', value: any }>
  mock: Mock  // Self-reference
}
```

**Example:**
```javascript
const observable = plugin.createObservableInstance(t)

// Call method multiple times
observable.testMethod('arg1')
observable.testMethod('arg2')

// Check calls
console.log(observable.observe.method.mock.calls.length)  // 2
console.log(observable.observe.method.mock.calls[0].arguments)  // ['arg1']
console.log(observable.observe.method.mock.calls[1].arguments)  // ['arg2']

// Check results
console.log(observable.observe.method.mock.results[0].value)  // First return value
```

### Restore Function

Reset the plugin to its original state.

**API:**

```typescript
function restore(): void
```

**Behavior:**
- Resets context data to original values
- Restores original implementations from `_impl` registry
- If `_originalImplementation` is empty, rebuilds from methods/actions

**Example:**
```javascript
const plugin = createPlugin('counter', {
  data: { count: 0 },
  methods: {
    increment() {
      this.count++
      return this.count
    }
  }
})

// Modify state
plugin.counterIncrement()  // count = 1
plugin.counterIncrement()  // count = 2

// Restore
plugin.restore()

// State is reset
plugin.counterIncrement()  // count = 1 (starts from 0)
```

## Implementation Details

### Bridge Function Creation

When a method or action is created, a bridge function is generated:

```javascript
function createBridge(context, key) {
  return function (...args) {
    const currentLogic = context._impl[key]
    
    if (typeof currentLogic !== 'function') {
      throw new Error(`Implementation for [${key}] is not a function.`)
    }
    
    return currentLogic.apply(this, args)
  }
}
```

### Context Binding

All functions are bound to the plugin context:

```javascript
// Production
const method = fn.bind(context)
context._impl[key] = method

// Development (with bridge)
const bridge = createBridge(context, key).bind(context)
context._impl[key] = bridge
```

### Observable Instance Creation

Observable instances create a separate context with mocked functions:

```javascript
function createObservableInstanceInternal(name, config, testContext) {
  const context = Object.create(null)
  const plugin = Object.create(null)
  const mockMethods = Object.create(null)
  const wrapper = (fn) => testContext.mock.fn(fn)
  
  // Create mocks for all methods/actions
  // Store mock tracking in mockMethods
  // Return plugin with observe property
}
```

### Restore Mechanism

Restore works by resetting the `_impl` registry:

```javascript
restore() {
  // Reset data
  Object.assign(context, data ? deepClone(data) : {})
  
  // Reset implementations
  if (methods) {
    for (const key of Object.keys(methods)) {
      if (_originalImplementation[key]) {
        context._impl[key] = _originalImplementation[key]
      } else {
        context._impl[key] = methods[key].bind(context)
      }
    }
  }
}
```

## Type Definitions

### DsPluginExport

```typescript
interface DsPluginExport<Name, Methods, Actions, Setup, Data, PrivateMethods> {
  name: Name
  metadata?: DsPluginMetadata
  dependencies?: DsPluginGetters[]
  state?: DsPluginStateExport
  actions?: DsPluginAction[]
  setup?: Setup
  data?: Data
  createObservableInstance?: (testContext: TestContext) => DsPluginObservable
  restore?: () => void
}
```

### DsPluginObservable

```typescript
interface DsPluginObservable<Name, Methods, Actions, PrivateMethods, Setup> {
  name: Name
  metadata?: DsPluginMetadata
  dependencies?: DsPluginGetters[]
  state?: DsPluginStateExport
  actions?: DsPluginAction[]
  setup?: Mock<Setup>
  observe: {
    [K in keyof Methods]: Mock<Methods[K]>
  } & {
    [K in keyof Actions]: Mock<Actions[K]>
  } & {
    [K in keyof PrivateMethods]: Mock<PrivateMethods[K]>
  }
}
```

### ActionContext

```typescript
interface ActionContext {
  context: Record<string, any>
  payload: any
  blockValues: Record<string, any>
}
```

## Error Handling

### Common Errors

1. **Duplicate Name Error**
   ```
   Error: Plugin Method [methodName]: Expected unique name
   ```
   - Occurs when trying to register a method/action with a name that already exists in the context

2. **Invalid Schema Type**
   ```
   DooksaError: Unexpected data schema "invalidType"
   ```
   - Occurs when using an unsupported schema type

3. **Implementation Not Found**
   ```
   Error: Implementation for [methodName] is not a function.
   ```
   - Occurs when calling a method/action that hasn't been properly initialized

### Error Prevention

1. **Unique Names**: Ensure method/action names don't conflict with data properties
2. **Valid Types**: Use only supported schema types
3. **Proper Initialization**: Always call `createPlugin` before using methods

## Performance Considerations

### Bridge Overhead

The bridge pattern adds minimal overhead:
- One function call indirection
- Dictionary lookup in `_impl` registry
- negligible performance impact in production

### State Management

- State is deep-cloned on initialization
- Large state objects may impact startup time
- Consider lazy initialization for large datasets

### Observable Instances

- Create separate context for each observable
- Mock functions add memory overhead
- Use only in tests, not in production

## Best Practices

### 1. Plugin Organization

```javascript
// Good - organized structure
const plugin = createPlugin('user', {
  metadata: {
    title: 'User Management',
    description: 'Handles user authentication and profiles'
  },
  state: {
    schema: {
      users: { type: 'collection' },
      session: { type: 'object' }
    }
  },
  privateMethods: {
    validateEmail(email) { /* ... */ },
    encryptPassword(password) { /* ... */ }
  },
  methods: {
    getUser(id) { /* ... */ },
    updateUser(id, data) { /* ... */ }
  },
  actions: {
    login: {
      metadata: { title: 'Login' },
      parameters: { /* ... */ },
      method(params, context) { /* ... */ }
    }
  }
})
```

### 2. Testing Strategy

```javascript
import { test } from 'node:test'
import { strictEqual, deepStrictEqual } from 'node:assert'

test('user plugin', async (t) => {
  const plugin = createPlugin('user', {
    // ... plugin definition
  })

  await t.test('method behavior', () => {
    const result = plugin.userGetUser('123')
    strictEqual(result.id, '123')
  })

  await t.test('action with mocking', async (t) => {
    const observable = plugin.createObservableInstance(t)
    
    observable.userLogin({ username: 'test', password: 'pass' })
    
    t.assert(observable.observe.login.mock.calls.length === 1)
  })

  await t.test('restore functionality', () => {
    plugin.userUpdateUser('123', { name: 'Updated' })
    plugin.restore()
    
    const user = plugin.userGetUser('123')
    strictEqual(user.name, 'Original')  // Restored to original
  })
})
```

### 3. Dependency Management

```javascript
// Good - explicit dependencies
const storagePlugin = createPlugin('storage', { /* ... */ })
const apiPlugin = createPlugin('api', { /* ... */ })

const userPlugin = createPlugin('user', {
  dependencies: [storagePlugin, apiPlugin],
  methods: {
    async fetchUser(id) {
      // Can use both dependencies
      const cached = await this.storageGet(id)
      if (cached) return cached
      
      const user = await this.apiGet(`/users/${id}`)
      await this.storageSet(id, user)
      return user
    }
  }
})
```

## Troubleshooting

### Common Issues

1. **Method not found**
   - Check that method name is unique
   - Verify plugin is properly initialized
   - Ensure method is defined in `methods` or `privateMethods`

2. **State not updating**
   - State is immutable after initialization
   - Use method to update state: `this.stateProperty = value`
   - Check that state is defined in schema

3. **Restore not working**
   - `restore()` only works in DEV mode
   - Must call `createObservableInstance()` before restore
   - Check that data is defined in plugin options

4. **Mock not tracking**
   - Observable instances only work in DEV mode
   - Use `observable.observe.methodName.mock` to access tracking
   - Check that method is called on observable, not original plugin

## Additional Resources

- [User Guide](guide.md) - Step-by-step tutorial
- [Restore Documentation](restore.md) - Testing patterns
- [Test Files](../test/) - Complete test examples
- [Source Code](../src/) - Implementation details
