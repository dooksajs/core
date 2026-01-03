# Simple Test Pattern

This guide covers testing plugins that don't require state management or external dependencies - the foundation of your testing journey.

## 🎯 When to Use This Pattern

### ✅ Use Simple Tests For:

- **Pure functions**: Mathematical operations, string manipulation
- **Stateless utilities**: Validation, formatting, parsing
- **Direct logic**: No side effects, no state changes
- **Operators**: Comparison, arithmetic, logical operations

### ❌ Don't Use For:

- **State-dependent operations**: Anything that reads/writes state
- **External dependencies**: API calls, file system, database
- **Plugin interactions**: Multiple plugins working together
- **Async operations**: Promises, timers, I/O

## 🏗️ Basic Structure

### Template

```javascript
import { describe, it } from 'node:test'
import { strictEqual, deepStrictEqual, throws } from 'node:assert/strict'

describe('PluginName - FunctionName', () => {
  it('should [expected behavior] with [input]', () => {
    // Arrange: Prepare inputs
    const input = 'test-value'
    
    // Act: Execute function
    const result = pluginFunction(input)
    
    // Assert: Verify output
    strictEqual(result, 'expected-value')
  })
})
```

## 📋 Real-World Examples

### Example 1: Mathematical Operators

Based on the existing operator tests, here's how to test mathematical operations:

```javascript
import { describe, it } from 'node:test'
import { strictEqual } from 'node:assert/strict'
import { operatorEval } from '#client'

describe('Operator - Addition', () => {
  it('should add two positive numbers', () => {
    const result = operatorEval({
      name: '+',
      values: [2, 3]
    })
    strictEqual(result, 5)
  })

  it('should handle negative numbers', () => {
    const result = operatorEval({
      name: '+',
      values: [-5, 3]
    })
    strictEqual(result, -2)
  })

  it('should handle zero', () => {
    const result = operatorEval({
      name: '+',
      values: [0, 0]
    })
    strictEqual(result, 0)
  })

  it('should handle multiple values', () => {
    const result = operatorEval({
      name: '+',
      values: [1, 2, 3, 4]
    })
    strictEqual(result, 10)
  })

  it('should handle string concatenation', () => {
    const result = operatorEval({
      name: '+',
      values: ['hello', ' ', 'world']
    })
    strictEqual(result, 'hello world')
  })
})
```

### Example 2: Comparison Operators

```javascript
describe('Operator - Greater Than', () => {
  it('should return true when first is greater', () => {
    const result = operatorEval({
      name: '>',
      values: [5, 3]
    })
    strictEqual(result, true)
  })

  it('should return false when first is less', () => {
    const result = operatorEval({
      name: '>',
      values: [2, 4]
    })
    strictEqual(result, false)
  })

  it('should return false when equal', () => {
    const result = operatorEval({
      name: '>',
      values: [5, 5]
    })
    strictEqual(result, false)
  })

  it('should work with negative numbers', () => {
    const result = operatorEval({
      name: '>',
      values: [-1, -2]
    })
    strictEqual(result, true)
  })
})
```

### Example 3: Logical Operators

```javascript
describe('Operator - Logical NOT', () => {
  it('should invert false to true', () => {
    const result = operatorEval({
      name: '!',
      values: [false]
    })
    strictEqual(result, true)
  })

  it('should invert true to false', () => {
    const result = operatorEval({
      name: '!',
      values: [true]
    })
    strictEqual(result, false)
  })

  it('should treat falsy values as false', () => {
    const falsyValues = [0, '', null, undefined, NaN]
    
    falsyValues.forEach(value => {
      const result = operatorEval({
        name: '!',
        values: [value]
      })
      strictEqual(result, true, `Failed for ${value}`)
    })
  })

  it('should treat truthy values as true', () => {
    const truthyValues = [1, -1, '0', 'false', [], {}]
    
    truthyValues.forEach(value => {
      const result = operatorEval({
        name: '!',
        values: [value]
      })
      strictEqual(result, false, `Failed for ${JSON.stringify(value)}`)
    })
  })
})
```

### Example 4: Type Checking

