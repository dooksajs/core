# Complex Test Pattern

This guide covers testing plugins with multiple dependencies and complex interactions - the most advanced testing pattern for Dooksa plugins.

## 🎯 When to Use This Pattern

### ✅ Use Complex Tests For:

- **Multi-plugin dependencies**: Plugin needs other plugins to function
- **Named exports**: Requires specific utility functions from other modules
- **Integration testing**: Testing how plugins work together
- **External dependencies**: API calls, file system, databases (with mocks)
- **Complex state management**: Multiple state collections with relationships

### ❌ Don't Use For:

- **Pure functions**: No dependencies (use simple tests)
- **Single plugin state**: Only needs its own state (use state-dependent tests)

## 🏗️ Basic Structure

### Template

```javascript
import { describe, it, beforeEach, afterEach } from 'node:test'
import { strictEqual } from 'node:assert/strict'
import { mockPlugin, createMockGetValue, createMockGenerateId } from '#mock'

describe('PluginName - Complex Operations', () => {
  let mock
  let mockGetValue
  let mockGenerateId
  
  beforeEach(async function() {
    // Create utility mocks
    mockGetValue = createMockGetValue(this)
    mockGenerateId = createMockGenerateId(this)
    
    // Create plugin with dependencies
    mock = await mockPlugin(this, {
      name: 'pluginName',
      modules: ['dependency1', 'dependency2'],
      namedExports: {
        getValue: mockGetValue,
        generateId: mockGenerateId
      }
    })
  })
  
  afterEach(() => {
    if (mock) mock.restore()
  })
  
  it('should [complex operation] with [dependencies]', async () => {
    // Arrange: Setup complex state
    await mock.stateSetValue({
      name: 'pluginName/data',
      value: { items: [] }
    })
    
    // Act: Perform complex operation
    const result = mock.plugin.pluginNameComplexAction({
      query: 'test',
      options: { recursive: true }
    })
    
    // Assert: Verify complex result
    strictEqual(result.success, true)
    strictEqual(result.items.length, 3)
  })
})
```

## 📋 Real-World Examples

### Example 1: Variable Plugin (Based on existing tests)

The variable plugin is the perfect example of complex testing - it needs:
- `getValue` utility for nested object access
- `generateId` for ID generation
- `component` module for scope management
- Complex state with scopes and values

