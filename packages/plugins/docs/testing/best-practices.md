# Testing Best Practices for Dooksa Plugins

This guide covers essential best practices for writing effective, maintainable, and performant tests for Dooksa plugins.

## 🎯 Core Principles

### 1. Test Behavior, Not Implementation

**Good**: Test what the plugin does
```javascript
it('should return user data when authenticated', async () => {
  const mock = await mockPlugin(t, { name: 'user' })
  await mock.stateSetValue({
    name: 'user/session',
    value: { authenticated: true, id: 'user123' }
  })
  
  const result = mock.plugin.userGetCurrent()
  strictEqual(result.id, 'user123')
})
```

**Bad**: Test how it works internally
```javascript
it('should call internal method', async () => {
  const mock = await mockPlugin(t, { name: 'user' })
  
  // Testing implementation details
  mock.plugin.internalMethod()
  strictEqual(mock.plugin.internalMethod.mock.calls.length, 1)
})
```

### 2. One Concept Per Test

**Good**: Focused, single-purpose tests
```javascript
describe('user plugin - login', () => {
  it('should authenticate with valid credentials', async () => {
    // Test one thing
  })
  
  it('should reject invalid password', async () => {
    // Test another thing
  })
  
  it('should handle network errors', async () => {
    // Test error case
  })
})
```

**Bad**: Testing multiple concepts in one test
```javascript
it('should handle login, validation, and errors', async () => {
  // Testing too many things
  // Hard to debug when it fails
})
```

### 3. Use Descriptive Names

**Good**: Clear, descriptive test names
```javascript
describe('variable plugin - scope resolution', () => {
  it('should search through parent scopes when variable not found in current scope')
  it('should apply prefix and suffix to variable names')
  it('should handle nested object paths with dot notation')
})
```

**Bad**: Vague or cryptic names
```javascript
describe('variable', () => {
  it('test1')
  it('works')
  it('handles stuff')
})
```

## 🏗️ Test Structure Best Practices

### 1. Proper Setup and Teardown

```javascript
describe('PluginName', () => {
  let mock
  let restoreWindow
  
  beforeEach(async function() {
    // Setup: Create fresh mock for each test
    restoreWindow = mockWindowLocationSearch(this, '')
    mock = await mockPlugin(this, { name: 'pluginName' })
  })
  
  afterEach(() => {
    // Teardown: Clean up in reverse order
    if (mock) mock.restore()
    if (restoreWindow) restoreWindow()
  })
  
  // Tests here...
})
```

### 2. Use AAA Pattern

**Arrange**: Setup test data and state
**Act**: Execute the operation
**Assert**: Verify the result

```javascript
it('should increment counter', async () => {
  // Arrange
  const mock = await mockPlugin(t, { name: 'counter' })
  await mock.stateSetValue({ name: 'counter/count', value: 5 })
  
  // Act
  mock.plugin.counterIncrement()
  
  // Assert
  const result = mock.stateGetValue({ name: 'counter/count' })
  strictEqual(result.item, 6)
  
  mock.restore()
})
```

### 3. Group Related Tests

```javascript
describe('User Plugin', () => {
  describe('Authentication', () => {
    // Auth-related tests
  })
  
  describe('Profile Management', () => {
    // Profile-related tests
  })
  
  describe('Session Management', () => {
    // Session-related tests
  })
})
```

## 🎨 Mocking Best Practices

### 1. Mock at the Right Level

**Good**: Mock external dependencies
```javascript
const mockApi = t.mock.fn(() => Promise.resolve({ data: 'test' }))
mock = await mockPlugin(t, {
  name: 'myPlugin',
  namedExports: { apiCall: mockApi }
})
```

**Bad**: Mock everything
```javascript
// Don't mock internal plugin methods unless necessary
mock.plugin.internalMethod = t.mock.fn() // ❌
```

### 2. Use Mock Utilities

**Good**: Use provided utilities
```javascript
const mockGetValue = createMockGetValue(t)
const mockGenerateId = createMockGenerateId(t)
```

**Bad**: Recreate mocks manually
```javascript
const mockGetValue = t.mock.fn((value, query) => {
  // Manual implementation
})
```

### 3. Verify Mock Interactions

