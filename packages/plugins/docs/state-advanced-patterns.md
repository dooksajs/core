# State Advanced Patterns Guide

This guide covers advanced patterns and techniques for using the Dooksa state management system effectively in complex applications.

## Overview

Advanced patterns help you:

1. **Optimize Performance**: Reduce unnecessary re-renders and computations
2. **Manage Complexity**: Handle complex data structures and relationships
3. **Ensure Consistency**: Maintain data integrity across the application
4. **Improve Developer Experience**: Make code more maintainable and testable

## Pattern 1: Derived State

### Concept

Derived state is computed from existing state values. Instead of storing redundant data, compute it on-demand.

### Implementation

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
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            email: { type: 'string' }
          }
        }
      }
    }
  },
  methods: {
    // Derived state: full name
    getFullName(userId) {
      const user = stateGetValue({
        name: 'user/profiles',
        id: userId
      })
      
      if (user.isEmpty) {
        return null
      }
      
      return `${user.item.firstName} ${user.item.lastName}`
    },
    
    // Derived state: email domain
    getEmailDomain(userId) {
      const user = stateGetValue({
        name: 'user/profiles',
        id: userId
      })
      
      if (user.isEmpty) {
        return null
      }
      
      const email = user.item.email
      const parts = email.split('@')
      return parts[1] || null
    }
  }
})
```

### Usage

```javascript
// Get derived values
const fullName = userPlugin.getFullName('user-123')
const domain = userPlugin.getEmailDomain('user-123')

console.log(fullName)  // 'John Doe'
console.log(domain)    // 'example.com'
```

### Benefits

- **No Redundancy**: Don't store data that can be computed
- **Always Current**: Derived values are always up-to-date
- **Memory Efficient**: Less storage required

## Pattern 2: Computed Properties

### Concept

Computed properties are values that are calculated based on state and cached for performance.

### Implementation

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
            price: { type: 'number' },
            taxRate: { type: 'number', default: 0.1 }
          }
        }
      }
    }
  },
  methods: {
    // Computed property: price with tax
    getPriceWithTax(productId) {
      const product = stateGetValue({
        name: 'product/products',
        id: productId
      })
      
      if (product.isEmpty) {
        return null
      }
      
      const { price, taxRate } = product.item
      return price * (1 + taxRate)
    },
    
    // Computed property: formatted price
    getFormattedPrice(productId, locale = 'en-US') {
      const priceWithTax = this.getPriceWithTax(productId)
      
      if (priceWithTax === null) {
        return null
      }
      
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'USD'
      }).format(priceWithTax)
    }
  }
})
```

### Usage

```javascript
const product = productPlugin.getFormattedPrice('product-123')
console.log(product)  // '$32.99'
```

### Caching Strategy

For expensive computations, implement caching:

```javascript
createPlugin('product', {
  data: {
    priceCache: {}  // Cache for computed prices
  },
  methods: {
    getPriceWithTax(productId) {
      // Check cache first
      if (this.priceCache[productId]) {
        return this.priceCache[productId]
      }
      
      const product = stateGetValue({
        name: 'product/products',
        id: productId
      })
      
      if (product.isEmpty) {
        return null
      }
      
      const { price, taxRate } = product.item
      const priceWithTax = price * (1 + taxRate)
      
      // Cache the result
      this.priceCache[productId] = priceWithTax
      
      return priceWithTax
    },
    
    // Clear cache when product updates
    clearPriceCache(productId) {
      delete this.priceCache[productId]
    }
  }
})

// Add listener to clear cache on update
stateAddListener({
  name: 'product/products',
  on: 'update',
  captureAll: true,
  handler: (value) => {
    productPlugin.clearPriceCache(value.id)
  }
})
```

## Pattern 3: Selector Pattern

### Concept

Selectors are functions that extract specific data from state, often with filtering or transformation.

### Implementation

