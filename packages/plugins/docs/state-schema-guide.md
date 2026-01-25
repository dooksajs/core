# State Schema Guide

This guide explains how to define and use state schemas in the Dooksa state management system. Schemas provide type-safe data structures with validation rules for your application state.

## Overview

A schema defines the structure, type, and validation rules for data stored in the state. Every state collection must have a schema that specifies:

- **Data Type**: What type of data is stored (string, number, boolean, object, array, collection)
- **Properties**: For objects, what properties are allowed
- **Validation Rules**: Constraints like required fields, unique items, pattern matching
- **Relationships**: Links to other data collections
- **Default Values**: Initial values for data
- **ID Generation**: How to generate IDs for collections

## Schema Types

The Dooksa state system supports six primary data types:

### 1. Collection Type

Collections store multiple documents with unique IDs. Each document in a collection is an object with its own properties.

**Schema Definition:**
```javascript
{
  type: 'collection',
  items: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      age: { type: 'number' },
      email: { type: 'string' }
    }
  }
}
```

**Key Features:**
- Auto-generates IDs if not provided
- Supports prefix/suffix for IDs
- Can define custom ID generation functions
- Each document is independently addressable

**Example Usage:**
```javascript
// Plugin definition
createPlugin('user', {
  state: {
    schema: {
      profiles: {
        type: 'collection',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            age: { type: 'number' }
          }
        }
      }
    }
  }
})

// Setting values
stateSetValue({
  name: 'user/profiles',
  value: { name: 'John', age: 30 },
  options: { id: 'user-123' }
})

// Auto-generated ID
const result = stateSetValue({
  name: 'user/profiles',
  value: { name: 'Jane', age: 25 }
})
// result.id contains auto-generated ID
```

### 2. Object Type

Objects store a single structured document without an ID. Useful for configuration, settings, or single-record data.

**Schema Definition:**
```javascript
{
  type: 'object',
  properties: {
    theme: { type: 'string' },
    notifications: { type: 'boolean' },
    settings: {
      type: 'object',
      properties: {
        fontSize: { type: 'number' },
        language: { type: 'string' }
      }
    }
  }
}
```

**Key Features:**
- Single document per collection
- No ID required
- Supports nested objects
- Can define required properties

**Example Usage:**
```javascript
// Plugin definition
createPlugin('app', {
  state: {
    schema: {
      settings: {
        type: 'object',
        properties: {
          theme: { type: 'string' },
          notifications: { type: 'boolean' }
        }
      }
    }
  }
})

// Setting values
stateSetValue({
  name: 'app/settings',
  value: { theme: 'dark', notifications: true }
})
```

### 3. Array Type

Arrays store ordered lists of values. Each item in the array must match the defined item schema.

**Schema Definition:**
```javascript
{
  type: 'array',
  items: {
    type: 'string'
  }
}
```

**Key Features:**
- Ordered collection of items
- All items must match the item schema
- Supports unique items constraint
- Can define relationships

**Example Usage:**
```javascript
// Plugin definition
createPlugin('app', {
  state: {
    schema: {
      tags: {
        type: 'array',
        items: { type: 'string' }
      }
    }
  }
})

// Setting values
stateSetValue({
  name: 'app/tags',
  value: ['javascript', 'nodejs', 'dooksa']
})
```

### 4. Primitive Types

Primitive types store simple values: strings, numbers, and booleans.

**Schema Definition:**
```javascript
// String
{ type: 'string' }

// Number
{ type: 'number' }

// Boolean
{ type: 'boolean' }
```

**Example Usage:**
```javascript
// Plugin definition
createPlugin('counter', {
  state: {
    schema: {
      count: { type: 'number' },
      name: { type: 'string' },
      isActive: { type: 'boolean' }
    }
  }
})

// Setting values
stateSetValue({
  name: 'counter/count',
  value: 42
})
```

## Schema Properties

### Type Property

The `type` property defines the data type. Valid values:
- `'collection'` - Multiple documents with IDs
- `'object'` - Single structured document
- `'array'` - Ordered list of items
- `'string'` - Text value
- `'number'` - Numeric value
- `'boolean'` - Boolean value

### Items Property

Used with `array` and `collection` types to define the schema of items within the collection.

```javascript
// Array of strings
{
  type: 'array',
  items: { type: 'string' }
}

// Collection of user objects
{
  type: 'collection',
  items: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      age: { type: 'number' }
    }
  }
}
```