```javascript
it('should call dependency correctly', async () => {
  const mockDependency = t.mock.fn(() => 'result')
  
  const mock = await mockPlugin(t, {
    name: 'plugin',
    namedExports: { dependency: mockDependency }
  })
  
  mock.plugin.action()
  
  // Verify
  strictEqual(mockDependency.mock.calls.length, 1)
  strictEqual(mockDependency.mock.calls[0].arguments[0], expected)
})
```

## 🚀 Performance Best Practices

### 1. Minimize Setup Overhead

**Good**: Share setup where possible
```javascript
describe('Plugin', () => {
  let mock
  
  beforeEach(async function() {
    // Only setup what's needed
    mock = await mockPlugin(this, { name: 'plugin' })
  })
  
  afterEach(() => {
    mock.restore()
  })
})
```

**Bad**: Unnecessary setup in each test
```javascript
it('test1', async () => {
  const mock = await mockPlugin(t, { name: 'plugin' })
  // ... test
  mock.restore()
})

it('test2', async () => {
  const mock = await mockPlugin(t, { name: 'plugin' })
  // ... test
  mock.restore()
})
```

### 2. Use Appropriate Test Complexity

```javascript
// Simple test - fast
describe('Simple operations', () => {
  it('should add numbers', () => {
    strictEqual(add(2, 3), 5)
  })
})

// Complex test - slower but necessary
describe('Complex operations', () => {
  let mock
  
  beforeEach(async function() {
    mock = await mockPlugin(this, { name: 'complex' })
  })
  
  afterEach(() => {
    mock.restore()
  })
  
  it('should handle multi-plugin integration', async () => {
    // Complex setup
  })
})
```

### 3. Clean Up Resources

```javascript
afterEach(() => {
  // Always clean up
  if (mock) mock.restore()
  if (restoreWindow) restoreWindow()
  if (timer) timer[Symbol.dispose]() // If using timers
})
```

## 🔍 Error Handling Best Practices

### 1. Test Error Cases

```javascript
describe('Error handling', () => {
  it('should throw on invalid input', () => {
    throws(() => {
      plugin.validateInput(null)
    }, /invalid input/i)
  })
  
  it('should handle async errors', async () => {
    const mock = await mockPlugin(t, { name: 'plugin' })
    
    // Mock to fail
    const mockApi = t.mock.fn(() => Promise.reject(new Error('API error')))
    
    const result = await mock.plugin.action(mockApi)
    
    strictEqual(result.success, false)
    ok(result.error.includes('API error'))
  })
})
```

### 2. Graceful Degradation

```javascript
it('should handle missing dependencies', async () => {
  const mock = await mockPlugin(t, {
    name: 'plugin',
    namedExports: {
      // Missing some dependencies
    }
  })
  
  // Should not throw, but handle gracefully
  const result = mock.plugin.action()
  strictEqual(result.success, false)
})
```

## 📋 State Management Best Practices

### 1. Test State Isolation

```javascript
describe('State isolation', () => {
  it('test 1', async () => {
    const mock = await mockPlugin(t, { name: 'plugin' })
    await mock.stateSetValue({ name: 'plugin/data', value: 1 })
    strictEqual(mock.stateGetValue({ name: 'plugin/data' }).item, 1)
  })
  
  it('test 2', async () => {
    const mock = await mockPlugin(t, { name: 'plugin' })
    // Should start fresh
    strictEqual(mock.stateGetValue({ name: 'plugin/data' }).item, 0)
  })
})
```

### 2. Use Descriptive State Names

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

### 3. Test State Transitions

```javascript
it('should transition through states', async () => {
  const mock = await mockPlugin(t, { name: 'stateMachine' })
  
  // Initial state
  strictEqual(mock.stateGetValue({ name: 'stateMachine/state' }).item, 'idle')
  
  // Transition 1
  mock.plugin.start()
  strictEqual(mock.stateGetValue({ name: 'stateMachine/state' }).item, 'running')
  
  // Transition 2
  mock.plugin.stop()
  strictEqual(mock.stateGetValue({ name: 'stateMachine/state' }).item, 'idle')
})
```

## 🎭 Async Best Practices

### 1. Always Await Async Operations

```javascript
// Good
await mock.plugin.asyncAction()
await mock.stateSetValue({ name: 'data', value: 1 })

// Bad
mock.plugin.asyncAction() // Missing await
mock.stateSetValue({ name: 'data', value: 1 }) // Missing await
```