```javascript
createPlugin('todo', {
  state: {
    schema: {
      items: {
        type: 'collection',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            text: { type: 'string' },
            completed: { type: 'boolean', default: false },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high'],
              default: 'medium'
            }
          }
        }
      }
    }
  },
  methods: {
    // Selector: all todos
    getAllTodos() {
      return stateGetValue({ name: 'todo/items' }).item
    },
    
    // Selector: completed todos
    getCompletedTodos() {
      const allTodos = this.getAllTodos()
      return allTodos.filter(todo => todo.completed)
    },
    
    // Selector: todos by priority
    getTodosByPriority(priority) {
      const allTodos = this.getAllTodos()
      return allTodos.filter(todo => todo.priority === priority)
    },
    
    // Selector: incomplete todos sorted by priority
    getIncompleteTodosSorted() {
      const incomplete = this.getAllTodos().filter(todo => !todo.completed)
      
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      
      return incomplete.sort((a, b) => {
        return priorityOrder[a.priority] - priorityOrder[b.priority]
      })
    },
    
    // Selector: todo count by status
    getTodoStats() {
      const allTodos = this.getAllTodos()
      
      return {
        total: allTodos.length,
        completed: allTodos.filter(t => t.completed).length,
        pending: allTodos.filter(t => !t.completed).length,
        byPriority: {
          high: allTodos.filter(t => t.priority === 'high').length,
          medium: allTodos.filter(t => t.priority === 'medium').length,
          low: allTodos.filter(t => t.priority === 'low').length
        }
      }
    }
  }
})
```

### Usage

```javascript
// Get all todos
const allTodos = todoPlugin.getAllTodos()

// Get completed todos
const completed = todoPlugin.getCompletedTodos()

// Get high priority todos
const highPriority = todoPlugin.getTodosByPriority('high')

// Get stats
const stats = todoPlugin.getTodoStats()
console.log(stats)
// {
//   total: 10,
//   completed: 5,
//   pending: 5,
//   byPriority: { high: 2, medium: 3, low: 5 }
// }
```

### Memoized Selectors

For expensive selectors, use memoization:

```javascript
createPlugin('todo', {
  data: {
    selectorCache: {},
    lastStateVersion: 0
  },
  methods: {
    // Memoized selector
    getFilteredTodos(filter) {
      const stateVersion = this.getStateVersion()
      
      // Check cache
      const cacheKey = JSON.stringify(filter)
      if (this.selectorCache[cacheKey] && 
          this.selectorCache[cacheKey].version === stateVersion) {
        return this.selectorCache[cacheKey].result
      }
      
      // Compute result
      const allTodos = this.getAllTodos()
      let result = allTodos
      
      if (filter.completed !== undefined) {
        result = result.filter(todo => todo.completed === filter.completed)
      }
      
      if (filter.priority) {
        result = result.filter(todo => todo.priority === filter.priority)
      }
      
      // Cache result
      this.selectorCache[cacheKey] = {
        version: stateVersion,
        result: result
      }
      
      return result
    },
    
    getStateVersion() {
      // Return a version number that changes when state changes
      return this.lastStateVersion
    }
  }
})

// Update version on state changes
stateAddListener({
  name: 'todo/items',
  on: 'update',
  captureAll: true,
  handler: () => {
    todoPlugin.lastStateVersion++
    // Clear cache
    todoPlugin.selectorCache = {}
  }
})
```

## Pattern 4: Optimistic Updates

### Concept

Update the UI immediately before the server confirms the change, then reconcile if needed.

### Implementation

```javascript
createPlugin('post', {
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
            status: {
              type: 'string',
              enum: ['draft', 'published', 'archived'],
              default: 'draft'
            },
            isSyncing: { type: 'boolean', default: false },
            syncError: { type: 'string', default: null }
          }
        }
      }
    }
  },
  methods: {
    // Optimistic update
    async updatePost(postId, updates) {
      // 1. Update local state immediately (optimistic)
      stateSetValue({
        name: 'post/posts',
        value: {
          ...updates,
          isSyncing: true,
          syncError: null
        },
        options: {
          id: postId,
          merge: true
        }
      })
      
      try {
        // 2. Send to server
        const response = await fetch(`/api/posts/${postId}`, {
          method: 'PUT',
          body: JSON.stringify(updates)
        })
        
        if (!response.ok) {
          throw new Error('Server error')
        }
        
        const data = await response.json()
        
        // 3. Update with server data (reconciliation)
        stateSetValue({
          name: 'post/posts',
          value: {
            ...data,
            isSyncing: false,
            syncError: null
          },
          options: {
            id: postId,
            merge: true
          }
        })
        
        return { success: true }
      } catch (error) {
        // 4. Revert on error
        stateSetValue({
          name: 'post/posts',
          value: {
            isSyncing: false,
            syncError: error.message
          },
          options: {
            id: postId,
            merge: true
          }
        })
        
        return { success: false, error: error.message }
      }
    },
    
    // Optimistic create
    async createPost(postData) {
      // Generate temporary ID
      const tempId = `temp-${Date.now()}`
      
      // 1. Create with temporary ID (optimistic)
      stateSetValue({
        name: 'post/posts',
        value: {
          ...postData,
          id: tempId,
          isSyncing: true,
          syncError: null
        },
        options: { id: tempId }
      })
      
      try {
        // 2. Send to server
        const response = await fetch('/api/posts', {
          method: 'POST',
          body: JSON.stringify(postData)
        })
        
        if (!response.ok) {
          throw new Error('Server error')
        }
        
        const data = await response.json()
        
        // 3. Delete temporary and create with real ID
        stateDeleteValue({
          name: 'post/posts',
          id: tempId
        })
        
        stateSetValue({
          name: 'post/posts',
          value: {
            ...data,
            isSyncing: false,
            syncError: null
          },
          options: { id: data.id }
        })
        
        return { success: true, id: data.id }
      } catch (error) {
        // 4. Delete temporary on error
        stateDeleteValue({
          name: 'post/posts',
          id: tempId
        })
        
        return { success: false, error: error.message }
      }
    }
  }
})
```

