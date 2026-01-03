# CreatePlugin User Guide

Welcome to the createPlugin user guide! This tutorial will take you from zero to production-ready plugins with practical examples and best practices.

## 🎯 What You'll Learn

- How to create your first plugin in 5 minutes
- Understanding the plugin architecture
- Building real-world plugins with state, actions, and methods
- Advanced patterns for complex applications
- Troubleshooting common issues

## 🚀 Getting Started

### Installation

```bash
npm install @dooksa/create-plugin
```

### Your First Plugin (5-Minute Tutorial)

Let's create a simple counter plugin to understand the basics:

```javascript
import { createPlugin } from '@dooksa/create-plugin'

// Step 1: Create the plugin
const counterPlugin = createPlugin('counter', {
  // Plugin metadata
  metadata: {
    title: 'Counter Plugin',
    description: 'A simple counter for demonstration'
  },
  
  // State management
  state: {
    defaults: {
      count: 0
    },
    schema: {
      count: { type: 'number' }
    }
  },
  
  // Public methods
  methods: {
    getValue() {
      return this.count
    },
    
    increment() {
      this.count++
      return this.count
    }
  },
  
  // Actions
  actions: {
    add: {
      metadata: {
        title: 'Add to Counter'
      },
      parameters: {
        type: 'object',
        properties: {
          value: { type: 'number', required: true }
        }
      },
      method({ value }) {
        this.count += value
        return this.count
      }
    }
  }
})

// Step 2: Use your plugin
console.log(counterPlugin.counterGetValue()) // 0
console.log(counterPlugin.counterIncrement()) // 1
console.log(counterPlugin.counterAdd({ value: 5 })) // 6
```

**What just happened?**
- ✅ Created a plugin named 'counter'
- ✅ Added state with a count property
- ✅ Created public methods (getValue, increment)
- ✅ Created an action (add) with parameters
- ✅ All methods are namespaced (counterGetValue, counterAdd)

## 🏗️ Core Concepts

### 1. Plugin Structure

Every plugin has these key components:

```javascript
const myPlugin = createPlugin('myPlugin', {
  // 1. Metadata - Plugin identity
  metadata: { title: 'My Plugin', description: '...' },
  
  // 2. Dependencies - Other plugins needed
  dependencies: [otherPlugin],
  
  // 3. State - Global data management
  state: { defaults: {}, schema: {} },
  
  // 4. Data - Initial values (configuration)
  data: { config: {} },
  
  // 5. Methods - Public API
  methods: { publicMethod() {} },
  
  // 6. Private Methods - Internal logic
  privateMethods: { internalMethod() {} },
  
  // 7. Actions - Callable functions
  actions: { actionName: { method() {} } },
  
  // 8. Setup - Initialization
  setup() { return 'ready' }
})
```

### 2. State Management - Global Data Only

**Important**: The `state` property is designed **exclusively for global state** - data that needs to be accessible across multiple plugins or components in your application.

#### ✅ Correct: State for Global Data

```javascript
state: {
  defaults: {
    // Global user session (accessible by auth, permissions, UI plugins)
    currentUser: null,
    
    // Global app settings (accessible by theme, layout plugins)
    settings: {
      theme: 'light',
      language: 'en'
    },
    
    // Global cache (accessible by performance monitoring plugins)
    cacheStats: {
      hits: 0,
      misses: 0
    }
  },
  schema: {
    currentUser: { type: 'object' },
    settings: { type: 'object' },
    cacheStats: { type: 'object' }
  }
}
```

#### ❌ Incorrect: State for Private Data

```javascript
// DON'T DO THIS
state: {
  defaults: {
    // Private internal state - not needed globally
    requestQueue: new Map(),
    cacheStore: new Map(),
    rateLimitCounters: new Map(),
    internalConfig: {},
    tempData: []
  }
}
```

#### ✅ Correct: Private Data in Module Scope