```javascript
describe('Operator - Typeof', () => {
  it('should identify strings', () => {
    const result = operatorEval({
      name: 'typeof',
      values: ['hello']
    })
    strictEqual(result, 'string')
  })

  it('should identify numbers', () => {
    const result = operatorEval({
      name: 'typeof',
      values: [42]
    })
    strictEqual(result, 'number')
  })

  it('should identify arrays as "array"', () => {
    const result = operatorEval({
      name: 'typeof',
      values: [[1, 2, 3]]
    })
    strictEqual(result, 'array')
  })

  it('should identify null as "object"', () => {
    const result = operatorEval({
      name: 'typeof',
      values: [null]
    })
    strictEqual(result, 'object')
  })

  it('should identify functions', () => {
    const result = operatorEval({
      name: 'typeof',
      values: [() => {}]
    })
    strictEqual(result, 'function')
  })
})
```

### Example 5: String Operations

```javascript
describe('String Utilities', () => {
  // Assuming a string utility plugin exists
  const stringPlugin = {
    capitalize: (str) => str.charAt(0).toUpperCase() + str.slice(1),
    reverse: (str) => str.split('').reverse().join(''),
    isEmpty: (str) => str.length === 0
  }

  describe('capitalize', () => {
    it('should capitalize first letter', () => {
      const result = stringPlugin.capitalize('hello')
      strictEqual(result, 'Hello')
    })

    it('should handle single character', () => {
      const result = stringPlugin.capitalize('a')
      strictEqual(result, 'A')
    })

    it('should handle empty string', () => {
      const result = stringPlugin.capitalize('')
      strictEqual(result, '')
    })

    it('should preserve existing capitalization', () => {
      const result = stringPlugin.capitalize('Hello')
      strictEqual(result, 'Hello')
    })
  })

  describe('reverse', () => {
    it('should reverse a string', () => {
      const result = stringPlugin.reverse('hello')
      strictEqual(result, 'olleh')
    })

    it('should handle palindrome', () => {
      const result = stringPlugin.reverse('racecar')
      strictEqual(result, 'racecar')
    })

    it('should handle single character', () => {
      const result = stringPlugin.reverse('a')
      strictEqual(result, 'a')
    })
  })

  describe('isEmpty', () => {
    it('should return true for empty string', () => {
      const result = stringPlugin.isEmpty('')
      strictEqual(result, true)
    })

    it('should return false for non-empty string', () => {
      const result = stringPlugin.isEmpty('hello')
      strictEqual(result, false)
    })

    it('should return true for whitespace-only string', () => {
      // Depending on requirements
      const result = stringPlugin.isEmpty('   ')
      strictEqual(result, false) // Usually whitespace is not empty
    })
  })
})
```

## 🎯 Testing Strategies

### 1. Boundary Testing

Test the edges of valid input ranges:

```javascript
describe('Boundary Testing', () => {
  it('should handle minimum value', () => {
    const result = operatorEval({ name: '*', values: [0, 5] })
    strictEqual(result, 0)
  })

  it('should handle maximum value', () => {
    const result = operatorEval({ name: '+', values: [Number.MAX_SAFE_INTEGER, 1] })
    strictEqual(result, Number.MAX_SAFE_INTEGER + 1)
  })

  it('should handle empty array', () => {
    const result = operatorEval({ name: '~', values: [[], 1] })
    strictEqual(result, false)
  })

  it('should handle empty string', () => {
    const result = operatorEval({ name: '~', values: ['', 'a'] })
    strictEqual(result, false)
  })
})
```

### 2. Edge Case Testing

```javascript
describe('Edge Cases', () => {
  it('should handle null values', () => {
    const result = operatorEval({ name: '==', values: [null, null] })
    strictEqual(result, true)
  })

  it('should handle undefined', () => {
    const result = operatorEval({ name: '==', values: [undefined, undefined] })
    strictEqual(result, true)
  })

  it('should distinguish null from undefined', () => {
    const result = operatorEval({ name: '==', values: [null, undefined] })
    strictEqual(result, false)
  })

  it('should handle NaN', () => {
    const result = operatorEval({ name: 'typeof', values: [NaN] })
    strictEqual(result, 'number') // NaN is technically a number
  })
})
```

### 3. Error Testing

```javascript
describe('Error Handling', () => {
  it('should throw on invalid operator', () => {
    try {
      operatorEval({ name: 'invalid', values: [1] })
      strictEqual(true, false, 'Should have thrown')
    } catch (error) {
      strictEqual(error.message.includes('No operator found'), true)
    }
  })

  it('should throw on invalid input types', () => {
    try {
      operatorEval({ name: '++', values: [{}] })
      strictEqual(true, false, 'Should have thrown')
    } catch (error) {
      strictEqual(error.message.includes('expects a number'), true)
    }
  })

  it('should handle missing values', () => {
    const result = operatorEval({ name: '+', values: [] })
    // Depending on implementation
    strictEqual(result, 0) // or undefined, or throw
  })
})
```