```javascript
import { describe, it, beforeEach, afterEach } from 'node:test'
import { strictEqual, deepStrictEqual, ok } from 'node:assert/strict'
import { mockPlugin, createMockGetValue, createMockGenerateId } from '#mock'

describe('Variable Plugin - Complex Operations', () => {
  let mock
  let mockGetValue
  let mockGenerateId
  
  beforeEach(async function() {
    // Create utility mocks
    mockGetValue = createMockGetValue(this)
    mockGenerateId = createMockGenerateId(this)
    
    // Create plugin with dependencies
    mock = await mockPlugin(this, {
      name: 'variable',
      modules: ['component'],
      namedExports: {
        getValue: mockGetValue,
        generateId: mockGenerateId
      }
    })
  })
  
  afterEach(() => {
    if (mock) mock.restore()
  })

  describe('getValue - Complex Scenarios', () => {
    it('should get value from specific scope', async () => {
      await mock.stateSetValue({
        name: 'variable/values',
        value: { 'test-var': 'test-value' },
        options: { id: 'scope-1' }
      })
      
      const result = mock.plugin.variableGetValue({
        scope: 'scope-1',
        query: 'test-var'
      }, { context: {} })
      
      strictEqual(result, 'test-value')
    })

    it('should get nested value using dot notation', async () => {
      await mock.stateSetValue({
        name: 'variable/values',
        value: {
          user: {
            profile: {
              name: 'John Doe'
            }
          }
        },
        options: { id: 'scope-1' }
      })
      
      const result = mock.plugin.variableGetValue({
        scope: 'scope-1',
        query: 'user.profile.name'
      }, { context: {} })
      
      strictEqual(result, 'John Doe')
    })

    it('should apply prefix and suffix to query', async () => {
      await mock.stateSetValue({
        name: 'variable/values',
        value: { 'prefix_test-var_suffix': 'combined-value' },
        options: { id: 'scope-1' }
      })
      
      const result = mock.plugin.variableGetValue({
        scope: 'scope-1',
        query: 'test-var',
        prefixId: 'prefix_',
        suffixId: '_suffix'
      }, { context: {} })
      
      strictEqual(result, 'combined-value')
    })

    it('should search through multiple scopes when no scope specified', async () => {
      // Setup scopes for root context
      await mock.stateSetValue({
        name: 'variable/scopes',
        value: ['scope-1', 'scope-2', 'scope-3'],
        options: { id: 'root-context' }
      })
      
      // Setup values in different scopes
      await mock.stateSetValue({
        name: 'variable/values',
        value: { 'var-a': 'value-a' },
        options: { id: 'scope-1' }
      })
      
      await mock.stateSetValue({
        name: 'variable/values',
        value: { 'var-b': 'value-b' },
        options: { id: 'scope-2' }
      })
      
      await mock.stateSetValue({
        name: 'variable/values',
        value: { 'var-c': 'value-c' },
        options: { id: 'scope-3' }
      })
      
      // Should find first matching variable
      const result = mock.plugin.variableGetValue({
        query: 'var-b'
      }, { context: { rootId: 'root-context' } })
      
      strictEqual(result, 'value-b')
    })

    it('should handle complex nested queries', async () => {
      await mock.stateSetValue({
        name: 'variable/values',
        value: {
          data: {
            items: [
              { id: 1, name: 'Item 1' },
              { id: 2, name: 'Item 2' }
            ]
          }
        },
        options: { id: 'scope-1' }
      })
      
      const result = mock.plugin.variableGetValue({
        scope: 'scope-1',
        query: 'data.items.1.name'
      }, { context: {} })
      
      strictEqual(result, 'Item 2')
    })

    it('should handle null and undefined gracefully', async () => {
      await mock.stateSetValue({
        name: 'variable/values',
        value: null,
        options: { id: 'scope-1' }
      })
      
      const result = mock.plugin.variableGetValue({
        scope: 'scope-1',
        query: 'any-var'
      }, { context: {} })
      
      strictEqual(result, undefined)
    })
  })

  describe('setValue - Complex Scenarios', () => {
    it('should set value in specific scope', async () => {
      await mock.plugin.variableSetValue({
        scope: 'scope-1',
        values: [
          {
            id: 'var-1',
            value: 'test-value'
          }
        ]
      }, { context: { id: 'component-1' } })
      
      const values = await mock.stateGetValue({
        name: 'variable/values',
        id: 'scope-1'
      })
      
      strictEqual(values.item['var-1'], 'test-value')
    })

    it('should generate ID automatically when not provided', async () => {
      await mock.plugin.variableSetValue({
        scope: 'scope-1',
        values: [
          {
            value: 'auto-generated-value'
          }
        ]
      }, { context: { id: 'component-1' } })
      
      const values = await mock.stateGetValue({
        name: 'variable/values',
        id: 'scope-1'
      })
      
      strictEqual(values.item['_test_id_12345_'], 'auto-generated-value')
    })

    it('should apply prefix and suffix to generated ID', async () => {
      await mock.plugin.variableSetValue({
        scope: 'scope-1',
        values: [
          {
            value: 'prefixed-value',
            prefixId: 'pre_',
            suffixId: '_suf'
          }
        ]
      }, { context: { id: 'component-1' } })
      
      const values = await mock.stateGetValue({
        name: 'variable/values',
        id: 'scope-1'
      })
      
      strictEqual(values.item['pre__test_id_12345__suf'], 'prefixed-value')
    })

    it('should merge with existing values in scope', async () => {
      // Pre-populate scope
      await mock.stateSetValue({
        name: 'variable/values',
        value: { 'existing-var': 'existing-value' },
        options: { id: 'scope-1' }
      })
      
      await mock.plugin.variableSetValue({
        scope: 'scope-1',
        values: [
          { id: 'new-var', value: 'new-value' }
        ]
      }, { context: { id: 'component-1' } })
      
      const values = await mock.stateGetValue({
        name: 'variable/values',
        id: 'scope-1'
      })
      
      strictEqual(values.item['existing-var'], 'existing-value')
      strictEqual(values.item['new-var'], 'new-value')
    })

    it('should update existing value in scope', async () => {
      await mock.stateSetValue({
        name: 'variable/values',
        value: { 'var-1': 'old-value' },
        options: { id: 'scope-1' }
      })
      
      await mock.plugin.variableSetValue({
        scope: 'scope-1',
        values: [
          { id: 'var-1', value: 'new-value' }
        ]
      }, { context: { id: 'component-1' } })
      
      const values = await mock.stateGetValue({
        name: 'variable/values',
        id: 'scope-1'
      })
      
      strictEqual(values.item['var-1'], 'new-value')
    })

    it('should set value in current context when no scope specified', async () => {
      // Setup scopes for root context
      await mock.stateSetValue({
        name: 'variable/scopes',
        value: ['scope-1'],
        options: { id: 'root-context' }
      })
      
      // Setup existing values
      await mock.stateSetValue({
        name: 'variable/values',
        value: { 'existing-var': 'existing-value' },
        options: { id: 'scope-1' }
      })
      
      await mock.plugin.variableSetValue({
        values: [
          { id: 'new-var', value: 'new-value' }
        ]
      }, {
        context: {
          rootId: 'root-context',
          id: 'component-1'
        }
      })
      
      const values = await mock.stateGetValue({
        name: 'variable/values',
        id: 'scope-1'
      })
      
      strictEqual(values.item['existing-var'], 'existing-value')
      strictEqual(values.item['new-var'], 'new-value')
    })

    it('should add component to scope in component/belongsToScopes', async () => {
      await mock.plugin.variableSetValue({
        scope: 'scope-1',
        values: [
          { id: 'var-1', value: 'value-1' }
        ]
      }, { context: { id: 'component-1' } })
      
      const belongsTo = await mock.stateGetValue({
        name: 'component/belongsToScopes',
        id: 'component-1'
      })
      
      strictEqual(belongsTo.item, 'scope-1')
    })

    it('should handle complex nested values', async () => {
      await mock.plugin.variableSetValue({
        scope: 'scope-1',
        values: [
          {
            id: 'complex-var',
            value: {
              nested: {
                deep: 'deep-value',
                array: [1, 2, 3]
              }
            }
          }
        ]
      }, { context: { id: 'component-1' } })
      
      const values = await mock.stateGetValue({
        name: 'variable/values',
        id: 'scope-1'
      })
      
      deepStrictEqual(values.item['complex-var'], {
        nested: {
          deep: 'deep-value',
          array: [1, 2, 3]
        }
      })
    })

    it('should handle null and undefined values', async () => {
      await mock.plugin.variableSetValue({
        scope: 'scope-1',
        values: [
          { id: 'null-var', value: null },
          { id: 'undefined-var', value: undefined }
        ]
      }, { context: { id: 'component-1' } })
      
      const values = await mock.stateGetValue({
        name: 'variable/values',
        id: 'scope-1'
      })
      
      strictEqual(values.item['null-var'], null)
      strictEqual(values.item['undefined-var'], undefined)
    })
  })

  describe('Integration - Complete Workflow', () => {
    it('should handle complete variable lifecycle', async () => {
      // 1. Setup scopes
      await mock.stateSetValue({
        name: 'variable/scopes',
        value: ['user-scope', 'session-scope'],
        options: { id: 'root-context' }
      })
      
      // 2. Set values in different scopes
      await mock.plugin.variableSetValue({
        scope: 'user-scope',
        values: [
          { id: 'username', value: 'John' },
          { id: 'email', value: 'john@example.com' }
        ]
      }, { context: { id: 'component-1' } })
      
      await mock.plugin.variableSetValue({
        scope: 'session-scope',
        values: [
          { id: 'token', value: 'abc123' },
          { id: 'expires', value: Date.now() + 60000 }
        ]
      }, { context: { id: 'component-2' } })
      
      // 3. Query values
      const username = mock.plugin.variableGetValue({
        query: 'username'
      }, { context: { rootId: 'root-context' } })
      
      const token = mock.plugin.variableGetValue({
        query: 'token'
      }, { context: { rootId: 'root-context' } })
      
      // 4. Verify
      strictEqual(username, 'John')
      strictEqual(token, 'abc123')
      
      // 5. Update value
      await mock.plugin.variableSetValue({
        values: [
          { id: 'username', value: 'Jane' }
        ]
      }, { context: { rootId: 'root-context', id: 'component-1' } })
      
      // 6. Verify update
      const updatedUsername = mock.plugin.variableGetValue({
        query: 'username'
      }, { context: { rootId: 'root-context' } })
      
      strictEqual(updatedUsername, 'Jane')
    })
  })
})
```