### 2. Handle Promise Rejections

```javascript
it('should handle async errors', async () => {
  const mock = await mockPlugin(t, { name: 'plugin' })
  
  // Mock to reject
  const mockApi = t.mock.fn(() => Promise.reject(new Error('fail')))
  
  try {
    await mock.plugin.action(mockApi)
    strictEqual(true, false, 'Should have thrown')
  } catch (error) {
    ok(error.message.includes('fail'))
  }
})
```

### 3. Use Async/Await Consistently

```javascript
// Good - consistent style
it('should work', async () => {
  const mock = await mockPlugin(t, { name: 'plugin' })
  const result = await mock.plugin.action()
  strictEqual(result, expected)
})

// Mixed styles - confusing
it('should work', async () => {
  const mock = await mockPlugin(t, { name: 'plugin' })
  return mock.plugin.action().then(result => {
    strictEqual(result, expected)
  })
})
```

## 📊 Coverage Best Practices

### 1. Test Happy Path

```javascript
it('should work with valid input', async () => {
  const mock = await mockPlugin(t, { name: 'plugin' })
  const result = mock.plugin.action('valid-input')
  strictEqual(result.success, true)
})
```

### 2. Test Edge Cases

```javascript
describe('Edge cases', () => {
  it('should handle null', async () => {
    const mock = await mockPlugin(t, { name: 'plugin' })
    const result = mock.plugin.action(null)
    // Verify behavior
  })
  
  it('should handle undefined', async () => {
    const mock = await mockPlugin(t, { name: 'plugin' })
    const result = mock.plugin.action(undefined)
    // Verify behavior
  })
  
  it('should handle empty string', async () => {
    const mock = await mockPlugin(t, { name: 'plugin' })
    const result = mock.plugin.action('')
    // Verify behavior
  })
  
  it('should handle zero', async () => {
    const mock = await mockPlugin(t, { name: 'plugin' })
    const result = mock.plugin.action(0)
    // Verify behavior
  })
  
  it('should handle empty array', async () => {
    const mock = await mockPlugin(t, { name: 'plugin' })
    const result = mock.plugin.action([])
    // Verify behavior
  })
  
  it('should handle empty object', async () => {
    const mock = await mockPlugin(t, { name: 'plugin' })
    const result = mock.plugin.action({})
    // Verify behavior
  })
})
```

### 3. Test Error Conditions

```javascript
describe('Error conditions', () => {
  it('should throw on invalid type', () => {
    throws(() => plugin.action('invalid'), /type error/)
  })
  
  it('should throw on missing required field', () => {
    throws(() => plugin.action({}), /required/)
  })
  
  it('should throw on network failure', async () => {
    const mock = await mockPlugin(t, { name: 'plugin' })
    const mockApi = t.mock.fn(() => Promise.reject(new Error('Network error')))
    const result = await mock.plugin.action(mockApi)
    strictEqual(result.success, false)
  })
})
```

## 🎯 Maintainability Best Practices

### 1. Extract Common Setup

```javascript
describe('Plugin', () => {
  let mock
  
  beforeEach(async function() {
    mock = await createStandardMock(this)
  })
  
  afterEach(() => {
    cleanupMock(mock)
  })
})

// Helper functions
async function createStandardMock(t) {
  const mockGetValue = createMockGetValue(t)
  const mock = await mockPlugin(t, {
    name: 'plugin',
    namedExports: { getValue: mockGetValue }
  })
  return mock
}

function cleanupMock(mock) {
  if (mock) mock.restore()
}
```

### 2. Use Constants

```javascript
// Good
const TEST_USER = { id: 'user123', name: 'Test User' }
const TEST_SCOPE = 'test-scope'

it('should work with test user', async () => {
  await mock.stateSetValue({
    name: 'user/data',
    value: TEST_USER
  })
})

// Bad
it('should work with test user', async () => {
  await mock.stateSetValue({
    name: 'user/data',
    value: { id: 'user123', name: 'Test User' } // Magic values
  })
})
```

### 3. Document Complex Tests

