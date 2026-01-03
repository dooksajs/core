import { operatorCompare, operatorEval } from '#client'
import { describe, it } from 'node:test'
import { fail, ok, strictEqual } from 'node:assert'

describe('Operator eval', function () {
  it('should fail if operator is not found', function () {
    try {
      operatorEval({
        // @ts-ignore
        name: 'doThis',
        values: [1]
      })
      fail('Expected to throw an error')
    } catch (error) {
      strictEqual(error.message, 'No operator found: doThis')
      ok(error instanceof Error)
    }
  })

  describe('Equality (==)', function () {
    it('should return true if the operands are equal', function () {
      const result = operatorEval({
        name: '==',
        values: [1, 1]
      })

      strictEqual(result, true)
    })

    it('should return false if the operands are of different type', function () {
      const result = operatorEval({
        name: '==',
        // @ts-ignore
        values: [1, '1']
      })

      strictEqual(result, false)
    })

    it('should return false for null == undefined (strict equality)', function () {
      const result = operatorEval({
        name: '==',
        values: [null, undefined]
      })

      strictEqual(result, false)
    })

    it('should return false for null == 0', function () {
      const result = operatorEval({
        name: '==',
        values: [null, 0]
      })

      strictEqual(result, false)
    })
  })

  describe('Inequality (!=)', function () {
    it('should return true with different values', function () {
      const result = operatorEval({
        name: '!=',
        values: [1, 2]
      })

      strictEqual(result, true)
    })

    it('should return true with values of different types', function () {
      const result = operatorEval({
        name: '!=',
        // @ts-ignore
        values: [1, '1']
      })

      strictEqual(result, true)
    })

    it('should return true for null != undefined', function () {
      const result = operatorEval({
        name: '!=',
        values: [null, undefined]
      })

      strictEqual(result, true)
    })

    it('should return true for null != 0', function () {
      const result = operatorEval({
        name: '!=',
        values: [null, 0]
      })

      strictEqual(result, true)
    })
  })

  describe('Greater than (>)', function () {
    it('should return true if the first operand is greater than the second operand', function () {
      const result = operatorEval({
        name: '>',
        values: [2, 1]
      })

      strictEqual(result, true)
    })

    it('should return false if the first operand is less than the second operand', function () {
      const result = operatorEval({
        name: '>',
        values: [1, 2]
      })

      strictEqual(result, false)
    })

    it('should return false if the first operand is equal to the second operand', function () {
      const result = operatorEval({
        name: '>',
        values: [1, 1]
      })

      strictEqual(result, false)
    })

    it('should work with negative numbers', function () {
      const result = operatorEval({
        name: '>',
        values: [-1, -2]
      })

      strictEqual(result, true)
    })

    it('should work with zero', function () {
      const result = operatorEval({
        name: '>',
        values: [0, -1]
      })

      strictEqual(result, true)
    })
  })

  describe('Greater than or equal (>=)', function () {
    it('should return true if the first operand is greater than the second operand', function () {
      const result = operatorEval({
        name: '>=',
        values: [2, 1]
      })

      strictEqual(result, true)
    })

    it('should return false if the first operand is less than the second operand', function () {
      const result = operatorEval({
        name: '>=',
        values: [1, 2]
      })

      strictEqual(result, false)
    })

    it('should return true if the first operand is equal to the second operand', function () {
      const result = operatorEval({
        name: '>=',
        values: [1, 1]
      })

      strictEqual(result, true)
    })

    it('should work with negative numbers', function () {
      const result = operatorEval({
        name: '>=',
        values: [-1, -2]
      })

      strictEqual(result, true)
    })

    it('should work with zero', function () {
      const result = operatorEval({
        name: '>=',
        values: [0, 0]
      })

      strictEqual(result, true)
    })
  })

  describe('Less than (<)', function () {
    it('should return true if the first operand is less than the second operand', function () {
      const result = operatorEval({
        name: '<',
        values: [1, 2]
      })

      strictEqual(result, true)
    })

    it('should return false if the first operand is greater than the second operand', function () {
      const result = operatorEval({
        name: '<',
        values: [2, 1]
      })

      strictEqual(result, false)
    })

    it('should return false if the first operand is equal to the second operand', function () {
      const result = operatorEval({
        name: '<',
        values: [1, 1]
      })

      strictEqual(result, false)
    })

    it('should work with negative numbers', function () {
      const result = operatorEval({
        name: '<',
        values: [-2, -1]
      })

      strictEqual(result, true)
    })

    it('should work with zero', function () {
      const result = operatorEval({
        name: '<',
        values: [-1, 0]
      })

      strictEqual(result, true)
    })
  })

  describe('Less than or equal (<=)', function () {
    it('should return true if the first operand is less than the second operand', function () {
      const result = operatorEval({
        name: '<=',
        values: [1, 2]
      })

      strictEqual(result, true)
    })

    it('should return false if the first operand is greater than the second operand', function () {
      const result = operatorEval({
        name: '<=',
        values: [2, 1]
      })

      strictEqual(result, false)
    })

    it('should return true if the first operand is equal to the second operand', function () {
      const result = operatorEval({
        name: '<=',
        values: [1, 1]
      })

      strictEqual(result, true)
    })

    it('should work with negative numbers', function () {
      const result = operatorEval({
        name: '<=',
        values: [-2, -1]
      })

      strictEqual(result, true)
    })

    it('should work with zero', function () {
      const result = operatorEval({
        name: '<=',
        values: [0, 0]
      })

      strictEqual(result, true)
    })
  })

  describe('Remainder (%)', function () {
    it('should return 0 if the first operand is a multiple of the second operand', function () {
      const result = operatorEval({
        name: '%',
        values: [6, 2]
      })

      strictEqual(result === 0, true)
    })

    it('should return 0 if the first operand, expressed as a string, is a multiple of the second operand', function () {
      const result = operatorEval({
        name: '%',
        values: ['6', 2]
      })

      strictEqual(result === 0, true)
    })

    it('should return NaN if the first operand is expressed as a non-numeric string', function () {
      const result = operatorEval({
        name: '%',
        values: ['six', 2]
      })

      strictEqual(isNaN(result), true)
    })

    it('should return 2 if the first operand is equal to a multiple of the second operand plus 2', function () {
      const result = operatorEval({
        name: '%',
        values: [14, 4]
      })

      strictEqual(result, 2)
    })

    it('should handle multiple values', function () {
      const result = operatorEval({
        name: '%',
        values: [100, 7, 3]
      })

      strictEqual(result, 2) // 100 % 7 = 2
    })

    it('should handle negative numbers', function () {
      const result = operatorEval({
        name: '%',
        values: [-5, 3]
      })

      strictEqual(result, -2)
    })

    it('should handle zero', function () {
      const result = operatorEval({
        name: '%',
        values: [0, 5]
      })

      strictEqual(result, 0)
    })
  })

  describe('Increment (++)', function () {
    it('should return a number 1 greater than the numeric operand', function () {
      const result = operatorEval({
        name: '++',
        values: [1]
      })

      strictEqual(result, 2)
    })

    it('should return a string 1 greater than the numeric string operand', function () {
      const result = operatorEval({
        name: '++',
        values: ['5']
      })

      strictEqual(result, '6')
    })

    it('should return a number 1 greater than the rounded float operand', function () {
      const result = operatorEval({
        name: '++',
        values: [1e-34]
      })
      strictEqual(result, 1)
    })

    it('should return NaN for a non-numeric string operand', function () {
      const result = operatorEval({
        name: '++',
        values: ['one']
      })

      strictEqual(isNaN(result), true)
    })

    it('should throw an error if value is not a number or string', function () {
      try {
        operatorEval({
          name: '++',
          values: [undefined]
        })

        fail('Expected error was now thrown')
      } catch (error) {
        strictEqual(error.message, 'Increment operator expects a number but found "undefined"')
        ok(error instanceof Error)
      }
    })

    it('should throw an error for object type', function () {
      try {
        operatorEval({
          name: '++',
          values: [{}]
        })

        fail('Expected error was now thrown')
      } catch (error) {
        strictEqual(error.message, 'Increment operator expects a number but found "object"')
        ok(error instanceof Error)
      }
    })

    it('should handle negative numbers', function () {
      const result = operatorEval({
        name: '++',
        values: [-5]
      })

      strictEqual(result, -4)
    })
  })

  describe('Decrement (--)', function () {
    it('should return a number 1 less than the operand', function () {
      const result = operatorEval({
        name: '--',
        values: [1]
      })

      strictEqual(result, 0)
    })

    it('should return a number 1 less than the rounded float operand', function () {
      const result = operatorEval({
        name: '--',
        values: [1e-34]
      })

      strictEqual(result, -1)
    })

    it('should return a string 1 less than the numeric string operand', function () {
      const result = operatorEval({
        name: '--',
        values: ['5']
      })

      strictEqual(result, '4')
    })

    it('should return NaN for a non-numeric string operand', function () {
      const result = operatorEval({
        name: '--',
        values: ['one']
      })

      strictEqual(isNaN(result), true)
    })

    it('should throw an error if value is not a number or string', function () {
      try {
        operatorEval({
          name: '--',
          values: [undefined]
        })

        fail('Expected error was now thrown')
      } catch (error) {
        strictEqual(error.message, 'Decrement operator expects a number but found "undefined"')
        ok(error instanceof Error)
      }
    })

    it('should throw an error for object type', function () {
      try {
        operatorEval({
          name: '--',
          values: [{}]
        })

        fail('Expected error was now thrown')
      } catch (error) {
        strictEqual(error.message, 'Decrement operator expects a number but found "object"')
        ok(error instanceof Error)
      }
    })

    it('should handle negative numbers', function () {
      const result = operatorEval({
        name: '--',
        values: [-5]
      })

      strictEqual(result, -6)
    })
  })

  describe('Exponentiation (**)', function () {
    it('should return the first operand to the power of the second', function () {
      const result = operatorEval({
        name: '**',
        values: [2, 3]
      })

      strictEqual(result, 8)
    })

    it('should return a valid number from a small float operand and small positive integer second', function () {
      const result = operatorEval({
        name: '**',
        values: [1e-34, 4]
      })

      // Use approximate comparison for floating point precision
      strictEqual(
        result > 9.99e-137 && result < 1e-136,
        true
      )
    })

    it('should return a number with at least one numeric string operand', function () {
      const result = operatorEval({
        name: '**',
        values: ['2', 4]
      })

      strictEqual(result, 16)
    })

    it('should return NaN for a non-numeric string operand', function () {
      const result = operatorEval({
        name: '**',
        values: ['two', 4]
      })

      strictEqual(isNaN(result), true)
    })

    it('should handle zero exponent', function () {
      const result = operatorEval({
        name: '**',
        values: [5, 0]
      })

      strictEqual(result, 1)
    })

    it('should handle negative base', function () {
      const result = operatorEval({
        name: '**',
        values: [-2, 3]
      })

      strictEqual(result, -8)
    })

    it('should handle fractional exponent', function () {
      const result = operatorEval({
        name: '**',
        values: [4, 0.5]
      })

      strictEqual(result, 2)
    })
  })

  describe('Addition (+)', function () {
    it('should return a number if the operands are numbers', function () {
      const result = operatorEval({
        name: '+',
        values: [1, 2]
      })

      strictEqual(result, 3)
    })

    it('should return a string concatenation if the operands are numbers that may be expressed as a string', function () {
      const result = operatorEval({
        name: '+',
        values: ['1', 2]
      })

      strictEqual(result, '12')
    })

    it('should handle multiple number values', function () {
      const result = operatorEval({
        name: '+',
        values: [1, 2, 3, 4]
      })

      strictEqual(result, 10)
    })

    it('should handle multiple string values', function () {
      const result = operatorEval({
        name: '+',
        values: ['hello', ' ', 'world']
      })

      strictEqual(result, 'hello world')
    })

    it('should handle mixed string and number', function () {
      const result = operatorEval({
        name: '+',
        values: ['age: ', 25]
      })

      strictEqual(result, 'age: 25')
    })

    it('should handle negative numbers', function () {
      const result = operatorEval({
        name: '+',
        values: [-5, 3]
      })

      strictEqual(result, -2)
    })

    it('should handle zero', function () {
      const result = operatorEval({
        name: '+',
        values: [0, 0]
      })

      strictEqual(result, 0)
    })
  })

  describe('Subtraction (-)', function () {
    it('should return a number if the operands are numbers', function () {
      const result = operatorEval({
        name: '-',
        values: [1, 2]
      })

      strictEqual(result, -1)
    })

    it('should return a number if the operands are numbers that may be expressed as a string', function () {
      const result = operatorEval({
        name: '-',
        values: ['1', 2]
      })

      strictEqual(result, -1)
    })

    it('should handle multiple values', function () {
      const result = operatorEval({
        name: '-',
        values: [10, 3, 2]
      })

      strictEqual(result, 5) // 10 - 3 - 2 = 5
    })

    it('should handle negative numbers', function () {
      const result = operatorEval({
        name: '-',
        values: [-5, -3]
      })

      strictEqual(result, -2)
    })

    it('should handle zero', function () {
      const result = operatorEval({
        name: '-',
        values: [0, 5]
      })

      strictEqual(result, -5)
    })
  })

  describe('Multiplication (*)', function () {
    it('should return a number if the operands are numbers', function () {
      const result = operatorEval({
        name: '*',
        values: [2, 3]
      })

      strictEqual(result, 6)
    })

    it('should return a number if the operands are numbers that may be expressed as a string', function () {
      const result = operatorEval({
        name: '*',
        values: ['2', 3]
      })

      strictEqual(result, 6)
    })

    it('should handle multiple values', function () {
      const result = operatorEval({
        name: '*',
        values: [2, 3, 4]
      })

      strictEqual(result, 24)
    })

    it('should handle negative numbers', function () {
      const result = operatorEval({
        name: '*',
        values: [-2, 3]
      })

      strictEqual(result, -6)
    })

    it('should handle zero', function () {
      const result = operatorEval({
        name: '*',
        values: [5, 0]
      })

      strictEqual(result, 0)
    })

    it('should handle multiplication by 1', function () {
      const result = operatorEval({
        name: '*',
        values: [5, 1]
      })

      strictEqual(result, 5)
    })
  })

  describe('Logical NOT (!)', function () {
    it('should return true if the operand is falsy', function () {
      const result = operatorEval({
        name: '!',
        values: [false]
      })

      strictEqual(result, true)
    })

    it('should return false if the operator expression is true', function () {
      const result = operatorEval({
        name: '!',
        values: ['3 > 2']
      })

      strictEqual(result, false)
    })

    it('should return true for 0', function () {
      const result = operatorEval({
        name: '!',
        values: [0]
      })

      strictEqual(result, true)
    })

    it('should return true for empty string', function () {
      const result = operatorEval({
        name: '!',
        values: ['']
      })

      strictEqual(result, true)
    })

    it('should return true for null', function () {
      const result = operatorEval({
        name: '!',
        values: [null]
      })

      strictEqual(result, true)
    })

    it('should return true for undefined', function () {
      const result = operatorEval({
        name: '!',
        values: [undefined]
      })

      strictEqual(result, true)
    })

    it('should return true for NaN', function () {
      const result = operatorEval({
        name: '!',
        values: [NaN]
      })

      strictEqual(result, true)
    })

    it('should return false for truthy values', function () {
      const truthyValues = [1, -1, '0', 'false', [], {}, true]

      truthyValues.forEach(value => {
        const result = operatorEval({
          name: '!',
          values: [value]
        })
        strictEqual(result, false, `Expected !${JSON.stringify(value)} to be false`)
      })
    })
  })

  describe('Boolean (!!)', function () {
    it('should return false if the operand is falsey', function () {
      const result = operatorEval({
        name: '!!',
        values: [false]
      })

      strictEqual(result, false)
    })

    it('should return true if the operand is truthy', function () {
      const result = operatorEval({
        name: '!!',
        values: ['false']
      })

      strictEqual(result, true)
    })

    it('should return false for 0', function () {
      const result = operatorEval({
        name: '!!',
        values: [0]
      })

      strictEqual(result, false)
    })

    it('should return false for empty string', function () {
      const result = operatorEval({
        name: '!!',
        values: ['']
      })

      strictEqual(result, false)
    })

    it('should return false for null', function () {
      const result = operatorEval({
        name: '!!',
        values: [null]
      })

      strictEqual(result, false)
    })

    it('should return false for undefined', function () {
      const result = operatorEval({
        name: '!!',
        values: [undefined]
      })

      strictEqual(result, false)
    })

    it('should return false for NaN', function () {
      const result = operatorEval({
        name: '!!',
        values: [NaN]
      })

      strictEqual(result, false)
    })

    it('should return true for positive numbers', function () {
      const result = operatorEval({
        name: '!!',
        values: [1]
      })

      strictEqual(result, true)
    })

    it('should return true for negative numbers', function () {
      const result = operatorEval({
        name: '!!',
        values: [-1]
      })

      strictEqual(result, true)
    })

    it('should return true for non-empty strings', function () {
      const result = operatorEval({
        name: '!!',
        values: ['hello']
      })

      strictEqual(result, true)
    })

    it('should return true for arrays', function () {
      const result = operatorEval({
        name: '!!',
        values: [[]]
      })

      strictEqual(result, true)
    })

    it('should return true for objects', function () {
      const result = operatorEval({
        name: '!!',
        values: [{}]
      })

      strictEqual(result, true)
    })
  })

  describe('Includes (~)', function () {
    it('should return true when searching for an existing value in array', function () {
      const result = operatorEval({
        name: '~',
        values: [
          [1, 2, 3],
          2
        ]
      })

      strictEqual(result, true)
    })

    it('should return false when searching for a non-existing value in array', function () {
      const result = operatorEval({
        name: '~',
        values: [
          [1, 2, 3],
          4
        ]
      })

      strictEqual(result, false)
    })

    it('should return true when searching for a substring in string', function () {
      const result = operatorEval({
        name: '~',
        values: ['hello world', 'world']
      })

      strictEqual(result, true)
    })

    it('should return false when searching for a non-existing substring in string', function () {
      const result = operatorEval({
        name: '~',
        values: ['hello world', 'moon']
      })

      strictEqual(result, false)
    })

    it('should return true for exact string match', function () {
      const result = operatorEval({
        name: '~',
        values: ['hello', 'hello']
      })

      strictEqual(result, true)
    })

    it('should handle empty array', function () {
      const result = operatorEval({
        name: '~',
        values: [[], 1]
      })

      strictEqual(result, false)
    })

    it('should handle empty string', function () {
      const result = operatorEval({
        name: '~',
        values: ['', 'a']
      })

      strictEqual(result, false)
    })
  })

  describe('Typeof', function () {
    it('should return "string" when value is a string', function () {
      const result = operatorEval({
        name: 'typeof',
        values: ['red']
      })

      strictEqual(result, 'string')
    })

    it('should return "number" when value is a number', function () {
      const result = operatorEval({
        name: 'typeof',
        values: [1]
      })

      strictEqual(result, 'number')
    })

    it('should return "boolean" when value is a boolean', function () {
      const result = operatorEval({
        name: 'typeof',
        values: [true]
      })

      strictEqual(result, 'boolean')
    })

    it('should return "array" when value is a Array', function () {
      const result = operatorEval({
        name: 'typeof',
        values: [[true]]
      })

      strictEqual(result, 'array')
    })

    it('should return "object" when value is a Object', function () {
      const result = operatorEval({
        name: 'typeof',
        values: [{ a: true }]
      })

      strictEqual(result, 'object')
    })

    it('should return "object" when value is null', function () {
      const result = operatorEval({
        name: 'typeof',
        values: [null]
      })

      strictEqual(result, 'object')
    })

    it('should return "undefined" when value is undefined', function () {
      const result = operatorEval({
        name: 'typeof',
        values: [undefined]
      })

      strictEqual(result, 'undefined')
    })

    it('should return "function" when value is a function', function () {
      const result = operatorEval({
        name: 'typeof',
        values: [() => {
        }]
      })

      strictEqual(result, 'function')
    })

    it('should return "number" for NaN', function () {
      const result = operatorEval({
        name: 'typeof',
        values: [NaN]
      })

      strictEqual(result, 'number')
    })
  })

  describe('Nullish operators', function () {
    describe('isNull', function () {
      it('should return true if value is null', function () {
        const result = operatorEval({
          name: 'isNull',
          values: [null]
        })

        strictEqual(result, true)
      })

      it('should return true if value is undefined', function () {
        const result = operatorEval({
          name: 'isNull',
          values: [undefined]
        })

        strictEqual(result, true)
      })

      it('should return false for 0', function () {
        const result = operatorEval({
          name: 'isNull',
          values: [0]
        })

        strictEqual(result, false)
      })

      it('should return false for empty string', function () {
        const result = operatorEval({
          name: 'isNull',
          values: ['']
        })

        strictEqual(result, false)
      })

      it('should return false for false', function () {
        const result = operatorEval({
          name: 'isNull',
          values: [false]
        })

        strictEqual(result, false)
      })
    })

    describe('notNull', function () {
      it('should return true if value is not nullish', function () {
        const result = operatorEval({
          name: 'notNull',
          values: ['red']
        })

        strictEqual(result, true)
      })

      it('should return false if value is null', function () {
        const result = operatorEval({
          name: 'notNull',
          values: [null]
        })

        strictEqual(result, false)
      })

      it('should return false if value is undefined', function () {
        const result = operatorEval({
          name: 'notNull',
          values: [undefined]
        })

        strictEqual(result, false)
      })

      it('should return true for 0', function () {
        const result = operatorEval({
          name: 'notNull',
          values: [0]
        })

        strictEqual(result, true)
      })

      it('should return true for empty string', function () {
        const result = operatorEval({
          name: 'notNull',
          values: ['']
        })

        strictEqual(result, true)
      })

      it('should return true for false', function () {
        const result = operatorEval({
          name: 'notNull',
          values: [false]
        })

        strictEqual(result, true)
      })
    })
  })
})