### Example 2: Action Plugin with Multiple Dependencies

```javascript
describe('Action Plugin - Complex Dependencies', () => {
  let mock
  let mockActionDispatch
  let mockComponentFind
  
  beforeEach(async function() {
    mockActionDispatch = this.mock.fn(() => Promise.resolve({ success: true }))
    mockComponentFind = this.mock.fn(() => ({ id: 'comp-1', type: 'button' }))
    
    mock = await mockPlugin(this, {
      name: 'action',
      modules: ['component', 'event'],
      namedExports: {
        actionDispatch: mockActionDispatch,
        componentFind: mockComponentFind
      }
    })
  })
  
  afterEach(() => {
    mock.restore()
  })

  describe('Complex Action Execution', () => {
    it('should execute action with component context', async () => {
      // Setup component state
      await mock.stateSetValue({
        name: 'component/items',
        value: { 'comp-1': { id: 'comp-1', type: 'button' } }
      })
      
      // Execute action
      const result = await mock.plugin.actionExecute({
        actionId: 'action-1',
        componentId: 'comp-1',
        payload: { click: true }
      })
      
      // Verify component was found
      strictEqual(mockComponentFind.mock.calls.length, 1)
      
      // Verify action was dispatched
      strictEqual(mockActionDispatch.mock.calls.length, 1)
      
      // Verify result
      strictEqual(result.success, true)
    })

    it('should handle action with multiple components', async () => {
      // Setup multiple components
      await mock.stateSetValue({
        name: 'component/items',
        value: {
          'comp-1': { id: 'comp-1', type: 'button' },
          'comp-2': { id: 'comp-2', type: 'input' }
        }
      })
      
      // Execute action on multiple components
      const result = await mock.plugin.actionExecuteBatch({
        actionId: 'action-1',
        componentIds: ['comp-1', 'comp-2']
      })
      
      // Verify all components were processed
      strictEqual(mockComponentFind.mock.calls.length, 2)
      strictEqual(result.success, true)
    })

    it('should handle action with event propagation', async () => {
      // Setup event listeners
      await mock.stateSetValue({
        name: 'event/listeners',
        value: {
          'action-1': ['handler-1', 'handler-2']
        }
      })
      
      // Execute action
      await mock.plugin.actionExecute({
        actionId: 'action-1',
        componentId: 'comp-1'
      })
      
      // Verify event was emitted to all listeners
      strictEqual(mockActionDispatch.mock.calls.length, 2)
    })
  })

  describe('Error Handling with Dependencies', () => {
    it('should handle component not found', async () => {
      mockComponentFind.mockImplementation(() => null)
      
      const result = await mock.plugin.actionExecute({
        actionId: 'action-1',
        componentId: 'nonexistent'
      })
      
      strictEqual(result.success, false)
      ok(result.error.includes('component'))
    })

    it('should handle action dispatch failure', async () => {
      mockActionDispatch.mockImplementation(() => 
        Promise.reject(new Error('Dispatch failed'))
      )
      
      const result = await mock.plugin.actionExecute({
        actionId: 'action-1',
        componentId: 'comp-1'
      })
      
      strictEqual(result.success, false)
      ok(result.error.includes('Dispatch failed'))
    })
  })
})
```

