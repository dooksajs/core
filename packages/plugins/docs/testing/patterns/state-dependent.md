# State-Dependent Test Pattern

This guide covers testing plugins that manage state - the most common pattern for Dooksa plugins.

## 🎯 When to Use This Pattern

### ✅ Use State-Dependent Tests For:

- **Stateful plugins**: Plugins that read/write state
- **Configuration management**: Settings, preferences, options
- **Data persistence**: Storing and retrieving data
- **State transitions**: Testing state changes over time
- **Validation**: Checking state against rules

### ❌ Don't Use For:

- **Pure functions**: No state interaction (use simple tests)
- **Multiple dependencies**: Needs other plugins (use complex tests)
- **External services**: API calls, databases (use complex tests with mocking)

## 🏗️ Basic Structure

### Template

```javascript
import { describe, it, beforeEach, afterEach } from 'node:test'
import { strictEqual } from 'node:assert/strict'
import { mockPlugin } from '#mock'

describe('PluginName - State Operations', () => {
  let mock
  
  beforeEach(async function() {
    mock = await mockPlugin(this, { name: 'pluginName' })
  })
  
  afterEach(() => {
    if (mock) mock.restore()
  })
  
  it('should [affect state] when [action]', async () => {
    // Arrange: Setup initial state
    await mock.stateSetValue({
      name: 'pluginName/data',
      value: { count: 0 }
    })
    
    // Act: Perform action
    mock.plugin.pluginNameIncrement()
    
    // Assert: Check state
    const result = mock.stateGetValue({ name: 'pluginName/data' })
    strictEqual(result.item.count, 1)
  })
})
```

## 📋 Real-World Examples

### Example 1: Metadata Plugin (Language Management)

Based on the existing metadata tests, here's how to test state-dependent plugins:

