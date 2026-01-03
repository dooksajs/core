# Mocking Strategies for Dooksa Plugins

This guide covers advanced mocking techniques for testing Dooksa plugins, from basic mocks to complex dependency injection patterns.

## 🎯 What is Mocking?

Mocking is the practice of replacing real dependencies with controlled substitutes during testing. This allows you to:

- **Isolate** the code under test
- **Control** external behavior
- **Verify** interactions
- **Simulate** edge cases

## 🏗️ Mocking Hierarchy

```
Basic Mocks → Plugin Mocks → Named Exports → Advanced Patterns
```

## 🔧 Basic Mocking Tools

### 1. Node.js Built-in Mocking

Node.js provides native mocking capabilities:

```javascript
// Mock a function
const mockFn = t.mock.fn(() => 'result')

// Mock a module
t.mock.module('#client', {
  namedExports: {
    someFunction: mockFn
  }
})

// Restore mocks
t.mock.reset()
```

### 2. Dooksa Mock Utilities

The `#mock` package provides specialized utilities:

```javascript
import { 
  mockPlugin, 
  createMockGetValue, 
  createMockGenerateId,
  mockWindowLocationSearch 
} from '#mock'
```

## 📋 Mocking Patterns by Use Case

### Pattern 1: Mocking Utility Functions

**When**: Your plugin depends on utility functions from other modules

**Example**: Variable plugin needs `getValue` and `generateId`

```javascript
import { createMockGetValue, createMockGenerateId } from '#mock'

describe('Plugin with utility dependencies', () => {
  let mockGetValue
  let mockGenerateId
  let mock
  
  beforeEach(async function() {
    // Create utility mocks
    mockGetValue = createMockGetValue(this)
    mockGenerateId = createMockGenerateId(this)
    
    // Inject into plugin
    mock = await mockPlugin(this, {
      name: 'myPlugin',
      namedExports: {
        getValue: mockGetValue,
        generateId: mockGenerateId
      }
    })
  })
  
  afterEach(() => {
    mock.restore()
  })
  
  it('should use mocked utilities', () => {
    // Mock getValue to return specific value
    mockGetValue.mockImplementation(() => 'mocked-value')
    
    const result = mock.plugin.myPluginAction()
    
    strictEqual(result, 'mocked-value')
  })
})
```

### Pattern 2: Mocking Plugin Dependencies

**When**: Your plugin depends on other plugins

**Example**: Action plugin needs component and event plugins

```javascript
describe('Plugin with plugin dependencies', () => {
  let mock
  let mockComponentFind
  let mockEventEmit
  
  beforeEach(async function() {
    // Create dependency mocks
    mockComponentFind = this.mock.fn(() => ({ id: 'comp-1' }))
    mockEventEmit = this.mock.fn(() => true)
    
    // Inject dependencies
    mock = await mockPlugin(this, {
      name: 'action',
      modules: ['component', 'event'],
      namedExports: {
        componentFind: mockComponentFind,
        eventEmit: mockEventEmit
      }
    })
  })
  
  afterEach(() => {
    mock.restore()
  })
  
  it('should use component dependency', async () => {
    const result = await mock.plugin.actionExecute({
      actionId: 'action-1',
      componentId: 'comp-1'
    })
    
    // Verify dependency was called
    strictEqual(mockComponentFind.mock.calls.length, 1)
    strictEqual(mockComponentFind.mock.calls[0].arguments[0], 'comp-1')
  })
})
```

### Pattern 3: Mocking External Services

**When**: Your plugin makes API calls or uses external services

**Example**: API plugin with HTTP requests

