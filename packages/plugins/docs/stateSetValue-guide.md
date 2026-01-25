# StateSetValue Guide

This guide explains how to use the `stateSetValue` function to add and update data in the Dooksa state management system.

## Overview

`stateSetValue` is the primary function for setting data in the state. It:

- Validates data against schemas
- Triggers update events
- Manages relationships
- Returns metadata and previous values

## Basic Syntax

```javascript
stateSetValue({
  name: 'collection/path',
  value: data,
  options: { ... }
})
```

**Parameters:**
- `name` (string): Collection or schema path (e.g., 'user/profiles')
- `value` (any): Data to be set
- `options` (object, optional): Configuration options

**Returns:** `DataValue` object

## Data Types and Usage

### 1. Collection Type

Collections store multiple documents with unique IDs.

#### Schema Example:
```javascript
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

#### Usage Examples:

**Single Item with Custom ID:**
```javascript
stateSetValue({
  name: 'user/profiles',
  value: { name: 'John', age: 30 },
  options: { id: 'user-123' }
})
```

**Single Item with Auto-Generated ID:**
```javascript
const result = stateSetValue({
  name: 'user/profiles',
  value: { name: 'Jane', age: 25 }
  // ID will be auto-generated (e.g., 'abc123')
})

console.log(result.id) // Returns the auto-generated ID
```

**Multiple Items at Once (using merge):**
```javascript
stateSetValue({
  name: 'user/profiles',
  value: {
    'user-1': { name: 'John', age: 30 },
    'user-2': { name: 'Jane', age: 25 },
    'user-3': { name: 'Bob', age: 35 }
  },
  options: { merge: true }
})
```

### 2. Object Type (Non-Collection)

Single object without an ID.

#### Schema Example:
```javascript
{
  type: 'object',
  properties: {
    name: { type: 'string' },
    value: { type: 'number' }
  }
}
```

#### Usage Example:
```javascript
stateSetValue({
  name: 'app/settings',
  value: { name: 'My Settings', value: 123 }
})
```

**Important:** Do NOT use `options.id` for non-collections!

### 3. Array Type

Single array without an ID.

#### Schema Example:
```javascript
{
  type: 'array',
  items: {
    type: 'string'
  }
}
```

#### Usage Example:
```javascript
stateSetValue({
  name: 'app/tags',
  value: ['javascript', 'nodejs', 'dooksa']
})
```

**Important:** Do NOT use `options.id` for arrays!

### 4. Complex Nested Objects

Objects with nested structures.

#### Schema Example:
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
                notifications: { type: 'boolean' }
              }
            }
          }
        }
      }
    }
  }
}
```

#### Usage Example:
```javascript
stateSetValue({
  name: 'app/userProfiles',
  value: {
    user: {
      profile: {
        name: 'John',
        age: 30,
        settings: {
          theme: 'dark',
          notifications: true
        }
      }
    }
  }
})
```

## Available Options

### `id` (string)
- **Only for collections**
- Specifies the document ID
- If not provided, an ID will be auto-generated
- Example: `options: { id: 'user-123' }`

### `merge` (boolean)
- **For collections**
- Allows bulk inserts by passing an object keyed by IDs
- Each key becomes a document ID
- Example: `options: { merge: true }`

### `replace` (boolean)
- **For collections**
- Completely replaces existing data with new data
- Example: `options: { replace: true }`

### `metadata` (object)
- Associates metadata with the data
- Example: `options: { metadata: { userId: 'admin' } }`

### `stopPropagation` (boolean)
- Prevents update event propagation to listeners
- Example: `options: { stopPropagation: true }`

### `update` (object)
- For nested array/object updates
- Properties:
  - `position` (array): Path to nested data
  - `method` (string): Array operation method ('push', 'pull', 'pop', 'shift', 'unshift', 'splice')
  - `startIndex` (number): Start index for splice operations
  - `deleteCount` (number): Number of elements to delete for splice

## Common Patterns

### Pattern 1: Adding a Single Item to a Collection

```javascript
// With custom ID
stateSetValue({
  name: 'product/inventory',
  value: { name: 'Laptop', price: 999 },
  options: { id: 'prod-001' }
})

// With auto-generated ID
const result = stateSetValue({
  name: 'product/inventory',
  value: { name: 'Mouse', price: 25 }
})
// result.id contains the auto-generated ID
```

### Pattern 2: Bulk Insert to a Collection

```javascript
stateSetValue({
  name: 'product/inventory',
  value: {
    'prod-001': { name: 'Laptop', price: 999 },
    'prod-002': { name: 'Mouse', price: 25 },
    'prod-003': { name: 'Keyboard', price: 75 }
  },
  options: { merge: true }
})
```

### Pattern 3: Updating a Single Item

```javascript
// Replace entire item
stateSetValue({
  name: 'product/inventory',
  value: { name: 'Laptop Pro', price: 1299 },
  options: { id: 'prod-001' }
})

// Update specific properties using merge
stateSetValue({
  name: 'product/inventory',
  value: { price: 1199 },
  options: { id: 'prod-001', merge: true }
})
```

### Pattern 4: Updating Nested Properties