```javascript
import { describe, it, beforeEach, afterEach } from 'node:test'
import { strictEqual, deepStrictEqual } from 'node:assert/strict'
import { mockPlugin, mockWindowLocationSearch } from '#mock'

describe('Metadata Plugin - Language Management', () => {
  let mock
  let restoreWindow
  
  beforeEach(async function() {
    // Mock window.location.search for URL parameter testing
    restoreWindow = mockWindowLocationSearch(this, '')
    
    // Create plugin mock
    mock = await mockPlugin(this, { name: 'metadata' })
  })
  
  afterEach(() => {
    if (mock) mock.restore()
    if (restoreWindow) restoreWindow()
  })

  describe('Setup', () => {
    it('should set default languages', async () => {
      mock.plugin.setup()
      
      const defaultLang = mock.stateGetValue({ name: 'metadata/defaultLanguage' })
      const currentLang = mock.stateGetValue({ name: 'metadata/currentLanguage' })
      const languages = mock.stateGetValue({ name: 'metadata/languages' })
      
      strictEqual(defaultLang.item, 'en')
      strictEqual(currentLang.item, '')
      deepStrictEqual(languages.item, ['en'])
    })

    it('should set current language from URL', async () => {
      restoreWindow = mockWindowLocationSearch(this, '?lang=fr')
      
      mock.plugin.setup({ languages: ['en', 'fr'] })
      
      const currentLang = mock.stateGetValue({ name: 'metadata/currentLanguage' })
      strictEqual(currentLang.item, 'fr')
    })

    it('should use custom default language', async () => {
      restoreWindow = mockWindowLocationSearch(this, '?lang=fr')
      
      mock.plugin.setup({
        defaultLanguage: 'fr',
        languages: ['en', 'fr']
      })
      
      const defaultLang = mock.stateGetValue({ name: 'metadata/defaultLanguage' })
      const currentLang = mock.stateGetValue({ name: 'metadata/currentLanguage' })
      
      strictEqual(defaultLang.item, 'fr')
      strictEqual(currentLang.item, '') // Should be empty since lang=fr equals default
    })

    it('should ignore invalid URL language', async () => {
      restoreWindow = mockWindowLocationSearch(this, '?lang=de')
      
      mock.plugin.setup({ languages: ['en', 'fr'] })
      
      const currentLang = mock.stateGetValue({ name: 'metadata/currentLanguage' })
      strictEqual(currentLang.item, '') // Should be empty
    })
  })

  describe('Language Changes', () => {
    beforeEach(async () => {
      mock.plugin.setup({ languages: ['en', 'fr', 'es'] })
    })

    it('should change current language', async () => {
      await mock.stateSetValue({
        name: 'metadata/currentLanguage',
        value: 'fr'
      })
      
      const currentLang = mock.stateGetValue({ name: 'metadata/currentLanguage' })
      strictEqual(currentLang.item, 'fr')
    })

    it('should revert to empty when setting invalid language', async () => {
      // Set valid language first
      await mock.stateSetValue({
        name: 'metadata/currentLanguage',
        value: 'fr'
      })
      
      // Try to set invalid language
      await mock.stateSetValue({
        name: 'metadata/currentLanguage',
        value: 'de'
      })
      
      const currentLang = mock.stateGetValue({ name: 'metadata/currentLanguage' })
      // Should revert to previous valid or empty
      strictEqual(currentLang.item === 'fr' || currentLang.item === '', true)
    })

    it('should revert to empty when setting default language', async () => {
      // Set valid language first
      await mock.stateSetValue({
        name: 'metadata/currentLanguage',
        value: 'fr'
      })
      
      // Try to set default language
      await mock.stateSetValue({
        name: 'metadata/currentLanguage',
        value: 'en'
      })
      
      const currentLang = mock.stateGetValue({ name: 'metadata/currentLanguage' })
      // Should revert to empty since default is not considered "current"
      strictEqual(currentLang.item === 'fr' || currentLang.item === '', true)
    })
  })

  describe('State Schema', () => {
    it('should have correct schema for currentLanguage', async () => {
      const schema = mock.stateGetSchema('metadata/currentLanguage')
      strictEqual(schema.type, 'string')
    })

    it('should have correct schema for defaultLanguage', async () => {
      const schema = mock.stateGetSchema('metadata/defaultLanguage')
      strictEqual(schema.type, 'string')
    })

    it('should have correct schema for languages', async () => {
      const schema = mock.stateGetSchema('metadata/languages')
      strictEqual(schema.type, 'array')
    })

    it('should have correct schema for plugins collection', async () => {
      const schema = mock.stateGetSchema('metadata/plugins')
      strictEqual(schema.type, 'collection')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty languages array', async () => {
      mock.plugin.setup({ languages: [] })
      
      const languages = mock.stateGetValue({ name: 'metadata/languages' })
      deepStrictEqual(languages.item, [])
    })

    it('should handle special characters in language codes', async () => {
      restoreWindow = mockWindowLocationSearch(this, '?lang=pt-BR')
      
      mock.plugin.setup({ languages: ['en', 'pt-BR'] })
      
      const currentLang = mock.stateGetValue({ name: 'metadata/currentLanguage' })
      strictEqual(currentLang.item, 'pt-BR')
    })

    it('should handle repeated setup calls', async () => {
      mock.plugin.setup({ languages: ['en', 'fr'] })
      mock.plugin.setup({ languages: ['en', 'fr', 'es'] })
      
      const languages = mock.stateGetValue({ name: 'metadata/languages' })
      deepStrictEqual(languages.item, ['en', 'fr', 'es'])
    })
  })
})
```

### Example 2: Counter Plugin

