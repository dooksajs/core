# Create Plugin Reference Documentation

## Overview

The `@dooksa/create-plugin` package provides a comprehensive plugin factory system for creating modular, reusable Dooksa plugins. It handles plugin initialization, state management, action registration, method binding, and lifecycle management with full TypeScript support.

## Installation

```bash
npm install @dooksa/create-plugin
```

## Import

```javascript
// ES6 Modules
import { createPlugin } from '@dooksa/create-plugin'
import createPlugin from '@dooksa/create-plugin'

// CommonJS
const { createPlugin } = require('@dooksa/create-plugin')
```

## API Reference

### `createPlugin(name, options)`

Creates a new Dooksa plugin instance with comprehensive configuration options.

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | `string` | Yes | Unique plugin identifier. Used for namespacing actions and methods |
| `options` | `DsPluginOptions` | Yes | Configuration object containing all plugin options |

#### Returns

`DsPluginExport` - A plugin object containing:
- Non-enumerable properties (name, dependencies, metadata, state, actions, setup)
- Action methods (PascalCase namespaced)
- Public method exports (PascalCase namespaced)
- Data properties (available in context)

## Plugin Options

### Basic Options

#### `metadata` (Object)
Plugin metadata for identification and documentation.

```javascript
{
  title: 'My Plugin',
  description: 'A comprehensive plugin example',
  icon: 'mdi-puzzle',
  component: 'my-plugin-component'
}
```

**Properties:**
- `title` (string): Display name
- `description` (string, optional): Detailed description
- `icon` (string, optional): Icon identifier
- `component` (string, optional): Component reference

#### `dependencies` (Array)
Array of plugin dependencies that must be loaded before this plugin.

```javascript
dependencies: [userPlugin, authPlugin]
```

#### `setup` (Function)
Initialization function called when plugin is loaded. Bound to plugin context.

```javascript
setup() {
  // Access plugin data and methods via 'this'
  this.initialize()
  return this.status
}
```

### State Management

#### `state` (Object)
Manages plugin state with schema validation and default values.

```javascript
state: {
  defaults: {
    counter: 0,
    items: []
  },
  schema: {
    counter: { type: 'number' },
    items: { 
      type: 'array',
      items: { type: 'string' }
    }
  }
}
```

**State Schema Types:**
- `'collection'` - Key-value object
- `'object'` - Object structure
- `'array'` - Array of items
- `'string'` - String value
- `'number'` - Numeric value
- `'boolean'` - Boolean value

**Schema Options:**
```javascript
{
  type: 'object',
  properties: {
    name: { type: 'string', required: true },
    age: { type: 'number' }
  },
  patternProperties: {
    '^user_': { type: 'string' }
  },
  additionalProperties: false,
  default: () => ({ name: 'default' })
}
```

**Collection ID Functions:**
```javascript
{
  type: 'collection',
  defaultId: function() { return this.generateId() },
  prefixId: function(id) { return 'prefix_' + id },
  suffixId: function(id) { return id + '_suffix' }
}
```

### Data Management

#### `data` (Object)
Initial data that becomes available in plugin context.

```javascript
data: {
  apiKey: 'secret-key',
  config: { timeout: 5000 }
}
```

Data is deep-cloned and accessible via `this` in methods and actions.

### Methods

#### `methods` (Object)
Public methods that are exposed on the plugin result object.

```javascript
methods: {
  getUser(id) {
    return this.users[id]
  },
  calculate(a, b) {
    return a + b
  }
}
```

**Naming:** Methods are namespaced as `PluginNameMethodName` (PascalCase).

#### `privateMethods` (Object)
Private methods that are only available within plugin context.

```javascript
privateMethods: {
  validateUser(user) {
    return user && user.id
  },
  generateId() {
    return Math.random().toString(36)
  }
}
```

**Characteristics:**
- Not exposed on result object
- Can call other private methods
- Access to all context data

### Actions

#### `actions` (Object)
Plugin actions that can be called by the application.

```javascript
actions: {
  createUser: {
    metadata: {
      title: 'Create User',
      description: 'Creates a new user account'
    },
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string', required: true },
        email: { type: 'string', required: true }
      }
    },
    method(userData, context) {
      // userData - action parameters
      // context - frozen action context
      const user = { ...userData, id: this.generateId() }
      this.users[user.id] = user
      return user
    }
  }
}
```

**Action Structure:**
- `metadata` (Object|Array): Action metadata
- `parameters` (Object): Parameter schema for validation
- `method` (Function): The action implementation