```javascript
// Update a specific property in a nested object
stateSetValue({
  name: 'app/userProfiles',
  value: 'dark',
  options: {
    update: {
      position: ['user', 'profile', 'settings', 'theme']
    }
  }
})
```

### Pattern 5: Array Operations

```javascript
// Push to array
stateSetValue({
  name: 'app/tags',
  value: 'react',
  options: {
    update: {
      method: 'push'
    }
  }
})

// Remove from array
stateSetValue({
  name: 'app/tags',
  value: 'vue',
  options: {
    update: {
      method: 'pull'
    }
  }
})

// Splice array
stateSetValue({
  name: 'app/tags',
  value: ['angular', 'svelte'],
  options: {
    update: {
      method: 'splice',
      startIndex: 1,
      deleteCount: 1
    }
  }
})
```

## Return Value

`stateSetValue` returns a `DataValue` object with the following properties:

### `collection` (string)
The name of the collection/data path that was set.

**Example:**
```javascript
const result = stateSetValue({
  name: 'user/profiles',
  value: { name: 'John' }
})
console.log(result.collection) // 'user/profiles'
```

### `id` (string)
The document ID. This is particularly important for:
- **Collections with auto-generated IDs**: Contains the generated ID
- **Collections with custom IDs**: Contains the provided ID
- **Non-collections**: Not present (undefined)

**Example - Auto-generated ID:**
```javascript
const result = stateSetValue({
  name: 'user/profiles',
  value: { name: 'Jane', age: 25 }
})
console.log(result.id) // 'abc123' (auto-generated)
```

**Example - Custom ID:**
```javascript
const result = stateSetValue({
  name: 'user/profiles',
  value: { name: 'John', age: 30 },
  options: { id: 'user-123' }
})
console.log(result.id) // 'user-123'
```

### `item` (any)
The actual data value that was set. This is the value after any processing or merging.

**Example:**
```javascript
const result = stateSetValue({
  name: 'user/profiles',
  value: { name: 'John', age: 30 }
})
console.log(result.item) // { name: 'John', age: 30 }
```

### `metadata` (object)
Metadata associated with the data, including:
- `createdAt`: Timestamp when the data was created (server-side only)
- `updatedAt`: Timestamp when the data was last updated (server-side only)
- `userId`: User ID who created/modified the data (if provided)
- Any custom metadata passed in options

**Example:**
```javascript
const result = stateSetValue({
  name: 'user/profiles',
  value: { name: 'John' },
  options: {
    metadata: { userId: 'user-123', customField: 'value' }
  }
})
console.log(result.metadata)
// {
//   userId: 'user-123',
//   customField: 'value',
//   createdAt: 1234567890000,  // (server-side only)
//   updatedAt: 1234567890000   // (server-side only)
// }
```

### `previous` (any)
The previous value before the update. This is only present when updating existing data.

**Example:**
```javascript
// First set
stateSetValue({
  name: 'user/profiles',
  value: { name: 'John', age: 30 },
  options: { id: 'user-123' }
})

// Update
const result = stateSetValue({
  name: 'user/profiles',
  value: { name: 'John', age: 31 },
  options: { id: 'user-123' }
})

console.log(result.previous) // { name: 'John', age: 30 }
```

### `expand` (DataValue[])
Array of expanded related data when using the `expand` option in `getValue`. This is not directly returned by `setValue` but is used when retrieving data with relationships.

## Practical Examples

### Example 1: Retrieving Auto-Generated IDs

When you set a collection item without providing an ID, the system generates one automatically:

```javascript
// Set a user without providing an ID
const result = stateSetValue({
  name: 'user/profiles',
  value: { name: 'Alice', email: 'alice@example.com' }
})

// The auto-generated ID is returned in the result
console.log('Generated ID:', result.id)
// Output: Generated ID: abc123def456

// You can now use this ID to retrieve or update the data
const user = stateGetValue({
  name: 'user/profiles',
  id: result.id
})
console.log(user.item) // { name: 'Alice', email: 'alice@example.com' }
```

### Example 2: Using Metadata for Tracking

Metadata is automatically added and can be used for auditing and tracking:

```javascript
// Set data with custom metadata
const result = stateSetValue({
  name: 'product/inventory',
  value: { name: 'Laptop', price: 999 },
  options: {
    metadata: {
      userId: 'admin-123',
      source: 'web-form'
    }
  }
})

console.log(result.metadata)
// {
//   userId: 'admin-123',
//   source: 'web-form',
//   createdAt: 1234567890000,  // Auto-added on server
//   updatedAt: 1234567890000   // Auto-added on server
// }

// Later, when updating
const updateResult = stateSetValue({
  name: 'product/inventory',
  value: { price: 899 },
  options: {
    id: result.id,
    metadata: {
      userId: 'admin-456',
      reason: 'sale'
    }
  }
})

console.log(updateResult.metadata)
// {
//   userId: 'admin-456',
//   reason: 'sale',
//   createdAt: 1234567890000,  // Preserved from original
//   updatedAt: 1234567900000   // Updated timestamp
// }
```

### Example 3: Tracking Changes with Previous Value

