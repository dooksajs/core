# State Data Types Guide

This guide provides detailed information about all data types supported by the Dooksa state management system, including their characteristics, validation rules, and usage patterns.

## Overview

The Dooksa state system supports six primary data types:

1. **Collection** - Multiple documents with unique IDs
2. **Object** - Single structured document
3. **Array** - Ordered list of items
4. **String** - Text values
5. **Number** - Numeric values
6. **Boolean** - True/false values

Additionally, there are special types like **Node** (for DOM elements) and **Function** for internal use.

## Collection Type

### Characteristics

Collections are the most complex data type, designed to store multiple documents that can be individually accessed by unique IDs.

**Key Features:**
- Stores multiple documents (objects)
- Each document has a unique ID
- Supports auto-generated IDs
- Can define ID generation rules (prefix, suffix, custom functions)
- Enables relationships between collections
- Supports cascade operations

### Schema Definition

```javascript
{
  type: 'collection',
  items: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      name: { type: 'string' },
      email: { type: 'string' }
    }
  },
  id: {
    prefix: 'user_',
    suffix: '_v1'
  }
}
```

### Usage Examples

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
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string', default: 'user' }
          },
          required: ['name', 'email']
        },
        id: {
          prefix: 'user_',
          suffix: () => '_' + new Date().getFullYear()
        }
      }
    }
  }
})

// Add a new user (auto ID)
const result = stateSetValue({
  name: 'user/profiles',
  value: { name: 'John Doe', email: 'john@example.com' }
})
// result.id = 'user_abc123_2026'
// result.item = { name: 'John Doe', email: 'john@example.com', role: 'user' }

// Add a user with custom ID
const result2 = stateSetValue({
  name: 'user/profiles',
  value: { name: 'Jane Smith', email: 'jane@example.com' },
  options: { id: 'custom-123' }
})
// result2.id = 'custom-123'

// Get all users
const allUsers = stateGetValue({ name: 'user/profiles' })
// allUsers.item = [ { id: 'user_abc123_2026', ... }, { id: 'custom-123', ... } ]

// Get specific user
const user = stateGetValue({ name: 'user/profiles', id: 'user_abc123_2026' })
// user.item = { name: 'John Doe', email: 'john@example.com', role: 'user' }

// Update user
stateSetValue({
  name: 'user/profiles',
  value: { name: 'John Updated', email: 'john@example.com', role: 'admin' },
  options: { id: 'user_abc123_2026', merge: true }
})

// Delete user
stateDeleteValue({
  name: 'user/profiles',
  id: 'user_abc123_2026',
  cascade: true  // Delete related data
})
```

### When to Use Collections

**Use collections when:**
- You have multiple similar items that need individual access
- Items need unique identifiers
- You need to query/filter items
- You need relationships between data
- You need to track changes per item

**Examples:**
- User profiles
- Blog posts
- Products in an e-commerce store
- Orders
- Comments

### When NOT to Use Collections

**Avoid collections when:**
- You only need a single item
- Items don't need unique IDs
- You're storing configuration/settings
- You need a simple list without individual access

**Use object or array instead.**

## Object Type

### Characteristics

Objects store a single structured document without an ID. They're ideal for configuration, settings, or single-record data.

**Key Features:**
- Single document per collection
- No ID required
- Supports nested objects
- Can define required properties
- Supports pattern properties for dynamic keys

### Schema Definition

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
  },
  additionalProperties: false  // Optional: restrict to defined properties
}
```

### Usage Examples

```javascript
// Plugin definition
createPlugin('app', {
  state: {
    schema: {
      settings: {
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
        }
      }
    },
    defaults: {
      settings: {
        theme: 'dark',
        language: 'en',
        notifications: {
          email: true,
          push: false
        }
      }
    }
  }
})

// Get settings
const settings = stateGetValue({ name: 'app/settings' })
// settings.item = { theme: 'dark', language: 'en', notifications: { email: true, push: false } }

// Update settings (full replacement)
stateSetValue({
  name: 'app/settings',
  value: { theme: 'light', language: 'es', notifications: { email: false, push: true } }
})

// Update settings (merge)
stateSetValue({
  name: 'app/settings',
  value: { theme: 'dark' },
  options: { merge: true }
})
// Result: Only theme changes, other properties remain
```

### Pattern Properties

Objects can define schemas for dynamic property names using regular expressions:

