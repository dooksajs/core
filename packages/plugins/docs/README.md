# Dooksa State Management Documentation

This directory contains comprehensive documentation for the Dooksa state management system.

## Documentation Overview

### Core Documentation

1. **[State Schema Guide](state-schema-guide.md)** (The "What" and "How to Structure")
   - Core schema concepts and structure
   - Data Types (Collections, Objects, Arrays, Primitives)
   - Validation rules (Min, Max, Patterns, Required, etc.)
   - Schema-level features (Default values, Relationships)
   - Best practices and common patterns

2. **[State Data Access Guide](state-data-access-guide.md)** (The "How to Read/Write")
   - Quick Reference cheat sheet
   - `stateGetValue`: Reading data, expanding relationships, nested values
   - `stateSetValue`: Writing data, merging, bulk inserts, auto-IDs
   - `stateDeleteValue`: Deleting data, cascade operations
   - `stateFind`: Querying data with conditions
   - Working with Relationships: Fetching expanded data, cascade deletions

3. **[State Events and Listeners Guide](state-events-listeners-guide.md)** (The "Reactivity")
   - Event-driven architecture overview
   - Adding and removing listeners
   - Priority and force listeners
   - Event propagation control
   - Practical examples: Activity tracking, Cache invalidation, Notifications

4. **[State Advanced Patterns Guide](state-advanced-patterns.md)** (The "Architecture")
   - Advanced patterns for complex applications
   - Derived state, Computed properties, Selectors
   - Optimistic updates, Transactional updates
   - Debounced updates, Pagination
   - State versioning, Normalization, Synchronization

5. **[State API Reference](state-api-reference.md)**
   - Complete API documentation for all functions
   - Type definitions and error codes

## Quick Start

### Basic Usage

```javascript
import { createPlugin } from '@dooksa/create-plugin'
import { stateSetValue, stateGetValue } from '@dooksa/plugins'

// Create a plugin with state
const userPlugin = createPlugin('user', {
  state: {
    schema: {
      profiles: {
        type: 'collection',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            email: { type: 'string' }
          }
        }
      }
    }
  }
})

// Add data
const result = stateSetValue({
  name: 'user/profiles',
  value: { name: 'John', email: 'john@example.com' }
})

// Get data
const user = stateGetValue({
  name: 'user/profiles',
  id: result.id
})

console.log(user.item) // { name: 'John', email: 'john@example.com' }
```

### Key Concepts

1. **Namespaced Naming**: Always use `pluginName/propertyName` format (e.g., 'user/profiles')
2. **Collections**: Store multiple documents with unique IDs
3. **Validation**: Automatic type and schema validation
4. **Events**: Reactive programming with listeners
5. **Relationships**: Bidirectional links between collections
6. **Default Values**: Configure initial values and ID generation

## Documentation Structure

```
packages/plugins/docs/
├── README.md                          # This file - overview and navigation
├── state-schema-guide.md              # Schema definitions, types, validation, defaults
├── state-data-access-guide.md         # Reading, writing, deleting, and querying data
├── state-events-listeners-guide.md    # Event-driven programming
├── state-advanced-patterns.md         # Advanced patterns and techniques
└── state-api-reference.md             # Complete API documentation
```

## Learning Path

### For Beginners

1. Start with **[State Schema Guide](state-schema-guide.md)** to understand how to structure your data.
2. Read **[State Data Access Guide](state-data-access-guide.md)** to learn how to interact with the state.

### For Intermediate Users

1. Explore **[State Events and Listeners Guide](state-events-listeners-guide.md)** for reactive programming.
2. Check the **[State API Reference](state-api-reference.md)** for specific function details.

### For Advanced Users

1. Study **[State Advanced Patterns Guide](state-advanced-patterns.md)** for complex application architecture.

## Key Features

### Type Safety
- Automatic validation against schemas
- Type checking for all data operations
- Comprehensive error messages

### Performance
- Efficient data storage and retrieval
- Optimized relationship tracking
- Lazy loading and caching patterns

### Developer Experience
- Clear error messages with detailed information
- Comprehensive documentation with examples
- Best practices and common patterns

### Flexibility
- Support for complex data structures
- Custom validation rules
- Extensible through plugins

## Contributing

When adding new documentation:

1. Follow the established structure and format
2. Include comprehensive examples
3. Add testing examples
4. Update the README with new file references
5. Ensure consistency with existing documentation

## Support

For questions and issues:

- Check the **[API Reference](state-api-reference.md)** for function details
- Review **[Common Patterns](state-advanced-patterns.md)** for solutions
