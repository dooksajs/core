# Testing Fundamentals

This guide covers the core principles and concepts you need to understand before writing effective tests for Dooksa plugins.

## 🎯 What Are We Testing?

### Plugin Anatomy

Every Dooksa plugin has these key components that need testing:

```javascript
createPlugin('myPlugin', {
  // 1. State - Data storage
  state: {
    defaults: { count: 0 },
    schema: { count: { type: 'number' } }
  },
  
  // 2. Data - Configuration
  data: { apiBase: '/api' },
  
  // 3. Methods - Public API
  methods: {
    getValue() { return this.count }
  },
  
  // 4. Private Methods - Internal logic
  privateMethods: {
    validate(value) { return value > 0 }
  },
  
  // 5. Actions - Callable functions
  actions: {
    increment: {
      parameters: { type: 'object' },
      method({ value }) { this.count += value }
    }
  },
  
  // 6. Setup - Initialization
  setup() { return 'ready' }
})
```

### Testing Pyramid

```
        ┌─────────────┐
        │  Integration │  ← Complex tests (variables, components)
        ├─────────────┤
        │   State      │  ← Medium tests (metadata, auth)
        ├─────────────┤
        │   Unit       │  ← Simple tests (operators, utils)
        └─────────────┘
```

## 🧪 Testing Principles

### 1. Isolation

Each test should be independent and self-contained.

```javascript
// ✅ Good: Isolated test
describe('counter', () => {
  let mock
  
  beforeEach(async function() {
    mock = await mockPlugin(this, { name: 'counter' })
  })
  
  afterEach(() => {
    mock.restore()
  })
  
  it('increments', () => {
    mock.plugin.counterIncrement()
    strictEqual(mock.stateGetValue({ name: 'counter/count' }).item, 1)
  })
  
  it('starts at zero', () => {
    // This test is NOT affected by the previous test
    strictEqual(mock.stateGetValue({ name: 'counter/count' }).item, 0)
  })
})

// ❌ Bad: Shared state between tests
let sharedMock // Shared across tests

describe('counter', () => {
  it('increments', () => {
    sharedMock.plugin.counterIncrement()
    // ...
  })
  
  it('starts at zero', () => {
    // Might fail because sharedMock still has count from previous test!
    strictEqual(sharedMock.stateGetValue(...).item, 0)
  })
})
```

### 2. Clarity

Tests should clearly communicate what they're testing and why.

```javascript
// ✅ Good: Descriptive names
describe('user plugin - authentication', () => {
  describe('login action', () => {
    it('should authenticate with valid credentials', async () => {
      // Clear purpose
    })
    
    it('should reject invalid password', async () => {
      // Clear purpose
    })
    
    it('should handle network errors gracefully', async () => {
      // Clear purpose
    })
  })
})

// ❌ Bad: Unclear names
describe('user', () => {
  it('test1', () => {
    // What does this test?
  })
  
  it('works', () => {
    // What "works"?
  })
})
```

### 3. Determinism

Tests must produce the same result every time they run.

```javascript
// ✅ Good: Deterministic
describe('id generation', () => {
  it('generates predictable IDs', async () => {
    const mockGenerateId = t.mock.fn(() => 'fixed-id-123')
    const mock = await mockPlugin(t, {
      name: 'user',
      namedExports: { generateId: mockGenerateId }
    })
    
    const id = mock.plugin.userGenerateId()
    strictEqual(id, 'fixed-id-123') // Always the same
  })
})

// ❌ Bad: Non-deterministic
describe('id generation', () => {
  it('generates IDs', async () => {
    const mock = await mockPlugin(t, { name: 'user' })
    
    const id = mock.plugin.userGenerateId()
    // This ID changes every run - can't assert reliably
    strictEqual(typeof id, 'string') // Too vague
  })
})
```

### 4. Coverage

Test the happy path, edge cases, and error conditions.

```javascript
describe('math operations', () => {
  // Happy path
  it('adds positive numbers', () => {
    strictEqual(add(2, 3), 5)
  })
  
  // Edge cases
  it('adds zero', () => {
    strictEqual(add(5, 0), 5)
  })
  
  it('adds negative numbers', () => {
    strictEqual(add(-2, -3), -5)
  })
  
  // Error conditions
  it('handles invalid input', () => {
    throws(() => add('a', 5), /invalid/i)
  })
})
```

## 🔍 Test Categories

### Unit Tests

**What**: Test individual functions in isolation
**When**: Pure logic, no dependencies
**Speed**: Fast ⚡⚡⚡

```javascript
// Testing a pure function
describe('operatorEval', () => {
  it('adds numbers', () => {
    const result = operatorEval({ name: '+', values: [1, 2] })
    strictEqual(result, 3)
  })
})
```

