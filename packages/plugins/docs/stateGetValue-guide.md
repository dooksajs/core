# StateGetValue Guide

Comprehensive documentation for the `stateGetValue` method in the Dooksa state management system.

## Table of Contents

1. [Overview](#overview)
2. [Method Signature](#method-signature)
3. [Parameters](#parameters)
4. [Return Value](#return-value)
5. [Basic Usage](#basic-usage)
6. [Advanced Features](#advanced-features)
7. [Edge Cases](#edge-cases)
8. [Performance Considerations](#performance-considerations)
9. [Integration Examples](#integration-examples)
10. [Troubleshooting](#troubleshooting)
11. [Best Practices](#best-practices)

## Overview

The `stateGetValue` method is the primary way to retrieve data from the Dooksa state management system. It supports:

- Retrieving entire collections
- Getting specific items by ID
- Extracting nested values using dot notation
- Expanding related data (relationships)
- Cloning data to prevent mutations
- Custom ID affixes (prefix/suffix)

## Method Signature

```javascript
stateGetValue({ name, id, prefixId, suffixId, options })
```

## Parameters

### name (string, required)

The collection or schema path to retrieve data from.

**Format:**
- Collection: `'plugin/collection'` (e.g., `'user/profiles'`)
- Nested path: `'plugin/collection/items'` (e.g., `'user/profiles/items'`)

**Examples:**
```javascript
// Get all users
stateGetValue({ name: 'user/profiles' })

// Get user items schema
stateGetValue({ name: 'user/profiles/items' })
```

### id (string, optional)

The specific document ID within a collection to retrieve.

**Behavior:**
- **With ID**: Returns a single `DataValue` object for that specific item
- **Without ID**: Returns all items in the collection as an array of `DataValue` objects

**Examples:**
```javascript
// Get specific user
stateGetValue({ 
  name: 'user/profiles', 
  id: 'user-123' 
})

// Get all users
stateGetValue({ 
  name: 'user/profiles' 
})
```

### prefixId (string, optional)

Custom prefix to prepend to the ID when looking up the item.

**Use Case:** When you need to look up items with custom ID formats that differ from the schema's default prefix.

**Priority:** Overrides schema-level prefix if both exist.

**Example:**
```javascript
// Schema has prefix: 'user_'
// Looking up with custom prefix
stateGetValue({
  name: 'user/profiles',
  id: '123',
  prefixId: 'custom_'
})
// Looks for: 'custom_123' instead of 'user_123'
```

### suffixId (string, optional)

Custom suffix to append to the ID when looking up the item.

**Use Case:** When you need to look up items with custom ID formats that differ from the schema's default suffix.

**Priority:** Overrides schema-level suffix if both exist.

**Example:**
```javascript
// Schema has suffix: '_v1'
// Looking up with custom suffix
stateGetValue({
  name: 'user/profiles',
  id: '123',
  suffixId: '_v2'
})
// Looks for: '123_v2' instead of '123_v1'
```

### options (object, optional)

Configuration options for data retrieval.

#### options.expand (boolean)

**Default:** `false`

When `true`, fetches and includes related data in the `expand` array.

**How it works:**
1. Identifies relationships defined in the schema via the `relation` property
2. Recursively fetches related items
3. Prevents circular references and duplicates
4. Stores expanded data in the `expand` array

**Example:**
```javascript
// Get post with expanded author and comments
const post = stateGetValue({
  name: 'content/posts',
  id: 'post-123',
  options: { expand: true }
})

// Access expanded data
console.log(post.expand) // Array of related DataValue objects
```

#### options.expandClone (boolean)

**Default:** `false`

When `true`, creates deep clones of all expanded data.

**Use Case:** Prevents mutations to expanded data from affecting the original state.

**Performance Impact:** Significant overhead for large datasets. Use only when necessary.

**Example:**
```javascript
// Get post with cloned expanded data
const post = stateGetValue({
  name: 'content/posts',
  id: 'post-123',
  options: { 
    expand: true,
    expandClone: true 
  }
})

// Modifying expanded data won't affect original state
post.expand[0].item.name = 'Modified'
```

#### options.clone (boolean)

**Default:** `false`

When `true`, creates a deep clone of the main item value.

**Use Case:** Prevents mutations to the returned data from affecting the original state.

**Example:**
```javascript
// Get user with cloned data
const user = stateGetValue({
  name: 'user/profiles',
  id: 'user-123',
  options: { clone: true }
})

// Modifying the returned data won't affect original state
user.item.name = 'Modified'
```

#### options.position (string | string[])

Extract a specific nested value using dot notation or array path.

**Format:**
- Dot notation: `'settings.theme'`
- Array path: `['settings', 'theme']`

**Behavior:**
- Returns the nested value directly (not wrapped in DataValue)
- Returns `undefined` if path doesn't exist
- Supports array indexing: `'items.0.name'`

**Example:**
```javascript
// Get nested value using dot notation
const theme = stateGetValue({
  name: 'user/profiles',
  id: 'user-123',
  options: { position: 'settings.theme' }
})
// Returns: 'dark' (string)

// Get nested value using array path
const theme = stateGetValue({
  name: 'user/profiles',
  id: 'user-123',
  options: { position: ['settings', 'theme'] }
})
// Returns: 'dark' (string)

// Get array item
const firstName = stateGetValue({
  name: 'user/profiles',
  id: 'user-123',
  options: { position: 'names.0' }
})
// Returns: 'John' (string)
```

## Return Value

The method returns a `DataValue` object with the following structure:

```javascript
{
  // Required properties
  collection: 'plugin/collection',  // The collection name
  id: 'item-123',                   // Item ID (if specific item)
  item: { /* actual data */ },      // The retrieved data
  
  // Metadata
  metadata: {
    userId: 'user-456',            // User who created/modified
    createdAt: 1234567890,         // Creation timestamp (ms)
    updatedAt: 1234567890          // Last update timestamp (ms)
  },
  
  // Previous value (for change tracking)
  previous: { /* previous data */ },
  
  // Expanded related data (when options.expand = true)
  expand: [
    {
      collection: 'related/collection',
      id: 'related-123',
      item: { /* related data */ },
      metadata: { /* ... */ }
    }
  ],
  
  // Status flags
  isEmpty: false,                   // No data found
  isExpandEmpty: false,            // No expanded data found
  isAffixEmpty: false              // Affix lookup failed
}
```

### Property Details

#### collection (string)

The collection name from which the data was retrieved.

**Example:**
```javascript
const user = stateGetValue({ name: 'user/profiles', id: 'user-123' })
console.log(user.collection) // 'user/profiles'
```

#### id (string | null)

The document ID. `null` when retrieving entire collections.

**Example:**
```javascript
// Single item
const user = stateGetValue({ name: 'user/profiles', id: 'user-123' })
console.log(user.id) // 'user-123'

// All items
const users = stateGetValue({ name: 'user/profiles' })
console.log(users.id) // undefined
```

#### item (any)

The actual data value. Type depends on schema definition.

**Examples:**
```javascript
// Object
const user = stateGetValue({ name: 'user/profiles', id: 'user-123' })
console.log(user.item) // { name: 'John', email: 'john@example.com' }

// Array
const tags = stateGetValue({ name: 'app/tags' })
console.log(tags.item) // ['tag1', 'tag2', 'tag3']

// Primitive
const setting = stateGetValue({ name: 'app/settings', id: 'theme' })
console.log(setting.item) // 'dark'
```

#### metadata (object)

Metadata associated with the data item.

**Properties:**
- `userId` (string): User ID who created/modified the data
- `createdAt` (number): Creation timestamp in milliseconds
- `updatedAt` (number): Last update timestamp in milliseconds

**Example:**
```javascript
const user = stateGetValue({ name: 'user/profiles', id: 'user-123' })
console.log(user.metadata)
// {
//   userId: 'user-456',
//   createdAt: 1640995200000,
//   updatedAt: 1640995200000
// }
```

#### previous (any)

Previous value of the item (for change tracking). Only present when the item has been updated.

**Example:**
```javascript
// After an update, previous value is available
const user = stateGetValue({ name: 'user/profiles', id: 'user-123' })
if (user.previous) {
  console.log('Previous name:', user.previous.name)
  console.log('Current name:', user.item.name)
}
```

#### expand (DataValue[])

Array of expanded related data. Only present when `options.expand = true`.

**Structure:**
```javascript
{
  expand: [
    {
      collection: 'related/collection',
      id: 'related-123',
      item: { /* related data */ },
      metadata: { /* ... */ }
    }
  ]
}
```

**Example:**
```javascript
const post = stateGetValue({
  name: 'content/posts',
  id: 'post-123',
  options: { expand: true }
})

// Access expanded data
post.expand.forEach(related => {
  console.log(`${related.collection}:`, related.item)
})
```

#### isEmpty (boolean)

Indicates whether no data was found.

**When true:**
- Item doesn't exist in collection
- Collection doesn't exist
- Affix lookup failed

**Example:**
```javascript
const result = stateGetValue({
  name: 'user/profiles',
  id: 'non-existent'
})

if (result.isEmpty) {
  console.log('User not found')
}
```

#### isExpandEmpty (boolean)

Indicates whether expanded data is empty (when `options.expand = true`).

**Example:**
```javascript
const post = stateGetValue({
  name: 'content/posts',
  id: 'post-123',
  options: { expand: true }
})

if (post.isExpandEmpty) {
  console.log('No related data found')
}
```

#### isAffixEmpty (boolean)

Indicates whether affix lookup failed (when using `prefixId` or `suffixId`).

**Example:**
```javascript
const user = stateGetValue({
  name: 'user/profiles',
  id: '123',
  prefixId: 'custom_'
})

if (user.isAffixEmpty) {
  console.log('No item found with custom prefix')
}
```

## Basic Usage

### 1. Get Entire Collection

Retrieve all items from a collection.

```javascript
// Get all users
const users = stateGetValue({ name: 'user/profiles' })

// Result is an array of DataValue objects
users.item.forEach(user => {
  console.log(user.name)
})

// Check if collection is empty
if (users.isEmpty) {
  console.log('No users found')
}
```

### 2. Get Specific Item by ID

Retrieve a single item from a collection.

```javascript
// Get specific user
const user = stateGetValue({
  name: 'user/profiles',
  id: 'user-123'
})

// Access the data
console.log(user.item.name) // 'John'
console.log(user.item.email) // 'john@example.com'

// Check if item exists
if (user.isEmpty) {
  console.log('User not found')
}
```

### 3. Get with Custom Affixes

Retrieve items using custom prefix/suffix.

```javascript
// Get user with custom prefix
const user = stateGetValue({
  name: 'user/profiles',
  id: '123',
  prefixId: 'custom_'
})
// Looks for: 'custom_123'

// Get user with custom suffix
const user = stateGetValue({
  name: 'user/profiles',
  id: '123',
  suffixId: '_v2'
})
// Looks for: '123_v2'

// Get user with both affixes
const user = stateGetValue({
  name: 'user/profiles',
  id: '123',
  prefixId: 'custom_',
  suffixId: '_v2'
})
// Looks for: 'custom_123_v2'
```

### 4. Get Nested Value

Extract specific nested values using dot notation.

```javascript
// Get user theme setting
const theme = stateGetValue({
  name: 'user/profiles',
  id: 'user-123',
  options: { position: 'settings.theme' }
})
// Returns: 'dark' (string)

// Get nested array item
const firstName = stateGetValue({
  name: 'user/profiles',
  id: 'user-123',
  options: { position: 'names.0' }
})
// Returns: 'John' (string)

// Get deeply nested value
const notificationSetting = stateGetValue({
  name: 'user/profiles',
  id: 'user-123',
  options: { position: 'settings.notifications.email' }
})
// Returns: true (boolean)
```

### 5. Get with Cloning

Retrieve data with deep cloning to prevent mutations.

```javascript
// Get user with cloned data
const user = stateGetValue({
  name: 'user/profiles',
  id: 'user-123',
  options: { clone: true }
})

// Modifying the returned data won't affect original state
user.item.name = 'Modified'
console.log(user.item.name) // 'Modified'

// Original state remains unchanged
const original = stateGetValue({
  name: 'user/profiles',
  id: 'user-123'
})
console.log(original.item.name) // 'John' (unchanged)
```

### 6. Get with Expansion

Retrieve data with related items.

```javascript
// Get post with expanded author and comments
const post = stateGetValue({
  name: 'content/posts',
  id: 'post-123',
  options: { expand: true }
})

// Access main data
console.log(post.item.title) // 'My Post'

// Access expanded data
post.expand.forEach(related => {
  console.log(`${related.collection}:`, related.item)
})
// content/authors: { name: 'John', ... }
// content/comments: [{ text: 'Great post!', ... }]
```

## Advanced Features

### 1. Complex Expansion with Cloning

Get data with expanded relationships and clone everything.

```javascript
const post = stateGetValue({
  name: 'content/posts',
  id: 'post-123',
  options: { 
    expand: true,
    expandClone: true 
  }
})

// All data is cloned
// Modifying any part won't affect original state
post.item.title = 'Modified Title'
post.expand[0].item.name = 'Modified Author'
```

### 2. Position with Arrays

Access array elements using dot notation.

```javascript
// Get first item in array
const firstTag = stateGetValue({
  name: 'app/tags',
  options: { position: '0' }
})
// Returns: 'tag1'

// Get specific array element
const thirdUser = stateGetValue({
  name: 'user/profiles',
  options: { position: '2' }
})
// Returns: DataValue for third user

// Get nested array element
const secondComment = stateGetValue({
  name: 'content/posts',
  id: 'post-123',
  options: { position: 'comments.1' }
})
// Returns: DataValue for second comment
```

### 3. Affix Priority

Understanding affix priority when both schema and parameters have affixes.

```javascript
// Schema definition:
// {
//   type: 'collection',
//   id: { prefix: 'user_', suffix: '_v1' }
// }

// Parameter affixes override schema affixes
const user = stateGetValue({
  name: 'user/profiles',
  id: '123',
  prefixId: 'custom_',
  suffixId: '_v2'
})
// Looks for: 'custom_123_v2' (not 'user_123_v1')
```

### 4. Empty State Handling

Properly handle cases where data doesn't exist.

```javascript
const result = stateGetValue({
  name: 'user/profiles',
  id: 'non-existent'
})

if (result.isEmpty) {
  console.log('Item not found')
  // Provide default or handle gracefully
}

// Check for specific empty states
if (result.isAffixEmpty) {
  console.log('Affix lookup failed')
}

if (result.isExpandEmpty) {
  console.log('No related data found')
}
```

### 5. Chaining with stateFind

Combine with `stateFind` for complex queries.

```javascript
// Find active users
const activeUsers = stateFind({
  name: 'user/profiles',
  where: [
    { name: 'status', op: '==', value: 'active' }
  ]
})

// Get details for each user
const userDetails = activeUsers.map(user => {
  return stateGetValue({
    name: 'user/profiles',
    id: user.id,
    options: { expand: true }
  })
})
```

## Edge Cases

### 1. Missing Collection

```javascript
const result = stateGetValue({
  name: 'non-existent/collection'
})

console.log(result.isEmpty) // true
console.log(result.collection) // 'non-existent/collection'
console.log(result.item) // undefined
```

### 2. Missing Item in Collection

```javascript
const result = stateGetValue({
  name: 'user/profiles',
  id: 'non-existent-123'
})

console.log(result.isEmpty) // true
console.log(result.id) // 'non-existent-123'
console.log(result.item) // undefined
```

### 3. Invalid Position Path

```javascript
const result = stateGetValue({
  name: 'user/profiles',
  id: 'user-123',
  options: { position: 'non.existent.path' }
})

console.log(result) // undefined
```

### 4. Affix Mismatch

```javascript
// Schema has prefix: 'user_'
// Looking for item without prefix
const result = stateGetValue({
  name: 'user/profiles',
  id: '123' // Missing 'user_' prefix
})

console.log(result.isEmpty) // true
console.log(result.isAffixEmpty) // false (no custom affix used)
```

### 5. Circular References

The `expand` feature prevents circular references automatically.

```javascript
// Even if data has circular references,
// expand will not cause infinite loops
const result = stateGetValue({
  name: 'content/posts',
  id: 'post-123',
  options: { expand: true }
})

// expand array will not contain the same item twice
```

### 6. Large Datasets

When retrieving entire collections with large datasets:

```javascript
// Consider using pagination or filtering
const users = stateGetValue({ name: 'user/profiles' })

// If collection is large, consider:
// 1. Using stateFind with conditions
// 2. Retrieving specific items by ID
// 3. Using position to get specific items
```

## Performance Considerations

### 1. When to Use Cloning

**Use cloning when:**
- You need to modify the returned data
- You're passing data to external libraries
- You need to prevent accidental mutations

**Avoid cloning when:**
- Data is read-only
- Performance is critical
- You're working with large datasets

```javascript
// Good: Clone when modifying
const user = stateGetValue({
  name: 'user/profiles',
  id: 'user-123',
  options: { clone: true }
})
user.item.name = 'Modified'

// Good: No clone when read-only
const user = stateGetValue({
  name: 'user/profiles',
  id: 'user-123'
})
console.log(user.item.name) // Read-only access
```

### 2. Expansion Performance

**Expansion overhead:**
- Each relationship requires additional state lookups
- Recursive expansion can be expensive
- Cloning expanded data adds significant overhead

**Best practices:**
```javascript
// Only expand what you need
const post = stateGetValue({
  name: 'content/posts',
  id: 'post-123',
  options: { expand: true }
})

// Avoid expandClone unless necessary
const post = stateGetValue({
  name: 'content/posts',
  id: 'post-123',
  options: { 
    expand: true,
    expandClone: true // Only if you need to modify expanded data
  }
})
```

### 3. Position Parameter Performance

Using `position` is more efficient than retrieving entire objects:

```javascript
// Efficient: Get only what you need
const theme = stateGetValue({
  name: 'user/profiles',
  id: 'user-123',
  options: { position: 'settings.theme' }
})

// Less efficient: Get entire object
const user = stateGetValue({
  name: 'user/profiles',
  id: 'user-123'
})
const theme = user.item.settings.theme
```

### 4. Memory Usage

**Considerations:**
- Large collections consume memory
- Expansion increases memory usage
- Cloning doubles memory usage

**Optimization strategies:**
```javascript
// 1. Retrieve specific items instead of entire collection
const user = stateGetValue({
  name: 'user/profiles',
  id: 'user-123'
})

// 2. Use position to get specific values
const email = stateGetValue({
  name: 'user/profiles',
  id: 'user-123',
  options: { position: 'email' }
})

// 3. Avoid expandClone for large datasets
const post = stateGetValue({
  name: 'content/posts',
  id: 'post-123',
  options: { expand: true } // No expandClone
})
```

### 5. Caching Strategy

For frequently accessed data, consider caching:

```javascript
// Simple caching example
const userCache = new Map()

function getUser(userId) {
  if (userCache.has(userId)) {
    return userCache.get(userId)
  }
  
  const user = stateGetValue({
    name: 'user/profiles',
    id: userId
  })
  
  userCache.set(userId, user)
  return user
}
```

## Integration Examples

### 1. User Management System

```javascript
// Get user with profile and settings
function getUserWithDetails(userId) {
  return stateGetValue({
    name: 'user/profiles',
    id: userId,
    options: { expand: true }
  })
}

// Get user setting
function getUserSetting(userId, settingPath) {
  return stateGetValue({
    name: 'user/profiles',
    id: userId,
    options: { position: `settings.${settingPath}` }
  })
}

// Get all active users
function getActiveUsers() {
  return stateFind({
    name: 'user/profiles',
    where: [
      { name: 'status', op: '==', value: 'active' }
    ]
  })
}

// Usage
const user = getUserWithDetails('user-123')
console.log(user.item.name)
console.log(user.expand) // Related data

const theme = getUserSetting('user-123', 'theme')
console.log(theme) // 'dark'
```

### 2. Content Management System

```javascript
// Get post with author and comments
function getPostWithRelations(postId) {
  return stateGetValue({
    name: 'content/posts',
    id: postId,
    options: { 
      expand: true,
      expandClone: true // Clone to prevent mutations
    }
  })
}

// Get post excerpt
function getPostExcerpt(postId) {
  return stateGetValue({
    name: 'content/posts',
    id: postId,
    options: { position: 'excerpt' }
  })
}

// Get posts by author
function getPostsByAuthor(authorId) {
  return stateFind({
    name: 'content/posts',
    where: [
      { name: 'authorId', op: '==', value: authorId }
    ]
  })
}

// Usage
const post = getPostWithRelations('post-123')
console.log(post.item.title)
post.expand.forEach(related => {
  console.log(`${related.collection}:`, related.item)
})

const excerpt = getPostExcerpt('post-123')
console.log(excerpt) // 'Post excerpt text...'
```

### 3. E-commerce System

```javascript
// Get product with variants
function getProductWithVariants(productId) {
  return stateGetValue({
    name: 'shop/products',
    id: productId,
    options: { expand: true }
  })
}

// Get product price
function getProductPrice(productId) {
  return stateGetValue({
    name: 'shop/products',
    id: productId,
    options: { position: 'price' }
  })
}

// Get products by category
function getProductsByCategory(category) {
  return stateFind({
    name: 'shop/products',
    where: [
      { name: 'category', op: '==', value: category }
    ]
  })
}

// Get products in price range
function getProductsInPriceRange(min, max) {
  return stateFind({
    name: 'shop/products',
    where: [
      { name: 'price', op: '>=', value: min },
      { name: 'price', op: '<=', value: max }
    ]
  })
}

// Usage
const product = getProductWithVariants('prod-789')
console.log(product.item.name)
console.log(product.expand) // Variants

const price = getProductPrice('prod-789')
console.log(price) // 99.99

const electronics = getProductsByCategory('electronics')
console.log(electronics.length)
```

### 4. Real-time Chat Application

```javascript
// Get chat with messages and participants
function getChatWithDetails(chatId) {
  return stateGetValue({
    name: 'chat/rooms',
    id: chatId,
    options: { expand: true }
  })
}

// Get chat participants only
function getChatParticipants(chatId) {
  return stateGetValue({
    name: 'chat/rooms',
    id: chatId,
    options: { position: 'participants' }
  })
}

// Get unread messages count
function getUnreadCount(userId) {
  const chats = stateFind({
    name: 'chat/rooms',
    where: [
      { name: 'unreadCount', op: '>', value: 0 }
    ]
  })
  
  return chats.reduce((sum, chat) => sum + chat.item.unreadCount, 0)
}

// Usage
const chat = getChatWithDetails('chat-123')
console.log(chat.item.name)
chat.expand.forEach(related => {
  console.log(`${related.collection}:`, related.item)
})

const participants = getChatParticipants('chat-123')
console.log(participants) // Array of participant IDs
```

### 5. Dashboard Analytics

```javascript
// Get dashboard with widgets
function getDashboardWithWidgets(dashboardId) {
  return stateGetValue({
    name: 'dashboard/configs',
    id: dashboardId,
    options: { expand: true }
  })
}

// Get specific widget data
function getWidgetData(dashboardId, widgetId) {
  return stateGetValue({
    name: 'dashboard/configs',
    id: dashboardId,
    options: { position: `widgets.${widgetId}` }
  })
}

// Get all dashboards for user
function getUserDashboards(userId) {
  return stateFind({
    name: 'dashboard/configs',
    where: [
      { name: 'userId', op: '==', value: userId }
    ]
  })
}

// Usage
const dashboard = getDashboardWithWidgets('dash-123')
console.log(dashboard.item.name)
dashboard.expand.forEach(widget => {
  console.log('Widget:', widget.item)
})

const widgetData = getWidgetData('dash-123', 'widget-1')
console.log(widgetData) // Widget configuration
```

## Troubleshooting

### Issue: Empty Result

**Problem:** `stateGetValue` returns `isEmpty: true`

**Solutions:**
1. Check collection name is correct
2. Verify item ID exists
3. Check affixes match schema
4. Ensure data was set before retrieval

```javascript
// Debug: Check if collection exists
const collection = stateGetValue({ name: 'user/profiles' })
console.log('Collection exists:', !collection.isEmpty)

// Debug: Check specific item
const user = stateGetValue({ 
  name: 'user/profiles', 
  id: 'user-123' 
})
console.log('User exists:', !user.isEmpty)

// Debug: Check with affixes
const user = stateGetValue({
  name: 'user/profiles',
  id: '123',
  prefixId: 'user_'
})
console.log('User with affix exists:', !user.isEmpty)
```

### Issue: Position Returns Undefined

**Problem:** `options.position` returns `undefined`

**Solutions:**
1. Verify path exists in data structure
2. Check for typos in path
3. Use array notation for array elements
4. Check if data is actually set

```javascript
// Debug: Check entire object first
const user = stateGetValue({
  name: 'user/profiles',
  id: 'user-123'
})
console.log('User data:', user.item)

// Debug: Check if path exists
const hasPath = user.item && user.item.settings && user.item.settings.theme
console.log('Path exists:', hasPath)

// Debug: Try different path formats
const theme1 = stateGetValue({
  name: 'user/profiles',
  id: 'user-123',
  options: { position: 'settings.theme' }
})

const theme2 = stateGetValue({
  name: 'user/profiles',
  id: 'user-123',
  options: { position: ['settings', 'theme'] }
})
```

### Issue: Expansion Not Working

**Problem:** `options.expand` doesn't return related data

**Solutions:**
1. Verify schema has `relation` property
2. Check if related data exists
3. Ensure relationships are properly set
4. Check for circular references

```javascript
// Debug: Check schema
const schema = stateGetSchema('content/posts')
console.log('Schema:', schema)

// Debug: Check if relationship is defined
if (schema.items && schema.items.properties) {
  console.log('Properties:', schema.items.properties)
}

// Debug: Check if related data exists
const related = stateGetValue({
  name: 'content/authors',
  id: 'author-123'
})
console.log('Related data exists:', !related.isEmpty)
```

### Issue: Affix Lookup Fails

**Problem:** `isAffixEmpty: true` when using custom affixes

**Solutions:**
1. Verify affixes are correct
2. Check if item exists with different affix
3. Verify schema affix configuration
4. Try without affixes first

```javascript
// Debug: Try without affixes
const user = stateGetValue({
  name: 'user/profiles',
  id: 'user-123'
})
console.log('Without affix:', !user.isEmpty)

// Debug: Try with schema affixes
const user = stateGetValue({
  name: 'user/profiles',
  id: '123'
})
console.log('With schema affix:', !user.isEmpty)

// Debug: Try with custom affixes
const user = stateGetValue({
  name: 'user/profiles',
  id: '123',
  prefixId: 'custom_'
})
console.log('With custom affix:', !user.isEmpty)
```

### Issue: Performance Problems

**Problem:** Slow retrieval with large datasets

**Solutions:**
1. Avoid retrieving entire collections
2. Use `position` to get specific values
3. Avoid `expandClone` unless necessary
4. Consider pagination or filtering

```javascript
// Bad: Retrieving entire large collection
const allUsers = stateGetValue({ name: 'user/profiles' })

// Good: Retrieve specific item
const user = stateGetValue({
  name: 'user/profiles',
  id: 'user-123'
})

// Good: Get specific value
const email = stateGetValue({
  name: 'user/profiles',
  id: 'user-123',
  options: { position: 'email' }
})

// Good: Filter before retrieving
const activeUsers = stateFind({
  name: 'user/profiles',
  where: [
    { name: 'status', op: '==', value: 'active' }
  ]
})
```

## Best Practices

### 1. Always Check Empty State

```javascript
const result = stateGetValue({
  name: 'user/profiles',
  id: 'user-123'
})

if (result.isEmpty) {
  // Handle missing data
  return null
}

// Safe to access data
console.log(result.item.name)
```

### 2. Use Position for Specific Values

```javascript
// Instead of retrieving entire object
const user = stateGetValue({
  name: 'user/profiles',
  id: 'user-123'
})
const theme = user.item.settings.theme

// Use position for efficiency
const theme = stateGetValue({
  name: 'user/profiles',
  id: 'user-123',
  options: { position: 'settings.theme' }
})
```

### 3. Clone When Modifying

```javascript
// If you need to modify the data
const user = stateGetValue({
  name: 'user/profiles',
  id: 'user-123',
  options: { clone: true }
})
user.item.name = 'Modified'

// If read-only, avoid cloning
const user = stateGetValue({
  name: 'user/profiles',
  id: 'user-123'
})
console.log(user.item.name)
```

### 4. Limit Expansion Depth

```javascript
// Be aware of expansion depth
const post = stateGetValue({
  name: 'content/posts',
  id: 'post-123',
  options: { expand: true }
})

// If expand array is large, consider:
// 1. Retrieving specific related items
// 2. Using position to get specific relationships
// 3. Implementing pagination
```

### 5. Use Affixes Correctly

```javascript
// Understand affix priority
const user = stateGetValue({
  name: 'user/profiles',
  id: '123',
  prefixId: 'custom_' // Overrides schema prefix
})

// Test affixes if unsure
const user = stateGetValue({
  name: 'user/profiles',
  id: '123'
})
if (user.isEmpty) {
  // Try with affixes
  const userWithAffix = stateGetValue({
    name: 'user/profiles',
    id: '123',
    prefixId: 'user_'
  })
}
```

### 6. Combine with stateFind for Complex Queries

```javascript
// Find then get details
const users = stateFind({
  name: 'user/profiles',
  where: [
    { name: 'status', op: '==', value: 'active' }
  ]
})

const userDetails = users.map(user => {
  return stateGetValue({
    name: 'user/profiles',
    id: user.id,
    options: { expand: true }
  })
})
```

### 7. Cache Frequently Accessed Data

```javascript
// Simple caching for performance
const cache = new Map()

function getCachedUser(userId) {
  const cacheKey = `user:${userId}`
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)
  }
  
  const user = stateGetValue({
    name: 'user/profiles',
    id: userId
  })
  
  cache.set(cacheKey, user)
  return user
}
```

### 8. Handle Errors Gracefully

```javascript
function getUserSafe(userId) {
  try {
    const user = stateGetValue({
      name: 'user/profiles',
      id: userId
    })
    
    if (user.isEmpty) {
      return { success: false, error: 'User not found' }
    }
    
    return { success: true, data: user.item }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
```

## Related Documentation

- [State API Reference](state-api-reference.md) - Complete API documentation
- [State Schema Guide](state-schema-guide.md) - Schema definitions
- [State Relationships Guide](state-relationships-guide.md) - Data relationships
- [State Validation Guide](state-validation-guide.md) - Validation rules
- [State Events and Listeners Guide](state-events-listeners-guide.md) - Event handling
- [State Advanced Patterns](state-advanced-patterns.md) - Advanced techniques

## Quick Reference

```javascript
// Basic usage
stateGetValue({ name: 'collection' })
stateGetValue({ name: 'collection', id: 'item-123' })

// With affixes
stateGetValue({ 
  name: 'collection', 
  id: '123',
  prefixId: 'custom_',
  suffixId: '_v2'
})

// With options
stateGetValue({
  name: 'collection',
  id: 'item-123',
  options: {
    expand: true,
    expandClone: true,
    clone: true,
    position: 'nested.path'
  }
})

// Check result
const result = stateGetValue({ name: 'collection', id: 'item-123' })
if (result.isEmpty) {
  // Handle missing data
}

// Access data
console.log(result.item)
console.log(result.metadata)
console.log(result.expand)