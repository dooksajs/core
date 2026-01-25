# Dooksa State Management Documentation

This directory contains comprehensive documentation for the Dooksa state management system.

## Documentation Overview

### Core Documentation

1. **[State Schema Guide](state-schema-guide.md)**
   - Complete guide to defining and using state schemas
   - Schema types: collection, object, array, primitives
   - Schema properties and validation rules
   - ID generation configuration
   - Nested schemas and complex structures
   - Best practices and common patterns

2. **[State Default Values Guide](state-default-values-guide.md)**
   - How to configure default values in schemas
   - Schema-level vs plugin-level defaults
   - ID generation strategies (prefix, suffix, custom functions)
   - Dynamic defaults (function-based)
   - Default value precedence and initialization flow
   - Practical examples with user management, e-commerce, and content systems

3. **[State Data Types Guide](state-data-types-guide.md)**
   - Detailed information about all supported data types
   - Collection, Object, Array, String, Number, Boolean
   - Special types: Node, Function, Any
   - Type validation rules and constraints
   - Type comparison tables
   - Common type patterns and validation examples

4. **[State Relationships Guide](state-relationships-guide.md)**
   - How to define and manage relationships between collections
   - One-to-One, One-to-Many, Many-to-Many relationships
   - Bidirectional relationship tracking
   - Cascade operations (delete, update)
   - Data expansion for retrieving related data
   - Querying with relationships
   - Practical examples: Blog system, E-commerce, Social network

5. **[State Validation Guide](state-validation-guide.md)**
   - Automatic validation in the state system
   - Type validation, schema validation, relationship validation
   - Validation rules by type (min/max, pattern, enum, etc.)
   - Error handling and DataSchemaException
   - Custom validation functions
   - Validation flow and strategies
   - Testing validation
   - Common validation patterns

6. **[State Events and Listeners Guide](state-events-listeners-guide.md)**
   - Event-driven architecture overview
   - Adding and removing listeners
   - Priority and force listeners
   - Event propagation control
   - Practical examples: Activity tracking, Cache invalidation, Notifications
   - Testing listeners
   - Common listener patterns

7. **[State Advanced Patterns Guide](state-advanced-patterns.md)**
   - 10 advanced patterns for complex applications
   - Derived state, Computed properties, Selectors
   - Optimistic updates, Transactional updates
   - Debounced updates, Pagination
   - State versioning, Normalization, Synchronization
   - Performance optimization patterns
   - Best practices for each pattern

8. **[State API Reference](state-api-reference.md)**
   - Complete API documentation for all functions
   - Core functions: stateSetValue, stateGetValue, stateDeleteValue, stateFind
   - Event functions: stateAddListener, stateDeleteListener
   - Schema functions: stateGetSchema, stateSetSchema
   - Utility functions: arrayHasDuplicates, newDataInstance
   - Type definitions: DataValue, DataMetadata, DataWhere, SchemaEntry
   - Error types and codes
   - Complete working example

9. **[StateSetValue Guide](stateSetValue-guide.md)**
   - Comprehensive guide to the stateSetValue function
   - Data types and usage examples
   - Available options and configuration
   - Common patterns and workflows
   - Return value structure
   - Practical examples with ID tracking and metadata
   - Common mistakes to avoid

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
├── state-schema-guide.md              # Schema definitions and usage
├── state-default-values-guide.md      # Default values and ID generation
├── state-data-types-guide.md          # Data types and validation
├── state-relationships-guide.md       # Relationships and cascade operations
├── state-validation-guide.md          # Validation rules and error handling
├── state-events-listeners-guide.md    # Event-driven programming
├── state-advanced-patterns.md         # Advanced patterns and techniques
├── state-api-reference.md             # Complete API documentation
└── stateSetValue-guide.md             # stateSetValue function guide
```

## Learning Path

### For Beginners

1. Start with **[State Schema Guide](state-schema-guide.md)** to understand schema definitions
2. Read **[State Data Types Guide](state-data-types-guide.md)** to learn about data types
3. Study **[StateSetValue Guide](stateSetValue-guide.md)** for practical usage

### For Intermediate Users

1. Read **[State Default Values Guide](state-default-values-guide.md)** for configuration
2. Study **[State Relationships Guide](state-relationships-guide.md)** for data modeling
3. Learn **[State Validation Guide](state-validation-guide.md)** for data integrity

### For Advanced Users

1. Explore **[State Events and Listeners Guide](state-events-listeners-guide.md)** for reactive programming
2. Study **[State Advanced Patterns Guide](state-advanced-patterns.md)** for complex applications
3. Use **[State API Reference](state-api-reference.md)** as a quick reference

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

## Common Use Cases

### User Management
```javascript
// Schema
{
  type: 'collection',
  items: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      email: { type: 'string' },
      role: { type: 'string', enum: ['user', 'admin'], default: 'user' }
    }
  }
}

// Usage
stateSetValue({
  name: 'user/profiles',
  value: { name: 'John', email: 'john@example.com' }
})
```

### E-commerce
```javascript
// Schema with relationships
{
  type: 'collection',
  items: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      price: { type: 'number', minimum: 0, multipleOf: 0.01 },
      categoryId: { type: 'string', relation: 'product/categories' }
    }
  }
}
```

### Blog/Content System
```javascript
// Schema with relationships and validation
{
  type: 'collection',
  items: {
    type: 'object',
    properties: {
      title: { type: 'string', minLength: 5, maxLength: 200 },
      content: { type: 'string', minLength: 10 },
      authorId: { type: 'string', relation: 'user/profiles' },
      tags: { type: 'array', items: { type: 'string' }, uniqueItems: true }
    }
  }
}
```

## Testing

All documentation includes testing examples using Node.js test runner:

```javascript
import { test } from 'node:test'
import { strictEqual } from 'node:assert'

test('example test', async (t) => {
  // Test code here
})
```

## Next Steps

1. **Read the guides** in the recommended learning path
2. **Experiment with examples** in your own projects
3. **Check the API reference** for detailed function documentation
4. **Review advanced patterns** for complex use cases
5. **Join the community** for support and discussions

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
- Study **[Practical Examples](stateSetValue-guide.md)** for implementation ideas

---

**Note**: This documentation is part of the Dooksa state management system. For the latest updates and additional resources, refer to the main project documentation.