**Metadata Variations:**
```javascript
// Single metadata
metadata: { title: 'Action' }

// Multiple variants
metadata: [
  { id: 'variant1', title: 'Action Variant 1' },
  { id: 'variant2', title: 'Action Variant 2' }
]
```

**Action Context:**
```javascript
method(params, context) {
  // context is frozen: { context: {}, payload: {}, blockValues: {} }
  // context.context can be modified but context itself is frozen
  return result
}
```

## Return Value Structure

The `createPlugin` function returns a plugin object with the following structure:

```javascript
const plugin = createPlugin('myPlugin', options)

// Non-enumerable properties
plugin.name                    // 'myPlugin'
plugin.dependencies            // [dep1, dep2]
plugin.metadata                // { title: '...' }
plugin.state                   // State object with _values, _items, etc.
plugin.actions                 // Array of action definitions
plugin.setup                   // Setup function

// Action methods
plugin.myPluginCreateUser      // (params) => result

// Public methods
plugin.myPluginGetUser         // (id) => user

// Data properties (if provided)
plugin.myPluginData            // Available in context
```

## Complete Example

```javascript
import { createPlugin } from '@dooksa/create-plugin'

const userPlugin = createPlugin('user', {
  // Metadata
  metadata: {
    title: 'User Management',
    description: 'Handles user authentication and profiles',
    icon: 'mdi-account',
    component: 'user-panel'
  },

  // Dependencies
  dependencies: [authPlugin, databasePlugin],

  // State management
  state: {
    defaults: {
      currentUser: null,
      users: {}
    },
    schema: {
      currentUser: { 
        type: 'object',
        properties: {
          id: { type: 'string', required: true },
          name: { type: 'string', required: true },
          email: { type: 'string', required: true }
        }
      },
      users: { type: 'collection' }
    }
  },

  // Initial data
  data: {
    apiEndpoint: '/api/users',
    timeout: 5000
  },

  // Public methods
  methods: {
    getCurrentUser() {
      return this.currentUser
    },
    
    getUser(id) {
      return this.users[id]
    },
    
    getAllUsers() {
      return Object.values(this.users)
    }
  },

  // Private methods
  privateMethods: {
    validateEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    },
    
    async apiCall(endpoint, options) {
      const response = await fetch(`${this.apiEndpoint}${endpoint}`, {
        timeout: this.timeout,
        ...options
      })
      return response.json()
    }
  },

  // Actions
  actions: {
    login: {
      metadata: {
        title: 'User Login',
        description: 'Authenticate a user'
      },
      parameters: {
        type: 'object',
        properties: {
          email: { type: 'string', required: true },
          password: { type: 'string', required: true }
        }
      },
      async method({ email, password }) {
        if (!this.validateEmail(email)) {
          throw new Error('Invalid email')
        }
        
        const user = await this.apiCall('/login', {
          method: 'POST',
          body: JSON.stringify({ email, password })
        })
        
        this.currentUser = user
        return user
      }
    },
    
    register: {
      metadata: [
        { id: 'basic', title: 'Quick Register' },
        { id: 'full', title: 'Complete Registration' }
      ],
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', required: true },
          email: { type: 'string', required: true },
          password: { type: 'string', required: true },
          profile: { type: 'object' }
        }
      },
      async method(userData) {
        if (!this.validateEmail(userData.email)) {
          throw new Error('Invalid email')
        }
        
        const user = await this.apiCall('/register', {
          method: 'POST',
          body: JSON.stringify(userData)
        })
        
        this.users[user.id] = user
        return user
      }
    }
  },

  // Setup
  setup() {
    console.log('User plugin initialized')
    return { status: 'ready' }
  }
})

// Usage
await userPlugin.userLogin({ email: 'user@example.com', password: 'secret' })
const currentUser = userPlugin.userGetCurrentUser()
```

## Advanced Features

### State Access

The state object provides internal access to plugin state:

```javascript
// Access current values
const value = plugin.state._values['user/currentUser']

// Get all collection names
const names = plugin.state._names

// Access schema items
const items = plugin.state._items

// Default values
const defaults = plugin.state._defaults
```

### Context Binding

All methods, actions, and data are bound to a shared context:

```javascript
// This context is shared across all plugin functions
this.name          // Plugin name
this.currentUser   // From data or state
this.someMethod()  // Can call other methods
this.someAction()  // Can call other actions
```

### Error Handling

The plugin system provides specific error messages:

```javascript
// Duplicate names
createPlugin('test', {
  data: { conflict: 'value' },
  methods: {
    conflict() { return 'bad' }
  }
})
// Error: Plugin [conflict]: Expected unique method name

// Invalid schema type
createPlugin('test', {
  state: {
    schema: {
      items: { type: 'invalid' }
    }
  }
})
// Error: DooksaError: Unexpected data schema "invalid"
```