```javascript
// Private module-level variables (not in state)
const requestQueue = new Map()
const cacheStore = new Map()
const rateLimitCounters = new Map()

const myPlugin = createPlugin('myPlugin', {
  // State only for global data
  state: {
    defaults: {
      // Only data that other plugins might need
      stats: { totalRequests: 0 }
    },
    schema: {
      stats: { type: 'object' }
    }
  },
  
  // Configuration in data property
  data: {
    config: {
      timeout: 5000,
      retryAttempts: 3
    }
  },
  
  // Private methods for internal logic
  privateMethods: {
    // Use module-level variables internally
    addToQueue(id, request) {
      requestQueue.set(id, request)
    },
    
    getFromQueue(id) {
      return requestQueue.get(id)
    }
  },
  
  // Public methods for user API
  methods: {
    getStats() {
      // Can access global state
      return this.stats
    }
  }
})
```

### 3. When to Use Each Property

| Property | Purpose | Example | Global? |
|----------|---------|---------|---------|
| `state` | Data accessible by other plugins | `currentUser`, `appSettings` | ✅ Yes |
| `data` | Configuration and initial values | `apiUrl`, `timeout` | ❌ No |
| `privateMethods` | Internal logic | `validateEmail()`, `generateId()` | ❌ No |
| `module variables` | Private state | `requestQueue`, `cacheStore` | ❌ No |

### 4. State vs Data Comparison

```javascript
// State - Global, reactive, accessible by other plugins
state: {
  defaults: {
    userSession: null,  // Auth plugin needs this
    permissions: []     // Access control needs this
  }
}

// Data - Configuration, not reactive, private
data: {
  apiBase: '/api',      // Only fetch plugin needs this
  timeout: 5000         // Only fetch plugin needs this
}

// Private variables - Completely internal
const cache = new Map() // Only this plugin uses this
```

### 5. Best Practices

```javascript
// ✅ Good: State for shared data
state: {
  defaults: {
    currentUser: null,
    appTheme: 'light'
  }
}

// ✅ Good: Data for configuration
data: {
  config: {
    retryAttempts: 3,
    cacheTTL: 300000
  }
}

// ✅ Good: Module variables for private state
const pendingRequests = new Map()

// ❌ Bad: State for private data
state: {
  defaults: {
    internalQueue: [],  // Should be module variable
    tempCache: {}       // Should be module variable
  }
}

// ❌ Bad: Data for shared state
data: {
  currentUser: null    // Should be in state
}
```

### 6. Performance Considerations

**State**:
- Triggers reactivity system
- Can be observed by other plugins
- Uses more memory
- Slower to update

**Data/Module Variables**:
- No reactivity overhead
- Private to plugin
- Faster access
- Lower memory usage

**Rule of Thumb**: If other plugins don't need to watch or react to the data, don't put it in state.

### 7. Methods vs Actions

**Methods** are public functions exposed on the plugin object:

```javascript
methods: {
  getUser(id) {
    return this.users[id]
  },
  
  getAllUsers() {
    return Object.values(this.users)
  }
}

// Usage
plugin.myPluginGetUser('user123')
plugin.myPluginGetAllUsers()
```

**Actions** are callable functions with metadata and parameters:

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
    method({ name, email }) {
      const id = this.generateId()
      this.users[id] = { id, name, email }
      return id
    }
  }
}

// Usage
plugin.myPluginCreateUser({ name: 'John', email: 'john@example.com' })
```

**When to use each:**
- Use **methods** for simple data access and manipulation
- Use **actions** for complex operations with validation and metadata
- Use **actions** when you need to expose functionality to other systems

### 8. Private Methods

Private methods are internal functions not exposed publicly:

```javascript
privateMethods: {
  validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  },
  
  generateId() {
    return Math.random().toString(36).substr(2, 9)
  },
  
  async apiCall(endpoint, data) {
    const response = await fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    })
    return response.json()
  }
},

