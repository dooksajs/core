# Getting Started Guide

This guide will walk you through creating Dooksa applications from basic setup to advanced configurations.

## Table of Contents

1. [Introduction](#introduction)
2. [Architecture Overview](#architecture-overview)
3. [Server Applications](#server-applications)
4. [Client Applications](#client-applications)
5. [Plugin System](#plugin-system)
6. [Component Management](#component-management)
7. [Lazy Loading](#lazy-loading)
8. [Advanced Patterns](#advanced-patterns)

## Introduction

### What is Dooksa?

Dooksa is a framework for building modern web applications with a focus on:
- **Modularity** - Everything is a plugin or component
- **Performance** - Lazy loading and optimized execution
- **Developer Experience** - Clear APIs and comprehensive TypeScript support

### What does create-app do?

The `@dooksa/create-app` package provides factories for creating complete Dooksa applications with:
- Plugin management and dependency resolution
- Action registration and execution
- Component registry and customization
- Server and client runtime environments

## Architecture Overview

### Application Structure

```
┌─────────────────────────────────────────┐
│           Dooksa Application            │
├─────────────────────────────────────────┤
│  Plugins  │  Actions  │  Components     │
├─────────────────────────────────────────┤
│  State    │  Events   │  Routes         │
└─────────────────────────────────────────┘
```

### Key Concepts

**Plugins** - Self-contained modules that provide functionality
- Can include actions, state, setup logic
- Support dependencies
- Can be lazy-loaded

**Actions** - Functions that perform operations
- Registered globally
- Can be synchronous or asynchronous
- Support error handling

**Components** - Reusable UI elements
- Registered in component registry
- Can be customized per application
- Support variants and events

## Server Applications

### Basic Setup

```javascript
import createApp from '@dooksa/create-app/server'

// Create app with defaults
const app = createApp()

// Start server
app.setup({
  options: { port: 3000 }
})
```

### Custom Configuration

```javascript
import createApp from '@dooksa/create-app/server'
import customHttpPlugin from './plugins/custom-http.js'
import databasePlugin from './plugins/database.js'

const app = createApp({
  // Override server plugins
  serverPlugins: {
    http: customHttpPlugin,
    database: databasePlugin
  },
  
  // Override client plugins
  clientPlugins: {
    fetch: customFetchPlugin
  },
  
  // Override actions
  actions: {
    'user-login': customLoginAction
  }
})

// Add additional plugins
app.usePlugin(authPlugin)
app.useAction(customAction)

// Start server
const server = app.setup({
  options: {
    port: 8080,
    host: 'localhost',
    cors: { origin: '*' }
  }
})
```

### Available Methods

```javascript
const app = createApp()

app.usePlugin(plugin)           // Register server plugin
app.useClientPlugin(plugin)     // Register client plugin
app.useAction(action)           // Register action
app.setup(config)               // Initialize and start
```

## Client Applications

### Basic Setup

```javascript
import createApp from '@dooksa/create-app/client'

// Create app with defaults
const app = createApp()

// Initialize
app.setup({
  options: { /* config */ }
})
```

### Custom Configuration

```javascript
import createApp from '@dooksa/create-app/client'
import customButton from './components/custom-button.js'

const app = createApp({
  // Add/override components
  components: {
    'button': customButton,
    'form': customForm
  },
  
  // Exclude components to reduce bundle size
  excludeExtraComponents: true,
  excludeBootstrapComponents: false
})

// Add plugins
app.usePlugin(myPlugin)

// Initialize with lazy loading
app.setup({
  options: { /* config */ },
  lazy: {
    'auth': './plugins/auth.js',
    'payment': './plugins/payment.js'
  },
  loader: (fileName) => import(fileName)
})
```

### Available Methods

```javascript
const app = createApp()

app.usePlugin(plugin)           // Register plugin
app.useComponent(component)     // Register component
app.setup(config)               // Initialize application
```

## Plugin System

### Plugin Structure

```javascript
// A complete plugin example
const myPlugin = {
  name: 'myPlugin',
  
  // Dependencies that must be loaded first
  dependencies: [statePlugin, actionPlugin],
  
  // Actions provided by this plugin
  actions: [
    {
      name: 'myAction',
      method: (params, context) => {
        return { success: true }
      }
    }
  ],
  
  // State management
  state: {
    _values: {
      myValue: 'default'
    },
    _names: ['myValue'],
    _items: [],
    _defaults: [],
    schema: {}
  },
  
  // Setup function called during initialization
  setup: (config) => {
    console.log('Plugin initialized with:', config)
  },
  
  // Metadata for versioning and identification
  metadata: {
    version: '1.0.0',
    author: 'Your Name'
  }
}
```

### Dependency Resolution

Plugins are loaded in dependency order:

```javascript
const app = createApp()

// These will be loaded in correct order:
// 1. statePlugin (dependency of actionPlugin)
// 2. actionPlugin (dependency of authPlugin)
// 3. authPlugin
app.usePlugin(authPlugin)
```

### Plugin Registration

```javascript
// Server side
app.usePlugin(databasePlugin)
app.useClientPlugin(authPlugin)

// Client side
app.usePlugin(fetchPlugin)
```

## Component Management

### Component Structure

```javascript
const myComponent = {
  id: 'my-button',
  name: 'My Button',
  options: {
    variants: ['primary', 'secondary', 'danger'],
    events: ['click', 'hover', 'focus'],
    attributes: ['disabled', 'loading']
  }
}
```

### Registering Components

```javascript
// Client application
const app = createApp()

// Add custom component
app.useComponent({
  id: 'custom-button',
  name: 'Custom Button',
  options: {
    variants: ['primary', 'secondary'],
    events: ['click']
  }
})

// Access in setup
app.setup({
  options: {},
  components: {
    'override-button': overrideButton
  }
})
```

### Component Customization

```javascript
// Override default components
const app = createApp({
  components: {
    'button': customButton,      // Override default button
    'custom-widget': widget      // Add new component
  }
})
```

## Lazy Loading

### Why Lazy Load?

- Reduce initial bundle size
- Load plugins only when needed
- Improve application startup time

### Implementation

```javascript
const app = createApp()

app.setup({
  options: {},
  
  // Define lazy plugins
  lazy: {
    'payment': './plugins/payment.js',
    'admin': './plugins/admin.js',
    'analytics': './plugins/analytics.js'
  },
  
  // Custom loader function
  loader: async (fileName) => {
    const module = await import(fileName)
    return module.default
  }
})

// Usage - plugin loads on first action call
app.setup({
  options: {},
  lazy: { 'auth': './plugins/auth.js' },
  loader: (file) => import(file)
})
```

### Action Callback System

```javascript
// The system automatically loads plugins when actions are called
const result = await app.setup({
  options: {},
  lazy: { 'payment': './plugins/payment.js' },
  loader: (file) => import(file)
})

// When you call an action from a lazy plugin:
// 1. Plugin is loaded
// 2. Plugin is initialized
// 3. Action is executed
// 4. Result is returned
```

## Advanced Patterns

### Multi-Environment Setup

```javascript
// config.js
export const createAppConfig = (env) => {
  const baseConfig = {
    serverPlugins: {
      state: statePlugin
    },
    clientPlugins: {
      fetch: fetchPlugin
    }
  }
  
  if (env === 'production') {
    return {
      ...baseConfig,
      serverPlugins: {
        ...baseConfig.serverPlugins,
        database: prodDbPlugin
      }
    }
  }
  
  return {
    ...baseConfig,
    serverPlugins: {
      ...baseConfig.serverPlugins,
      database: devDbPlugin
    }
  }
}

// server.js
import { createAppConfig } from './config.js'
import createApp from '@dooksa/create-app/server'

const app = createApp(createAppConfig(process.env.NODE_ENV))
app.setup({ options: { port: process.env.PORT } })
```

### Plugin Chaining

```javascript
// Create a chain of plugins that work together
const app = createApp()

// Core plugins
app.usePlugin(statePlugin)
app.usePlugin(actionPlugin)

// Feature plugins
app.usePlugin(authPlugin)
app.usePlugin(databasePlugin)
app.usePlugin(apiPlugin)

// UI plugins
app.useClientPlugin(componentPlugin)
app.useClientPlugin(routePlugin)
```

### Error Handling

```javascript
const app = createApp()

try {
  app.setup({
    options: { port: 3000 },
    lazy: { 'payment': './plugins/payment.js' },
    loader: (file) => import(file)
  })
} catch (error) {
  console.error('Failed to start application:', error)
  
  // Grace
