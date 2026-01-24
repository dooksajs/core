# Restore Functionality & Testing Patterns

This document covers the `restore()` function and testing patterns for Dooksa plugins.

## Overview

The `restore()` function is a development-only feature that resets a plugin to its original state. It's essential for writing clean, isolated tests.

## When to Use Restore

### Use Cases

1. **Isolating Tests**: Reset state between test cases
2. **Testing Side Effects**: Verify that operations can be reversed
3. **State Management**: Test state transitions and resets
4. **Mock Cleanup**: Clean up after mocking operations

### When NOT to Use

- **Production Code**: `restore()` only exists in DEV mode
- **Performance-Critical Code**: Restore adds overhead
- **Permanent State**: If state should persist, don't restore

## Basic Usage

### Simple Restore

```javascript
import { createPlugin } from '@dooksa/create-plugin'
import { test } from 'node:test'
import { strictEqual } from 'node:assert'

test('restore functionality', async (t) => {
  const plugin = createPlugin('counter', {
    metadata: { title: 'Counter' },
    data: {
      count: 0
    },
    methods: {
      increment() {
        this.count++
        return this.count
      }
    }
  })

  // Modify state
  plugin.counterIncrement()  // count = 1
  plugin.counterIncrement()  // count = 2

  // Restore to original state
  plugin.restore()

  // Verify state is reset
  strictEqual(plugin.counterIncrement(), 1)
})
```

### Restore with State

```javascript
const plugin = createPlugin('user', {
  metadata: { title: 'User Plugin' },
  state: {
    schema: {
      count: { type: 'number' },
      name: { type: 'string' }
    }
  },
  data: {
    count: 0,
    name: 'default'
  },
  methods: {
    increment() {
      this.count++
      return this.count
    },
    updateName(newName) {
      this.name = newName
      return this.name
    }
  }
})

// Modify state
plugin.userIncrement()           // count = 1
plugin.userUpdateName('updated')  // name = 'updated'

// Restore
plugin.restore()

// State is reset
strictEqual(plugin.userIncrement(), 1)      // count = 0 + 1
strictEqual(plugin.userUpdateName('test'), 'test')  // name = 'default' + update
```

## Testing Patterns

### Pattern 1: Isolated Test Cases

```javascript
import { test } from 'node:test'
import { strictEqual } from 'node:assert'

test('user plugin - isolated tests', async (t) => {
  const plugin = createPlugin('user', {
    metadata: { title: 'User Plugin' },
    data: {
      users: []
    },
    methods: {
      addUser(name) {
        const user = { id: Date.now(), name }
        this.users.push(user)
        return user
      },
      getUser(id) {
        return this.users.find(u => u.id === id)
      }
    }
  })

  await t.test('add user', () => {
    const user = plugin.userAddUser('John')
    strictEqual(plugin.userGetUser(user.id).name, 'John')
  })

  // Restore between tests
  plugin.restore()

  await t.test('add another user', () => {
    const user = plugin.userAddUser('Jane')
    strictEqual(plugin.userGetUser(user.id).name, 'Jane')
    strictEqual(plugin.users.length, 1)  // Only Jane, no John
  })
})
```

### Pattern 2: Testing Side Effects

```javascript
test('transaction rollback', async (t) => {
  const plugin = createPlugin('bank', {
    metadata: { title: 'Bank Plugin' },
    data: {
      balance: 1000,
      transactions: []
    },
    methods: {
      deposit(amount) {
        this.balance += amount
        this.transactions.push({ type: 'deposit', amount })
        return this.balance
      },
      withdraw(amount) {
        if (this.balance < amount) {
          throw new Error('Insufficient funds')
        }
        this.balance -= amount
        this.transactions.push({ type: 'withdraw', amount })
        return this.balance
      }
    }
  })

  // Successful transaction
  plugin.bankDeposit(500)
  strictEqual(plugin.balance, 1500)

  // Restore to verify rollback
  plugin.restore()
  strictEqual(plugin.balance, 1000)
  strictEqual(plugin.transactions.length, 0)
})
```

### Pattern 3: State Transition Testing

