# Testing Dooksa Plugins: A Comprehensive Guide

This guide teaches you how to properly test Dooksa plugins at any complexity level. You'll learn testing patterns, mocking strategies, and best practices that apply to all plugin types.

## 🎯 What You'll Learn

- **Testing Fundamentals**: Core principles for plugin testing
- **Pattern Recognition**: How to identify and apply the right test pattern
- **Mocking Strategies**: When and how to mock dependencies
- **Best Practices**: Write maintainable, effective tests
- **Troubleshooting**: Debug common testing issues

## 📋 Prerequisites

Before testing, you should understand:
- [Dooksa Plugin Architecture](../guide.md) - How plugins work
- [Node.js Test Runner](https://nodejs.org/api/test.html) - Native testing framework
- [Mock Concepts](https://nodejs.org/api/test.html#mocking) - Test doubles and spies

## 🏗️ Testing Philosophy

### Why Test Plugins?

Plugins are the building blocks of your application. Good tests ensure:
- **Reliability**: Changes don't break existing functionality
- **Documentation**: Tests show how plugins should be used
- **Refactoring Confidence**: Safe code modifications
- **Edge Case Coverage**: Handle unexpected inputs gracefully

### What Makes a Good Test?

```javascript
// ✅ Good: Clear, focused, isolated
describe('user plugin - login action', () => {
  it('should authenticate with valid credentials', async () => {
    const mock = await mockPlugin(t, { name: 'user' })
    
    const result = await mock.plugin.userLogin({
      email: 'test@example.com',
      password: 'secret'
    })
    
    strictEqual(result.success, true)
    mock.restore()
  })
})

// ❌ Bad: Unclear, coupled, incomplete
describe('user', () => {
  it('works', () => {
    // What does "works" mean?
    // No setup/cleanup
    // No assertions
  })
})
```

## 🎯 Test Complexity Levels

All plugin tests fall into three complexity levels. Choose the right pattern:

### Level 1: Simple Tests
**When to use**: Testing pure functions, no state, no dependencies

**Example**: Mathematical operators, string utilities
```javascript
// Direct function testing
const result = operatorEval({ name: '+', values: [1, 2] })
strictEqual(result, 3)
```

**Characteristics**:
- ✅ No mock setup needed
- ✅ Fast and simple
- ✅ Direct function calls
- ⚠️ Limited to stateless operations

### Level 2: State-Dependent Tests
**When to use**: Testing plugins that read/write state

**Example**: Metadata plugin, configuration management
```javascript
// Requires mockPlugin for state
const mock = await mockPlugin(t, { name: 'metadata' })
mock.plugin.setup({ languages: ['en', 'fr'] })
const lang = mock.stateGetValue({ name: 'metadata/currentLanguage' })
strictEqual(lang.item, 'fr')
mock.restore()
```

**Characteristics**:
- ✅ Tests state interactions
- ✅ Requires mockPlugin
- ✅ Needs setup/teardown
- ⚠️ More complex setup

### Level 3: Complex Tests
**When to use**: Testing plugins with multiple dependencies

**Example**: Variable plugin (needs getValue, generateId, component module)
```javascript
// Requires mockPlugin with named exports and modules
const mockGetValue = createMockGetValue(t)
const mock = await mockPlugin(t, {
  name: 'variable',
  modules: ['component'],
  namedExports: { getValue: mockGetValue }
})
// Complex state setup and assertions
mock.restore()
```

**Characteristics**:
- ✅ Tests integration
- ✅ Handles dependencies
- ✅ Full mock control
- ⚠️ Most complex setup

## 📚 Learning Path

### Beginner (Start Here)
1. **Read**: [Fundamentals](./fundamentals.md)
2. **Practice**: [Simple Tests](./patterns/simple.md)
3. **Understand**: [Mocking Basics](./mocking.md)

### Intermediate
1. **Learn**: [State-Dependent Tests](./patterns/state-dependent.md)
2. **Apply**: [Best Practices](./best-practices.md)
3. **Master**: [Complex Patterns](./patterns/complex.md)

### Advanced
1. **Optimize**: [Performance & Debugging](./troubleshooting.md)
2. **Refine**: [Advanced Mocking](./mocking.md#advanced)
3. **Share**: [Custom Patterns](./best-practices.md#patterns)

## 🚀 Quick Start

### Your First Test

```javascript
// 1. Import testing utilities
import { describe, it, beforeEach, afterEach } from 'node:test'
import { strictEqual } from 'node:assert/strict'
import { mockPlugin } from '#mock'

// 2. Describe what you're testing
describe('My Plugin - Basic Functionality', () => {
  let mock

  // 3. Setup before each test
  beforeEach(async function() {
    mock = await mockPlugin(this, { name: 'myPlugin' })
  })

  // 4. Cleanup after each test
  afterEach(() => {
    if (mock) mock.restore()
  })

  // 5. Write your test
  it('should perform basic operation', () => {
    const result = mock.plugin.myPluginDoSomething()
    strictEqual(result, 'expected')
  })
})
```

### Running Tests

```bash
# Run all plugin tests
npm test -- packages/plugins/test

# Run specific test file
npm test -- packages/plugins/test/client/operator.spec.js

# Run with coverage
npm run test-coverage
```

## 🤔 Which Pattern Should I Use?

Use this decision tree:

```
Does your plugin use state?
├─ NO → Simple Test Pattern
└─ YES → Does it need other plugins/modules?
   ├─ NO → State-Dependent Pattern
   └─ YES → Complex Pattern
```

**Examples by Pattern:**

| Pattern | Plugin Examples | Complexity |
|---------|----------------|------------|
| Simple | Operator, String utils | ⭐ |
| State-Dependent | Metadata, Auth, Cache | ⭐⭐ |
| Complex | Variable, Component, Action | ⭐⭐⭐ |

## 📖 How to Use This Guide

### For New Tests
1. Identify your plugin's complexity level
2. Read the corresponding pattern guide
3. Follow the examples and best practices
4. Use the troubleshooting section if stuck

### For Existing Tests
1. Review [Best Practices](./best-practices.md)
2. Identify anti-patterns
3. Refactor using the guides
4. Check [Troubleshooting](./troubleshooting.md) for common issues

### For Learning
1. Start with [Fundamentals](./fundamentals.md)
2. Study each pattern in order
3. Practice with real plugins
4. Reference [Mocking](./mocking.md) for advanced techniques

## 🔧 Key Testing Utilities

### Mock Plugin
```javascript
const mock = await mockPlugin(t, {
  name: 'pluginName',
  modules: ['dependency1'], // Optional
  namedExports: { customFn: mockFn }, // Optional
  platform: 'client' // or 'server'
})
```

### State Management
```javascript
// Set state values
await mock.stateSetValue({
  name: 'plugin/collection',
  value: { data: 'test' },
  options: { id: 'testId' }
})

// Get state values
const result = mock.stateGetValue({
  name: 'plugin/collection',
  id: 'testId'
})
```

### Mock Utilities
```javascript
// Mock getValue utility
const mockGetValue = createMockGetValue(t)

// Mock ID generation
const mockGenerateId = createMockGenerateId(t)

// Mock window.location.search
const restoreWindow = mockWindowLocationSearch(t, '?lang=fr')
```

## 🚨 Common Pitfalls

### 1. Forgetting Cleanup
```javascript
// ❌ Wrong
afterEach(() => {
  // Missing mock.restore()
})

// ✅ Correct
afterEach(() => {
  if (mock) mock.restore()
})
```

### 2. Not Waiting for Async
```javascript
// ❌ Wrong
const mock = mockPlugin(t, { name: 'plugin' }) // Missing await

// ✅ Correct
const mock = await mockPlugin(t, { name: 'plugin' })
```

### 3. Wrong Test Context
```javascript
// ❌ Wrong
beforeEach(() => {
  mock = mockPlugin(this, { name: 'plugin' }) // 'this' not available
})

// ✅ Correct
beforeEach(async function() {
  mock = await mockPlugin(this, { name: 'plugin' })
})
```

## 📦 What's Next?

After mastering the basics, explore:

- **Advanced Patterns**: [Complex Tests](./patterns/complex.md)
- **Performance**: [Optimization Strategies](./best-practices.md#performance)
- **Integration**: [Testing Multiple Plugins](./patterns/complex.md#integration)
- **CI/CD**: [Automated Testing](./best-practices.md#automation)

## 🆘 Need Help?

1. **Check Troubleshooting**: [Common Issues](./troubleshooting.md)
2. **Review Examples**: Study existing tests in `packages/plugins/test/`
3. **Ask Questions**: Review plugin source code for implementation details
4. **Debug**: Use console.log in tests to understand state flow

---

**Ready to start?** Begin with [Fundamentals](./fundamentals.md) or jump directly to [Simple Tests](./patterns/simple.md) if you're eager to code!
