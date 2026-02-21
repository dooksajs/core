# State Events and Listeners Guide

This guide explains how to use events and listeners in the Dooksa state management system. Events enable reactive programming by allowing you to execute code when data changes.

## Overview

The Dooksa state system provides an event-driven architecture that allows you to:

1. **Listen for Changes**: Register handlers that fire when data is updated or deleted
2. **React to Events**: Execute code in response to state changes
3. **Control Propagation**: Stop event propagation when needed
4. **Prioritize Handlers**: Control the order of listener execution

## Event Types

The state system supports two types of events:

### 1. Update Events

Triggered when data is set or updated using `stateSetValue`.

```javascript
// This triggers an 'update' event
stateSetValue({
  name: 'user/profiles',
  value: { name: 'John Doe', email: 'john@example.com' }
})
```

### 2. Delete Events

Triggered when data is deleted using `stateDeleteValue`.

```javascript
// This triggers a 'delete' event
stateDeleteValue({
  name: 'user/profiles',
  id: 'user-123'
})
```

## Adding Listeners

### Basic Listener

Add a listener to respond to data changes:

```javascript
// Add listener for user updates
stateAddListener({
  name: 'user/profiles',
  id: 'user-123',
  on: 'update',
  handler: (value) => {
    console.log('User updated:', value.item)
    // value.item contains the updated data
  }
})
```

### Listener Without ID (Collection-Level)

Listen to all changes in a collection:

```javascript
// Listen to all user profile updates
stateAddListener({
  name: 'user/profiles',
  on: 'update',
  handler: (value) => {
    console.log('User profile changed:', value.id, value.item)
  }
})
```

### Priority Listeners

Control the execution order of listeners:

```javascript
// High priority listener (executes first)
stateAddListener({
  name: 'user/profiles',
  on: 'update',
  priority: true,
  handler: (value) => {
    console.log('High priority handler')
    // This executes before non-priority handlers
  }
})

// Normal priority listener
stateAddListener({
  name: 'user/profiles',
  on: 'update',
  handler: (value) => {
    console.log('Normal priority handler')
  }
})
```

### Force Listeners (Ignore Propagation Stop)

Force listeners to execute even if propagation is stopped:

```javascript
stateAddListener({
  name: 'user/profiles',
  on: 'update',
  force: true,
  handler: (value) => {
    console.log('This will always execute')
  }
})
```

### Capture-All Listeners

Listen to all events regardless of specific ID:

```javascript
stateAddListener({
  name: 'user/profiles',
  on: 'update',
  captureAll: true,
  handler: (value) => {
    console.log('Any user profile update:', value.id, value.item)
  }
})
```

## Listener Handler Function

The handler function receives a `DataValue` object with the following properties:

```javascript
stateAddListener({
  name: 'user/profiles',
  on: 'update',
  handler: (dataValue) => {
    // DataValue properties:
    console.log(dataValue.collection)  // 'user/profiles'
    console.log(dataValue.id)          // 'user-123'
    console.log(dataValue.item)        // { name: 'John', email: 'john@example.com' }
    console.log(dataValue.metadata)    // { userId: 'admin', createdAt: 1234567890 }
    console.log(dataValue.previous)    // Previous value (if available)
    console.log(dataValue.expand)      // Expanded related data (if requested)
  }
})
```

### Handler Context

When using action-based handlers, the context is provided:

```javascript
stateAddListener({
  name: 'user/profiles',
  on: 'update',
  handler: 'my-action-id',
  handlerId: 'listener-123'
})

// The action receives:
// - payload: The DataValue object
// - context: The action context
```

## Removing Listeners

### Remove by Handler ID

```javascript
// Add listener with custom ID
const handlerId = stateAddListener({
  name: 'user/profiles',
  id: 'user-123',
  on: 'update',
  handler: (value) => { /* ... */ },
  handlerId: 'my-custom-id'
})

// Remove the listener
stateDeleteListener({
  name: 'user/profiles',
  id: 'user-123',
  on: 'update',
  handlerId: 'my-custom-id'
})
```

