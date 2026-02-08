import { describe, it, beforeEach } from 'node:test'
import { strictEqual } from 'node:assert'
import { operatorEval, operatorCompare, error } from '#core'

describe('Operator plugin', () => {

  beforeEach(() => {
    error.errorClearErrors({}) // Reset error state
  })

  describe('operatorEval', () => {
    it('should handle equality (==)', () => {
      strictEqual(operatorEval({
        name: '==',
        values: [1, 1]
      }), true)
      strictEqual(operatorEval({
        name: '==',
        values: [1, 2]
      }), false)
      strictEqual(operatorEval({
        name: '==',
        values: ['a', 'a']
      }), true)
      strictEqual(operatorEval({
        name: '==',
        values: ['a', 'b']
      }), false)
    })

    it('should handle inequality (!=)', () => {
      strictEqual(operatorEval({
        name: '!=',
        values: [1, 2]
      }), true)
      strictEqual(operatorEval({
        name: '!=',
        values: [1, 1]
      }), false)
    })

    it('should handle greater than (>)', () => {
      strictEqual(operatorEval({
        name: '>',
        values: [5, 3]
      }), true)
      strictEqual(operatorEval({
        name: '>',
        values: [3, 5]
      }), false)
    })

    it('should handle greater than or equal (>=)', () => {
      strictEqual(operatorEval({
        name: '>=',
        values: [5, 5]
      }), true)
      strictEqual(operatorEval({
        name: '>=',
        values: [5, 3]
      }), true)
      strictEqual(operatorEval({
        name: '>=',
        values: [3, 5]
      }), false)
    })

    it('should handle less than (<)', () => {
      strictEqual(operatorEval({
        name: '<',
        values: [3, 5]
      }), true)
      strictEqual(operatorEval({
        name: '<',
        values: [5, 3]
      }), false)
    })

    it('should handle less than or equal (<=)', () => {
      strictEqual(operatorEval({
        name: '<=',
        values: [5, 5]
      }), true)
      strictEqual(operatorEval({
        name: '<=',
        values: [3, 5]
      }), true)
      strictEqual(operatorEval({
        name: '<=',
        values: [5, 3]
      }), false)
    })

    it('should handle logical NOT (!)', () => {
      strictEqual(operatorEval({
        name: '!',
        values: [false]
      }), true)
      strictEqual(operatorEval({
        name: '!',
        values: [true]
      }), false)
      strictEqual(operatorEval({
        name: '!',
        values: [0]
      }), true)
      strictEqual(operatorEval({
        name: '!',
        values: [1]
      }), false)
    })

    it('should handle remainder (%)', () => {
      strictEqual(operatorEval({
        name: '%',
        values: [10, 3]
      }), 1)
      strictEqual(operatorEval({
        name: '%',
        values: [15, 4, 3]
      }), 0)
    })

    it('should handle increment (++)', () => {
      strictEqual(operatorEval({
        name: '++',
        values: [5]
      }), 6)
      strictEqual(operatorEval({
        name: '++',
        values: ['10']
      }), '11')

      // Check error log
      const result = operatorEval({
        name: '++',
        values: [true]
      })

      strictEqual(result, undefined)
      strictEqual(error.errorGetErrorCount(), 1)
      const errors = error.errorGetErrors()
      strictEqual(errors[0].code, 'OPERATOR_TYPE_ERROR')
    })

    it('should handle decrement (--)', () => {
      strictEqual(operatorEval({
        name: '--',
        values: [5]
      }), 4)
      strictEqual(operatorEval({
        name: '--',
        values: ['10']
      }), '9')

      // Check error log
      const result = operatorEval({
        name: '--',
        values: [true]
      })

      strictEqual(result, undefined)
      strictEqual(error.errorGetErrorCount(), 1)
      const errors = error.errorGetErrors()
      strictEqual(errors[0].code, 'OPERATOR_TYPE_ERROR')
    })

    it('should handle negation/subtraction (-)', () => {
      strictEqual(operatorEval({
        name: '-',
        values: [10, 3]
      }), 7)
      strictEqual(operatorEval({
        name: '-',
        values: [20, 5, 3]
      }), 12)
    })

    it('should handle addition/concatenation (+)', () => {
      strictEqual(operatorEval({
        name: '+',
        values: [5, 3]
      }), 8)
      strictEqual(operatorEval({
        name: '+',
        values: ['hello', ' ', 'world']
      }), 'hello world')
      strictEqual(operatorEval({
        name: '+',
        values: [1, '2']
      }), '12')
    })

    it('should handle multiplication (*)', () => {
      strictEqual(operatorEval({
        name: '*',
        values: [2, 3]
      }), 6)
      strictEqual(operatorEval({
        name: '*',
        values: [2, 3, 4]
      }), 24)
    })

    it('should handle exponentiation (**)', () => {
      strictEqual(operatorEval({
        name: '**',
        values: [2, 3]
      }), 8)
      strictEqual(operatorEval({
        name: '**',
        values: [5, 2]
      }), 25)
    })

    it('should handle boolean conversion (!!)', () => {
      strictEqual(operatorEval({
        name: '!!',
        values: [1]
      }), true)
      strictEqual(operatorEval({
        name: '!!',
        values: [0]
      }), false)
      strictEqual(operatorEval({
        name: '!!',
        values: ['']
      }), false)
      strictEqual(operatorEval({
        name: '!!',
        values: ['hello']
      }), true)
    })

    it('should handle includes check (~)', () => {
      strictEqual(operatorEval({
        name: '~',
        values: ['hello world', 'world']
      }), true)
      strictEqual(operatorEval({
        name: '~',
        values: [[1, 2, 3], 2]
      }), true)
      strictEqual(operatorEval({
        name: '~',
        values: ['hello', 'x']
      }), false)
    })

    it('should handle does not include check (!~)', () => {
      strictEqual(operatorEval({
        name: '!~',
        values: ['hello world', 'xyz']
      }), true)
      strictEqual(operatorEval({
        name: '!~',
        values: [[1, 2, 3], 4]
      }), true)
      strictEqual(operatorEval({
        name: '!~',
        values: ['hello', 'ell']
      }), false)
    })

    it('should handle is null (isNull)', () => {
      strictEqual(operatorEval({
        name: 'isNull',
        values: [null]
      }), true)
      strictEqual(operatorEval({
        name: 'isNull',
        values: [undefined]
      }), true)
      strictEqual(operatorEval({
        name: 'isNull',
        values: [42]
      }), false)
    })

    it('should handle not null (notNull)', () => {
      strictEqual(operatorEval({
        name: 'notNull',
        values: [42]
      }), true)
      strictEqual(operatorEval({
        name: 'notNull',
        values: [null]
      }), false)
      strictEqual(operatorEval({
        name: 'notNull',
        values: [undefined]
      }), false)
    })

    it('should handle type detection (typeof)', () => {
      strictEqual(operatorEval({
        name: 'typeof',
        values: [42]
      }), 'number')
      strictEqual(operatorEval({
        name: 'typeof',
        values: ['hello']
      }), 'string')
      strictEqual(operatorEval({
        name: 'typeof',
        values: [[]]
      }), 'array')
      strictEqual(operatorEval({
        name: 'typeof',
        values: [null]
      }), 'object') // typeof null is 'object' in JS
      strictEqual(operatorEval({
        name: 'typeof',
        values: [true]
      }), 'boolean')
    })

    it('should log error for unknown operator', () => {
      const result = operatorEval({
        name: 'unknown',
        values: []
      })

      strictEqual(result, undefined)
      strictEqual(error.errorGetErrorCount(), 1)
      const errors = error.errorGetErrors()
      strictEqual(errors[0].code, 'OPERATOR_NOT_FOUND')
    })
  })

  describe('operatorCompare', () => {
    it('should handle logical AND (&&)', () => {
      strictEqual(operatorCompare([{
        value_1: true,
        value_2: true,
        op: '&&'
      }]), true)
      strictEqual(operatorCompare([{
        value_1: true,
        value_2: false,
        op: '&&'
      }]), false)
      strictEqual(operatorCompare([{
        value_1: false,
        value_2: true,
        op: '&&'
      }]), false)
      strictEqual(operatorCompare([{
        value_1: false,
        value_2: false,
        op: '&&'
      }]), false)
    })

    it('should handle logical OR (||)', () => {
      strictEqual(operatorCompare([{
        value_1: true,
        value_2: false,
        op: '||'
      }]), true)
      strictEqual(operatorCompare([{
        value_1: false,
        value_2: true,
        op: '||'
      }]), true)
      strictEqual(operatorCompare([{
        value_1: true,
        value_2: true,
        op: '||'
      }]), true)
      strictEqual(operatorCompare([{
        value_1: false,
        value_2: false,
        op: '||'
      }]), false)
    })

    it('should handle mixed operators', () => {
      // (true && true) OR (false || false) -> true
      // The implementation iterates:
      // 1. AND = true && true -> AND is true, hasAnd is true
      // 2. OR check: false || false -> OR remains false
      // End: OR is false. hasAnd is true. AND is true. Returns true.
      strictEqual(operatorCompare([
        {
          value_1: true,
          value_2: true,
          op: '&&'
        },
        {
          value_1: false,
          value_2: false,
          op: '||'
        }
      ]), true)

      // (true && false) OR (true || false) -> true
      // 1. AND = true && false -> AND is false, hasAnd is true
      // 2. OR check: true || false -> OR becomes true
      // End: OR is true. Returns true.
      strictEqual(operatorCompare([
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
      ]), true)

      // (true && true) AND (false && true) -> false
      // 1. AND = true && true -> AND is true
      // 2. AND = AND && (false && true) -> false
      strictEqual(operatorCompare([
        {
          value_1: true,
          value_2: true,
          op: '&&'
        },
        {
          value_1: false,
          value_2: true,
          op: '&&'
        }
      ]), false)
    })

    it('should return false if no conditions match', () => {
      strictEqual(operatorCompare([]), false)
    })
  })
})