```javascript
{
  type: 'object',
  patternProperties: {
    '^[0-9]+$': {  // Property names must be numeric strings
      type: 'object',
      properties: {
        id: { type: 'string' },
        value: { type: 'number' }
      }
    }
  },
  additionalProperties: false
}
```

**Usage:**
```javascript
stateSetValue({
  name: 'app/dynamicData',
  value: {
    '123': { id: 'item-123', value: 100 },
    '456': { id: 'item-456', value: 200 }
  }
})
```

### When to Use Objects

**Use objects when:**
- You need a single document
- No unique ID is required
- You're storing configuration/settings
- You need nested data structures
- You need dynamic property names

**Examples:**
- Application settings
- User preferences
- Configuration data
- Single-record data (like current user profile)
- Metadata storage

### When NOT to Use Objects

**Avoid objects when:**
- You need multiple items
- Items need unique IDs
- You need to query/filter items
- You need relationships

**Use collections instead.**

## Array Type

### Characteristics

Arrays store ordered lists of values. Each item in the array must match the defined item schema.

**Key Features:**
- Ordered collection of items
- All items must match the item schema
- Supports unique items constraint
- Can define relationships
- Supports primitive and complex types

### Schema Definition

```javascript
// Array of strings
{
  type: 'array',
  items: { type: 'string' }
}

// Array of objects
{
  type: 'array',
  items: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      name: { type: 'string' }
    }
  }
}

// Array with unique items constraint
{
  type: 'array',
  items: { type: 'string' },
  uniqueItems: true
}
```

### Usage Examples

```javascript
// Plugin definition
createPlugin('app', {
  state: {
    schema: {
      tags: {
        type: 'array',
        items: { type: 'string' },
        uniqueItems: true
      },
      categories: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' }
          }
        }
      }
    }
  }
})

// Set array of strings
stateSetValue({
  name: 'app/tags',
  value: ['javascript', 'nodejs', 'dooksa']
})

// Add to array (push)
stateSetValue({
  name: 'app/tags',
  value: ['react'],
  options: {
    update: {
      method: 'push'
    }
  }
})
// Result: ['javascript', 'nodejs', 'dooksa', 'react']

// Remove from array (pull)
stateSetValue({
  name: 'app/tags',
  value: ['nodejs'],
  options: {
    update: {
      method: 'pull'
    }
  }
})
// Result: ['javascript', 'dooksa', 'react']

// Set array of objects
stateSetValue({
  name: 'app/categories',
  value: [
    { id: 'cat-1', name: 'Technology' },
    { id: 'cat-2', name: 'Science' }
  ]
})

// Get array
const tags = stateGetValue({ name: 'app/tags' })
// tags.item = ['javascript', 'dooksa', 'react']
```

### Array Operations

Arrays support several update methods:

```javascript
// Push (add to end)
stateSetValue({
  name: 'app/tags',
  value: 'new-tag',
  options: { update: { method: 'push' } }
})

// Pop (remove from end)
stateSetValue({
  name: 'app/tags',
  value: null,
  options: { update: { method: 'pop' } }
})

// Unshift (add to beginning)
stateSetValue({
  name: 'app/tags',
  value: 'first-tag',
  options: { update: { method: 'unshift' } }
})

// Shift (remove from beginning)
stateSetValue({
  name: 'app/tags',
  value: null,
  options: { update: { method: 'shift' } }
})

// Pull (remove specific items)
stateSetValue({
  name: 'app/tags',
  value: ['old-tag', 'another-tag'],
  options: { update: { method: 'pull' } }
})

// Splice (insert/remove at specific position)
stateSetValue({
  name: 'app/tags',
  value: ['new-tag'],
  options: {
    update: {
      method: 'splice',
      startIndex: 1,
      deleteCount: 2
    }
  }
})
```

### When to Use Arrays

**Use arrays when:**
- You need an ordered list
- Items don't need unique IDs
- You need to maintain order
- You need to add/remove items dynamically
- All items are of the same type

**Examples:**
- Tags
- Categories
- Lists of items
- Ordered data
- Simple collections without IDs

### When NOT to Use Arrays

**Avoid arrays when:**
- Items need unique IDs
- You need to access items by ID
- You need relationships between items
- You need to query/filter by properties

**Use collections instead.**

## String Type

### Characteristics

Strings store text data. They're the most common primitive type.

**Key Features:**
- Text data
- Supports validation patterns
- Can have length constraints
- Can have default values
- Supports relationships

### Schema Definition

