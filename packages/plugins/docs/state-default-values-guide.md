# State Default Values Guide

This guide explains how to configure and use default values in the Dooksa state management system. Default values provide initial data for state properties and can be configured in multiple ways.

## Overview

Default values in Dooksa state serve several purposes:

1. **Initial State**: Provide starting values for state properties
2. **ID Generation**: Configure how collection IDs are generated
3. **Property Defaults**: Set default values for object properties
4. **Dynamic Defaults**: Generate values at runtime using functions

Default values can be configured at two levels:
- **Schema Level**: Define default values in the schema definition
- **Plugin Level**: Provide initial values when creating a plugin

## Schema-Level Default Values

### Property Default Values

You can define default values for individual properties within an object schema:

```javascript
{
  type: 'object',
  properties: {
    name: { type: 'string' },
    status: { 
      type: 'string',
      default: 'active'  // Default value
    },
    createdAt: {
      type: 'number',
      default: () => Date.now()  // Function-based default
    },
    theme: {
      type: 'string',
      default: 'light'  // Static default
    }
  }
}
```

### Function-Based Defaults

Default values can be functions that are called when the value is needed:

```javascript
{
  type: 'object',
  properties: {
    id: {
      type: 'string',
      default: () => 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
    },
    timestamp: {
      type: 'number',
      default: () => Date.now()
    },
    randomValue: {
      type: 'number',
      default: () => Math.floor(Math.random() * 100)
    }
  }
}
```

### Nested Object Defaults

