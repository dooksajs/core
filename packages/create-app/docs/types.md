# Types Reference

Complete reference for all TypeScript type definitions used in `@dooksa/create-app`.

## Table of Contents

1. [Core Types](#core-types)
2. [Plugin Types](#plugin-types)
3. [Configuration Types](#configuration-types)
4. [Return Types](#return-types)
5. [Utility Types](#utility-types)

## Core Types

### AppPlugin

Core plugin management interface used by both client and server applications.

```typescript
interface AppPlugin {
  /**
   * Register a plugin with the application
   */
  use(plugin: DsPlugin): void
  
  /**
   * Array of registered plugin instances
   */
  plugins: DsPlugin[]
  
  /**
   * Plugin state management with defaults, items, names, values, and schema
   */
  state: DsPluginStateExport
  
  /**
   * Map of registered action names to their methods
   */
  actions: Record<string, Function>
  
  /**
   * Queue of plugins pending setup execution
   */
  setup: AppSetup[]
}
```

**Example:**
```typescript
const pluginManager: AppPlugin = appendPlugin()
pluginManager.use(myPlugin)
console.log(pluginManager.plugins.length) // 1
```

---

### AppSetup

Represents a plugin that needs to be initialized with its setup function.

```typescript
interface AppSetup {
  /**
   * The unique name identifier of the plugin
   */
  name: string
  
  /**
   * The setup method to initialize the plugin with its configuration
   */
  setup: Function
}
```

**Example:**
```typescript
const setupItem: AppSetup = {
  name: 'state',
  setup: (config) => {
    // Initialize state
  }
}
```

---

### AppClientPlugin

Client-side plugin manager that handles plugin registration and action collection.

```typescript
interface AppClientPlugin {
  /**
   * Method to register a client plugin
   */
  use(plugin: DsPlugin): void
  
  /**
   * Collection of plugin metadata
   */
  metadata: Array<{
    name: string
    metadata: DsPluginMetadata
  }>
  
  /**
   * Collection of all actions from registered plugins
   */
  actions: Action[]
}
```

**Example:**
```typescript
const clientPlugins: AppClientPlugin = appendClientPlugin()
clientPlugins.use(authPlugin)
console.log(clientPlugins.metadata) // [{ name: 'auth', metadata: {...} }]
```

---

### AppAction

Action management interface for registering and retrieving application actions.

```typescript
interface AppAction {
  /**
   * Method to register a new action
   */
  use(action: Action): void
  
  /**
   * Read-only getter for all registered actions
   */
  items: Action[]
}
```

**Example:**
```typescript
const actionManager: AppAction = appendAction()
actionManager.use({ id: 'login', name: 'userLogin', method: () => {} })
console.log(actionManager.items.length) // 1
```

---

### AppComponent

Component management interface for registering and retrieving UI components.

```typescript
interface AppComponent {
  /**
   * Method to register a new component
   */
  use(component: Component): void
  
  /**
   * Map of component IDs to component definitions
   */
  items: Record<string, Component>
}
```

**Example:**
```typescript
const componentManager: AppComponent = appendComponent()
componentManager.use(myButtonComponent)
console.log(componentManager.items['button']) // Component definition
```

---

## Plugin Types

### ServerPlugins

Configuration object for server-side plugin overrides.

```typescript
interface ServerPlugins {
  state?: DsPlugin
  middleware?: DsPlugin
  http?: DsPlugin
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

**Example:**
```typescript
const customPlugins: ServerPlugins = {
  http: customHttpPlugin,
  database: customDbPlugin,
  state: customStatePlugin
}
```

---

### ClientPlugins

Configuration object for client-side plugin overrides.

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

**Example:**
```typescript
const customPlugins: ClientPlugins = {
  fetch: customFetchPlugin,
  route: customRoutePlugin,
  form: customFormPlugin
}
```

---

### DsPlugin

Base plugin structure (from @dooksa/create-plugin).

```typescript
interface DsPlugin {
  name: string
  dependencies?: DsPlugin[]
  actions?: Action[]
  state?: DsPluginStateExport
  setup?: (config: any) => void
  metadata?: DsPluginMetadata
}
```

---

### DsPluginStateExport

Plugin state management structure.

```typescript
interface DsPluginStateExport {
  _defaults: any[]
  _items: any[]
  _names: string[]
  _values: Record<string, any>
  defaults: any[]
  schema: Record<string, any>
}
```

---

### DsPluginMetadata

Plugin metadata for identification and versioning.

```typescript
interface DsPluginMetadata {
  version: string
  author?: string
  description?: string
}
```

---

## Configuration Types

### ServerAppConfig

Configuration options for `createAppServer()`.

```typescript
interface ServerAppConfig {
  /**
   * Override default client plugins
   */
  clientPlugins?: ClientPlugins
  
  /**
   * Override default server plugins
   */
  serverPlugins?: ServerPlugins
  
  /**
   * Override default actions
   */
  actions?: Record<string, Action>
}
```

---

### ClientAppConfig

Configuration options for `createAppClient()`.

```typescript
interface ClientAppConfig {
  /**
   * Override or add custom components
   */
  components?: Record<string, Component>
  
  /**
   * Exclude extra components to reduce bundle size
   */
  excludeExtraComponents?: boolean
  
  /**
   * Exclude bootstrap components
   */
  excludeBootstrapComponents?: boolean
}
```

---

### InitializationConfig

Configuration for application initialization.

```typescript
interface InitializationConfig {
  /**
   * Application configuration options
   */
  options?: Object
  
  /**
   * Lazy-loaded plugin definitions
   */
  lazy?: Record<string, string>
  
  /**
   * Custom plugin loader function
   */
  loader?: (fileName: string) => Promise<DsPlugin>
}
```

**Example:**
```typescript
const config: InitializationConfig = {
  options: { port: 3000 },
  lazy: {
    'auth': './plugins/auth.js',
    'payment': './plugins/payment.js'
  },
  loader: (fileName) => import(fileName)
}
```

---

## Return Types

### ServerApplication

Methods available on server application instance.

```typescript
interface ServerApplication {
  /**
   * Register a server-side plugin
   */
  usePlugin(plugin: DsPlugin): void
  
  /**
   * Register a client-side plugin
   */
  useClientPlugin(plugin: DsPlugin): void
  
  /**
   * Register an action
   */
  useAction(action: Action): void
  
  /**
   * Initialize and start the application
   */
  setup(config: InitializationConfig): Object
}
```

---

### ClientApplication

Methods available on client application instance.

```typescript
interface ClientApplication {
  /**
   * Register a plugin
   */
  usePlugin(plugin: DsPlugin): void
  
  /**
   * Register a component
   */
  useComponent(component: Component): void
  
  /**
   * Initialize the application
   */
  setup(config: InitializationConfig): void
}
```

---

## Data Structure Types

### Action

Action definition structure used throughout the application.

```typescript
interface Action {
  /**
   * Unique action identifier
   */
  id: string
  
  /**
   * Action name
   */
  name: string
  
  /**
   * Action implementation function
   */
  method: (params: any, context: any) => any
}
```

**Example:**
```typescript
const loginAction: Action = {
  id: 'user-login',
  name: 'login',
  method: (params, context) => {
    // Login logic
    return { success: true, token: 'abc123' }
  }
}
```

---

### Component

Component definition structure for UI components.

```typescript
interface Component {
  /**
   * Unique component identifier
   */
  id: string
  
  /**
   * Component name
   */
  name: string
  
  /**
   * Component configuration options
   */
  options: {
    /**
     * Available visual variants
     */
    variants?: string[]
    
    /**
     * Available events
     */
    events?: string[]
    
    /**
     * Available attributes
     */
    attributes?: string[]
  }
}
```

**Example:**
```typescript
const buttonComponent: Component = {
  id: 'button',
  name: 'Button',
  options: {
    variants: ['primary', 'secondary', 'danger'],
    events: ['click', 'hover'],
    attributes: ['disabled', 'loading']
  }
}
```

---

### PluginMetadata

Plugin metadata structure for identification and versioning.

```typescript
interface PluginMetadata {
  /**
   * Plugin name identifier
   */
  name: string
  
  /**
   * Plugin metadata
   */
  metadata: {
    /**
     * Semantic version string
     */
    version: string
    
    /**
     * Author name or organization
     */
    author?: string
    
    /**
     * Plugin description
     */
    description?: string
  }
}
```

**Example:**
```typescript
const metadata: PluginMetadata = {
  name: 'auth-plugin',
  metadata: {
    version: '1.0.0',
    author: 'John Doe',
    description: 'Authentication plugin for Dooksa'
  }
}
```

---

## Utility Types

### UsePlugin Callback

```typescript
type UsePlugin = (plugin: DsPlugin) => void
```

---

### Initialization Function

```typescript
type InitializeFunction = (config: InitializationConfig) => void | Object
```

---

### Lazy Loader

```typescript
type LazyLoader = (fileName: string) => Promise<DsPlugin>
```

---

### Action Method

```typescript
type ActionMethod = (params: any, context: any) => any
```

---

## Type Aliases

### ServerApp

```typescript
type ServerApp = ServerApplication
```

### ClientApp

```typescript
type ClientApp = ClientApplication
```

### PluginConfig

```typescript
type PluginConfig = ServerPlugins | ClientPlugins
```

---

## Importing Types

### From Package

```typescript
import type {
  AppPlugin,
  AppAction,
  AppComponent,
  ServerPlugins,
  ClientPlugins,
  Action,
  Component,
  ServerApplication,
  ClientApplication
} from '@dooksa/create-app/types'
```

### From Source Files

```typescript
// If you need internal types
import type { AppSetup } from '@dooksa/create-app/types/index.js'
```

---

## Type Guards

### Checking Application Type

```typescript
function isServerApp(app: any): app is ServerApplication {
  return typeof app.useClientPlugin === 'function'
}

function isClientApp(app: any): app is ClientApplication {
  return typeof app.useComponent === 'function'
}
```

### Checking Plugin Type

```typescript
function isDsPlugin(obj: any): obj is DsPlugin {
  return (
    typeof obj === 'object' &&
    typeof obj.name === 'string' &&
    (obj.dependencies === undefined || Array.isArray(obj.dependencies))
  )
}
```

---

## Type Compatibility

### Plugin Compatibility

All plugins must extend the base `DsPlugin` structure:

```typescript
// ✅ Compatible
const myPlugin: DsPlugin = {
  name: 'myPlugin',
  actions: [...],
  state: {...}
}

// ❌ Incompatible
const badPlugin = {
  // Missing name property
  actions: [...]
}
```

### Action Compatibility

All actions must follow the `Action` interface:

```typescript
// ✅ Compatible
const action: Action = {
  id: 'unique-id',
  name: 'actionName',
  method: (params, context) => { return result }
}

// ❌ Incompatible
const badAction = {
  // Missing id or name
  method: () => {}
}
```

---

## TypeScript Best Practices

### 1. Type Your Configurations

```typescript
const config: ServerAppConfig = {
  serverPlugins: {
    http: customHttpPlugin
  }
}
```

### 2. Use Type Inference Where Possible

```typescript
// Let TypeScript infer the type
const app = createAppServer()
const result = app.setup({ options: { port: 3000 } })
```

### 3. Type Event Handlers

```typescript
const action: Action = {
  id: 'handle-user',
  name: 'handleUser',
  method: (params: { userId: string }, context: { user: User }) => {
    // TypeScript knows the types here
    return context.user.id === params.userId
  }
}
```

### 4. Use Type Guards for Runtime Checks

```typescript
function isAppPlugin(obj: any): obj is AppPlugin {
  return (
    typeof obj?.use === 'function' &&
    Array.isArray(obj?.plugins) &&
    typeof obj?.state === 'object'
  )
}
```

---

## Common Type Errors

### Error 1: Type Mismatch

```typescript
// ❌ Error: Type 'DsPlugin' is not assignable to parameter of type 'Action'
app.useAction(myPlugin)

// ✅ Correct
app.usePlugin(myPlugin)
app.useAction(myAction)
```

### Error 2: Missing Required Properties

```typescript
// ❌ Error: Property 'id' is missing
const action: Action = {
  name: 'test',
  method: () => {}
}

// ✅ Correct
const action: Action = {
  id: 'test',
  name: 'test',
  method: () => {}
}
```

### Error 3: Wrong Configuration Type

```typescript
// ❌ Error: Type 'ServerPlugins' is not assignable to parameter of type 'ClientPlugins'
const app = createAppClient({
  serverPlugins: {...} // Wrong!
})

// ✅ Correct
const app = createAppClient({
  components: {...} // Right!
})
```

This comprehensive type reference should help you understand and use all the type definitions in the create-app package effectively!
