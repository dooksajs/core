# Best Practices

Guidelines and patterns for using `@dooksa/create-app` effectively.

## Table of Contents

1. [Plugin Design](#plugin-design)
2. [Action Patterns](#action-patterns)
3. [Component Management](#component-management)
4. [Performance Optimization](#performance-optimization)
5. [Error Handling](#error-handling)
6. [Security](#security)
7. [Testing](#testing)
8. [Architecture Patterns](#architecture-patterns)

## Plugin Design

### Keep Plugins Focused

**✅ Good: Small, single-purpose plugins**

```javascript
// auth-plugin.js
const authPlugin = {
  name: 'auth',
  actions: [
    { name: 'login', method: login },
    { name: 'logout', method: logout },
    { name: 'validateToken', method: validateToken }
  ]
}

// user-plugin.js
const userPlugin = {
  name: 'user',
  dependencies: [authPlugin],
  actions: [
    { name: 'getProfile', method: getProfile },
    { name: 'updateProfile', method: updateProfile }
  ]
}
```

**❌ Bad: Monolithic plugin**

```javascript
// everything-plugin.js
const everythingPlugin = {
  name: 'everything',
  actions: [
    { name: 'login', method: login },
    { name: 'getProfile', method: getProfile },
    { name: 'processPayment', method: processPayment },
    { name: 'sendEmail', method: sendEmail },
    // ... 50 more actions
  ]
}
```

### Define Clear Dependencies

**✅ Good: Explicit dependencies**

```javascript
const apiPlugin = {
  name: 'api',
  dependencies: [statePlugin, fetchPlugin],
  actions: [
    { name: 'request', method: makeRequest }
  ]
}
```

**❌ Bad: Implicit dependencies**

```javascript
const apiPlugin = {
  name: 'api',
  // No dependencies defined
  actions: [
    { 
      name: 'request', 
      method: (params) => {
        // Assumes statePlugin and fetchPlugin exist
        const state = statePlugin.get()
        return fetchPlugin.request(params)
      }
    }
  ]
}
```

### Use Semantic Versioning

```javascript
const myPlugin = {
  name: 'my-plugin',
  metadata: {
    version: '1.2.3',  // MAJOR.MINOR.PATCH
    author: 'Your Name',
    description: 'Plugin for doing X'
  }
}
```

## Action Patterns

### Keep Actions Pure

**✅ Good: Pure functions**

```javascript
app.useAction({
  id: 'calculate-total',
  name: 'calculateTotal',
  method: (items) => {
    return items.reduce((sum, item) => sum + item.price, 0)
  }
})
```

**❌ Bad: Side effects in action**

```javascript
app.useAction({
  id: 'calculate-total',
  name: 'calculateTotal',
  method: (items) => {
    const total = items.reduce((sum, item) => sum + item.price, 0)
    console.log('Total calculated:', total) // Side effect
    database.save('totals', { total })      // Side effect
    return total
  }
})
```

### Use Context Parameter

**✅ Good: Context-aware actions**

```javascript
app.useAction({
  id: 'get-user-data',
  name: 'getUserData',
  method: (params, context) => {
    // Use context for authentication, user info, etc.
    if (!context.user) {
      throw new Error('Unauthorized')
    }
    
    return database.getUser(context.user.id)
  }
})
```

### Error Handling in Actions

**✅ Good: Try-catch with meaningful errors**

```javascript
app.useAction({
  id: 'process-payment',
  name: 'processPayment',
  method: async (paymentData, context) => {
    try {
      // Validate input
      if (!paymentData.amount || paymentData.amount <= 0) {
        throw new Error('Invalid payment amount')
      }
      
      // Process payment
      const result = await paymentGateway.charge(paymentData)
      
      return {
        success: true,
        transactionId: result.id,
        amount: result.amount
      }
      
    } catch (error) {
      // Log error with context
      console.error('Payment failed:', {
        error: error.message,
        userId: context.user?.id,
        data: paymentData
      })
      
      return {
        success: false,
        error: error.message,
        code: error.code || 'UNKNOWN_ERROR'
      }
    }
  }
})
```

## Component Management

### Component Structure

**✅ Good: Well-defined components**

```javascript
const buttonComponent = {
  id: 'button',
  name: 'Button',
  options: {
    variants: ['primary', 'secondary', 'danger', 'ghost'],
    events: ['click', 'hover', 'focus'],
    attributes: ['disabled', 'loading', 'size']
  }
}
```

### Component Customization

**✅ Good: Override specific components**

```javascript
const app = createAppClient({
  components: {
    // Override default button
    'button': {
      id: 'button',
      name: 'CustomButton',
      options: {
        variants: ['primary', 'secondary', 'custom'],
        events: ['click', 'hover'],
        attributes: ['disabled', 'loading']
      }
    },
    
    // Add new component
    'custom-widget': {
      id: 'custom-widget',
      name: 'CustomWidget',
      options: {
        variants: ['default', 'compact'],
        events: ['click']
      }
    }
  }
})
```

### Bundle Size Optimization

**✅ Good: Exclude unnecessary components**

```javascript
const app = createAppClient({
  excludeExtraComponents: true,    // Remove extra components
  excludeBootstrapComponents: false // Keep bootstrap components
})
```

## Performance Optimization

### Lazy Loading Strategy

**✅ Good: Load heavy features on demand**

```javascript
const app = createAppServer()

app.setup({
  options: { port: 3000 },
  
  // Core plugins loaded immediately
  lazy: {
    // Admin features (rarely used)
    'admin': './plugins/admin.js',
    
    // Reporting (heavy operation)
    'reporting': './plugins/reporting.js',
    
    // Bulk operations (memory intensive)
    'bulk-import': './plugins/bulk-import.js'
  },
  
  loader: async (fileName) => {
    const module = await import(fileName)
    return module.default
  }
})
```

### Action Caching

**✅ Good: Cache expensive operations**

```javascript
app.useAction({
  id: 'get-products',
  name: 'getProducts',
  method: async (params) => {
    const cacheKey = `products:${JSON.stringify(params)}`
    
    // Try cache first
    const cached = await cachePlugin.get(cacheKey)
    if (cached) return cached
    
    // Expensive database query
    const products = await database.query('products', params)
    
    // Cache for 5 minutes
    await cachePlugin.set(cacheKey, products, 300)
    
    return products
  }
})
```

### Plugin Initialization

**✅ Good: Defer heavy setup**

```javascript
const heavyPlugin = {
  name: 'heavy',
  setup: async (config) => {
    // Don't block initialization
    setTimeout(async () => {
      await initializeHeavyResources()
    }, 0)
  }
}
```

## Error Handling

### Global Error Handler

**✅ Good: Centralized error handling**

```javascript
const errorHandler = (error, context) => {
  console.error('Application Error:', {
    message: error.message,
    stack: error.stack,
    context: context,
    timestamp: new Date().toISOString()
  })
  
  // Send to monitoring service
  monitoringService.log(error, context)
  
  // Return user-friendly error
  return {
    error: 'Something went wrong',
    code: 'INTERNAL_ERROR'
  }
}

// Wrap all actions
app.useAction({
  id: 'safe-action',
  name: 'safeAction',
  method: (params, context) => {
    try {
      return riskyOperation(params)
    } catch (error) {
      return errorHandler(error, { action: 'safeAction', params })
    }
  }
})
```

### Graceful Degradation

**✅ Good: Handle failures gracefully**

```javascript
app.useAction({
  id: 'get-user-data',
  name: 'getUserData',
  method: async (userId) => {
    try {
      const user = await database.getUser(userId)
      return { success: true, data: user }
    } catch (error) {
      console.error('Database unavailable:', error)
      
      // Return cached data or default
      const cached = await cache.get(`user:${userId}`)
      if (cached) {
        return { success: true, data: cached, source: 'cache' }
      }
      
      return { 
        success: false, 
        error: 'Service temporarily unavailable',
        source: 'error'
      }
    }
  }
})
```

## Security

### Input Validation

**✅ Good: Validate all inputs**

```javascript
app.useAction({
  id: 'create-user',
  name: 'createUser',
  method: (userData, context) => {
    // Validate required fields
    if (!userData.email || !userData.password) {
      throw new Error('Email and password required')
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(userData.email)) {
      throw new Error('Invalid email format')
    }
    
    // Validate password strength
    if (userData.password.length < 8) {
      throw new Error('Password must be at least 8 characters')
    }
    
    // Sanitize input
    const sanitizedData = {
      email: userData.email.toLowerCase().trim(),
      password: hashPassword(userData.password),
      name: userData.name?.trim()
    }
    
    return database.createUser(sanitizedData)
  }
})
```

### Authentication & Authorization

**✅ Good: Check permissions**

```javascript
app.useAction({
  id: 'delete-record',
  name: 'deleteRecord',
  method: (params, context) => {
    // Check authentication
    if (!context.user) {
      throw new Error('Unauthorized')
    }
    
    // Check authorization
    if (!context.user.permissions.includes('delete')) {
      throw new Error('Insufficient permissions')
    }
    
    // Audit log
    auditLog.log({
      action: 'delete',
      user: context.user.id,
      record: params.id,
      timestamp: Date.now()
    })
    
    return database.delete(params.id)
  }
})
```

### Secure Plugin Dependencies

**✅ Good: Verify plugin integrity**

```javascript
const trustedPlugin = {
  name: 'trusted',
  metadata: {
    version: '1.0.0',
    checksum: 'sha256:abc123...'
  }
}

// Verify before loading
const app = createApp()

if (verifyPlugin(trustedPlugin)) {
  app.usePlugin(trustedPlugin)
}
```

## Testing

### Testable Actions

**✅ Good: Pure, testable functions**

```javascript
// Action implementation
export const calculateTotal = (items) => {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}

// Test
describe('calculateTotal', () => {
  it('calculates total correctly', () => {
    const items = [
      { price: 10, quantity: 2 },
      { price: 5, quantity: 3 }
    ]
    
    expect(calculateTotal(items)).toBe(35)
  })
})

// Register in app
app.useAction({
  id: 'calculate-total',
  name: 'calculateTotal',
  method: calculateTotal
})
```

### Mock Dependencies

**✅ Good: Use mocks in tests**

```javascript
// test-setup.js
import createApp from '@dooksa/create-app/server'

const mockPlugin = {
  name: 'mock',
  actions: [
    {
      name: 'mockAction',
      method: (params) => ({ mocked: true, params })
    }
  ]
}

const testApp = createApp({
  serverPlugins: {
    database: mockPlugin,
    http: mockPlugin
  }
})

export default testApp
```

### Integration Testing

**✅ Good: Test full flows**

```javascript
describe('User Registration Flow', () => {
  it('should register new user', async () => {
    const app = createApp()
    app.usePlugin(mockDatabase)
    
    const result = await app.setup({
      options: {},
      lazy: { 'auth': './mocks/auth.js' },
      loader: (file) => import(file)
    })
    
    // Test the flow
    const registerResult = await app.actions.register({
      email: 'test@example.com',
      password: 'password123'
    })
    
    expect(registerResult.success).toBe(true)
  })
})
```

## Architecture Patterns

### Layered Architecture

**✅ Good: Separate concerns**

```
┌─────────────────────────────────────┐
│         Presentation Layer          │
│  (Components, UI, User Interface)   │
├─────────────────────────────────────┤
│         Business Layer              │
│  (Actions, Business Logic, Rules)   │
├─────────────────────────────────────┤
│         Data Layer                  │
│  (Plugins, Database, API Clients)   │
└─────────────────────────────────────┘
```

### Microservices Pattern

**✅ Good: Service separation**

```javascript
// auth-service.js
const authService = createAppServer({
  serverPlugins: { http: httpPlugin, database: authDb }
})
authService.useAction({ id: 'auth-login', name: 'login', method: login })
authService.setup({ options: { port: 3001 } })

// user-service.js
const userService = createAppServer({
  serverPlugins: { http: httpPlugin, database: userDb }
})
userService.useAction({ id: 'user-get', name: 'getUser', method: getUser })
userService.setup({ options: { port: 3002 } })
```

### Event-Driven Architecture

**✅ Good: Loose coupling**

```javascript
// Event emitter plugin
const eventPlugin = {
  name: 'events',
  actions: [
    {
      name: 'emit',
      method: (event, data) => {
        // Notify all listeners
        eventPlugin.listeners.forEach(listener => {
          listener(event, data)
        })
      }
    },
    {
      name: 'on',
      method: (event, callback) => {
        eventPlugin.listeners.push({ event, callback })
      }
    }
  ]
}

// Usage
app.usePlugin(eventPlugin)

app.useAction({
  id: 'user-registered',
  name: 'onUserRegistered',
  method: (user) => {
    app.plugins.events.emit('user:registered', user)
  }
})
```

### Configuration Management

**✅ Good: Environment-based config**

```javascript
// config.js
export const config = {
  development: {
    database: devDbPlugin,
    http: devHttpPlugin,
    options: { port: 3000, debug: true }
  },
  
  production: {
    database: prodDbPlugin,
    http: prodHttpPlugin,
    options: { port: process.env.PORT, debug: false }
  },
  
  test: {
    database: mockDbPlugin,
    http: mockHttpPlugin,
    options: { port: 0, debug: true }
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

## Deployment

### Production Checklist

**✅ Before deploying:**

- [ ] All plugins have proper error handling
- [ ] Actions validate inputs
- [ ] Components are optimized for production
- [ ] Lazy loading is configured
- [ ] Environment variables are set
- [ ] Logging is configured
- [ ] Monitoring is in place
- [ ] Security checks are passed

### Environment Configuration

**✅ Good: Use environment variables**

```javascript
const app = createAppServer({
  serverPlugins: {
    database: process.env.DATABASE_URL ? 
      prodDbPlugin : devDbPlugin
  }
})

app.setup({
  options: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost',
    cors: {
      origin: process.env.CORS_ORIGIN?.split(',') || ['localhost']
    }
  }
})
```

### Monitoring

**✅ Good: Track application health**

```javascript
const app = createAppServer()

// Add monitoring middleware
app.usePlugin({
  name: 'monitoring',
  setup: () => {
    // Track action performance
    const originalSetup = app.setup
    app.setup = async (config) => {
      const start = Date.now()
      const result = await originalSetup(config)
      const duration = Date.now() - start
      
      console.log(`App started in ${duration}ms`)
      monitoringService.record('app.start', { duration })
      
      return result
    }
  }
})
```

## Summary

### Key Principles

1. **Modularity** - Keep plugins and actions focused
2. **Performance** - Use lazy loading and caching
3. **Security** - Validate inputs and check permissions
4. **Reliability** - Handle errors gracefully
5. **Testability** - Write pure, testable functions
6. **Maintainability** - Follow consistent patterns

### Common Pitfalls to Avoid

- ❌ Creating monolithic plugins
- ❌ Skipping input validation
- ❌ Ignoring error handling
- ❌ Loading everything eagerly
- ❌ Mixing concerns in actions
- ❌ Hardcoding configuration
- ❌ Skipping tests

### Next Steps

1. Start with simple plugins
2. Add error handling early
3. Implement lazy loading
4. Write tests as you go
5. Monitor performance
6. Iterate and improve

This guide should help you build robust, maintainable Dooksa applications!