```javascript
describe('Counter Plugin', () => {
  let mock
  
  beforeEach(async function() {
    mock = await mockPlugin(this, { name: 'counter' })
  })
  
  afterEach(() => {
    mock.restore()
  })

  describe('Initial State', () => {
    it('should start at zero', () => {
      const count = mock.stateGetValue({ name: 'counter/count' })
      strictEqual(count.item, 0)
    })

    it('should have correct schema', () => {
      const schema = mock.stateGetSchema('counter/count')
      strictEqual(schema.type, 'number')
    })
  })

  describe('Increment', () => {
    it('should increase count by 1', () => {
      mock.plugin.counterIncrement()
      
      const count = mock.stateGetValue({ name: 'counter/count' })
      strictEqual(count.item, 1)
    })

    it('should increase count multiple times', () => {
      mock.plugin.counterIncrement()
      mock.plugin.counterIncrement()
      mock.plugin.counterIncrement()
      
      const count = mock.stateGetValue({ name: 'counter/count' })
      strictEqual(count.item, 3)
    })

    it('should work with initial state', async () => {
      await mock.stateSetValue({
        name: 'counter/count',
        value: 10
      })
      
      mock.plugin.counterIncrement()
      
      const count = mock.stateGetValue({ name: 'counter/count' })
      strictEqual(count.item, 11)
    })
  })

  describe('Decrement', () => {
    it('should decrease count by 1', async () => {
      await mock.stateSetValue({
        name: 'counter/count',
        value: 5
      })
      
      mock.plugin.counterDecrement()
      
      const count = mock.stateGetValue({ name: 'counter/count' })
      strictEqual(count.item, 4)
    })

    it('should handle negative counts', () => {
      mock.plugin.counterDecrement()
      
      const count = mock.stateGetValue({ name: 'counter/count' })
      strictEqual(count.item, -1)
    })
  })

  describe('Reset', () => {
    it('should reset to zero', async () => {
      await mock.stateSetValue({
        name: 'counter/count',
        value: 42
      })
      
      mock.plugin.counterReset()
      
      const count = mock.stateGetValue({ name: 'counter/count' })
      strictEqual(count.item, 0)
    })
  })
})
```

### Example 3: Cache Plugin

```javascript
describe('Cache Plugin', () => {
  let mock
  
  beforeEach(async function() {
    mock = await mockPlugin(this, { name: 'cache' })
  })
  
  afterEach(() => {
    mock.restore()
  })

  describe('Set/Get', () => {
    it('should store and retrieve values', async () => {
      await mock.stateSetValue({
        name: 'cache/entries',
        value: { 'key1': { value: 'data1', expires: Date.now() + 10000 } }
      })
      
      const result = mock.plugin.cacheGet({ key: 'key1' })
      strictEqual(result, 'data1')
    })

    it('should return null for expired entries', async () => {
      const past = Date.now() - 1000 // 1 second ago
      await mock.stateSetValue({
        name: 'cache/entries',
        value: { 'key1': { value: 'data1', expires: past } }
      })
      
      const result = mock.plugin.cacheGet({ key: 'key1' })
      strictEqual(result, null)
    })

    it('should return null for missing keys', () => {
      const result = mock.plugin.cacheGet({ key: 'nonexistent' })
      strictEqual(result, null)
    })
  })

  describe('Set Operation', () => {
    it('should add new entry', async () => {
      mock.plugin.cacheSet({ key: 'user1', value: { name: 'John' }, ttl: 60000 })
      
      const entries = mock.stateGetValue({ name: 'cache/entries' })
      strictEqual(entries.item.user1.value.name, 'John')
      ok(entries.item.user1.expires > Date.now())
    })

    it('should update existing entry', async () => {
      // Set initial
      await mock.stateSetValue({
        name: 'cache/entries',
        value: { 'user1': { value: { name: 'Old' }, expires: Date.now() + 10000 } }
      })
      
      // Update
      mock.plugin.cacheSet({ key: 'user1', value: { name: 'New' }, ttl: 60000 })
      
      const entries = mock.stateGetValue({ name: 'cache/entries' })
      strictEqual(entries.item.user1.value.name, 'New')
    })

    it('should handle TTL', async () => {
      const now = Date.now()
      mock.plugin.cacheSet({ key: 'temp', value: 'data', ttl: 5000 })
      
      const entries = mock.stateGetValue({ name: 'cache/entries' })
      const expires = entries.item.temp.expires
      ok(expires >= now + 5000 && expires <= now + 5100) // Allow small margin
    })
  })

  describe('Clear Operation', () => {
    it('should remove specific entry', async () => {
      await mock.stateSetValue({
        name: 'cache/entries',
        value: {
          'key1': { value: 'data1', expires: Date.now() + 10000 },
          'key2': { value: 'data2', expires: Date.now() + 10000 }
        }
      })
      
      mock.plugin.cacheClear({ key: 'key1' })
      
      const entries = mock.stateGetValue({ name: 'cache/entries' })
      strictEqual(entries.item.key1, undefined)
      strictEqual(entries.item.key2.value, 'data2')
    })

    it('should clear all entries', async () => {
      await mock.stateSetValue({
        name: 'cache/entries',
        value: {
          'key1': { value: 'data1', expires: Date.now() + 10000 },
          'key2': { value: 'data2', expires: Date.now() + 10000 }
        }
      })
      
      mock.plugin.cacheClearAll()
      
      const entries = mock.stateGetValue({ name: 'cache/entries' })
      strictEqual(Object.keys(entries.item).length, 0)
    })
  })

  describe('Cleanup', () => {
    it('should remove expired entries', async () => {
      const now = Date.now()
      await mock.stateSetValue({
        name: 'cache/entries',
        value: {
          'valid': { value: 'data1', expires: now + 10000 },
          'expired': { value: 'data2', expires: now - 1000 }
        }
      })
      
      mock.plugin.cacheCleanup()
      
      const entries = mock.stateGetValue({ name: 'cache/entries' })
      strictEqual(entries.item.valid.value, 'data1')
      strictEqual(entries.item.expired, undefined)
    })
  })
})
```