```javascript
describe('API Plugin with external service', () => {
  let mock
  let mockFetch
  
  beforeEach(async function() {
    // Mock fetch API
    mockFetch = this.mock.fn(() => 
      Promise.resolve({
        json: () => Promise.resolve({ data: 'test' })
      })
    )
    
    // Inject mock fetch
    mock = await mockPlugin(this, {
      name: 'api',
      namedExports: {
        fetch: mockFetch
      }
    })
  })
  
  afterEach(() => {
    mock.restore()
  })
  
  it('should call external API', async () => {
    const result = await mock.plugin.apiGet('/users')
    
    strictEqual(mockFetch.mock.calls.length, 1)
    strictEqual(mockFetch.mock.calls[0].arguments[0], '/users')
    deepStrictEqual(result, { data: 'test' })
  })
  
  it('should handle API errors', async () => {
    mockFetch.mockImplementation(() => 
      Promise.reject(new Error('Network error'))
    )
    
    const result = await mock.plugin.apiGet('/users')
    
    strictEqual(result.success, false)
    ok(result.error.includes('Network error'))
  })
})
```

### Pattern 4: Mocking Window/Location

**When**: Your plugin depends on browser APIs

**Example**: Metadata plugin reads URL parameters

```javascript
import { mockWindowLocationSearch } from '#mock'

describe('Plugin with browser dependencies', () => {
  let mock
  let restoreWindow
  
  beforeEach(async function() {
    // Mock window.location.search
    restoreWindow = mockWindowLocationSearch(this, '?lang=fr')
    
    mock = await mockPlugin(this, { name: 'metadata' })
  })
  
  afterEach(() => {
    if (mock) mock.restore()
    if (restoreWindow) restoreWindow()
  })
  
  it('should read language from URL', () => {
    mock.plugin.setup({ languages: ['en', 'fr'] })
    
    const lang = mock.stateGetValue({ name: 'metadata/currentLanguage' })
    strictEqual(lang.item, 'fr')
  })
})
```

### Pattern 5: Mocking State Directly

**When**: You need to test state interactions without plugin methods

**Example**: Testing state listeners

```javascript
describe('State listener behavior', () => {
  let mock
  
  beforeEach(async function() {
    mock = await mockPlugin(this, { name: 'metadata' })
  })
  
  afterEach(() => {
    mock.restore()
  })
  
  it('should prevent invalid state changes', async () => {
    // Setup initial valid state
    mock.plugin.setup({ languages: ['en', 'fr'] })
    await mock.stateSetValue({
      name: 'metadata/currentLanguage',
      value: 'fr'
    })
    
    // Try to set invalid language
    await mock.stateSetValue({
      name: 'metadata/currentLanguage',
      value: 'de'
    })
    
    // Should revert to previous or empty
    const lang = mock.stateGetValue({ name: 'metadata/currentLanguage' })
    ok(lang.item === 'fr' || lang.item === '')
  })
})
```

## 🎨 Advanced Mocking Techniques

### Technique 1: Mock Implementation with Logic

```javascript
describe('Conditional mock behavior', () => {
  it('should return different values based on input', async () => {
    const mockGetValue = this.mock.fn((value, query) => {
      if (query === 'special') {
        return 'special-value'
      }
      if (typeof value === 'object' && value.nested) {
        return value.nested.deep
      }
      return value
    })
    
    const mock = await mockPlugin(this, {
      name: 'test',
      namedExports: { getValue: mockGetValue }
    })
    
    // Test different scenarios
    strictEqual(mock.plugin.testGet('special'), 'special-value')
    strictEqual(mock.plugin.testGet('normal'), 'normal')
  })
})
```

### Technique 2: Mocking with State

```javascript
describe('Mock that depends on state', () => {
  it('should return state-based values', async () => {
    const mockGetValue = this.mock.fn((value, query) => {
      // Can access plugin state through closure
      return value[query]
    })
    
    const mock = await mockPlugin(this, {
      name: 'test',
      namedExports: { getValue: mockGetValue }
    })
    
    // Setup state
    await mock.stateSetValue({
      name: 'test/data',
      value: { key: 'value' }
    })
    
    // Mock will use the value from state
    const result = mock.plugin.testAction()
    // ...
  })
})
```

### Technique 3: Mocking Async Operations