methods: {
  registerUser(email, password) {
    if (!this.validateEmail(email)) {
      throw new Error('Invalid email')
    }
    
    const id = this.generateId()
    return this.apiCall('/api/users', { id, email, password })
  }
}
```

### 9. Context Binding

All functions share the same context (`this`):

```javascript
data: {
  apiKey: 'secret-key',
  endpoint: '/api'
},

privateMethods: {
  async request(path, options) {
    // Access data via 'this'
    const url = this.endpoint + path
    const response = await fetch(url, {
      headers: { 'Authorization': this.apiKey },
      ...options
    })
    return response.json()
  }
},

methods: {
  async getUser(id) {
    // Can call private methods
    return this.request(`/users/${id}`)
  }
},

actions: {
  updateUser: {
    method({ id, data }) {
      // Can access everything
      return this.request(`/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      })
    }
  }
}
```

## 🛠️ Building Real-World Plugins

### Example 1: User Authentication Plugin

```javascript
import { createPlugin } from '@dooksa/create-plugin'

const authPlugin = createPlugin('auth', {
  metadata: {
    title: 'Authentication',
    description: 'User authentication and session management'
  },
  
  state: {
    defaults: {
      user: null,
      token: null,
      isAuthenticated: false
    },
    schema: {
      user: {
        type: 'object',
        properties: {
          id: { type: 'string', required: true },
          name: { type: 'string', required: true },
          email: { type: 'string', required: true }
        }
      },
      token: { type: 'string' },
      isAuthenticated: { type: 'boolean' }
    }
  },
  
  data: {
    apiBase: '/api/auth',
    tokenKey: 'auth_token'
  },
  
  privateMethods: {
    async apiCall(endpoint, options = {}) {
      const url = this.apiBase + endpoint
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers
      }
      
      // Add token if available
      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`
      }
      
      const response = await fetch(url, { ...options, headers })
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }
      
      return response.json()
    },
    
    saveToken(token) {
      this.token = token
      localStorage.setItem(this.tokenKey, token)
    },
    
    clearToken() {
      this.token = null
      localStorage.removeItem(this.tokenKey)
    }
  },
  
  methods: {
    getUser() {
      return this.user
    },
    
    isAuthenticated() {
      return this.isAuthenticated
    },
    
    async loadToken() {
      const token = localStorage.getItem(this.tokenKey)
      if (token) {
        this.token = token
        return true
      }
      return false
    }
  },
  
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
        const response = await this.apiCall('/login', {
          method: 'POST',
          body: JSON.stringify({ email, password })
        })
        
        this.saveToken(response.token)
        this.user = response.user
        this.isAuthenticated = true
        
        return response.user
      }
    },
    
    logout: {
      metadata: {
        title: 'User Logout',
        description: 'End user session'
      },
      method() {
        this.clearToken()
        this.user = null
        this.isAuthenticated = false
        return true
      }
    },
    
    register: {
      metadata: {
        title: 'User Registration',
        description: 'Create a new user account'
      },
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', required: true },
          email: { type: 'string', required: true },
          password: { type: 'string', required: true }
        }
      },
      async method({ name, email, password }) {
        const response = await this.apiCall('/register', {
          method: 'POST',
          body: JSON.stringify({ name, email, password })
        })
        
        return response.user
      }
    },
    
    refreshToken: {
      metadata: {
        title: 'Refresh Token',
        description: 'Refresh authentication token'
      },
      async method() {
        const response = await this.apiCall('/refresh', {
          method: 'POST'
        })
        
        this.saveToken(response.token)
        return response.token
      }
    }
  },
  
  setup() {
    // Try to load existing token
    return this.loadToken()
  }
})