### Usage

```javascript
// Update post optimistically
const result = await postPlugin.updatePost('post-123', {
  title: 'Updated Title'
})

if (result.success) {
  console.log('Post updated successfully')
} else {
  console.error('Update failed:', result.error)
  // UI shows error state
}
```

### Benefits

- **Instant Feedback**: UI updates immediately
- **Better UX**: No loading spinners for every action
- **Reconciliation**: Handles conflicts automatically

## Pattern 5: Transactional Updates

### Concept

Group multiple state updates into a single transaction that either succeeds or fails completely.

### Implementation

```javascript
createPlugin('order', {
  state: {
    schema: {
      orders: {
        type: 'collection',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  productId: { type: 'string' },
                  quantity: { type: 'number' },
                  price: { type: 'number' }
                }
              }
            },
            total: { type: 'number' },
            status: {
              type: 'string',
              enum: ['pending', 'confirmed', 'shipped'],
              default: 'pending'
            }
          }
        }
      },
      inventory: {
        type: 'collection',
        items: {
          type: 'object',
          properties: {
            productId: { type: 'string' },
            stock: { type: 'number' }
          }
        }
      }
    }
  },
  methods: {
    // Transactional order creation
    async createOrder(orderData) {
      const orderId = `order-${Date.now()}`
      
      // Start transaction
      const transaction = {
        id: orderId,
        updates: [],
        rollback: []
      }
      
      try {
        // 1. Create order
        stateSetValue({
          name: 'order/orders',
          value: {
            id: orderId,
            items: orderData.items,
            total: orderData.total,
            status: 'pending'
          }
        })
        
        transaction.updates.push({
          collection: 'order/orders',
          id: orderId,
          action: 'create'
        })
        
        // 2. Update inventory for each item
        for (const item of orderData.items) {
          const inventory = stateGetValue({
            name: 'order/inventory',
            id: item.productId
          })
          
          if (inventory.isEmpty) {
            throw new Error(`Product ${item.productId} not found`)
          }
          
          const newStock = inventory.item.stock - item.quantity
          
          if (newStock < 0) {
            throw new Error(`Insufficient stock for ${item.productId}`)
          }
          
          stateSetValue({
            name: 'order/inventory',
            value: { stock: newStock },
            options: {
              id: item.productId,
              merge: true
            }
          })
          
          transaction.updates.push({
            collection: 'order/inventory',
            id: item.productId,
            action: 'update',
            oldValue: inventory.item.stock,
            newValue: newStock
          })
          
          transaction.rollback.push({
            collection: 'order/inventory',
            id: item.productId,
            action: 'update',
            value: inventory.item.stock
          })
        }
        
        // 3. Confirm order
        stateSetValue({
          name: 'order/orders',
          value: { status: 'confirmed' },
          options: {
            id: orderId,
            merge: true
          }
        })
        
        transaction.updates.push({
          collection: 'order/orders',
          id: orderId,
          action: 'update',
          field: 'status',
          oldValue: 'pending',
          newValue: 'confirmed'
        })
        
        return { success: true, orderId }
      } catch (error) {
        // Rollback on error
        await this.rollbackTransaction(transaction)
        
        return { success: false, error: error.message }
      }
    },
    
    // Rollback transaction
    async rollbackTransaction(transaction) {
      console.log('Rolling back transaction:', transaction.id)
      
      // Rollback in reverse order
      for (let i = transaction.rollback.length - 1; i >= 0; i--) {
        const rollback = transaction.rollback[i]
        
        if (rollback.action === 'update') {
          stateSetValue({
            name: rollback.collection,
            value: { stock: rollback.value },
            options: {
              id: rollback.id,
              merge: true
            }
          })
        } else if (rollback.action === 'create') {
          stateDeleteValue({
            name: rollback.collection,
            id: rollback.id
          })
        }
      }
    }
  }
})
```

