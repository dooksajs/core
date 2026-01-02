# @dooksa/create-plugin

Create a Dooksa plugin instance with comprehensive configuration options for state management, actions, methods, and lifecycle management.

## Documentation

The create-plugin package includes comprehensive documentation:

- **[User Guide](docs/guide.md)** - Step-by-step tutorial with practical examples
- **[Reference Documentation](docs/reference.md)** - Complete API reference with all options

**Quick Start:**
```javascript
import { createPlugin } from '@dooksa/create-plugin'

const myPlugin = createPlugin('myPlugin', {
  metadata: { title: 'My Plugin' },
  state: { schema: { counter: { type: 'number' } } },
  methods: {
    increment() { this.counter++; return this.counter }
  },
  actions: {
    add: {
      metadata: { title: 'Add' },
      parameters: { type: 'object', properties: { value: { type: 'number', required: true } } },
      method({ value }) { this.counter += value; return this.counter }
    }
  }
})

// Use it
myPlugin.myPluginIncrement()
myPlugin.myPluginAdd({ value: 5 })
```

## Quick Start

```javascript
import { createPlugin } from '@dooksa/create-plugin'

const myPlugin = createPlugin('myPlugin', {
  metadata: {
    title: 'My Plugin',
    description: 'A sample plugin'
  },
  state: {
    schema: {
      counter: { type: 'number' }
    }
  },
  methods: {
    increment() {
      this.counter++
      return this.counter
    }
  },
  actions: {
    add: {
      metadata: { title: 'Add to Counter' },
      parameters: {
        type: 'object',
        properties: {
          value: { type: 'number', required: true }
        }
      },
      method({ value }) {
        this.counter += value
        return this.counter
      }
    }
  }
})

// Use the plugin
myPlugin.myPluginIncrement()
myPlugin.myPluginAdd({ value: 5 })
```

## Features

- ✅ **State Management** - Schema-based state with validation
- ✅ **Actions** - Named actions with metadata and parameters
- ✅ **Methods** - Public and private method support
- ✅ **Dependencies** - Plugin dependency management
- ✅ **Lifecycle** - Setup and initialization hooks
- ✅ **Type Safety** - Full TypeScript support
- ✅ **Context Binding** - Shared context across all functions

## Installation

```bash
npm install @dooksa/create-plugin
```

## API

### `createPlugin(name, options)`

Creates a new plugin instance.

**Parameters:**
- `name` (string): Unique plugin identifier
- `options` (DsPluginOptions): Plugin configuration

**Returns:** `DsPluginExport` - Plugin object with actions, methods, and metadata

For detailed API documentation, see [Reference Documentation](docs/reference.md).

## License

AGPL-3.0-or-later