## 🎯 Testing Strategies

### 1. State Transition Testing

```javascript
describe('State Transitions', () => {
  it('should transition through multiple states', async () => {
    // Initial state
    strictEqual(mock.stateGetValue({ name: 'plugin/state' }).item, 'idle')
    
    // Transition 1
    mock.plugin.start()
    strictEqual(mock.stateGetValue({ name: 'plugin/state' }).item, 'running')
    
    // Transition 2
    mock.plugin.pause()
    strictEqual(mock.stateGetValue({ name: 'plugin/state' }).item, 'paused')
    
    // Transition 3
    mock.plugin.stop()
    strictEqual(mock.stateGetValue({ name: 'plugin/state' }).item, 'idle')
  })
})
```

### 2. Collection Management

```javascript
describe('Collection Operations', () => {
  it('should add items to collection', async () => {
    mock.plugin.addItem({ id: 'item1', data: 'test' })
    
    const collection = mock.stateGetValue({ name: 'plugin/items' })
    strictEqual(collection.item.item1.data, 'test')
  })

  it('should remove items from collection', async () => {
    await mock.stateSetValue({
      name: 'plugin/items',
      value: { 'item1': { data: 'test' }, 'item2': { data: 'test2' } }
    })
    
    mock.plugin.removeItem({ id: 'item1' })
    
    const collection = mock.stateGetValue({ name: 'plugin/items' })
    strictEqual(collection.item.item1, undefined)
    strictEqual(collection.item.item2.data, 'test2')
  })

  it('should update items in collection', async () => {
    await mock.stateSetValue({
      name: 'plugin/items',
      value: { 'item1': { data: 'old' } }
    })
    
    mock.plugin.updateItem({ id: 'item1', data: 'new' })
    
    const collection = mock.stateGetValue({ name: 'plugin/items' })
    strictEqual(collection.item.item1.data, 'new')
  })
})
```

### 3. Validation Testing