### Usage

```javascript
const result = await orderPlugin.createOrder({
  items: [
    { productId: 'prod-1', quantity: 2, price: 10 },
    { productId: 'prod-2', quantity: 1, price: 20 }
  ],
  total: 40
})

if (result.success) {
  console.log('Order created:', result.orderId)
} else {
  console.error('Order failed:', result.error)
  // All changes rolled back
}
```

### Benefits

- **Atomicity**: All or nothing
- **Data Integrity**: No partial updates
- **Error Recovery**: Automatic rollback

## Pattern 6: Debounced Updates

### Concept

Batch rapid updates to reduce unnecessary computations and improve performance.

### Implementation

```javascript
createPlugin('search', {
  data: {
    debounceTimer: null,
    debounceDelay: 300
  },
  state: {
    schema: {
      results: {
        type: 'collection',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            query: { type: 'string' },
            results: {
              type: 'array',
              items: { type: 'object' }
            },
            timestamp: { type: 'number' }
          }
        }
      }
    }
  },
  methods: {
    // Debounced search
    async search(query) {
      // Clear previous timer
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer)
      }
      
      return new Promise((resolve) => {
        this.debounceTimer = setTimeout(async () => {
          try {
            const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
            const data = await response.json()
            
            const searchId = `search-${Date.now()}`
            
            stateSetValue({
              name: 'search/results',
              value: {
                id: searchId,
                query,
                results: data,
                timestamp: Date.now()
              }
            })
            
            resolve({ success: true, id: searchId, results: data })
          } catch (error) {
            resolve({ success: false, error: error.message })
          }
        }, this.debounceDelay)
      })
    },
    
    // Immediate search (no debounce)
    async searchImmediate(query) {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        const data = await response.json()
        
        const searchId = `search-${Date.now()}`
        
        stateSetValue({
          name: 'search/results',
          value: {
            id: searchId,
            query,
            results: data,
            timestamp: Date.now()
          }
        })
        
        return { success: true, id: searchId, results: data }
      } catch (error) {
        return { success: false, error: error.message }
      }
    }
  }
})
```

### Usage

```javascript
// Debounced search (waits 300ms after last call)
searchPlugin.search('react')
searchPlugin.search('react js')
searchPlugin.search('react javascript')
// Only executes once with 'react javascript'

// Immediate search
searchPlugin.searchImmediate('react')
// Executes immediately
```

### Benefits

- **Performance**: Reduces API calls
- **Better UX**: No flickering results
- **Resource Efficient**: Less server load

## Pattern 7: Pagination with Infinite Scroll

### Concept

Load data in chunks as the user scrolls, maintaining state for loaded pages.

### Implementation