describe('Operator compare', function () {
  describe('Logical compare', function () {
    it('should return true if one of Logical OR operand is truthy', function () {
      const result = operatorCompare([
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
    })

    it('should return false if all operands are falsy', function () {
      const result = operatorCompare([
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
    })
  })

  describe('Logical AND', function () {
    it('should return true if both operands are truthy', function () {
      const result = operatorCompare([{
        value_1: true,
        value_2: true,
        op: '&&'
      }])

      strictEqual(result, true)
    })

    it('should return false if one operand is falsy', function () {
      const result = operatorCompare([{
        value_1: true,
        value_2: false,
        op: '&&'
      }])

      strictEqual(result, false)
    })

    it('should return false if one operand is falsy of many', function () {
      const result = operatorCompare([
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
    })

    it('should return true for multiple truthy AND conditions', function () {
      const result = operatorCompare([
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
    })

    it('should handle mixed truthy and falsy values', function () {
      const result = operatorCompare([
        {
          value_1: 1,
          value_2: 0,
          op: '&&'
        }
      ])

      strictEqual(result, false)
    })
  })

  describe('Logical OR', function () {
    it('should return true if one operand is truthy', function () {
      const result = operatorCompare([{
        value_1: true,
        value_2: false,
        op: '||'
      }])

      strictEqual(result, true)
    })

    it('should return true if one operand is truthy of many', function () {
      const result = operatorCompare([
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
    })

    it('should return false if both operands are falsy', function () {
      const result = operatorCompare([{
        value_1: false,
        value_2: false,
        op: '||'
      }])

      strictEqual(result, false)
    })

    it('should return true for multiple OR conditions with one truthy', function () {
      const result = operatorCompare([
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
    })

    it('should handle mixed truthy and falsy values', function () {
      const result = operatorCompare([
        {
          value_1: 0,
          value_2: 1,
          op: '||'
        }
      ])

      strictEqual(result, true)
    })
  })

  describe('Mixed operators', function () {
    it('should return true when AND is true and OR is true', function () {
      const result = operatorCompare([
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
    })

    it('should return true when AND is false but OR is true', function () {
      const result = operatorCompare([
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
    })

    it('should return false when AND is false and OR is false', function () {
      const result = operatorCompare([
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
    })

    it('should handle complex mixed conditions', function () {
      const result = operatorCompare([
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
    })

    it('should handle numeric comparisons in compare', function () {
      const result = operatorCompare([
        {
          value_1: 10,
          value_2: 5,
          op: '&&'
        }
      ])

      strictEqual(result, true)
    })

    it('should handle empty array', function () {
      const result = operatorCompare([])

      strictEqual(result, false)
    })

    it('should handle single AND condition', function () {
      const result = operatorCompare([
        {
          value_1: 1,
          value_2: 1,
          op: '&&'
        }
      ])

      strictEqual(result, true)
    })

    it('should handle single OR condition', function () {
      const result = operatorCompare([
        {
          value_1: 0,
          value_2: 0,
          op: '||'
        }
      ])

      strictEqual(result, false)
    })
  })
})
