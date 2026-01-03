# Troubleshooting Guide for Dooksa Plugin Tests

This guide helps you diagnose and fix common issues when testing Dooksa plugins.

## 🔍 Quick Diagnosis

### Test Fails Immediately
```javascript
// ❌ Error: Cannot find module '#mock'
// ✅ Solution: Check import path
import { mockPlugin } from '#mock' // Should be correct

// ❌ Error: mockPlugin is not a function
// ✅ Solution: Check that mock is properly imported
import { mockPlugin } from '#mock' // Make sure it's imported
```

### Test Hangs or Times Out
```javascript
// ❌ Missing await
const mock = mockPlugin(t, { name: 'plugin' }) // Wrong

// ✅ Correct
const mock = await mockPlugin(t, { name: 'plugin' }) // Right
```

### State Not Updating
```javascript
// ❌ Not awaiting async operations
mock.stateSetValue({ name: 'data', value: 1 })

// ✅ Await state changes
await mock.stateSetValue({ name: 'data', value: 1 })
```

## 🎯 Common Issues & Solutions

### Issue 1: "Cannot find module '#mock'"

**Symptoms:**
```
Error: Cannot find module '#mock'
```

**Causes:**
- Import path is incorrect
- Mock utilities not available
- Wrong file extension

**Solutions:**
```javascript
// ❌ Wrong
import { mockPlugin } from './mock.js'
import { mockPlugin } from '../mock.js'

// ✅ Correct
import { mockPlugin } from '#mock'

// ✅ Also correct for specific utilities
import { 
  mockPlugin, 
  createMockGetValue, 
  createMockGenerateId,
  mockWindowLocationSearch 
} from '#mock'
```

### Issue 2: "mock.restore is not a function"

**Symptoms:**
```
TypeError: mock.restore is not a function
```

**Causes:**
- Mock not properly created
- Mock creation failed silently
- Wrong mock object

**Solutions:**
```javascript
// ❌ Wrong - no await
beforeEach(() => {
  mock = mockPlugin(this, { name: 'plugin' })
})

// ✅ Correct - with await
beforeEach(async function() {
  mock = await mockPlugin(this, { name: 'plugin' })
})

// ✅ Always check mock exists
afterEach(() => {
  if (mock) mock.restore()
})
```

### Issue 3: "Cannot read property 'item' of undefined"

**Symptoms:**
```
TypeError: Cannot read property 'item' of undefined
```

**Causes:**
- State path doesn't exist
- Wrong state collection name
- State not initialized

**Solutions:**
```javascript
// ❌ Wrong - state doesn't exist
const result = mock.stateGetValue({ name: 'plugin/nonexistent' })

// ✅ Correct - check state exists
const result = mock.stateGetValue({ name: 'plugin/data' })
if (result) {
  console.log(result.item)
}

// ✅ Or initialize first
await mock.stateSetValue({
  name: 'plugin/data',
  value: { key: 'value' }
})
const result = mock.stateGetValue({ name: 'plugin/data' })
```

### Issue 4: Tests Not Isolated

**Symptoms:**
- Test 2 fails when Test 1 runs first
- Random failures depending on test order
- State carries over between tests

**Causes:**
- Missing afterEach cleanup
- Shared state between tests
- Not restoring mocks

**Solutions:**
```javascript
describe('Plugin', () => {
  let mock
  
  beforeEach(async function() {
    mock = await mockPlugin(this, { name: 'plugin' })
  })
  
  afterEach(() => {
    // ✅ Always restore
    if (mock) mock.restore()
  })
  
  it('test 1', async () => {
    await mock.stateSetValue({ name: 'plugin/data', value: 1 })
    // ...
  })
  
  it('test 2', async () => {
    // ✅ Starts fresh - no carryover from test 1
    const result = mock.stateGetValue({ name: 'plugin/data' })
    strictEqual(result.item, 0) // Default value
  })
})
```

### Issue 5: Mock Not Being Called

**Symptoms:**
- Expected mock to be called but wasn't
- `mock.calls.length` is 0
- Plugin uses real dependency instead of mock

**Causes:**
- Mock not properly injected
- Wrong named export name
- Mock created after plugin