### Properties Property

Used with `object` type to define the schema of object properties.

```javascript
{
  type: 'object',
  properties: {
    name: { type: 'string' },
    age: { type: 'number' },
    settings: {
      type: 'object',
      properties: {
        theme: { type: 'string' }
      }
    }
  }
}
```

### Pattern Properties

Used with `object` type to define schemas for dynamic property names using regular expressions.

```javascript
{
  type: 'object',
  patternProperties: {
    '^[0-9]+$': {  // Property names must be numeric
      type: 'object',
      properties: {
        id: { type: 'string' },
        value: { type: 'number' }
      }
    }
  }
}
```

### Required Property

Specifies which properties must be present in an object. If a required property is missing, validation will throw an error.

```javascript
{
  type: 'object',
  properties: {
    name: { type: 'string' },
    email: { type: 'string' },
    age: { type: 'number' }
  },
  required: ['name', 'email']  // age is optional
}
```

### Relation Property

Creates a relationship between collections. This enables cascade operations and data integrity.

```javascript
// User collection with reference to profile
{
  type: 'collection',
  items: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      profileId: { 
        type: 'string',
        relation: 'profile'  // References the 'profile' collection
      }
    }
  }
}
```

### Unique Items Property

Ensures all items in an array are unique. Throws an error if duplicates are found.

```javascript
{
  type: 'array',
  items: { type: 'string' },
  uniqueItems: true
}
```

### Additional Properties Property

Controls whether objects can have properties not defined in the schema.

```javascript
// Only allow defined properties
{
  type: 'object',
  properties: {
    name: { type: 'string' },
    age: { type: 'number' }
  },
  additionalProperties: false
}

// Allow any additional properties (default)
{
  type: 'object',
  properties: {
    name: { type: 'string' }
  },
  additionalProperties: true  // or omit this property
}
```

### Default Value Property

Provides a default value for a property when it's not provided during data setting.

```javascript
{
  type: 'object',
  properties: {
    name: { type: 'string' },
    status: { 
      type: 'string',
      default: 'active'
    },
    createdAt: {
      type: 'number',
      default: () => Date.now()  // Function-based default
    }
  }
}
```

## ID Generation for Collections

Collections can define how IDs are generated using the `id` property.

### Static Prefix and Suffix

```javascript
{
  type: 'collection',
  items: { type: 'object', properties: {} },
  id: {
    prefix: 'user_',
    suffix: '_v1'
  }
}

// Usage
stateSetValue({
  name: 'users',
  value: { name: 'John' }
})
// Generated ID: 'user_abc123_v1'
```

### Dynamic Prefix/Suffix (Function)

```javascript
{
  type: 'collection',
  items: { type: 'object', properties: {} },
  id: {
    prefix: () => 'user_',
    suffix: () => '_' + new Date().getFullYear()
  }
}
```

### Custom Default ID Generator

```javascript
{
  type: 'collection',
  items: { type: 'object', properties: {} },
  id: {
    default: () => 'custom-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
  }
}
```

## Nested Schemas

Schemas can be nested to create complex data structures.

### Deeply Nested Objects

```javascript
{
  type: 'object',
  properties: {
    user: {
      type: 'object',
      properties: {
        profile: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            age: { type: 'number' },
            settings: {
              type: 'object',
              properties: {
                theme: { type: 'string' },
                notifications: {
                  type: 'object',
                  properties: {
                    email: { type: 'boolean' },
                    push: { type: 'boolean' }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
```

### Arrays of Objects

```javascript
{
  type: 'array',
  items: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      name: { type: 'string' },
      tags: {
        type: 'array',
        items: { type: 'string' }
      }
    }
  }
}
```

### Collections with Nested Data

```javascript
{
  type: 'collection',
  items: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      name: { type: 'string' },
      profile: {
        type: 'object',
        properties: {
          age: { type: 'number' },
          settings: {
            type: 'object',
            properties: {
              theme: { type: 'string' }
            }
          }
        }
      }
    }
  }
}
```

## Schema Validation

Schemas are validated automatically when data is set using `stateSetValue`. Validation includes:

### Type Validation

Ensures data matches the expected type:

```javascript
// Schema
{ type: 'number' }

// Valid
stateSetValue({ name: 'counter', value: 42 })

// Invalid - throws DataSchemaException
stateSetValue({ name: 'counter', value: 'not a number' })
```