### Remove Auto-Generated ID

```javascript
// Add listener (auto-generated ID)
const handlerId = stateAddListener({
  name: 'user/profiles',
  on: 'update',
  handler: (value) => { /* ... */ }
})

// Remove using the returned ID
stateDeleteListener({
  name: 'user/profiles',
  on: 'update',
  handlerId: handlerId
})
```

## Event Propagation

### Stop Propagation

You can stop event propagation to prevent other listeners from executing:

```javascript
// Listener that stops propagation
stateAddListener({
  name: 'user/profiles',
  on: 'update',
  handler: (value) => {
    console.log('First handler - stopping propagation')
    // Stop propagation (other listeners won't execute)
    // Note: You need to return a special value or use context
  }
})

// This listener won't execute if propagation is stopped
stateAddListener({
  name: 'user/profiles',
  on: 'update',
  handler: (value) => {
    console.log('This won't execute')
  }
})
```

### Force Listeners

Force listeners execute even when propagation is stopped:

```javascript
// Regular listener
stateAddListener({
  name: 'user/profiles',
  on: 'update',
  handler: (value) => {
    console.log('Regular listener')
    // Stops propagation
  }
})

// Force listener (executes regardless)
stateAddListener({
  name: 'user/profiles',
  on: 'update',
  force: true,
  handler: (value) => {
    console.log('Force listener - always executes')
  }
})
```

## Practical Examples

### Example 1: User Activity Tracking

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
            lastActive: { type: 'number', default: () => Date.now() }
          }
        }
      }
    }
  }
})

// Add listener to track user activity
stateAddListener({
  name: 'user/profiles',
  on: 'update',
  captureAll: true,
  handler: (value) => {
    // Update last active timestamp
    stateSetValue({
      name: 'user/profiles',
      value: { lastActive: Date.now() },
      options: {
        id: value.id,
        update: {
          position: ['lastActive']
        }
      }
    })
  }
})

// Add listener for logging
stateAddListener({
  name: 'user/profiles',
  on: 'update',
  priority: true,
  handler: (value) => {
    console.log(`User ${value.id} updated:`, value.item)
  }
})

// Add listener for analytics
stateAddListener({
  name: 'user/profiles',
  on: 'update',
  handler: (value) => {
    // Send to analytics service
    analytics.track('user_updated', {
      userId: value.id,
      data: value.item
    })
  }
})
```

### Example 2: Cache Invalidation

```javascript
createPlugin('cache', {
  state: {
    schema: {
      data: {
        type: 'object',
        properties: {
          items: { type: 'object' },
          lastUpdated: { type: 'number' }
        }
      }
    }
  }
})

// Cache invalidation listener
stateAddListener({
  name: 'content/posts',
  on: 'update',
  captureAll: true,
  handler: (value) => {
    // Invalidate cache when posts are updated
    stateSetValue({
      name: 'cache/data',
      value: {
        items: {},
        lastUpdated: Date.now()
      },
      options: { merge: true }
    })
    
    console.log('Cache invalidated due to post update')
  }
})

// Also invalidate on delete
stateAddListener({
  name: 'content/posts',
  on: 'delete',
  captureAll: true,
  handler: (value) => {
    stateSetValue({
      name: 'cache/data',
      value: {
        items: {},
        lastUpdated: Date.now()
      },
      options: { merge: true }
    })
  }
})
```

### Example 3: Real-time Notifications

```javascript
createPlugin('notifications', {
  state: {
    schema: {
      messages: {
        type: 'collection',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            userId: { type: 'string' },
            message: { type: 'string' },
            read: { type: 'boolean', default: false }
          }
        }
      }
    }
  }
})