// Usage
await authPlugin.authLogin({ email: 'user@example.com', password: 'secret' })
const user = authPlugin.authGetUser()
const isLoggedIn = authPlugin.authIsAuthenticated()
await authPlugin.authLogout()
```

### Example 2: Data Table Plugin

```javascript
const dataTablePlugin = createPlugin('dataTable', {
  metadata: {
    title: 'Data Table',
    description: 'Manage and display tabular data'
  },
  
  state: {
    defaults: {
      data: [],
      columns: [],
      filters: {},
      sort: { field: null, direction: 'asc' },
      pagination: { page: 1, pageSize: 10, total: 0 }
    },
    schema: {
      data: { type: 'array' },
      columns: { type: 'array' },
      filters: { type: 'object' },
      sort: {
        type: 'object',
        properties: {
          field: { type: 'string' },
          direction: { type: 'string' }
        }
      },
      pagination: {
        type: 'object',
        properties: {
          page: { type: 'number' },
          pageSize: { type: 'number' },
          total: { type: 'number' }
        }
      }
    }
  },
  
  privateMethods: {
    applyFilters(data) {
      return data.filter(item => {
        for (const [key, value] of Object.entries(this.filters)) {
          if (item[key] !== value) return false
        }
        return true
      })
    },
    
    applySort(data) {
      if (!this.sort.field) return data
      
      return [...data].sort((a, b) => {
        const aVal = a[this.sort.field]
        const bVal = b[this.sort.field]
        
        if (this.sort.direction === 'asc') {
          return aVal > bVal ? 1 : -1
        } else {
          return aVal < bVal ? 1 : -1
        }
      })
    },
    
    applyPagination(data) {
      const start = (this.pagination.page - 1) * this.pagination.pageSize
      const end = start + this.pagination.pageSize
      return data.slice(start, end)
    }
  },
  
  methods: {
    getDisplayData() {
      let result = this.data
      
      // Apply filters
      result = this.applyFilters(result)
      
      // Apply sort
      result = this.applySort(result)
      
      // Update total count
      this.pagination.total = result.length
      
      // Apply pagination
      result = this.applyPagination(result)
      
      return result
    },
    
    getColumns() {
      return this.columns
    },
    
    getPagination() {
      return this.pagination
    }
  },
  
  actions: {
    setData: {
      metadata: { title: 'Set Data' },
      parameters: {
        type: 'object',
        properties: {
          data: { type: 'array', required: true },
          columns: { type: 'array' }
        }
      },
      method({ data, columns }) {
        this.data = data
        if (columns) this.columns = columns
        this.pagination.page = 1
        return true
      }
    },
    
    setFilter: {
      metadata: { title: 'Set Filter' },
      parameters: {
        type: 'object',
        properties: {
          field: { type: 'string', required: true },
          value: { type: 'any' }
        }
      },
      method({ field, value }) {
        if (value === null || value === undefined) {
          delete this.filters[field]
        } else {
          this.filters[field] = value
        }
        this.pagination.page = 1
        return this.filters
      }
    },
    
    clearFilters: {
      metadata: { title: 'Clear Filters' },
      method() {
        this.filters = {}
        this.pagination.page = 1
        return true
      }
    },
    
    setSort: {
      metadata: { title: 'Set Sort' },
      parameters: {
        type: 'object',
        properties: {
          field: { type: 'string', required: true }
        }
      },
      method({ field }) {
        if (this.sort.field === field) {
          // Toggle direction
          this.sort.direction = this.sort.direction === 'asc' ? 'desc' : 'asc'
        } else {
          this.sort.field = field
          this.sort.direction = 'asc'
        }
        return this.sort
      }
    },
    
    setPage: {
      metadata: { title: 'Set Page' },
      parameters: {
        type: 'object',
        properties: {
          page: { type: 'number', required: true }
        }
      },
      method({ page }) {
        this.pagination.page = page
        return this.pagination
      }
    },
    
    setPageSize: {
      metadata: { title: 'Set Page Size' },
      parameters: {
        type: 'object',
        properties: {
          size: { type: 'number', required: true }
        }
      },
      method({ size }) {
        this.pagination.pageSize = size
        this.pagination.page = 1
        return this.pagination
      }
    }
  }
})