```javascript
{
  type: 'string'
}

// With constraints
{
  type: 'string',
  minLength: 3,
  maxLength: 50,
  pattern: '^[a-zA-Z0-9]+$'
}

// With default
{
  type: 'string',
  default: 'active'
}

// With relation
{
  type: 'string',
  relation: 'user/profiles'  // References a user profile
}
```

### Validation Rules

```javascript
// minLength - minimum length
{ type: 'string', minLength: 3 }

// maxLength - maximum length
{ type: 'string', maxLength: 100 }

// pattern - regex pattern
{ type: 'string', pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$' }  // Email

// enum - allowed values
{ type: 'string', enum: ['active', 'inactive', 'pending'] }
```

### Usage Examples

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
            id: { type: 'string' },
            name: { 
              type: 'string',
              minLength: 2,
              maxLength: 50
            },
            email: {
              type: 'string',
              pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$'
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive', 'suspended'],
              default: 'active'
            },
            profileId: {
              type: 'string',
              relation: 'user/details'
            }
          },
          required: ['name', 'email']
        }
      }
    }
  }
})

// Valid string values
stateSetValue({
  name: 'user/profiles',
  value: {
    name: 'John Doe',
    email: 'john@example.com',
    status: 'active'
  }
})

// Invalid - too short
stateSetValue({
  name: 'user/profiles',
  value: {
    name: 'J',  // Too short (minLength: 2)
    email: 'john@example.com'
  }
})
// Throws DataSchemaException

// Invalid - bad email format
stateSetValue({
  name: 'user/profiles',
  value: {
    name: 'John Doe',
    email: 'not-an-email'  // Doesn't match pattern
  }
})
// Throws DataSchemaException

// Invalid - wrong enum value
stateSetValue({
  name: 'user/profiles',
  value: {
    name: 'John Doe',
    email: 'john@example.com',
    status: 'archived'  // Not in enum
  }
})
// Throws DataSchemaException
```

### When to Use Strings

**Use strings for:**
- Names
- Descriptions
- Email addresses
- URLs
- IDs (as values)
- Status values
- Text content
- Dates (as ISO strings)

## Number Type

### Characteristics

Numbers store numeric values (integers and floats).

**Key Features:**
- Numeric data
- Supports minimum/maximum constraints
- Can have default values
- Supports relationships

### Schema Definition

```javascript
{
  type: 'number'
}

// With constraints
{
  type: 'number',
  minimum: 0,
  maximum: 100,
  multipleOf: 5
}

// With default
{
  type: 'number',
  default: 0
}

// With relation
{
  type: 'number',
  relation: 'product/prices'
}
```

### Validation Rules

```javascript
// minimum - minimum value
{ type: 'number', minimum: 0 }

// maximum - maximum value
{ type: 'number', maximum: 100 }

// exclusiveMinimum - value must be greater than
{ type: 'number', exclusiveMinimum: 0 }

// exclusiveMaximum - value must be less than
{ type: 'number', exclusiveMaximum: 100 }

// multipleOf - must be multiple of
{ type: 'number', multipleOf: 0.01 }  // Currency

// integer - must be integer
{ type: 'number', minimum: 1, maximum: 100 }  // No decimal part
```

### Usage Examples

```javascript
// Plugin definition
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
            price: {
              type: 'number',
              minimum: 0,
              maximum: 10000,
              multipleOf: 0.01  // 2 decimal places
            },
            stock: {
              type: 'number',
              minimum: 0,
              default: 0
            },
            rating: {
              type: 'number',
              minimum: 1,
              maximum: 5
            }
          },
          required: ['name', 'price']
        }
      }
    }
  }
})

// Valid number values
stateSetValue({
  name: 'product/products',
  value: {
    name: 'Widget',
    price: 29.99,
    stock: 100,
    rating: 4.5
  }
})

// Invalid - negative price
stateSetValue({
  name: 'product/products',
  value: {
    name: 'Widget',
    price: -10  // Below minimum
  }
})
// Throws DataSchemaException

// Invalid - too many decimal places
stateSetValue({
  name: 'product/products',
  value: {
    name: 'Widget',
    price: 29.999  // Not multiple of 0.01
  }
})
// Throws DataSchemaException