Default values can be complex objects:

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
            settings: {
              type: 'object',
              properties: {
                theme: { 
                  type: 'string',
                  default: 'dark'
                },
                notifications: {
                  type: 'object',
                  properties: {
                    email: { 
                      type: 'boolean',
                      default: true
                    },
                    push: { 
                      type: 'boolean',
                      default: false
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
}
```

## Collection ID Generation

Collections have special ID generation configuration that determines how IDs are created for new documents.

### Static Prefix and Suffix

You can configure static prefixes and suffixes for collection IDs:

```javascript
{
  type: 'collection',
  items: {
    type: 'object',
    properties: {
      name: { type: 'string' }
    }
  },
  id: {
    prefix: 'user_',
    suffix: '_v1'
  }
}
```

**Usage:**
```javascript
// Auto-generated ID with prefix and suffix
const result = stateSetValue({
  name: 'users',
  value: { name: 'John' }
})
// result.id = 'user_abc123_v1'
```

### Dynamic Prefix/Suffix (Function)

Prefix and suffix can be functions that generate values dynamically:

```javascript
{
  type: 'collection',
  items: {
    type: 'object',
    properties: {
      name: { type: 'string' }
    }
  },
  id: {
    prefix: () => 'user_',
    suffix: () => '_' + new Date().getFullYear()
  }
}
```

**Usage:**
```javascript
// In 2026
const result = stateSetValue({
  name: 'users',
  value: { name: 'John' }
})
// result.id = 'user_abc123_2026'
```

### Custom Default ID Generator

You can provide a custom function to generate the entire ID:

```javascript
{
  type: 'collection',
  items: {
    type: 'object',
    properties: {
      name: { type: 'string' }
    }
  },
  id: {
    default: () => 'custom-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
  }
}
```

**Usage:**
```javascript
const result = stateSetValue({
  name: 'users',
  value: { name: 'John' }
})
// result.id = 'custom-1234567890-abc123def456'
```

### Combining Prefix, Suffix, and Default

You can combine all three for maximum flexibility:

```javascript
{
  type: 'collection',
  items: {
    type: 'object',
    properties: {
      name: { type: 'string' }
    }
  },
  id: {
    prefix: 'user_',
    suffix: '_v2',
    default: () => 'custom-' + Date.now()
  }
}
```

**Behavior:**
- If you provide an ID, it's used as-is
- If you don't provide an ID and `default` exists, it's used
- If you don't provide an ID and no `default`, prefix + generated ID + suffix is used

## Plugin-Level Default Values

### Initial State Values

When creating a plugin, you can provide initial values for state properties using the `defaults` property:

```javascript
createPlugin('user', {
  state: {
    schema: {
      profiles: {
        type: 'collection',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            role: { type: 'string' }
          }
        }
      },
      settings: {
        type: 'object',
        properties: {
          theme: { type: 'string' },
          language: { type: 'string' }
        }
      }
    },
    defaults: {
      profiles: {
        'admin-1': { name: 'Admin User', role: 'admin' },
        'guest-1': { name: 'Guest User', role: 'guest' }
      },
      settings: {
        theme: 'dark',
        language: 'en'
      }
    }
  }
})
```

### Default Value Processing

When a plugin is initialized, default values are processed in the following order:

1. **Schema defaults** are applied to individual properties
2. **Plugin defaults** are set for entire collections/objects
3. **ID generation** is applied to collection items

## Default Value Initialization Flow

### 1. Schema Property Defaults

When setting data without providing a value for a property with a default:

```javascript
// Schema
{
  type: 'object',
  properties: {
    name: { type: 'string' },
    status: { 
      type: 'string',
      default: 'active'
    }
  }
}

// Setting data without 'status'
stateSetValue({
  name: 'user',
  value: { name: 'John' }
})

// Result: { name: 'John', status: 'active' }
```

### 2. Collection ID Generation

When setting data in a collection without providing an ID:

```javascript
// Schema
{
  type: 'collection',
  items: {
    type: 'object',
    properties: {
      name: { type: 'string' }
    }
  },
  id: {
    prefix: 'user_',
    suffix: '_v1'
  }
}

// Setting data without ID
const result = stateSetValue({
  name: 'users',
  value: { name: 'John' }
})

// Result: result.id = 'user_abc123_v1'
```

### 3. Plugin Default Values

When a plugin is initialized with default values:

```javascript
createPlugin('app', {
  state: {
    schema: {
      settings: {
        type: 'object',
        properties: {
          theme: { type: 'string' },
          language: { type: 'string' }
        }
      }
    },
    defaults: {
      settings: {
        theme: 'light',
        language: 'en'
      }
    }
  }
})

// After plugin initialization
const settings = stateGetValue({ name: 'app/settings' })
// settings.item = { theme: 'light', language: 'en' }
```

## Practical Examples

### Example 1: User Management with Defaults

```javascript
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
            role: { 
              type: 'string',
              default: 'user'  // Default role
            },
            status: {
              type: 'string',
              default: 'active'  // Default status
            },
            createdAt: {
              type: 'number',
              default: () => Date.now()  // Auto timestamp
            }
          },
          required: ['name', 'email']
        },
        id: {
          prefix: 'user_',
          suffix: () => '_' + new Date().getFullYear()  // Dynamic suffix
        }
      },
      settings: {
        type: 'object',
        properties: {
          theme: { 
            type: 'string',
            default: 'light'
          },
          language: {
            type: 'string',
            default: 'en'
          },
          notifications: {
            type: 'object',
            properties: {
              email: { 
                type: 'boolean',
                default: true
              },
              push: {
                type: 'boolean',
                default: false
              }
            }
          }
        }
      }
    },
    defaults: {
      // Initial admin user
      profiles: {
        'admin-1': {
          name: 'System Admin',
          email: 'admin@example.com',
          role: 'admin',
          status: 'active'
        }
      },
      // Default settings
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
```

**Usage:**
```javascript
// Create a new user (auto ID, defaults applied)
const result = stateSetValue({
  name: 'user/profiles',
  value: { name: 'John Doe', email: 'john@example.com' }
})
// result.id = 'user_abc123_2026'
// result.item = {
//   name: 'John Doe',
//   email: 'john@example.com',
//   role: 'user',        // from schema default
//   status: 'active',    // from schema default
//   createdAt: 1234567890 // from schema default (timestamp)
// }

// Get settings (plugin defaults applied)
const settings = stateGetValue({ name: 'user/settings' })
// settings.item = {
//   theme: 'dark',       // from plugin default
//   language: 'en',      // from plugin default
//   notifications: {
//     email: true,       // from schema default
//     push: false        // from schema default
//   }
// }
```

### Example 2: E-commerce Product with Defaults

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
              default: []  // Empty array by default
            },
            inventory: {
              type: 'object',
              properties: {
                stock: { 
                  type: 'number',
                  default: 0
                },
                reserved: {
                  type: 'number',
                  default: 0
                },
                lastUpdated: {
                  type: 'number',
                  default: () => Date.now()
                }
              }
            },
            status: {
              type: 'string',
              default: 'active'
            }
          },
          required: ['name', 'price', 'category']
        },
        id: {
          prefix: 'prod_',
          default: () => 'custom-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
        }
      },
      categories: {
        type: 'collection',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            parentId: {
              type: 'string',
              relation: 'product/categories'
            }
          },
          required: ['name']
        },
        id: {
          prefix: 'cat_'
        }
      }
    },
    defaults: {
      // Pre-defined categories
      categories: {
        'cat-electronics': {
          name: 'Electronics',
          description: 'Electronic devices and accessories'
        },
        'cat-books': {
          name: 'Books',
          description: 'Physical and digital books'
        }
      }
    }
  }
})
```

**Usage:**
```javascript
// Create a product (auto ID, defaults applied)
const result = stateSetValue({
  name: 'product/products',
  value: {
    name: 'Wireless Mouse',
    price: 29.99,
    category: 'Electronics'
  }
})
// result.id = 'prod_abc123' or 'custom-123456-xyz789'
// result.item = {
//   name: 'Wireless Mouse',
//   price: 29.99,
//   category: 'Electronics',
//   tags: [],                    // from schema default
//   inventory: {
//     stock: 0,                  // from schema default
//     reserved: 0,               // from schema default
//     lastUpdated: 1234567890    // from schema default (timestamp)
//   },
//   status: 'active'             // from schema default
// }

// Get pre-defined categories
const categories = stateGetValue({ name: 'product/categories' })
// categories.item will contain the pre-defined categories
```

### Example 3: Blog/Content System with Defaults

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
              items: { type: 'string' },
              default: []
            },
            categories: {
              type: 'array',
              items: { type: 'string' },
              uniqueItems: true,
              default: []
            },
            published: {
              type: 'boolean',
              default: false
            },
            publishedAt: {
              type: 'number',
              default: null  // null is a valid default
            },
            createdAt: {
              type: 'number',
              default: () => Date.now()
            },
            updatedAt: {
              type: 'number',
              default: () => Date.now()
            }
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
            },
            createdAt: {
              type: 'number',
              default: () => Date.now()
            },
            status: {
              type: 'string',
              default: 'approved'  // approved, pending, rejected
            }
          },
          required: ['postId', 'authorId', 'content']
        }
      }
    }
  }
})
```

**Usage:**
```javascript
// Create a post (auto ID, defaults applied)
const result = stateSetValue({
  name: 'content/posts',
  value: {
    title: 'Getting Started with Dooksa',
    content: 'Dooksa is a powerful state management system...',
    authorId: 'user_abc123'
  }
})
// result.id = 'post_xyz789'
// result.item = {
//   title: 'Getting Started with Dooksa',
//   content: 'Dooksa is a powerful state management system...',
//   authorId: 'user_abc123',
//   tags: [],                    // from schema default
//   categories: [],              // from schema default
//   published: false,            // from schema default
//   publishedAt: null,           // from schema default
//   createdAt: 1234567890,       // from schema default (timestamp)
//   updatedAt: 1234567890        // from schema default (timestamp)
// }