```javascript
describe('Async mock operations', () => {
  it('should handle promises correctly', async () => {
    const mockAsync = this.mock.fn(async (param) => {
      await new Promise(resolve => setTimeout(resolve, 10))
      return { param, result: 'async' }
    })
    
    const mock = await mockPlugin(this, {
      name: 'test',
      namedExports: { asyncOp: mockAsync }
    })
    
    const result = await mock.plugin.testAsyncAction()
    
    strictEqual(result.result, 'async')
  })
  
  it('should handle async errors', async () => {
    const mockAsync = this.mock.fn(() => 
      Promise.reject(new Error('Async error'))
    )
    
    const mock = await mockPlugin(this, {
      name: 'test',
      namedExports: { asyncOp: mockAsync }
    })
    
    const result = await mock.plugin.testAsyncAction()
    
    strictEqual(result.success, false)
    ok(result.error.includes('Async error'))
  })
})
```

### Technique 4: Mocking with Call Tracking

```javascript
describe('Mock call tracking', () => {
  it('should verify mock was called correctly', async () => {
    const mockFn = this.mock.fn(() => 'result')
    
    const mock = await mockPlugin(this, {
      name: 'test',
      namedExports: { fn: mockFn }
    })
    
    // Execute
    mock.plugin.testAction('arg1', 'arg2')
    
    // Verify calls
    strictEqual(mockFn.mock.calls.length, 1)
    strictEqual(mockFn.mock.calls[0].arguments[0], 'arg1')
    strictEqual(mockFn.mock.calls[0].arguments[1], 'arg2')
    strictEqual(mockFn.mock.results[0].value, 'result')
  })
  
  it('should track multiple calls', async () => {
    const mockFn = this.mock.fn((x) => x * 2)
    
    const mock = await mockPlugin(this, {
      name: 'test',
      namedExports: { fn: mockFn }
    })
    
    mock.plugin.testAction(1)
    mock.plugin.testAction(2)
    mock.plugin.testAction(3)
    
    strictEqual(mockFn.mock.calls.length, 3)
    strictEqual(mockFn.mock.results[0].value, 2)
    strictEqual(mockFn.mock.results[1].value, 4)
    strictEqual(mockFn.mock.results[2].value, 6)
  })
})
```

### Technique 5: Mocking with Custom Assertions

```javascript
describe('Custom mock assertions', () => {
  it('should verify complex interactions', async () => {
    const mockApi = this.mock.fn(() => Promise.resolve({ data: 'test' }))
    const mockCache = this.mock.fn(() => null) // Cache miss
    
    const mock = await mockPlugin(this, {
      name: 'dataService',
      namedExports: {
        apiCall: mockApi,
        cacheGet: mockCache
      }
    })
    
    const result = await mock.plugin.getData('key')
    
    // Custom verification
    strictEqual(mockCache.mock.calls.length, 1)
    strictEqual(mockApi.mock.calls.length, 1)
    strictEqual(mockApi.mock.calls[0].arguments[0], 'key')
    strictEqual(result.data, 'test')
  })
})
```

## 🎯 Common Mocking Scenarios

### Scenario 1: Mocking Multiple Return Values

```javascript
describe('Multiple return values', () => {
  it('should return different values on each call', async () => {
    const mockFn = this.mock.fn()
      .mockReturnValueOnce('first')
      .mockReturnValueOnce('second')
      .mockReturnValue('default')
    
    const mock = await mockPlugin(this, {
      name: 'test',
      namedExports: { fn: mockFn }
    })
    
    strictEqual(mock.plugin.testAction(), 'first')
    strictEqual(mock.plugin.testAction(), 'second')
    strictEqual(mock.plugin.testAction(), 'default')
    strictEqual(mock.plugin.testAction(), 'default')
  })
})
```

### Scenario 2: Mocking with Conditional Logic

```javascript
describe('Conditional mocking', () => {
  it('should behave differently based on input', async () => {
    const mockFn = this.mock.fn((input) => {
      if (input === 'error') {
        throw new Error('Invalid input')
      }
      if (input === 'null') {
        return null
      }
      return `processed: ${input}`
    })
    
    const mock = await mockPlugin(this, {
      name: 'test',
      namedExports: { fn: mockFn }
    })
    
    strictEqual(mock.plugin.testAction('valid'), 'processed: valid')
    strictEqual(mock.plugin.testAction('null'), null)
    
    const result = mock.plugin.testAction('error')
    ok(result.error.includes('Invalid input'))
  })
})
```