## 🎨 Best Practices

### ✅ DO

1. **Use descriptive test names**
   ```javascript
   it('should add two positive numbers', () => { ... })
   // Not: it('test1', () => { ... })
   ```

2. **Test one concept per test**
   ```javascript
   it('should handle positive numbers', () => { ... })
   it('should handle negative numbers', () => { ... })
   // Not: it('should handle all numbers', () => { ... })
   ```

3. **Use AAA pattern**
   ```javascript
   // Arrange
   const input = [1, 2]
   
   // Act
   const result = add(...input)
   
   // Assert
   strictEqual(result, 3)
   ```

4. **Group related tests**
   ```javascript
   describe('Addition', () => {
     it('handles positives', () => { ... })
     it('handles negatives', () => { ... })
   })
   ```

### ❌ DON'T

1. **Don't test implementation details**
   ```javascript
   // ❌ Bad
   it('should call internal helper', () => {
     // Testing HOW it works, not WHAT it does
   })
   
   // ✅ Good
   it('should return correct result', () => {
     // Testing WHAT it does
   })
   ```

2. **Don't use magic numbers**
   ```javascript
   // ❌ Bad
   strictEqual(result, 42)
   
   // ✅ Good
   const EXPECTED_RESULT = 42
   strictEqual(result, EXPECTED_RESULT)
   ```

3. **Don't skip assertions**
   ```javascript
   // ❌ Bad
   it('should work', () => {
     add(1, 2) // No assertion!
   })
   
   // ✅ Good
   it('should work', () => {
     strictEqual(add(1, 2), 3)
   })
   ```

## 🚀 Complete Example

Here's a complete test file for a simple calculator plugin:

```javascript
import { describe, it } from 'node:test'
import { strictEqual, throws } from 'node:assert/strict'

// Assuming these are exported from your plugin
const calculator = {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b,
  multiply: (a, b) => a * b,
  divide: (a, b) => {
    if (b === 0) throw new Error('Division by zero')
    return a / b
  }
}

describe('Calculator Plugin', () => {
  describe('add', () => {
    it('should add two positive numbers', () => {
      strictEqual(calculator.add(2, 3), 5)
    })

    it('should add negative numbers', () => {
      strictEqual(calculator.add(-2, -3), -5)
    })

    it('should add zero', () => {
      strictEqual(calculator.add(5, 0), 5)
    })

    it('should add decimals', () => {
      strictEqual(calculator.add(1.5, 2.5), 4)
    })
  })

  describe('subtract', () => {
    it('should subtract smaller from larger', () => {
      strictEqual(calculator.subtract(5, 3), 2)
    })

    it('should subtract larger from smaller', () => {
      strictEqual(calculator.subtract(3, 5), -2)
    })

    it('should subtract from zero', () => {
      strictEqual(calculator.subtract(0, 5), -5)
    })
  })

  describe('multiply', () => {
    it('should multiply positive numbers', () => {
      strictEqual(calculator.multiply(3, 4), 12)
    })

    it('should multiply by zero', () => {
      strictEqual(calculator.multiply(5, 0), 0)
    })

    it('should multiply negative numbers', () => {
      strictEqual(calculator.multiply(-2, -3), 6)
    })
  })

  describe('divide', () => {
    it('should divide evenly', () => {
      strictEqual(calculator.divide(10, 2), 5)
    })

    it('should divide with remainder', () => {
      strictEqual(calculator.divide(10, 3), 10 / 3)
    })

    it('should throw on division by zero', () => {
      throws(() => calculator.divide(5, 0), /Division by zero/)
    })
  })
})
```

## 🎓 Learning Checklist

- [ ] Understand what makes a function "pure"
- [ ] Can identify when to use simple vs state-dependent tests
- [ ] Practice AAA pattern (Arrange, Act, Assert)
- [ ] Test edge cases and boundaries
- [ ] Write descriptive test names
- [ ] Group related tests with describe blocks
- [ ] Handle errors properly
- [ ] Avoid common anti-patterns

## 🚀 Next Steps

Once you're comfortable with simple tests:

1. **[State-Dependent Tests](./state-dependent.md)** - When your plugin needs state
2. **[Mocking](../mocking.md)** - How to mock dependencies
3. **[Complex Tests](./complex.md)** - Multi-plugin integration

---

**Practice time!** Take a simple utility function from your codebase and write comprehensive tests for it using this pattern.