```javascript
test('state machine transitions', async (t) => {
  const plugin = createPlugin('stateMachine', {
    metadata: { title: 'State Machine' },
    data: {
      state: 'idle'
    },
    methods: {
      start() {
        if (this.state === 'idle') {
          this.state = 'running'
        }
        return this.state
      },
      stop() {
        if (this.state === 'running') {
          this.state = 'stopped'
        }
        return this.state
      },
      reset() {
        this.state = 'idle'
        return this.state
      }
    }
  })

  // Test valid transitions
  strictEqual(plugin.stateMachineStart(), 'running')
  strictEqual(plugin.stateMachineStop(), 'stopped')

  // Restore and test again
  plugin.restore()
  strictEqual(plugin.stateMachineStart(), 'running')
})
```

### Pattern 4: Error Recovery Testing

```javascript
test('error recovery', async (t) => {
  const plugin = createPlugin('processor', {
    metadata: { title: 'Data Processor' },
    data: {
      processed: [],
      errors: []
    },
    methods: {
      process(data) {
        try {
          // Simulate processing
          if (data === 'bad') {
            throw new Error('Invalid data')
          }
          this.processed.push(data)
          return { success: true, data }
        } catch (error) {
          this.errors.push({ data, error: error.message })
          return { success: false, error: error.message }
        }
      }
    }
  })

  // Process good data
  plugin.processorProcess('good')
  strictEqual(plugin.processed.length, 1)
  strictEqual(plugin.errors.length, 0)

  // Process bad data
  const result = plugin.processorProcess('bad')
  strictEqual(result.success, false)
  strictEqual(plugin.processed.length, 1)
  strictEqual(plugin.errors.length, 1)

  // Restore and verify clean state
  plugin.restore()
  strictEqual(plugin.processed.length, 0)
  strictEqual(plugin.errors.length, 0)
})
```

## Testing with Observable Instances

### Combined Restore and Mocking

```javascript
import { test } from 'node:test'
import { strictEqual } from 'node:assert'

test('combined restore and mocking', async (t) => {
  const plugin = createPlugin('api', {
    metadata: { title: 'API Plugin' },
    data: {
      cache: {},
      requests: []
    },
    methods: {
      async fetch(url) {
        // Simulate API call
        const response = await fetch(url)
        const data = await response.json()
        this.cache[url] = data
        this.requests.push({ url, timestamp: Date.now() })
        return data
      }
    }
  })

  // Create observable instance
  const observable = plugin.createObservableInstance(t)

  // Mock the fetch method
  observable.observe.fetch.mockImplementation(() => {
    return Promise.resolve({ id: 1, name: 'Test' })
  })

  // Call mocked method
  const result = await observable.testFetch('/api/test')
  strictEqual(result.id, 1)

  // Verify mock was called
  strictEqual(observable.observe.fetch.mock.calls.length, 1)

  // Restore to clean state
  plugin.restore()

  // After restore, the original implementation is restored
  // but the observable instance is separate
})
```

### Testing Mock Call History

```javascript
test('mock call history', async (t) => {
  const plugin = createPlugin('logger', {
    metadata: { title: 'Logger' },
    data: {
      logs: []
    },
    methods: {
      log(message) {
        this.logs.push({ message, timestamp: Date.now() })
        return message
      }
    }
  })

  const observable = plugin.createObservableInstance(t)

  // Call method multiple times
  observable.testLog('Message 1')
  observable.testLog('Message 2')
  observable.testLog('Message 3')

  // Verify call history
  strictEqual(observable.observe.log.mock.calls.length, 3)
  strictEqual(observable.observe.log.mock.calls[0].arguments[0], 'Message 1')
  strictEqual(observable.observe.log.mock.calls[1].arguments[0], 'Message 2')
  strictEqual(observable.observe.log.mock.calls[2].arguments[0], 'Message 3')

  // Restore
  plugin.restore()

  // After restore, original implementation is restored
  // Observable instance remains unchanged
})
```

## Advanced Testing Patterns

### Pattern 5: Multi-Plugin Integration

```javascript
test('multi-plugin integration', async (t) => {
  // Create dependent plugins
  const storagePlugin = createPlugin('storage', {
    metadata: { title: 'Storage' },
    data: {
      items: {}
    },
    methods: {
      set(key, value) {
        this.items[key] = value
        return value
      },
      get(key) {
        return this.items[key]
      }
    }
  })

  const userPlugin = createPlugin('user', {
    metadata: { title: 'User' },
    dependencies: [storagePlugin],
    methods: {
      saveUser(id, data) {
        return this.storageSet(id, data)
      },
      getUser(id) {
        return this.storageGet(id)
      }
    }
  })

  // Test integration
  userPlugin.userSaveUser('123', { name: 'John' })
  strictEqual(userPlugin.userGetUser('123').name, 'John')

  // Restore both plugins
  userPlugin.restore()
  storagePlugin.restore()

  // Verify both are reset
  strictEqual(userPlugin.userGetUser('123'), undefined)
})
```