**Solutions:**
```javascript
// ❌ Wrong - mock created after plugin
const mock = await mockPlugin(t, { name: 'plugin' })
const mockFn = t.mock.fn(() => 'result')
// Mock not injected!

// ✅ Correct - mock created before and injected
const mockFn = t.mock.fn(() => 'result')
const mock = await mockPlugin(t, {
  name: 'plugin',
  namedExports: { dependency: mockFn }
})

// ✅ Verify mock was used
strictEqual(mockFn.mock.calls.length, 1)
```

### Issue 6: Async Operation Not Waiting

**Symptoms:**
- Test passes but shouldn't
- Assertions run before async operation completes
- Race conditions

**Causes:**
- Missing await
- Not using async/await properly

**Solutions:**
```javascript
// ❌ Wrong - no await
it('should work', async () => {
  const mock = await mockPlugin(t, { name: 'plugin' })
  mock.plugin.asyncAction() // Missing await
  strictEqual(result, expected) // Runs before action completes
})

// ✅ Correct - proper await
it('should work', async () => {
  const mock = await mockPlugin(t, { name: 'plugin' })
  await mock.plugin.asyncAction() // Wait for completion
  const result = mock.stateGetValue({ name: 'plugin/data' })
  strictEqual(result.item, expected)
})
```

### Issue 7: Window Mock Not Working

**Symptoms:**
- URL parameters not read correctly
- `window` is undefined
- Browser API errors

**Causes:**
- Window mock not created
- Mock not restored
- Wrong mock function

**Solutions:**
```javascript
// ❌ Wrong - no window mock
beforeEach(async function() {
  mock = await mockPlugin(this, { name: 'metadata' })
  // window.location.search not mocked
})

// ✅ Correct - with window mock
let restoreWindow

beforeEach(async function() {
  restoreWindow = mockWindowLocationSearch(this, '?lang=fr')
  mock = await mockPlugin(this, { name: 'metadata' })
})

afterEach(() => {
  if (mock) mock.restore()
  if (restoreWindow) restoreWindow() // ✅ Restore window
})
```

### Issue 8: Dependency Injection Not Working

**Symptoms:**
- Plugin uses real dependency
- Mock not being used
- Unexpected behavior

**Causes:**
- Wrong named export key
- Dependency not in plugin's namedExports
- Mock function signature mismatch

**Solutions:**
```javascript
// ❌ Wrong - wrong key name
const mockGetValue = createMockGetValue(t)
mock = await mockPlugin(t, {
  name: 'variable',
  namedExports: { 
    wrongName: mockGetValue // Should be 'getValue'
  }
})

// ✅ Correct - matching key name
const mockGetValue = createMockGetValue(t)
mock = await mockPlugin(t, {
  name: 'variable',
  namedExports: { 
    getValue: mockGetValue // Matches plugin's import
  }
})

// ✅ Verify mock is being used
strictEqual(mockGetValue.mock.calls.length, 1)
```

### Issue 9: State Schema Validation Errors

**Symptoms:**
- `stateSetValue` throws validation errors
- Type mismatches
- Schema violations

**Causes:**
- Wrong data type for schema
- Missing required fields
- Schema mismatch

**Solutions:**
```javascript
// ❌ Wrong - wrong type
await mock.stateSetValue({
  name: 'plugin/number',
  value: 'not a number' // Should be number
})

// ✅ Correct - matching schema
await mock.stateSetValue({
  name: 'plugin/number',
  value: 42
})

// ✅ Check schema first
const schema = mock.stateGetSchema('plugin/number')
console.log(schema) // { type: 'number' }
```

### Issue 10: Test Timeout

**Symptoms:**
```
Test timed out (5000ms)
```

**Causes:**
- Infinite loop
- Missing await on async operation
- Test never completes

**Solutions:**
```javascript
// ❌ Infinite loop
it('should complete', async () => {
  const mock = await mockPlugin(t, { name: 'plugin' })
  while (true) { /* never ends */ }
})

// ✅ Proper async handling
it('should complete', async () => {
  const mock = await mockPlugin(t, { name: 'plugin' })
  await mock.plugin.longRunningOperation()
  // Test completes
})

// ✅ Increase timeout if needed
it('should handle slow operation', async () => {
  // Test might need more time
}, { timeout: 10000 })
```