// Usage
dataTablePlugin.dataTableSetData({
  data: [
    { id: 1, name: 'John', age: 30 },
    { id: 2, name: 'Jane', age: 25 },
    { id: 3, name: 'Bob', age: 35 }
  ],
  columns: ['id', 'name', 'age']
})

dataTablePlugin.dataTableSetFilter({ field: 'age', value: 30 })
dataTablePlugin.dataTableSetSort({ field: 'name' })
dataTablePlugin.dataTableSetPage({ page: 2 })

const displayData = dataTablePlugin.dataTableGetDisplayData()
```

### Example 3: Cache Plugin

```javascript
const cachePlugin = createPlugin('cache', {
  metadata: {
    title: 'Cache Manager',
    description: 'In-memory cache with TTL support'
  },
  
  state: {
    defaults: {
      entries: {}
    },
    schema: {
      entries: { type: 'collection' }
    }
  },
  
  data: {
    defaultTTL: 300000 // 5 minutes
  },
  
  privateMethods: {
    isExpired(entry) {
      if (!entry.expiresAt) return false
      return Date.now() > entry.expiresAt
    },
    
    cleanup() {
      const entries = this.entries
      for (const key in entries) {
        if (this.isExpired(entries[key])) {
          delete entries[key]
        }
      }
    }
  },
  
  methods: {
    get(key) {
      this.cleanup()
      
      const entry = this.entries[key]
      if (!entry) return null
      
      if (this.isExpired(entry)) {
        delete this.entries[key]
        return null
      }
      
      return entry.value
    },
    
    has(key) {
      this.cleanup()
      return this.entries[key] !== undefined && !this.isExpired(this.entries[key])
    },
    
    getAll() {
      this.cleanup()
      const result = {}
      for (const key in this.entries) {
        result[key] = this.entries[key].value
      }
      return result
    },
    
    getStats() {
      this.cleanup()
      return {
        total: Object.keys(this.entries).length,
        size: JSON.stringify(this.entries).length
      }
    }
  },
  
  actions: {
    set: {
      metadata: { title: 'Set Cache' },
      parameters: {
        type: 'object',
        properties: {
          key: { type: 'string', required: true },
          value: { type: 'any', required: true },
          ttl: { type: 'number' }
        }
      },
      method({ key, value, ttl }) {
        const expiresAt = ttl 
          ? Date.now() + ttl 
          : Date.now() + this.defaultTTL
        
        this.entries[key] = {
          value,
          expiresAt,
          createdAt: Date.now()
        }
        
        return true
      }
    },
    
    remove: {
      metadata: { title: 'Remove Cache' },
      parameters: {
        type: 'object',
        properties: {
          key: { type: 'string', required: true }
        }
      },
      method({ key }) {
        delete this.entries[key]
        return true
      }
    },
    
    clear: {
      metadata: { title: 'Clear Cache' },
      method() {
        this.entries = {}
        return true
      }
    },
    
    setDefaultTTL: {
      metadata: { title: 'Set Default TTL' },
      parameters: {
        type: 'object',
        properties: {
          ttl: { type: 'number', required: true }
        }
      },
      method({ ttl }) {
        this.defaultTTL = ttl
        return ttl
      }
    }
  },
  
  setup() {
    // Periodic cleanup
    setInterval(() => this.cleanup(), 60000) // Every minute
    return 'Cache service ready'
  }
})

// Usage
cachePlugin.cacheSet({ key: 'user:123', value: { name: 'John' }, ttl: 60000 })
const user = cachePlugin.cacheGet({ key: 'user:123' })
cachePlugin.cacheRemove({ key: 'user:123' })
```

## 🔧 Advanced Patterns

### Pattern 1: Plugin Composition

```javascript
// Base plugin with shared functionality
const basePlugin = createPlugin('base', {
  methods: {
    log(message) {
      console.log(`[${this.name}] ${message}`)
    },
    
    error(message) {
      console.error(`[${this.name}] ERROR: ${message}`)
    }
  }
})