### Required Property Validation

Ensures required properties are present:

```javascript
// Schema
{
  type: 'object',
  properties: {
    name: { type: 'string' },
    email: { type: 'string' }
  },
  required: ['name', 'email']
}

// Valid
stateSetValue({
  name: 'user',
  value: { name: 'John', email: 'john@example.com' }
})

// Invalid - throws DataSchemaException
stateSetValue({
  name: 'user',
  value: { name: 'John' }  // Missing 'email'
})
```

### Unique Items Validation

Ensures array items are unique when `uniqueItems` is true:

```javascript
// Schema
{
  type: 'array',
  items: { type: 'string' },
  uniqueItems: true
}

// Valid
stateSetValue({
  name: 'tags',
  value: ['tag1', 'tag2', 'tag3']
})

// Invalid - throws DataSchemaException
stateSetValue({
  name: 'tags',
  value: ['tag1', 'tag2', 'tag1']  // Duplicate 'tag1'
})
```

### Additional Properties Validation

Ensures objects only contain allowed properties when `additionalProperties: false`:

```javascript
// Schema
{
  type: 'object',
  properties: {
    name: { type: 'string' },
    age: { type: 'number' }
  },
  additionalProperties: false
}

// Valid
stateSetValue({
  name: 'user',
  value: { name: 'John', age: 30 }
})

// Invalid - throws DataSchemaException
stateSetValue({
  name: 'user',
  value: { name: 'John', age: 30, extra: 'not allowed' }
})
```

## Schema Examples

### Complete User Management Schema

```javascript
createPlugin('user', {
  state: {
    schema: {
      // Collection of users
      profiles: {
        type: 'collection',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            age: { type: 'number' },
            role: { 
              type: 'string',
              default: 'user'
            },
            profileId: {
              type: 'string',
              relation: 'user/details'
            }
          },
          required: ['name', 'email']
        },
        id: {
          prefix: 'user_',
          suffix: '_v1'
        }
      },
      
      // User details (one-to-one with profiles)
      details: {
        type: 'collection',
        items: {
          type: 'object',
          properties: {
            bio: { type: 'string' },
            avatar: { type: 'string' },
            settings: {
              type: 'object',
              properties: {
                theme: { type: 'string', default: 'light' },
                notifications: {
                  type: 'object',
                  properties: {
                    email: { type: 'boolean', default: true },
                    push: { type: 'boolean', default: false }
                  }
                }
              }
            }
          }
        }
      },
      
      // User sessions
      sessions: {
        type: 'collection',
        items: {
          type: 'object',
          properties: {
            userId: {
              type: 'string',
              relation: 'user/profiles'
            },
            token: { type: 'string' },
            expiresAt: { type: 'number' }
          },
          required: ['userId', 'token']
        }
      }
    }
  }
})
```

### E-commerce Product Schema

```javascript
createPlugin('product', {
  state: {
    schema: {
      products: {
        type: 'collection',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'number' },
            category: { type: 'string' },
            tags: {
              type: 'array',
              items: { type: 'string' },
              uniqueItems: true
            },
            inventory: {
              type: 'object',
              properties: {
                stock: { type: 'number', default: 0 },
                reserved: { type: 'number', default: 0 }
              }
            },
            categoryId: {
              type: 'string',
              relation: 'product/categories'
            }
          },
          required: ['name', 'price', 'category']
        },
        id: {
          prefix: 'prod_'
        }
      },
      
      categories: {
        type: 'collection',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            parentId: {
              type: 'string',
              relation: 'product/categories'
            }
          },
          required: ['name']
        }
      }
    }
  }
})
```

### Blog/Content Management Schema

```javascript
createPlugin('content', {
  state: {
    schema: {
      posts: {
        type: 'collection',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            content: { type: 'string' },
            authorId: {
              type: 'string',
              relation: 'user/profiles'
            },
            tags: {
              type: 'array',
              items: { type: 'string' }
            },
            categories: {
              type: 'array',
              items: { type: 'string' },
              uniqueItems: true
            },
            published: { type: 'boolean', default: false },
            publishedAt: { type: 'number' }
          },
          required: ['title', 'content', 'authorId']
        }
      },
      
      comments: {
        type: 'collection',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            postId: {
              type: 'string',
              relation: 'content/posts'
            },
            authorId: {
              type: 'string',
              relation: 'user/profiles'
            },
            content: { type: 'string' },
            parentId: {
              type: 'string',
              relation: 'content/comments'
            }
          },
          required: ['postId', 'authorId', 'content']
        }
      }
    }
  }
})
```