### Scenario 3: Mocking Complex Objects

```javascript
describe('Complex object mocking', () => {
  it('should handle nested objects', async () => {
    const mockFn = this.mock.fn(() => ({
      status: 'success',
      data: {
        items: [1, 2, 3],
        metadata: {
          count: 3,
          page: 1
        }
      },
      error: null
    }))
    
    const mock = await mockPlugin(this, {
      name: 'test',
      namedExports: { fn: mockFn }
    })
    
    const result = mock.plugin.testAction()
    
    strictEqual(result.status, 'success')
    strictEqual(result.data.items.length, 3)
    strictEqual(result.data.metadata.count, 3)
  })
})
```

### Scenario 4: Mocking Time-Dependent Code

```javascript
describe('Time-dependent mocking', () => {
  it('should handle time-based operations', async () => {
    const now = Date.now()
    const mockDate = this.mock.fn(() => now)
    
    const mock = await mockPlugin(this, {
      name: 'test',
      namedExports: { now: mockDate }
    })
    
    const timestamp = mock.plugin.getTimestamp()
    
    strictEqual(timestamp, now)
  })
})
```

### Scenario 5: Mocking with Error Recovery

```javascript
describe('Error recovery patterns', () => {
  it('should retry on failure', async () => {
    let attempts = 0
    const mockFn = this.mock.fn(() => {
      attempts++
      if (attempts < 3) {
        throw new Error('Temporary failure')
      }
      return 'success'
    })
    
    const mock = await mockPlugin(this, {
      name: 'test',
      namedExports: { fn: mockFn }
    })
    
    // Plugin should handle retries
    const result = mock.plugin.retryAction()
    
    strictEqual(result, 'success')
    strictEqual(attempts, 3)
  })
})
```

## 🎨 Best Practices

### ✅ DO

1. **Create mocks in beforeEach**
   ```javascript
   beforeEach(async function() {
     mockGetValue = createMockGetValue(this)
     // ...
   })
   ```

2. **Restore mocks in afterEach**
   ```javascript
   afterEach(() => {
     if (mock) mock.restore()
   })
   ```

3. **Use descriptive mock names**
   ```javascript
   const mockApiCall = this.mock.fn(() => Promise.resolve({}))
   ```

4. **Verify mock interactions**
   ```javascript
   strictEqual(mockFn.mock.calls.length, 1)
   ```

5. **Test mock error scenarios**
   ```javascript
   mockFn.mock.fn(() => Promise.reject(new Error('test')))
   ```

### ❌ DON'T

1. **Don't create mocks outside beforeEach**
   ```javascript
   // ❌ Bad
   const mock = createMock() // Shared across tests
   
   // ✅ Good
   beforeEach(() => {
     const mock = createMock() // Fresh for each test
   })
   ```

2. **Don't forget to await async mocks**
   ```javascript
   // ❌ Bad
   mock.plugin.asyncAction()
   
   // ✅ Good
   await mock.plugin.asyncAction()
   ```

3. **Don't over-mock**
   ```javascript
   // ❌ Bad: Mocking everything
   // ✅ Good: Only mock what's necessary
   ```

4. **Don't test the mock itself**
   ```javascript
   // ❌ Bad
   it('should call mock correctly', () => {
     // Testing the mock, not your code
   })
   ```

## 🚀 Complete Mocking Example