```javascript
describe('State Validation', () => {
  it('should reject invalid state values', async () => {
    // Try to set invalid value
    try {
      await mock.stateSetValue({
        name: 'plugin/number',
        value: 'not a number'
      })
      // Should throw or be rejected
      strictEqual(true, false, 'Should have thrown')
    } catch (error) {
      ok(error.message.includes('validation') || error.message.includes('type'))
    }
  })

  it('should enforce required fields', async () => {
    try {
      await mock.stateSetValue({
        name: 'plugin/object',
        value: { missing: 'required' }
      })
      strictEqual(true, false, 'Should have thrown')
    } catch (error) {
      ok(error.message.includes('required'))
    }
  })
})
```

## 🎨 Best Practices

### ✅ DO

1. **Always use beforeEach/afterEach**
   ```javascript
   beforeEach(async function() {
     mock = await mockPlugin(this, { name: 'plugin' })
   })
   
   afterEach(() => {
     mock.restore()
   })
   ```

2. **Test state isolation**
   ```javascript
   it('test 1', async () => {
     await mock.stateSetValue({ name: 'plugin/data', value: 1 })
     strictEqual(mock.stateGetValue({ name: 'plugin/data' }).item, 1)
   })
   
   it('test 2', () => {
     // Should start fresh, not have value from test 1
     strictEqual(mock.stateGetValue({ name: 'plugin/data' }).item, 0)
   })
   ```

3. **Use descriptive state names**
   ```javascript
   // Good
   await mock.stateSetValue({
     name: 'user/profile',
     value: { name: 'John' }
   })
   
   // Bad
   await mock.stateSetValue({
     name: 'data',
     value: { name: 'John' }
   })
   ```

4. **Test both read and write operations**
   ```javascript
   it('should write and read state', async () => {
     // Write
     await mock.stateSetValue({ name: 'plugin/config', value: { enabled: true } })
     
     // Read
     const config = mock.stateGetValue({ name: 'plugin/config' })
     strictEqual(config.item.enabled, true)
   })
   ```

### ❌ DON'T

1. **Don't share state between tests**
   ```javascript
   // ❌ Bad
   let sharedData
   
   beforeEach(async () => {
     sharedData = await setupData()
   })
   
   it('test 1', () => {
     modify(sharedData) // Affects test 2
   })
   
   it('test 2', () => {
     // Might fail because test 1 modified sharedData
   })
   ```

2. **Don't forget to await async operations**
   ```javascript
   // ❌ Bad
   mock.stateSetValue({ name: 'plugin/data', value: 1 }) // Missing await
   
   // ✅ Good
   await mock.stateSetValue({ name: 'plugin/data', value: 1 })
   ```

3. **Don't test the mock system itself**
   ```javascript
   // ❌ Bad
   it('should use mockPlugin correctly', () => {
     // Testing the mock, not your plugin
   })
   
   // ✅ Good
   it('should store user data', () => {
     // Testing your plugin's behavior
   })
   ```

## 🚀 Complete Example: User Session Plugin