// Listen for new messages
stateAddListener({
  name: 'notifications/messages',
  on: 'update',
  captureAll: true,
  handler: (value) => {
    const message = value.item
    
    if (!message.read) {
      // Show notification
      showNotification(message.userId, message.message)
      
      // Mark as read after showing
      setTimeout(() => {
        stateSetValue({
          name: 'notifications/messages',
          value: { read: true },
          options: {
            id: value.id,
            update: { position: ['read'] }
          }
        })
      }, 5000)
    }
  }
})

// Listen for user updates to send notifications
stateAddListener({
  name: 'user/profiles',
  on: 'update',
  captureAll: true,
  handler: (value) => {
    // Create notification for user
    stateSetValue({
      name: 'notifications/messages',
      value: {
        userId: value.id,
        message: 'Your profile has been updated'
      }
    })
  }
})
```

### Example 4: Data Validation on Update

```javascript
// Add validation listener
stateAddListener({
  name: 'product/products',
  on: 'update',
  priority: true,
  handler: (value) => {
    const product = value.item
    
    // Validate price
    if (product.price < 0) {
      console.error('Invalid price:', product.price)
      // Could throw error or revert change
    }
    
    // Validate stock
    if (product.stock < 0) {
      console.error('Invalid stock:', product.stock)
    }
  }
})

// Add audit logging
stateAddListener({
  name: 'product/products',
  on: 'update',
  handler: (value) => {
    console.log(`Product ${value.id} updated at ${new Date().toISOString()}`)
    console.log('New values:', value.item)
    console.log('Previous values:', value.previous)
  }
})
```

### Example 5: Cascade Updates

```javascript
// Listen for user name changes and update related posts
stateAddListener({
  name: 'user/profiles',
  on: 'update',
  captureAll: true,
  handler: (value) => {
    const oldName = value.previous?.name
    const newName = value.item.name
    
    if (oldName && oldName !== newName) {
      // Find all posts by this user
      const posts = stateFind({
        name: 'content/posts',
        where: [
          { name: 'authorId', op: '==', value: value.id }
        ]
      })
      
      // Update author name in posts
      posts.forEach(post => {
        stateSetValue({
          name: 'content/posts',
          value: { authorName: newName },
          options: {
            id: post.id,
            update: { position: ['authorName'] }
          }
        })
      })
    }
  }
})
```

## Listener Execution Order

### Priority vs Normal

```javascript
// Execution order:
// 1. Priority listeners (in order added)
// 2. Normal listeners (in order added)
// 3. Force listeners (always last, even if propagation stopped)

stateAddListener({
  name: 'user/profiles',
  on: 'update',
  priority: true,
  handler: () => console.log('1. Priority 1')
})

stateAddListener({
  name: 'user/profiles',
  on: 'update',
  priority: true,
  handler: () => console.log('2. Priority 2')
})

stateAddListener({
  name: 'user/profiles',
  on: 'update',
  handler: () => console.log('3. Normal 1')
})

stateAddListener({
  name: 'user/profiles',
  on: 'update',
  force: true,
  handler: () => console.log('4. Force 1')
})

// Output when user is updated:
// 1. Priority 1
// 2. Priority 2
// 3. Normal 1
// 4. Force 1
```

### Capture-All vs Specific ID

```javascript
// Capture-all listener (executes for any ID)
stateAddListener({
  name: 'user/profiles',
  on: 'update',
  captureAll: true,
  handler: (value) => console.log('Capture-all:', value.id)
})

// Specific ID listener
stateAddListener({
  name: 'user/profiles',
  id: 'user-123',
  on: 'update',
  handler: (value) => console.log('Specific ID:', value.id)
})

// When updating user-123:
// Both listeners execute

// When updating user-456:
// Only capture-all executes
```

## Best Practices

### 1. Use Descriptive Handler IDs

```javascript
// Good
stateAddListener({
  name: 'user/profiles',
  on: 'update',
  handler: (value) => { /* ... */ },
  handlerId: 'user-activity-tracker'
})