```javascript
import { describe, it, beforeEach, afterEach } from 'node:test'
import { strictEqual, ok } from 'node:assert/strict'
import { mockPlugin, createMockGetValue, createMockGenerateId } from '#mock'

describe('Complete Mocking Example', () => {
  let mock
  let mockGetValue
  let mockGenerateId
  let mockApiCall
  let mockComponentFind
  
  beforeEach(async function() {
    // 1. Create all utility mocks
    mockGetValue = createMockGetValue(this)
    mockGenerateId = createMockGenerateId(this)
    
    // 2. Create service mocks
    mockApiCall = this.mock.fn(() => 
      Promise.resolve({ data: 'api-response' })
    )
    
    mockComponentFind = this.mock.fn((id) => ({
      id,
      type: 'button',
      visible: true
    }))
    
    // 3. Create plugin with all mocks
    mock = await mockPlugin(this, {
      name: 'complexService',
      modules: ['component', 'event'],
      namedExports: {
        getValue: mockGetValue,
        generateId: mockGenerateId,
        apiCall: mockApiCall,
        componentFind: mockComponentFind
      }
    })
  })
  
  afterEach(() => {
    mock.restore()
  })

  describe('Mock Verification', () => {
    it('should use all mocked dependencies', async () => {
      // Setup
      await mock.stateSetValue({
        name: 'complexService/config',
        value: { endpoint: '/api/data' }
      })
      
      // Execute
      const result = await mock.plugin.complexServiceExecute({
        componentId: 'comp-1',
        query: 'data.items'
      })
      
      // Verify all mocks were used
      strictEqual(mockComponentFind.mock.calls.length, 1)
      strictEqual(mockApiCall.mock.calls.length, 1)
      strictEqual(mockGetValue.mock.calls.length, 1)
      
      // Verify arguments
      strictEqual(mockComponentFind.mock.calls[0].arguments[0], 'comp-1')
      strictEqual(mockApiCall.mock.calls[0].arguments[0], '/api/data')
      
      // Verify result
      strictEqual(result.success, true)
    })

    it('should handle mock failures gracefully', async () => {
      // Mock component to fail
      mockComponentFind.mockImplementation(() => null)
      
      const result = await mock.plugin.complexServiceExecute({
        componentId: 'invalid',
        query: 'data'
      })
      
      strictEqual(result.success, false)
      ok(result.error.includes('component'))
    })

    it('should verify mock call order', async () => {
      const callOrder = []
      
      mockComponentFind.mock.fn((id) => {
        callOrder.push('component')
        return { id }
      })
      
      mockApiCall.mock.fn(() => {
        callOrder.push('api')
        return Promise.resolve({ data: 'test' })
      })
      
      await mock.plugin.complexServiceExecute({
        componentId: 'comp-1',
        query: 'data'
      })
      
      // Verify order
      strictEqual(callOrder[0], 'component')
      strictEqual(callOrder[1], 'api')
    })
  })

  describe('Mock Configuration', () => {
    it('should configure mock behavior dynamically', async () => {
      // Configure based on test needs
      mockApiCall.mock.fn((url) => {
        if (url.includes('error')) {
          return Promise.reject(new Error('API Error'))
        }
        return Promise.resolve({ data: url })
      })
      
      // Test success case
      const success = await mock.plugin.apiGet('/success')
      strictEqual(success.data, '/success')
      
      // Test error case
      const error = await mock.plugin.apiGet('/error')
      strictEqual(error.success, false)
    })

    it('should use mock for complex scenarios', async () => {
      // Mock with state awareness
      let callCount = 0
      mockApiCall.mock.fn(() => {
        callCount++
        return Promise.resolve({ 
          data: `response-${callCount}`,
          count: callCount 
        })
      })
      
      const result1 = await mock.plugin.apiGet('/test')
      const result2 = await mock.plugin.apiGet('/test')
      
      strictEqual(result1.count, 1)
      strictEqual(result2.count, 2)
    })
  })
})
```

## 🎓 Learning Checklist

- [ ] Understand basic mocking concepts
- [ ] Master Node.js built-in mocking
- [ ] Use Dooksa mock utilities effectively
- [ ] Mock utility functions
- [ ] Mock plugin dependencies
- [ ] Mock external services
- [ ] Track mock calls and arguments
- [ ] Handle async mock operations
- [ ] Configure mock behavior dynamically
- [ ] Verify mock interactions

## 🚀 Next Steps

After mastering mocking:

1. **[Best Practices](./best-practices.md)** - Optimization and patterns
2. **[Troubleshooting](./troubleshooting.md)** - Debugging issues
3. **[Performance](./best-practices.md#performance)** - Test optimization

---

**Ready to optimize?** Move on to [Best Practices](./best-practices.md) to learn how to write efficient, maintainable tests.