### Example 3: Data Flow with Multiple Plugins

```javascript
describe('Data Flow - Multi-Plugin Integration', () => {
  let mock
  let mockGetValue
  let mockGenerateId
  let mockApiCall
  
  beforeEach(async function() {
    mockGetValue = createMockGetValue(this)
    mockGenerateId = createMockGenerateId(this)
    mockApiCall = this.mock.fn(() => Promise.resolve({ data: 'api-response' }))
    
    mock = await mockPlugin(this, {
      name: 'dataFlow',
      modules: ['api', 'cache', 'validator'],
      namedExports: {
        getValue: mockGetValue,
        generateId: mockGenerateId,
        apiCall: mockApiCall
      }
    })
  })
  
  afterEach(() => {
    mock.restore()
  })

  describe('Complex Data Pipeline', () => {
    it('should fetch, cache, and validate data', async () => {
      // Setup cache
      await mock.stateSetValue({
        name: 'cache/items',
        value: {}
      })
      
      // Execute pipeline
      const result = await mock.plugin.dataPipeline({
        endpoint: '/users',
        cacheKey: 'users',
        validate: true
      })
      
      // Verify API was called
      strictEqual(mockApiCall.mock.calls.length, 1)
      
      // Verify data was cached
      const cache = mock.stateGetValue({ name: 'cache/items' })
      ok(cache.item['users'])
      
      // Verify result
      strictEqual(result.data, 'api-response')
    })

    it('should use cached data when available', async () => {
      // Pre-populate cache
      await mock.stateSetValue({
        name: 'cache/items',
        value: {
          'users': { data: 'cached-response', timestamp: Date.now() }
        }
      })
      
      // Execute pipeline
      const result = await mock.plugin.dataPipeline({
        endpoint: '/users',
        cacheKey: 'users',
        validate: true
      })
      
      // Verify API was NOT called
      strictEqual(mockApiCall.mock.calls.length, 0)
      
      // Verify cached data was returned
      strictEqual(result.data, 'cached-response')
    })

    it('should handle validation failures', async () => {
      // Setup validator to fail
      mock.plugin.validatorValidate = () => false
      
      const result = await mock.plugin.dataPipeline({
        endpoint: '/users',
        cacheKey: 'users',
        validate: true
      })
      
      strictEqual(result.success, false)
      ok(result.error.includes('validation'))
    })
  })
})
```