// Avoid
stateAddListener({
  name: 'user/profiles',
  on: 'update',
  handler: (value) => { /* ... */ },
  handlerId: 'handler1'  // Not descriptive
})
```

### 2. Clean Up Listeners

```javascript
// Add listener
const handlerId = stateAddListener({
  name: 'user/profiles',
  on: 'update',
  handler: (value) => { /* ... */ }
})

// Remove when no longer needed
stateDeleteListener({
  name: 'user/profiles',
  on: 'update',
  handlerId: handlerId
})
```

### 3. Use Priority Wisely

```javascript
// Good - use priority for critical operations
stateAddListener({
  name: 'user/profiles',
  on: 'update',
  priority: true,
  handler: (value) => {
    // Validation, logging, etc.
  }
})

// Avoid - overusing priority
stateAddListener({
  name: 'user/profiles',
  on: 'update',
  priority: true,  // Not necessary for simple operations
  handler: (value) => {
    // Simple notification
  }
})
```

### 4. Handle Errors in Listeners

```javascript
stateAddListener({
  name: 'user/profiles',
  on: 'update',
  handler: (value) => {
    try {
      // Your logic here
      performComplexOperation(value)
    } catch (error) {
      console.error('Listener error:', error)
      // Don't throw - this would break the event chain
    }
  }
})
```

### 5. Avoid Infinite Loops

```javascript
// ❌ Bad - causes infinite loop
stateAddListener({
  name: 'user/profiles',
  on: 'update',
  handler: (value) => {
    // This triggers another update event
    stateSetValue({
      name: 'user/profiles',
      value: { lastUpdated: Date.now() },
      options: { id: value.id, update: { position: ['lastUpdated'] } }
    })
  }
})

// ✅ Good - check if update is needed
stateAddListener({
  name: 'user/profiles',
  on: 'update',
  handler: (value) => {
    const now = Date.now()
    const lastUpdated = value.item.lastUpdated
    
    // Only update if needed
    if (!lastUpdated || now - lastUpdated > 1000) {
      stateSetValue({
        name: 'user/profiles',
        value: { lastUpdated: now },
        options: { id: value.id, update: { position: ['lastUpdated'] } }
      })
    }
  }
})
```

## Testing Listeners

### Test Listener Registration

```javascript
import { test } from 'node:test'
import { strictEqual } from 'node:assert'

test('listener is called on update', async (t) => {
  const plugin = createPlugin('test', {
    state: {
      schema: {
        items: {
          type: 'collection',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' }
            }
          }
        }
      }
    }
  })

  let listenerCalled = false
  let receivedValue = null

  // Add listener
  plugin.stateAddListener({
    name: 'test/items',
    on: 'update',
    handler: (value) => {
      listenerCalled = true
      receivedValue = value
    }
  })

  // Trigger update
  const result = plugin.stateSetValue({
    name: 'test/items',
    value: { name: 'Test' }
  })

  // Verify listener was called
  strictEqual(listenerCalled, true)
  strictEqual(receivedValue.id, result.id)
  strictEqual(receivedValue.item.name, 'Test')
})
```

### Test Priority

```javascript
test('priority listeners execute first', async (t) => {
  const executionOrder = []

  // Priority listener
  plugin.stateAddListener({
    name: 'test/items',
    on: 'update',
    priority: true,
    handler: () => executionOrder.push('priority')
  })

  // Normal listener
  plugin.stateAddListener({
    name: 'test/items',
    on: 'update',
    handler: () => executionOrder.push('normal')
  })

  // Trigger update
  plugin.stateSetValue({
    name: 'test/items',
    value: { name: 'Test' }
  })

  // Verify order
  strictEqual(executionOrder[0], 'priority')
  strictEqual(executionOrder[1], 'normal')
})
```

### Test Listener Removal

```javascript
test('listener can be removed', async (t) => {
  let callCount = 0

  // Add listener
  const handlerId = plugin.stateAddListener({
    name: 'test/items',
    on: 'update',
    handler: () => callCount++
  })

  // Trigger - should call
  plugin.stateSetValue({
    name: 'test/items',
    value: { name: 'Test 1' }
  })
  strictEqual(callCount, 1)

  // Remove listener
  plugin.stateDeleteListener({
    name: 'test/items',
    on: 'update',
    handlerId: handlerId
  })

  // Trigger - should not call
  plugin.stateSetValue({
    name: 'test/items',
    value: { name: 'Test 2' }
  })
  strictEqual(callCount, 1)  // Still 1, not 2
})
```

## Common Listener Patterns

### Pattern 1: Logging

```javascript
stateAddListener({
  name: 'user/profiles',
  on: 'update',
  captureAll: true,
  handler: (value) => {
    console.log(`[${new Date().toISOString()}] User ${value.id} updated`)
    console.log('Data:', JSON.stringify(value.item, null, 2))
  }
})
```

### Pattern 2: Validation

```javascript
stateAddListener({
  name: 'product/products',
  on: 'update',
  priority: true,
  handler: (value) => {
    const product = value.item
    
    if (product.price < 0) {
      throw new Error('Price cannot be negative')
    }
    
    if (product.stock < 0) {
      throw new Error('Stock cannot be negative')
    }
  }
})
```

### Pattern 3: Cache Management

```javascript
const cache = new Map()