## 🔧 Debugging Techniques

### 1. Console Logging

```javascript
it('should debug state', async () => {
  const mock = await mockPlugin(t, { name: 'plugin' })
  
  // Log initial state
  console.log('Initial state:', mock.stateGetValue({ name: 'plugin/data' }))
  
  // Perform action
  mock.plugin.action()
  
  // Log final state
  console.log('Final state:', mock.stateGetValue({ name: 'plugin/data' }))
  
  // Assert
  const result = mock.stateGetValue({ name: 'plugin/data' })
  strictEqual(result.item, expected)
})
```

### 2. Mock Call Tracking

```javascript
it('should debug mock calls', async () => {
  const mockFn = t.mock.fn(() => 'result')
  
  const mock = await mockPlugin(t, {
    name: 'plugin',
    namedExports: { dependency: mockFn }
  })
  
  // Execute
  mock.plugin.action()
  
  // Debug mock
  console.log('Mock calls:', mockFn.mock.calls)
  console.log('Mock results:', mockFn.mock.results)
  
  // Verify
  strictEqual(mockFn.mock.calls.length, 1)
})
```

### 3. Step-by-Step Testing

```javascript
it('should debug step by step', async () => {
  const mock = await mockPlugin(t, { name: 'plugin' })
  
  // Step 1: Setup
  console.log('Step 1: Setting up state')
  await mock.stateSetValue({ name: 'plugin/data', value: 1 })
  console.log('State set:', mock.stateGetValue({ name: 'plugin/data' }))
  
  // Step 2: Action
  console.log('Step 2: Executing action')
  mock.plugin.increment()
  console.log('After action:', mock.stateGetValue({ name: 'plugin/data' }))
  
  // Step 3: Assert
  console.log('Step 3: Verifying result')
  const result = mock.stateGetValue({ name: 'plugin/data' })
  console.log('Final result:', result)
  strictEqual(result.item, 2)
})
```

### 4. Isolate Problematic Test

```javascript
// Comment out all other tests
describe('Plugin', () => {
  // it('test 1', async () => { ... })
  // it('test 2', async () => { ... })
  
  it('problematic test', async () => {
    // Focus on this one
    const mock = await mockPlugin(t, { name: 'plugin' })
    // Debug here
  })
  
  // it('test 4', async () => { ... })
})
```

### 5. Check Mock State

```javascript
it('should verify mock state', async () => {
  const mockGetValue = createMockGetValue(t)
  
  // Test mock independently first
  const testResult = mockGetValue({ a: { b: 'c' } }, 'a.b')
  console.log('Mock test:', testResult) // Should be 'c'
  
  // Then use in plugin
  const mock = await mockPlugin(t, {
    name: 'plugin',
    namedExports: { getValue: mockGetValue }
  })
  
  // Verify mock is working
  console.log('Mock calls before:', mockGetValue.mock.calls.length)
  
  mock.plugin.action()
  
  console.log('Mock calls after:', mockGetValue.mock.calls.length)
  console.log('Mock was called with:', mockGetValue.mock.calls[0])
})
```

## 🎯 Specific Error Messages

### "Expected values to be strictly equal"

```
AssertionError: Expected values to be strictly equal:
actual !== expected
```

**Solution:**
```javascript
// Check what you're actually getting
const result = mock.stateGetValue({ name: 'plugin/data' })
console.log('Actual:', result.item)
console.log('Expected:', expected)

// Use deepStrictEqual for objects
deepStrictEqual(result.item, expected)
```

### "Expected function to throw"

```
AssertionError: Expected function to throw
```

**Solution:**
```javascript
// Check if it should throw
const result = mock.plugin.action()
console.log('Result:', result) // Maybe it returns error instead?

// Or check error message
throws(() => {
  mock.plugin.action()
}, /specific error message/)
```

### "Cannot read property of undefined"

```
TypeError: Cannot read property 'item' of undefined
```