```javascript
createPlugin('feed', {
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
            authorId: { type: 'string' }
          }
        }
      },
      pagination: {
        type: 'object',
        properties: {
          currentPage: { type: 'number', default: 0 },
          hasMore: { type: 'boolean', default: true },
          isLoading: { type: 'boolean', default: false },
          pageSize: { type: 'number', default: 10 }
        }
      }
    }
  },
  methods: {
    // Load next page
    async loadNextPage() {
      const pagination = stateGetValue({ name: 'feed/pagination' })
      
      if (pagination.item.isLoading || !pagination.item.hasMore) {
        return
      }
      
      // Set loading state
      stateSetValue({
        name: 'feed/pagination',
        value: { isLoading: true },
        options: { merge: true }
      })
      
      try {
        const page = pagination.item.currentPage + 1
        const pageSize = pagination.item.pageSize
        
        const response = await fetch(`/api/posts?page=${page}&pageSize=${pageSize}`)
        const data = await response.json()
        
        // Add posts to collection
        data.posts.forEach(post => {
          stateSetValue({
            name: 'feed/posts',
            value: post,
            options: { id: post.id }
          })
        })
        
        // Update pagination
        stateSetValue({
          name: 'feed/pagination',
          value: {
            currentPage: page,
            hasMore: data.hasMore,
            isLoading: false
          },
          options: { merge: true }
        })
        
        return { success: true, count: data.posts.length }
      } catch (error) {
        // Reset loading state on error
        stateSetValue({
          name: 'feed/pagination',
          value: { isLoading: false },
          options: { merge: true }
        })
        
        return { success: false, error: error.message }
      }
    },
    
    // Reset pagination
    resetPagination() {
      stateSetValue({
        name: 'feed/pagination',
        value: {
          currentPage: 0,
          hasMore: true,
          isLoading: false
        }
      })
      
      // Clear all posts
      const allPosts = stateGetValue({ name: 'feed/posts' })
      allPosts.item.forEach(post => {
        stateDeleteValue({
          name: 'feed/posts',
          id: post.id
        })
      })
    }
  }
})
```

### Usage

```javascript
// Load first page
await feedPlugin.loadNextPage()

// Load more on scroll
window.addEventListener('scroll', () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 1000) {
    feedPlugin.loadNextPage()
  }
})
```

### Benefits

- **Performance**: Loads only what's needed
- **Memory Efficient**: Doesn't load all data at once
- **Better UX**: Smooth scrolling experience

## Pattern 8: State Versioning

### Concept

Track state versions to enable features like undo/redo and state snapshots.

### Implementation

```javascript
createPlugin('document', {
  data: {
    history: [],
    historyIndex: -1,
    maxHistory: 50
  },
  state: {
    schema: {
      content: {
        type: 'object',
        properties: {
          text: { type: 'string', default: '' },
          version: { type: 'number', default: 0 }
        }
      }
    }
  },
  methods: {
    // Update content with versioning
    updateContent(newText) {
      // Get current state
      const current = stateGetValue({ name: 'document/content' })
      
      // Create new version
      const newVersion = current.item.version + 1
      
      // Update state
      stateSetValue({
        name: 'document/content',
        value: {
          text: newText,
          version: newVersion
        },
        options: { merge: true }
      })
      
      // Add to history
      this.addToHistory({
        text: newText,
        version: newVersion,
        timestamp: Date.now()
      })
    },
    
    // Add to history
    addToHistory(state) {
      // Remove any future states if we're not at the end
      if (this.historyIndex < this.history.length - 1) {
        this.history = this.history.slice(0, this.historyIndex + 1)
      }
      
      // Add new state
      this.history.push(state)
      
      // Limit history size
      if (this.history.length > this.maxHistory) {
        this.history.shift()
      } else {
        this.historyIndex++
      }
    },
    
    // Undo
    undo() {
      if (this.historyIndex <= 0) {
        return false
      }
      
      this.historyIndex--
      const state = this.history[this.historyIndex]
      
      stateSetValue({
        name: 'document/content',
        value: state,
        options: { merge: true }
      })
      
      return true
    },
    
    // Redo
    redo() {
      if (this.historyIndex >= this.history.length - 1) {
        return false
      }
      
      this.historyIndex++
      const state = this.history[this.historyIndex]
      
      stateSetValue({
        name: 'document/content',
        value: state,
        options: { merge: true }
      })
      
      return true
    },
    
    // Get current state
    getCurrentState() {
      return stateGetValue({ name: 'document/content' }).item
    },
    
    // Get history
    getHistory() {
      return {
        states: this.history,
        currentIndex: this.historyIndex,
        canUndo: this.historyIndex > 0,
        canRedo: this.historyIndex < this.history.length - 1
      }
    },
    
    // Clear history
    clearHistory() {
      this.history = []
      this.historyIndex = -1
    }
  }
})
```

### Usage

```javascript
// Update content
documentPlugin.updateContent('Hello World')
documentPlugin.updateContent('Hello Dooksa')
documentPlugin.updateContent('Hello Advanced Patterns')

// Undo
documentPlugin.undo()  // Reverts to 'Hello Dooksa'
documentPlugin.undo()  // Reverts to 'Hello World'

// Redo
documentPlugin.redo()  // Goes back to 'Hello Dooksa'

// Get history
const history = documentPlugin.getHistory()
console.log(history)
// {
//   states: [...],
//   currentIndex: 1,
//   canUndo: true,
//   canRedo: true
// }
```

