import { operatorCompare, operatorEval } from '#client'
import { describe, it } from 'node:test'
import { fail, ok, strictEqual } from 'node:assert'

describe('Operator eval', function () {
  it('should fail if operator is not found', function () {
    try {
      const result = operatorEval({
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

  describe('Equality', function () {
    it('should return true if the operands are equal', function () {
      const result = operatorEval({
        name: '==',
        values: [1, 1]
      })

      strictEqual(result, true)
    })

    it('should return false if the operands are of different type.', function () {

      const result = operatorEval({
        name: '==',
        // @ts-ignore
        values: [1, '1']
      })

      strictEqual(result, false)
    })
  })

  describe('Inequality', function () {
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
  })

  describe('Greater than', function () {
    it('should return true if the first operand is greater than the second operand.', function () {
      const result = operatorEval({
        name: '>',
        values: [2, 1]
      })

      strictEqual(result, true)
    })

    it('should return false if the first operand is less than the second operand.', function () {
      const result = operatorEval({
        name: '>',
        values: [1, 2]
      })

      strictEqual(result, false)
    })

    it('should return false if the first operand is equal to the second operand.', function () {
      const result = operatorEval({
        name: '>',
        values: [1, 1]
      })

      strictEqual(result, false)
    })
  })

  describe('Greater than or equal', function () {
    it('should return true if the first operand is greater than the second operand.', function () {
      const result = operatorEval({
        name: '>=',
        values: [2, 1]
      })

      strictEqual(result, true)
    })

    it('should return false if the first operand is less than the second operand.', function () {
      const result = operatorEval({
        name: '>=',
        values: [1, 2]
      })

      strictEqual(result, false)
    })

    it('should return true if the first operand is equal to the second operand.', function () {
      const result = operatorEval({
        name: '>=',
        values: [1, 1]
      })

      strictEqual(result, true)
    })
  })

  describe('Less than', function () {
    it('should return true if the first operand is less than the second operand.', function () {
      const result = operatorEval({
        name: '<',
        values: [1, 2]
      })

      strictEqual(result, true)
    })

    it('should return false if the first operand is greater than the second operand.', function () {
      const result = operatorEval({
        name: '<',
        values: [2, 1]
      })

      strictEqual(result, false)
    })

    it('should return false if the first operand is equal to the second operand.', function () {
      const result = operatorEval({
        name: '<',
        values: [1, 1]
      })

      strictEqual(result, false)
    })
  })

  describe('Less than or equal', function () {
    it('should return true if the first operand is less than the second operand.', function () {
      const result = operatorEval({
        name: '<=',
        values: [1, 2]
      })

      strictEqual(result, true)
    })

    it('should return false if the first operand is greater than the second operand.', function () {
      const result = operatorEval({
        name: '<=',
        values: [2, 1]
      })

      strictEqual(result, false)
    })

    it('should return true if the first operand is equal to the second operand.', function () {
      const result = operatorEval({
        name: '<=',
        values: [1, 1]
      })

      strictEqual(result, true)
    })
  })

  describe('Remainder', function () {
    it('should return 0 if the first operand is a multiple of the second operand.', function () {
      const result = operatorEval({
        name: '%',
        values: [6, 2]
      })

      strictEqual(result === 0, true)
    })

    it('should return 0 if the first operand, expressed as a string, is a multiple of the second operand.', function () {
      const result = operatorEval({
        name: '%',
        values: ['6', 2]
      })

      strictEqual(result === 0, true)
    })

    it('should return NaN if the first operand is expressed as a non-numeric string.', function () {
      const result = operatorEval({
        name: '%',
        values: ['six', 2]
      })

      strictEqual(isNaN(result), true)
    })

    it('should return 2 if the first operand is equal to a multiple of the second operand plus 2.', function () {
      const result = operatorEval({
        name: '%',
        values: [14, 4]
      })

      strictEqual(result, 2)
    })
  })

  describe('Increment', function () {
    it('prefix operator should return a number 1 greater than the numeric string operand', function () {
      const result = operatorEval({
        name: '++',
        values: [1]
      })

      strictEqual(result, 2)
    })

    it('prefix operator should return a number 1 greater than the rounded float operand', function () {
      const result = operatorEval({
        name: '++',
        values: [1e-34]
      })
      strictEqual(result, 1)
    })

    it('prefix operator should return NaN for a non-numeric string operand', function () {
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
  })

  describe('Decrement', function () {
    it('prefix operator should return a number 1 less than the operand', function () {
      const result = operatorEval({
        name: '--',
        values: [1]
      })

      strictEqual(result, 0)
    })

    it('prefix operator should return a number 1 less than the rounded float operand', function () {
      const result = operatorEval({
        name: '--',
        values: [1e-34]
      })

      strictEqual(result, -1)
    })

    it('prefix operator should return a number 1 less than the numeric string operand', function () {
      const result = operatorEval({
        name: '--',
        values: [1]
      })

      strictEqual(result, 0)
    })

    it('prefix operator should return NaN for a non-numeric string operand', function () {
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
  })

  describe('Exponentiation', function () {
    it('operator should return the first operand to the power of the second ', function () {
      const result = operatorEval({
        name: '**',
        values: [2, 3]
      })

      strictEqual(result, 8)
    })

    it('operator should return a valid number  from a small float operand and small positive integer second', function () {
      const result = operatorEval({
        name: '**',
        values: [1e-34, 4]
      })

      strictEqual(result, 9.999999999999998e-137)
    })

    it('operator should return a number with at least one numeric string operand', function () {
      const result = operatorEval({
        name: '**',
        values: ['2', 4]
      })

      strictEqual(result, 16)
    })

    it('operator should return NaN for a non-numeric string operand', function () {
      const result = operatorEval({
        name: '**',
        values: ['two', 4]
      })

      strictEqual(isNaN(result), true)
    })
  })

  describe('Addition', function () {
    it('should return a number if the operands are numbers.', function () {
      const result = operatorEval({
        name: '+',
        values: [1, 2]
      })

      strictEqual(result, 3)
    })

    it('should return a string concatenation if the operands are numbers that may be expressed as a string.', function () {
      const result = operatorEval({
        name: '+',
        values: ['1', 2]
      })

      strictEqual(result, '12')
    })
  })

  describe('Subtraction', function () {
    it('should return a number if the operands are numbers.', function () {
      const result = operatorEval({
        name: '-',
        values: [1, 2]
      })

      strictEqual(result, -1)
    })

    it('should return a number if the operands are numbers that may be expressed as a string.', function () {
      const result = operatorEval({
        name: '-',
        values: ['1', 2]
      })

      strictEqual(result, -1)
    })
  })

  describe('Subtraction', function () {
    it('should return a number if the operands are numbers.', function () {
      const result = operatorEval({
        name: '-',
        values: [1, 2]
      })

      strictEqual(result, -1)
    })

    it('should return a number if the operands are numbers that may be expressed as a string.', function () {
      const result = operatorEval({
        name: '-',
        values: ['1', 2]
      })

      strictEqual(result, -1)
    })
  })

  describe('Multiplication', function () {
    it('should return a number if the operands are numbers.', function () {
      const result = operatorEval({
        name: '*',
        values: [2, 3]
      })

      strictEqual(result, 6)
    })

    it('should return a number if the operands are numbers that may be expressed as a string.', function () {
      const result = operatorEval({
        name: '*',
        values: ['2', 3]
      })

      strictEqual(result, 6)
    })
  })

  describe('Logical NOT', function () {
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
  })

  describe('Boolean', function () {
    it('should return false if the operand is falsey.', function () {
      const result = operatorEval({
        name: '!!',
        values: [false]
      })

      strictEqual(result, false)
    })

    it('should return true if the operand is truthy.', function () {
      const result = operatorEval({
        name: '!!',
        values: ['false']
      })

      strictEqual(result, true)
    })
  })

  describe('Includes', function () {
    it('should return true when searching for an existing value', function () {
      const result = operatorEval({
        name: '~',
        values: [
          [1, 2, 3],
          2
        ]
      })

      strictEqual(result, true)
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
  })

  describe('Nullish', function () {
    it('should return true if value is not nullish', function () {
      const result = operatorEval({
        name: 'notNull',
        values: ['red']
      })

      strictEqual(result, true)
    })

    it('should return true if value is nullish', function () {
      const nullIsNull = operatorEval({
        name: 'isNull',
        values: [null]
      })
      const undefinedIsNull = operatorEval({
        name: 'isNull',
        values: [null]
      })

      strictEqual(nullIsNull, true)
      strictEqual(undefinedIsNull, true)
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

    it('should return false if all operands is are falsy', function () {
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
  })
})
