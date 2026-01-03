# Examples

Practical examples demonstrating common use cases and patterns for `@dooksa/create-app`.

## Table of Contents

1. [Basic Examples](#basic-examples)
2. [Server Applications](#server-applications)
3. [Client Applications](#client-applications)
4. [Advanced Patterns](#advanced-patterns)
5. [Real-World Scenarios](#real-world-scenarios)

## Basic Examples

### Hello World

**Server:**
```javascript
import createApp from '@dooksa/create-app/server'

const app = createApp()
app.setup({ options: { port: 3000 } })
console.log('Server running on port 3000')
```

**Client:**
```javascript
import createApp from '@dooksa/create-app/client'

const app = createApp()
app.setup({ options: {} })
console.log('Client initialized')
```

### Quick Customization

```javascript
// Server with custom port
import createApp from '@dooksa/create-app/server'

const app = createApp()
app.setup({ options: { port: 8080 } })
```

```javascript
// Client with custom components
import createApp from '@dooksa/create-app/client'

const app = createApp({
  components: {
    'my-button': {
      id: 'my-button',
      name: 'My Button',
      options: { variants: ['primary', 'secondary'] }
    }
  }
})
app.setup({ options: {} })
```

## Server Applications

### Basic Server with Custom Plugins

```javascript
import createApp from '@dooksa/create-app/server'
import databasePlugin from './plugins/database.js'
import authPlugin from './plugins/auth.js'

const app = createApp({
  serverPlugins: {
    database: databasePlugin
  }
})

// Add authentication
app.usePlugin(authPlugin)

// Add custom action
app.useAction({
  id: 'user-register',
  name: 'register',
  method: (params, context) => {
    // Registration logic
    return { userId: '123' }
  }
})

// Start server
const server = app.setup({
  options: {
    port: 3000,
    host: 'localhost'
  }
})
```

### Multi-Environment Server

```javascript
import createApp from '@dooksa/create-app/server'
import devDbPlugin from './plugins/dev-db.js'
import prodDbPlugin from './plugins/prod-db.js'

const isProduction = process.env.NODE_ENV === 'production'

const app = createApp({
  serverPlugins: {
    database: isProduction ? prodDbPlugin : devDbPlugin
  },
  clientPlugins: {
    fetch: isProduction ? prodFetchPlugin : devFetchPlugin
  }
})

// Environment-specific actions
if (!isProduction) {
  app.useAction({
    id: 'debug-log',
    name: 'debug',
    method: (params) => {
      console.log('Debug:', params)
      return { logged: true }
    }
  })
}

app.setup({
  options: {
    port: process.env.PORT || 3000
  }
})
```

### API Server with Authentication

```javascript
import createApp from '@dooksa/create-app/server'
import httpPlugin from './plugins/http.js'
import authPlugin from './plugins/auth.js'
import databasePlugin from './plugins/database.js'

const app = createApp({
  serverPlugins: {
    http: httpPlugin,
    database: databasePlugin
  }
})

app.usePlugin(authPlugin)

// Protected action
app.useAction({
  id: 'get-user-profile',
  name: 'getUserProfile',
  method: (params, context) => {
    if (!context.user) {
      throw new Error('Unauthorized')
    }
    
    return databasePlugin.getUser(params.userId)
  }
})

// Public action
app.useAction({
  id: 'public-info',
  name: 'getPublicInfo',
  method: () => {
    return { version: '1.0.0' }
  }
})

app.setup({
  options: {
    port: 3000,
    cors: { origin: '*' }
  }
})
```

### Server with Lazy Loading

```javascript
import createApp from '@dooksa/create-app/server'

const app = createApp()

// Core plugins loaded immediately
app.usePlugin(statePlugin)

app.setup({
  options: { port: 3000 },
  
  // Lazy load heavy plugins
  lazy: {
    'admin': './plugins/admin.js',
    'reporting': './plugins/reporting.js',
    'bulk-import': './plugins/bulk-import.js'
  },
  
  loader: async (fileName) => {
    const module = await import(fileName)
    return module.default
  }
})

// Admin plugin loads only when admin action is called
// Reporting plugin loads only when reporting action is called
```

## Client Applications

### Basic Client with Custom Components

```javascript
import createApp from '@dooksa/create-app/client'
import customButton from './components/custom-button.js'
import customForm from './components/custom-form.js'

const app = createApp({
  components: {
    'button': customButton,
    'form': customForm
  }
})

app.setup({ options: {} })
```

### Minimal Client (Reduced Bundle)

```javascript
import createApp from '@dooksa/create-app/client'

const app = createApp({
  // Only use base components
  excludeExtraComponents: true,
  excludeBootstrapComponents: true
})

app.setup({ options: {} })
```

### Client with Plugin System

```javascript
import createApp from '@dooksa/create-app/client'

const app = createApp()

// Add core functionality
app.usePlugin(authPlugin)
app.usePlugin(routerPlugin)
app.usePlugin(statePlugin)

// Add UI components
app.useComponent(customButton)
app.useComponent(customModal)

// Initialize with lazy loading
app.setup({
  options: {},
  lazy: {
    'admin': './plugins/admin-ui.js',
    'dashboard': './plugins/dashboard.js'
  },
  loader: (file) => import(file)
})
```

### Client with State Management

```javascript
import createApp from '@dooksa/create-app/client'

const app = createApp()

// Add state plugin
app.usePlugin({
  name: 'userState',
  state: {
    _values: {
      currentUser: null,
      isAuthenticated: false
    },
    _names: ['currentUser', 'isAuthenticated'],
    _items: [],
    _defaults: [],
    schema: {}
  },
  setup: (state) => {
    console.log('State initialized:', state)
  }
})

// Add actions
app.useAction({
  id: 'login-user',
  name: 'login',
  method: (params) => {
    // Login logic
    return { success: true }
  }
})

app.setup({ options: {} })
```

## Advanced Patterns

### Microservices Architecture

```javascript
// auth-service.js
import createApp from '@dooksa/create-app/server'

const authService = createApp({
  serverPlugins: {
    http: httpPlugin,
    database: authDbPlugin
  }
})

authService.useAction({
  id: 'auth-validate',
  name: 'validate',
  method: (token) => {
    // Validate token
    return { valid: true, userId: '123' }
  }
})

authService.setup({ options: { port: 3001 } })

// user-service.js
import createApp from '@dooksa/create-app/server'

const userService = createApp({
  serverPlugins: {
    http: httpPlugin,
    database: userDbPlugin
  }
})

userService.useAction({
  id: 'user-get',
  name: 'getUser',
  method: (userId) => {
    // Get user from database
    return { id: userId, name: 'John Doe' }
  }
})

userService.setup({ options: { port: 3002 } })
```

### Plugin Chain Pattern

```javascript
import createApp from '@dooksa/create-app/server'

const app = createApp()

// Layer 1: Core
app.usePlugin(statePlugin)
app.usePlugin(actionPlugin)

// Layer 2: Data
app.usePlugin(databasePlugin)
app.usePlugin(cachePlugin)

// Layer 3: Business Logic
app.usePlugin(authPlugin)
app.usePlugin(userPlugin)
app.usePlugin(orderPlugin)

// Layer 4: API
app.usePlugin(apiPlugin)

app.setup({ options: { port: 3000 } })
```

### Component Library

```javascript
import createApp from '@dooksa/create-app/client'

// Define component library
const components = {
  'button': {
    id: 'button',
    name: 'Button',
    options: {
      variants: ['primary', 'secondary', 'danger', 'ghost'],
      events: ['click', 'hover', 'focus'],
      attributes: ['disabled', 'loading', 'size']
    }
  },
  
  'input': {
    id: 'input',
    name: 'Input',
    options: {
      variants: ['text', 'password', 'email', 'number'],
      events: ['change', 'focus', 'blur'],
      attributes: ['placeholder', 'required', 'disabled']
    }
  },
  
  'card': {
    id: 'card',
    name: 'Card',
    options: {
      variants: ['default', 'elevated', 'bordered'],
      events: ['click'],
      attributes: ['header', 'footer']
    }
  }
}

const app = createApp({
  components: components,
  excludeExtraComponents: true
})

app.setup({ options: {} })
```

### Error Handling Pattern

```javascript
import createApp from '@dooksa/create-app/server'

const app = createApp()

// Global error handler
const errorHandler = (error, context) => {
  console.error('Error:', error.message)
  
  // Log to monitoring service
  monitoringService.log({
    error: error.message,
    stack: error.stack,
    context: context
  })
  
  // Return appropriate response
  return { error: 'Internal server error' }
}

// Actions with error handling
app.useAction({
  id: 'safe-action',
  name: 'safeAction',
  method: (params, context) => {
    try {
      // Risky operation
      const result = riskyOperation(params)
      return { success: true, data: result }
    } catch (error) {
      return errorHandler(error, { action: 'safe-action', params })
    }
  }
})

app.setup({
  options: { port: 3000 }
})
```

### Configuration Management

```javascript
// config.js
export const config = {
  development: {
    serverPlugins: {
      database: devDbPlugin,
      http: devHttpPlugin
    },
    options: { port: 3000 }
  },
  
  production: {
    serverPlugins: {
      database: prodDbPlugin,
      http: prodHttpPlugin
    },
    options: { port: process.env.PORT }
  }
}

// server.js
import createApp from '@dooksa/create-app/server'
import { config } from './config.js'

const env = process.env.NODE_ENV || 'development'
const envConfig = config[env]

const app = createApp({
  serverPlugins: envConfig.serverPlugins
})

app.setup({ options: envConfig.options })
```

## Real-World Scenarios

### E-commerce Backend

```javascript
import createApp from '@dooksa/create-app/server'

const app = createApp({
  serverPlugins: {
    http: httpPlugin,
    database: dbPlugin,
    cache: redisPlugin
  }
})

// Core actions
app.useAction({
  id: 'product-list',
  name: 'getProducts',
  method: async (params) => {
    const cacheKey = `products:${JSON.stringify(params)}`
    
    // Try cache first
    const cached = await app.plugins.cache.get(cacheKey)
    if (cached) return cached
    
    // Fetch from database
    const products = await app.plugins.database.query('products', params)
    
    // Cache result
    await app.plugins.cache.set(cacheKey, products, 300)
    
    return products
  }
})

app.useAction({
  id: 'order-create',
  name: 'createOrder',
  method: async (orderData) => {
    // Validate inventory
    // Process payment
    // Create order
    // Send confirmation
    return { orderId: 'ORD-123', status: 'confirmed' }
  }
})

app.setup({ options: { port: 3000 } })
```

### Real-Time Chat Application

```javascript
// server.js
import createApp from '@dooksa/create-app/server'

const app = createApp({
  serverPlugins: {
    http: httpPlugin,
    websocket: wsPlugin,
    database: dbPlugin
  }
})

app.useAction({
  id: 'send-message',
  name: 'sendMessage',
  method: (message, context) => {
    // Broadcast to all connected clients
    app.plugins.websocket.broadcast('message', {
      ...message,
      timestamp: Date.now(),
      userId: context.user.id
    })
    
    // Save to database
    app.plugins.database.save('messages', message)
    
    return { success: true }
  }
})

app.setup({ options: { port: 3000 } })
```

### Admin Dashboard

```javascript
// client.js
import createApp from '@dooksa/create-app/client'

const app = createApp({
  components: {
    'dashboard-card': {
      id: 'dashboard-card',
      name: 'Dashboard Card',
      options: {
        variants: ['stats', 'chart', 'table']
      }
    }
  },
  excludeExtraComponents: true
})

// Lazy load admin features
app.setup({
  options: {},
  lazy: {
    'admin-users': './plugins/admin-users.js',
    'admin-analytics': './plugins/admin-analytics.js',
    'admin-settings': './plugins/admin-settings.js'
  },
  loader: (file) => import(file)
})
```

### Progressive Web App

```javascript
// client.js
import createApp from '@dooksa/create-app/client'

const app = createApp({
  excludeExtraComponents: true
})

// Core PWA functionality
app.usePlugin({
  name: 'pwa',
  setup: () => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
    }
    
    // Handle offline/online
    window.addEventListener('online', () => {
      console.log('Back online')
    })
    
    window.addEventListener('offline', () => {
      console.log('Went offline')
    })
  }
})

// Lazy load features
app.setup({
  options: {},
  lazy: {
    'sync': './plugins/sync.js',
    'cache': './plugins/cache.js'
  },
  loader: (file) => import(file)
})
```

### Testing Setup

```javascript
// test-setup.js
import createApp from '@dooksa/create-app/server'
import mockPlugin from './mocks/mock-plugin.js'

const testApp = createApp({
  serverPlugins: {
    database: mockPlugin,
    http: mockPlugin
  }
})

testApp.useAction({
  id: 'test-action',
  name: 'test',
  method: (params) => {
    return { received: params }
  }
})

export default testApp
```

## Best Practices Examples

### Modular Plugin Design

```javascript
// Good: Small, focused plugins
const authPlugin = {
  name: 'auth',
  actions: [
    { name: 'login', method: login },
    { name: 'logout', method: logout }
  ]
}

const userPlugin = {
  name: 'user',
  dependencies: [authPlugin],
  actions: [
    { name: 'getProfile', method: getProfile }
  ]
}

// Bad: Monolithic plugin
const bigPlugin = {
  name: 'everything',
  actions: [
    { name: 'login', method: login },
    { name: 'getProfile', method: getProfile },
    { name: 'processPayment', method: processPayment },
    // ... 50 more actions
  ]
}
```

### Error Boundaries

```javascript
const app = createApp()

// Wrap risky operations
app.useAction({
  id: 'safe-api-call',
  name: 'apiCall',
  method: async (url) => {
    try {
      const response = await fetch(url)
      return { data: await response.json() }
    } catch (error) {
      return { error: error.message, data: null }
    }
  }
})
```

### Performance Optimization

```javascript
const app = createApp({
  excludeExtraComponents: true,  // Reduce bundle
  excludeBootstrapComponents: false
})

app.setup({
  options: {},
  lazy: {
    'heavy-feature': './plugins/heavy.js'
  },
  loader: (file) => import(/* webpackChunkName: "heavy" */ file)
})
```

This comprehensive examples guide should help developers understand how to use the create-app package in various real-world scenarios!