```javascript
import { describe, it, beforeEach, afterEach } from 'node:test'
import { strictEqual, ok, throws } from 'node:assert/strict'
import { mockPlugin } from '#mock'

describe('User Session Plugin', () => {
  let mock
  
  beforeEach(async function() {
    mock = await mockPlugin(this, { name: 'session' })
  })
  
  afterEach(() => {
    mock.restore()
  })

  describe('Login/Logout', () => {
    it('should create session on login', async () => {
      const user = { id: 'user1', name: 'John Doe' }
      mock.plugin.sessionLogin({ user })
      
      const session = mock.stateGetValue({ name: 'session/current' })
      strictEqual(session.item.user.id, 'user1')
      strictEqual(session.item.user.name, 'John Doe')
      ok(session.item.token)
    })

    it('should clear session on logout', async () => {
      await mock.stateSetValue({
        name: 'session/current',
        value: { user: { id: 'user1' }, token: 'abc123' }
      })
      
      mock.plugin.sessionLogout()
      
      const session = mock.stateGetValue({ name: 'session/current' })
      strictEqual(session.item, null)
    })

    it('should handle multiple logins', async () => {
      mock.plugin.sessionLogin({ user: { id: 'user1', name: 'John' } })
      mock.plugin.sessionLogin({ user: { id: 'user2', name: 'Jane' } })
      
      const session = mock.stateGetValue({ name: 'session/current' })
      strictEqual(session.item.user.id, 'user2')
      strictEqual(session.item.user.name, 'Jane')
    })
  })

  describe('Session Validation', () => {
    it('should check if user is logged in', async () => {
      // Not logged in
      strictEqual(mock.plugin.sessionIsLoggedIn(), false)
      
      // Logged in
      await mock.stateSetValue({
        name: 'session/current',
        value: { user: { id: 'user1' }, token: 'abc' }
      })
      
      strictEqual(mock.plugin.sessionIsLoggedIn(), true)
    })

    it('should get current user', async () => {
      await mock.stateSetValue({
        name: 'session/current',
        value: { user: { id: 'user1', name: 'John' }, token: 'abc' }
      })
      
      const user = mock.plugin.sessionGetUser()
      strictEqual(user.id, 'user1')
      strictEqual(user.name, 'John')
    })

    it('should return null when no session', () => {
      const user = mock.plugin.sessionGetUser()
      strictEqual(user, null)
    })
  })

  describe('Session Expiration', () => {
    it('should handle expired sessions', async () => {
      const past = Date.now() - 10000 // 10 seconds ago
      await mock.stateSetValue({
        name: 'session/current',
        value: { 
          user: { id: 'user1' }, 
          token: 'abc',
          expires: past
        }
      })
      
      const isValid = mock.plugin.sessionIsValid()
      strictEqual(isValid, false)
    })

    it('should handle valid sessions', async () => {
      const future = Date.now() + 60000 // 1 minute from now
      await mock.stateSetValue({
        name: 'session/current',
        value: { 
          user: { id: 'user1' }, 
          token: 'abc',
          expires: future
        }
      })
      
      const isValid = mock.plugin.sessionIsValid()
      strictEqual(isValid, true)
    })
  })

  describe('State Schema', () => {
    it('should have correct schema for current session', () => {
      const schema = mock.stateGetSchema('session/current')
      strictEqual(schema.type, 'object')
    })

    it('should have correct schema for sessions collection', () => {
      const schema = mock.stateGetSchema('session/sessions')
      strictEqual(schema.type, 'collection')
    })
  })

  describe('Edge Cases', () => {
    it('should handle login with null user', () => {
      throws(() => {
        mock.plugin.sessionLogin({ user: null })
      }, /invalid user/i)
    })

    it('should handle logout when not logged in', () => {
      // Should not throw
      mock.plugin.sessionLogout()
      
      const session = mock.stateGetValue({ name: 'session/current' })
      strictEqual(session.item, null)
    })

    it('should handle concurrent sessions', async () => {
      await mock.stateSetValue({
        name: 'session/sessions',
        value: {
          'session1': { user: { id: 'user1' }, token: 'abc' },
          'session2': { user: { id: 'user2' }, token: 'def' }
        }
      })
      
      const sessions = mock.plugin.sessionGetAll()
      strictEqual(sessions.length, 2)
    })
  })
})
```

## 🎓 Learning Checklist

- [ ] Understand state lifecycle (setup, read, write, cleanup)
- [ ] Master beforeEach/afterEach patterns
- [ ] Test state isolation between tests
- [ ] Handle async state operations properly
- [ ] Test state transitions
- [ ] Validate state schema
- [ ] Handle edge cases and errors
- [ ] Use descriptive state names

## 🚀 Next Steps

Ready for more complexity?

1. **[Complex Tests](./complex.md)** - Testing with multiple dependencies
2. **[Mocking](../mocking.md)** - Advanced mocking techniques
3. **[Best Practices](../best-practices.md)** - Optimization and patterns

---

**Practice time!** Take a stateful plugin from your codebase and write comprehensive tests using this pattern.
