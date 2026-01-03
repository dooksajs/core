# @dooksa/create-app

Create and configure Dooksa applications with ease. This package provides the main entry points for building both client-side and server-side Dooksa applications with comprehensive plugin management and component support.

## Features

- 🚀 **Quick Setup** - Get applications running in minutes
- 🔌 **Plugin System** - Extensible architecture with dependency resolution
- 🎨 **Component Management** - Built-in component registry and customization
- ⚡ **Lazy Loading** - Optimized performance with on-demand plugin loading
- 🔧 **Type Safe** - Full TypeScript support with comprehensive type definitions
- 📦 **Pre-configured Builds** - Ready-to-use client and server builds

## Installation

```bash
npm install @dooksa/create-app
```

## Quick Start

### Server Application

```javascript
import createApp from '@dooksa/create-app/server'

const app = createApp()

// Add custom plugins
app.usePlugin(databasePlugin)
app.useAction(customAction)

// Initialize and start
const server = app.setup({
  options: { port: 3000 }
})
```

### Client Application

```javascript
import createApp from '@dooksa/create-app/client'

const app = createApp()

// Add custom components
app.useComponent(customButton)

// Initialize
app.setup({
  options: { /* config */ },
  lazy: { 'auth': './plugins/auth.js' },
  loader: (file) => import(file)
})
```

## Core Concepts

### Applications
Dooksa applications consist of plugins, actions, and components that work together to create interactive web applications.

### Plugins
Plugins provide functionality to your application. They can include actions, state management, and setup logic.

### Components
Components are reusable UI elements that can be customized and extended.

## Documentation

For detailed documentation, see:

- [Getting Started Guide](docs/guide.md) - Learn the basics
- [API Reference](docs/api.md) - Complete API documentation
- [Examples](docs/examples.md) - Practical usage patterns
- [Types Reference](docs/types.md) - Type definitions
- [Best Practices](docs/best-practices.md) - Guidelines and tips

## Basic Usage Examples

### Custom Server Configuration

```javascript
import createApp from '@dooksa/create-app/server'

const app = createApp({
  serverPlugins: {
    http: customHttpPlugin,
    database: customDbPlugin
  },
  clientPlugins: {
    fetch: customFetchPlugin
  },
  actions: {
    'custom-action': customAction
  }
})

app.setup({ options: { port: 8080 } })
```

### Custom Client Configuration

```javascript
import createApp from '@dooksa/create-app/client'

const app = createApp({
  components: {
    'custom-button': customButtonComponent
  },
  excludeExtraComponents: true,
  excludeBootstrapComponents: false
})

app.usePlugin(myPlugin)
app.setup({ options: {} })
```

## License

AGPL-3.0-or-later

## Contributing

See [CONTRIBUTING.md](../../../CONTRIBUTING.md) for contribution guidelines.