## 🎯 Advanced Testing Strategies

### 1. Mock Chaining

```javascript
describe('Mock Chaining', () => {
  it('should chain multiple mock operations', async () => {
    // Create complex mock chain
    const mockStep1 = t.mock.fn(() => ({ step: 1 }))
    const mockStep2 = t.mock.fn(() => ({ step: 2 }))
    const mockStep3 = t.mock.fn(() => ({ step: 3 }))
    
    const mock = await mockPlugin(t, {
      name: 'pipeline',
      namedExports: {
        step1: mockStep1,
        step2: mockStep2,
        step3: mockStep3
      }
    })
    
    // Execute pipeline
    const result = mock.plugin.pipelineExecute()
    
    // Verify chain
    strictEqual(mockStep1.mock.calls.length, 1)
    strictEqual(mockStep2.mock.calls.length, 1)
    strictEqual(mockStep3.mock.calls.length, 1)
    
    // Verify order
    ok(mockStep1.mock.results[0].value.step === 1)
    ok(mockStep2.mock.results[0].value.step === 2)
    ok(mockStep3.mock.results[0].value.step === 3)
  })
})
```

### 2. State Synchronization

```javascript
describe('State Synchronization', () => {
  it('should sync state across multiple plugins', async () => {
    // Setup initial state
    await mock.stateSetValue({
      name: 'plugin1/data',
      value: { sync: 'initial' }
    })
    
    // Trigger sync operation
    mock.plugin.syncWithPlugin2()
    
    // Verify state was synchronized
    const plugin1Data = mock.stateGetValue({ name: 'plugin1/data' })
    const plugin2Data = mock.stateGetValue({ name: 'plugin2/data' })
    
    strictEqual(plugin1Data.item.sync, plugin2Data.item.sync)
  })
})
```

### 3. Complex Error Recovery

```javascript
describe('Error Recovery', () => {
  it('should recover from partial failures', async () => {
    // Mock partial failure
    let callCount = 0
    mockApiCall.mock.fn(() => {
      callCount++
      if (callCount === 1) {
        return Promise.reject(new Error('Network error'))
      }
      return Promise.resolve({ data: 'success' })
    })
    
    // Execute with retry
    const result = await mock.plugin.executeWithRetry({
      endpoint: '/data',
      retries: 2
    })
    
    // Should succeed after retry
    strictEqual(result.success, true)
    strictEqual(callCount, 2) // Called twice
  })
})
```

## 🎨 Best Practices for Complex Tests

### ✅ DO

1. **Mock all dependencies explicitly**
   ```javascript
   beforeEach(async function() {
     mockGetValue = createMockGetValue(this)
     mockGenerateId = createMockGenerateId(this)
     
     mock = await mockPlugin(this, {
       name: 'plugin',
       modules: ['dep1', 'dep2'],
       namedExports: { getValue: mockGetValue, generateId: mockGenerateId }
     })
   })
   ```

2. **Test integration points**
   ```javascript
   it('should integrate with dependency', async () => {
     // Verify dependency was called
     strictEqual(mockDependency.mock.calls.length, 1)
     
     // Verify arguments
     strictEqual(mockDependency.mock.calls[0].arguments[0], expected)
   })
   ```

3. **Mock external services**
   ```javascript
   const mockApi = t.mock.fn(() => Promise.resolve({ data: 'test' }))
   // Use mockApi in namedExports
   ```

4. **Test error propagation**
   ```javascript
   it('should propagate errors from dependencies', async () => {
     mockDependency.mock.fn(() => {
       throw new Error('Dependency error')
     })
     
     const result = await mock.plugin.action()
     strictEqual(result.error, 'Dependency error')
   })
   ```

### ❌ DON'T