## Best Practices

### 1. Keep Schemas Simple

Start with simple schemas and add complexity only when needed:

```javascript
// Good - simple and clear
{
  type: 'object',
  properties: {
    name: { type: 'string' },
    age: { type: 'number' }
  }
}

// Avoid - overly complex
{
  type: 'object',
  properties: {
    name: { 
      type: 'object',
      properties: {
        first: { type: 'string' },
        last: { type: 'string' }
      }
    },
    age: { type: 'number' },
    settings: {
      type: 'object',
      properties: {
        theme: { type: 'string' },
        notifications: {
          type: 'object',
          properties: {
            email: { type: 'boolean' },
            push: { type: 'boolean' }
          }
        }
      }
    }
  }
}
```

### 2. Use Appropriate Types

Choose the right type for your data:

```javascript
// Good - collection for multiple items
{
  type: 'collection',
  items: { type: 'object', properties: {} }
}

// Good - object for single configuration
{
  type: 'object',
  properties: {
    theme: { type: 'string' }
  }
}

// Good - array for ordered lists
{
  type: 'array',
  items: { type: 'string' }
}
```

### 3. Define Required Fields

Mark essential properties as required:

```javascript
{
  type: 'object',
  properties: {
    name: { type: 'string' },
    email: { type: 'string' },
    age: { type: 'number' }
  },
  required: ['name', 'email']  // age is optional
}
```

### 4. Use Default Values

Provide sensible defaults for optional fields:

```javascript
{
  type: 'object',
  properties: {
    name: { type: 'string' },
    status: { 
      type: 'string',
      default: 'active'
    },
    createdAt: {
      type: 'number',
      default: () => Date.now()
    }
  }
}
```

### 5. Use Relationships for Data Integrity

Define relationships to maintain data consistency:

```javascript
// User references profile
{
  type: 'collection',
  items: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      profileId: {
        type: 'string',
        relation: 'user/profiles'
      }
    }
  }
}
```

### 6. Validate Early

Let the schema validation catch errors early:

```javascript
// Schema will validate type automatically
stateSetValue({
  name: 'counter',
  value: 42  // Valid
})

// Schema will throw error
stateSetValue({
  name: 'counter',
  value: 'not a number'  // Throws DataSchemaException
})
```

## Common Patterns

### Pattern 1: Hierarchical Data

```javascript
{
  type: 'collection',
  items: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      name: { type: 'string' },
      parentId: {
        type: 'string',
        relation: 'categories'  // Self-referencing
      }
    }
  }
}
```

### Pattern 2: Tagging System

```javascript
{
  type: 'array',
  items: { type: 'string' },
  uniqueItems: true  // No duplicate tags
}
```

### Pattern 3: Metadata Storage

```javascript
{
  type: 'object',
  properties: {
    data: { type: 'any' },  // Store any data type
    metadata: {
      type: 'object',
      properties: {
        createdAt: { type: 'number' },
        updatedAt: { type: 'number' },
        userId: { type: 'string' }
      }
    }
  }
}
```

### Pattern 4: Configuration Object

```javascript
{
  type: 'object',
  properties: {
    theme: { type: 'string', default: 'light' },
    language: { type: 'string', default: 'en' },
    notifications: {
      type: 'object',
      properties: {
        email: { type: 'boolean', default: true },
        push: { type: 'boolean', default: false }
      }
    }
  },
  additionalProperties: false  // Strict configuration
}
```

## Error Handling

When schema validation fails, a `DataSchemaException` is thrown with detailed information:

```javascript
try {
  stateSetValue({
    name: 'user/profiles',
    value: { name: 'John' }  // Missing required 'email'
  })
} catch (error) {
  console.error('Validation failed:', error.message)
  // Example: "Invalid data (user/profiles): required property missing: 'email'"
}
```

## Next Steps

- Read [State Default Values Guide](state-default-values-guide.md) to learn about default value configuration
- Read [State Data Types Guide](state-data-types-guide.md) for detailed type information
- Read [State Relationships Guide](state-relationships-guide.md) for relationship management
- Read [State Validation Guide](state-validation-guide.md) for advanced validation rules