### Pattern 6: Complex State Management

```javascript
test('complex state management', async (t) => {
  const plugin = createPlugin('shoppingCart', {
    metadata: { title: 'Shopping Cart' },
    state: {
      schema: {
        items: { type: 'array' },
        total: { type: 'number' },
        discount: { type: 'number' }
      }
    },
    data: {
      items: [],
      total: 0,
      discount: 0
    },
    methods: {
      addItem(item) {
        this.items.push(item)
        this.total += item.price
        return this.total
      },
      removeItem(id) {
        const index = this.items.findIndex(i => i.id === id)
        if (index !== -1) {
          const item = this.items.splice(index, 1)[0]
          this.total -= item.price
        }
        return this.total
      },
      applyDiscount(percent) {
        this.discount = percent
        this.total = this.total * (1 - percent / 100)
        return this.total
      }
    }
  })

  // Add items
  plugin.shoppingCartAddItem({ id: 1, price: 100 })
  plugin.shoppingCartAddItem({ id: 2, price: 200 })
  strictEqual(plugin.total, 300)

  // Apply discount
  plugin.shoppingCartApplyDiscount(10)
  strictEqual(plugin.total, 270)

  // Remove item
  plugin.shoppingCartRemoveItem(1)
  strictEqual(plugin.total, 180)

  // Restore to initial state
  plugin.restore()
  strictEqual(plugin.items.length, 0)
  strictEqual(plugin.total, 0)
  strictEqual(plugin.discount, 0)
})
```

### Pattern 7: Testing with Time-Based Operations

```javascript
test('time-based operations', async (t) => {
  const plugin = createPlugin('scheduler', {
    metadata: { title: 'Scheduler' },
    data: {
      tasks: [],
      lastRun: null
    },
    methods: {
      schedule(task, delay) {
        const runAt = Date.now() + delay
        this.tasks.push({ task, runAt })
        return runAt
      },
      runDueTasks() {
        const now = Date.now()
        const due = this.tasks.filter(t => t.runAt <= now)
        this.tasks = this.tasks.filter(t => t.runAt > now)
        this.lastRun = now
        return due
      }
    }
  })

  // Schedule tasks
  plugin.schedulerSchedule('task1', 1000)
  plugin.schedulerSchedule('task2', 2000)
  strictEqual(plugin.tasks.length, 2)

  // Run due tasks (simulating time passing)
  const due = plugin.schedulerRunDueTasks()
  strictEqual(due.length, 0)  // No tasks due yet

  // Restore to clean state
  plugin.restore()
  strictEqual(plugin.tasks.length, 0)
  strictEqual(plugin.lastRun, null)
})
```

## Best Practices

### 1. Restore After Each Test

```javascript
test('best practice - restore after each', async (t) => {
  const plugin = createPlugin('test', {
    // ... plugin definition
  })

  await t.test('test 1', () => {
    // Test logic
    plugin.restore()  // Restore after test
  })

  await t.test('test 2', () => {
    // Test logic
    plugin.restore()  // Restore after test
  })
})
```

### 2. Use Setup and Teardown

```javascript
import { before, after } from 'node:test'

test('setup and teardown', async (t) => {
  let plugin

  before(() => {
    plugin = createPlugin('test', {
      // ... plugin definition
    })
  })

  after(() => {
    plugin.restore()  // Clean up after all tests
  })

  await t.test('test 1', () => {
    // Use plugin
  })

  await t.test('test 2', () => {
    // Use plugin
  })
})
```

### 3. Document Restore Behavior

```javascript
test('documented restore behavior', async (t) => {
  const plugin = createPlugin('documented', {
    metadata: {
      title: 'Documented Plugin',
      description: 'Plugin with documented restore behavior'
    },
    data: {
      counter: 0
    },
    methods: {
      increment() {
        this.counter++
        return this.counter
      }
    }
  })

  await t.test('increment increases counter', () => {
    const result = plugin.documentedIncrement()
    strictEqual(result, 1)
    strictEqual(plugin.counter, 1)
  })

  // Restore to verify idempotency
  plugin.restore()

  await t.test('after restore, counter is reset', () => {
    strictEqual(plugin.counter, 0)
  })
})
```