1. **Don't forget to mock all dependencies**
   ```javascript
   // ❌ Bad: Missing mock for getValue
   mock = await mockPlugin(t, {
     name: 'variable',
     modules: ['component']
     // Missing: namedExports: { getValue: mockGetValue }
   })
   ```

2. **Don't test dependency implementation**
   ```javascript
   // ❌ Bad: Testing how dependency works
   it('should call dependency correctly', () => {
     // Testing the mock, not your plugin
   })
   
   // ✅ Good: Testing your plugin's behavior
   it('should handle dependency result', () => {
     // Testing your plugin's response
   })
   ```

3. **Don't ignore async dependencies**
   ```javascript
   // ❌ Bad: Not awaiting async operations
   mock.plugin.asyncAction()
   
   // ✅ Good: Await async operations
   await mock.plugin.asyncAction()
   ```

## 🚀 Complete Example: Complete Variable Plugin Test

Here's a comprehensive test file that covers all aspects:

```javascript
import { describe, it, beforeEach, afterEach } from 'node:test'
import { strictEqual, deepStrictEqual, ok, throws } from 'node:assert/strict'
import { mockPlugin, createMockGetValue, createMockGenerateId } from '#mock'

describe('Variable Plugin - Complete Test Suite', () => {
  let mock
  let mockGetValue
  let mockGenerateId
  
  beforeEach(async function() {
    mockGetValue = createMockGetValue(this)
    mockGenerateId = createMockGenerateId(this)
    
    mock = await mockPlugin(this, {
      name: 'variable',
      modules: ['component'],
      namedExports: {
        getValue: mockGetValue,
        generateId: mockGenerateId
      }
    })
  })
  
  afterEach(() => {
    mock.restore()
  })

  describe('Setup & Initialization', () => {
    it('should initialize with empty state', () => {
      const scopes = mock.stateGetValue({ name: 'variable/scopes', id: 'root' })
      strictEqual(scopes.item.length, 0)
    })
  })

  describe('getValue - All Scenarios', () => {
    it('should get from specific scope', async () => {
      await mock.stateSetValue({
        name: 'variable/values',
        value: { key: 'value' },
        options: { id: 'scope1' }
      })
      
      const result = mock.plugin.variableGetValue({
        scope: 'scope1',
        query: 'key'
      }, { context: {} })
      
      strictEqual(result, 'value')
    })

    it('should search multiple scopes', async () => {
      await mock.stateSetValue({
        name: 'variable/scopes',
        value: ['s1', 's2'],
        options: { id: 'root' }
      })
      
      await mock.stateSetValue({
        name: 'variable/values',
        value: { key: 's2-value' },
        options: { id: 's2' }
      })
      
      const result = mock.plugin.variableGetValue({
        query: 'key'
      }, { context: { rootId: 'root' } })
      
      strictEqual(result, 's2-value')
    })

    it('should apply prefix/suffix', async () => {
      await mock.stateSetValue({
        name: 'variable/values',
        value: { 'pre_key_suf': 'value' },
        options: { id: 'scope1' }
      })
      
      const result = mock.plugin.variableGetValue({
        scope: 'scope1',
        query: 'key',
        prefixId: 'pre_',
        suffixId: '_suf'
      }, { context: {} })
      
      strictEqual(result, 'value')
    })

    it('should handle nested queries', async () => {
      await mock.stateSetValue({
        name: 'variable/values',
        value: { data: { user: { name: 'John' } } },
        options: { id: 'scope1' }
      })
      
      const result = mock.plugin.variableGetValue({
        scope: 'scope1',
        query: 'data.user.name'
      }, { context: {} })
      
      strictEqual(result, 'John')
    })

    it('should handle missing values', async () => {
      const result = mock.plugin.variableGetValue({
        scope: 'nonexistent',
        query: 'key'
      }, { context: {} })
      
      strictEqual(result, undefined)
    })
  })

  describe('setValue - All Scenarios', () => {
    it('should set in specific scope', async () => {
      await mock.plugin.variableSetValue({
        scope: 'scope1',
        values: [{ id: 'key', value: 'value' }]
      }, { context: { id: 'comp1' } })
      
      const values = await mock.stateGetValue({
        name: 'variable/values',
        id: 'scope1'
      })
      
      strictEqual(values.item.key, 'value')
    })

    it('should generate ID automatically', async () => {
      await mock.plugin.variableSetValue({
        scope: 'scope1',
        values: [{ value: 'value' }]
      }, { context: { id: 'comp1' } })
      
      const values = await mock.stateGetValue({
        name: 'variable/values',
        id: 'scope1'
      })
      
      strictEqual(values.item['_test_id_12345_'], 'value')
    })

    it('should apply prefix/suffix to ID', async () => {
      await mock.plugin.variableSetValue({
        scope: 'scope1',
        values: [{ value: 'value', prefixId: 'pre_', suffixId: '_suf' }]
      }, { context: { id: 'comp1' } })
      
      const values = await mock.stateGetValue({
        name: 'variable/values',
        id: 'scope1'
      })
      
      strictEqual(values.item['pre__test_id_12345__suf'], 'value')
    })

    it('should merge with existing values', async () => {
      await mock.stateSetValue({
        name: 'variable/values',
        value: { old: 'old-value' },
        options: { id: 'scope1' }
      })
      
      await mock.plugin.variableSetValue({
        scope: 'scope1',
        values: [{ id: 'new', value: 'new-value' }]
      }, { context: { id: 'comp1' } })
      
      const values = await mock.stateGetValue({
        name: 'variable/values',
        id: 'scope1'
      })
      
      strictEqual(values.item.old, 'old-value')
      strictEqual(values.item.new, 'new-value')
    })

    it('should update existing values', async () => {
      await mock.stateSetValue({
        name: 'variable/values',
        value: { key: 'old' },
        options: { id: 'scope1' }
      })
      
      await mock.plugin.variableSetValue({
        scope: 'scope1',
        values: [{ id: 'key', value: 'new' }]
      }, { context: { id: 'comp1' } })
      
      const values = await mock.stateGetValue({
        name: 'variable/values',
        id: 'scope1'
      })
      
      strictEqual(values.item.key, 'new')
    })

    it('should handle complex nested values', async () => {
      await mock.plugin.variableSetValue({
        scope: 'scope1',
        values: [{
          id: 'complex',
          value: {
            nested: {
              deep: 'value',
              array: [1, 2, 3],
              object: { a: 1 }
            }
          }
        }]
      }, { context: { id: 'comp1' } })
      
      const values = await mock.stateGetValue({
        name: 'variable/values',
        id: 'scope1'
      })
      
      deepStrictEqual(values.item.complex, {
        nested: {
          deep: 'value',
          array: [1, 2, 3],
          object: { a: 1 }
        }
      })
    })

    it('should handle null/undefined values', async () => {
      await mock.plugin.variableSetValue({
        scope: 'scope1',
        values: [
          { id: 'null', value: null },
          { id: 'undefined', value: undefined }
        ]
      }, { context: { id: 'comp1' } })
      
      const values = await mock.stateGetValue({
        name: 'variable/values',
        id: 'scope1'
      })
      
      strictEqual(values.item.null, null)
      strictEqual(values.item.undefined, undefined)
    })

    it('should register component in scope', async () => {
      await mock.plugin.variableSetValue({
        scope: 'scope1',
        values: [{ id: 'key', value: 'value' }]
      }, { context: { id: 'comp1' } })
      
      const belongsTo = await mock.stateGetValue({
        name: 'component/belongsToScopes',
        id: 'comp1'
      })
      
      strictEqual(belongsTo.item, 'scope1')
    })
  })

  describe('Integration Workflows', () => {
    it('should handle complete lifecycle', async () => {
      // Setup multiple scopes
      await mock.stateSetValue({
        name: 'variable/scopes',
        value: ['user', 'session', 'config'],
        options: { id: 'root' }
      })
      
      // Set values in each scope
      await mock.plugin.variableSetValue({
        scope: 'user',
        values: [{ id: 'name', value: 'John' }]
      }, { context: { id: 'comp1' } })
      
      await mock.plugin.variableSetValue({
        scope: 'session',
        values: [{ id: 'token', value: 'abc123' }]
      }, { context: { id: 'comp2' } })
      
      await mock.plugin.variableSetValue({
        scope: 'config',
        values: [{ id: 'theme', value: 'dark' }]
      }, { context: { id: 'comp3' } })
      
      // Query across scopes
      const name = mock.plugin.variableGetValue({
        query: 'name'
      }, { context: { rootId: 'root' } })
      
      const token = mock.plugin.variableGetValue({
        query: 'token'
      }, { context: { rootId: 'root' } })
      
      const theme = mock.plugin.variableGetValue({
        query: 'theme'
      }, { context: { rootId: 'root' } })
      
      strictEqual(name, 'John')
      strictEqual(token, 'abc123')
      strictEqual(theme, 'dark')
      
      // Update value
      await mock.plugin.variableSetValue({
        values: [{ id: 'name', value: 'Jane' }]
      }, { context: { rootId: 'root', id: 'comp1' } })
      
      // Verify update
      const updatedName = mock.plugin.variableGetValue({
        query: 'name'
      }, { context: { rootId: 'root' } })
      
      strictEqual(updatedName, 'Jane')
    })

    it('should handle complex nested structures', async () => {
      // Set complex data
      await mock.plugin.variableSetValue({
        scope: 'data',
        values: [{
          id: 'user',
          value: {
            profile: {
              name: 'John',
              email: 'john@example.com',
              settings: {
                theme: 'dark',
                notifications: true
              }
            },
            posts: [
              { id: 1, title: 'Post 1' },
              { id: 2, title: 'Post 2' }
            ]
          }
        }]
      }, { context: { id: 'comp1' } })
      
      // Query nested properties
      const name = mock.plugin.variableGetValue({
        scope: 'data',
        query: 'user.profile.name'
      }, { context: {} })
      
      const theme = mock.plugin.variableGetValue({
        scope: 'data',
        query: 'user.profile.settings.theme'
      }, { context: {} })
      
      const postTitle = mock.plugin.variableGetValue({
        scope: 'data',
        query: 'user.posts.1.title'
      }, { context: {} })
      
      strictEqual(name, 'John')
      strictEqual(theme, 'dark')
      strictEqual(postTitle, 'Post 2')
    })
  })

  describe('Edge Cases & Error Handling', () => {
    it('should handle empty scope', async () => {
      const result = mock.plugin.variableGetValue({
        scope: 'empty',
        query: 'key'
      }, { context: {} })
      
      strictEqual(result, undefined)
    })

    it('should handle empty values array', async () => {
      await mock.plugin.variableSetValue({
        scope: 'scope1',
        values: []
      }, { context: { id: 'comp1' } })
      
      // Should not throw
      ok(true)
    })

    it('should handle non-existent scope in query', async () => {
      const result = mock.plugin.variableGetValue({
        scope: 'nonexistent',
        query: 'key'
      }, { context: {} })
      
      strictEqual(result, undefined)
    })

    it('should handle malformed nested queries', async () => {
      await mock.stateSetValue({
        name: 'variable/values',
        value: { a: 1 },
        options: { id: 'scope1' }
      })
      
      const result = mock.plugin.variableGetValue({
        scope: 'scope1',
        query: 'a.b.c' // Doesn't exist
      }, { context: {} })
      
      strictEqual(result, undefined)
    })

    it('should handle very long query paths', async () => {
      const deepData = { level1: { level2: { level3: { level4: { level5: 'deep' } } } } }
      
      await mock.stateSetValue({
        name: 'variable/values',
        value: { data: deepData },
        options: { id: 'scope1' }
      })
      
      const result = mock.plugin.variableGetValue({
        scope: 'scope1',
        query: 'data.level1.level2.level3.level4.level5'
      }, { context: {} })
      
      strictEqual(result, 'deep')
    })

    it('should handle special characters in keys', async () => {
      await mock.stateSetValue({
        name: 'variable/values',
        value: { 'key-with-dashes': 'value1', 'key.with.dots': 'value2' },
        options: { id: 'scope1' }
      })
      
      const result1 = mock.plugin.variableGetValue({
        scope: 'scope1',
        query: 'key-with-dashes'
      }, { context: {} })
      
      const result2 = mock.plugin.variableGetValue({
        scope: 'scope1',
        query: 'key.with.dots'
      }, { context: {} })
      
      strictEqual(result1, 'value1')
      strictEqual(result2, 'value2')
    })
  })
})
```

## 🎓 Learning Checklist

- [ ] Understand dependency injection patterns
- [ ] Master mock creation and configuration
- [ ] Test integration between multiple plugins
- [ ] Handle async dependencies properly
- [ ] Test error propagation across boundaries
- [ ] Mock external services effectively
- [ ] Test complex state synchronization
- [ ] Handle edge cases in multi-plugin scenarios

## 🚀 Next Steps

After mastering complex tests:

1. **[Mocking Strategies](../mocking.md)** - Advanced mocking techniques
2. **[Best Practices](../best-practices.md)** - Optimization and patterns
3. **[Troubleshooting](../troubleshooting.md)** - Debugging complex issues

---

**You've completed the pattern guides!** Now explore [Mocking Strategies](../mocking.md) to learn advanced techniques.