### Benefits

- **Undo/Redo**: User-friendly editing
- **Debugging**: Track state changes over time
- **Recovery**: Restore previous states

## Pattern 9: State Normalization

### Concept

Store data in a normalized form (like a database) to avoid duplication and improve performance.

### Implementation

```javascript
createPlugin('blog', {
  state: {
    schema: {
      // Entities (normalized)
      users: {
        type: 'collection',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' }
          }
        }
      },
      posts: {
        type: 'collection',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            content: { type: 'string' },
            authorId: { type: 'string' }
          }
        }
      },
      comments: {
        type: 'collection',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            postId: { type: 'string' },
            authorId: { type: 'string' },
            content: { type: 'string' }
          }
        }
      },
      // Relationships (denormalized references)
      postAuthors: {
        type: 'object',
        properties: {}  // postId -> authorId mapping
      },
      commentAuthors: {
        type: 'object',
        properties: {}  // commentId -> authorId mapping
      }
    }
  },
  methods: {
    // Add user
    addUser(user) {
      stateSetValue({
        name: 'blog/users',
        value: user,
        options: { id: user.id }
      })
    },
    
    // Add post
    addPost(post) {
      stateSetValue({
        name: 'blog/posts',
        value: post,
        options: { id: post.id }
      })
      
      // Update relationship
      stateSetValue({
        name: 'blog/postAuthors',
        value: { [post.id]: post.authorId },
        options: { merge: true }
      })
    },
    
    // Add comment
    addComment(comment) {
      stateSetValue({
        name: 'blog/comments',
        value: comment,
        options: { id: comment.id }
      })
      
      // Update relationship
      stateSetValue({
        name: 'blog/commentAuthors',
        value: { [comment.id]: comment.authorId },
        options: { merge: true }
      })
    },
    
    // Get post with denormalized data
    getPostWithDetails(postId) {
      const post = stateGetValue({
        name: 'blog/posts',
        id: postId
      })
      
      if (post.isEmpty) {
        return null
      }
      
      // Get author
      const authorId = stateGetValue({
        name: 'blog/postAuthors',
        position: postId
      }).item
      
      const author = stateGetValue({
        name: 'blog/users',
        id: authorId
      })
      
      // Get comments
      const allComments = stateGetValue({ name: 'blog/comments' }).item
      const postComments = allComments.filter(c => c.postId === postId)
      
      // Denormalize for display
      return {
        ...post.item,
        author: author.item,
        comments: postComments.map(comment => {
          const commentAuthorId = stateGetValue({
            name: 'blog/commentAuthors',
            position: comment.id
          }).item
          
          const commentAuthor = stateGetValue({
            name: 'blog/users',
            id: commentAuthorId
          })
          
          return {
            ...comment,
            author: commentAuthor.item
          }
        })
      }
    }
  }
})
```

### Usage

```javascript
// Add data
blogPlugin.addUser({ id: 'user-1', name: 'John', email: 'john@example.com' })
blogPlugin.addPost({ id: 'post-1', title: 'Hello', content: 'World', authorId: 'user-1' })
blogPlugin.addComment({ id: 'comment-1', postId: 'post-1', authorId: 'user-1', content: 'Great!' })

// Get denormalized data
const post = blogPlugin.getPostWithDetails('post-1')
console.log(post)
// {
//   id: 'post-1',
//   title: 'Hello',
//   content: 'World',
//   authorId: 'user-1',
//   author: { id: 'user-1', name: 'John', email: 'john@example.com' },
//   comments: [
//     {
//       id: 'comment-1',
//       postId: 'post-1',
//       authorId: 'user-1',
//       content: 'Great!',
//       author: { id: 'user-1', name: 'John', email: 'john@example.com' }
//     }
//   ]
// }
```

### Benefits

- **No Duplication**: Data stored once
- **Consistency**: Updates propagate automatically
- **Performance**: Faster updates, slower reads (trade-off)

## Pattern 10: State Synchronization

### Concept

Keep state in sync across multiple tabs/windows or with a server.

### Implementation