// Invalid - out of range rating
stateSetValue({
  name: 'product/products',
  value: {
    name: 'Widget',
    price: 29.99,
    rating: 6  // Above maximum
  }
})
// Throws DataSchemaException
```

### When to Use Numbers

**Use numbers for:**
- Prices
- Quantities
- Scores
- Ratings
- Counts
- Ages
- Timestamps
- Coordinates
- Percentages

## Boolean Type

### Characteristics

Booleans store true/false values.

**Key Features:**
- True/false values
- Simple validation
- Can have default values
- Useful for flags

### Schema Definition

```javascript
{
  type: 'boolean'
}

// With default
{
  type: 'boolean',
  default: false
}
```

### Usage Examples

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
            id: { type: 'string' },
            name: { type: 'string' },
            emailVerified: {
              type: 'boolean',
              default: false
            },
            twoFactorEnabled: {
              type: 'boolean',
              default: false
            },
            newsletterSubscribed: {
              type: 'boolean',
              default: true
            }
          }
        }
      }
    }
  }
})

// Valid boolean values
stateSetValue({
  name: 'user/profiles',
  value: {
    name: 'John Doe',
    emailVerified: true,
    twoFactorEnabled: false,
    newsletterSubscribed: true
  }
})

// Get user and check flags
const user = stateGetValue({ name: 'user/profiles', id: 'user-123' })
if (user.item.emailVerified) {
  // User has verified email
}
```

### When to Use Booleans

**Use booleans for:**
- Flags (enabled/disabled)
- Verification status
- Subscription status
- Visibility flags
- Active/inactive status
- Yes/no questions
- Feature toggles

## Special Types

### Node Type

The `node` type is used for DOM elements. It's a special type used internally.

```javascript
{
  type: 'node'
}
```

**Usage:**
```javascript
// Used internally by the framework
// Not typically used directly in plugin definitions
```

### Function Type

The `function` type is used for internal functions. It's a special type used internally.

```javascript
{
  type: 'function'
}
```

**Usage:**
```javascript
// Used internally by the framework
// Not typically used directly in plugin definitions
```

### Any Type

The `any` type allows any data type. It's useful for flexible data structures.

```javascript
{
  type: 'any'
}
```

**Usage:**
```javascript
// Plugin definition
createPlugin('app', {
  state: {
    schema: {
      data: {
        type: 'any'  // Can store any value
      }
    }
  }
})

// Can store any value
stateSetValue({ name: 'app/data', value: 'string' })
stateSetValue({ name: 'app/data', value: 123 })
stateSetValue({ name: 'app/data', value: true })
stateSetValue({ name: 'app/data', value: { key: 'value' } })
stateSetValue({ name: 'app/data', value: [1, 2, 3] })
```

## Type Comparison

### Collection vs Object

| Feature | Collection | Object |
|---------|------------|--------|
| Multiple items | ✅ Yes | ❌ No |
| Unique IDs | ✅ Yes | ❌ No |
| Individual access | ✅ Yes | ❌ No |
| Relationships | ✅ Yes | ❌ No |
| ID generation | ✅ Yes | ❌ No |
| Use case | Multiple records | Single record |

### Array vs Collection

| Feature | Array | Collection |
|---------|-------|------------|
| Unique IDs | ❌ No | ✅ Yes |
| Individual access | ❌ By index | ✅ By ID |
| Order | ✅ Maintained | ❌ Not guaranteed |
| Relationships | ⚠️ Limited | ✅ Full support |
| Use case | Ordered list | ID-based records |

### Object vs Array

| Feature | Object | Array |
|---------|--------|-------|
| Structure | Key-value pairs | Ordered list |
| Access | By key | By index |
| Use case | Configuration | Lists |

## Type Validation

### Automatic Validation

All types are automatically validated when data is set:

```javascript
// Schema
{
  type: 'object',
  properties: {
    name: { type: 'string' },
    age: { type: 'number', minimum: 0 },
    active: { type: 'boolean' }
  }
}

// Valid
stateSetValue({
  name: 'user',
  value: {
    name: 'John',
    age: 30,
    active: true
  }
})

// Invalid - wrong types
stateSetValue({
  name: 'user',
  value: {
    name: 'John',
    age: 'thirty',  // Should be number
    active: 'yes'   // Should be boolean
  }
})
// Throws DataSchemaException
```

### Nested Type Validation

```javascript
// Schema
{
  type: 'object',
  properties: {
    user: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        age: { type: 'number' }
      }
    },
    tags: {
      type: 'array',
      items: { type: 'string' }
    }
  }
}

// Valid
stateSetValue({
  name: 'app/data',
  value: {
    user: { name: 'John', age: 30 },
    tags: ['developer', 'javascript']
  }
})

// Invalid - nested type mismatch
stateSetValue({
  name: 'app/data',
  value: {
    user: { name: 'John', age: '30' },  // age should be number
    tags: ['developer', 'javascript']
  }
})
// Throws DataSchemaException
```

