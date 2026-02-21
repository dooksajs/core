# State Data Access Guide

This guide covers how to read, write, update, delete, and query data in the Dooksa state management system.

## Quick Reference

### stateGetValue

```javascript
// Get all items in a collection
stateGetValue({ name: 'user/profiles' })

// Get a single item by ID
stateGetValue({ name: 'user/profiles', id: 'user-123' })

// Get nested value
stateGetValue({ 
  name: 'user/profiles', 
  id: 'user-123',
  options: { position: 'settings.theme' } 
})

// Get with relationships (expand)
stateGetValue({ 
  name: 'content/posts', 
  id: 'post-123',
  options: { expand: true } 
})
```

### stateSetValue

```javascript
// Create new item (auto-ID)
stateSetValue({
  name: 'user/profiles',
  value: { name: 'John Doe' }
})

// Update existing item (merge)
stateSetValue({
  name: 'user/profiles',
  value: { email: 'john@example.com' },
  options: { id: 'user-123', merge: true }
})

// Bulk update
stateSetValue({
  name: 'user/profiles',
  value: {
    'user-1': { name: 'John' },
    'user-2': { name: 'Jane' }
  },
  options: { merge: true }
})
```

### stateDeleteValue

```javascript
// Delete single item
stateDeleteValue({
  name: 'user/profiles',
  id: 'user-123'
})

// Delete with cascade
stateDeleteValue({
  name: 'user/profiles',
  id: 'user-123',
  cascade: true
})
```

## Reading Data (`stateGetValue`)

The `stateGetValue` function retrieves data from the state. It supports fetching entire collections, specific items, or nested properties.

### Basic Usage

**Get Collection:**
Returns all items in the collection as an array of `DataValue` objects.
```javascript
const users = stateGetValue({ name: 'user/profiles' })
```

**Get Item by ID:**
Returns a single `DataValue` object.
```javascript
const user = stateGetValue({ 
  name: 'user/profiles', 
  id: 'user-123' 
})
```

### Retrieval Options

**`expand` (boolean)**:
Fetches related data defined in the schema.
```javascript
const post = stateGetValue({
  name: 'content/posts',
  id: 'post-123',
  options: { expand: true }
})
// post.expand contains related data (e.g., author, comments)
```

**`position` (string | string[])**:
Extracts a specific nested value using dot notation or array path. more efficient than retrieving the whole object.
```javascript
const theme = stateGetValue({
  name: 'user/profiles',
  id: 'user-123',
  options: { position: 'settings.theme' }
})
```

**`clone` (boolean)**:
Creates a deep clone of the returned data to prevent accidental mutations.
```javascript
const user = stateGetValue({
  name: 'user/profiles',
  id: 'user-123',
  options: { clone: true }
})
```

### Return Value

Returns a `DataValue` object:
```javascript
{
  collection: 'plugin/collection',
  id: 'item-123',
  item: { ... },          // The actual data
  metadata: { ... },      // Metadata (userId, timestamps)
  expand: [ ... ],        // Expanded related data
  isEmpty: false          // True if data not found
}
```

## Writing Data (`stateSetValue`)

The `stateSetValue` function adds or updates data. It handles validation, events, and relationship tracking.

### Basic Usage

**Create (Auto-ID):**
```javascript
const result = stateSetValue({
  name: 'user/profiles',
  value: { name: 'Alice' }
})
console.log(result.id) // Generated ID (e.g., 'user_abc123')
```

**Create/Update (Custom ID):**
```javascript
stateSetValue({
  name: 'user/profiles',
  value: { name: 'Bob' },
  options: { id: 'user-456' }
})
```

### Options

**`merge` (boolean)**:
Merges new data with existing data. Essential for partial updates or bulk inserts.
```javascript
// Partial update
stateSetValue({
  name: 'user/profiles',
  value: { age: 30 },
  options: { id: 'user-123', merge: true }
})
```

**`replace` (boolean)**:
Completely replaces the existing data.
```javascript
stateSetValue({
  name: 'user/profiles',
  value: { name: 'Charlie' }, // Only name remains, other props lost
  options: { id: 'user-789', replace: true }
})
```

**`metadata` (object)**:
Attaches metadata to the operation (e.g., user ID).
```javascript
stateSetValue({
  name: 'content/posts',
  value: { title: 'New Post' },
  options: { metadata: { userId: 'author-1' } }
})
```

### Return Value

Returns a `DataValue` object containing the set data, ID, and metadata.

## Deleting Data (`stateDeleteValue`)

The `stateDeleteValue` function removes data from the state.

### Basic Usage

```javascript
const result = stateDeleteValue({
  name: 'user/profiles',
  id: 'user-123'
})
```

### Options

**`cascade` (boolean)**:
Automatically deletes related data if defined in the schema.
```javascript
stateDeleteValue({
  name: 'user/profiles',
  id: 'user-123',
  cascade: true // Also deletes user's posts, comments, etc.
})
```

**`listeners` (boolean)**:
Whether to trigger delete listeners (default: `true`).
```javascript
stateDeleteValue({
  name: 'temp/data',
  id: 'temp-1',
  listeners: false // Silent delete
})
```

### Return Value

Returns an object with deletion status:
```javascript
{
  deleted: true, // Whether deletion succeeded
  inUse: false   // Whether data was referenced by others (if cascade=false)
}
```

## Finding Data (`stateFind`)

The `stateFind` function allows querying collections based on conditions.

### Basic Usage

```javascript
const activeUsers = stateFind({
  name: 'user/profiles',
  where: [
    { name: 'status', op: '==', value: 'active' }
  ]
})
```

### Filtering Conditions

Conditions are defined in the `where` array.

| Operator | Description |
|----------|-------------|
| `==` | Equal |
| `!=` | Not equal |
| `>` | Greater than |
| `>=` | Greater than or equal |
| `<` | Less than |
| `<=` | Less than or equal |
| `includes` | String/Array includes value |
| `in` | Value is in array |

**Complex Queries (AND/OR):**
```javascript
stateFind({
  name: 'content/posts',
  where: [
    { name: 'authorId', op: '==', value: 'user-123' }, // AND
    { or: [
      { name: 'status', op: '==', value: 'published' },
      { name: 'status', op: '==', value: 'draft' }
    ]}
  ]
})
```

## Working with Relationships

Dooksa state manages relationships between data collections, enabling powerful retrieval and deletion capabilities.

### Fetching Related Data (Expansion)

Use `options.expand: true` in `stateGetValue` to fetch related items in a single call.

```javascript
// Get post with author and comments
const post = stateGetValue({
  name: 'content/posts',
  id: 'post-123',
  options: { expand: true }
})

// Access related data
post.expand.forEach(related => {
  if (related.collection === 'user/profiles') {
    console.log('Author:', related.item.name)
  }
})
```

### Cascade Deletions

When deleting an item, use `cascade: true` to clean up related data to maintain integrity.

```javascript
// Delete user and all their content
stateDeleteValue({
  name: 'user/profiles',
  id: 'user-123',
  cascade: true
})
```

If `cascade` is `false` (default), the operation may return `inUse: true` if other data references the item being deleted, and the deletion might be blocked or result in orphaned references depending on strictness settings.

## Next Steps

- Read [State Schema Guide](state-schema-guide.md) to learn how to define schemas
- Read [State Events and Listeners Guide](state-events-listeners-guide.md) for reactive updates