```javascript
createPlugin('sync', {
  data: {
    syncInterval: 5000,
    syncTimer: null,
    lastSync: 0
  },
  state: {
    schema: {
      data: {
        type: 'object',
        properties: {
          items: { type: 'object' },
          version: { type: 'number', default: 0 },
          lastUpdated: { type: 'number', default: 0 }
        }
      }
    }
  },
  methods: {
    // Start periodic sync
    startSync() {
      if (this.syncTimer) {
        clearInterval(this.syncTimer)
      }
      
      this.syncTimer = setInterval(() => {
        this.syncWithServer()
      }, this.syncInterval)
    },
    
    // Stop sync
    stopSync() {
      if (this.syncTimer) {
        clearInterval(this.syncTimer)
        this.syncTimer = null
      }
    },
    
    // Sync with server
    async syncWithServer() {
      const data = stateGetValue({ name: 'sync/data' })
      
      try {
        const response = await fetch('/api/sync', {
          method: 'POST',
          body: JSON.stringify({
            version: data.item.version,
            data: data.item.items,
            lastUpdated: data.item.lastUpdated
          })
        })
        
        if (!response.ok) {
          throw new Error('Sync failed')
        }
        
        const result = await response.json()
        
        // Update local state with server data
        stateSetValue({
          name: 'sync/data',
          value: {
            items: result.data,
            version: result.version,
            lastUpdated: Date.now()
          },
          options: { merge: true }
        })
        
        this.lastSync = Date.now()
        
        return { success: true }
      } catch (error) {
        console.error('Sync error:', error)
        return { success: false, error: error.message }
      }
    },
    
    // Sync specific data
    async syncData(key, value) {
      const data = stateGetValue({ name: 'sync/data' })
      
      // Update local
      stateSetValue({
        name: 'sync/data',
        value: {
          items: { ...data.item.items, [key]: value },
          version: data.item.version + 1,
          lastUpdated: Date.now()
        },
        options: { merge: true }
      })
      
      // Sync with server
      return this.syncWithServer()
    }
  }
})
```

### Cross-Tab Synchronization

```javascript
createPlugin('tabSync', {
  data: {
    channel: null
  },
  state: {
    schema: {
      shared: {
        type: 'object',
        properties: {
          data: { type: 'object' },
          timestamp: { type: 'number' }
        }
      }
    }
  },
  methods: {
    // Initialize cross-tab sync
    init() {
      if (typeof BroadcastChannel !== 'undefined') {
        this.channel = new BroadcastChannel('dooksa-sync')
        
        this.channel.onmessage = (event) => {
          const { type, data } = event.data
          
          if (type === 'state-update') {
            // Update local state
            stateSetValue({
              name: 'tabSync/shared',
              value: data,
              options: { merge: true }
            })
          }
        }
      }
    },
    
    // Broadcast state update
    broadcast(data) {
      if (this.channel) {
        this.channel.postMessage({
          type: 'state-update',
          data: {
            ...data,
            timestamp: Date.now()
          }
        })
      }
    },
    
    // Update and broadcast
    updateAndBroadcast(key, value) {
      // Update local
      stateSetValue({
        name: 'tabSync/shared',
        value: { [key]: value },
        options: { merge: true }
      })
      
      // Broadcast to other tabs
      this.broadcast({ [key]: value })
    }
  }
})
```

### Usage

```javascript
// Start server sync
syncPlugin.startSync()

// Update data (will sync automatically)
syncPlugin.syncData('userPreferences', { theme: 'dark' })

// Cross-tab sync
tabSyncPlugin.init()

// Update in one tab
tabSyncPlugin.updateAndBroadcast('counter', 42)

// All other tabs will receive the update automatically
```

### Benefits

- **Real-time**: Changes propagate immediately
- **Consistency**: All tabs stay in sync
- **Offline Support**: Can sync when back online

## Performance Optimization Patterns

### Pattern 1: Lazy Loading

```javascript
createPlugin('lazy', {
  data: {
    loadedModules: new Set()
  },
  methods: {
    async loadModule(moduleName) {
      if (this.loadedModules.has(moduleName)) {
        return
      }
      
      // Load module dynamically
      const module = await import(`./modules/${moduleName}.js`)
      
      // Initialize module state
      module.init()
      
      this.loadedModules.add(moduleName)
    }
  }
})
```

### Pattern 2: Batch Updates

