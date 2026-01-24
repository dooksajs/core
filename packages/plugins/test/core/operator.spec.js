import { describe, it } from 'node:test'
import { strictEqual, ok, fail } from 'node:assert'
import { createPluginTester } from '@dooksa/test'
import { operator } from '#core'

/**
 * Helper function to set up the operator plugin
 * @param {import('node:test').TestContext} t - Test context
 * @returns {Object} Object with tester and operator plugin instance
 */
function setupOperatorPlugin (t) {
  const tester = createPluginTester(t)
  const operatorPlugin = tester.spy('operator', operator)

  return {
    tester,
    operatorPlugin
  }
}

describe('Operator eval', function () {
  it('should fail if operator is not found', function () {
    const { tester, operatorPlugin } = setupOperatorPlugin(this)

    try {
      operatorPlugin.operatorEval({
        // @ts-ignore
        name: 'doThis',
        values: [1]
      })
      fail('Expected to throw an error')
    } catch (error) {
      strictEqual(error.message, 'No operator found: doThis')
      ok(error instanceof Error)
    }

    tester.restoreAll()
  })

  describe('Equality (==)', function () {
    it('should return true if the operands are equal', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '==',
        values: [1, 1]
      })

      strictEqual(result, true)

      tester.restoreAll()
    })

    it('should return false if the operands are of different type', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '==',
        // @ts-ignore
        values: [1, '1']
      })

      strictEqual(result, false)

      tester.restoreAll()
    })

    it('should return false for null == undefined (strict equality)', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '==',
        values: [null, undefined]
      })

      strictEqual(result, false)

      tester.restoreAll()
    })

    it('should return false for null == 0', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '==',
        values: [null, 0]
      })

      strictEqual(result, false)

      tester.restoreAll()
    })
  })

  describe('Inequality (!=)', function () {
    it('should return true with different values', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '!=',
        values: [1, 2]
      })

      strictEqual(result, true)

      tester.restoreAll()
    })

    it('should return true with values of different types', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '!=',
        // @ts-ignore
        values: [1, '1']
      })

      strictEqual(result, true)

      tester.restoreAll()
    })

    it('should return true for null != undefined', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '!=',
        values: [null, undefined]
      })

      strictEqual(result, true)

      tester.restoreAll()
    })

    it('should return true for null != 0', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '!=',
        values: [null, 0]
      })

      strictEqual(result, true)

      tester.restoreAll()
    })
  })

  describe('Greater than (>)', function () {
    it('should return true if the first operand is greater than the second operand', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '>',
        values: [2, 1]
      })

      strictEqual(result, true)

      tester.restoreAll()
    })

    it('should return false if the first operand is less than the second operand', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '>',
        values: [1, 2]
      })

      strictEqual(result, false)

      tester.restoreAll()
    })

    it('should return false if the first operand is equal to the second operand', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '>',
        values: [1, 1]
      })

      strictEqual(result, false)

      tester.restoreAll()
    })

    it('should work with negative numbers', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '>',
        values: [-1, -2]
      })

      strictEqual(result, true)

      tester.restoreAll()
    })

    it('should work with zero', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '>',
        values: [0, -1]
      })

      strictEqual(result, true)

      tester.restoreAll()
    })
  })

  describe('Greater than or equal (>=)', function () {
    it('should return true if the first operand is greater than the second operand', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '>=',
        values: [2, 1]
      })

      strictEqual(result, true)

      tester.restoreAll()
    })

    it('should return false if the first operand is less than the second operand', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '>=',
        values: [1, 2]
      })

      strictEqual(result, false)

      tester.restoreAll()
    })

    it('should return true if the first operand is equal to the second operand', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '>=',
        values: [1, 1]
      })

      strictEqual(result, true)

      tester.restoreAll()
    })

    it('should work with negative numbers', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '>=',
        values: [-1, -2]
      })

      strictEqual(result, true)

      tester.restoreAll()
    })

    it('should work with zero', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '>=',
        values: [0, 0]
      })

      strictEqual(result, true)

      tester.restoreAll()
    })
  })

  describe('Less than (<)', function () {
    it('should return true if the first operand is less than the second operand', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '<',
        values: [1, 2]
      })

      strictEqual(result, true)

      tester.restoreAll()
    })

    it('should return false if the first operand is greater than the second operand', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '<',
        values: [2, 1]
      })

      strictEqual(result, false)

      tester.restoreAll()
    })

    it('should return false if the first operand is equal to the second operand', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '<',
        values: [1, 1]
      })

      strictEqual(result, false)

      tester.restoreAll()
    })

    it('should work with negative numbers', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '<',
        values: [-2, -1]
      })

      strictEqual(result, true)

      tester.restoreAll()
    })

    it('should work with zero', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '<',
        values: [-1, 0]
      })

      strictEqual(result, true)

      tester.restoreAll()
    })
  })

  describe('Less than or equal (<=)', function () {
    it('should return true if the first operand is less than the second operand', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '<=',
        values: [1, 2]
      })

      strictEqual(result, true)

      tester.restoreAll()
    })

    it('should return false if the first operand is greater than the second operand', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '<=',
        values: [2, 1]
      })

      strictEqual(result, false)

      tester.restoreAll()
    })

    it('should return true if the first operand is equal to the second operand', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '<=',
        values: [1, 1]
      })

      strictEqual(result, true)

      tester.restoreAll()
    })

    it('should work with negative numbers', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '<=',
        values: [-2, -1]
      })

      strictEqual(result, true)

      tester.restoreAll()
    })

    it('should work with zero', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '<=',
        values: [0, 0]
      })

      strictEqual(result, true)

      tester.restoreAll()
    })
  })

  describe('Remainder (%)', function () {
    it('should return 0 if the first operand is a multiple of the second operand', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '%',
        values: [6, 2]
      })

      strictEqual(result === 0, true)

      tester.restoreAll()
    })

    it('should return 0 if the first operand, expressed as a string, is a multiple of the second operand', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '%',
        values: ['6', 2]
      })

      strictEqual(result === 0, true)

      tester.restoreAll()
    })

    it('should return NaN if the first operand is expressed as a non-numeric string', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '%',
        values: ['six', 2]
      })

      strictEqual(isNaN(result), true)

      tester.restoreAll()
    })

    it('should return 2 if the first operand is equal to a multiple of the second operand plus 2', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '%',
        values: [14, 4]
      })

      strictEqual(result, 2)

      tester.restoreAll()
    })

    it('should handle multiple values', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '%',
        values: [100, 7, 3]
      })

      strictEqual(result, 2) // 100 % 7 = 2

      tester.restoreAll()
    })

    it('should handle negative numbers', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '%',
        values: [-5, 3]
      })

      strictEqual(result, -2)

      tester.restoreAll()
    })

    it('should handle zero', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '%',
        values: [0, 5]
      })

      strictEqual(result, 0)

      tester.restoreAll()
    })
  })

  describe('Increment (++)', function () {
    it('should return a number 1 greater than the numeric operand', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '++',
        values: [1]
      })

      strictEqual(result, 2)

      tester.restoreAll()
    })

    it('should return a string 1 greater than the numeric string operand', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '++',
        values: ['5']
      })

      strictEqual(result, '6')

      tester.restoreAll()
    })

    it('should return a number 1 greater than the rounded float operand', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '++',
        values: [1e-34]
      })
      strictEqual(result, 1)

      tester.restoreAll()
    })

    it('should return NaN for a non-numeric string operand', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '++',
        values: ['one']
      })

      strictEqual(isNaN(result), true)

      tester.restoreAll()
    })

    it('should throw an error if value is not a number or string', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      try {
        operatorPlugin.operatorEval({
          name: '++',
          values: [undefined]
        })

        fail('Expected error was now thrown')
      } catch (error) {
        strictEqual(error.message, 'Increment operator expects a number but found "undefined"')
        ok(error instanceof Error)
      }

      tester.restoreAll()
    })

    it('should throw an error for object type', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      try {
        operatorPlugin.operatorEval({
          name: '++',
          values: [{}]
        })

        fail('Expected error was now thrown')
      } catch (error) {
        strictEqual(error.message, 'Increment operator expects a number but found "object"')
        ok(error instanceof Error)
      }

      tester.restoreAll()
    })

    it('should handle negative numbers', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '++',
        values: [-5]
      })

      strictEqual(result, -4)

      tester.restoreAll()
    })
  })

  describe('Decrement (--)', function () {
    it('should return a number 1 less than the operand', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '--',
        values: [1]
      })

      strictEqual(result, 0)

      tester.restoreAll()
    })

    it('should return a number 1 less than the rounded float operand', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '--',
        values: [1e-34]
      })

      strictEqual(result, -1)

      tester.restoreAll()
    })

    it('should return a string 1 less than the numeric string operand', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '--',
        values: ['5']
      })

      strictEqual(result, '4')

      tester.restoreAll()
    })

    it('should return NaN for a non-numeric string operand', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '--',
        values: ['one']
      })

      strictEqual(isNaN(result), true)

      tester.restoreAll()
    })

    it('should throw an error if value is not a number or string', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      try {
        operatorPlugin.operatorEval({
          name: '--',
          values: [undefined]
        })

        fail('Expected error was now thrown')
      } catch (error) {
        strictEqual(error.message, 'Decrement operator expects a number but found "undefined"')
        ok(error instanceof Error)
      }

      tester.restoreAll()
    })

    it('should throw an error for object type', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      try {
        operatorPlugin.operatorEval({
          name: '--',
          values: [{}]
        })

        fail('Expected error was now thrown')
      } catch (error) {
        strictEqual(error.message, 'Decrement operator expects a number but found "object"')
        ok(error instanceof Error)
      }

      tester.restoreAll()
    })

    it('should handle negative numbers', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '--',
        values: [-5]
      })

      strictEqual(result, -6)

      tester.restoreAll()
    })
  })

  describe('Exponentiation (**)', function () {
    it('should return the first operand to the power of the second', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '**',
        values: [2, 3]
      })

      strictEqual(result, 8)

      tester.restoreAll()
    })

    it('should return a valid number from a small float operand and small positive integer second', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '**',
        values: [1e-34, 4]
      })

      // Use approximate comparison for floating point precision
      strictEqual(
        result > 9.99e-137 && result < 1e-136,
        true
      )

      tester.restoreAll()
    })

    it('should return a number with at least one numeric string operand', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '**',
        values: ['2', 4]
      })

      strictEqual(result, 16)

      tester.restoreAll()
    })

    it('should return NaN for a non-numeric string operand', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '**',
        values: ['two', 4]
      })

      strictEqual(isNaN(result), true)

      tester.restoreAll()
    })

    it('should handle zero exponent', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '**',
        values: [5, 0]
      })

      strictEqual(result, 1)

      tester.restoreAll()
    })

    it('should handle negative base', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '**',
        values: [-2, 3]
      })

      strictEqual(result, -8)

      tester.restoreAll()
    })

    it('should handle fractional exponent', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '**',
        values: [4, 0.5]
      })

      strictEqual(result, 2)

      tester.restoreAll()
    })
  })

  describe('Addition (+)', function () {
    it('should return a number if the operands are numbers', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '+',
        values: [1, 2]
      })

      strictEqual(result, 3)

      tester.restoreAll()
    })

    it('should return a string concatenation if the operands are numbers that may be expressed as a string', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '+',
        values: ['1', 2]
      })

      strictEqual(result, '12')

      tester.restoreAll()
    })

    it('should handle multiple number values', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '+',
        values: [1, 2, 3, 4]
      })

      strictEqual(result, 10)

      tester.restoreAll()
    })

    it('should handle multiple string values', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '+',
        values: ['hello', ' ', 'world']
      })

      strictEqual(result, 'hello world')

      tester.restoreAll()
    })

    it('should handle mixed string and number', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '+',
        values: ['age: ', 25]
      })

      strictEqual(result, 'age: 25')

      tester.restoreAll()
    })

    it('should handle negative numbers', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '+',
        values: [-5, 3]
      })

      strictEqual(result, -2)

      tester.restoreAll()
    })

    it('should handle zero', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '+',
        values: [0, 0]
      })

      strictEqual(result, 0)

      tester.restoreAll()
    })
  })

  describe('Subtraction (-)', function () {
    it('should return a number if the operands are numbers', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '-',
        values: [1, 2]
      })

      strictEqual(result, -1)

      tester.restoreAll()
    })

    it('should return a number if the operands are numbers that may be expressed as a string', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '-',
        values: ['1', 2]
      })

      strictEqual(result, -1)

      tester.restoreAll()
    })

    it('should handle multiple values', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '-',
        values: [10, 3, 2]
      })

      strictEqual(result, 5) // 10 - 3 - 2 = 5

      tester.restoreAll()
    })

    it('should handle negative numbers', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '-',
        values: [-5, -3]
      })

      strictEqual(result, -2)

      tester.restoreAll()
    })

    it('should handle zero', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '-',
        values: [0, 5]
      })

      strictEqual(result, -5)

      tester.restoreAll()
    })
  })

  describe('Multiplication (*)', function () {
    it('should return a number if the operands are numbers', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '*',
        values: [2, 3]
      })

      strictEqual(result, 6)

      tester.restoreAll()
    })

    it('should return a number if the operands are numbers that may be expressed as a string', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '*',
        values: ['2', 3]
      })

      strictEqual(result, 6)

      tester.restoreAll()
    })

    it('should handle multiple values', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '*',
        values: [2, 3, 4]
      })

      strictEqual(result, 24)

      tester.restoreAll()
    })

    it('should handle negative numbers', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '*',
        values: [-2, 3]
      })

      strictEqual(result, -6)

      tester.restoreAll()
    })

    it('should handle zero', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '*',
        values: [5, 0]
      })

      strictEqual(result, 0)

      tester.restoreAll()
    })

    it('should handle multiplication by 1', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '*',
        values: [5, 1]
      })

      strictEqual(result, 5)

      tester.restoreAll()
    })
  })

  describe('Logical NOT (!)', function () {
    it('should return true if the operand is falsy', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '!',
        values: [false]
      })

      strictEqual(result, true)

      tester.restoreAll()
    })

    it('should return false if the operator expression is true', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '!',
        values: ['3 > 2']
      })

      strictEqual(result, false)

      tester.restoreAll()
    })

    it('should return true for 0', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '!',
        values: [0]
      })

      strictEqual(result, true)

      tester.restoreAll()
    })

    it('should return true for empty string', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '!',
        values: ['']
      })

      strictEqual(result, true)

      tester.restoreAll()
    })

    it('should return true for null', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '!',
        values: [null]
      })

      strictEqual(result, true)

      tester.restoreAll()
    })

    it('should return true for undefined', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '!',
        values: [undefined]
      })

      strictEqual(result, true)

      tester.restoreAll()
    })

    it('should return true for NaN', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '!',
        values: [NaN]
      })

      strictEqual(result, true)

      tester.restoreAll()
    })

    it('should return false for truthy values', function () {
      const truthyValues = [1, -1, '0', 'false', [], {}, true]

      truthyValues.forEach(value => {
        const { tester, operatorPlugin } = setupOperatorPlugin(this)

        const result = operatorPlugin.operatorEval({
          name: '!',
          values: [value]
        })
        strictEqual(result, false, `Expected !${JSON.stringify(value)} to be false`)

        tester.restoreAll()
      })
    })
  })

  describe('Boolean (!!)', function () {
    it('should return false if the operand is falsey', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '!!',
        values: [false]
      })

      strictEqual(result, false)

      tester.restoreAll()
    })

    it('should return true if the operand is truthy', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '!!',
        values: ['false']
      })

      strictEqual(result, true)

      tester.restoreAll()
    })

    it('should return false for 0', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '!!',
        values: [0]
      })

      strictEqual(result, false)

      tester.restoreAll()
    })

    it('should return false for empty string', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '!!',
        values: ['']
      })

      strictEqual(result, false)

      tester.restoreAll()
    })

    it('should return false for null', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '!!',
        values: [null]
      })

      strictEqual(result, false)

      tester.restoreAll()
    })

    it('should return false for undefined', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '!!',
        values: [undefined]
      })

      strictEqual(result, false)

      tester.restoreAll()
    })

    it('should return false for NaN', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '!!',
        values: [NaN]
      })

      strictEqual(result, false)

      tester.restoreAll()
    })

    it('should return true for positive numbers', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '!!',
        values: [1]
      })

      strictEqual(result, true)

      tester.restoreAll()
    })

    it('should return true for negative numbers', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '!!',
        values: [-1]
      })

      strictEqual(result, true)

      tester.restoreAll()
    })

    it('should return true for non-empty strings', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '!!',
        values: ['hello']
      })

      strictEqual(result, true)

      tester.restoreAll()
    })

    it('should return true for arrays', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '!!',
        values: [[]]
      })

      strictEqual(result, true)

      tester.restoreAll()
    })

    it('should return true for objects', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '!!',
        values: [{}]
      })

      strictEqual(result, true)

      tester.restoreAll()
    })
  })

  describe('Includes (~)', function () {
    it('should return true when searching for an existing value in array', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '~',
        values: [
          [1, 2, 3],
          2
        ]
      })

      strictEqual(result, true)

      tester.restoreAll()
    })

    it('should return false when searching for a non-existing value in array', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '~',
        values: [
          [1, 2, 3],
          4
        ]
      })

      strictEqual(result, false)

      tester.restoreAll()
    })

    it('should return true when searching for a substring in string', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '~',
        values: ['hello world', 'world']
      })

      strictEqual(result, true)

      tester.restoreAll()
    })

    it('should return false when searching for a non-existing substring in string', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '~',
        values: ['hello world', 'moon']
      })

      strictEqual(result, false)

      tester.restoreAll()
    })

    it('should return true for exact string match', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '~',
        values: ['hello', 'hello']
      })

      strictEqual(result, true)

      tester.restoreAll()
    })

    it('should handle empty array', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '~',
        values: [[], 1]
      })

      strictEqual(result, false)

      tester.restoreAll()
    })

    it('should handle empty string', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: '~',
        values: ['', 'a']
      })

      strictEqual(result, false)

      tester.restoreAll()
    })
  })

  describe('Typeof', function () {
    it('should return "string" when value is a string', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: 'typeof',
        values: ['red']
      })

      strictEqual(result, 'string')

      tester.restoreAll()
    })

    it('should return "number" when value is a number', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: 'typeof',
        values: [1]
      })

      strictEqual(result, 'number')

      tester.restoreAll()
    })

    it('should return "boolean" when value is a boolean', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: 'typeof',
        values: [true]
      })

      strictEqual(result, 'boolean')

      tester.restoreAll()
    })

    it('should return "array" when value is a Array', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: 'typeof',
        values: [[true]]
      })

      strictEqual(result, 'array')

      tester.restoreAll()
    })

    it('should return "object" when value is a Object', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: 'typeof',
        values: [{ a: true }]
      })

      strictEqual(result, 'object')

      tester.restoreAll()
    })

    it('should return "object" when value is null', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: 'typeof',
        values: [null]
      })

      strictEqual(result, 'object')

      tester.restoreAll()
    })

    it('should return "undefined" when value is undefined', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: 'typeof',
        values: [undefined]
      })

      strictEqual(result, 'undefined')

      tester.restoreAll()
    })

    it('should return "function" when value is a function', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: 'typeof',
        values: [() => {
        }]
      })

      strictEqual(result, 'function')

      tester.restoreAll()
    })

    it('should return "number" for NaN', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorEval({
        name: 'typeof',
        values: [NaN]
      })

      strictEqual(result, 'number')

      tester.restoreAll()
    })
  })

  describe('Nullish operators', function () {
    describe('isNull', function () {
      it('should return true if value is null', function () {
        const { tester, operatorPlugin } = setupOperatorPlugin(this)

        const result = operatorPlugin.operatorEval({
          name: 'isNull',
          values: [null]
        })

        strictEqual(result, true)

        tester.restoreAll()
      })

      it('should return true if value is undefined', function () {
        const { tester, operatorPlugin } = setupOperatorPlugin(this)

        const result = operatorPlugin.operatorEval({
          name: 'isNull',
          values: [undefined]
        })

        strictEqual(result, true)

        tester.restoreAll()
      })

      it('should return false for 0', function () {
        const { tester, operatorPlugin } = setupOperatorPlugin(this)

        const result = operatorPlugin.operatorEval({
          name: 'isNull',
          values: [0]
        })

        strictEqual(result, false)

        tester.restoreAll()
      })

      it('should return false for empty string', function () {
        const { tester, operatorPlugin } = setupOperatorPlugin(this)

        const result = operatorPlugin.operatorEval({
          name: 'isNull',
          values: ['']
        })

        strictEqual(result, false)

        tester.restoreAll()
      })

      it('should return false for false', function () {
        const { tester, operatorPlugin } = setupOperatorPlugin(this)

        const result = operatorPlugin.operatorEval({
          name: 'isNull',
          values: [false]
        })

        strictEqual(result, false)

        tester.restoreAll()
      })
    })

    describe('notNull', function () {
      it('should return true if value is not nullish', function () {
        const { tester, operatorPlugin } = setupOperatorPlugin(this)

        const result = operatorPlugin.operatorEval({
          name: 'notNull',
          values: ['red']
        })

        strictEqual(result, true)

        tester.restoreAll()
      })

      it('should return false if value is null', function () {
        const { tester, operatorPlugin } = setupOperatorPlugin(this)

        const result = operatorPlugin.operatorEval({
          name: 'notNull',
          values: [null]
        })

        strictEqual(result, false)

        tester.restoreAll()
      })

      it('should return false if value is undefined', function () {
        const { tester, operatorPlugin } = setupOperatorPlugin(this)

        const result = operatorPlugin.operatorEval({
          name: 'notNull',
          values: [undefined]
        })

        strictEqual(result, false)

        tester.restoreAll()
      })

      it('should return true for 0', function () {
        const { tester, operatorPlugin } = setupOperatorPlugin(this)

        const result = operatorPlugin.operatorEval({
          name: 'notNull',
          values: [0]
        })

        strictEqual(result, true)

        tester.restoreAll()
      })

      it('should return true for empty string', function () {
        const { tester, operatorPlugin } = setupOperatorPlugin(this)

        const result = operatorPlugin.operatorEval({
          name: 'notNull',
          values: ['']
        })

        strictEqual(result, true)

        tester.restoreAll()
      })

      it('should return true for false', function () {
        const { tester, operatorPlugin } = setupOperatorPlugin(this)

        const result = operatorPlugin.operatorEval({
          name: 'notNull',
          values: [false]
        })

        strictEqual(result, true)

        tester.restoreAll()
      })
    })
  })
})

