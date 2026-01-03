# Dooksa Plugin Testing Documentation

Welcome to the comprehensive testing guide for Dooksa plugins! This documentation will help you write effective, maintainable tests for your plugins.

## 📚 Documentation Structure

### 🎯 Start Here
- **[README.md](./README.md)** - Main guide with overview and quick start
  - What this guide covers
  - Test complexity levels
  - Quick start example
  - Running tests

### 🏗️ Fundamentals
- **[Fundamentals.md](./fundamentals.md)** - Core concepts and principles
  - Plugin anatomy
  - Testing principles
  - Test categories
  - Lifecycle management
  - Assertions

### 📋 Test Patterns
Learn the three main testing patterns based on complexity:

1. **[Simple Tests](./patterns/simple.md)**
   - When: Pure functions, no state, no dependencies
   - Examples: Operators, utilities
   - Direct function testing

2. **[State-Dependent Tests](./patterns/state-dependent.md)**
   - When: Plugins with state management
   - Examples: Metadata, configuration
   - State setup and verification

3. **[Complex Tests](./patterns/complex.md)**
   - When: Multiple dependencies and integration
   - Examples: Variable plugin, action systems
   - Full mock environment

### 🔧 Advanced Techniques
- **[Mocking Strategies](./mocking.md)**
  - Mock utilities
  - Dependency injection
  - External service mocking
  - Advanced patterns

### ✅ Best Practices
- **[Best Practices](./best-practices.md)**
  - Code quality guidelines
  - Performance optimization
  - Maintainability tips
  - Common anti-patterns

### 🐛 Troubleshooting
- **[Troubleshooting](./troubleshooting.md)**
  - Common errors and solutions
  - Debugging techniques
  - Quick fixes
  - Checklist

## 🚀 Quick Start

### Your First Test

```javascript
import { describe, it, beforeEach, afterEach } from 'node:test'
import { strictEqual } from 'node:assert/strict'
import { mockPlugin } from '#mock'

describe('My Plugin', () => {
  let mock
  
  beforeEach(async function() {
    mock = await mockPlugin(this, { name: 'myPlugin' })
  })
  
  afterEach(() => {
    if (mock) mock.restore()
  })
  
  it('should do something', async () => {
    const result = mock.plugin.myPluginAction()
    strictEqual(result, 'expected')
  })
})
```

### Which Pattern to Use?

```
Does your plugin use state?
├─ NO → Simple Tests
└─ YES → Does it need other plugins/modules?
   ├─ NO → State-Dependent Tests
   └─ YES → Complex Tests
```

## 🎯 Key Concepts

### Testing Pyramid
```
        ┌─────────────┐
        │  Integration │  ← Complex tests
        ├─────────────┤
        │   State      │  ← Medium tests
        ├─────────────┤
        │   Unit       │  ← Simple tests
        └─────────────┘
```

### Mock Plugin Structure
```javascript
const mock = await mockPlugin(t, {
  name: 'pluginName',
  modules: ['dependency1'],        // Optional
  namedExports: { custom: mockFn }, // Optional
  platform: 'client'               // or 'server'
})

// Access:
mock.plugin                    // Plugin methods
mock.stateSetValue()           // State management
mock.restore()                 // Cleanup
```

### Test Lifecycle
```javascript
describe('Feature', () => {
  let mock
  
  beforeEach(async function() {
    // Setup: Fresh mock for each test
    mock = await mockPlugin(this, { name: 'plugin' })
  })
  
  afterEach(() => {
    // Teardown: Clean up
    if (mock) mock.restore()
  })
  
  it('test', async () => {
    // Arrange: Setup data
    // Act: Execute
    // Assert: Verify
  })
})
```

## 📖 How to Use This Guide

### For Beginners
1. Read [Fundamentals](./fundamentals.md)
2. Study [Simple Tests](./patterns/simple.md)
3. Practice with your own simple plugins
4. Move to state-dependent tests

### For Intermediate
1. Review [Best Practices](./best-practices.md)
2. Learn [Mocking](./mocking.md)
3. Study [Complex Tests](./patterns/complex.md)
4. Refactor existing tests

### For Advanced
1. Check [Troubleshooting](./troubleshooting.md)
2. Optimize performance
3. Share patterns with team

## 🔧 Common Workflows

### Testing a New Plugin
```javascript
// 1. Identify complexity
//    - No state? → Simple pattern
//    - Has state? → State-dependent pattern
//    - Multiple deps? → Complex pattern

// 2. Create test file
import { describe, it, beforeEach, afterEach } from 'node:test'
import { mockPlugin } from '#mock'

// 3. Write setup/teardown
describe('Plugin', () => {
  let mock
  beforeEach(async function() {
    mock = await mockPlugin(this, { name: 'plugin' })
  })
  afterEach(() => mock.restore())
  
  // 4. Write tests
  it('...', async () => { /* ... */ })
})
```

### Debugging a Failing Test
```javascript
// 1. Check imports
// 2. Check async/await
// 3. Check setup/teardown
// 4. Add console.log
// 5. Use troubleshooting guide
```

## 📦 What's Included

### Mock Utilities
- `mockPlugin()` - Main mock creation
- `createMockGetValue()` - Nested object access
- `createMockGenerateId()` - ID generation
- `mockWindowLocationSearch()` - Browser URL mocking

### Test Patterns
- Simple: Direct function testing
- State: State management testing
- Complex: Multi-plugin integration

### Best Practices
- Code quality guidelines
- Performance tips
- Maintainability patterns
- Anti-patterns to avoid

## 🎓 Learning Path

### Level 1: Basics
- [ ] Read fundamentals
- [ ] Write simple test
- [ ] Understand AAA pattern
- [ ] Use beforeEach/afterEach

### Level 2: Intermediate
- [ ] Master state testing
- [ ] Learn mocking
- [ ] Test edge cases
- [ ] Follow best practices

### Level 3: Advanced
- [ ] Complex integration tests
- [ ] Performance optimization
- [ ] Custom mock patterns
- [ ] Test architecture

## 🆘 Getting Help

### When Stuck
1. Check [Troubleshooting](./troubleshooting.md)
2. Review existing tests in `packages/plugins/test/`
3. Look at plugin source code
4. Use console.log for debugging

### Common Issues
- Missing `await` → Check async operations
- Wrong imports → Verify paths
- State not isolated → Check afterEach
- Mock not called → Verify injection

## 📝 Contributing

When adding new tests:
1. Follow the patterns in this guide
2. Use descriptive names
3. Keep tests focused
4. Document complex scenarios
5. Follow best practices

## 🎯 Summary

This guide provides everything you need to test Dooksa plugins effectively:

- **3 patterns** for different complexity levels
- **Complete mocking** strategies
- **Best practices** for quality
- **Troubleshooting** for common issues

Start with the README, then dive into the pattern that matches your needs!

---

**Ready to start?** Begin with [README.md](./README.md) for a quick overview, or jump directly to [Fundamentals](./fundamentals.md) to start learning!