```javascript
createPlugin('batch', {
  data: {
    updateQueue: [],
    flushTimer: null,
    flushDelay: 100
  },
  methods: {
    // Queue update
    queueUpdate(collection, id, value) {
      this.updateQueue.push({ collection, id, value })
      
      if (!this.flushTimer) {
        this.flushTimer = setTimeout(() => {
          this.flushUpdates()
        }, this.flushDelay)
      }
    },
    
    // Flush queued updates
    flushUpdates() {
      if (this.updateQueue.length === 0) {
        return
      }
      
      // Group by collection
      const grouped = {}
      this.updateQueue.forEach(update => {
        if (!grouped[update.collection]) {
          grouped[update.collection] = []
        }
        grouped[update.collection].push(update)
      })
      
      // Apply updates
      Object.entries(grouped).forEach(([collection, updates]) => {
        updates.forEach(update => {
          stateSetValue({
            name: update.collection,
            value: update.value,
            options: { id: update.id, merge: true }
          })
        })
      })
      
      // Clear queue
      this.updateQueue = []
      this.flushTimer = null
    }
  }
})
```

### Pattern 3: Selective Rendering

```javascript
createPlugin('render', {
  data: {
    subscriptions: new Map()
  },
  methods: {
    // Subscribe to specific fields
    subscribe(collection, id, fields, callback) {
      const key = `${collection}:${id}`
      
      if (!this.subscriptions.has(key)) {
        this.subscriptions.set(key, {
          callbacks: [],
          fields: new Set(fields)
        })
      }
      
      const subscription = this.subscriptions.get(key)
      subscription.callbacks.push(callback)
      
      // Add listener
      const handlerId = stateAddListener({
        name: collection,
        id: id,
        on: 'update',
        handler: (value) => {
          // Check if subscribed fields changed
          const changedFields = this.getChangedFields(value.previous, value.item)
          const hasSubscribedChange = changedFields.some(f => subscription.fields.has(f))
          
          if (hasSubscribedChange) {
            subscription.callbacks.forEach(cb => cb(value))
          }
        }
      })
      
      return handlerId
    },
    
    getChangedFields(oldValue, newValue) {
      const changed = []
      
      for (const key in newValue) {
        if (oldValue[key] !== newValue[key]) {
          changed.push(key)
        }
      }
      
      return changed
    }
  }
})
```

## Best Practices

### 1. Keep State Minimal

```javascript
// Good - minimal state
{
  users: {
    'user-1': { id: 'user-1', name: 'John' }
  }
}

// Avoid - redundant data
{
  users: {
    'user-1': { id: 'user-1', name: 'John' }
  },
  userNames: {
    'user-1': 'John'  // Redundant
  }
}
```

### 2. Use Normalization for Complex Data

```javascript
// Good - normalized
{
  users: { 'user-1': { id: 'user-1', name: 'John' } },
  posts: { 'post-1': { id: 'post-1', authorId: 'user-1' } }
}

// Avoid - nested data
{
  posts: {
    'post-1': {
      id: 'post-1',
      author: { id: 'user-1', name: 'John' }  // Duplicated data
    }
  }
}
```

### 3. Cache Expensive Computations

```javascript
// Good - with cache
const cache = new Map()

function expensiveComputation(input) {
  if (cache.has(input)) {
    return cache.get(input)
  }
  
  const result = // ... expensive computation
  cache.set(input, result)
  return result
}

// Clear cache when needed
function clearCache() {
  cache.clear()
}
```

### 4. Use Transactions for Complex Updates

```javascript
// Good - transactional
async function updateUserAndPosts(userId, newUserData) {
  const transaction = { updates: [], rollback: [] }
  
  try {
    // Update user
    // Update posts
    // Update comments
    // All succeed or all fail
  } catch (error) {
    // Rollback everything
    await rollbackTransaction(transaction)
  }
}
```

### 5. Debounce Rapid Updates

```javascript
// Good - debounced
let timer
function handleSearch(query) {
  clearTimeout(timer)
  timer = setTimeout(() => {
    performSearch(query)
  }, 300)
}

// Avoid - immediate on every keystroke
function handleSearch(query) {
  performSearch(query)  // Too many API calls
}
```

## Next Steps

- Read [State Schema Guide](state-schema-guide.md) to learn about schema definitions
- Read [State Default Values Guide](state-default-values-guide.md) for default value configuration
- Read [State Data Types Guide](state-data-types-guide.md) for detailed type information
- Read [State Relationships Guide](state-relationships-guide.md) for relationship management
- Read [State Validation Guide](state-validation-guide.md) for validation rules
- Read [State Events and Listeners Guide](state-events-listeners-guide.md) for event handling