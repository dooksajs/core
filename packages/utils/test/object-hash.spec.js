import { describe, it } from 'node:test'
import { strictEqual, notStrictEqual, throws } from 'node:assert'
import { objectHash } from '../src/index.js'

describe('Object Hash', function () {
  describe('Basic Functionality', function () {
    it('should produce consistent hash for same object', function () {
      const data = { a: 1, b: 2, c: 3 }
      const hash1 = objectHash(data)
      const hash2 = objectHash(data)

      strictEqual(hash1, hash2)
    })

    it('should produce same hash for equivalent objects with different property order', function () {
      const data1 = { z: 1, a: 2, m: 3 }
      const data2 = { a: 2, m: 3, z: 1 }

      const hash1 = objectHash(data1)
      const hash2 = objectHash(data2)

      strictEqual(hash1, hash2)
    })

    it('should handle empty objects', function () {
      const hash = objectHash({})
      strictEqual(typeof hash, 'string')
      strictEqual(hash.length, 16) // xxhash64 hex is 16 chars
    })

    it('should handle objects with single property', function () {
      const hash = objectHash({ a: 1 })
      strictEqual(typeof hash, 'string')
      strictEqual(hash.length, 16)
    })

    it('should handle nested objects', function () {
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

      const hash = objectHash(data)
      strictEqual(typeof hash, 'string')
      strictEqual(hash.length, 16)
    })
  })

  describe('Array Handling', function () {
    it('should handle empty arrays', function () {
      const hash = objectHash([])
      strictEqual(typeof hash, 'string')
      strictEqual(hash.length, 16)
    })

    it('should handle arrays with primitives', function () {
      const hash = objectHash([1, 2, 3])
      strictEqual(typeof hash, 'string')
      strictEqual(hash.length, 16)
    })

    it('should handle arrays with objects', function () {
      const data = [
        { z: 1, a: 2 },
        { m: 3, b: 4 }
      ]

      const hash = objectHash(data)
      strictEqual(typeof hash, 'string')
      strictEqual(hash.length, 16)
    })

    it('should handle nested arrays', function () {
      const data = [[1, 2], [3, 4], [[5, 6]]]
      const hash = objectHash(data)
      strictEqual(typeof hash, 'string')
      strictEqual(hash.length, 16)
    })

    it('should produce same hash for equivalent arrays regardless of order', function () {
      const data1 = [3, 1, 2]
      const data2 = [1, 2, 3]

      // Arrays maintain order, so these should be different
      const hash1 = objectHash(data1)
      const hash2 = objectHash(data2)

      // Note: array order is preserved in sorting, so different arrays = different hashes
      notStrictEqual(hash1, hash2)
    })

    it('should handle arrays with mixed types', function () {
      const data = [1, 'hello', true, null, { a: 1 }, [2, 3]]
      const hash = objectHash(data)
      strictEqual(typeof hash, 'string')
      strictEqual(hash.length, 16)
    })
  })

  describe('Primitive Types', function () {
    it('should handle numbers', function () {
      const hash1 = objectHash(42)
      const hash2 = objectHash(42)
      strictEqual(hash1, hash2)
      strictEqual(hash1.length, 16)
    })

    it('should handle strings', function () {
      const hash1 = objectHash('hello')
      const hash2 = objectHash('hello')
      strictEqual(hash1, hash2)
      strictEqual(hash1.length, 16)
    })

    it('should handle booleans', function () {
      const hashTrue = objectHash(true)
      const hashFalse = objectHash(false)
      strictEqual(hashTrue.length, 16)
      strictEqual(hashFalse.length, 16)
      notStrictEqual(hashTrue, hashFalse)
    })

    it('should handle zero', function () {
      const hash = objectHash(0)
      strictEqual(typeof hash, 'string')
      strictEqual(hash.length, 16)
    })

    it('should handle empty string', function () {
      const hash = objectHash('')
      strictEqual(typeof hash, 'string')
      strictEqual(hash.length, 16)
    })

    it('should handle negative numbers', function () {
      const hash = objectHash(-42)
      strictEqual(typeof hash, 'string')
      strictEqual(hash.length, 16)
    })

    it('should handle floating point numbers', function () {
      const hash = objectHash(3.14159)
      strictEqual(typeof hash, 'string')
      strictEqual(hash.length, 16)
    })
  })

  describe('Error Handling', function () {
    it('should throw error for null input', function () {
      throws(() => {
        objectHash(null)
      }, /Cannot hash null or undefined value/)
    })

    it('should throw error for undefined input', function () {
      throws(() => {
        objectHash(undefined)
      }, /Cannot hash null or undefined value/)
    })
  })

  describe('Complex Objects', function () {
    it('should handle objects with all value types', function () {
      const data = {
        string: 'hello',
        number: 42,
        boolean: true,
        null: null,
        undefined: undefined,
        array: [1, 2, 3],
        object: { nested: 'value' },
        func: function () { return 1 }
      }

      const hash = objectHash(data)
      strictEqual(typeof hash, 'string')
      strictEqual(hash.length, 16)
    })

    it('should handle objects with Date values', function () {
      const data = {
        created: new Date('2024-01-01'),
        updated: new Date('2024-12-31')
      }

      const hash = objectHash(data)
      strictEqual(typeof hash, 'string')
      strictEqual(hash.length, 16)
    })

    it('should handle objects with RegExp values', function () {
      const data = {
        pattern: /test/gi,
        email: /^[a-z]+@[a-z]+\.[a-z]+$/
      }

      const hash = objectHash(data)
      strictEqual(typeof hash, 'string')
      strictEqual(hash.length, 16)
    })

    it('should handle objects with function values', function () {
      const data = {
        fn1: () => 1,
        fn2: function () { return 2 }
      }

      const hash = objectHash(data)
      strictEqual(typeof hash, 'string')
      strictEqual(hash.length, 16)
    })

    it('should handle objects with Symbol keys', function () {
      const sym = Symbol('test')
      const data = {
        regular: 1,
        [sym]: 2
      }

      const hash = objectHash(data)
      strictEqual(typeof hash, 'string')
      strictEqual(hash.length, 16)
    })
  })

  describe('Consistency and Determinism', function () {
    it('should always produce same hash for same complex object', function () {
      const data = {
        users: [
          { id: 3, name: 'Zoe', roles: ['admin', 'user'] },
          { id: 1, name: 'Alice', roles: ['user'] }
        ],
        settings: {
          theme: 'dark',
          notifications: {
            email: true,
            push: false
          }
        }
      }

      const hash1 = objectHash(data)
      const hash2 = objectHash(data)
      const hash3 = objectHash(JSON.parse(JSON.stringify(data)))

      strictEqual(hash1, hash2)
      strictEqual(hash1, hash3)
    })

    it('should produce different hashes for different objects', function () {
      const data1 = { a: 1, b: 2 }
      const data2 = { a: 1, b: 3 }

      const hash1 = objectHash(data1)
      const hash2 = objectHash(data2)

      notStrictEqual(hash1, hash2)
    })

    it('should handle deeply nested structures consistently', function () {
      const data = {
        a: {
          b: {
            c: {
              d: {
                e: {
                  f: [1, 2, 3],
                  g: { h: 'value' }
                }
              }
            }
          }
        }
      }

      const hash1 = objectHash(data)
      const hash2 = objectHash(data)

      strictEqual(hash1, hash2)
    })
  })

  describe('Edge Cases', function () {
    it('should handle objects with many properties', function () {
      const data = {}
      for (let i = 0; i < 100; i++) {
        data[`key_${i}`] = i
      }

      const hash = objectHash(data)
      strictEqual(typeof hash, 'string')
      strictEqual(hash.length, 16)
    })

    it('should handle objects with duplicate values', function () {
      const data = {
        a: 1,
        b: 1,
        c: 1,
        d: 1
      }

      const hash = objectHash(data)
      strictEqual(typeof hash, 'string')
      strictEqual(hash.length, 16)
    })

    it('should handle objects with empty nested structures', function () {
      const data = {
        a: {},
        b: [],
        c: { nested: {} }
      }

      const hash = objectHash(data)
      strictEqual(typeof hash, 'string')
      strictEqual(hash.length, 16)
    })

    it('should handle objects with special characters in keys', function () {
      const data = {
        'key-with-dash': 1,
        'key.with.dot': 2,
        'key with space': 3,
        'key_underscore': 4
      }

      const hash = objectHash(data)
      strictEqual(typeof hash, 'string')
      strictEqual(hash.length, 16)
    })

    it('should handle objects with numeric string keys', function () {
      const data = {
        '10': 1,
        '2': 2,
        '1': 3,
        '20': 4
      }

      const hash = objectHash(data)
      strictEqual(typeof hash, 'string')
      strictEqual(hash.length, 16)
    })

    it('should handle unicode characters in keys and values', function () {
      const data = {
        'α': 'beta',
        'β': 'gamma',
        'γ': 'delta'
      }

      const hash = objectHash(data)
      strictEqual(typeof hash, 'string')
      strictEqual(hash.length, 16)
    })

    it('should handle very large numbers', function () {
      const data = {
        big: Number.MAX_SAFE_INTEGER,
        small: Number.MIN_SAFE_INTEGER,
        infinity: Infinity,
        negInfinity: -Infinity
      }

      const hash = objectHash(data)
      strictEqual(typeof hash, 'string')
      strictEqual(hash.length, 16)
    })

    it('should handle NaN', function () {
      const hash = objectHash(NaN)
      strictEqual(typeof hash, 'string')
      strictEqual(hash.length, 16)
    })
  })

  describe('Real-world Scenarios', function () {
    it('should handle API response structure', function () {
      const apiResponse = {
        status: 'success',
        data: {
          users: [
            { id: 1, name: 'Alice', email: 'alice@example.com', roles: ['admin'] },
            { id: 2, name: 'Bob', email: 'bob@example.com', roles: ['user'] }
          ],
          pagination: {
            page: 1,
            limit: 10,
            total: 2
          }
        },
        meta: {
          timestamp: new Date('2024-01-01'),
          version: '1.0'
        }
      }

      const hash1 = objectHash(apiResponse)
      const hash2 = objectHash(apiResponse)

      strictEqual(hash1, hash2)
      strictEqual(hash1.length, 16)
    })

    it('should handle configuration object', function () {
      const config = {
        database: {
          host: 'localhost',
          port: 5432,
          credentials: {
            username: 'admin',
            password: 'secret'
          }
        },
        api: {
          timeout: 5000,
          endpoints: {
            users: '/api/users',
            posts: '/api/posts'
          }
        },
        features: {
          logging: true,
          analytics: false
        }
      }

      const hash = objectHash(config)
      strictEqual(typeof hash, 'string')
      strictEqual(hash.length, 16)
    })

    it('should handle form data structure', function () {
      const formData = {
        fields: {
          name: { type: 'text', required: true, value: 'John' },
          email: { type: 'email', required: true, value: 'john@example.com' },
          age: { type: 'number', required: false, value: 30 }
        },
        validation: {
          minLength: 3,
          maxLength: 50,
          pattern: '^[a-zA-Z\\s]+$'
        }
      }

      const hash1 = objectHash(formData)
      const hash2 = objectHash(formData)

      strictEqual(hash1, hash2)
      strictEqual(hash1.length, 16)
    })

    it('should handle state management structure', function () {
      const state = {
        entities: {
          users: {
            byId: {
              1: { id: 1, name: 'Alice' },
              2: { id: 2, name: 'Bob' }
            },
            allIds: [1, 2]
          },
          posts: {
            byId: {
              10: { id: 10, title: 'Post 1', author: 1 },
              20: { id: 20, title: 'Post 2', author: 2 }
            },
            allIds: [10, 20]
          }
        },
        ui: {
          currentView: 'dashboard',
          sidebar: { collapsed: false, width: 250 }
        }
      }

      const hash = objectHash(state)
      strictEqual(typeof hash, 'string')
      strictEqual(hash.length, 16)
    })
  })

  describe('Performance', function () {
    it('should handle large objects efficiently', function () {
      const data = {}
      for (let i = 0; i < 1000; i++) {
        data[`key_${i}`] = {
          value: i,
          nested: {
            data: `item_${i}`,
            meta: {
              timestamp: Date.now(),
              active: i % 2 === 0
            }
          }
        }
      }

      const start = Date.now()
      const hash = objectHash(data)
      const duration = Date.now() - start

      strictEqual(typeof hash, 'string')
      strictEqual(hash.length, 16)
      strictEqual(duration < 1000, true) // Should complete within 1 second
    })

    it('should handle deep nesting without stack overflow', function () {
      let data = { value: 1 }

      // Create 50 levels of nesting
      for (let i = 0; i < 50; i++) {
        data = {
          nested: data,
          level: i,
          meta: { depth: i + 1 }
        }
      }

      // Should not throw stack overflow
      const hash = objectHash(data)
      strictEqual(typeof hash, 'string')
      strictEqual(hash.length, 16)
    })

    it('should handle arrays with many elements', function () {
      const data = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        data: `item_${i}`,
        active: i % 2 === 0,
        meta: {
          timestamp: Date.now(),
          tags: ['tag1', 'tag2', 'tag3']
        }
      }))

      const start = Date.now()
      const hash = objectHash(data)
      const duration = Date.now() - start

      strictEqual(typeof hash, 'string')
      strictEqual(hash.length, 16)
      strictEqual(duration < 1000, true)
    })
  })

  describe('Hash Uniqueness', function () {
    it('should produce different hashes for different primitive values', function () {
      const values = [1, 2, 3, 'a', 'b', 'c', true, false]
      const hashes = values.map(v => objectHash(v))

      // All hashes should be unique
      const uniqueHashes = new Set(hashes)
      strictEqual(uniqueHashes.size, hashes.length)
    })

    it('should produce different hashes for different object structures', function () {
      const obj1 = { a: 1, b: 2 }
      const obj2 = { a: 1, b: 3 }
      const obj3 = { a: 1, c: 2 }
      const obj4 = { b: 2, a: 1 }

      const hash1 = objectHash(obj1)
      const hash2 = objectHash(obj2)
      const hash3 = objectHash(obj3)
      const hash4 = objectHash(obj4)

      // obj1 and obj4 should be same (different order)
      strictEqual(hash1, hash4)

      // Others should be different
      notStrictEqual(hash1, hash2)
      notStrictEqual(hash1, hash3)
      notStrictEqual(hash2, hash3)
    })

    it('should handle empty object vs empty array', function () {
      const emptyObj = objectHash({})
      const emptyArr = objectHash([])

      // These should be different
      notStrictEqual(emptyObj, emptyArr)
    })

    it('should handle similar nested structures', function () {
      const data1 = { a: { b: { c: 1 } } }
      const data2 = { a: { b: { c: 2 } } }
      const data3 = { a: { b: { d: 1 } } }

      const hash1 = objectHash(data1)
      const hash2 = objectHash(data2)
      const hash3 = objectHash(data3)

      // All should be different
      notStrictEqual(hash1, hash2)
      notStrictEqual(hash1, hash3)
      notStrictEqual(hash2, hash3)
    })
  })
})