### State Tests

**What**: Test state management and data flow
**When**: Plugins with state, no external dependencies
**Speed**: Medium ⚡⚡

```javascript
// Testing state interactions
describe('metadata plugin', () => {
  it('stores language preference', async () => {
    const mock = await mockPlugin(t, { name: 'metadata' })
    
    await mock.stateSetValue({
      name: 'metadata/currentLanguage',
      value: 'fr'
    })
    
    const lang = mock.stateGetValue({ name: 'metadata/currentLanguage' })
    strictEqual(lang.item, 'fr')
    
    mock.restore()
  })
})
```

### Integration Tests

**What**: Test plugin interactions and dependencies
**When**: Multiple plugins, external dependencies
**Speed**: Slow ⚡

```javascript
// Testing plugin integration
describe('variable plugin', () => {
  it('resolves variables across scopes', async () => {
    const mockGetValue = createMockGetValue(t)
    const mock = await mockPlugin(t, {
      name: 'variable',
      modules: ['component'],
      namedExports: { getValue: mockGetValue }
    })
    
    // Complex setup with multiple plugins
    await mock.stateSetValue({ name: 'variable/values', value: { key: 'value' } })
    
    const result = mock.plugin.variableGetValue({ query: 'key' })
    strictEqual(result, 'value')
    
    mock.restore()
  })
})
```

## 🎬 Test Lifecycle

Understanding the test lifecycle is crucial for proper setup and cleanup.

### Test Execution Flow

```
1. beforeEach() runs
2. Test function runs
3. afterEach() runs
4. Repeat for next test
```

### Proper Lifecycle Management

```javascript
describe('plugin with lifecycle', () => {
  let mock
  let restoreWindow
  
  // Setup: Run before each test
  beforeEach(async function() {
    // 1. Mock window if needed
    restoreWindow = mockWindowLocationSearch(this, '?lang=fr')
    
    // 2. Create plugin mock
    mock = await mockPlugin(this, { name: 'myPlugin' })
    
    // 3. Setup initial state
    await mock.stateSetValue({
      name: 'myPlugin/config',
      value: { enabled: true }
    })
  })
  
  // Teardown: Run after each test
  afterEach(() => {
    // 1. Restore mocks in reverse order
    if (mock) mock.restore()
    if (restoreWindow) restoreWindow()
  })
  
  // Tests
  it('should work with setup', () => {
    // Everything is ready
    const config = mock.stateGetValue({ name: 'myPlugin/config' })
    strictEqual(config.item.enabled, true)
  })
  
  it('should be isolated', () => {
    // Fresh setup for this test
    strictEqual(mock.stateGetValue({ name: 'myPlugin/config' }).item.enabled, true)
  })
})
```

## 🎯 Assertions

### Common Assertions

```javascript
import { strictEqual, deepStrictEqual, ok, throws } from 'node:assert/strict'

// Equality
strictEqual(result, expected)           // Primitive equality
deepStrictEqual(result, expected)       // Deep object equality

// Truthiness
ok(result)                              // Truthy
ok(!result)                             // Falsy

// Errors
throws(() => code(), /error message/)   // Throws specific error

// Type checks
strictEqual(typeof result, 'string')    // Type check
strictEqual(Array.isArray(result), true) // Array check
```

### State Assertions

```javascript
// Get state value
const value = mock.stateGetValue({
  name: 'plugin/collection',
  id: 'testId'
})

// Assert on state
strictEqual(value.item, expectedValue)

// For collections
const collection = mock.stateGetValue({ name: 'plugin/collection' })
strictEqual(collection.item.length, 3)
```

### Mock Function Assertions

```javascript
// Check if called
strictEqual(mock.plugin.someMethod.mock.calls.length, 1)

// Check arguments
const firstCall = mock.plugin.someMethod.mock.calls[0]
strictEqual(firstCall.arguments[0], expectedArg)

// Check return value
strictEqual(mock.plugin.someMethod.mock.results[0].value, expectedReturn)
```

## 🏗️ Test Structure Patterns

### Pattern 1: Simple Function Test

```javascript
describe('PluginName - FunctionName', () => {
  it('should [do something] with [input]', () => {
    // Arrange
    const input = 'test'
    
    // Act
    const result = someFunction(input)
    
    // Assert
    strictEqual(result, 'expected')
  })
})
```

### Pattern 2: State-Dependent Test

```javascript
describe('PluginName - State Interaction', () => {
  let mock
  
  beforeEach(async function() {
    mock = await mockPlugin(this, { name: 'pluginName' })
  })
  
  afterEach(() => {
    mock.restore()
  })
  
  it('should [affect state] when [action]', async () => {
    // Arrange
    await mock.stateSetValue({ name: 'plugin/data', value: initial })
    
    // Act
    mock.plugin.pluginAction()
    
    // Assert
    const result = mock.stateGetValue({ name: 'plugin/data' })
    strictEqual(result.item, expected)
  })
})
```