### 4. Test Restore Itself

```javascript
test('restore functionality', async (t) => {
  const plugin = createPlugin('test', {
    data: { value: 0 },
    methods: {
      update(value) {
        this.value = value
        return this.value
      }
    }
  })

  await t.test('restore resets data', () => {
    plugin.testUpdate(42)
    strictEqual(plugin.value, 42)
    
    plugin.restore()
    strictEqual(plugin.value, 0)
  })

  await t.test('restore is idempotent', () => {
    plugin.restore()
    plugin.restore()
    strictEqual(plugin.value, 0)
  })
})
```

## Common Pitfalls

### Pitfall 1: Forgetting Restore in DEV Mode

```javascript
// ❌ Wrong - restore only works in DEV mode
const plugin = createPlugin('test', { /* ... */ })
plugin.restore()  // Will throw in production

// ✅ Correct - check for restore existence
if (typeof plugin.restore === 'function') {
  plugin.restore()
}
```

### Pitfall 2: Restoring Too Early

```javascript
// ❌ Wrong - restore before test completes
test('early restore', async (t) => {
  const plugin = createPlugin('test', { /* ... */ })
  
  plugin.testMethod()
  plugin.restore()  // Too early!
  
  // Test assertions here
})

// ✅ Correct - restore after assertions
test('proper restore', async (t) => {
  const plugin = createPlugin('test', { /* ... */ })
  
  plugin.testMethod()
  
  // Assertions
  t.assert(plugin.value === expected)
  
  // Then restore
  plugin.restore()
})
```

### Pitfall 3: Assuming Restore Resets Everything

```javascript
// ❌ Wrong - external state not reset
const externalState = { value: 0 }
const plugin = createPlugin('test', {
  methods: {
    updateExternal() {
      externalState.value = 42
    }
  }
})

plugin.testUpdateExternal()
plugin.restore()
// externalState.value is still 42!

// ✅ Correct - manage external state
const plugin = createPlugin('test', {
  data: {
    internalValue: 0
  },
  methods: {
    updateInternal() {
      this.internalValue = 42
    }
  }
})

plugin.testUpdateInternal()
plugin.restore()
// plugin.internalValue is 0
```

## Performance Considerations

### Restore Overhead

- **Data Reset**: Deep clone of data objects
- **Implementation Reset**: Function reference updates
- **Minimal Impact**: Only affects DEV mode

### When to Avoid Restore

1. **Large State Objects**: Deep cloning can be expensive
2. **Frequent Calls**: Restore in loops can slow tests
3. **Production Code**: Restore doesn't exist in production

### Optimization Tips

```javascript
// ❌ Inefficient - restore in loop
for (let i = 0; i < 1000; i++) {
  plugin.testMethod()
  plugin.restore()  // Called 1000 times!
}

// ✅ Efficient - restore once
for (let i = 0; i < 1000; i++) {
  plugin.testMethod()
}
plugin.restore()  // Called once
```

## Integration with Test Frameworks

### Node.js Test Runner

```javascript
import { test, before, after } from 'node:test'
import { strictEqual } from 'node:assert'

test('node test runner integration', async (t) => {
  let plugin

  before(() => {
    plugin = createPlugin('test', {
      // ... plugin definition
    })
  })

  after(() => {
    if (plugin.restore) {
      plugin.restore()
    }
  })

  await t.test('test case 1', () => {
    // Test logic
  })

  await t.test('test case 2', () => {
    // Test logic
  })
})
```

### Jest (if adapted)

```javascript
describe('plugin tests', () => {
  let plugin

  beforeEach(() => {
    plugin = createPlugin('test', {
      // ... plugin definition
    })
  })

  afterEach(() => {
    if (plugin.restore) {
      plugin.restore()
    }
  })

  test('test case 1', () => {
    // Test logic
  })

  test('test case 2', () => {
    // Test logic
  })
})
```

## Summary

The `restore()` function is a powerful tool for writing clean, isolated tests. Key takeaways:

1. **Use in DEV Mode**: Only available in development
2. **Reset State**: Restores data and implementations
3. **Isolate Tests**: Prevent test interference
4. **Test Side Effects**: Verify operations can be reversed
5. **Combine with Mocking**: Use with `createObservableInstance` for comprehensive testing

For more examples, see the test files in `packages/create-plugin/test/`.
