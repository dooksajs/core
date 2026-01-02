import { describe, it } from 'node:test'
import { strictEqual, deepStrictEqual } from 'node:assert'
import { getValue } from '../src/index.js'

describe('getValue', function () {
  describe('Primitive values without query', function () {
    it('should return the complete value when query is null', function () {
      const result = getValue(1, null)
      strictEqual(result, 1)
    })

    it('should return the complete value when query is undefined', function () {
      const result = getValue(1, undefined)
      strictEqual(result, 1)
    })

    it('should return the complete value when query is not provided', function () {
      const result = getValue(1)
      strictEqual(result, 1)
    })

    it('should return string value', function () {
      const result = getValue('hello')
      strictEqual(result, 'hello')
    })

    it('should return boolean value', function () {
      const result = getValue(true)
      strictEqual(result, true)
    })

    it('should return null value', function () {
      const result = getValue(null)
      strictEqual(result, null)
    })

    it('should return undefined value', function () {
      const result = getValue(undefined)
      strictEqual(result, undefined)
    })
  })

  describe('Object property access', function () {
    it('should return the property value', function () {
      const result = getValue({ color: 'red' }, 'color')
      strictEqual(result, 'red')
    })

    it('should return nested property value with dot notation', function () {
      const result = getValue({ color: { is: 'red' } }, 'color.is')
      strictEqual(result, 'red')
    })

    it('should return deeply nested property value', function () {
      const obj = { a: { b: { c: { d: 'deep' } } } }
      const result = getValue(obj, 'a.b.c.d')
      strictEqual(result, 'deep')
    })

    it('should return undefined for non-existent property', function () {
      const result = getValue({ color: 'red' }, 'shape')
      strictEqual(result, undefined)
    })

    it('should return undefined for deeply nested non-existent property', function () {
      const result = getValue({ color: { is: 'red' } }, 'color.is.not.here')
      strictEqual(result, undefined)
    })

    it('should handle properties with undefined values', function () {
      const result = getValue({ color: undefined }, 'color')
      strictEqual(result, undefined)
    })

    it('should handle properties with null values', function () {
      const result = getValue({ color: null }, 'color')
      strictEqual(result, null)
    })

    it('should handle properties with boolean values', function () {
      const result = getValue({ isActive: true }, 'isActive')
      strictEqual(result, true)
    })

    it('should handle properties with number values', function () {
      const result = getValue({ count: 42 }, 'count')
      strictEqual(result, 42)
    })

    it('should handle properties with zero values', function () {
      const result = getValue({ count: 0 }, 'count')
      strictEqual(result, 0)
    })

    it('should handle properties with empty string values', function () {
      const result = getValue({ text: '' }, 'text')
      strictEqual(result, '')
    })

    it('should handle properties with array values', function () {
      const result = getValue({ items: [1, 2, 3] }, 'items')
      deepStrictEqual(result, [1, 2, 3])
    })

    it('should handle properties with object values', function () {
      const result = getValue({ nested: { a: 1 } }, 'nested')
      deepStrictEqual(result, { a: 1 })
    })

    it('should handle properties with function values', function () {
      const fn = () => 'test'
      const result = getValue(
        {
          func: fn
        },
        'func'
      )
      strictEqual(result, fn)
    })

    it('should handle properties with symbol values', function () {
      const sym = Symbol('test')
      const result = getValue(
        {
          sym
        },
        'sym'
      )
      strictEqual(result, sym)
    })
  })

  describe('Array index access', function () {
    it('should return the first item', function () {
      const result = getValue(['red', 'green', 'blue'], '0')
      strictEqual(result, 'red')
    })

    it('should return the last item', function () {
      const result = getValue(['red', 'green', 'blue'], '2')
      strictEqual(result, 'blue')
    })

    it('should return middle item', function () {
      const result = getValue(['red', 'green', 'blue'], '1')
      strictEqual(result, 'green')
    })

    it('should return undefined for out of bounds index', function () {
      const result = getValue(['red', 'green', 'blue'], '3')
      strictEqual(result, undefined)
    })

    it('should return undefined for negative index', function () {
      const result = getValue(['red', 'green', 'blue'], '-1')
      strictEqual(result, undefined)
    })

    it('should return nested array item', function () {
      const result = getValue([['red', 'green', 'blue']], '0.2')
      strictEqual(result, 'blue')
    })

    it('should return deeply nested array item', function () {
      const result = getValue([[[['deep']]]], '0.0.0.0')
      strictEqual(result, 'deep')
    })

    it('should handle array with undefined values', function () {
      const result = getValue([undefined, 'value'], '0')
      strictEqual(result, undefined)
    })

    it('should handle array with null values', function () {
      const result = getValue([null, 'value'], '0')
      strictEqual(result, null)
    })

    it('should handle empty array', function () {
      const result = getValue([], '0')
      strictEqual(result, undefined)
    })

    it('should handle array with mixed types', function () {
      const result = getValue([1, 'two', null, undefined, true], '3')
      strictEqual(result, undefined)
    })
  })

  describe('Mixed object and array structures', function () {
    it('should access array item in object', function () {
      const result = getValue({ items: ['a', 'b', 'c'] }, 'items.1')
      strictEqual(result, 'b')
    })

    it('should access object property in array', function () {
      const result = getValue([{ name: 'John' }, { name: 'Jane' }], '1.name')
      strictEqual(result, 'Jane')
    })

    it('should handle complex nested structures', function () {
      const data = {
        users: [
          {
            name: 'John',
            age: 30
          },
          {
            name: 'Jane',
            age: 25
          }
        ],
        settings: {
          theme: 'dark'
        }
      }
      strictEqual(getValue(data, 'users.0.name'), 'John')
      strictEqual(getValue(data, 'users.1.age'), 25)
      strictEqual(getValue(data, 'settings.theme'), 'dark')
    })

    it('should handle array of objects with nested arrays', function () {
      const data = [
        { items: [1, 2, 3] },
        { items: [4, 5, 6] }
      ]
      strictEqual(getValue(data, '0.items.1'), 2)
      strictEqual(getValue(data, '1.items.0'), 4)
    })
  })

  describe('Query syntax edge cases', function () {
    it('should handle empty string query', function () {
      const result = getValue({ a: 1 }, '')
      strictEqual(result, undefined)
    })

    it('should handle query with leading dot', function () {
      const result = getValue({ a: { b: 1 } }, '.a.b')
      strictEqual(result, undefined)
    })

    it('should handle query with trailing dot', function () {
      const result = getValue({ a: { b: 1 } }, 'a.b.')
      strictEqual(result, undefined)
    })

    it('should handle query with consecutive dots', function () {
      const result = getValue({ a: { b: 1 } }, 'a..b')
      strictEqual(result, undefined)
    })

    it('should handle query with only dots', function () {
      const result = getValue({ a: 1 }, '...')
      strictEqual(result, undefined)
    })
  })

  describe('Multiple queries (array of queries)', function () {
    it('should return array with values for multiple queries', function () {
      const result = getValue(['red', 'green', 'blue'], ['0', '1', '2'])
      deepStrictEqual(result, ['red', 'green', 'blue'])
    })

    it('should return array with values for mixed object/array queries', function () {
      const data = {
        a: 1,
        b: 2,
        c: 3
      }
      const result = getValue(data, ['a', 'b', 'c'])
      deepStrictEqual(result, [1, 2, 3])
    })

    it('should return array with undefined for non-existent queries', function () {
      const result = getValue({ a: 1 }, ['a', 'b', 'c'])
      deepStrictEqual(result, [1, undefined, undefined])
    })

    it('should handle empty array query', function () {
      const result = getValue({ a: 1 }, [])
      deepStrictEqual(result, [])
    })

    it('should handle array query with single element', function () {
      const result = getValue({ a: 1 }, ['a'])
      deepStrictEqual(result, [1])
    })

    it('should handle array query with complex paths', function () {
      const data = {
        a: {
          b: {
            c: 1
          }
        },
        d: [2, 3]
      }
      const result = getValue(data, ['a.b.c', 'd.1'])
      deepStrictEqual(result, [1, 3])
    })
  })

  describe('Invalid query types', function () {
    it('should handle number query (treated as string)', function () {
      const result = getValue(['a', 'b', 'c'], '1')
      strictEqual(result, 'b')
    })

    it('should handle boolean query (treated as string)', function () {
      const result = getValue({ true: 'value' }, 'true')
      strictEqual(result, 'value')
    })

    it('should handle object query (returns undefined)', function () {
      const result = getValue({ a: 1 }, /** @type {any} */({}))
      strictEqual(result, undefined)
    })

    it('should handle function query (returns undefined)', function () {
      const result = getValue({ a: 1 }, /** @type {any} */(() => 'a'))
      strictEqual(result, undefined)
    })
  })

  describe('Null and undefined input handling', function () {
    it('should return undefined for null input with query', function () {
      const result = getValue(null, 'a.b')
      strictEqual(result, undefined)
    })

    it('should return undefined for undefined input with query', function () {
      const result = getValue(undefined, 'a.b')
      strictEqual(result, undefined)
    })

    it('should return null for null input without query', function () {
      const result = getValue(null)
      strictEqual(result, null)
    })

    it('should return undefined for undefined input without query', function () {
      const result = getValue(undefined)
      strictEqual(result, undefined)
    })

    it('should handle intermediate null in path', function () {
      const result = getValue({ a: null }, 'a.b')
      strictEqual(result, undefined)
    })

    it('should handle intermediate undefined in path', function () {
      const result = getValue({ a: undefined }, 'a.b')
      strictEqual(result, undefined)
    })
  })

  describe('Deep nesting', function () {
    it('should handle very deep nesting', function () {
      const deep = { a: { b: { c: { d: { e: { f: 'deep' } } } } } }
      strictEqual(getValue(deep, 'a.b.c.d.e.f'), 'deep')
    })

    it('should handle very deep array nesting', function () {
      const deep = [[[[[['deep']]]]]]
      strictEqual(getValue(deep, '0.0.0.0.0.0'), 'deep')
    })

    it('should handle mixed deep nesting', function () {
      const deep = { a: [{ b: { c: [{ d: 'deep' }] } }] }
      strictEqual(getValue(deep, 'a.0.b.c.0.d'), 'deep')
    })
  })

  describe('Special cases', function () {
    it('should handle query with only dots (multiple)', function () {
      const result = getValue({ a: { b: 1 } }, '....')
      strictEqual(result, undefined)
    })

    it('should handle query with spaces in keys', function () {
      const result = getValue(
        {
          'a b': {
            'c d': 'value'
          }
        },
        'a b.c d'
      )
      strictEqual(result, 'value')
    })

    it('should handle query with special characters in keys', function () {
      const result = getValue(
        {
          'a-b': {
            c_d: 'value'
          }
        },
        'a-b.c_d'
      )
      strictEqual(result, 'value')
    })

    it('should handle numeric string keys in objects', function () {
      const result = getValue(
        {
          0: 'first',
          1: 'second'
        },
        '0'
      )
      strictEqual(result, 'first')
    })

    it('should handle array-like objects', function () {
      const arrayLike = {
        0: 'a',
        1: 'b',
        2: 'c',
        length: 3
      }
      strictEqual(getValue(arrayLike, '0'), 'a')
      strictEqual(getValue(arrayLike, '2'), 'c')
    })

    it('should not treat array-like object as array for query arrays', function () {
      const arrayLike = {
        0: 'a',
        1: 'b',
        length: 2
      }
      const result = getValue(arrayLike, ['0', '1'])
      deepStrictEqual(result, ['a', 'b'])
    })
  })
})
