# State API Reference

This is a comprehensive API reference for the Dooksa state management system. It documents all available functions, their parameters, return values, and usage examples.

## Table of Contents

1. [Core Functions](#core-functions)
2. [Data Operations](#data-operations)
3. [Query Operations](#query-operations)
4. [Event Operations](#event-operations)
5. [Schema Operations](#schema-operations)
6. [Utility Functions](#utility-functions)
7. [Type Definitions](#type-definitions)

## Core Functions

### stateSetValue

Sets a value in the state with optional configuration.

**Signature:**
```javascript
stateSetValue({ name, value, options })
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | `string` | Yes | The collection/path name (e.g., 'user/profiles') |
| `value` | `any` | Yes | The value to set |
| `options` | `object` | No | Configuration options |

**Options:**

| Option | Type | Description |
|--------|------|-------------|
| `id` | `string` | ID for collection items |
| `merge` | `boolean` | Merge with existing data (default: false) |
| `replace` | `boolean` | Replace entire collection (default: false) |
| `stopPropagation` | `boolean` | Stop event propagation (default: false) |
| `update` | `object` | Update configuration for arrays |
| `metadata` | `object` | Additional metadata |

**Update Configuration:**

| Option | Type | Description |
|--------|------|-------------|
| `position` | `string[]` | Path to nested property |
| `method` | `string` | Array operation: 'push', 'pull', 'pop', 'shift', 'unshift', 'splice' |
| `startIndex` | `number` | Start index for splice |
| `deleteCount` | `number` | Number of items to delete for splice |

**Returns:** `DataValue`

**Examples:**

```javascript
// Set collection item
const result = stateSetValue({
  name: 'user/profiles',
  value: { name: 'John', email: 'john@example.com' },
  options: { id: 'user-123' }
})
// result.id = 'user-123'
// result.item = { name: 'John', email: 'john@example.com' }

// Set with merge
stateSetValue({
  name: 'user/profiles',
  value: { name: 'John Updated' },
  options: { id: 'user-123', merge: true }
})

// Set array with push
stateSetValue({
  name: 'app/tags',
  value: ['javascript'],
  options: { update: { method: 'push' } }
})

// Set nested property
stateSetValue({
  name: 'user/profiles',
  value: 'dark',
  options: {
    id: 'user-123',
    update: { position: ['settings', 'theme'] }
  }
})
```

**Throws:** `DataSchemaException` if validation fails

---

### stateGetValue

Retrieves a value from the state with optional configuration. This is the primary method for reading data from the Dooksa state management system.

**Signature:**
```javascript
stateGetValue({ name, id, prefixId, suffixId, options })
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | `string` | Yes | The collection/path name (e.g., `'user/profiles'`) |
| `id` | `string` | No | Specific ID to retrieve. If omitted, returns all items in the collection |
| `prefixId` | `string` | No | Custom prefix for ID lookup. Overrides schema-level prefix |
| `suffixId` | `string` | No | Custom suffix for ID lookup. Overrides schema-level suffix |
| `options` | `object` | No | Configuration options for data retrieval |

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `expand` | `boolean` | `false` | Fetch related data defined in schema relationships |
| `expandClone` | `boolean` | `false` | Create deep clones of all expanded data (significant performance overhead) |
| `clone` | `boolean` | `false` | Create deep clone of the main result |
| `position` | `string \| string[]` | - | Extract specific nested value using dot notation or array path |

**Returns:** `DataValue`

The return value is a `DataValue` object with the following structure:

```javascript
{
  collection: 'plugin/collection',  // Collection name
  id: 'item-123',                   // Item ID (if specific item)
  item: { /* actual data */ },      // The retrieved data
  metadata: {                       // Metadata
    userId: 'user-456',
    createdAt: 1234567890,
    updatedAt: 1234567890
  },
  previous: { /* prev data */ },    // Previous value (if updated)
  expand: [ /* expanded items */ ], // Related data (when expand=true)
  isEmpty: false,                   // No data found
  isExpandEmpty: false,            // No expanded data found
  isAffixEmpty: false              // Affix lookup failed
}
```

**Behavior:**

- **With `id`**: Returns a single `DataValue` object for that specific item
- **Without `id`**: Returns all items in the collection as an array of `DataValue` objects
- **With `position`**: Returns the nested value directly (not wrapped in DataValue)
- **With `expand`**: Populates the `expand` array with related `DataValue` objects
- **Empty states**: Returns a `DataValue` with `isEmpty: true` if data doesn't exist

**Performance Considerations:**

- Use `position` to retrieve specific values instead of entire objects
- Avoid `expandClone` unless you need to modify expanded data
- Consider using `stateFind` for filtering large collections
- Cloning doubles memory usage - use only when necessary

**Examples:**

```javascript
// Get all items in collection
const allUsers = stateGetValue({ name: 'user/profiles' })
// allUsers.item = [{ id: 'user-1', ... }, { id: 'user-2', ... }]

// Get specific item
const user = stateGetValue({
  name: 'user/profiles',
  id: 'user-123'
})
// user.item = { name: 'John', email: 'john@example.com' }

// Get with custom affixes
const user = stateGetValue({
  name: 'user/profiles',
  id: '123',
  prefixId: 'user_',
  suffixId: '_v1'
})

// Get with expansion
const post = stateGetValue({
  name: 'content/posts',
  id: 'post-123',
  options: { expand: true }
})
// post.expand contains related data

// Get nested value
const theme = stateGetValue({
  name: 'user/profiles',
  id: 'user-123',
  options: { position: 'settings.theme' }
})

// Get with cloning
const user = stateGetValue({
  name: 'user/profiles',
  id: 'user-123',
  options: { clone: true }
})

// Get with expansion and cloning
const post = stateGetValue({
  name: 'content/posts',
  id: 'post-123',
  options: { 
    expand: true,
    expandClone: true,
    clone: true
  }
})
```

**Error Handling:**

```javascript
const result = stateGetValue({
  name: 'user/profiles',
  id: 'non-existent'
})

if (result.isEmpty) {
  console.log('Item not found')
}

// Check specific empty states
if (result.isAffixEmpty) {
  console.log('Affix lookup failed')
}

if (result.isExpandEmpty) {
  console.log('No related data found')
}
```

**Throws:** `DataValueException` if collection not found

**Related Documentation:**
- [StateGetValue Guide](stateGetValue-guide.md) - Comprehensive guide with examples
- [StateGetValue Quick Reference](stateGetValue-quick-reference.md) - One-page cheat sheet
- [State Relationships Guide](state-relationships-guide.md) - Understanding relationships

---

### stateDeleteValue

Deletes a value from the state.

**Signature:**
```javascript
stateDeleteValue({ name, id, cascade, listeners, stopPropagation })
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | `string` | Yes | The collection/path name |
| `id` | `string` | Yes | ID of item to delete |
| `cascade` | `boolean` | No | Delete related data (default: false) |
| `listeners` | `boolean` | No | Trigger delete listeners (default: true) |
| `stopPropagation` | `boolean` | No | Stop event propagation (default: false) |

**Returns:** `DataDeleteValueResult`

**Examples:**

```javascript
// Delete single item
const result = stateDeleteValue({
  name: 'user/profiles',
  id: 'user-123'
})
// result.deleted = true
// result.inUse = false

// Delete with cascade
const result = stateDeleteValue({
  name: 'user/profiles',
  id: 'user-123',
  cascade: true
})
// Deletes user and all related data

// Check if data is in use
const result = stateDeleteValue({
  name: 'user/profiles',
  id: 'user-123'
})

if (result.inUse) {
  console.log('Cannot delete: data is referenced by other data')
}
```

**Throws:** `DataSchemaException` if collection not found

---

### stateFind

Finds items in a collection based on conditions.

**Signature:**
```javascript
stateFind({ name, where, options })
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | `string` | Yes | The collection name |
| `where` | `DataWhere[]` | No | Filter conditions |
| `options` | `object` | No | Configuration options |

**Where Conditions:**

| Property | Type | Description |
|----------|------|-------------|
| `name` | `string` | Property name to filter |
| `op` | `string` | Operator: '==', '!=', '>', '>=', '<', '<=', 'includes', 'in' |
| `value` | `any` | Value to compare |
| `and` | `DataWhere[]` | AND conditions |
| `or` | `DataWhere[]` | OR conditions |

**Returns:** `DataValue[]`

**Examples:**

```javascript
// Find by exact match
const activeUsers = stateFind({
  name: 'user/profiles',
  where: [
    { name: 'status', op: '==', value: 'active' }
  ]
})

// Find with multiple conditions
const recentAdmins = stateFind({
  name: 'user/profiles',
  where: [
    { name: 'role', op: '==', value: 'admin' },
    { name: 'createdAt', op: '>', value: Date.now() - 7 * 24 * 60 * 60 * 1000 }
  ]
})

// Find with OR condition
const adminsOrModerators = stateFind({
  name: 'user/profiles',
  where: [
    { or: [
      { name: 'role', op: '==', value: 'admin' },
      { name: 'role', op: '==', value: 'moderator' }
    ]}
  ]
})

// Find with complex conditions
const results = stateFind({
  name: 'content/posts',
  where: [
    { name: 'authorId', op: '==', value: 'user-123' },
    { name: 'published', op: '==', value: true },
    { or: [
      { name: 'tagIds', op: 'includes', value: 'tag-1' },
      { name: 'tagIds', op: 'includes', value: 'tag-2' }
    ]}
  ]
})
```

**Throws:** `DataValueException` if collection not found

---

### stateAddListener

Adds a listener to a data event.

**Signature:**
```javascript
stateAddListener({ name, id, on, handler, handlerId, priority, force, captureAll })
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | `string` | Yes | The collection/path name |
| `id` | `string` | No | Specific ID to listen to |
| `on` | `'update' \| 'delete'` | Yes | Event type |
| `handler` | `Function \| string` | Yes | Handler function or action ID |
| `handlerId` | `string` | No | Custom handler ID |
| `priority` | `boolean` | No | High priority listener (default: false) |
| `force` | `boolean` | No | Execute even if propagation stopped (default: false) |
| `captureAll` | `boolean` | No | Listen to all IDs (default: false) |

**Returns:** `string` - Handler ID

**Examples:**

```javascript
// Basic listener
const handlerId = stateAddListener({
  name: 'user/profiles',
  on: 'update',
  handler: (value) => {
    console.log('User updated:', value.item)
  }
})

// Listener for specific ID
stateAddListener({
  name: 'user/profiles',
  id: 'user-123',
  on: 'update',
  handler: (value) => {
    console.log('Specific user updated')
  }
})

// Priority listener
stateAddListener({
  name: 'user/profiles',
  on: 'update',
  priority: true,
  handler: (value) => {
    // Executes before normal listeners
  }
})

// Force listener
stateAddListener({
  name: 'user/profiles',
  on: 'update',
  force: true,
  handler: (value) => {
    // Always executes
  }
})

// Capture-all listener
stateAddListener({
  name: 'user/profiles',
  on: 'update',
  captureAll: true,
  handler: (value) => {
    console.log('Any user updated:', value.id)
  }
})

// Action-based handler
stateAddListener({
  name: 'user/profiles',
  on: 'update',
  handler: 'my-action-id',
  handlerId: 'listener-123'
})
```

---

### stateDeleteListener

Removes a listener.

**Signature:**
```javascript
stateDeleteListener({ name, id, on, handlerId })
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | `string` | Yes | The collection/path name |
| `id` | `string` | No | Specific ID |
| `on` | `'update' \| 'delete'` | Yes | Event type |
| `handlerId` | `string` | Yes | Handler ID to remove |

**Examples:**

```javascript
// Remove listener
stateDeleteListener({
  name: 'user/profiles',
  on: 'update',
  handlerId: 'listener-123'
})

// Remove listener for specific ID
stateDeleteListener({
  name: 'user/profiles',
  id: 'user-123',
  on: 'update',
  handlerId: 'listener-123'
})
```

---

### stateGetSchema

Retrieves a schema entry by path.

**Signature:**
```javascript
stateGetSchema(path)
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `path` | `string` | Yes | The schema path |

**Returns:** `SchemaEntry | undefined`

**Examples:**

```javascript
// Get schema for user profiles
const schema = stateGetSchema('user/profiles')
// Returns the schema definition

// Get schema for nested property
const schema = stateGetSchema('user/profiles/items')
// Returns the items schema
```

---

## Data Operations

### unsafeSetValue

Sets data without validation (use with caution).

**Signature:**
```javascript
unsafeSetValue({ name, value, options })
```

**Parameters:**

Same as `stateSetValue`, but without validation.

**Examples:**

```javascript
// Set without validation
unsafeSetValue({
  name: 'user/profiles',
  value: { name: 'John', email: 'john@example.com' },
  options: { id: 'user-123' }
})
```

**Warning:** Only use when you're certain the data is valid.

---

## Query Operations

### stateGenerateId

Generates a unique ID (utility function).

**Signature:**
```javascript
stateGenerateId()
```

**Returns:** `string`

**Examples:**

```javascript
const id = stateGenerateId()
// Returns something like 'abc123def456'
```

---

## Event Operations

### stateDispatchEvent

Dispatches an event manually (internal use).

**Signature:**
```javascript
stateDispatchEvent(name, on, item, stopPropagation)
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | `string` | Yes | Collection name |
| `on` | `'update' \| 'delete'` | Yes | Event type |
| `item` | `DataValue` | Yes | Data value |
| `stopPropagation` | `boolean` | No | Stop propagation |

**Examples:**

```javascript
// Manually dispatch event
const dataValue = stateGetValue({ name: 'user/profiles', id: 'user-123' })
stateDispatchEvent('user/profiles', 'update', dataValue)
```

---

## Schema Operations

### stateSetSchema

Sets a schema entry (internal use).

**Signature:**
```javascript
stateSetSchema(path, schema)
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `path` | `string` | Yes | Schema path |
| `schema` | `SchemaEntry` | Yes | Schema definition |

**Examples:**

```javascript
// Set schema
stateSetSchema('user/profiles', {
  type: 'collection',
  items: {
    type: 'object',
    properties: {
      name: { type: 'string' }
    }
  }
})
```

---

## Utility Functions

### arrayHasDuplicates

Checks if an array contains duplicates.

**Signature:**
```javascript
arrayHasDuplicates(array)
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `array` | `Array` | Yes | Array to check |

**Returns:** `boolean`

**Examples:**

```javascript
arrayHasDuplicates([1, 2, 3, 2])  // true
arrayHasDuplicates([1, 2, 3, 4])  // false
```

---

### newDataInstance

Creates a new data instance of specified type.

**Signature:**
```javascript
newDataInstance(type)
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` | `string` | Yes | Type name |

**Returns:** `Array \| Boolean \| Function \| number \| Object \| string`

**Examples:**

```javascript
newDataInstance('array')   // []
newDataInstance('object')  // {}
newDataInstance('string')  // ''
newDataInstance('number')  // 0
newDataInstance('boolean') // false
```

---

## Type Definitions

### DataValue

Represents a data value with metadata.

**Properties:**

| Property | Type | Description |
|----------|------|-------------|
| `collection` | `string` | Collection name |
| `id` | `string \| null` | Item ID |
| `item` | `any` | The actual data |
| `metadata` | `DataMetadata` | Metadata object |
| `previous` | `any` | Previous value |
| `expand` | `DataValue[]` | Expanded related data |
| `isEmpty` | `boolean` | Whether data is empty |
| `isExpandEmpty` | `boolean` | Whether expanded data is empty |
| `isAffixEmpty` | `boolean` | Whether affix lookup failed |

---

### DataMetadata

Metadata associated with data values.

**Properties:**

| Property | Type | Description |
|----------|------|-------------|
| `userId` | `string` | User who created/modified |
| `createdAt` | `number` | Creation timestamp |
| `updatedAt` | `number` | Update timestamp |

---

### DataWhere

Condition for filtering data.

**Properties:**

| Property | Type | Description |
|----------|------|-------------|
| `name` | `string` | Property name |
| `op` | `string` | Operator |
| `value` | `any` | Comparison value |
| `and` | `DataWhere[]` | AND conditions |
| `or` | `DataWhere[]` | OR conditions |

---

### DataDeleteValueResult

Result of delete operation.

**Properties:**

| Property | Type | Description |
|----------|------|-------------|
| `deleted` | `boolean` | Whether deletion succeeded |
| `inUse` | `boolean` | Whether data is referenced |

---

### SchemaEntry

Schema definition for data validation.

**Properties:**

| Property | Type | Description |
|----------|------|-------------|
| `type` | `string` | Data type |
| `items` | `SchemaEntry` | Item schema (for arrays/collections) |
| `properties` | `Object` | Property schemas (for objects) |
| `patternProperties` | `Object` | Pattern-based properties |
| `required` | `string[]` | Required properties |
| `additionalProperties` | `boolean` | Allow additional properties |
| `id` | `Object` | ID generation config |
| `options` | `Object` | Validation options |
| `relation` | `string` | Related collection |

---

## Error Types

### DataSchemaException

Thrown when schema validation fails.

**Properties:**

| Property | Type | Description |
|----------|------|-------------|
| `schemaPath` | `string` | Path to schema |
| `keyword` | `string` | Validation keyword |
| `message` | `string` | Error message |
| `code` | `string` | Error code |
| `expected` | `any` | Expected value |
| `actual` | `any` | Actual value |
| `property` | `string` | Property name (for required) |
| `pattern` | `string` | Pattern (for pattern) |
| `minimum` | `number` | Minimum value (for range) |
| `maximum` | `number` | Maximum value (for range) |

**Error Codes:**

- `TYPE_MISMATCH` - Type validation failed
- `REQUIRED_PROPERTY_MISSING` - Required property missing
- `PATTERN_MISMATCH` - Pattern validation failed
- `RANGE_VIOLATION` - Min/max constraint violated
- `UNIQUE_ITEMS_VIOLATION` - Duplicate items in array
- `ADDITIONAL_PROPERTIES_VIOLATION` - Extra properties not allowed
- `ENUM_VIOLATION` - Value not in enum

---

### DataValueException

Thrown when data operations fail.

**Properties:**

| Property | Type | Description |
|----------|------|-------------|
| `message` | `string` | Error message |
| `code` | `string` | Error code |

**Error Codes:**

- `COLLECTION_NOT_FOUND` - Collection doesn't exist
- `ITEM_NOT_FOUND` - Item doesn't exist
- `UNSAFE_SET_VALUE_INVALID_ID` - Invalid ID for unsafe set
- `UPDATE_POSITION_NOT_FOUND` - Update position not found
- `ARRAY_EXPECTED` - Array expected but not found

---

## Constants

### DATA_TYPES

Supported data types:

```javascript
[
  'array',
  'boolean',
  'collection',
  'function',
  'node',
  'number',
  'object',
  'string'
]
```

---

### OPERATORS

Supported comparison operators:

```javascript
[
  '==',
  '!=',
  '>',
  '>=',
  '<',
  '<=',
  'includes',
  'in'
]
```

---

### UPDATE_METHODS

Supported array update methods:

```javascript
[
  'push',
  'pull',
  'pop',
  'shift',
  'unshift',
  'splice'
]
```

---

## Complete Example

```javascript
import { createPlugin } from '@dooksa/create-plugin'
import { 
  stateSetValue,
  stateGetValue,
  stateDeleteValue,
  stateFind,
  stateAddListener,
  stateDeleteListener,
  stateGetSchema
} from '@dooksa/plugins'

// Create a plugin with state
const userPlugin = createPlugin('user', {
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
              enum: ['user', 'admin', 'guest'],
              default: 'user'
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive', 'suspended'],
              default: 'active'
            }
          },
          required: ['name', 'email']
        },
        id: {
          prefix: 'user_'
        }
      }
    }
  },
  methods: {
    // Create user
    async createUser(userData) {
      try {
        const result = stateSetValue({
          name: 'user/profiles',
          value: userData
        })
        
        return { success: true, id: result.id, user: result.item }
      } catch (error) {
        return { success: false, error: error.message }
      }
    },
    
    // Get user
    getUser(userId) {
      return stateGetValue({
        name: 'user/profiles',
        id: userId
      })
    },
    
    // Update user
    async updateUser(userId, updates) {
      try {
        stateSetValue({
          name: 'user/profiles',
          value: updates,
          options: { id: userId, merge: true }
        })
        
        return { success: true }
      } catch (error) {
        return { success: false, error: error.message }
      }
    },
    
    // Delete user
    async deleteUser(userId) {
      try {
        const result = stateDeleteValue({
          name: 'user/profiles',
          id: userId,
          cascade: true
        })
        
        return { 
          success: result.deleted, 
          inUse: result.inUse 
        }
      } catch (error) {
        return { success: false, error: error.message }
      }
    },
    
    // Find users
    findUsers(conditions) {
      return stateFind({
        name: 'user/profiles',
        where: conditions
      })
    },
    
    // Add listener
    addUpdateListener(handler) {
      return stateAddListener({
        name: 'user/profiles',
        on: 'update',
        captureAll: true,
        handler: handler
      })
    },
    
    // Remove listener
    removeListener(handlerId) {
      stateDeleteListener({
        name: 'user/profiles',
        on: 'update',
        handlerId: handlerId
      })
    },
    
    // Get schema
    getSchema() {
      return stateGetSchema('user/profiles')
    }
  }
})

// Usage
async function main() {
  // Create user
  const createResult = await userPlugin.createUser({
    name: 'John Doe',
    email: 'john@example.com'
  })
  
  if (createResult.success) {
    console.log('User created:', createResult.id)
    
    // Get user
    const user = userPlugin.getUser(createResult.id)
    console.log('User data:', user.item)
    
    // Update user
    await userPlugin.updateUser(createResult.id, {
      role: 'admin'
    })
    
    // Find users
    const admins = userPlugin.findUsers([
      { name: 'role', op: '==', value: 'admin' }
    ])
    console.log('Admins:', admins)
    
    // Add listener
    const listenerId = userPlugin.addUpdateListener((value) => {
      console.log('User updated:', value.id, value.item)
    })
    
    // Remove listener when done
    // userPlugin.removeListener(listenerId)
  }
}
```

## Next Steps

- Read [State Schema Guide](state-schema-guide.md) for schema definitions
- Read [State Default Values Guide](state-default-values-guide.md) for default values
- Read [State Data Types Guide](state-data-types-guide.md) for type information
- Read [State Relationships Guide](state-relationships-guide.md) for relationships
- Read [State Validation Guide](state-validation-guide.md) for validation rules
- Read [State Events and Listeners Guide](state-events-listeners-guide.md) for events
- Read [State Advanced Patterns Guide](state-advanced-patterns.md) for advanced techniques