```javascript
it('should handle complex multi-scope variable resolution', async () => {
  // This test verifies that variables are resolved correctly
  // when they span multiple scopes with different priorities:
  // 1. Current scope
  // 2. Parent scope
  // 3. Root scope
  
  const mock = await mockPlugin(t, { name: 'variable' })
  
  // Setup: Create three scopes
  await mock.stateSetValue({
    name: 'variable/scopes',
    value: ['child', 'parent', 'root'],
    options: { id: 'context' }
  })
  
  // Setup: Add values to each scope
  // ... complex setup
  
  // Act: Query variable
  const result = mock.plugin.variableGetValue({ query: 'var' })
  
  // Assert: Should find in parent scope
  strictEqual(result, 'parent-value')
})
```

## 🔧 Debugging Best Practices

### 1. Use Descriptive Assertions

```javascript
// Good
strictEqual(result.id, 'user123', 'User ID should match')
strictEqual(result.name, 'John', 'User name should be John')

// Bad
strictEqual(result.id, 'user123')
strictEqual(result.name, 'John')
```

### 2. Log Test State

```javascript
it('should debug complex scenario', async () => {
  const mock = await mockPlugin(t, { name: 'plugin' })
  
  // Setup
  await mock.stateSetValue({ name: 'plugin/data', value: { test: 1 } })
  
  // Log state before action
  console.log('Before:', mock.stateGetValue({ name: 'plugin/data' }))
  
  // Action
  mock.plugin.action()
  
  // Log state after action
  console.log('After:', mock.stateGetValue({ name: 'plugin/data' }))
  
  // Assert
  const result = mock.stateGetValue({ name: 'plugin/data' })
  strictEqual(result.item.test, 2)
})
```

### 3. Test in Isolation

```javascript
// Run single test to debug
describe('Plugin', () => {
  it('should work', async () => {
    // Focus on this test
  })
  
  // Comment out others temporarily
  // it('should also work', async () => { ... })
})
```

## 📝 Code Quality Best Practices

### 1. Consistent Formatting

```javascript
// Good - consistent style
describe('Plugin', () => {
  let mock
  
  beforeEach(async function() {
    mock = await mockPlugin(this, { name: 'plugin' })
  })
  
  afterEach(() => {
    mock.restore()
  })
  
  it('should do something', async () => {
    const result = await mock.plugin.action()
    strictEqual(result, expected)
  })
})
```

### 2. Remove Console Logs

```javascript
// ❌ Bad - debug code left in tests
it('should work', async () => {
  console.log('debug:', result) // Remove before commit
  strictEqual(result, expected)
})

// ✅ Good - clean tests
it('should work', async () => {
  const result = await mock.plugin.action()
  strictEqual(result, expected)
})
```

### 3. No Test Dependencies

```javascript
// ❌ Bad - test depends on previous test
it('test 1', async () => {
  sharedData = await setup()
})

it('test 2', async () => {
  // Depends on test 1
  use(sharedData)
})

// ✅ Good - independent tests
it('test 1', async () => {
  const data = await setup()
  // ...
})

it('test 2', async () => {
  const data = await setup() // Fresh setup
  // ...
})
```

## 🎓 Complete Best Practices Example

