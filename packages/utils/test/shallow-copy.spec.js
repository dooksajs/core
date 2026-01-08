import { describe, it } from 'node:test'
import { notStrictEqual, deepStrictEqual, strictEqual } from 'node:assert'
import { shallowCopy } from '../src/index.js'

describe('Shallow copy', function () {
  describe('Primitives', function () {
    it('should return primitives unchanged', function () {
      strictEqual(shallowCopy(42), 42)
      strictEqual(shallowCopy('hello'), 'hello')
      strictEqual(shallowCopy(true), true)
      strictEqual(shallowCopy(null), null)
      strictEqual(shallowCopy(undefined), undefined)
    })

    it('should handle symbols', function () {
      const sym = Symbol('test')
      strictEqual(shallowCopy(sym), sym)
    })

    it('should handle functions', function () {
      const fn = () => {
      }
      strictEqual(shallowCopy(fn), fn)
    })
  })

  describe('Arrays', function () {
    it('should create new array instance', function () {
      const data = [1, 2, 3, 'test', true]
      const result = shallowCopy(data)

      deepStrictEqual(result, data)
      notStrictEqual(result, data)
    })

    it('should share references to nested elements (shallow behavior)', function () {
      const nestedObj = { a: 1 }
      const nestedArr = [1, 2]
      const data = [nestedObj, nestedArr, 3]
      const result = shallowCopy(data)

      // Arrays should be different instances
      notStrictEqual(result, data)

      // But nested objects should be the same references
      strictEqual(result[0], nestedObj)
      strictEqual(result[1], nestedArr)

      // Verify shallow behavior - modifying nested affects original
      result[0].a = 999
      strictEqual(nestedObj.a, 999)

      result[1].push(3)
      strictEqual(nestedArr.length, 3)
    })

    it('should handle empty arrays', function () {
      const result = shallowCopy([])
      deepStrictEqual(result, [])
      notStrictEqual(result, [])
    })

    it('should freeze arrays when freeze=true', function () {
      const data = [1, 2, 3]
      const result = shallowCopy(data, true)

      strictEqual(Object.isFrozen(result), true)
      deepStrictEqual(result, data)
    })

    it('should not freeze nested elements when freeze=true', function () {
      const nested = { a: 1 }
      const data = [nested]
      const result = shallowCopy(data, true)

      strictEqual(Object.isFrozen(result), true)
      strictEqual(Object.isFrozen(nested), false)
      strictEqual(result[0], nested)
    })
  })

  describe('Plain Objects', function () {
    it('should create new object instance', function () {
      const data = {
        a: 1,
        b: 'string',
        c: true
      }

      const result = shallowCopy(data)

      deepStrictEqual(result, data)
      notStrictEqual(result, data)
    })

    it('should share references to nested properties (shallow behavior)', function () {
      const nestedObj = { x: 1 }
      const nestedArr = [1, 2]
      const data = {
        a: nestedObj,
        b: nestedArr,
        c: 3
      }
      const result = shallowCopy(data)

      // Object should be different instance
      notStrictEqual(result, data)

      // But nested properties should be same references
      strictEqual(result.a, nestedObj)
      strictEqual(result.b, nestedArr)

      // Verify shallow behavior - modifying nested affects original
      result.a.x = 999
      strictEqual(nestedObj.x, 999)

      result.b.push(3)
      strictEqual(nestedArr.length, 3)
    })

    it('should handle empty objects', function () {
      const result = shallowCopy({})
      deepStrictEqual(result, {})
      notStrictEqual(result, {})
    })

    it('should freeze objects when freeze=true', function () {
      const data = {
        a: 1,
        b: 2
      }
      const result = shallowCopy(data, true)

      strictEqual(Object.isFrozen(result), true)
      deepStrictEqual(result, data)
    })

    it('should not freeze nested properties when freeze=true', function () {
      const nested = { x: 1 }
      const data = { a: nested }
      const result = shallowCopy(data, true)

      strictEqual(Object.isFrozen(result), true)
      strictEqual(Object.isFrozen(nested), false)
      strictEqual(result.a, nested)
    })

    it('should skip __proto__ property for security', function () {
      const data = {
        a: 1,
        __proto__: { polluted: true }
      }
      const result = shallowCopy(data)

      deepStrictEqual(result, { a: 1 })
      notStrictEqual(result, data)
      strictEqual(result.hasOwnProperty('__proto__'), false)
      // @ts-ignore - testing prototype pollution
      strictEqual(Object.prototype.polluted, undefined)
    })

    it('should handle objects with non-enumerable properties', function () {
      const original = { a: 1 }
      Object.defineProperty(original, 'hidden', {
        value: 2,
        enumerable: false
      })

      const result = shallowCopy(original)

      deepStrictEqual(result, { a: 1 })
      notStrictEqual(result, original)
      strictEqual(result.hidden, undefined)
    })
  })

  describe('Custom Objects', function () {
    it('should clone custom class instances', function () {
      class MyClass {
        constructor (value) {
          this.value = value
          this.nested = { data: value * 2 }
        }
      }

      const original = new MyClass(5)
      const result = shallowCopy(original)

      deepStrictEqual(result, original)
      notStrictEqual(result, original)

      // Shallow: nested should be same reference
      strictEqual(result.nested, original.nested)

      // But instance should be different
      strictEqual(result instanceof MyClass, true)
    })

    it('should share references to nested properties in custom objects', function () {
      class MyClass {
        constructor () {
          this.obj = { a: 1 }
          this.arr = [1, 2]
        }
      }

      const original = new MyClass()
      const result = shallowCopy(original)

      notStrictEqual(result, original)
      strictEqual(result.obj, original.obj)
      strictEqual(result.arr, original.arr)

      // Verify shallow behavior
      result.obj.a = 999
      strictEqual(original.obj.a, 999)
    })

    it('should handle objects created with new Object()', function () {
      const original = new Object()
      // @ts-ignore
      original.a = 1
      // @ts-ignore
      original.b = { c: 2 }

      const result = shallowCopy(original)

      deepStrictEqual(result, original)
      notStrictEqual(result, original)
      // @ts-ignore
      strictEqual(result.b, original.b)
    })

    it('should freeze custom objects when freeze=true', function () {
      class MyClass {
        constructor () {
          this.a = 1
        }
      }
      const original = new MyClass()
      const result = shallowCopy(original, true)

      strictEqual(Object.isFrozen(result), true)
    })
  })

  describe('Date Objects', function () {
    it('should clone Date objects', function () {
      const original = new Date('2024-01-01T00:00:00.000Z')
      const result = shallowCopy(original)

      strictEqual(result instanceof Date, true)
      deepStrictEqual(result, original)
      notStrictEqual(result, original)
      strictEqual(result.getTime(), original.getTime())
    })

    it('should handle Date objects in nested structures', function () {
      const date = new Date('2024-01-01')
      const original = {
        date: date,
        nested: {
          dates: [new Date('2024-02-01'), new Date('2024-03-01')]
        }
      }

      const result = shallowCopy(original)

      // Top level should be copied
      notStrictEqual(result, original)

      // But nested dates should be same references (shallow)
      strictEqual(result.date, date)
      strictEqual(result.nested.dates[0], original.nested.dates[0])
    })

    it('should freeze Date objects when freeze=true', function () {
      const original = new Date('2024-01-01')
      const result = shallowCopy(original, true)

      strictEqual(Object.isFrozen(result), true)
    })
  })

  describe('RegExp Objects', function () {
    it('should clone RegExp objects', function () {
      const original = /test/gi
      const result = shallowCopy(original)

      strictEqual(result instanceof RegExp, true)
      deepStrictEqual(result, original)
      notStrictEqual(result, original)
      strictEqual(result.source, original.source)
      strictEqual(result.flags, original.flags)
    })

    it('should preserve RegExp lastIndex', function () {
      const original = /test/g
      original.test('test test')
      const result = shallowCopy(original)

      strictEqual(result.lastIndex, original.lastIndex)
    })

    it('should handle RegExp objects in nested structures', function () {
      const pattern = /test/i
      const original = {
        pattern: pattern,
        nested: {
          patterns: [/abc/g, /def/]
        }
      }

      const result = shallowCopy(original)

      // Top level should be copied
      notStrictEqual(result, original)

      // But nested patterns should be same references (shallow)
      strictEqual(result.pattern, pattern)
      strictEqual(result.nested.patterns[0], original.nested.patterns[0])
    })

    it('should freeze RegExp objects when freeze=true', function () {
      const original = /test/gi
      const result = shallowCopy(original, true)

      strictEqual(Object.isFrozen(result), true)
    })
  })

  describe('Freeze Functionality', function () {
    it('should freeze simple objects when freeze=true', function () {
      const nested = { c: 3 }
      const data = {
        a: 1,
        b: nested
      }
      const result = shallowCopy(data, true)

      strictEqual(Object.isFrozen(result), true)
      // Should NOT freeze nested properties (shallow)
      strictEqual(Object.isFrozen(result.b), false)
      // Nested should still be same reference
      strictEqual(result.b, nested)
    })

    it('should freeze arrays when freeze=true', function () {
      const data = [1, 2, 3]
      const result = shallowCopy(data, true)

      strictEqual(Object.isFrozen(result), true)
    })

    it('should freeze custom objects when freeze=true', function () {
      class MyClass {
        constructor () {
          this.a = 1
        }
      }
      const original = new MyClass()
      const result = shallowCopy(original, true)

      strictEqual(Object.isFrozen(result), true)
    })

    it('should not freeze when freeze=false or undefined', function () {
      const data = { a: 1 }
      const result1 = shallowCopy(data, false)
      const result2 = shallowCopy(data)

      strictEqual(Object.isFrozen(result1), false)
      strictEqual(Object.isFrozen(result2), false)
    })

    it('should freeze Date objects when freeze=true', function () {
      const original = new Date()
      const result = shallowCopy(original, true)

      strictEqual(Object.isFrozen(result), true)
    })

    it('should freeze RegExp objects when freeze=true', function () {
      const original = /test/
      const result = shallowCopy(original, true)

      strictEqual(Object.isFrozen(result), true)
    })
  })

  describe('Edge Cases', function () {
    it('should handle null values', function () {
      strictEqual(shallowCopy(null), null)
    })

    it('should handle undefined values', function () {
      strictEqual(shallowCopy(undefined), undefined)
    })

    it('should handle mixed nested structures (shallow)', function () {
      const date = new Date()
      const pattern = /test/
      const obj = { x: 1 }
      const arr = [1, 2]

      const original = {
        array: arr,
        date: date,
        pattern: pattern,
        nested: {
          deep: {
            array: obj,
            value: null
          }
        }
      }

      const result = shallowCopy(original)

      // Top level should be copied
      notStrictEqual(result, original)

      // But nested references should be shared (shallow)
      strictEqual(result.array, arr)
      strictEqual(result.date, date)
      strictEqual(result.pattern, pattern)
      strictEqual(result.nested.deep.array, obj)
    })

    it('should handle objects with prototype pollution attempts', function () {
      const malicious = {
        a: 1,
        __proto__: { polluted: true }
      }

      const result = shallowCopy(malicious)

      // Should not pollute Object.prototype
      // @ts-ignore - testing prototype pollution
      strictEqual(Object.prototype.polluted, undefined)
      // __proto__ is skipped for security
      deepStrictEqual(result, { a: 1 })
    })

    it('should handle large arrays efficiently', function () {
      const original = Array.from({ length: 1000 }, (_, i) => i)
      const result = shallowCopy(original)

      deepStrictEqual(result, original)
      notStrictEqual(result, original)
      strictEqual(result.length, 1000)
    })

    it('should handle objects with many properties', function () {
      const original = {}
      for (let i = 0; i < 100; i++) {
        original[`prop${i}`] = i
      }

      const result = shallowCopy(original)

      deepStrictEqual(result, original)
      notStrictEqual(result, original)
      strictEqual(result.prop50, 50)
    })
  })

  describe('Reference Independence (Shallow Behavior)', function () {
    it('nested objects are shared between copy and original', function () {
      const original = { a: { b: { c: 1 } } }
      const result = shallowCopy(original)

      // Top level should be different
      notStrictEqual(result, original)

      // But nested should be same reference
      strictEqual(result.a, original.a)

      // Modifying nested affects both
      result.a.b.c = 2
      strictEqual(original.a.b.c, 2)
      strictEqual(result.a.b.c, 2)
    })

    it('arrays in objects are shared', function () {
      const original = { arr: [1, 2, 3] }
      const result = shallowCopy(original)

      notStrictEqual(result, original)
      strictEqual(result.arr, original.arr)

      result.arr.push(4)
      strictEqual(original.arr.length, 4)
      strictEqual(result.arr.length, 4)
    })

    it('objects in arrays are shared', function () {
      const original = [{ a: 1 }, { b: 2 }]
      const result = shallowCopy(original)

      notStrictEqual(result, original)
      strictEqual(result[0], original[0])
      strictEqual(result[1], original[1])

      result[0].a = 999
      strictEqual(original[0].a, 999)
      strictEqual(result[0].a, 999)
    })

    it('demonstrates difference from deep clone', function () {
      // This test shows what shallow copy does vs deep clone
      const original = {
        level1: {
          level2: {
            value: 42
          }
        }
      }

      const shallow = shallowCopy(original)
      const deep = { ...original }

      // Shallow: nested objects are shared
      strictEqual(shallow.level1, original.level1)

      // Modifying shallow affects original
      shallow.level1.level2.value = 999
      strictEqual(original.level1.level2.value, 999)
    })
  })

  describe('Special Object Types', function () {
    it('should handle Map objects (return as-is)', function () {
      const map = new Map([['a', 1]])
      const result = shallowCopy(map)

      strictEqual(result, map)
    })

    it('should handle Set objects (return as-is)', function () {
      const set = new Set([1, 2, 3])
      const result = shallowCopy(set)

      strictEqual(result, set)
    })

    it('should handle Error objects', function () {
      const error = new Error('test')
      const result = shallowCopy(error)

      // Should copy properties but maintain prototype
      strictEqual(result instanceof Error, true)
      strictEqual(result.message, error.message)
      notStrictEqual(result, error)
    })

    it('should handle Promise objects (return as-is)', function () {
      const promise = Promise.resolve(42)
      const result = shallowCopy(promise)

      strictEqual(result, promise)
    })

    it('should handle ArrayBuffer objects (return as-is)', function () {
      const buffer = new ArrayBuffer(8)
      const result = shallowCopy(buffer)

      strictEqual(result, buffer)
    })

    it('should handle TypedArray objects (return as-is)', function () {
      const typed = new Uint8Array([1, 2, 3])
      const result = shallowCopy(typed)

      strictEqual(result, typed)
    })
  })
})