// Add a comment
const commentResult = stateSetValue({
  name: 'content/comments',
  value: {
    postId: result.id,
    authorId: 'user_def456',
    content: 'Great article!'
  }
})
// commentResult.item = {
//   postId: 'post_xyz789',
//   authorId: 'user_def456',
//   content: 'Great article!',
//   createdAt: 1234567891,       // from schema default (timestamp)
//   status: 'approved'           // from schema default
// }
```

## ID Generation Strategies

### Strategy 1: Simple Prefix

```javascript
{
  type: 'collection',
  id: {
    prefix: 'user_'
  }
}
// IDs: user_abc123, user_def456, user_ghi789
```

### Strategy 2: Prefix + Suffix

```javascript
{
  type: 'collection',
  id: {
    prefix: 'user_',
    suffix: '_v1'
  }
}
// IDs: user_abc123_v1, user_def456_v1, user_ghi789_v1
```

### Strategy 3: Timestamp-Based

```javascript
{
  type: 'collection',
  id: {
    prefix: 'order_',
    default: () => 'order_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  }
}
// IDs: order_1234567890_abc123, order_1234567891_def456
```

### Strategy 4: Sequential (Custom Function)

```javascript
{
  type: 'collection',
  id: {
    default: () => {
      // Note: This is a simplified example. In production, you'd need
      // to track the last used ID in a persistent way
      const timestamp = Date.now()
      const random = Math.random().toString(36).substr(2, 9)
      return `seq_${timestamp}_${random}`
    }
  }
}
```

### Strategy 5: UUID-Style

```javascript
{
  type: 'collection',
  id: {
    default: () => {
      // Generate UUID-like string
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0
        const v = c == 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
      })
    }
  }
}
// IDs: 123e4567-e89b-12d3-a456-426614174000, 123e4567-e89b-12d3-a456-426614174001
```

## Default Value Precedence

When setting data, default values are applied in the following order:

### 1. Provided Values (Highest Priority)

Values explicitly provided always take precedence:

```javascript
stateSetValue({
  name: 'user/profiles',
  value: { 
    name: 'John',
    role: 'admin'  // Overrides schema default 'user'
  }
})
```

### 2. Schema Property Defaults

If a property is not provided and has a schema default, it's applied:

```javascript
// Schema
{
  type: 'object',
  properties: {
    name: { type: 'string' },
    role: { type: 'string', default: 'user' }
  }
}