describe('Operator compare', function () {
  describe('Logical compare', function () {
    it('should return true if one of Logical OR operand is truthy', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorCompare([
        {
          value_1: true,
          value_2: false,
          op: '||'
        },
        {
          value_1: true,
          value_2: false,
          op: '&&'
        }
      ])

      strictEqual(result, true)

      tester.restoreAll()
    })

    it('should return false if all operands are falsy', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorCompare([
        {
          value_1: false,
          value_2: false,
          op: '||'
        },
        {
          value_1: true,
          value_2: false,
          op: '&&'
        }
      ])

      strictEqual(result, false)

      tester.restoreAll()
    })
  })

  describe('Logical AND', function () {
    it('should return true if both operands are truthy', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorCompare([{
        value_1: true,
        value_2: true,
        op: '&&'
      }])

      strictEqual(result, true)

      tester.restoreAll()
    })

    it('should return false if one operand is falsy', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorCompare([{
        value_1: true,
        value_2: false,
        op: '&&'
      }])

      strictEqual(result, false)

      tester.restoreAll()
    })

    it('should return false if one operand is falsy of many', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorCompare([
        {
          value_1: true,
          value_2: true,
          op: '&&'
        },
        {
          value_1: true,
          value_2: false,
          op: '&&'
        }
      ])

      strictEqual(result, false)

      tester.restoreAll()
    })

    it('should return true for multiple truthy AND conditions', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorCompare([
        {
          value_1: true,
          value_2: true,
          op: '&&'
        },
        {
          value_1: 5,
          value_2: 3,
          op: '&&'
        }
      ])

      strictEqual(result, true)

      tester.restoreAll()
    })

    it('should handle mixed truthy and falsy values', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorCompare([
        {
          value_1: 1,
          value_2: 0,
          op: '&&'
        }
      ])

      strictEqual(result, false)

      tester.restoreAll()
    })
  })

  describe('Logical OR', function () {
    it('should return true if one operand is truthy', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorCompare([{
        value_1: true,
        value_2: false,
        op: '||'
      }])

      strictEqual(result, true)

      tester.restoreAll()
    })

    it('should return true if one operand is truthy of many', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorCompare([
        {
          value_1: true,
          value_2: false,
          op: '||'
        },
        {
          value_1: false,
          value_2: false,
          op: '||'
        }
      ])

      strictEqual(result, true)

      tester.restoreAll()
    })

    it('should return false if both operands are falsy', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorCompare([{
        value_1: false,
        value_2: false,
        op: '||'
      }])

      strictEqual(result, false)

      tester.restoreAll()
    })

    it('should return true for multiple OR conditions with one truthy', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorCompare([
        {
          value_1: false,
          value_2: false,
          op: '||'
        },
        {
          value_1: true,
          value_2: false,
          op: '||'
        }
      ])

      strictEqual(result, true)

      tester.restoreAll()
    })

    it('should handle mixed truthy and falsy values', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorCompare([
        {
          value_1: 0,
          value_2: 1,
          op: '||'
        }
      ])

      strictEqual(result, true)

      tester.restoreAll()
    })
  })

  describe('Mixed operators', function () {
    it('should return true when AND is true and OR is true', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorCompare([
        {
          value_1: true,
          value_2: true,
          op: '&&'
        },
        {
          value_1: false,
          value_2: true,
          op: '||'
        }
      ])

      strictEqual(result, true)

      tester.restoreAll()
    })

    it('should return true when AND is false but OR is true', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorCompare([
        {
          value_1: true,
          value_2: false,
          op: '&&'
        },
        {
          value_1: true,
          value_2: false,
          op: '||'
        }
      ])

      strictEqual(result, true)

      tester.restoreAll()
    })

    it('should return false when AND is false and OR is false', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorCompare([
        {
          value_1: true,
          value_2: false,
          op: '&&'
        },
        {
          value_1: false,
          value_2: false,
          op: '||'
        }
      ])

      strictEqual(result, false)

      tester.restoreAll()
    })

    it('should handle complex mixed conditions', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorCompare([
        {
          value_1: 5,
          value_2: 3,
          op: '&&'
        },
        {
          value_1: 0,
          value_2: 0,
          op: '||'
        },
        {
          value_1: true,
          value_2: true,
          op: '&&'
        }
      ])

      strictEqual(result, true)

      tester.restoreAll()
    })

    it('should handle numeric comparisons in compare', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorCompare([
        {
          value_1: 10,
          value_2: 5,
          op: '&&'
        }
      ])

      strictEqual(result, true)

      tester.restoreAll()
    })

    it('should handle empty array', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorCompare([])

      strictEqual(result, false)

      tester.restoreAll()
    })

    it('should handle single AND condition', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorCompare([
        {
          value_1: 1,
          value_2: 1,
          op: '&&'
        }
      ])

      strictEqual(result, true)

      tester.restoreAll()
    })

    it('should handle single OR condition', function () {
      const { tester, operatorPlugin } = setupOperatorPlugin(this)

      const result = operatorPlugin.operatorCompare([
        {
          value_1: 0,
          value_2: 0,
          op: '||'
        }
      ])

      strictEqual(result, false)

      tester.restoreAll()
    })
  })
})
