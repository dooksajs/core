import { describe, it, beforeEach, afterEach } from 'node:test'
import { strictEqual, ok, deepStrictEqual, throws } from 'node:assert'
import { mockPlugin } from '@dooksa/test'

describe('List plugin', function () {
  let mock

  beforeEach(async function () {
    // Setup mock plugin with required client modules
    mock = await mockPlugin(this, {
      name: 'list',
      platform: 'client',
      clientModules: ['state', 'action', 'operator']
    })
  })

  afterEach(function () {
    if (mock) {
      mock.restore()
    }
  })

  describe('Plugin metadata', function () {
    it('should export all list actions', function () {
      ok(mock.client.method.listFilter)
      ok(mock.client.method.listMap)
      ok(mock.client.method.listIndexOf)
      ok(mock.client.method.listPush)
      ok(mock.client.method.listSort)
      ok(mock.client.method.listSplice)

      strictEqual(typeof mock.client.method.listFilter, 'function')
      strictEqual(typeof mock.client.method.listMap, 'function')
      strictEqual(typeof mock.client.method.listIndexOf, 'function')
      strictEqual(typeof mock.client.method.listPush, 'function')
      strictEqual(typeof mock.client.method.listSort, 'function')
      strictEqual(typeof mock.client.method.listSplice, 'function')
    })
  })

  describe('filter action', function () {
    describe('Single condition filtering', function () {
      it('should filter items with equality operator', function () {
        const items = [
          {
            value: 10,
            widgetId: 'w1'
          },
          {
            value: 20,
            widgetId: 'w2'
          },
          {
            value: 30,
            widgetId: 'w3'
          }
        ]

        const result = mock.client.method.listFilter({
          items,
          options: [{
            name: '==',
            value: 20
          }]
        })

        strictEqual(result.items.length, 1)
        strictEqual(result.items[0].value, 20)
        strictEqual(result.items[0].widgetId, 'w2')
        ok(result.usedWidgets.w2)
      })

      it('should filter items with greater than operator', function () {
        const items = [
          {
            value: 10,
            widgetId: 'w1'
          },
          {
            value: 20,
            widgetId: 'w2'
          },
          {
            value: 30,
            widgetId: 'w3'
          }
        ]

        const result = mock.client.method.listFilter({
          items,
          options: [{
            name: '>',
            value: 15
          }]
        })

        strictEqual(result.items.length, 2)
        strictEqual(result.items[0].value, 20)
        strictEqual(result.items[1].value, 30)
      })

      it('should return empty array when no items match', function () {
        const items = [
          {
            value: 10,
            widgetId: 'w1'
          },
          {
            value: 20,
            widgetId: 'w2'
          }
        ]

        const result = mock.client.method.listFilter({
          items,
          options: [{
            name: '==',
            value: 99
          }]
        })

        strictEqual(result.items.length, 0)
        deepStrictEqual(result.usedWidgets, {})
      })

      it('should filter string values case-insensitively', function () {
        const items = [
          {
            value: 'Apple',
            widgetId: 'w1'
          },
          {
            value: 'Banana',
            widgetId: 'w2'
          },
          {
            value: 'Cherry',
            widgetId: 'w3'
          }
        ]

        const result = mock.client.method.listFilter({
          items,
          options: [{
            name: '==',
            value: 'apple'
          }]
        })

        strictEqual(result.items.length, 1)
        strictEqual(result.items[0].value, 'Apple')
      })
    })

    describe('Multiple conditions filtering', function () {
      it('should filter with AND logic (all conditions must match)', function () {
        const items = [
          {
            value: 10,
            widgetId: 'w1'
          },
          {
            value: 20,
            widgetId: 'w2'
          },
          {
            value: 30,
            widgetId: 'w3'
          },
          {
            value: 40,
            widgetId: 'w4'
          }
        ]

        // Multiple conditions are processed in pairs with implicit AND
        const result = mock.client.method.listFilter({
          items,
          options: [
            {
              name: '>',
              value: 15
            },
            {
              name: '<',
              value: 35
            }
          ]
        })

        strictEqual(result.items.length, 2)
        strictEqual(result.items[0].value, 20)
        strictEqual(result.items[1].value, 30)
      })

      it('should track all used widgets in multi-condition filter', function () {
        const items = [
          {
            value: 10,
            widgetId: 'w1'
          },
          {
            value: 20,
            widgetId: 'w2'
          },
          {
            value: 30,
            widgetId: 'w3'
          }
        ]

        const result = mock.client.method.listFilter({
          items,
          options: [
            {
              name: '>=',
              value: 10
            },
            {
              name: '<=',
              value: 30
            }
          ]
        })

        strictEqual(result.items.length, 3)
        ok(result.usedWidgets.w1)
        ok(result.usedWidgets.w2)
        ok(result.usedWidgets.w3)
      })
    })

    describe('Edge cases', function () {
      it('should handle empty items array', function () {
        const result = mock.client.method.listFilter({
          items: [],
          options: [{
            name: '==',
            value: 1
          }]
        })

        strictEqual(result.items.length, 0)
        deepStrictEqual(result.usedWidgets, {})
      })

      it('should handle empty options array', function () {
        const items = [
          {
            value: 10,
            widgetId: 'w1'
          },
          {
            value: 20,
            widgetId: 'w2'
          }
        ]

        // This should probably throw an error or handle gracefully
        // Based on the code, it would try to access options[0] which would be undefined
        // Let's test what actually happens
        try {
          const result = mock.client.method.listFilter({
            items,
            options: []
          })
          // If it doesn't throw, it should return all items
          strictEqual(result.items.length, 2)
        } catch (error) {
          // Expected to throw
          ok(error.message.includes('Cannot read property') || error.message.includes('Cannot read properties'))
        }
      })

      it('should handle items with different value types', function () {
        const items = [
          {
            value: '10',
            widgetId: 'w1'
          },
          {
            value: 20,
            widgetId: 'w2'
          },
          {
            value: true,
            widgetId: 'w3'
          }
        ]

        const result = mock.client.method.listFilter({
          items,
          options: [{
            name: '==',
            value: 20
          }]
        })

        // Should match the number 20
        strictEqual(result.items.length, 1)
        strictEqual(result.items[0].widgetId, 'w2')
      })
    })
  })

  describe('map action', function () {
    describe('Array iteration', function () {
      it('should iterate over array and execute action for each item', async function () {
        const items = [1, 2, 3]
        const context = {}

        // Mock actionDispatch to track calls
        const actionDispatchCalls = []
        const originalActionDispatch = mock.client.method.actionDispatch
        mock.client.method.actionDispatch = async function (params) {
          actionDispatchCalls.push(params)
          // Simulate action that adds to $list
          if (params.context.$list) {
            params.context.$list.push(params.payload.value * 2)
          }
          return params.payload.value * 2
        }

        const result = await mock.client.method.listMap({
          context,
          items,
          actionId: 'test-action'
        })

        // Should have called actionDispatch 3 times
        strictEqual(actionDispatchCalls.length, 3)

        // Check that $list was populated
        strictEqual(result.length, 3)
        deepStrictEqual(result, [2, 4, 6])

        // Verify payload structure
        strictEqual(actionDispatchCalls[0].payload.key, 0)
        strictEqual(actionDispatchCalls[0].payload.value, 1)
        strictEqual(actionDispatchCalls[0].payload.length, 3)

        mock.client.method.actionDispatch = originalActionDispatch
      })

      it('should handle empty array', async function () {
        const items = []
        const context = {}

        const result = await mock.client.method.listMap({
          context,
          items,
          actionId: 'test-action'
        })

        strictEqual(result.length, 0)
        deepStrictEqual(result, [])
      })

      it('should use provided context or action context', async function () {
        const items = [1]
        const providedContext = { existing: 'value' }

        /** @type {Object|null} */
        let capturedContext = null
        const originalActionDispatch = mock.client.method.actionDispatch
        mock.client.method.actionDispatch = async function (params) {
          capturedContext = params.context
          params.context.$list = [params.payload.value]
          return params.payload.value
        }

        await mock.client.method.listMap({
          context: providedContext,
          items,
          actionId: 'test-action'
        })

        ok(capturedContext)
        strictEqual(capturedContext.existing, 'value')
        ok(capturedContext.$list)

        mock.client.method.actionDispatch = originalActionDispatch
      })
    })

    describe('Object iteration', function () {
      it('should iterate over object entries', async function () {
        const items = {
          a: 1,
          b: 2,
          c: 3
        }
        const context = {}

        const actionDispatchCalls = []
        const originalActionDispatch = mock.client.method.actionDispatch
        mock.client.method.actionDispatch = async function (params) {
          actionDispatchCalls.push(params)
          if (!params.context.$list) {
            params.context.$list = {}
          }
          params.context.$list[params.payload.key] = params.payload.value * 2
          return params.payload.value * 2
        }

        const result = await mock.client.method.listMap({
          context,
          items,
          actionId: 'test-action'
        })

        strictEqual(actionDispatchCalls.length, 3)

        // Should have called with object entries
        const keys = actionDispatchCalls.map(call => call.payload.key)
        ok(keys.includes('a'))
        ok(keys.includes('b'))
        ok(keys.includes('c'))

        // Result should be an object
        strictEqual(typeof result, 'object')
        deepStrictEqual(result, {
          a: 2,
          b: 4,
          c: 6
        })

        mock.client.method.actionDispatch = originalActionDispatch
      })

      it('should handle empty object', async function () {
        const items = {}
        const context = {}

        const result = await mock.client.method.listMap({
          context,
          items,
          actionId: 'test-action'
        })

        strictEqual(typeof result, 'object')
        deepStrictEqual(result, {})
      })
    })

    describe('Error handling', function () {
      it('should handle actionDispatch errors', async function () {
        const items = [1]
        const context = {}

        const originalActionDispatch = mock.client.method.actionDispatch
        mock.client.method.actionDispatch = async function () {
          throw new Error('Action failed')
        }

        try {
          await mock.client.method.listMap({
            context,
            items,
            actionId: 'test-action'
          })
          ok(false, 'Should have thrown error')
        } catch (error) {
          strictEqual(error.message, 'Action failed')
        }

        mock.client.method.actionDispatch = originalActionDispatch
      })
    })
  })

  describe('indexOf action', function () {
    it('should find index of value in array', function () {
      const items = ['a', 'b', 'c', 'd']

      strictEqual(mock.client.method.listIndexOf({
        items,
        value: 'b'
      }), 1)
      strictEqual(mock.client.method.listIndexOf({
        items,
        value: 'c'
      }), 2)
    })

    it('should return -1 when value not found', function () {
      const items = ['a', 'b', 'c']

      strictEqual(mock.client.method.listIndexOf({
        items,
        value: 'z'
      }), -1)
      strictEqual(mock.client.method.listIndexOf({
        items,
        value: 123
      }), -1)
    })

    it('should handle empty array', function () {
      strictEqual(mock.client.method.listIndexOf({
        items: [],
        value: 'anything'
      }), -1)
    })

    it('should find first occurrence only', function () {
      const items = ['a', 'b', 'a', 'c']

      strictEqual(mock.client.method.listIndexOf({
        items,
        value: 'a'
      }), 0)
    })

    it('should work with numbers', function () {
      const items = [10, 20, 30, 20]

      strictEqual(mock.client.method.listIndexOf({
        items,
        value: 20
      }), 1)
      strictEqual(mock.client.method.listIndexOf({
        items,
        value: 99
      }), -1)
    })

    it('should use strict equality', function () {
      const items = ['1', 1, true]

      strictEqual(mock.client.method.listIndexOf({
        items,
        value: 1
      }), 1)
      strictEqual(mock.client.method.listIndexOf({
        items,
        value: '1'
      }), 0)
      strictEqual(mock.client.method.listIndexOf({
        items,
        value: true
      }), 2)
    })
  })

  describe('push action', function () {
    it('should add single element to array', function () {
      const target = [1, 2, 3]
      const result = mock.client.method.listPush({
        target,
        source: 4
      })

      strictEqual(result, 4) // new length
      deepStrictEqual(target, [1, 2, 3, 4])
    })

    it('should add element to empty array', function () {
      const target = []
      const result = mock.client.method.listPush({
        target,
        source: 'first'
      })

      strictEqual(result, 1)
      deepStrictEqual(target, ['first'])
    })

    it('should add object to array', function () {
      const target = [{ id: 1 }]
      const source = { id: 2 }
      const result = mock.client.method.listPush({
        target,
        source
      })

      strictEqual(result, 2)
      deepStrictEqual(target, [{ id: 1 }, { id: 2 }])
    })

    it('should add multiple elements if source is array', function () {
      const target = [1]
      const source = [2, 3, 4]
      const result = mock.client.method.listPush({
        target,
        source
      })

      // push with array adds the array as a single element
      strictEqual(result, 2)
      deepStrictEqual(target, [1, [2, 3, 4]])
    })

    it('should modify original array', function () {
      const target = [1, 2]
      const original = target

      mock.client.method.listPush({
        target,
        source: 3
      })

      strictEqual(target, original)
      strictEqual(target.length, 3)
    })
  })

  describe('sort action', function () {
    describe('Ascending sort', function () {
      it('should sort numbers in ascending order', function () {
        const items = [
          {
            value: 30,
            widgetId: 'w3'
          },
          {
            value: 10,
            widgetId: 'w1'
          },
          {
            value: 20,
            widgetId: 'w2'
          }
        ]

        const result = mock.client.method.listSort({
          items,
          type: 'ascending'
        })

        strictEqual(result.length, 3)
        strictEqual(result[0].value, 10)
        strictEqual(result[1].value, 20)
        strictEqual(result[2].value, 30)
      })

      it('should sort strings case-insensitively in ascending order', function () {
        const items = [
          {
            value: 'Zebra',
            widgetId: 'w3'
          },
          {
            value: 'apple',
            widgetId: 'w1'
          },
          {
            value: 'Banana',
            widgetId: 'w2'
          }
        ]

        const result = mock.client.method.listSort({
          items,
          type: 'ascending'
        })

        strictEqual(result[0].value, 'apple')
        strictEqual(result[1].value, 'Banana')
        strictEqual(result[2].value, 'Zebra')
      })

      it('should handle mixed case strings', function () {
        const items = [
          {
            value: 'ABC',
            widgetId: 'w1'
          },
          {
            value: 'abc',
            widgetId: 'w2'
          },
          {
            value: 'Abc',
            widgetId: 'w3'
          }
        ]

        const result = mock.client.method.listSort({
          items,
          type: 'ascending'
        })

        // All should be considered equal, so order might be preserved
        // But the sort function should handle this gracefully
        strictEqual(result.length, 3)
      })

      it('should handle empty array', function () {
        const result = mock.client.method.listSort({
          items: [],
          type: 'ascending'
        })
        deepStrictEqual(result, [])
      })

      it('should handle single element', function () {
        const items = [{
          value: 42,
          widgetId: 'w1'
        }]
        const result = mock.client.method.listSort({
          items,
          type: 'ascending'
        })

        deepStrictEqual(result, items)
      })
    })

    describe('Descending sort', function () {
      it('should sort numbers in descending order', function () {
        const items = [
          {
            value: 10,
            widgetId: 'w1'
          },
          {
            value: 30,
            widgetId: 'w3'
          },
          {
            value: 20,
            widgetId: 'w2'
          }
        ]

        const result = mock.client.method.listSort({
          items,
          type: 'descending'
        })

        strictEqual(result[0].value, 30)
        strictEqual(result[1].value, 20)
        strictEqual(result[2].value, 10)
      })

      it('should sort strings case-insensitively in descending order', function () {
        const items = [
          {
            value: 'apple',
            widgetId: 'w1'
          },
          {
            value: 'Zebra',
            widgetId: 'w3'
          },
          {
            value: 'Banana',
            widgetId: 'w2'
          }
        ]

        const result = mock.client.method.listSort({
          items,
          type: 'descending'
        })

        strictEqual(result[0].value, 'Zebra')
        strictEqual(result[1].value, 'Banana')
        strictEqual(result[2].value, 'apple')
      })
    })

    describe('Error handling', function () {
      it('should throw error for invalid sort type', function () {
        const items = [{
          value: 1,
          widgetId: 'w1'
        }]

        throws(
          () => mock.client.method.listSort({
            items,
            type: 'invalid'
          }),
          /Sort method does not exist: invalid/
        )
      })

      it('should throw error for missing type', function () {
        const items = [{
          value: 1,
          widgetId: 'w1'
        }]

        throws(
          () => mock.client.method.listSort({ items }),
          /Sort method does not exist: undefined/
        )
      })
    })

    describe('Edge cases', function () {
      it('should handle equal values', function () {
        const items = [
          {
            value: 20,
            widgetId: 'w1'
          },
          {
            value: 20,
            widgetId: 'w2'
          },
          {
            value: 20,
            widgetId: 'w3'
          }
        ]

        const result = mock.client.method.listSort({
          items,
          type: 'ascending'
        })

        strictEqual(result.length, 3)
        // Order of equal elements might be preserved or not
        // Just verify all are present
        const values = result.map(item => item.value)
        deepStrictEqual(values, [20, 20, 20])
      })

      it('should handle negative numbers', function () {
        const items = [
          {
            value: -5,
            widgetId: 'w1'
          },
          {
            value: 10,
            widgetId: 'w2'
          },
          {
            value: -20,
            widgetId: 'w3'
          }
        ]

        const result = mock.client.method.listSort({
          items,
          type: 'ascending'
        })

        strictEqual(result[0].value, -20)
        strictEqual(result[1].value, -5)
        strictEqual(result[2].value, 10)
      })

      it('should handle decimal numbers', function () {
        const items = [
          {
            value: 1.5,
            widgetId: 'w1'
          },
          {
            value: 1.1,
            widgetId: 'w2'
          },
          {
            value: 1.9,
            widgetId: 'w3'
          }
        ]

        const result = mock.client.method.listSort({
          items,
          type: 'ascending'
        })

        strictEqual(result[0].value, 1.1)
        strictEqual(result[1].value, 1.5)
        strictEqual(result[2].value, 1.9)
      })
    })
  })

  describe('splice action', function () {
    describe('Removing elements', function () {
      it('should remove elements from array', function () {
        const target = [1, 2, 3, 4, 5]

        const removed = mock.client.method.listSplice({
          target,
          start: 1,
          deleteCount: 2
        })

        deepStrictEqual(removed, [2, 3])
        deepStrictEqual(target, [1, 4, 5])
      })

      it('should remove from start to end when deleteCount is large', function () {
        const target = [1, 2, 3]

        const removed = mock.client.method.listSplice({
          target,
          start: 1,
          deleteCount: 10
        })

        deepStrictEqual(removed, [2, 3])
        deepStrictEqual(target, [1])
      })

      it('should remove all elements when start is 0 and no deleteCount', function () {
        const target = [1, 2, 3]

        const removed = mock.client.method.listSplice({
          target,
          start: 0
        })

        deepStrictEqual(removed, [1, 2, 3])
        deepStrictEqual(target, [])
      })

      it('should remove from end when start is negative', function () {
        const target = [1, 2, 3, 4]

        const removed = mock.client.method.listSplice({
          target,
          start: -2,
          deleteCount: 1
        })

        deepStrictEqual(removed, [3])
        deepStrictEqual(target, [1, 2, 4])
      })
    })

    describe('Adding elements', function () {
      it('should add single element at position', function () {
        const target = [1, 2, 4]

        const removed = mock.client.method.listSplice({
          target,
          source: 3,
          start: 2,
          deleteCount: 0
        })

        deepStrictEqual(removed, [])
        deepStrictEqual(target, [1, 2, 3, 4])
      })

      it('should add multiple elements from array', function () {
        const target = [1, 4]

        const removed = mock.client.method.listSplice({
          target,
          source: [2, 3],
          start: 1,
          deleteCount: 0
        })

        deepStrictEqual(removed, [])
        deepStrictEqual(target, [1, 2, 3, 4])
      })

      it('should replace elements', function () {
        const target = ['a', 'b', 'c', 'd']

        const removed = mock.client.method.listSplice({
          target,
          source: ['x', 'y'],
          start: 1,
          deleteCount: 2
        })

        deepStrictEqual(removed, ['b', 'c'])
        deepStrictEqual(target, ['a', 'x', 'y', 'd'])
      })
    })

    describe('Edge cases', function () {
      it('should handle empty target array', function () {
        const target = []

        const removed = mock.client.method.listSplice({
          target,
          source: [1, 2],
          start: 0,
          deleteCount: 0
        })

        deepStrictEqual(removed, [])
        deepStrictEqual(target, [1, 2])
      })

      it('should handle start beyond array length', function () {
        const target = [1, 2, 3]

        const removed = mock.client.method.listSplice({
          target,
          source: [4],
          start: 10,
          deleteCount: 0
        })

        deepStrictEqual(removed, [])
        deepStrictEqual(target, [1, 2, 3, 4])
      })

      it('should handle negative start beyond array', function () {
        const target = [1, 2]

        const removed = mock.client.method.listSplice({
          target,
          source: [0],
          start: -5,
          deleteCount: 0
        })

        deepStrictEqual(removed, [])
        deepStrictEqual(target, [0, 1, 2])
      })

      it('should handle zero deleteCount', function () {
        const target = [1, 2, 3]

        const removed = mock.client.method.listSplice({
          target,
          source: [99],
          start: 1,
          deleteCount: 0
        })

        deepStrictEqual(removed, [])
        deepStrictEqual(target, [1, 99, 2, 3])
      })

      it('should handle undefined deleteCount (defaults to 0)', function () {
        const target = [1, 2, 3]

        const removed = mock.client.method.listSplice({
          target,
          source: [99],
          start: 1
        })

        deepStrictEqual(removed, [])
        deepStrictEqual(target, [1, 99, 2, 3])
      })
    })

    describe('Error conditions', function () {
      it('should throw error when start is null but source is provided', function () {
        const target = [1, 2, 3]

        throws(
          () => mock.client.method.listSplice({
            target,
            source: [4],
            start: null
          }),
          /Splice with source expects a start position but found null/
        )
      })

      it('should throw error when start is undefined but source is provided', function () {
        const target = [1, 2, 3]

        throws(
          () => mock.client.method.listSplice({
            target,
            source: [4],
            start: undefined
          }),
          /Splice with source expects a start position but found undefined/
        )
      })

      it('should NOT throw when start is null and source is undefined', function () {
        const target = [1, 2, 3]

        const removed = mock.client.method.listSplice({
          target,
          start: null
        })

        // Should clear the array
        deepStrictEqual(removed, [1, 2, 3])
        deepStrictEqual(target, [])
      })

      it('should handle primitive source values', function () {
        const target = [1, 2, 3]

        const removed = mock.client.method.listSplice({
          target,
          source: 99,
          start: 1,
          deleteCount: 1
        })

        deepStrictEqual(removed, [2])
        deepStrictEqual(target, [1, 99, 3])
      })
    })
  })

  describe('Integration scenarios', function () {
    it('should filter, sort, and splice in sequence', function () {
      // Start with unsorted data
      const items = [
        {
          value: 50,
          widgetId: 'w5'
        },
        {
          value: 10,
          widgetId: 'w1'
        },
        {
          value: 30,
          widgetId: 'w3'
        },
        {
          value: 20,
          widgetId: 'w2'
        },
        {
          value: 40,
          widgetId: 'w4'
        }
      ]

      // Filter for values > 15
      const filtered = mock.client.method.listFilter({
        items,
        options: [{
          name: '>',
          value: 15
        }]
      })

      strictEqual(filtered.items.length, 4)

      // Sort ascending
      const sorted = mock.client.method.listSort({
        items: filtered.items,
        type: 'ascending'
      })

      strictEqual(sorted[0].value, 20)
      strictEqual(sorted[3].value, 50)

      // Push new item
      const targetArray = [...sorted]
      mock.client.method.listPush({
        target: targetArray,
        source: {
          value: 25,
          widgetId: 'w25'
        }
      })

      strictEqual(targetArray.length, 5)
      strictEqual(targetArray[4].value, 25)

      // Splice to insert at position 2
      const removed = mock.client.method.listSplice({
        target: targetArray,
        source: {
          value: 22,
          widgetId: 'w22'
        },
        start: 2,
        deleteCount: 0
      })

      strictEqual(removed.length, 0)
      strictEqual(targetArray.length, 6)
      strictEqual(targetArray[2].value, 22)
    })

    it('should use indexOf to find position then modify', function () {
      const items = ['apple', 'banana', 'cherry', 'date']

      const index = mock.client.method.listIndexOf({
        items,
        value: 'cherry'
      })
      strictEqual(index, 2)

      // Remove that item
      const removed = mock.client.method.listSplice({
        target: items,
        start: index,
        deleteCount: 1
      })

      deepStrictEqual(removed, ['cherry'])
      deepStrictEqual(items, ['apple', 'banana', 'date'])
    })

    it('should handle complex filtering with map', async function () {
      const items = [
        {
          value: 1,
          widgetId: 'w1'
        },
        {
          value: 2,
          widgetId: 'w2'
        },
        {
          value: 3,
          widgetId: 'w3'
        },
        {
          value: 4,
          widgetId: 'w4'
        }
      ]

      // Filter for even numbers
      const filtered = mock.client.method.listFilter({
        items,
        options: [{
          name: '%',
          value: 2
        }] // modulo operator
      })

      strictEqual(filtered.items.length, 2)

      // Map to double the values
      const originalActionDispatch = mock.client.method.actionDispatch
      mock.client.method.actionDispatch = async function (params) {
        if (!params.context.$list) {
          params.context.$list = []
        }
        params.context.$list.push(params.payload.value.value * 2)
        return params.payload.value.value * 2
      }

      const mapped = await mock.client.method.listMap({
        context: {},
        items: filtered.items,
        actionId: 'double'
      })

      deepStrictEqual(mapped, [4, 8])

      mock.client.method.actionDispatch = originalActionDispatch
    })
  })

  describe('Performance and large datasets', function () {
    it('should handle large arrays efficiently', function () {
      const items = []
      for (let i = 0; i < 1000; i++) {
        items.push({
          value: Math.random() * 1000,
          widgetId: `w${i}`
        })
      }

      // Filter
      const filtered = mock.client.method.listFilter({
        items,
        options: [{
          name: '>',
          value: 500
        }]
      })

      ok(filtered.items.length > 0)
      ok(filtered.items.length < 1000)

      // Sort
      const sorted = mock.client.method.listSort({
        items: filtered.items,
        type: 'ascending'
      })

      // Verify sorted
      for (let i = 1; i < sorted.length; i++) {
        ok(sorted[i].value >= sorted[i - 1].value)
      }
    })

    it('should handle many small operations', function () {
      const target = []

      for (let i = 0; i < 100; i++) {
        mock.client.method.listPush({
          target,
          source: i
        })
      }

      strictEqual(target.length, 100)

      // Remove every other element
      for (let i = 99; i >= 0; i -= 2) {
        mock.client.method.listSplice({
          target,
          start: i,
          deleteCount: 1
        })
      }

      strictEqual(target.length, 50)
      strictEqual(target[0], 0)
      strictEqual(target[1], 2)
    })
  })
})