// Setting data
stateSetValue({
  name: 'user/profiles',
  value: { name: 'John' }  // role will be 'user' from default
})
```

### 3. Plugin Defaults

If no value is provided and no schema default exists, plugin defaults are used:

```javascript
createPlugin('app', {
  state: {
    schema: {
      settings: {
        type: 'object',
        properties: {
          theme: { type: 'string' },
          language: { type: 'string' }
        }
      }
    },
    defaults: {
      settings: {
        theme: 'light',  // Applied if no value provided
        language: 'en'
      }
    }
  }
})
```

## Dynamic Defaults

### Time-Based Defaults

```javascript
{
  type: 'object',
  properties: {
    createdAt: {
      type: 'number',
      default: () => Date.now()
    },
    expiresAt: {
      type: 'number',
      default: () => Date.now() + (24 * 60 * 60 * 1000)  // 24 hours from now
    }
  }
}
```

### Random Value Defaults

```javascript
{
  type: 'object',
  properties: {
    randomId: {
      type: 'string',
      default: () => Math.random().toString(36).substr(2, 9)
    },
    score: {
      type: 'number',
      default: () => Math.floor(Math.random() * 100)
    }
  }
}
```

### Environment-Based Defaults

```javascript
{
  type: 'object',
  properties: {
    apiEndpoint: {
      type: 'string',
      default: () => process.env.NODE_ENV === 'production' 
        ? 'https://api.example.com' 
        : 'http://localhost:3000'
    }
  }
}
```

### Sequential Defaults

```javascript
{
  type: 'object',
  properties: {
    counter: {
      type: 'number',
      default: () => {
        // Note: This is a simplified example. In production, you'd need
        // to track the counter in a persistent way
        return Date.now() % 1000000
      }
    }
  }
}
```

## Best Practices

### 1. Use Schema Defaults for Property-Level Defaults

```javascript
// Good - schema default
{
  type: 'object',
  properties: {
    status: { 
      type: 'string',
      default: 'active'
    }
  }
}

// Avoid - plugin default for single property
createPlugin('user', {
  state: {
    schema: {
      profiles: {
        type: 'collection',
        items: {
          type: 'object',
          properties: {
            status: { type: 'string' }  // No default
          }
        }
      }
    },
    defaults: {
      profiles: {
        'default-user': { status: 'active' }  // Too specific
      }
    }
  }
})
```

### 2. Use Plugin Defaults for Initial Data

```javascript
// Good - plugin defaults for initial data
createPlugin('app', {
  state: {
    schema: {
      settings: {
        type: 'object',
        properties: {
          theme: { type: 'string' },
          language: { type: 'string' }
        }
      }
    },
    defaults: {
      settings: {
        theme: 'light',
        language: 'en'
      }
    }
  }
})
```

### 3. Use Functions for Dynamic Defaults

```javascript
// Good - function for dynamic values
{
  type: 'object',
  properties: {
    createdAt: {
      type: 'number',
      default: () => Date.now()
    }
  }
}

// Avoid - static value for dynamic data
{
  type: 'object',
  properties: {
    createdAt: {
      type: 'number',
      default: 1234567890  // Static timestamp
    }
  }
}
```

### 4. Keep ID Generation Simple

```javascript
// Good - simple prefix
{
  type: 'collection',
  id: {
    prefix: 'user_'
  }
}