## Type Coercion

Dooksa does not perform automatic type coercion. All values must match the expected type exactly.

```javascript
// Schema
{ type: 'number' }

// ❌ Wrong - string will not be coerced to number
stateSetValue({ name: 'counter', value: '42' })
// Throws DataSchemaException

// ✅ Correct - provide the right type
stateSetValue({ name: 'counter', value: 42 })
```

## Best Practices

### 1. Choose the Right Type

```javascript
// Good - appropriate types
createPlugin('app', {
  state: {
    schema: {
      user: {
        type: 'object',
        properties: {
          name: { type: 'string' },      // Text
          age: { type: 'number' },       // Number
          active: { type: 'boolean' },   // Boolean
          tags: {                        // Array
            type: 'array',
            items: { type: 'string' }
          }
        }
      }
    }
  }
})

// Bad - inappropriate types
createPlugin('app', {
  state: {
    schema: {
      user: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'string' },      // Should be number
          active: { type: 'string' },   // Should be boolean
          tags: { type: 'string' }      // Should be array
        }
      }
    }
  }
})
```

### 2. Use Constraints

```javascript
// Good - with constraints
{
  type: 'string',
  minLength: 3,
  maxLength: 50,
  pattern: '^[a-zA-Z0-9]+$'
}

{
  type: 'number',
  minimum: 0,
  maximum: 100
}

// Bad - no constraints
{
  type: 'string'
}

{
  type: 'number'
}
```

### 3. Use Defaults

```javascript
// Good - with defaults
{
  type: 'string',
  default: 'active'
}

{
  type: 'number',
  default: 0
}

{
  type: 'boolean',
  default: false
}

// Bad - no defaults
{
  type: 'string'
}

{
  type: 'number'
}

{
  type: 'boolean'
}
```

### 4. Document Types

```javascript
// Good - documented
createPlugin('user', {
  state: {
    schema: {
      profiles: {
        type: 'collection',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { 
              type: 'string',
              minLength: 2,
              maxLength: 50,
              description: 'User full name'
            },
            email: {
              type: 'string',
              pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
              description: 'Valid email address'
            },
            age: {
              type: 'number',
              minimum: 0,
              maximum: 150,
              description: 'User age in years'
            },
            active: {
              type: 'boolean',
              default: true,
              description: 'Whether user account is active'
            }
          }
        }
      }
    }
  }
})
```

## Common Type Patterns

### Pattern 1: Timestamp

```javascript
{
  type: 'number',
  default: () => Date.now(),
  minimum: 0
}
```

### Pattern 2: ID Reference

```javascript
{
  type: 'string',
  relation: 'collection-name'
}
```

### Pattern 3: Email

```javascript
{
  type: 'string',
  pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$'
}
```

### Pattern 4: URL

```javascript
{
  type: 'string',
  pattern: '^https?://.+'
}
```

### Pattern 5: Percentage

```javascript
{
  type: 'number',
  minimum: 0,
  maximum: 100,
  multipleOf: 0.01
}
```

### Pattern 6: Currency

```javascript
{
  type: 'number',
  minimum: 0,
  maximum: 1000000,
  multipleOf: 0.01
}
```

### Pattern 7: Status Enum

```javascript
{
  type: 'string',
  enum: ['active', 'inactive', 'pending', 'suspended'],
  default: 'active'
}
```

### Pattern 8: Tags Array

```javascript
{
  type: 'array',
  items: { type: 'string' },
  uniqueItems: true
}
```

## Type Error Handling

When type validation fails, a `DataSchemaException` is thrown with detailed information:

```javascript
try {
  stateSetValue({
    name: 'user/profiles',
    value: {
      name: 'John',
      age: 'thirty',  // Should be number
      active: 'yes'   // Should be boolean
    }
  })
} catch (error) {
  console.error('Type validation failed:', error.message)
  // Example: "Type mismatch at user/profiles/age: expected number, got string"
}
```

## Next Steps

- Read [State Schema Guide](state-schema-guide.md) to learn about schema definitions
- Read [State Default Values Guide](state-default-values-guide.md) for default value configuration
- Read [State Relationships Guide](state-relationships-guide.md) for relationship management
- Read [State Validation Guide](state-validation-guide.md) for advanced validation rules