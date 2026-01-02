import { describe, it } from 'node:test'
import { deepStrictEqual } from 'node:assert'
import { createDataValue } from '../../src/utils/data-value.js'

describe('createDataValue', function () {
  describe('Basic functionality', function () {
    it('should create DataValue with collection only', function () {
      const result = createDataValue({ collection: 'users' })
      deepStrictEqual(result, { collection: 'users' })
    })

    it('should create DataValue with collection and id', function () {
      const result = createDataValue({
        collection: 'users',
        id: 'user123'
      })
      deepStrictEqual(result, {
        collection: 'users',
        id: 'user123'
      })
    })

    it('should create DataValue with collection, id, and raw data value', function () {
      const result = createDataValue({
        collection: 'users',
        id: 'user123',
        value: {
          name: 'John',
          age: 30
        }
      })
      deepStrictEqual(result, {
        collection: 'users',
        id: 'user123',
        item: {
          name: 'John',
          age: 30
        }
      })
    })

    it('should handle empty collection parameter', function () {
      const result = createDataValue()
      deepStrictEqual(result, { collection: '' })
    })

    it('should handle collection parameter with empty string', function () {
      const result = createDataValue({ collection: '' })
      deepStrictEqual(result, { collection: '' })
    })
  })

  describe('DataTarget object handling', function () {
    it('should extract item from DataTarget object', function () {
      const dataTarget = {
        _item: {
          name: 'John',
          age: 30
        },
        _metadata: {
          createdAt: 1234567890,
          updatedAt: 1234567890
        }
      }

      const result = createDataValue({
        collection: 'users',
        id: 'user123',
        value: dataTarget
      })

      deepStrictEqual(result, {
        collection: 'users',
        id: 'user123',
        item: {
          name: 'John',
          age: 30
        },
        metadata: {
          createdAt: 1234567890,
          updatedAt: 1234567890
        }
      })
    })

    it('should extract item and metadata from DataTarget', function () {
      const dataTarget = {
        _item: {
          name: 'Jane',
          age: 25
        },
        _metadata: {
          createdAt: 1234567890,
          updatedAt: 1234567891,
          userId: 456
        }
      }

      const result = createDataValue({
        collection: 'users',
        value: dataTarget
      })

      deepStrictEqual(result, {
        collection: 'users',
        item: {
          name: 'Jane',
          age: 25
        },
        metadata: {
          createdAt: 1234567890,
          updatedAt: 1234567891,
          userId: 456
        }
      })
    })

    it('should extract item, metadata, and previous from DataTarget', function () {
      const dataTarget = {
        _item: {
          name: 'Jane',
          age: 25
        },
        _metadata: {
          createdAt: 1234567890,
          updatedAt: 1234567891
        },
        _previous: {
          _item: {
            name: 'Jane',
            age: 24
          },
          _metadata: {
            createdAt: 1234567890,
            updatedAt: 1234567890
          }
        }
      }

      const result = createDataValue({
        collection: 'users',
        id: 'user456',
        value: dataTarget
      })

      deepStrictEqual(result, {
        collection: 'users',
        id: 'user456',
        item: {
          name: 'Jane',
          age: 25
        },
        metadata: {
          createdAt: 1234567890,
          updatedAt: 1234567891
        },
        previous: {
          _item: {
            name: 'Jane',
            age: 24
          },
          _metadata: {
            createdAt: 1234567890,
            updatedAt: 1234567890
          }
        }
      })
    })

    it('should handle DataTarget with null _item', function () {
      const dataTarget = {
        _item: null,
        _metadata: {
          createdAt: 1234567890,
          updatedAt: 1234567890
        }
      }

      const result = createDataValue({
        collection: 'users',
        value: dataTarget
      })

      // Should treat as raw value since _item is null
      deepStrictEqual(result, {
        collection: 'users',
        item: dataTarget
      })
    })

    it('should handle DataTarget with undefined _item', function () {
      const dataTarget = {
        _item: undefined,
        _metadata: {
          createdAt: 1234567890,
          updatedAt: 1234567890
        }
      }

      const result = createDataValue({
        collection: 'users',
        value: dataTarget
      })

      // Should treat as raw value since _item is undefined
      deepStrictEqual(result, {
        collection: 'users',
        item: dataTarget
      })
    })

    it('should handle DataTarget without _metadata', function () {
      const dataTarget = {
        _item: {
          name: 'John',
          age: 30
        }
      }

      const result = createDataValue({
        collection: 'users',
        // @ts-ignore
        value: dataTarget
      })

      deepStrictEqual(result, {
        collection: 'users',
        item: {
          name: 'John',
          age: 30
        }
      })
    })

    it('should handle DataTarget without _previous', function () {
      const dataTarget = {
        _item: {
          name: 'John',
          age: 30
        },
        _metadata: {
          createdAt: 1234567890,
          updatedAt: 1234567890
        }
      }

      const result = createDataValue({
        collection: 'users',
        value: dataTarget
      })

      deepStrictEqual(result, {
        collection: 'users',
        item: {
          name: 'John',
          age: 30
        },
        metadata: {
          createdAt: 1234567890,
          updatedAt: 1234567890
        }
      })
    })
  })

  describe('Raw data value handling', function () {
    it('should handle string value', function () {
      const result = createDataValue({
        collection: 'messages',
        value: 'Hello World'
      })

      deepStrictEqual(result, {
        collection: 'messages',
        item: 'Hello World'
      })
    })

    it('should handle number value', function () {
      const result = createDataValue({
        collection: 'counters',
        value: 42
      })

      deepStrictEqual(result, {
        collection: 'counters',
        item: 42
      })
    })

    it('should handle boolean value', function () {
      const result = createDataValue({
        collection: 'flags',
        value: true
      })

      deepStrictEqual(result, {
        collection: 'flags',
        item: true
      })
    })

    it('should handle array value', function () {
      const result = createDataValue({
        collection: 'lists',
        value: ['a', 'b', 'c']
      })

      deepStrictEqual(result, {
        collection: 'lists',
        item: ['a', 'b', 'c']
      })
    })

    it('should handle object value', function () {
      const result = createDataValue({
        collection: 'users',
        value: {
          name: 'John',
          age: 30,
          active: true
        }
      })

      deepStrictEqual(result, {
        collection: 'users',
        item: {
          name: 'John',
          age: 30,
          active: true
        }
      })
    })

    it('should handle null value', function () {
      const result = createDataValue({
        collection: 'items',
        value: null
      })

      deepStrictEqual(result, {
        collection: 'items'
      })
    })

    it('should handle undefined value', function () {
      const result = createDataValue({
        collection: 'items',
        value: undefined
      })

      deepStrictEqual(result, {
        collection: 'items'
      })
    })

    it('should handle empty object as raw value', function () {
      const result = createDataValue({
        collection: 'items',
        value: {}
      })

      deepStrictEqual(result, {
        collection: 'items',
        item: {}
      })
    })

    it('should handle empty array as raw value', function () {
      const result = createDataValue({
        collection: 'items',
        value: []
      })

      deepStrictEqual(result, {
        collection: 'items',
        item: []
      })
    })
  })

  describe('Edge cases', function () {
    it('should handle object that looks like DataTarget but has no _item property', function () {
      const fakeTarget = {
        _metadata: {
          createdAt: 1234567890,
          updatedAt: 1234567890
        },
        someOtherProp: 'value'
      }

      const result = createDataValue({
        collection: 'users',
        value: fakeTarget
      })

      // Should treat as raw value
      deepStrictEqual(result, {
        collection: 'users',
        item: fakeTarget
      })
    })

    it('should handle object with _item but also other properties', function () {
      const mixedObject = {
        _item: { name: 'John' },
        _metadata: {
          createdAt: 1234567890,
          updatedAt: 1234567890
        },
        extraProp: 'should be ignored'
      }

      const result = createDataValue({
        collection: 'users',
        value: mixedObject
      })

      deepStrictEqual(result, {
        collection: 'users',
        item: { name: 'John' },
        metadata: {
          createdAt: 1234567890,
          updatedAt: 1234567890
        }
      })
    })

    it('should handle id as empty string', function () {
      const result = createDataValue({
        collection: 'users',
        id: '',
        value: { name: 'John' }
      })

      // Empty string should not be added as id
      deepStrictEqual(result, {
        collection: 'users',
        item: { name: 'John' }
      })
    })

    it('should handle id as non-string', function () {
      const result = createDataValue({
        collection: 'users',
        // @ts-ignore
        id: 123,
        value: { name: 'John' }
      })

      // Non-string id should not be added
      deepStrictEqual(result, {
        collection: 'users',
        item: { name: 'John' }
      })
    })

    it('should handle complex nested DataTarget', function () {
      const dataTarget = {
        _item: {
          user: {
            name: 'John',
            age: 30
          },
          settings: {
            theme: 'dark',
            notifications: true
          }
        },
        _metadata: {
          createdAt: 1234567890,
          updatedAt: 1234567891,
          userId: 456,
          version: 3
        },
        _previous: {
          _item: {
            user: {
              name: 'John',
              age: 29
            },
            settings: {
              theme: 'light',
              notifications: true
            }
          },
          _metadata: {
            createdAt: 1234567890,
            updatedAt: 1234567890,
            userId: 456,
            version: 2
          }
        }
      }

      const result = createDataValue({
        collection: 'users',
        id: 'user456',
        value: dataTarget
      })

      deepStrictEqual(result, {
        collection: 'users',
        id: 'user456',
        item: {
          user: {
            name: 'John',
            age: 30
          },
          settings: {
            theme: 'dark',
            notifications: true
          }
        },
        metadata: {
          createdAt: 1234567890,
          updatedAt: 1234567891,
          userId: 456,
          version: 3
        },
        previous: {
          _item: {
            user: {
              name: 'John',
              age: 29
            },
            settings: {
              theme: 'light',
              notifications: true
            }
          },
          _metadata: {
            createdAt: 1234567890,
            updatedAt: 1234567890,
            userId: 456,
            version: 2
          }
        }
      })
    })
  })

  describe('Parameter variations', function () {
    it('should handle all parameters provided', function () {
      const result = createDataValue({
        collection: 'users',
        id: 'user123',
        value: { name: 'John' }
      })

      deepStrictEqual(result, {
        collection: 'users',
        id: 'user123',
        item: { name: 'John' }
      })
    })

    it('should handle only collection and value', function () {
      const result = createDataValue({
        collection: 'users',
        value: { name: 'John' }
      })

      deepStrictEqual(result, {
        collection: 'users',
        item: { name: 'John' }
      })
    })

    it('should handle only collection and id', function () {
      const result = createDataValue({
        collection: 'users',
        id: 'user123'
      })

      deepStrictEqual(result, {
        collection: 'users',
        id: 'user123'
      })
    })

    it('should handle only collection', function () {
      const result = createDataValue({
        collection: 'users'
      })

      deepStrictEqual(result, {
        collection: 'users'
      })
    })

    it('should handle empty object parameter', function () {
      const result = createDataValue({})

      deepStrictEqual(result, {
        collection: ''
      })
    })

    it('should handle no parameters', function () {
      const result = createDataValue()

      deepStrictEqual(result, {
        collection: ''
      })
    })
  })
})