// Avoid - overly complex ID generation
{
  type: 'collection',
  id: {
    default: () => {
      const timestamp = Date.now()
      const random = Math.random().toString(36).substr(2, 9)
      const hash = require('crypto').createHash('md5').update(random).digest('hex')
      return `user_${timestamp}_${hash.substr(0, 8)}`
    }
  }
}
```

### 5. Document Default Values

```javascript
createPlugin('user', {
  state: {
    schema: {
      profiles: {
        type: 'collection',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            role: { 
              type: 'string',
              default: 'user',  // Default role for new users
              description: 'User role: user, admin, or guest'
            },
            status: {
              type: 'string',
              default: 'active',  // Default status
              description: 'User status: active, inactive, or suspended'
            }
          }
        }
      }
    }
  }
})
```

## Common Pitfalls

### Pitfall 1: Forgetting to Capture Auto-Generated IDs

```javascript
// ❌ Wrong - ID is lost
stateSetValue({
  name: 'user/profiles',
  value: { name: 'John' }
})
// How do I update this user later? I don't have the ID!

// ✅ Correct - Capture the ID
const result = stateSetValue({
  name: 'user/profiles',
  value: { name: 'John' }
})
const userId = result.id
// Now I can use userId for future updates
```

### Pitfall 2: Mixing Schema and Plugin Defaults Incorrectly

```javascript
// ❌ Wrong - Conflicting defaults
createPlugin('user', {
  state: {
    schema: {
      profiles: {
        type: 'collection',
        items: {
          type: 'object',
          properties: {
            role: { 
              type: 'string',
              default: 'user'  // Schema default
            }
          }
        }
      }
    },
    defaults: {
      profiles: {
        'default-user': { role: 'admin' }  // Plugin default (different!)
      }
    }
  }
})

// ✅ Correct - Consistent defaults
createPlugin('user', {
  state: {
    schema: {
      profiles: {
        type: 'collection',
        items: {
          type: 'object',
          properties: {
            role: { 
              type: 'string',
              default: 'user'  // Schema default
            }
          }
        }
      }
    },
    defaults: {
      profiles: {
        'default-user': { role: 'user' }  // Same as schema default
      }
    }
  }
})
```

### Pitfall 3: Overusing Dynamic Defaults

```javascript
// ❌ Wrong - Too many dynamic defaults
{
  type: 'object',
  properties: {
    id: { default: () => generateId() },
    timestamp: { default: () => Date.now() },
    random: { default: () => Math.random() },
    session: { default: () => Math.random().toString(36).substr(2, 9) }
  }
}

// ✅ Correct - Only use dynamic defaults when needed
{
  type: 'object',
  properties: {
    id: { default: () => generateId() },  // Needed for uniqueness
    timestamp: { default: () => Date.now() },  // Needed for tracking
    // Other properties can have static defaults or no defaults
  }
}
```

## Testing Default Values

### Test Schema Defaults

```javascript
import { test } from 'node:test'
import { strictEqual } from 'node:assert'

test('schema defaults are applied', async (t) => {
  const plugin = createPlugin('test', {
    state: {
      schema: {
        user: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            role: { 
              type: 'string',
              default: 'user'
            }
          }
        }
      }
    }
  })

  // Set value without 'role'
  const result = plugin.stateSetValue({
    name: 'test/user',
    value: { name: 'John' }
  })

  // Verify default was applied
  strictEqual(result.item.role, 'user')
})
```

### Test ID Generation

```javascript
test('collection ID generation', async (t) => {
  const plugin = createPlugin('test', {
    state: {
      schema: {
        users: {
          type: 'collection',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' }
            }
          },
          id: {
            prefix: 'user_',
            suffix: '_v1'
          }
        }
      }
    }
  })

  // Set value without ID
  const result = plugin.stateSetValue({
    name: 'test/users',
    value: { name: 'John' }
  })

  // Verify ID has prefix and suffix
  strictEqual(result.id.startsWith('user_'), true)
  strictEqual(result.id.endsWith('_v1'), true)
})
```

### Test Plugin Defaults

```javascript
test('plugin defaults are applied', async (t) => {
  const plugin = createPlugin('test', {
    state: {
      schema: {
        settings: {
          type: 'object',
          properties: {
            theme: { type: 'string' },
            language: { type: 'string' }
          }
        }
      },
      defaults: {
        settings: {
          theme: 'dark',
          language: 'en'
        }
      }
    }
  })

  // Get settings (plugin defaults should be applied)
  const result = plugin.stateGetValue({ name: 'test/settings' })

  // Verify defaults were applied
  strictEqual(result.item.theme, 'dark')
  strictEqual(result.item.language, 'en')
})
```

## Next Steps

- Read [State Schema Guide](state-schema-guide.md) to learn about schema definitions
- Read [State Data Types Guide](state-data-types-guide.md) for detailed type information
- Read [State Relationships Guide](state-relationships-guide.md) for relationship management
- Read [State Validation Guide](state-validation-guide.md) for advanced validation rules