import { describe, it } from 'node:test'
import { notStrictEqual, deepStrictEqual, strictEqual, throws } from 'node:assert'
import { sortObject } from '../src/index.js'

describe('Sort Object', function () {
  describe('Basic Functionality', function () {
    it('should sort object properties alphanumerically', function () {
      const data = {
        z: 1,
        a: 2,
        m: 3,
        b: 4
      }

      const result = sortObject(data)
      const keys = Object.keys(result)

      deepStrictEqual(keys, ['a', 'b', 'm', 'z'])
      deepStrictEqual(result, {
        a: 2,
        b: 4,
        m: 3,
        z: 1
      })
    })

    it('should handle empty objects', function () {
      const result = sortObject({})
      deepStrictEqual(result, {})
    })

    it('should handle empty arrays', function () {
      const result = sortObject([])
      deepStrictEqual(result, [])
    })

    it('should preserve array structure', function () {
      const data = [3, 1, 2]
      const result = sortObject(data)

      // Arrays should maintain their order (not sorted by index)
      deepStrictEqual(result, [3, 1, 2])
    })

    it('should handle objects with single property', function () {
      const data = { a: 1 }
      const result = sortObject(data)

      deepStrictEqual(result, { a: 1 })
    })

    it('should handle arrays with single element', function () {
      const data = [1]
      const result = sortObject(data)

      deepStrictEqual(result, [1])
    })
  })

  describe('Error Handling', function () {
    it('should throw error for string input', function () {
      throws(() => {
        sortObject('test')
      }, /Unexpected type: string/)
    })

    it('should throw error for number input', function () {
      throws(() => {
        sortObject(42)
      }, /Unexpected type: number/)
    })

    it('should throw error for boolean input', function () {
      throws(() => {
        sortObject(true)
      }, /Unexpected type: boolean/)
    })

    it('should throw error for symbol input', function () {
      const sym = Symbol('test')
      throws(() => {
        sortObject(sym)
      }, /Unexpected type: symbol/)
    })

    it('should throw error for null input', function () {
      throws(() => {
        sortObject(null)
      }, /Unexpected type: object/)
    })

    it('should throw error for undefined input', function () {
      throws(() => {
        sortObject(undefined)
      }, /Unexpected type: undefined/)
    })

    it('should throw error for custom class instances', function () {
      class MyClass {
        constructor() {
          this.value = 1
        }
      }

      throws(() => {
        sortObject(new MyClass())
      }, /Unexpected type: object/)
    })

    it('should handle Date objects as objects (no error)', function () {
      // Date objects have typeof 'object' but constructor !== Object
      // This tests the specific condition in the function
      const date = new Date('2024-01-01')

      // This should throw because date.constructor !== Object
      throws(() => {
        sortObject(date)
      }, /Unexpected type: object/)
    })
  })

  describe('Nested Objects', function () {
    it('should sort nested object properties', function () {
      const data = {
        z: {
          c: 1,
          a: 2
        },
        a: {
          z: 3,
          b: 4
        }
      }

      const result = sortObject(data)

      // Top level should be sorted
      const topKeys = Object.keys(result)
      deepStrictEqual(topKeys, ['a', 'z'])

      // Nested objects should also be sorted
      deepStrictEqual(Object.keys(result.a), ['b', 'z'])
      deepStrictEqual(Object.keys(result.z), ['a', 'c'])

      deepStrictEqual(result, {
        a: {
          b: 4,
          z: 3
        },
        z: {
          a: 2,
          c: 1
        }
      })
    })

    it('should handle deeply nested objects', function () {
      const data = {
        level1: {
          level2: {
            level3: {
              z: 1,
              a: 2
            }
          }
        }
      }

      const result = sortObject(data)

      deepStrictEqual(result.level1.level2.level3, {
        a: 2,
        z: 1
      })
    })

    it('should handle mixed nested structures', function () {
      const data = {
        b: {
          y: [3, 1, 2],
          a: {
            z: 1,
            x: 2
          }
        },
        a: {
          m: {
            c: 1,
            b: 2
          },
          z: [1, 2, 3]
        }
      }

      const result = sortObject(data)

      // Top level sorted
      deepStrictEqual(Object.keys(result), ['a', 'b'])

      // Nested objects sorted
      deepStrictEqual(Object.keys(result.a), ['m', 'z'])
      deepStrictEqual(Object.keys(result.b), ['a', 'y'])

      // Nested arrays preserved
      deepStrictEqual(result.a.z, [1, 2, 3])
      deepStrictEqual(result.b.y, [3, 1, 2])

      // Deep nested objects sorted
      deepStrictEqual(Object.keys(result.a.m), ['b', 'c'])
      deepStrictEqual(Object.keys(result.b.a), ['x', 'z'])
    })
  })

  describe('Arrays with Nested Objects', function () {
    it('should handle array of objects', function () {
      const data = [
        {
          z: 1,
          a: 2
        },
        {
          m: 3,
          b: 4
        }
      ]

      const result = sortObject(data)

      // Array structure preserved
      strictEqual(Array.isArray(result), true)
      strictEqual(result.length, 2)

      // Objects within array are sorted
      deepStrictEqual(Object.keys(result[0]), ['a', 'z'])
      deepStrictEqual(Object.keys(result[1]), ['b', 'm'])
    })

    it('should handle nested arrays with objects', function () {
      const data = {
        arr: [
          {
            z: 1,
            a: 2
          },
          [3, 1, 2]
        ]
      }

      const result = sortObject(data)

      // Top level object sorted
      deepStrictEqual(Object.keys(result), ['arr'])

      // Array preserved
      strictEqual(Array.isArray(result.arr), true)
      strictEqual(result.arr.length, 2)

      // Object in array sorted
      deepStrictEqual(Object.keys(result.arr[0]), ['a', 'z'])

      // Nested array preserved
      deepStrictEqual(result.arr[1], [3, 1, 2])
    })

    it('should handle empty nested structures', function () {
      const data = {
        a: {},
        b: [],
        c: { nested: {} }
      }

      const result = sortObject(data)

      deepStrictEqual(result, {
        a: {},
        b: [],
        c: { nested: {} }
      })
    })
  })

  describe('Sorting Behavior', function () {
    it('should sort case-sensitively', function () {
      const data = {
        Z: 1,
        a: 2,
        A: 3,
        z: 4
      }

      const result = sortObject(data)
      const keys = Object.keys(result)

      // ASCII order: A(65), Z(90), a(97), z(122)
      deepStrictEqual(keys, ['A', 'Z', 'a', 'z'])
    })

    it('should sort numeric string keys correctly', function () {
      const data = {
        10: 1,
        2: 2,
        1: 3,
        20: 4
      }

      const result = sortObject(data)
      const keys = Object.keys(result)

      // String sorting: '1', '2', '10', '20' (alphabetical order)
      deepStrictEqual(keys, ['1', '2', '10', '20'])
    })

    it('should handle special characters in keys', function () {
      const data = {
        'z-key': 1,
        a_key: 2,
        'm.key': 3,
        'b key': 4
      }

      const result = sortObject(data)
      const keys = Object.keys(result)

      // Special characters sorted by ASCII
      deepStrictEqual(keys, ['a_key', 'b key', 'm.key', 'z-key'])
    })

    it('should handle empty string keys', function () {
      const data = {
        '': 1,
        a: 2,
        z: 3
      }

      const result = sortObject(data)
      const keys = Object.keys(result)

      // Empty string comes first
      deepStrictEqual(keys, ['', 'a', 'z'])
    })

    it('should handle unicode characters', function () {
      const data = {
        β: 1,
        α: 2,
        γ: 3
      }

      const result = sortObject(data)
      const keys = Object.keys(result)

      // Unicode sorting
      deepStrictEqual(keys, ['α', 'β', 'γ'])
    })
  })

  describe('Value Types', function () {
    it('should handle all primitive value types', function () {
      const data = {
        string: 'hello',
        number: 42,
        boolean: true,
        null: null,
        undefined: undefined,
        symbol: Symbol('test')
      }

      const result = sortObject(data)

      deepStrictEqual(result, {
        boolean: true,
        null: null,
        number: 42,
        string: 'hello',
        symbol: data.symbol,
        undefined: undefined
      })
    })

    it('should handle objects with null values', function () {
      const data = {
        z: null,
        a: null,
        m: null
      }

      const result = sortObject(data)

      deepStrictEqual(result, {
        a: null,
        m: null,
        z: null
      })
    })

    it('should handle objects with undefined values', function () {
      const data = {
        z: undefined,
        a: undefined,
        m: undefined
      }

      const result = sortObject(data)

      deepStrictEqual(result, {
        a: undefined,
        m: undefined,
        z: undefined
      })
    })

    it('should handle mixed value types in nested objects', function () {
      const data = {
        b: {
          z: [1, 2],
          a: 'test',
          m: { nested: true }
        },
        a: {
          y: null,
          z: 42
        }
      }

      const result = sortObject(data)

      deepStrictEqual(result, {
        a: {
          y: null,
          z: 42
        },
        b: {
          a: 'test',
          m: { nested: true },
          z: [1, 2]
        }
      })
    })
  })

  describe('Reference Independence', function () {
    it('should not modify original object', function () {
      const original = {
        z: 1,
        a: { nested: 2 }
      }

      const result = sortObject(original)

      // Original should remain unchanged
      deepStrictEqual(Object.keys(original), ['z', 'a'])
      deepStrictEqual(original.a, { nested: 2 })

      // Result should be sorted
      deepStrictEqual(Object.keys(result), ['a', 'z'])
    })

    it('should create new object references', function () {
      const data = {
        z: { a: 1 },
        a: { z: 2 }
      }

      const result = sortObject(data)

      // Top level objects should be different references
      notStrictEqual(result, data)
      notStrictEqual(result.a, data.a)
      notStrictEqual(result.z, data.z)
    })

    it('should create new array references', function () {
      const data = {
        arr: [1, 2, 3]
      }

      const result = sortObject(data)

      notStrictEqual(result, data)
      notStrictEqual(result.arr, data.arr)
    })

    it('should allow modification of result without affecting original', function () {
      const original = {
        z: { a: 1 },
        arr: [1, 2]
      }

      const result = sortObject(original)

      // Modify result
      result.z.a = 999
      result.arr.push(3)

      // Original should be unchanged
      strictEqual(original.z.a, 1)
      strictEqual(original.arr.length, 2)
    })
  })

  describe('Edge Cases', function () {
    it('should handle objects with many properties', function () {
      const data = {}
      const keys = []

      // Create 100 properties in random order
      for (let i = 0; i < 100; i++) {
        const key = String.fromCharCode(97 + (i % 26)) + i
        data[key] = i
        keys.push(key)
      }

      const result = sortObject(data)
      const resultKeys = Object.keys(result)

      // Should be sorted
      const sortedKeys = [...keys].sort()
      deepStrictEqual(resultKeys, sortedKeys)
    })

    it('should handle very deep nesting', function () {
      let data = { value: 1 }

      // Create deep nesting
      for (let i = 0; i < 10; i++) {
        data = {
          nested: data,
          z: i,
          a: i + 1
        }
      }

      const result = sortObject(data)

      // Should not crash and should be sorted at each level
      let check = result
      for (let i = 0; i < 10; i++) {
        deepStrictEqual(Object.keys(check), ['a', 'nested', 'z'])
        check = check.nested
      }
    })

    it('should handle objects with duplicate values', function () {
      const data = {
        z: 1,
        a: 1,
        m: 1,
        b: 1
      }

      const result = sortObject(data)

      deepStrictEqual(result, {
        a: 1,
        b: 1,
        m: 1,
        z: 1
      })
    })

    it('should handle arrays with duplicate values', function () {
      const data = [1, 1, 2, 2, 3, 3]
      const result = sortObject(data)

      deepStrictEqual(result, [1, 1, 2, 2, 3, 3])
    })

    it('should handle objects with functions as values', function () {
      const fn1 = () => 1
      const fn2 = () => 2

      const data = {
        z: fn1,
        a: fn2
      }

      const result = sortObject(data)

      // Functions should be preserved
      deepStrictEqual(Object.keys(result), ['a', 'z'])
      strictEqual(result.a, fn2)
      strictEqual(result.z, fn1)
    })

    it('should handle objects with Date values', function () {
      const date1 = new Date('2024-01-01')
      const date2 = new Date('2024-12-31')

      const data = {
        z: date1,
        a: date2
      }

      const result = sortObject(data)

      deepStrictEqual(Object.keys(result), ['a', 'z'])
      strictEqual(result.a, date2)
      strictEqual(result.z, date1)
    })

    it('should handle objects with RegExp values', function () {
      const regex1 = /test/gi
      const regex2 = /abc/i

      const data = {
        z: regex1,
        a: regex2
      }

      const result = sortObject(data)

      deepStrictEqual(Object.keys(result), ['a', 'z'])
      strictEqual(result.a, regex2)
      strictEqual(result.z, regex1)
    })

    it('should handle objects with Symbol keys', function () {
      const sym1 = Symbol('z')
      const sym2 = Symbol('a')

      const data = {
        [sym1]: 1,
        regular: 2,
        [sym2]: 3
      }

      const result = sortObject(data)

      // Regular keys should be sorted, symbols should be preserved
      deepStrictEqual(Object.keys(result), ['regular'])
      strictEqual(result[sym1], 1)
      strictEqual(result[sym2], 3)
    })

    it('should handle objects with getters and setters', function () {
      const data = {
        _value: 10,
        get z() {
          return this._value * 2
        },
        set a(v) {
          this._value = v
        }
      }

      const result = sortObject(data)

      // Getters/setters should be copied as regular properties
      deepStrictEqual(Object.keys(result).sort(), ['_value', 'a', 'z'])
    })

    it('should handle objects with non-enumerable properties', function () {
      const data = {
        z: 1,
        a: 2
      }
      Object.defineProperty(data, 'hidden', {
        value: 999,
        enumerable: false
      })

      const result = sortObject(data)

      // Non-enumerable properties should not be copied
      deepStrictEqual(Object.keys(result), ['a', 'z'])
      strictEqual(result.hidden, undefined)
    })

    it('should handle objects with __proto__ property', function () {
      // Create object normally first
      const data = {
        z: 1,
        a: 2
      }
      // Then manually add __proto__ as a regular property
      // This simulates what might happen with malicious input
      Object.defineProperty(data, '__proto__', {
        value: { polluted: true },
        enumerable: true,
        writable: true,
        configurable: true
      })

      const result = sortObject(data)

      // __proto__ should be filtered out for security (prevent prototype pollution)
      deepStrictEqual(Object.keys(result), ['a', 'z'])
      // Check that the property doesn't exist
      strictEqual(Object.prototype.hasOwnProperty.call(result, '__proto__'), false)
      // Verify no pollution occurred
      //@ts-ignore
      strictEqual(Object.prototype.polluted, undefined)
    })

    it('should handle objects with constructor property', function () {
      // Test with a plain object that has a constructor property value
      // The object itself is still a plain object (constructor === Object)
      const data = {
        z: 1,
        constructor: Array,
        a: 2
      }

      // This should work because the object itself is a plain object
      // The constructor property is just a regular property with value Array
      const result = sortObject(data)

      // constructor should be treated as a regular property
      deepStrictEqual(Object.keys(result), ['a', 'constructor', 'z'])
      strictEqual(result.constructor, Array)
    })

    it('should handle objects with toString property', function () {
      const data = {
        z: 1,
        toString: () => 'custom',
        a: 2
      }

      const result = sortObject(data)

      deepStrictEqual(Object.keys(result), ['a', 'toString', 'z'])
      strictEqual(result.toString(), 'custom')
    })

    it('should handle objects with hasOwnProperty property', function () {
      const data = {
        z: 1,
        hasOwnProperty: 'custom',
        a: 2
      }

      const result = sortObject(data)

      deepStrictEqual(Object.keys(result), ['a', 'hasOwnProperty', 'z'])
      strictEqual(result.hasOwnProperty, 'custom')
    })
  })

  describe('Complex Real-world Scenarios', function () {
    it('should handle configuration objects', function () {
      const config = {
        database: {
          port: 5432,
          host: 'localhost',
          credentials: {
            password: 'secret',
            username: 'admin'
          }
        },
        api: {
          timeout: 5000,
          endpoints: {
            users: '/api/users',
            posts: '/api/posts'
          }
        },
        logging: {
          level: 'info',
          format: 'json'
        }
      }

      const result = sortObject(config)

      // All levels should be sorted
      deepStrictEqual(Object.keys(result), ['api', 'database', 'logging'])
      deepStrictEqual(Object.keys(result.api), ['endpoints', 'timeout'])
      deepStrictEqual(Object.keys(result.api.endpoints), ['posts', 'users'])
      deepStrictEqual(Object.keys(result.database), ['credentials', 'host', 'port'])
      deepStrictEqual(Object.keys(result.database.credentials), ['password', 'username'])
      deepStrictEqual(Object.keys(result.logging), ['format', 'level'])
    })

    it('should handle API response data', function () {
      const apiResponse = {
        users: [
          {
            name: 'Zoe',
            id: 3,
            email: 'zoe@example.com'
          },
          {
            name: 'Alice',
            id: 1,
            email: 'alice@example.com'
          },
          {
            name: 'Bob',
            id: 2,
            email: 'bob@example.com'
          }
        ],
        meta: {
          total: 3,
          page: 1,
          filter: {
            status: 'active',
            role: 'admin'
          }
        }
      }

      const result = sortObject(apiResponse)

      // Top level sorted
      deepStrictEqual(Object.keys(result), ['meta', 'users'])

      // Array preserved
      strictEqual(result.users.length, 3)

      // Objects in array sorted
      deepStrictEqual(Object.keys(result.users[0]), ['email', 'id', 'name'])
      deepStrictEqual(Object.keys(result.users[1]), ['email', 'id', 'name'])
      deepStrictEqual(Object.keys(result.users[2]), ['email', 'id', 'name'])

      // Nested meta object sorted
      deepStrictEqual(Object.keys(result.meta), ['filter', 'page', 'total'])
      deepStrictEqual(Object.keys(result.meta.filter), ['role', 'status'])
    })

    it('should handle form data structure', function () {
      const formData = {
        submit: () => {
        },
        fields: {
          email: {
            type: 'email',
            required: true,
            label: 'Email Address'
          },
          password: {
            type: 'password',
            required: true,
            label: 'Password'
          }
        },
        validation: {
          minLength: 8,
          pattern: '^[a-zA-Z0-9]+$'
        }
      }

      const result = sortObject(formData)

      deepStrictEqual(Object.keys(result), ['fields', 'submit', 'validation'])
      deepStrictEqual(Object.keys(result.fields), ['email', 'password'])
      deepStrictEqual(Object.keys(result.fields.email), ['label', 'required', 'type'])
      deepStrictEqual(Object.keys(result.fields.password), ['label', 'required', 'type'])
      deepStrictEqual(Object.keys(result.validation), ['minLength', 'pattern'])
    })

    it('should handle state management structure', function () {
      const state = {
        entities: {
          users: {
            byId: {
              3: {
                name: 'Zoe',
                id: 3
              },
              1: {
                name: 'Alice',
                id: 1
              },
              2: {
                name: 'Bob',
                id: 2
              }
            },
            allIds: [3, 1, 2]
          },
          posts: {
            byId: {
              20: {
                title: 'Z Post',
                id: 20
              },
              10: {
                title: 'A Post',
                id: 10
              }
            },
            allIds: [20, 10]
          }
        },
        ui: {
          currentView: 'dashboard',
          sidebar: {
            collapsed: false,
            width: 250
          }
        }
      }

      const result = sortObject(state)

      // Top level sorted
      deepStrictEqual(Object.keys(result), ['entities', 'ui'])

      // Entities sorted
      deepStrictEqual(Object.keys(result.entities), ['posts', 'users'])

      // Users structure sorted
      deepStrictEqual(Object.keys(result.entities.users), ['allIds', 'byId'])
      deepStrictEqual(Object.keys(result.entities.users.byId), ['1', '2', '3'])

      // Posts structure sorted
      deepStrictEqual(Object.keys(result.entities.posts), ['allIds', 'byId'])
      deepStrictEqual(Object.keys(result.entities.posts.byId), ['10', '20'])

      // UI sorted
      deepStrictEqual(Object.keys(result.ui), ['currentView', 'sidebar'])
      deepStrictEqual(Object.keys(result.ui.sidebar), ['collapsed', 'width'])
    })
  })

  describe('Performance and Memory', function () {
    it('should handle large objects efficiently', function () {
      const data = {}

      // Create large object with 1000 properties
      for (let i = 0; i < 1000; i++) {
        data[`key_${1000 - i}`] = i
      }

      const start = Date.now()
      const result = sortObject(data)
      const duration = Date.now() - start

      // Should complete in reasonable time (< 1 second)
      strictEqual(duration < 1000, true)

      // Should have all properties
      strictEqual(Object.keys(result).length, 1000)

      // Should be sorted
      const keys = Object.keys(result)
      const sortedKeys = [...keys].sort()
      deepStrictEqual(keys, sortedKeys)
    })

    it('should not cause stack overflow with deep nesting', function () {
      let data = { value: 1 }

      // Create 50 levels of nesting
      for (let i = 0; i < 50; i++) {
        data = {
          nested: data,
          z: i,
          a: i + 1
        }
      }

      // Should not throw stack overflow
      const result = sortObject(data)

      // Verify structure is preserved
      let check = result
      for (let i = 0; i < 50; i++) {
        strictEqual(check.hasOwnProperty('nested'), true)
        strictEqual(check.hasOwnProperty('a'), true)
        strictEqual(check.hasOwnProperty('z'), true)
        check = check.nested
      }
    })

    it('should handle arrays with many elements', function () {
      const data = Array.from({ length: 1000 }, (_, i) => ({
        z: 1000 - i,
        a: i
      }))

      const result = sortObject(data)

      strictEqual(result.length, 1000)

      // Each object should be sorted
      for (let i = 0; i < result.length; i++) {
        deepStrictEqual(Object.keys(result[i]), ['a', 'z'])
      }
    })
  })
})