// Plugin that depends on base
const advancedPlugin = createPlugin('advanced', {
  dependencies: [basePlugin],
  
  methods: {
    doSomething() {
      this.log('Starting operation')
      // ... work
      this.log('Operation complete')
    }
  }
})
```

### Pattern 2: Event Emitter

```javascript
const eventPlugin = createPlugin('events', {
  state: {
    defaults: {
      listeners: {}
    },
    schema: {
      listeners: { type: 'collection' }
    }
  },
  
  privateMethods: {
    emit(event, data) {
      const listeners = this.listeners[event] || []
      listeners.forEach(callback => callback(data))
    }
  },
  
  methods: {
    on(event, callback) {
      if (!this.listeners[event]) {
        this.listeners[event] = []
      }
      this.listeners[event].push(callback)
      return () => this.off(event, callback)
    },
    
    off(event, callback) {
      if (this.listeners[event]) {
        this.listeners[event] = this.listeners[event].filter(cb => cb !== callback)
      }
    }
  },
  
  actions: {
    emit: {
      metadata: { title: 'Emit Event' },
      parameters: {
        type: 'object',
        properties: {
          event: { type: 'string', required: true },
          data: { type: 'any' }
        }
      },
      method({ event, data }) {
        this.emit(event, data)
        return true
      }
    }
  }
})
```

### Pattern 3: Async Queue

```javascript
const queuePlugin = createPlugin('queue', {
  state: {
    defaults: {
      queue: [],
      processing: false
    },
    schema: {
      queue: { type: 'array' },
      processing: { type: 'boolean' }
    }
  },
  
  privateMethods: {
    async processNext() {
      if (this.processing || this.queue.length === 0) {
        return
      }
      
      this.processing = true
      const task = this.queue.shift()
      
      try {
        await task()
      } catch (error) {
        console.error('Task failed:', error)
      }
      
      this.processing = false
      
      // Process next
      if (this.queue.length > 0) {
        this.processNext()
      }
    }
  },
  
  methods: {
    getLength() {
      return this.queue.length
    },
    
    isProcessing() {
      return this.processing
    }
  },
  
  actions: {
    add: {
      metadata: { title: 'Add Task' },
      parameters: {
        type: 'object',
        properties: {
          task: { type: 'any', required: true }
        }
      },
      method({ task }) {
        this.queue.push(task)
        this.processNext()
        return this.queue.length
      }
    },
    
    clear: {
      metadata: { title: 'Clear Queue' },
      method() {
        this.queue = []
        return true
      }
    }
  }
})
```

## 🐛 Troubleshooting

### Common Issues

#### 1. "Expected unique method name"

**Problem:** Duplicate method/action names

```javascript
// ❌ Wrong
createPlugin('test', {
  data: { conflict: 'value' },
  methods: {
    conflict() { return 'bad' }
  }
})

// ✅ Correct
createPlugin('test', {
  data: { myData: 'value' },
  methods: {
    conflict() { return 'good' }
  }
})
```

#### 2. "this" is undefined

**Problem:** Arrow functions don't bind context

```javascript
// ❌ Wrong
methods: {
  getUser: () => this.user // 'this' is undefined
}

// ✅ Correct
methods: {
  getUser() { return this.user }
}
```

#### 3. State not updating

**Problem:** Mutating state directly

```javascript
// ❌ Wrong
methods: {
  addItem(item) {
    this.items.push(item) // Won't trigger reactivity
  }
}

// ✅ Correct
methods: {
  addItem(item) {
    this.items = [...this.items, item] // Creates new array
  }
}
```

#### 4. Actions not accessible

**Problem:** Forgetting namespacing

```javascript
// ❌ Wrong
plugin.login() // Doesn't exist