**Solution:**
```javascript
// Check if state exists
const result = mock.stateGetValue({ name: 'plugin/data' })
console.log('Result:', result) // Might be undefined

// Initialize state first
await mock.stateSetValue({
  name: 'plugin/data',
  value: { key: 'value' }
})
```

## 🚀 Performance Issues

### Test Running Slow

**Symptoms:**
- Tests take too long
- Timeout errors
- Slow feedback loop

**Solutions:**

1. **Minimize setup**
```javascript
// ❌ Slow - setup in each test
it('test 1', async () => {
  const mock = await mockPlugin(t, { name: 'plugin' })
  // ...
})

it('test 2', async () => {
  const mock = await mockPlugin(t, { name: 'plugin' })
  // ...
})

// ✅ Fast - shared setup
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

2. **Use simple mocks**
```javascript
// ❌ Complex mock
const mockFn = t.mock.fn((...args) => {
  // Complex logic
  if (args[0] === 'special') {
    return { nested: { deep: 'value' } }
  }
  // ...
})

// ✅ Simple mock
const mockFn = t.mock.fn(() => 'simple-result')
```

3. **Skip unnecessary tests**
```javascript
// Don't test every combination
// Test representative samples
```

## 📋 Test Debugging Checklist

When a test fails:

1. **Check imports**
   - [ ] Are all imports correct?
   - [ ] Is `#mock` available?

2. **Check async/await**
   - [ ] Is `await` used for `mockPlugin`?
   - [ ] Is `await` used for state operations?
   - [ ] Is `await` used for plugin actions?

3. **Check setup/teardown**
   - [ ] Is `beforeEach` async?
   - [ ] Is `afterEach` restoring mocks?
   - [ ] Are mocks created fresh for each test?

4. **Check state**
   - [ ] Is state initialized?
   - [ ] Are state paths correct?
   - [ ] Is state being updated?

5. **Check mocks**
   - [ ] Are mocks injected correctly?
   - [ ] Are named export keys correct?
   - [ ] Are mock functions called?

6. **Check assertions**
   - [ ] Are assertions correct?
   - [ ] Are you testing the right thing?
   - [ ] Are you using strictEqual/deepStrictEqual?

7. **Check error handling**
   - [ ] Are errors being caught?
   - [ ] Are error messages correct?
   - [ ] Are you testing error cases?

## 🎯 Quick Fixes

### Fix 1: Test Won't Start
```javascript
// Add this to see what's happening
console.log('Test starting')
const mock = await mockPlugin(t, { name: 'plugin' })
console.log('Mock created')
```

### Fix 2: State Not Updating
```javascript
// Log before and after
console.log('Before:', mock.stateGetValue({ name: 'plugin/data' }))
await mock.stateSetValue({ name: 'plugin/data', value: 1 })
console.log('After:', mock.stateGetValue({ name: 'plugin/data' }))
```

### Fix 3: Mock Not Called
```javascript
// Verify mock exists and is called
const mockFn = t.mock.fn(() => 'result')
console.log('Mock created:', typeof mockFn)
// ... later ...
console.log('Mock called:', mockFn.mock.calls.length)
```

### Fix 4: Test Times Out
```javascript
// Add timeout and debug
it('should work', async () => {
  console.log('Starting')
  // ... test code ...
  console.log('Finished')
}, { timeout: 10000 })
```

## 🆘 When All Else Fails

1. **Simplify the test**
   ```javascript
   // Start with simplest possible test
   it('should work', async () => {
     const mock = await mockPlugin(t, { name: 'plugin' })
     ok(true) // Just pass
   })
   ```

2. **Add logging everywhere**
   ```javascript
   console.log('Before mock')
   const mock = await mockPlugin(t, { name: 'plugin' })
   console.log('After mock', mock)
   ```

3. **Check existing tests**
   - Look at working tests in `packages/plugins/test/`
   - Copy their structure
   - Adapt to your needs

4. **Ask for help**
   - Check the plugin source code
   - Review the mock utilities
   - Look at similar plugins

---

**Remember**: The most common issues are missing `await`, wrong import paths, and forgetting to restore mocks. Always check these first!