stateAddListener({
  name: 'content/posts',
  on: 'update',
  captureAll: true,
  handler: (value) => {
    cache.delete(`post:${value.id}`)
  }
})

stateAddListener({
  name: 'content/posts',
  on: 'delete',
  captureAll: true,
  handler: (value) => {
    cache.delete(`post:${value.id}`)
  }
})
```

### Pattern 4: Analytics

```javascript
stateAddListener({
  name: 'user/profiles',
  on: 'update',
  captureAll: true,
  handler: (value) => {
    analytics.track('user_updated', {
      userId: value.id,
      timestamp: Date.now(),
      changes: value.previous ? getChanges(value.previous, value.item) : {}
    })
  }
})
```

### Pattern 5: Notifications

```javascript
stateAddListener({
  name: 'notifications/messages',
  on: 'update',
  captureAll: true,
  handler: (value) => {
    if (!value.item.read) {
      showNotification(value.item.userId, value.item.message)
    }
  }
})
```

## Performance Considerations

### 1. Limit Listener Count

```javascript
// Good - few focused listeners
stateAddListener({
  name: 'user/profiles',
  on: 'update',
  handler: handleUserProfileUpdate
})

// Avoid - many listeners doing similar things
stateAddListener({ name: 'user/profiles', on: 'update', handler: f1 })
stateAddListener({ name: 'user/profiles', on: 'update', handler: f2 })
stateAddListener({ name: 'user/profiles', on: 'update', handler: f3 })
// ... many more
```

### 2. Use Capture-All Sparingly

```javascript
// Good - specific ID when possible
stateAddListener({
  name: 'user/profiles',
  id: 'user-123',
  on: 'update',
  handler: handler
})

// Avoid - capture-all when not needed
stateAddListener({
  name: 'user/profiles',
  captureAll: true,
  on: 'update',
  handler: handler
})
```

### 3. Clean Up Unused Listeners

```javascript
// Add listener
const handlerId = stateAddListener({
  name: 'user/profiles',
  on: 'update',
  handler: handler
})

// Remove when component unmounts or is no longer needed
function cleanup() {
  stateDeleteListener({
    name: 'user/profiles',
    on: 'update',
    handlerId: handlerId
  })
}
```

## Next Steps

- Read [State Schema Guide](state-schema-guide.md) for schema definitions, types, defaults, and validation
- Read [State Data Access Guide](state-data-access-guide.md) for reading, writing, and managing data
- Read [State Advanced Patterns Guide](state-advanced-patterns.md) for complex applications