// ✅ Correct
plugin.myPluginLogin()
```

### Debug Tips

```javascript
// Enable debug logging
const plugin = createPlugin('debug', {
  metadata: { title: 'Debug Plugin' },
  
  methods: {
    getUser(id) {
      console.log('getUser called with:', id)
      console.log('Current state:', this)
      const result = this.users[id]
      console.log('Result:', result)
      return result
    }
  },
  
  actions: {
    updateUser: {
      method(params) {
        console.group('updateUser action')
        console.log('Params:', params)
        console.log('Context:', this)
        console.groupEnd()
        // ... implementation
      }
    }
  }
})
```

## 📚 Best Practices

### 1. Naming Conventions

```javascript
// ✅ Good
const userPlugin = createPlugin('user', {
  metadata: { title: 'User Management' },
  methods: {
    getUser() {},        // userGetUser()
    getAllUsers() {}     // userGetAllUsers()
  },
  actions: {
    createUser: {},      // userCreateUser()
    updateUser: {}       // userUpdateUser()
  }
})

// ❌ Bad
const userPlugin = createPlugin('user', {
  methods: {
    get() {},            // Unclear
    all() {}             // Unclear
  },
  actions: {
    create: {},          // Unclear
    update: {}           // Unclear
  }
})
```

### 2. State vs Data

```javascript
// ✅ Good
state: {
  defaults: {
    currentUser: null,     // Changes frequently
    items: []              // Changes frequently
  }
},
data: {
  apiBase: '/api',         // Static config
  timeout: 5000            // Static config
}

// ❌ Bad
state: {
  defaults: {
    apiBase: '/api',       // Should be in data
    timeout: 5000          // Should be in data
  }
},
data: {
  currentUser: null,       // Should be in state
  items: []                // Should be in state
}
```

### 3. Error Handling

```javascript
// ✅ Good
actions: {
  fetchUser: {
    method: async ({ id }) {
      try {
        const user = await this.apiCall(`/users/${id}`)
        return user
      } catch (error) {
        this.error(`Failed to fetch user ${id}: ${error.message}`)
        throw new Error(`User fetch failed: ${error.message}`)
      }
    }
  }
}

// ❌ Bad
actions: {
  fetchUser: {
    method: async ({ id }) {
      const user = await this.apiCall(`/users/${id}`)
      return user // No error handling
    }
  }
}
```

### 4. Documentation

```javascript
// ✅ Good
/**
 * User Management Plugin
 * 
 * Handles user authentication, registration, and profile management.
 * 
 * @example
 * await userPlugin.userLogin({ email, password })
 * const user = userPlugin.userGetCurrentUser()
 */
const userPlugin = createPlugin('user', {
  metadata: {
    title: 'User Management',
    description: 'Handles user authentication and profiles'
  },
  
  /**
   * Login action
   * @param {Object} credentials - User credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password
   * @returns {Promise<Object>} User object
   */
  actions: {
    login: {
      metadata: {
        title: 'User Login',
        description: 'Authenticate a user'
      },
      // ...
    }
  }
})
```

## 🎓 Learning Path

### Beginner (You are here)
- ✅ Create simple plugins with state and methods
- ✅ Understand namespacing
- ✅ Build basic actions

### Intermediate
- [ ] Use private methods for internal logic
- [ ] Implement plugin dependencies
- [ ] Handle async operations
- [ ] Add proper error handling

### Advanced
- [ ] Create plugin compositions
- [ ] Implement event systems
- [ ] Build complex state management
- [ ] Optimize performance

## 📖 Next Steps

1. **Read the Reference Documentation** - Complete API details
2. **Explore Examples** - Study the real-world examples above
3. **Build Your First Plugin** - Start with a simple use case
4. **Join the Community** - Share your plugins and get help

## 🆘 Getting Help

- **Reference Docs**: `docs/reference.md` - Complete API reference
- **Examples**: See the examples in this guide
- **Tests**: Check `test/create-plugin.spec.js` for usage patterns
- **Source Code**: Read `src/create-plugin.js` for implementation details

---

**Happy Plugin Building!** 🚀
