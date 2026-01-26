# StateGetValue Quick Reference

One-page cheat sheet for the `stateGetValue` method.

## Method Signature

```javascript
stateGetValue({ name, id, prefixId, suffixId, options })
```

## Parameters at a Glance

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `name` | string | ✅ | - | Collection path (e.g., `'user/profiles'`) |
| `id` | string | ❌ | - | Item ID (omit for all items) |
| `prefixId` | string | ❌ | - | Custom prefix for ID lookup |
| `suffixId` | string | ❌ | - | Custom suffix for ID lookup |
| `options` | object | ❌ | `{}` | Configuration options |

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `expand` | boolean | `false` | Fetch related data |
| `expandClone` | boolean | `false` | Clone expanded data |
| `clone` | boolean | `false` | Clone main result |
| `position` | string/array | - | Extract nested value |

## Common Patterns

### Basic Retrieval

```javascript
// All items
const all = stateGetValue({ name: 'user/profiles' })

// Single item
const one = stateGetValue({ name: 'user/profiles', id: 'user-123' })

// With affixes
const custom = stateGetValue({ 
  name: 'user/profiles', 
  id: '123',
  prefixId: 'user_',
  suffixId: '_v1'
})
```

### Nested Values

```javascript
// Dot notation
const theme = stateGetValue({
  name: 'user/profiles',
  id: 'user-123',
  options: { position: 'settings.theme' }
})

// Array access
const first = stateGetValue({
  name: 'app/tags',
  options: { position: '0' }
})
```

### Expansion

```javascript
// Get with relationships
const post = stateGetValue({
  name: 'content/posts',
  id: 'post-123',
  options: { expand: true }
})

// Access expanded data
post.expand.forEach(related => {
  console.log(related.collection, related.item)
})
```

### Cloning

```javascript
// Clone main data
const user = stateGetValue({
  name: 'user/profiles',
  id: 'user-123',
  options: { clone: true }
})

// Clone everything
const post = stateGetValue({
  name: 'content/posts',
  id: 'post-123',
  options: { 
    expand: true,
    expandClone: true 
  }
})
```

## Return Value Structure

```javascript
{
  collection: 'plugin/collection',  // Collection name
  id: 'item-123',                   // Item ID
  item: { /* data */ },             // The data
  metadata: {                       // Metadata
    userId: 'user-456',
    createdAt: 1234567890,
    updatedAt: 1234567890
  },
  previous: { /* prev data */ },    // Previous value
  expand: [ /* expanded items */ ], // Related data
  isEmpty: false,                   // No data found
  isExpandEmpty: false,            // No expanded data
  isAffixEmpty: false              // Affix lookup failed
}
```

## Error Handling

```javascript
const result = stateGetValue({ name: 'collection', id: 'item-123' })

// Check if data exists
if (result.isEmpty) {
  console.log('Not found')
}

// Check specific empty states
if (result.isAffixEmpty) {
  console.log('Affix lookup failed')
}

if (result.isExpandEmpty) {
  console.log('No related data')
}
```

## Performance Tips

✅ **DO:**
- Use `position` for specific values
- Clone only when modifying data
- Check `isEmpty` before accessing
- Use `stateFind` for filtering

❌ **AVOID:**
- Retrieving entire large collections
- Using `expandClone` unnecessarily
- Forgetting to check empty states
- Modifying data without cloning

## Common Use Cases

### User Management

```javascript
// Get user
const user = stateGetValue({
  name: 'user/profiles',
  id: 'user-123',
  options: { expand: true }
})

// Get setting
const theme = stateGetValue({
  name: 'user/profiles',
  id: 'user-123',
  options: { position: 'settings.theme' }
})
```

### Content System

```javascript
// Get post with relations
const post = stateGetValue({
  name: 'content/posts',
  id: 'post-123',
  options: { expand: true, expandClone: true }
})

// Get excerpt
const excerpt = stateGetValue({
  name: 'content/posts',
  id: 'post-123',
  options: { position: 'excerpt' }
})
```

### E-commerce

```javascript
// Get product
const product = stateGetValue({
  name: 'shop/products',
  id: 'prod-789',
  options: { expand: true }
})

// Get price
const price = stateGetValue({
  name: 'shop/products',
  id: 'prod-789',
  options: { position: 'price' }
})
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `isEmpty: true` | Check collection name, ID, and affixes |
| `position` returns `undefined` | Verify path exists in data |
| `expand` not working | Check schema has `relation` property |
| `isAffixEmpty: true` | Verify affixes match schema |
| Slow performance | Use `position`, avoid `expandClone` |

## Quick Examples

```javascript
// 1. Get all
stateGetValue({ name: 'collection' })

// 2. Get one
stateGetValue({ name: 'collection', id: 'item-123' })

// 3. Get nested
stateGetValue({ 
  name: 'collection', 
  id: 'item-123',
  options: { position: 'nested.path' }
})

// 4. Get with relations
stateGetValue({ 
  name: 'collection', 
  id: 'item-123',
  options: { expand: true }
})

// 5. Get clone
stateGetValue({ 
  name: 'collection', 
  id: 'item-123',
  options: { clone: true }
})

// 6. Get everything
stateGetValue({ 
  name: 'collection', 
  id: 'item-123',
  options: { 
    expand: true,
    expandClone: true,
    clone: true 
  }
})
```

## Related

- [Full Guide](stateGetValue-guide.md)
- [API Reference](state-api-reference.md)
- [Examples](testing/stateGetValue-examples.md)