### Pattern 3: Async Test

```javascript
describe('PluginName - Async Operation', () => {
  let mock
  
  beforeEach(async function() {
    mock = await mockPlugin(this, { name: 'pluginName' })
  })
  
  afterEach(() => {
    mock.restore()
  })
  
  it('should [handle async] operation', async () => {
    // Arrange
    const mockData = { id: 1, name: 'test' }
    
    // Act
    const result = await mock.plugin.asyncAction(mockData)
    
    // Assert
    strictEqual(result.id, 1)
    strictEqual(result.name, 'test')
  })
})
```

## 🔧 Common Test Scenarios

### Scenario 1: Testing with Mocked Dependencies

```javascript
describe('Plugin with dependencies', () => {
  it('should use dependency', async () => {
    const mockDependency = t.mock.fn(() => 'mocked-result')
    
    const mock = await mockPlugin(t, {
      name: 'myPlugin',
      namedExports: { dependencyMethod: mockDependency }
    })
    
    const result = mock.plugin.myPluginAction()
    
    strictEqual(result, 'mocked-result')
    strictEqual(mockDependency.mock.calls.length, 1)
    
    mock.restore()
  })
})
```

### Scenario 2: Testing State Transitions

```javascript
describe('State transitions', () => {
  let mock
  
  beforeEach(async function() {
    mock = await mockPlugin(this, { name: 'counter' })
  })
  
  afterEach(() => {
    mock.restore()
  })
  
  it('should transition from zero to one', async () => {
    // Initial state
    const initial = mock.stateGetValue({ name: 'counter/count' })
    strictEqual(initial.item, 0)
    
    // Action
    mock.plugin.counterIncrement()
    
    // Final state
    const final = mock.stateGetValue({ name: 'counter/count' })
    strictEqual(final.item, 1)
  })
})
```

### Scenario 3: Testing Error Conditions

```javascript
describe('Error handling', () => {
  let mock
  
  beforeEach(async function() {
    mock = await mockPlugin(this, { name: 'validator' })
  })
  
  afterEach(() => {
    mock.restore()
  })
  
  it('should throw on invalid input', () => {
    throws(() => {
      mock.plugin.validate({ invalid: 'data' })
    }, /validation failed/i)
  })
  
  it('should handle network errors', async () => {
    // Mock a failing API call
    const mockApi = t.mock.fn(() => Promise.reject(new Error('Network error')))
    
    const result = await mock.plugin.apiAction(mockApi)
    
    strictEqual(result.error, 'Network error')
  })
})
```

## 🎓 Best Practices Summary

### ✅ DO

1. **Use descriptive names**: `should authenticate with valid credentials`
2. **Clean up in afterEach**: Always restore mocks
3. **Test one thing per test**: Focused assertions
4. **Use AAA pattern**: Arrange, Act, Assert
5. **Mock external dependencies**: Control test environment
6. **Test edge cases**: Zero, null, undefined, empty strings
7. **Test error paths**: What happens when things go wrong

### ❌ DON'T

1. **Share state between tests**: Leads to flaky tests
2. **Test implementation details**: Test behavior, not internals
3. **Use magic numbers**: Use named constants
4. **Skip cleanup**: Causes test pollution
5. **Test too much**: One concept per test
6. **Ignore async**: Always await promises
7. **Copy-paste tests**: Extract common setup

## 🚀 Next Steps

Now that you understand the fundamentals, you're ready to learn:

1. **[Simple Tests](./patterns/simple.md)** - Testing pure functions
2. **[State Tests](./patterns/state-dependent.md)** - Testing stateful plugins
3. **[Complex Tests](./patterns/complex.md)** - Testing with dependencies
4. **[Mocking](./mocking.md)** - Advanced mocking strategies

## 📚 Quick Reference

```javascript
// Essential imports
import { describe, it, beforeEach, afterEach } from 'node:test'
import { strictEqual, deepStrictEqual, ok, throws } from 'node:assert/strict'

// Mock utilities
import { 
  mockPlugin, 
  createMockGetValue, 
  createMockGenerateId,
  mockWindowLocationSearch 
} from '#mock'

// Test structure
describe('Feature', () => {
  let mock
  
  beforeEach(async function() {
    mock = await mockPlugin(this, { name: 'plugin' })
  })
  
  afterEach(() => {
    mock.restore()
  })
  
  it('should do something', async () => {
    // Test logic here
  })
})
```

---

**Ready to practice?** Move on to [Simple Tests](./patterns/simple.md) to start writing your first tests!
