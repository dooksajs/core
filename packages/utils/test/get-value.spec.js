import { describe, it } from 'node:test'
import { strictEqual } from 'node:assert'
import { getValue } from '../src/index.js'

describe('Get value', function () {
  describe('Primitive', function () {
    it('should return the complete value when the query is empty', function () {
      const result = getValue(1)

      strictEqual(result, 1)
    })
  })

  describe('Object', function () {
    it('should return the property value of "color"', function () {
      const result = getValue({
        color: 'red'
      }, 'color')

      strictEqual(result, 'red')
    })

    it('should return the nested property value of "color.is" with query using dot notations', function () {
      const result = getValue({
        color: {
          is: 'red'
        }
      }, 'color.is')

      strictEqual(result, 'red')
    })

    it('should return undefined if property is not found', function () {
      const result = getValue(['red', 'green', 'blue'], '3')

      strictEqual(result, undefined)
    })


    it('should return undefined if nested property is not found', function () {
      const result = getValue({
        color: {
          is: 'red'
        }
      }, 'color.is.not.here')

      strictEqual(result, undefined)
    })
  })

  describe('Array', function () {
    it('should return the last item in the array"', function () {
      const result = getValue(['red', 'green', 'blue'], '2')

      strictEqual(result, 'blue')
    })

    it('should return the nested property value of "color.is" with query using dot notations', function () {
      const result = getValue([
        ['red', 'green', 'blue']
      ], '0.2')

      strictEqual(result, 'blue')
    })

    it('should return undefined if property is not found', function () {
      const result = getValue(['red', 'green', 'blue'], '3')

      strictEqual(result, undefined)
    })

    it('should return undefined if nested property is not found', function () {
      const result = getValue([
        ['red', 'green', 'blue']
      ], '0.2.red.green.blue')

      strictEqual(result, undefined)
    })
  })

  describe('Query multiple properties', function () {
    it('should return an array with all the values"', function () {
      const result = getValue(['red', 'green', 'blue'], ['0', '1', '2'])

      strictEqual(result[0], 'red')
      strictEqual(result[1], 'green')
      strictEqual(result[2], 'blue')
    })
  })
})