```javascript
import { describe, it, beforeEach, afterEach } from 'node:test'
import { strictEqual, ok, throws } from 'node:assert/strict'
import { mockPlugin, createMockGetValue } from '#mock'

describe('User Plugin - Best Practices Example', () => {
  // 1. Declare at appropriate scope
  let mock
  let mockGetValue
  
  // 2. Setup before each test
  beforeEach(async function() {
    // 3. Create mocks
    mockGetValue = createMockGetValue(this)
    
    // 4. Create plugin with dependencies
    mock = await mockPlugin(this, {
      name: 'user',
      namedExports: { getValue: mockGetValue }
    })
    
    // 5. Setup common state
    await mock.stateSetValue({
      name: 'user/config',
      value: { apiBase: '/api' }
    })
  })
  
  // 6. Cleanup after each test
  afterEach(() => {
    if (mock) mock.restore()
  })
  
  // 7. Descriptive describe blocks
  describe('Authentication', () => {
    // 8. Descriptive test names
    it('should authenticate with valid credentials', async () => {
      // Arrange
      const credentials = { email: 'test@example.com', password: 'secret' }
      
      // Act
      const result = await mock.plugin.userLogin(credentials)
      
      // Assert
      strictEqual(result.success, true)
      ok(result.token)
    })
    
    it('should reject invalid password', async () => {
      // Arrange
      const credentials = { email: 'test@example.com', password: 'wrong' }
      
      // Act
      const result = await mock.plugin.userLogin(credentials)
      
      // Assert
      strictEqual(result.success, false)
      ok(result.error.includes('password'))
    })
    
    it('should handle network errors', async () => {
      // Arrange - Mock API to fail
      const mockApi = this.mock.fn(() => 
        Promise.reject(new Error('Network error'))
      )
      
      // Act
      const result = await mock.plugin.userLoginWithApi(mockApi)
      
      // Assert
      strictEqual(result.success, false)
      ok(result.error.includes('Network error'))
    })
  })
  
  describe('Profile Management', () => {
    it('should get user profile', async () => {
      // Arrange
      await mock.stateSetValue({
        name: 'user/profile',
        value: { id: 'user123', name: 'John' }
      })
      
      // Act
      const profile = mock.plugin.userGetProfile()
      
      // Assert
      strictEqual(profile.id, 'user123')
      strictEqual(profile.name, 'John')
    })
    
    it('should update user profile', async () => {
      // Arrange
      const updates = { name: 'Jane' }
      
      // Act
      const result = await mock.plugin.userUpdateProfile(updates)
      
      // Assert
      strictEqual(result.success, true)
      
      // Verify state was updated
      const profile = mock.stateGetValue({ name: 'user/profile' })
      strictEqual(profile.item.name, 'Jane')
    })
  })
  
  describe('Edge Cases', () => {
    it('should handle null input', () => {
      throws(() => {
        mock.plugin.validateUser(null)
      }, /invalid user/i)
    })
    
    it('should handle empty profile', async () => {
      await mock.stateSetValue({
        name: 'user/profile',
        value: {}
      })
      
      const result = mock.plugin.userGetProfile()
      strictEqual(result, null)
    })
    
    it('should handle missing token', async () => {
      const result = await mock.plugin.userVerify()
      strictEqual(result.valid, false)
    })
  })
})
```

## 🚀 Performance Optimization

### 1. Minimize Mock Creation

```javascript
// Good - Create once per describe
describe('Plugin', () => {
  let mock
  
  beforeEach(async function() {
    mock = await mockPlugin(this, { name: 'plugin' })
  })
  
  afterEach(() => {
    mock.restore()
  })
})
```

### 2. Use Simple State

```javascript
// Good - Minimal state
await mock.stateSetValue({
  name: 'plugin/config',
  value: { enabled: true }
})

// Avoid unnecessary complexity
```

### 3. Skip Unnecessary Tests

```javascript
// Good - Only test what's needed
describe('Plugin', () => {
  it('should work with valid input', () => {
    // Essential test
  })
  
  // Don't test every possible combination
  // unless it's critical
})
```

## 📋 Checklist

Before committing tests, verify:

- [ ] **Naming**: Are test names descriptive?
- [ ] **Isolation**: Do tests run independently?
- [ ] **Cleanup**: Is everything restored in afterEach?
- [ ] **Assertions**: Are all outcomes verified?
- [ ] **Edge Cases**: Are null, undefined, empty values tested?
- [ ] **Errors**: Are error conditions covered?
- [ ] **Async**: Are all async operations awaited?
- [ ] **Mocking**: Are mocks necessary and appropriate?
- [ ] **Performance**: Is setup minimal and efficient?
- [ ] **Readability**: Is the code clear and maintainable?

## 🎯 Summary

**DO:**
- ✅ Test behavior, not implementation
- ✅ Use descriptive names
- ✅ Keep tests independent
- ✅ Clean up properly
- ✅ Test edge cases and errors
- ✅ Use AAA pattern
- ✅ Mock external dependencies
- ✅ Keep tests focused

**DON'T::**
- ❌ Test internal details
- ❌ Share state between tests
- ❌ Forget cleanup
- ❌ Test too many things at once
- ❌ Use magic numbers
- ❌ Leave debug code
- ❌ Over-mock
- ❌ Skip error testing

---

**Next**: [Troubleshooting Guide](./troubleshooting.md) - Common issues and solutions
