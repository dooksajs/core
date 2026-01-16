# API Reference

Complete reference for all functions, types, and configuration options in `@dooksa/create-app`.

## Table of Contents

1. [Main Functions](#main-functions)
2. [Helper Functions](#helper-functions)
3. [Configuration Options](#configuration-options)
4. [Return Types](#return-types)
5. [Type Definitions](#type-definitions)

## Main Functions

### createAppServer()

Creates and configures a Dooksa server application.

**Signature:**
```typescript
function createAppServer(options?: {
  clientPlugins?: ClientPlugins
  serverPlugins?: ServerPlugins
  actions?: Record<string, Action>
}): ServerApplication
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `options.clientPlugins` | `ClientPlugins` | No | Override default client plugins |
| `options.serverPlugins` | `ServerPlugins` | No | Override default server plugins |
| `options.actions` | `Record<string, Action>` | No | Override default actions |

**Returns:** `ServerApplication`

**Example:**
```javascript
import createApp from '@dooksa/create-app/server'

const app = createApp({
  serverPlugins: {
    server: customServerPlugin,
    database: customDbPlugin
  },
  clientPlugins: {
    fetch: customFetchPlugin
  },
  actions: {
    'custom-action': customAction
  }
})
```

---

### createAppClient()

Creates and configures a Dooksa client application.

**Signature:**
```typescript
function createAppClient(options?: {
  components?: Record<string, Component>
  excludeExtraComponents?: boolean
  excludeBootstrapComponents?: boolean
}): ClientApplication
```

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `options.components` | `Record<string, Component>` | No | `{}` | Override or add components |
| `options.excludeExtraComponents` | `boolean` | No | `false` | Exclude extra components |
| `options.excludeBootstrapComponents` | `boolean` | No | `false` | Exclude bootstrap components |

**Returns:** `ClientApplication`

**Example:**
```javascript
import createApp from '@dooksa/create-app/client'

const app = createApp({
  components: {
    'button': customButton,
    'form': customForm
  },
  excludeExtraComponents: true
})
```

---

## Helper Functions

### appendPlugin()

Creates a plugin management system. Used internally by main functions.

**Signature:**
```typescript
function appendPlugin(): AppPlugin
```

**Returns:** `AppPlugin`

**Methods:**
- `use(plugin: DsPlugin): void` - Register a plugin
- `plugins: DsPlugin[]` - Get registered plugins
- `state: DsPluginStateExport` - Get plugin state
- `actions: Record<string, Function>` - Get registered actions
- `setup: AppSetup[]` - Get setup queue

---

### appendAction()

Creates an action collection manager.

**Signature:**
```typescript
function appendAction(): AppAction
```

**Returns:** `AppAction`

**Methods:**
- `use(action: Action): void` - Register an action
- `items: Action[]` - Get all actions

---

### appendClientPlugin()

Creates a client plugin collection manager.

**Signature:**
```typescript
function appendClientPlugin(): AppClientPlugin
```

**Returns:** `AppClientPlugin`

**Methods:**
- `use(plugin: DsPlugin): void` - Register a client plugin
- `metadata: Array<{name: string, metadata: DsPluginMetadata}>` - Get plugin metadata
- `actions: Action[]` - Get all actions from plugins

---

### appendComponent()

Creates a component collection manager.

**Signature:**
```typescript
function appendComponent(): AppComponent
```

**Returns:** `AppComponent`

**Methods:**
- `use(component: Component): void` - Register a component
- `items: Record<string, Component>` - Get all components

---

### initialize()

Creates an initialization function for applications.

**Signature:**
```typescript
function initialize(
  serverPlugins: AppPlugin,
  clientPlugins: AppClientPlugin,
  actions: AppAction
): (config: InitializationConfig) => void
```

**Parameters:**
- `serverPlugins` - Server plugin manager
- `clientPlugins` - Client plugin manager
- `actions` - Action collection manager

**Returns:** Initialization function

---

### callbackWhenAvailable()

Creates a callback system for lazy-loading plugins.

**Signature:**
```typescript
function callbackWhenAvailable(app: {
  actions: Record<string, Function>
  lazy: Record<string, string>
  loader: Function
  setup: AppSetup[]
  options: Object
  use: Function
}): (name: string, callback: Function) => any
```

**Returns:** Callback function that loads plugins on demand

---

## Configuration Options

### ServerApplication Config

```typescript
interface ServerAppConfig {
  // Override default client plugins
  clientPlugins?: {
    state?: DsPlugin
    metadata?: DsPlugin
    fetch?: DsPlugin
    operator?: DsPlugin
    action?: DsPlugin
    variable?: DsPlugin
    component?: DsPlugin
    regex?: DsPlugin
    editor?: DsPlugin
    list?: DsPlugin
    event?: DsPlugin
    token?: DsPlugin
    icon?: DsPlugin
    query?: DsPlugin
    route?: DsPlugin
    form?: DsPlugin
    string?: DsPlugin
    page?: DsPlugin
  }
  
  // Override default server plugins
  serverPlugins?: {
    state?: DsPlugin
    middleware?: DsPlugin
    server?: DsPlugin
    metadata?: DsPlugin
    user?: DsPlugin
    database?: DsPlugin
    action?: DsPlugin
    component?: DsPlugin
    event?: DsPlugin
    page?: DsPlugin
    theme?: DsPlugin
  }
  
  // Override default actions
  actions?: Record<string, Action>
}
```

### ClientApplication Config

```typescript
interface ClientAppConfig {
  // Add or override components
  components?: Record<string, Component>
  
  // Exclude components to reduce bundle size
  excludeExtraComponents?: boolean
  excludeBootstrapComponents?: boolean
}
```

### Initialization Config

```typescript
interface InitializationConfig {
  // Application configuration options
  options?: Object
  
  // Lazy plugin definitions
  lazy?: Record<string, string>
  
  // Plugin loader function
  loader?: (fileName: string) => Promise<DsPlugin>
}
```

---

## Return Types

### ServerApplication

```typescript
interface ServerApplication {
  usePlugin(plugin: DsPlugin): void
  useClientPlugin(plugin: DsPlugin): void
  useAction(action: Action): void
  setup(config: InitializationConfig): Object
}
```

### ClientApplication

```typescript
interface ClientApplication {
  usePlugin(plugin: DsPlugin): void
  useComponent(component: Component): void
  setup(config: InitializationConfig): void
}
```

---

## Type Definitions

### AppPlugin

Core plugin management interface.

```typescript
interface AppPlugin {
  use(plugin: DsPlugin): void
  plugins: DsPlugin[]
  state: DsPluginStateExport
  actions: Record<string, Function>
  setup: AppSetup[]
}
```

### AppSetup

Represents a plugin pending setup.

```typescript
interface AppSetup {
  name: string
  setup: Function
}
```

### AppClientPlugin

Client-side plugin manager.

```typescript
interface AppClientPlugin {
  use(plugin: DsPlugin): void
  metadata: Array<{name: string, metadata: DsPluginMetadata}>
  actions: Action[]
}
```

### AppAction

Action management interface.

```typescript
interface AppAction {
  use(action: Action): void
  items: Action[]
}
```

### AppComponent

Component management interface.

```typescript
interface AppComponent {
  use(component: Component): void
  items: Record<string, Component>
}
```

### ServerPlugins

Configuration for server-side plugins.

```typescript
interface ServerPlugins {
  state?: DsPlugin
  middleware?: DsPlugin
  server?: DsPlugin
  metadata?: DsPlugin
  user?: DsPlugin
  database?: DsPlugin
  action?: DsPlugin
  component?: DsPlugin
  event?: DsPlugin
  page?: DsPlugin
  theme?: DsPlugin
}
```

### ClientPlugins

Configuration for client-side plugins.

```typescript
interface ClientPlugins {
  state?: DsPlugin
  metadata?: DsPlugin
  fetch?: DsPlugin
  operator?: DsPlugin
  action?: DsPlugin
  variable?: DsPlugin
  component?: DsPlugin
  regex?: DsPlugin
  editor?: DsPlugin
  list?: DsPlugin
  event?: DsPlugin
  token?: DsPlugin
  icon?: DsPlugin
  query?: DsPlugin
  route?: DsPlugin
  form?: DsPlugin
  string?: DsPlugin
  page?: DsPlugin
}
```

### Action

Action definition structure.

```typescript
interface Action {
  id: string
  name: string
  method: (params: any, context: any) => any
}
```

### Component

Component definition structure.

```typescript
interface Component {
  id: string
  name: string
  options: {
    variants?: string[]
    events?: string[]
    attributes?: string[]
  }
}
```

### PluginMetadata

Plugin metadata for identification and versioning.

```typescript
interface PluginMetadata {
  name: string
  metadata: {
    version: string
    author?: string
    description?: string
  }
}
```

---

## Error Handling

### Common Errors

1. **Duplicate Plugin Registration**
   ```javascript
   // Error: Plugin already registered
   app.usePlugin(plugin)
   app.usePlugin(plugin) // ❌
   ```

2. **Missing Dependencies**
   ```javascript
   // Error: Dependency not found
   const plugin = {
     dependencies: [missingPlugin], // ❌
     // ...
   }
   ```

3. **Component ID Conflict**
   ```javascript
   // Error: Component already exists
   app.useComponent({ id: 'button', ... })
   app.useComponent({ id: 'button', ... }) // ❌
   ```

### Error Recovery

```javascript
try {
  app.setup({ options: { port: 3000 } })
} catch (error) {
  console.error('Setup failed:', error)
  
  // Retry with different config
  app.setup({ options: { port: 8080 } })
}
```

---

## Performance Considerations

### Plugin Loading

- **Eager Loading**: All plugins loaded at startup
- **Lazy Loading**: Plugins loaded on first use

```javascript
// Eager (default)
app.setup({ options: {} })

// Lazy
app.setup({
  lazy: { 'payment': './plugins/payment.js' },
  loader: (file) => import(file)
})
```

### Bundle Size Optimization

```javascript
const app = createApp({
  excludeExtraComponents: true,    // Remove extra components
  excludeBootstrapComponents: false // Keep bootstrap components
})
```

---

## TypeScript Integration

### Type Imports

```typescript
import type {
  AppPlugin,
  AppAction,
  AppComponent,
  ServerPlugins,
  ClientPlugins,
  Action,
  Component
} from '@dooksa/create-app/types'
```

### Type Safety

```typescript
const app = createAppServer({
  serverPlugins: {
    server: customServerPlugin // Type-checked
  },
  actions: {
    'login': loginAction   // Type-checked
  }
})
```

---

## Pre-configured Builds

### Server Build

```javascript
import app from '@dooksa/create-app/build/server'

// Ready-to-use server
app.setup({ options: { port: 3000 } })
```

### Client Build

```javascript
import app from '@dooksa/create-app/build/client'

// Ready-to-use client
app.setup({ options: {} })
```

**Note**: Pre-configured builds use all default plugins and components. Use main functions for custom configurations.