Use the `previous` property to track what changed:

```javascript
// Initial set
stateSetValue({
  name: 'user/profiles',
  value: { name: 'John', age: 30, status: 'active' },
  options: { id: 'user-123' }
})

// Update with tracking
const result = stateSetValue({
  name: 'user/profiles',
  value: { name: 'John', age: 31, status: 'active' },
  options: { id: 'user-123' }
})

if (result.previous) {
  console.log('Age changed from', result.previous.age, 'to', result.item.age)
  // Output: Age changed from 30 to 31
}
```

### Example 4: Collection with Relationships

```javascript
// Add main collection item
const userResult = stateSetValue({
  name: 'user/profiles',
  value: { name: 'John', age: 30, profileId: 'profile-123' },
  options: { id: 'user-123' }
})

// Add related collection item
const profileResult = stateSetValue({
  name: 'profiles/details',
  value: { bio: 'Software Developer', userId: 'user-123' },
  options: { id: 'profile-123' }
})

console.log('User ID:', userResult.id)        // 'user-123'
console.log('Profile ID:', profileResult.id)  // 'profile-123'
console.log('User Metadata:', userResult.metadata)
```

### Example 5: Complex Workflow with ID Tracking

```javascript
// Step 1: Create a new product with auto-generated ID
const productResult = stateSetValue({
  name: 'product/inventory',
  value: {
    name: 'Wireless Mouse',
    price: 29.99,
    category: 'electronics'
  }
})

const productId = productResult.id
console.log('New product ID:', productId)

// Step 2: Add to user's cart using the generated ID
stateSetValue({
  name: 'user/carts',
  value: {
    productId: productId,
    quantity: 1,
    addedAt: Date.now()
  },
  options: {
    metadata: {
      userId: 'user-456',
      session: 'session-789'
    }
  }
})

// Step 3: Retrieve the cart item
const cartItem = stateGetValue({
  name: 'user/carts',
  id: productId
})

console.log('Cart item:', cartItem.item)
console.log('Added by:', cartItem.metadata.userId)
```

## Important Rules

1. **Collections require `options.id` for single items** - If you don't provide an ID, one will be auto-generated
2. **Use `merge: true` for bulk inserts** - Pass an object keyed by IDs
3. **Non-collections (objects/arrays) don't use `id`** - They store a single value without an ID
4. **The validation system allows additional properties** - You can pass objects with extra properties beyond the schema
5. **Each call sets ONE document** - For collections without merge, each call sets a single document
6. **Always use namespaced names** - Format: `pluginName/propertyName` (e.g., 'user/profiles', 'product/inventory')

## Common Mistakes to Avoid

### ❌ Wrong: Using non-namespaced names
```javascript
// WRONG - Missing plugin namespace
stateSetValue({
  name: 'colour',  // Should be 'test/colour'
  value: 'red'
})
```

### ✅ Correct: Use namespaced names
```javascript
// CORRECT - Properly namespaced
stateSetValue({
  name: 'test/colour',
  value: 'red'
})
```

### ❌ Wrong: Using ID for non-collections
```javascript
// WRONG - 'settings' is an object type, not a collection
stateSetValue({
  name: 'app/settings',
  value: { theme: 'dark' },
  options: { id: 'settings-1' }  // This will cause an error!
})
```

### ❌ Wrong: Passing key-value object without merge
```javascript
// WRONG - This will create a single document with key 'user-1'
stateSetValue({
  name: 'user/profiles',
  value: { 'user-1': { name: 'John', age: 30 } }
})
```

### ✅ Correct: Use merge for bulk inserts
```javascript
// CORRECT - This will create multiple documents
stateSetValue({
  name: 'user/profiles',
  value: {
    'user-1': { name: 'John', age: 30 },
    'user-2': { name: 'Jane', age: 25 }
  },
  options: { merge: true }
})
```

### ❌ Wrong: Forgetting to capture auto-generated ID
```javascript
// WRONG - ID is lost
stateSetValue({
  name: 'user/profiles',
  value: { name: 'Alice' }
})
// How do I update this user later? I don't have the ID!
```

### ✅ Correct: Capture the return value
```javascript
// CORRECT - Store the result to access the ID
const result = stateSetValue({
  name: 'user/profiles',
  value: { name: 'Alice' }
})

// Now I can use result.id for future updates
stateSetValue({
  name: 'user/profiles',
  value: { age: 25 },
  options: { id: result.id }
})
```

## Summary

- **Collections**: Use `options.id` for single items, `merge: true` for bulk inserts
- **Objects/Arrays**: Pass data directly, no ID needed
- **Update nested data**: Use `options.update` with position and method
- **Metadata**: Use `options.metadata` to attach additional information
- **Events**: Use `options.stopPropagation` to prevent event propagation
- **Namespaced naming**: Always use `pluginName/propertyName` format
- **Return value**: Capture and use the `DataValue` object to access `id`, `metadata`, and `previous`
- **Auto-generated IDs**: Available in `result.id` when no ID is provided
- **Metadata tracking**: Use `result.metadata` for timestamps and user information

For more examples, see the test file: `packages/plugins/test/core/state.spec.js`