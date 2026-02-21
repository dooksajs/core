# User Guide: Creating Dooksa Plugins

This guide will walk you through creating Dooksa plugins using the `createPlugin` function. You'll learn how to define state, actions, methods, and manage plugin dependencies.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Plugin Basics](#plugin-basics)
3. [Data Management](#data-management)
4. [Methods](#methods)
5. [Actions](#actions)
6. [Dependencies](#dependencies)
7. [Lifecycle & Setup](#lifecycle--setup)
8. [Testing & Mocking](#testing--mocking)
9. [Best Practices](#best-practices)
10. [Next Steps](#next-steps)

## Getting Started

### Installation

```bash
npm install @dooksa/create-plugin
```

### Basic Example

```javascript
import { createPlugin } from '@dooksa/create-plugin'

const myPlugin = createPlugin('myPlugin', {
  metadata: {
    title: 'My Plugin',
    description: 'A sample plugin'
  }
})

console.log(myPlugin.name) // 'myPlugin'
console.log(myPlugin.metadata.title) // 'My Plugin'
```

## Plugin Basics

### Plugin Structure

Every plugin has a unique name and can include:

- **metadata** - Plugin information (title, description, etc.)
- **dependencies** - Other plugins this plugin depends on
- **state** - Schema-based state management
- **data** - Initial data values
- **methods** - Public methods callable by other plugins
- **privateMethods** - Internal methods not exposed externally
- **actions** - Named actions with metadata and parameters
- **setup** - Initialization function

### Naming Convention

Plugin methods and actions are automatically namespaced:

```javascript
const plugin = createPlugin('user', {
  methods: {
    getName() { return 'John' }
  },
  actions: {
    login: {
      metadata: { title: 'Login' },
      method() { /* ... */ }
    }
  }
})

// Access via namespaced names
plugin.userGetName()      // Method
plugin.userLogin()        // Action
```

## Data Management

### Defining Data

Data is initial state that is copied to the plugin context:

```javascript
const plugin = createPlugin('counter', {
  metadata: { title: 'Counter Plugin' },
  data: {
    count: 0,
    name: 'default',
    isActive: true,
    items: [],
    settings: {
      theme: 'dark'
    }
  }
})
```

### State Management

For global state management across your application, use the `state` property with schemas:

```javascript
const plugin = createPlugin('user', {
  metadata: { title: 'User Plugin' },
  state: {
    schema: {
      profiles: {
        type: 'collection',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            email: { type: 'string' },
            role: { 
              type: 'string',
              enum: ['user', 'admin', 'guest'],
              default: 'user'
            }
          },
          required: ['name', 'email']
        },
        id: {
          prefix: 'user_'
        }
      }
    }
  }
})
```

**Key Differences:**
- **`data`**: Internal plugin state (simple values, not validated)
- **`state`**: Global application state with schemas, validation, and relationships

**When to use each:**
- Use `data` for internal plugin state that doesn't need validation
- Use `state` for shared application data that requires validation, relationships, and event handling

For comprehensive documentation on state management, see:
- [State Schema Guide](../plugins/docs/state-schema-guide.md)
- [State Default Values Guide](../plugins/docs/state-default-values-guide.md)
- [State Data Types Guide](../plugins/docs/state-data-types-guide.md)
- [State Relationships Guide](../plugins/docs/state-relationships-guide.md)
- [State Validation Guide](../plugins/docs/state-validation-guide.md)
- [State Events and Listeners Guide](../plugins/docs/state-events-listeners-guide.md)
- [State Advanced Patterns Guide](../plugins/docs/state-advanced-patterns.md)
- [State API Reference](../plugins/docs/state-api-reference.md)
- [StateSetValue Guide](../plugins/docs/stateSetValue-guide.md)

### Data Types

Data can be any JavaScript value:

| Type | Example | Description |
|------|---------|-------------|
| `string` | `'hello'` | Text data |
| `number` | `42` | Numeric data |
| `boolean` | `true` | Boolean flag |
| `object` | `{ key: 'value' }` | Key-value object |
| `array` | `[1, 2, 3]` | Ordered list |
| `null` | `null` | Null value |
| `undefined` | `undefined` | Undefined value |

### Accessing Data

Data is accessible via the plugin context (`this`):

```javascript
const plugin = createPlugin('counter', {
  metadata: { title: 'Counter' },
  data: {
    count: 0
  },
  methods: {
    increment() {
      this.count++  // Access data via 'this'
      return this.count
    },
    getCount() {
      return this.count
    }
  }
})

plugin.counterIncrement()  // Returns: 1
plugin.counterGetCount()   // Returns: 1
```

### Data Modification

Data can be modified directly in methods:

```javascript
const plugin = createPlugin('user', {
  metadata: { title: 'User Plugin' },
  data: {
    users: [],
    currentUser: null
  },
  methods: {
    addUser(name) {
      const user = { id: Date.now(), name }
      this.users.push(user)
      return user
    },
    setCurrentUser(userId) {
      this.currentUser = this.users.find(u => u.id === userId)
      return this.currentUser
    }
  }
})
```

### Composing State Schemas

You can reuse state schemas from other plugins using the `mapState` utility. This allows you to compose complex schemas dynamically without duplicating code.

```javascript
import { createPlugin, mapState } from '@dooksa/create-plugin'

// A base plugin with some state
const basePlugin = createPlugin('base', {
  state: {
    schema: {
      id: { type: 'string' },
      timestamp: { type: 'number' }
    }
  }
})

// A plugin that extends the base state
const extendedPlugin = createPlugin('extended', {
  state: {
    schema: {
      name: { type: 'string' },
      // Spread all properties from basePlugin
      ...mapState(basePlugin).schema
    }
  }
})

// A plugin that picks specific properties
const pickyPlugin = createPlugin('picky', {
  state: {
    schema: {
      title: { type: 'string' },
      // Only take 'id' from basePlugin
      ...mapState(basePlugin, ['id']).schema
    }
  }
})
```

### State Management (Global State Plugin)

The `state` property is used for defining schemas for the global state management system. Unlike `data`, state properties are **not** added to the plugin context (`this`) and must be accessed via global state actions.

```javascript
// This defines the schema for global state
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

**Key Differences:**
- **`data`**: Internal plugin state, accessible via `this.propertyName`
- **`state`**: Global application state, accessed via `stateGetValue` / `stateSetValue`

**Important:** For internal plugin state that doesn't need to be shared globally or validated, use the `data` property.

## Methods

### Public Methods

Public methods are exposed on the plugin and can be called by other plugins:

```javascript
const plugin = createPlugin('math', {
  metadata: { title: 'Math Plugin' },
  data: {
    base: 10
  },
  methods: {
    add(x, y) {
      return this.base + x + y
    },
    multiply(x, y) {
      return x * y
    }
  }
})

plugin.mathAdd(5, 3)      // Returns: 18 (10 + 5 + 3)
plugin.mathMultiply(4, 5) // Returns: 20
```

### Private Methods

Private methods are internal to the plugin and not exposed externally:

```javascript
const plugin = createPlugin('calculator', {
  metadata: { title: 'Calculator' },
  data: {
    result: 0
  },
  privateMethods: {
    validateNumber(num) {
      if (typeof num !== 'number') {
        throw new Error('Must be a number')
      }
      return num
    }
  },
  methods: {
    add(x, y) {
      const validatedX = this.validateNumber(x)
      const validatedY = this.validateNumber(y)
      this.result = validatedX + validatedY
      return this.result
    }
  }
})

plugin.calculatorAdd(5, 3)  // Works: Returns 8
plugin.calculatorValidateNumber // undefined (not exposed)
```

### Method Context

All methods (public and private) have access to the plugin context:

```javascript
const plugin = createPlugin('user', {
  metadata: { title: 'User Plugin' },
  data: {
    firstName: 'John',
    lastName: 'Doe'
  },
  methods: {
    getFullName() {
      // 'this' refers to the plugin context
      return `${this.firstName} ${this.lastName}`
    }
  }
})

plugin.userGetFullName()  // Returns: "John Doe"
```

## Actions

### What Are Actions?

Actions are **exported operations** that serve two purposes:

1. **Programmatic Usage**: Like methods, they can be called directly from other plugins
2. **Visual Programming**: They provide metadata that enables the visual programming plugin (action.js) to build user interfaces

Think of actions as "public API endpoints" with rich metadata for UI generation.

### How Actions Differ from Methods

| Feature | Methods | Actions |
|---------|---------|---------|
| **Purpose** | Internal logic, reusable functions | Public operations with UI metadata |
| **Metadata** | Minimal (just implementation) | Rich (title, description, parameters) |
| **Visual Programming** | Not supported | Fully supported |
| **Parameters** | Any signature | Structured schema with types |
| **Usage** | Plugin-to-plugin | Plugin-to-plugin + UI generation |

### Defining Actions

```javascript
const plugin = createPlugin('user', {
  metadata: { title: 'User Plugin' },
  actions: {
    login: {
      metadata: {
        title: 'User Login',
        description: 'Authenticate a user with credentials'
      },
      parameters: {
        type: 'object',
        properties: {
          username: { type: 'string', required: true },
          password: { type: 'string', required: true }
        }
      },
      method({ username, password }) {
        // Authentication logic
        return { success: true, user: username }
      }
    }
  }
})
```

### Action Metadata

The metadata describes the action for both programmatic and visual usage:

```javascript
// Single metadata object
actions: {
  save: {
    metadata: {
      title: 'Save Data',
      description: 'Save data to storage',
      icon: 'mdi-content-save',  // For visual UI
      category: 'data'            // For organization
    },
    method() { /* ... */ }
  }
}

// Multiple metadata variants (for different contexts)
actions: {
  save: {
    metadata: [
      {
        id: 'local',
        title: 'Save Locally',
        description: 'Save to local storage',
        icon: 'mdi-harddisk'
      },
      {
        id: 'remote',
        title: 'Save Remotely',
        description: 'Save to server',
        icon: 'mdi-cloud-upload'
      }
    ],
    method() { /* ... */ }
  }
}
```

### Action Parameters

Parameters use a structured schema that enables:

1. **Validation**: Automatic parameter validation
2. **UI Generation**: Forms can be auto-generated
3. **Type Safety**: Clear input expectations

```javascript
actions: {
  createUser: {
    metadata: { title: 'Create User' },
    parameters: {
      type: 'object',
      properties: {
        name: { 
          type: 'string', 
          required: true,
          minLength: 1,
          maxLength: 100
        },
        email: { 
          type: 'string', 
          required: true,
          pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$'
        },
        age: { 
          type: 'number',
          minimum: 0,
          maximum: 120
        },
        role: {
          type: 'string',
          enum: ['user', 'admin', 'guest'],
          default: 'user'
        }
      }
    },
    method({ name, email, age, role }) {
      return { id: Date.now(), name, email, age, role }
    }
  }
}
```

### Calling Actions

Actions are called like methods but with namespaced names:

```javascript
const plugin = createPlugin('user', {
  metadata: { title: 'User Plugin' },
  actions: {
    login: {
      metadata: { title: 'Login' },
      parameters: {
        type: 'object',
        properties: {
          username: { type: 'string', required: true },
          password: { type: 'string', required: true }
        }
      },
      method({ username, password }) {
        return { success: true, user: username }
      }
    }
  }
})

// Programmatic usage
const result = plugin.userLogin({
  username: 'john',
  password: 'secret'
})
// Returns: { success: true, user: 'john' }
```

### Visual Programming Integration

The visual programming plugin (action.js) uses action metadata to:

1. **Generate UI**: Create forms and input fields
2. **Display Options**: Show actions in a searchable list
3. **Validate Inputs**: Ensure correct data types
4. **Provide Help**: Show descriptions and tooltips

```javascript
// Visual programming plugin can:
// 1. List all available actions
// 2. Display them with titles and descriptions
// 3. Generate forms based on parameters schema
// 4. Call the action with user input
```

### Action Context

Actions are executed with the plugin context bound to `this`, just like methods. The first argument contains the action parameters.

```javascript
actions: {
  save: {
    metadata: { title: 'Save' },
    method(params) {
      // 'this' refers to the plugin context
      console.log(this.name)
      
      // 'params' contains the action arguments
      console.log(params)
      
      return 'saved'
    }
  }
}
```

**Note:** The second argument to action methods is a reserved system object. Use `this` to access the plugin context and the first argument for parameters.

### When to Use Actions vs Methods

**Use Actions when:**
- The operation should be available to visual programming
- You need rich metadata (title, description, icons)
- Parameters need structured schemas
- You want auto-generated UIs

**Use Methods when:**
- The operation is internal to your plugin
- No UI generation is needed
- You need simple, flexible function signatures
- Performance is critical (methods have less overhead)

### Best Practices for Actions

1. **Descriptive Metadata**: Always provide clear titles and descriptions
2. **Complete Schemas**: Define all parameters with types and constraints
3. **Consistent Naming**: Use action names that describe the operation
4. **Error Handling**: Return meaningful errors that can be displayed in UI
5. **Documentation**: Document what each action does and its parameters

```javascript
// Good example
actions: {
  sendEmail: {
    metadata: {
      title: 'Send Email',
      description: 'Send an email to a recipient',
      icon: 'mdi-email-send',
      category: 'communication'
    },
    parameters: {
      type: 'object',
      properties: {
        to: { 
          type: 'string', 
          required: true,
          description: 'Email recipient address'
        },
        subject: { 
          type: 'string', 
          required: true,
          description: 'Email subject line'
        },
        body: { 
          type: 'string', 
          required: true,
          description: 'Email body content'
        }
      }
    },
    method({ to, subject, body }) {
      // Implementation
      return { success: true, recipient: to }
    }
  }
}
```

## Dependencies

### Defining Dependencies

Plugins can depend on other plugins. The `dependencies` array is primarily used to ensure that the `setup` functions of dependent plugins are executed **before** your plugin's `setup`.

```javascript
const storagePlugin = createPlugin('storage', {
  metadata: { title: 'Storage Plugin' },
  methods: {
    save(key, value) {
      // Save to storage
    }
  },
  setup() {
    // Connect to database...
    return 'connected'
  }
})

const userPlugin = createPlugin('user', {
  metadata: { title: 'User Plugin' },
  // Ensures storagePlugin.setup() runs before userPlugin.setup()
  dependencies: [storagePlugin],
  actions: {
    saveProfile: {
      metadata: { title: 'Save Profile' },
      method({ profile }) {
        // Dependent plugins are NOT injected into 'this'.
        // Call their methods directly on the imported instance.
        return storagePlugin.storageSave('profile', profile)
      }
    }
  }
})
```

### Using Other Plugins

There is no automatic "Dependency Injection" in `createPlugin`. The `dependencies` array is strictly used to define **initialization order** (ensuring the dependent plugin's `setup()` function runs before yours).

To use methods from another plugin, you simply import the plugin instance and call its methods directly. Since `createPlugin` returns a stable object with exported methods, you do not need them to be injected into `this`.

```javascript
import { createPlugin } from '@dooksa/create-plugin'

// Define a dependency
const mathPlugin = createPlugin('math', {
  methods: {
    add(a, b) { return a + b }
  }
})

// Define a dependent plugin
const calculatorPlugin = createPlugin('calculator', {
  // Ensures mathPlugin.setup() runs before calculatorPlugin.setup()
  dependencies: [mathPlugin],
  
  methods: {
    calculate() {
      // Call methods directly from the imported instance
      return mathPlugin.mathAdd(5, 10)
    }
  }
})
```

**Key Concept:**
- **`dependencies: []`**: Controls lifecycle order (e.g., ensuring a Database plugin connects before a User plugin tries to query it).
- **Direct Access**: Use standard JavaScript imports to access other plugins' functionality.

## Lifecycle & Setup

### Setup Function

The setup function runs once when the plugin is initialized:

```javascript
const plugin = createPlugin('app', {
  metadata: { title: 'Application' },
  data: {
    initialized: false
  },
  setup() {
    // This runs once when plugin is created
    this.initialized = true
    console.log('Plugin initialized!')
    return 'ready'
  }
})

// Setup is called automatically
const result = plugin.setup()  // Returns: 'ready'
console.log(plugin.data.initialized)  // true
```

### Setup Context

The setup function has access to the full plugin context:

```javascript
const plugin = createPlugin('user', {
  metadata: { title: 'User Plugin' },
  data: {
    users: [],
    count: 0
  },
  methods: {
    addUser(name) {
      this.users.push({ id: Date.now(), name })
      this.count++
      return this.count
    }
  },
  setup() {
    // Access all plugin features
    this.addUser('Admin')
    return `Initialized with ${this.count} user(s)`
  }
})

plugin.setup()  // Returns: "Initialized with 1 user(s)"
```

**Note:** State properties defined in `state.schema` are **not** accessible via `this`. Use the `state` plugin's actions (e.g., `stateSetValue`, `stateGetValue`) to interact with global state.

## Testing & Mocking

### Observable Instances

In development mode, plugins can create observable (mocked) instances for testing:

```javascript
import { createPlugin } from '@dooksa/create-plugin'
import { test } from 'node:test'

test('plugin behavior', async (t) => {
  const plugin = createPlugin('counter', {
    metadata: { title: 'Counter' },
    data: {
      count: 0
    },
    methods: {
      increment() {
        this.count++
        return this.count
      }
    }
  })

  // Create observable instance
  const observable = plugin.createObservableInstance(t)

  // Call the method
  const result = observable.testIncrement()

  // Verify the mock was called
  t.assert(observable.observe.increment.mock.calls.length === 1)
  t.assert(result === 1)
})
```

### Mock Assertions

Observable instances provide access to mock tracking:

```javascript
const observable = plugin.createObservableInstance(t)

// Call methods
observable.testMethod1()
observable.testMethod2('arg')

// Check mock calls
console.log(observable.observe.method1.mock.calls.length)  // 1
console.log(observable.observe.method1.mock.results)       // [{ type: 'return', value: ... }]

// Check specific call
const firstCall = observable.observe.method2.mock.calls[0]
console.log(firstCall.arguments)  // ['arg']
```

### Restore Function

Reset the plugin to its original state:

```javascript
const plugin = createPlugin('counter', {
  metadata: { title: 'Counter' },
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

// Restore to original state
plugin.restore()

// State is reset
plugin.counterIncrement()  // count = 1 (starts from 0 again)
```

## Best Practices

### 1. Keep Methods Focused

Each method should have a single responsibility:

```javascript
// Good
methods: {
  validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  },
  sendEmail(to, subject, body) {
    // Send email logic
  }
}

// Avoid
methods: {
  processEmail(email, subject, body) {
    // Validation + sending in one method
  }
}
```

### 2. Use Private Methods for Internal Logic

Keep implementation details private:

```javascript
// Good
privateMethods: {
  encryptPassword(password) {
    // Encryption logic
    return encrypted
  }
},
actions: {
  register: {
    method({ password }) {
      const encrypted = this.encryptPassword(password)
      // Store encrypted password
    }
  }
}
```

### 3. Validate Parameters

Always validate action parameters:

```javascript
actions: {
  createUser: {
    parameters: {
      type: 'object',
      properties: {
        email: { type: 'string', required: true },
        age: { type: 'number', minimum: 0 }
      }
    },
    method({ email, age }) {
      // Parameters are validated by the schema system
      // ...
    }
  }
}
```

### 4. Use Dependencies Wisely

Only depend on what you need:

```javascript
// Good - only depend on storage
const plugin = createPlugin('user', {
  dependencies: [storagePlugin],
  // ...
})

// Avoid - depending on everything
const plugin = createPlugin('user', {
  dependencies: [storagePlugin, apiPlugin, uiPlugin, analyticsPlugin],
  // ...
})
```

### 5. Document Your Plugin

Use metadata to document your plugin:

```javascript
const plugin = createPlugin('myPlugin', {
  metadata: {
    title: 'My Plugin',
    description: 'Handles user authentication and profile management',
    author: 'Your Name',
    version: '1.0.0'
  },
  // ...
})
```

### 6. Handle Errors Gracefully

Use try-catch for error handling:

```javascript
methods: {
  async fetchData() {
    try {
      const response = await fetch('/api/data')
      return await response.json()
    } catch (error) {
      console.error('Failed to fetch data:', error)
      throw new Error('Data fetch failed')
    }
  }
}
```

### 7. Test Thoroughly

Write tests for all plugin features:

```javascript
import { test } from 'node:test'
import { strictEqual } from 'node:assert'

test('counter plugin', async (t) => {
  const plugin = createPlugin('counter', {
    // ... plugin definition
  })

  await t.test('increment method', () => {
    const result = plugin.counterIncrement()
    strictEqual(result, 1)
  })

  await t.test('restore functionality', () => {
    plugin.counterIncrement()
    plugin.counterIncrement()
    plugin.restore()
    strictEqual(plugin.counterIncrement(), 1)
  })
})
```

## Next Steps

- Read the [Testing Guide](testing.md) for comprehensive instructions on testing plugins
- Read the [Reference Documentation](reference.md) for complete API details
- Explore the [Restore Documentation](restore.md) for testing patterns
- Check out the test files in `packages/create-plugin/test/` for examples