## Best Practices

### 1. Naming Conventions

- **Plugin Name**: Use lowercase with hyphens for package names
- **Actions**: Use camelCase in definition, becomes PascalCase in export
- **Methods**: Use camelCase in definition, becomes PascalCase in export
- **State Collections**: Use `pluginName/collectionName` format

### 2. State Management

```javascript
// ✅ Good: Define schema for type safety
state: {
  schema: {
    users: { type: 'collection' },
    settings: { 
      type: 'object',
      properties: {
        theme: { type: 'string' }
      }
    }
  }
}

// ❌ Bad: No schema, unstructured data
state: {
  defaults: {
    users: {},
    settings: {}
  }
}
```

### 3. Action Design

```javascript
// ✅ Good: Clear metadata, parameter validation
actions: {
  createUser: {
    metadata: {
      title: 'Create User',
      description: 'Creates a new user with validation'
    },
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string', required: true },
        email: { type: 'string', required: true }
      }
    },
    method(params) {
      // Validation logic
      // Business logic
      // Return result
    }
  }
}

// ❌ Bad: No metadata, no validation
actions: {
  createUser: {
    method(params) {
      // No validation, unclear purpose
    }
  }
}
```

### 4. Private vs Public Methods

```javascript
// ✅ Good: Clear separation
privateMethods: {
  validateInput(data) { /* internal */ },
  generateId() { /* internal */ }
},
methods: {
  create(data) { /* public API */ },
  get(id) { /* public API */ }
}

// ❌ Bad: Everything public
methods: {
  validateInput() { /* should be private */ },
  create() { /* public */ }
}
```

### 5. Error Handling

```javascript
// ✅ Good: Specific error handling
actions: {
  login: {
    method(params) {
      if (!this.validateEmail(params.email)) {
        throw new Error('Invalid email format')
      }
      // ... rest of logic
    }
  }
}

// ❌ Bad: Generic errors
actions: {
  login: {
    method(params) {
      try {
        // ... logic
      } catch (e) {
        throw new Error('Error occurred') // Not helpful
      }
    }
  }
}
```

### 6. Async Operations

```javascript
// ✅ Good: Proper async/await
actions: {
  fetchData: {
    async method(params) {
      const result = await this.apiCall('/data', params)
      return result
    }
  }
}

// ❌ Bad: Mixing patterns
actions: {
  fetchData: {
    method(params) {
      return this.apiCall('/data', params)
        .then(result => result)
        .catch(e => { throw e })
    }
  }
}
```

### 7. Dependencies

```javascript
// ✅ Good: Explicit dependencies
dependencies: [authPlugin, databasePlugin],
methods: {
  getUser(id) {
    // Can safely use authPlugin and databasePlugin
    if (!this.authPlugin.isAuthenticated()) {
      throw new Error('Not authenticated')
    }
    return this.databasePlugin.get('users', id)
  }
}

// ❌ Bad: Implicit dependencies
methods: {
  getUser(id) {
    // Assuming global plugins exist
    return window.plugins.database.get('users', id)
  }
}
```

## Type Definitions

### DsPluginOptions

```typescript
interface DsPluginOptions {
  dependencies?: DsPluginGetters[]
  state?: {
    defaults?: Record<string, any>
    schema: Record<string, DataSchema>
  }
  metadata?: {
    title: string
    description?: string
    icon?: string
    component?: string
  }
  data?: Record<string, any>
  methods?: Record<string, Function>
  privateMethods?: Record<string, Function>
  actions?: Record<string, DsPluginAction>
  setup?: Function
}
```

### DsPluginAction

```typescript
interface DsPluginAction {
  method: (params: any, context: ActionContext) => any
  metadata: DsPluginMetadata | DsPluginMetadataUnique[]
  parameters?: DsPluginActionParameter
}

interface ActionContext {
  context: Record<string, any>
  payload: Record<string, any>
  blockValues: Record<string, any>
}
```

### DsPluginExport

```typescript
type DsPluginExport<Name, Methods, Actions, Setup> = 
  DsPluginModuleMethod<Name, Methods> &
  DsPluginModuleAction<Name, Actions> &
  DsPluginGetters & {
    setup: Setup
  }
```

## Testing

The package includes comprehensive test coverage. Run tests with:

```bash
# Run all tests
npm test

# Run with coverage
npm run test-coverage
```

## Related Packages

- `@dooksa/utils` - Utility functions used internally
- `@dooksa/create-action` - Action creation utilities
- `@dooksa/plugins` - Plugin management system

## License

AGPL-3.0-or-later
