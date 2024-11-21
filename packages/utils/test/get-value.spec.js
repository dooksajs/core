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
  })
})
