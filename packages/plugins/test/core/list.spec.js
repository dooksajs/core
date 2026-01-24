import { describe, it } from 'node:test'
import { strictEqual, deepStrictEqual, throws } from 'node:assert'
import { createPluginTester } from '@dooksa/test'
import { list, state, action } from '#core'
import { createAction } from '@dooksa/create-action'

/**
 * Helper function to set up the list plugin with dependencies
 * @param {import('node:test').TestContext} t - Test context
 * @param {Object} [options] - Configuration object
 * @param {Object} [options.actions] - Action methods to register
 * @param {Array} [options.state] - State data to seed
 * @returns {Object} Object with tester, list plugin instance, and state helpers
 */
function setupListPlugin (t, options = {
  actions: {},
  state: []
}) {
  const tester = createPluginTester(t)

  // Create observable instances of required plugins
  const statePlugin = tester.spy('state', state)
  const actionPlugin = tester.spy('action', action)
  const listPlugin = tester.spy('list', list)

  const defaultActions = {}

  for (let i = 0; i < actionPlugin.actions.length; i++) {
    const action = actionPlugin.actions[i]
    defaultActions[action.name] = action.method
  }

  for (let i = 0; i < statePlugin.actions.length; i++) {
    const action = statePlugin.actions[i]
    defaultActions[action.name] = action.method
  }

  // Setup action plugin with actions
  actionPlugin.setup({
    actions: {
      ...defaultActions,
      ...options.actions
    }
  })

  // Register action plugin's state schemas with state plugin
  // This is needed because stateSetValue requires schemas to exist
  const actionStateSchema = action.state?.schema
  if (actionStateSchema) {
    for (const schemaName in actionStateSchema) {
      const schemaPath = 'action/' + schemaName
      // Access the schema property on the state export object
      if (statePlugin.state && statePlugin.state.schema) {
        statePlugin.state.schema[schemaPath] = actionStateSchema[schemaName]
      }
    }
  }

  // Seed state if provided
  if (options.state) {
    options.state.forEach(({ collection, item }) => {
      if (Array.isArray(item)) {
        item.forEach((data, index) => {
          statePlugin.stateSetValue({
            name: collection,
            value: data,
            options: { id: Object.keys(data)[0] }
          })
        })
      } else {
        statePlugin.stateSetValue({
          name: collection,
          value: item
        })
      }
    })
  }

  return {
    tester,
    listPlugin,
    statePlugin,
    actionPlugin
  }
}

describe('List plugin - filter action', () => {
  describe('Basic filtering', () => {
    it('should filter items with single condition', async (t) => {
      const { tester, listPlugin } = setupListPlugin(t)

      const items = [
        {
          value: 5,
          widgetId: 'widget-1'
        },
        {
          value: 10,
          widgetId: 'widget-2'
        },
        {
          value: 15,
          widgetId: 'widget-3'
        }
      ]

      const result = listPlugin.listFilter({
        items,
        options: [
          {
            name: '>',
            value: 10
          }
        ]
      })

      strictEqual(result.items.length, 1)
      strictEqual(result.items[0].value, 15)
      strictEqual(result.items[0].widgetId, 'widget-3')
      strictEqual(result.usedWidgets['widget-3'], true)

      tester.restoreAll()
    })

    it('should filter items with multiple conditions (AND)', async (t) => {
      const { tester, listPlugin } = setupListPlugin(t)

      const items = [
        {
          value: 5,
          widgetId: 'widget-1'
        },
        {
          value: 10,
          widgetId: 'widget-2'
        },
        {
          value: 15,
          widgetId: 'widget-3'
        }
      ]

      const result = listPlugin.listFilter({
        items,
        options: [
          {
            name: '>',
            value: 5
          },
          {
            name: '<',
            value: 20
          }
        ]
      })

      strictEqual(result.items.length, 2)
      strictEqual(result.items[0].value, 10)
      strictEqual(result.items[1].value, 15)

      tester.restoreAll()
    })

    it('should return empty array when no items match', async (t) => {
      const { tester, listPlugin } = setupListPlugin(t)

      const items = [
        {
          value: 5,
          widgetId: 'widget-1'
        },
        {
          value: 10,
          widgetId: 'widget-2'
        }
      ]

      const result = listPlugin.listFilter({
        items,
        options: [
          {
            name: '>',
            value: 100
          }
        ]
      })

      strictEqual(result.items.length, 0)
      strictEqual(Object.keys(result.usedWidgets).length, 0)

      tester.restoreAll()
    })

    it('should return all items when condition matches all', async (t) => {
      const { tester, listPlugin } = setupListPlugin(t)

      const items = [
        {
          value: 5,
          widgetId: 'widget-1'
        },
        {
          value: 10,
          widgetId: 'widget-2'
        }
      ]

      const result = listPlugin.listFilter({
        items,
        options: [
          {
            name: '>',
            value: 0
          }
        ]
      })

      strictEqual(result.items.length, 2)

      tester.restoreAll()
    })
  })

  describe('String filtering', () => {
    it('should filter strings with equality', async (t) => {
      const { tester, listPlugin } = setupListPlugin(t)

      const items = [
        {
          value: 'apple',
          widgetId: 'widget-1'
        },
        {
          value: 'banana',
          widgetId: 'widget-2'
        },
        {
          value: 'cherry',
          widgetId: 'widget-3'
        }
      ]

      const result = listPlugin.listFilter({
        items,
        options: [
          {
            name: '==',
            value: 'banana'
          }
        ]
      })

      strictEqual(result.items.length, 1)
      strictEqual(result.items[0].value, 'banana')

      tester.restoreAll()
    })

    it('should filter strings with contains', async (t) => {
      const { tester, listPlugin } = setupListPlugin(t)

      const items = [
        {
          value: 'apple pie',
          widgetId: 'widget-1'
        },
        {
          value: 'banana split',
          widgetId: 'widget-2'
        },
        {
          value: 'cherry tart',
          widgetId: 'widget-3'
        }
      ]

      const result = listPlugin.listFilter({
        items,
        options: [
          {
            name: '~',
            value: 'banana'
          }
        ]
      })

      strictEqual(result.items.length, 1)
      strictEqual(result.items[0].value, 'banana split')

      tester.restoreAll()
    })

    it('should filter strings with regex pattern', async (t) => {
      const { tester, listPlugin } = setupListPlugin(t)

      const items = [
        {
          value: 'test123',
          widgetId: 'widget-1'
        },
        {
          value: 'test456',
          widgetId: 'widget-2'
        },
        {
          value: 'hello',
          widgetId: 'widget-3'
        }
      ]

      // Note: The ~ operator uses includes() which doesn't support regex
      // This test demonstrates that regex patterns are not supported by the ~ operator
      // For regex matching, you would need to use a different approach
      const result = listPlugin.listFilter({
        items,
        options: [
          {
            name: '~',
            value: 'test'
          }
        ]
      })

      strictEqual(result.items.length, 2)
      strictEqual(result.items[0].value, 'test123')
      strictEqual(result.items[1].value, 'test456')

      tester.restoreAll()
    })
  })

  describe('Complex conditions', () => {
    it('should filter with multiple AND conditions', async (t) => {
      const { tester, listPlugin } = setupListPlugin(t)

      const items = [
        {
          value: 5,
          widgetId: 'widget-1'
        },
        {
          value: 10,
          widgetId: 'widget-2'
        },
        {
          value: 15,
          widgetId: 'widget-3'
        }
      ]

      const result = listPlugin.listFilter({
        items,
        options: [
          {
            name: '>',
            value: 5
          },
          {
            name: '<',
            value: 20
          }
        ]
      })

      // Should match items > 5 AND < 20
      // 5 is not > 5, 10 is > 5 and < 20, 15 is > 5 and < 20
      strictEqual(result.items.length, 2)
      strictEqual(result.items[0].value, 10)
      strictEqual(result.items[1].value, 15)

      tester.restoreAll()
    })

    it('should handle empty options array', async (t) => {
      const { tester, listPlugin } = setupListPlugin(t)

      const items = [
        {
          value: 5,
          widgetId: 'widget-1'
        },
        {
          value: 10,
          widgetId: 'widget-2'
        }
      ]

      const result = listPlugin.listFilter({
        items,
        options: []
      })

      strictEqual(result.items.length, 0)

      tester.restoreAll()
    })
  })

  describe('Edge cases', () => {
    it('should handle empty items array', async (t) => {
      const { tester, listPlugin } = setupListPlugin(t)

      const result = listPlugin.listFilter({
        items: [],
        options: [{
          name: '>',
          value: 0
        }]
      })

      strictEqual(result.items.length, 0)
      strictEqual(Object.keys(result.usedWidgets).length, 0)

      tester.restoreAll()
    })

    it('should handle null values in items', async (t) => {
      const { tester, listPlugin } = setupListPlugin(t)

      const items = [
        {
          value: null,
          widgetId: 'widget-1'
        },
        {
          value: 10,
          widgetId: 'widget-2'
        }
      ]

      const result = listPlugin.listFilter({
        items,
        options: [
          {
            name: '==',
            value: null
          }
        ]
      })

      strictEqual(result.items.length, 1)
      strictEqual(result.items[0].value, null)

      tester.restoreAll()
    })

    it('should handle undefined values in items', async (t) => {
      const { tester, listPlugin } = setupListPlugin(t)

      const items = [
        {
          value: undefined,
          widgetId: 'widget-1'
        },
        {
          value: 10,
          widgetId: 'widget-2'
        }
      ]

      const result = listPlugin.listFilter({
        items,
        options: [
          {
            name: '==',
            value: undefined
          }
        ]
      })

      strictEqual(result.items.length, 1)
      strictEqual(result.items[0].value, undefined)

      tester.restoreAll()
    })

    it('should handle complex nested values', async (t) => {
      const { tester, listPlugin } = setupListPlugin(t)

      const items = [
        {
          value: { nested: { value: 5 } },
          widgetId: 'widget-1'
        },
        {
          value: { nested: { value: 10 } },
          widgetId: 'widget-2'
        }
      ]

      // Note: The == operator uses strict equality (===) which compares object references
      // For deep equality comparison, you would need to use a different approach
      // This test demonstrates that object reference comparison is used
      const result = listPlugin.listFilter({
        items,
        options: [
          {
            name: '==',
            value: items[1].value // Use the same object reference
          }
        ]
      })

      strictEqual(result.items.length, 1)
      deepStrictEqual(result.items[0].value, { nested: { value: 10 } })

      tester.restoreAll()
    })

    it('should track used widgets correctly', async (t) => {
      const { tester, listPlugin } = setupListPlugin(t)

      const items = [
        {
          value: 5,
          widgetId: 'widget-1'
        },
        {
          value: 10,
          widgetId: 'widget-2'
        },
        {
          value: 15,
          widgetId: 'widget-3'
        }
      ]

      const result = listPlugin.listFilter({
        items,
        options: [
          {
            name: '>',
            value: 5
          }
        ]
      })

      strictEqual(result.usedWidgets['widget-1'], undefined)
      strictEqual(result.usedWidgets['widget-2'], true)
      strictEqual(result.usedWidgets['widget-3'], true)

      tester.restoreAll()
    })
  })
})

describe('List plugin - map action', () => {
  describe('Array mapping', () => {
    it('should iterate over array and execute action for each item', async (t) => {
      const { tester, listPlugin, actionPlugin, statePlugin } = setupListPlugin(t)

      const items = [1, 2, 3]
      const results = []

      actionPlugin.setup({
        actions: {
          test_action: (params, context) => {
            results.push(params.value)
            context.$list.push(params.value)
            return params.value
          }
        }
      })

      // Seed state with action sequence
      statePlugin.stateSetValue({
        name: 'action/sequences',
        value: {
          test_action: ['test_action_block']
        }
      })

      // Seed state with action block
      statePlugin.stateSetValue({
        name: 'action/blocks',
        value: {
          test_action_block: {
            method: 'test_action'
          }
        }
      })

      const result = await listPlugin.listMap({
        context: {},
        items,
        actionId: 'test_action'
      })

      strictEqual(results.length, 3)
      strictEqual(results[0], 1)
      strictEqual(results[1], 2)
      strictEqual(results[2], 3)
      deepStrictEqual(result, [1, 2, 3])

      tester.restoreAll()
    })

    it('should pass correct parameters to action', async (t) => {
      const { tester, listPlugin, actionPlugin, statePlugin } = setupListPlugin(t)

      const items = ['a', 'b']
      const capturedParams = []

      actionPlugin.setup({
        actions: {
          test_action: (params, context) => {
            capturedParams.push(params)
            context.$list.push(params.value)
            return params.value
          }
        }
      })

      // Seed state with action sequence
      statePlugin.stateSetValue({
        name: 'action/sequences',
        value: {
          test_action: ['test_action_block']
        }
      })

      // Seed state with action block
      statePlugin.stateSetValue({
        name: 'action/blocks',
        value: {
          test_action_block: {
            method: 'test_action'
          }
        }
      })

      await listPlugin.listMap({
        context: {},
        items,
        actionId: 'test_action'
      })

      strictEqual(capturedParams.length, 2)
      strictEqual(capturedParams[0].key, 0)
      strictEqual(capturedParams[0].value, 'a')
      strictEqual(capturedParams[0].length, 2)
      strictEqual(capturedParams[1].key, 1)
      strictEqual(capturedParams[1].value, 'b')

      tester.restoreAll()
    })

    it('should handle empty array', async (t) => {
      const { tester, listPlugin, actionPlugin } = setupListPlugin(t)

      actionPlugin.setup({
        actions: {
          test_action: (params, context) => {
            context.$list.push(params.value)
            return params.value
          }
        }
      })

      const result = await listPlugin.listMap({
        context: {},
        items: [],
        actionId: 'test_action'
      })

      strictEqual(result.length, 0)

      tester.restoreAll()
    })

    it('should handle async actions', async (t) => {
      const { tester, listPlugin, actionPlugin, statePlugin } = setupListPlugin(t)

      const items = [1, 2, 3]

      actionPlugin.setup({
        actions: {
          async_action: async (params, context) => {
            return new Promise(resolve => {
              setTimeout(() => {
                context.$list.push(params.value)
                resolve(params.value * 2)
              }, 1)
            })
          }
        }
      })

      // Seed state with action sequence
      statePlugin.stateSetValue({
        name: 'action/sequences',
        value: {
          async_action: ['async_action_block']
        }
      })

      // Seed state with action block
      statePlugin.stateSetValue({
        name: 'action/blocks',
        value: {
          async_action_block: {
            method: 'async_action'
          }
        }
      })

      const result = await listPlugin.listMap({
        context: {},
        items,
        actionId: 'async_action'
      })

      strictEqual(result.length, 3)
      strictEqual(result[0], 2)
      strictEqual(result[1], 4)
      strictEqual(result[2], 6)

      tester.restoreAll()
    })

    it('should handle complex objects in array', async (t) => {
      const { tester, listPlugin, actionPlugin, statePlugin } = setupListPlugin(t)

      const items = [
        {
          id: 1,
          name: 'Item 1'
        },
        {
          id: 2,
          name: 'Item 2'
        }
      ]

      actionPlugin.setup({
        actions: {
          test_action: (params, context) => {
            context.$list.push(params.value.name)
            return params.value.name
          }
        }
      })

      // Seed state with action sequence
      statePlugin.stateSetValue({
        name: 'action/sequences',
        value: {
          test_action: ['test_action_block']
        }
      })

      // Seed state with action block
      statePlugin.stateSetValue({
        name: 'action/blocks',
        value: {
          test_action_block: {
            method: 'test_action'
          }
        }
      })

      const result = await listPlugin.listMap({
        context: {},
        items,
        actionId: 'test_action'
      })

      strictEqual(result.length, 2)
      strictEqual(result[0], 'Item 1')
      strictEqual(result[1], 'Item 2')

      tester.restoreAll()
    })
  })

  describe('Object mapping', () => {
    it('should iterate over object and execute action for each entry', async (t) => {
      const { tester, listPlugin, actionPlugin, statePlugin } = setupListPlugin(t)

      const items = {
        a: 1,
        b: 2,
        c: 3
      }
      const results = []

      actionPlugin.setup({
        actions: {
          test_action: (params, context) => {
            results.push({
              key: params.key,
              value: params.value
            })
            context.$list[params.key] = params.value * 2
            return params.value * 2
          }
        }
      })

      // Seed state with action sequence
      statePlugin.stateSetValue({
        name: 'action/sequences',
        value: {
          test_action: ['test_action_block']
        }
      })

      // Seed state with action block
      statePlugin.stateSetValue({
        name: 'action/blocks',
        value: {
          test_action_block: {
            method: 'test_action'
          }
        }
      })

      const result = await listPlugin.listMap({
        context: {},
        items,
        actionId: 'test_action'
      })

      strictEqual(results.length, 3)
      strictEqual(results[0].key, 'a')
      strictEqual(results[0].value, 1)
      strictEqual(results[1].key, 'b')
      strictEqual(results[1].value, 2)
      strictEqual(results[2].key, 'c')
      strictEqual(results[2].value, 3)
      deepStrictEqual(result, {
        a: 2,
        b: 4,
        c: 6
      })

      tester.restoreAll()
    })

    it('should pass correct parameters to object action', async (t) => {
      const { tester, listPlugin, actionPlugin, statePlugin } = setupListPlugin(t)

      const items = {
        x: 'X',
        y: 'Y'
      }
      const capturedParams = []

      actionPlugin.setup({
        actions: {
          test_action: (params, context) => {
            capturedParams.push(params)
            context.$list[params.key] = params.value
            return params.value
          }
        }
      })

      // Seed state with action sequence
      statePlugin.stateSetValue({
        name: 'action/sequences',
        value: {
          test_action: ['test_action_block']
        }
      })

      // Seed state with action block
      statePlugin.stateSetValue({
        name: 'action/blocks',
        value: {
          test_action_block: {
            method: 'test_action'
          }
        }
      })

      await listPlugin.listMap({
        context: {},
        items,
        actionId: 'test_action'
      })

      strictEqual(capturedParams.length, 2)
      strictEqual(capturedParams[0].key, 'x')
      strictEqual(capturedParams[0].value, 'X')
      strictEqual(capturedParams[0].length, 2)
      strictEqual(capturedParams[1].key, 'y')
      strictEqual(capturedParams[1].value, 'Y')

      tester.restoreAll()
    })

    it('should handle empty object', async (t) => {
      const { tester, listPlugin, actionPlugin } = setupListPlugin(t)

      actionPlugin.setup({
        actions: {
          test_action: (params, context) => {
            context.$list[params.key] = params.value
            return params.value
          }
        }
      })

      const result = await listPlugin.listMap({
        context: {},
        items: {},
        actionId: 'test_action'
      })

      deepStrictEqual(result, {})

      tester.restoreAll()
    })

    it('should handle nested object values', async (t) => {
      const { tester, listPlugin, actionPlugin, statePlugin } = setupListPlugin(t)

      const items = {
        user1: {
          name: 'John',
          age: 30
        },
        user2: {
          name: 'Jane',
          age: 25
        }
      }

      actionPlugin.setup({
        actions: {
          test_action: (params, context) => {
            context.$list[params.key] = params.value.name
            return params.value.name
          }
        }
      })

      // Seed state with action sequence
      statePlugin.stateSetValue({
        name: 'action/sequences',
        value: {
          test_action: ['test_action_block']
        }
      })

      // Seed state with action block
      statePlugin.stateSetValue({
        name: 'action/blocks',
        value: {
          test_action_block: {
            method: 'test_action'
          }
        }
      })

      const result = await listPlugin.listMap({
        context: {},
        items,
        actionId: 'test_action'
      })

      deepStrictEqual(result, {
        user1: 'John',
        user2: 'Jane'
      })

      tester.restoreAll()
    })
  })

  describe('Edge cases', () => {
    it('should handle action that throws error', async (t) => {
      const { tester, listPlugin, actionPlugin, statePlugin } = setupListPlugin(t)

      const items = [1, 2, 3]

      actionPlugin.setup({
        actions: {
          error_action: (params, context) => {
            if (params.value === 2) {
              throw new Error('Test error')
            }
            context.$list.push(params.value)
            return params.value
          }
        }
      })

      // Seed state with action sequence
      statePlugin.stateSetValue({
        name: 'action/sequences',
        value: {
          error_action: ['error_action_block']
        }
      })

      // Seed state with action block
      statePlugin.stateSetValue({
        name: 'action/blocks',
        value: {
          error_action_block: {
            method: 'error_action'
          }
        }
      })

      try {
        await listPlugin.listMap({
          context: {},
          items,
          actionId: 'error_action'
        })
        // Should not reach here
        strictEqual(true, false)
      } catch (error) {
        strictEqual(error.message, 'Test error')
      }

      tester.restoreAll()
    })

    it('should preserve context between iterations', async (t) => {
      const { tester, listPlugin, actionPlugin, statePlugin } = setupListPlugin(t)

      const items = [1, 2, 3]

      actionPlugin.setup({
        actions: {
          test_action: (params, context) => {
            if (!context.counter) {
              context.counter = 0
            }
            context.counter += params.value
            context.$list.push(context.counter)
            return context.counter
          }
        }
      })

      // Seed state with action sequence
      statePlugin.stateSetValue({
        name: 'action/sequences',
        value: {
          test_action: ['test_action_block']
        }
      })

      // Seed state with action block
      statePlugin.stateSetValue({
        name: 'action/blocks',
        value: {
          test_action_block: {
            method: 'test_action'
          }
        }
      })

      const result = await listPlugin.listMap({
        context: {},
        items,
        actionId: 'test_action'
      })

      strictEqual(result[0], 1)
      strictEqual(result[1], 3)
      strictEqual(result[2], 6)

      tester.restoreAll()
    })

    it('should handle action that returns undefined', async (t) => {
      const { tester, listPlugin, actionPlugin, statePlugin } = setupListPlugin(t)

      const items = [1, 2, 3]

      actionPlugin.setup({
        actions: {
          test_action: (params, context) => {
            context.$list.push(params.value)
            // Return undefined
          }
        }
      })

      // Seed state with action sequence
      statePlugin.stateSetValue({
        name: 'action/sequences',
        value: {
          test_action: ['test_action_block']
        }
      })

      // Seed state with action block
      statePlugin.stateSetValue({
        name: 'action/blocks',
        value: {
          test_action_block: {
            method: 'test_action'
          }
        }
      })

      const result = await listPlugin.listMap({
        context: {},
        items,
        actionId: 'test_action'
      })

      strictEqual(result.length, 3)
      strictEqual(result[0], undefined)
      strictEqual(result[1], undefined)
      strictEqual(result[2], undefined)

      tester.restoreAll()
    })
  })
})

describe('List plugin - indexOf action', () => {
  describe('Basic index retrieval', () => {
    it('should return first index of matching value', async (t) => {
      const { tester, listPlugin } = setupListPlugin(t)

      const items = ['a', 'b', 'c', 'b', 'd']

      const result = listPlugin.listIndexOf({
        items,
        value: 'b'
      })

      strictEqual(result, 1)

      tester.restoreAll()
    })

    it('should return -1 when value not found', async (t) => {
      const { tester, listPlugin } = setupListPlugin(t)

      const items = ['a', 'b', 'c']

      const result = listPlugin.listIndexOf({
        items,
        value: 'z'
      })

      strictEqual(result, -1)

      tester.restoreAll()
    })

    it('should return 0 for first element', async (t) => {
      const { tester, listPlugin } = setupListPlugin(t)

      const items = ['a', 'b', 'c']

      const result = listPlugin.listIndexOf({
        items,
        value: 'a'
      })

      strictEqual(result, 0)

      tester.restoreAll()
    })

    it('should return last index for last element', async (t) => {
      const { tester, listPlugin } = setupListPlugin(t)

      const items = ['a', 'b', 'c']

      const result = listPlugin.listIndexOf({
        items,
        value: 'c'
      })

      strictEqual(result, 2)

      tester.restoreAll()
    })
  })

  describe('Number comparison', () => {
    it('should find number in array', async (t) => {
      const { tester, listPlugin } = setupListPlugin(t)

      const items = [1, 2, 3, 4, 5]

      const result = listPlugin.listIndexOf({
        items,
        value: 3
      })

      strictEqual(result, 2)

      tester.restoreAll()
    })

    it('should handle floating point numbers', async (t) => {
      const { tester, listPlugin } = setupListPlugin(t)

      const items = [1.5, 2.5, 3.5]

      const result = listPlugin.listIndexOf({
        items,
        value: 2.5
      })

      strictEqual(result, 1)

      tester.restoreAll()
    })

    it('should handle zero', async (t) => {
      const { tester, listPlugin } = setupListPlugin(t)

      const items = [0, 1, 2]

      const result = listPlugin.listIndexOf({
        items,
        value: 0
      })

      strictEqual(result, 0)

      tester.restoreAll()
    })
  })

  describe('Complex value comparison', () => {
    it('should find object in array', async (t) => {
      const { tester, listPlugin } = setupListPlugin(t)

      const targetObj = {
        id: 2,
        name: 'B'
      }
      const items = [
        {
          id: 1,
          name: 'A'
        },
        targetObj,
        {
          id: 3,
          name: 'C'
        }
      ]

      const result = listPlugin.listIndexOf({
        items,
        value: targetObj
      })

      strictEqual(result, 1)

      tester.restoreAll()
    })

    it('should find array in array', async (t) => {
      const { tester, listPlugin } = setupListPlugin(t)

      const targetArr = [1, 2, 3]
      const items = [
        ['a', 'b'],
        targetArr,
        ['x', 'y']
      ]

      const result = listPlugin.listIndexOf({
        items,
        value: targetArr
      })

      strictEqual(result, 1)

      tester.restoreAll()
    })

    it('should handle null values', async (t) => {
      const { tester, listPlugin } = setupListPlugin(t)

      const items = [null, 'a', 'b']

      const result = listPlugin.listIndexOf({
        items,
        value: null
      })

      strictEqual(result, 0)

      tester.restoreAll()
    })

    it('should handle undefined values', async (t) => {
      const { tester, listPlugin } = setupListPlugin(t)

      const items = [undefined, 'a', 'b']

      const result = listPlugin.listIndexOf({
        items,
        value: undefined
      })

      strictEqual(result, 0)

      tester.restoreAll()
    })
  })

  describe('Edge cases', () => {
    it('should handle empty array', async (t) => {
      const { tester, listPlugin } = setupListPlugin(t)

      const result = listPlugin.listIndexOf({
        items: [],
        value: 'anything'
      })

      strictEqual(result, -1)

      tester.restoreAll()
    })

    it('should handle single element array with match', async (t) => {
      const { tester, listPlugin } = setupListPlugin(t)

      const result = listPlugin.listIndexOf({
        items: ['only'],
        value: 'only'
      })

      strictEqual(result, 0)

      tester.restoreAll()
    })

    it('should handle single element array without match', async (t) => {
      const { tester, listPlugin } = setupListPlugin(t)

      const result = listPlugin.listIndexOf({
        items: ['only'],
        value: 'not-found'
      })

      strictEqual(result, -1)

      tester.restoreAll()
    })

    it('should handle duplicate values correctly', async (t) => {
      const { tester, listPlugin } = setupListPlugin(t)

      const items = ['a', 'a', 'a', 'b', 'a']

      const result = listPlugin.listIndexOf({
        items,
        value: 'a'
      })

      strictEqual(result, 0)

      tester.restoreAll()
    })
  })
})

describe('List plugin - push action', () => {
  describe('Basic push operations', () => {
    it('should push value to end of array', async (t) => {
      const { tester, listPlugin } = setupListPlugin(t)

      const target = [1, 2, 3]

      const result = listPlugin.listPush({
        target,
        source: 4
      })

      strictEqual(result, 4)
      deepStrictEqual(target, [1, 2, 3, 4])

      tester.restoreAll()
    })

    it('should push string to array', async (t) => {
      const { tester, listPlugin } = setupListPlugin(t)

      const target = ['a', 'b']

      const result = listPlugin.listPush({
        target,
        source: 'c'
      })

      strictEqual(result, 3)
      deepStrictEqual(target, ['a', 'b', 'c'])

      tester.restoreAll()
    })

    it('should push object to array', async (t) => {
      const { tester, listPlugin } = setupListPlugin(t)

      const target = [{ id: 1 }, { id: 2 }]
      const newObj = { id: 3 }

      const result = listPlugin.listPush({
        target,
        source: newObj
      })

      strictEqual(result, 3)
      deepStrictEqual(target, [{ id: 1 }, { id: 2 }, { id: 3 }])

      tester.restoreAll()
    })

    it('should push to empty array', async (t) => {
      const { tester, listPlugin } = setupListPlugin(t)

      const target = []

      const result = listPlugin.listPush({
        target,
        source: 'first'
      })

      strictEqual(result, 1)
      deepStrictEqual(target, ['first'])

      tester.restoreAll()
    })
  })

  describe('Multiple pushes', () => {
    it('should push multiple values in sequence', async (t) => {
      const { tester, listPlugin } = setupListPlugin(t)

      const target = []

      listPlugin.listPush({
        target,
        source: 1
      })
      listPlugin.listPush({
        target,
        source: 2
      })
      listPlugin.listPush({
        target,
        source: 3
      })

      deepStrictEqual(target, [1, 2, 3])

      tester.restoreAll()
    })

    it('should push different types', async (t) => {
      const { tester, listPlugin } = setupListPlugin(t)

      const target = []

      listPlugin.listPush({
        target,
        source: 'string'
      })
      listPlugin.listPush({
        target,
        source: 123
      })
      listPlugin.listPush({
        target,
        source: true
      })
      listPlugin.listPush({
        target,
        source: null
      })
      listPlugin.listPush({
        target,
        source: undefined
      })
      listPlugin.listPush({
        target,
        source: { key: 'value' }
      })

      strictEqual(target.length, 6)
      strictEqual(target[0], 'string')
      strictEqual(target[1], 123)
      strictEqual(target[2], true)
      strictEqual(target[3], null)
      strictEqual(target[4], undefined)
      deepStrictEqual(target[5], { key: 'value' })

      tester.restoreAll()
    })
  })

  describe('Edge cases', () => {
    it('should return new length', async (t) => {
      const { tester, listPlugin } = setupListPlugin(t)

      const target = [1, 2, 3]

      const result = listPlugin.listPush({
        target,
        source: 4
      })

      strictEqual(result, 4)

      tester.restoreAll()
    })

    it('should modify original array', async (t) => {
      const { tester, listPlugin } = setupListPlugin(t)

      const target = [1, 2, 3]
      const original = target

      listPlugin.listPush({
        target,
        source: 4
      })

      strictEqual(target, original)
      strictEqual(target.length, 4)

      tester.restoreAll()
    })

    it('should handle pushing array as single element', async (t) => {
      const { tester, listPlugin } = setupListPlugin(t)

      const target = [1, 2]
      const arraySource = [3, 4]

      const result = listPlugin.listPush({
        target,
        source: arraySource
      })

      strictEqual(result, 3)
      deepStrictEqual(target, [1, 2, [3, 4]])

      tester.restoreAll()
    })
  })
})

describe('List plugin - sort action', () => {
  describe('Ascending sort', () => {
    it('should sort numbers in ascending order', async (t) => {
      const { tester, listPlugin } = setupListPlugin(t)

      const items = [
        {
          value: 5,
          widgetId: 'w1'
        },
        {
          value: 1,
          widgetId: 'w2'
        },
        {
          value: 10,
          widgetId: 'w3'
        },
        {
          value: 3,
          widgetId: 'w4'
        }
      ]

      const result = listPlugin.listSort({
        items,
        type: 'ascending'
      })

      strictEqual(result[0].value, 1)
      strictEqual(result[1].value, 3)
      strictEqual(result[2].value, 5)
      strictEqual(result[3].value, 10)

      tester.restoreAll()
    })

    it('should sort strings in ascending order (case-insensitive)', async (t) => {
      const { tester, listPlugin } = setupListPlugin(t)

      const items = [
        {
          value: 'banana',
          widgetId: 'w1'
        },
        {
          value: 'Apple',
          widgetId: 'w2'
        },
        {
          value: 'cherry',
          widgetId: 'w3'
        }
      ]

      const result = listPlugin.listSort({
        items,
        type: 'ascending'
      })

      strictEqual(result[0].value, 'Apple')
      strictEqual(result[1].value, 'banana')
      strictEqual(result[2].value, 'cherry')

      tester.restoreAll()
    })

    it('should handle already sorted array', async (t) => {
      const { tester, listPlugin } = setupListPlugin(t)

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
        }
      ]

      const result = listPlugin.listSort({
        items,
        type: 'ascending'
      })

      strictEqual(result[0].value, 1)
      strictEqual(result[1].value, 2)
      strictEqual(result[2].value, 3)

      tester.restoreAll()
    })

    it('should handle reverse sorted array', async (t) => {
      const { tester, listPlugin } = setupListPlugin(t)

      const items = [
        {
          value: 3,
          widgetId: 'w1'
        },
        {
          value: 2,
          widgetId: 'w2'
        },
        {
          value: 1,
          widgetId: 'w3'
        }
      ]

      const result = listPlugin.listSort({
        items,
        type: 'ascending'
      })

      strictEqual(result[0].value, 1)
      strictEqual(result[1].value, 2)
      strictEqual(result[2].value, 3)

      tester.restoreAll()
    })
  })

  describe('Descending sort', () => {
    it('should sort numbers in descending order', async (t) => {
      const { tester, listPlugin } = setupListPlugin(t)

      const items = [
        {
          value: 5,
          widgetId: 'w1'
        },
        {
          value: 1,
          widgetId: 'w2'
        },
        {
          value: 10,
          widgetId: 'w3'
        },
        {
          value: 3,
          widgetId: 'w4'
        }
      ]

      const result = listPlugin.listSort({
        items,
        type: 'descending'
      })

      strictEqual(result[0].value, 10)
      strictEqual(result[1].value, 5)
      strictEqual(result[2].value, 3)
      strictEqual(result[3].value, 1)

      tester.restoreAll()
    })

    it('should sort strings in descending order (case-insensitive)', async (t) => {
      const { tester, listPlugin } = setupListPlugin(t)

      const items = [
        {
          value: 'banana',
          widgetId: 'w1'
        },
        {
          value: 'Apple',
          widgetId: 'w2'
        },
        {
          value: 'cherry',
          widgetId: 'w3'
        }
      ]

      const result = listPlugin.listSort({
        items,
        type: 'descending'
      })

      strictEqual(result[0].value, 'cherry')
      strictEqual(result[1].value, 'banana')
      strictEqual(result[2].value, 'Apple')

      tester.restoreAll()
    })

    it('should handle already sorted array in descending', async (t) => {
      const { tester, listPlugin } = setupListPlugin(t)

      const items = [
        {
          value: 3,
          widgetId: 'w1'
        },
        {
          value: 2,
          widgetId: 'w2'
        },
        {
          value: 1,
          widgetId: 'w3'
        }
      ]

      const result = listPlugin.listSort({
        items,
        type: 'descending'
      })

      strictEqual(result[0].value, 3)
      strictEqual(result[1].value, 2)
      strictEqual(result[2].value, 1)

      tester.restoreAll()
    })
  })

  describe('Edge cases', () => {
    it('should handle empty array', async (t) => {
      const { tester, listPlugin } = setupListPlugin(t)

      const result = listPlugin.listSort({
        items: [],
        type: 'ascending'
      })

      strictEqual(result.length, 0)

      tester.restoreAll()
    })

    it('should handle single element array', async (t) => {
      const { tester, listPlugin } = setupListPlugin(t)

      const items = [{
        value: 5,
        widgetId: 'w1'
      }]

      const result = listPlugin.listSort({
        items,
        type: 'ascending'
      })

      strictEqual(result.length, 1)
      strictEqual(result[0].value, 5)

      tester.restoreAll()
    })

    it('should handle equal values', async (t) => {
      const { tester, listPlugin } = setupListPlugin(t)

      const items = [
        {
          value: 5,
          widgetId: 'w1'
        },
        {
          value: 5,
          widgetId: 'w2'
        },
        {
          value: 5,
          widgetId: 'w3'
        }
      ]

      const result = listPlugin.listSort({
        items,
        type: 'ascending'
      })

      strictEqual(result.length, 3)
      strictEqual(result[0].value, 5)
      strictEqual(result[1].value, 5)
      strictEqual(result[2].value, 5)

      tester.restoreAll()
    })

    it('should throw error for invalid sort type', async (t) => {
      const { tester, listPlugin } = setupListPlugin(t)

      const items = [
        {
          value: 1,
          widgetId: 'w1'
        },
        {
          value: 2,
          widgetId: 'w2'
        }
      ]

      throws(() => {
        listPlugin.listSort({
          items,
          type: 'invalid'
        })
      }, {
        message: /Sort method does not exist: invalid/
      })

      tester.restoreAll()
    })

    it('should preserve widgetId after sort', async (t) => {
      const { tester, listPlugin } = setupListPlugin(t)

      const items = [
        {
          value: 3,
          widgetId: 'w3'
        },
        {
          value: 1,
          widgetId: 'w1'
        },
        {
          value: 2,
          widgetId: 'w2'
        }
      ]

      const result = listPlugin.listSort({
        items,
        type: 'ascending'
      })

      strictEqual(result[0].widgetId, 'w1')
      strictEqual(result[1].widgetId, 'w2')
      strictEqual(result[2].widgetId, 'w3')

      tester.restoreAll()
    })

    it('should handle mixed number and string values', async (t) => {
      const { tester, listPlugin } = setupListPlugin(t)

      const items = [
        {
          value: 5,
          widgetId: 'w1'
        },
        {
          value: '10',
          widgetId: 'w2'
        },
        {
          value: 3,
          widgetId: 'w3'
        }
      ]

      const result = listPlugin.listSort({
        items,
        type: 'ascending'
      })

      // Numbers are sorted before strings
      strictEqual(result[0].value, 3)
      strictEqual(result[1].value, 5)
      strictEqual(result[2].value, '10')

      tester.restoreAll()
    })
  })
})

describe('List plugin - splice action', () => {
  describe('Remove elements', () => {
    it('should remove elements from start', async (t) => {
      const { tester, listPlugin } = setupListPlugin(t)

      const target = [1, 2, 3, 4, 5]

      const result = listPlugin.listSplice({
        target,
        start: 0,
        deleteCount: 2
      })

      deepStrictEqual(result, [1, 2])
      deepStrictEqual(target, [3, 4, 5])

      tester.restoreAll()
    })

    it('should remove elements from middle', async (t) => {
      const { tester, listPlugin } = setupListPlugin(t)

      const target = [1, 2, 3, 4, 5]

      const result = listPlugin.listSplice({
        target,
        start: 1,
        deleteCount: 2
      })

      deepStrictEqual(result, [2, 3])
      deepStrictEqual(target, [1, 4, 5])

      tester.restoreAll()
    })

    it('should remove elements from end', async (t) => {
      const { tester, listPlugin } = setupListPlugin(t)

      const target = [1, 2, 3, 4, 5]

      const result = listPlugin.listSplice({
        target,
        start: 3,
        deleteCount: 2
      })

      deepStrictEqual(result, [4, 5])
      deepStrictEqual(target, [1, 2, 3])

      tester.restoreAll()
    })

    it('should remove single element', async (t) => {
      const { tester, listPlugin } = setupListPlugin(t)

      const target = [1, 2, 3]

      const result = listPlugin.listSplice({
        target,
        start: 1,
        deleteCount: 1
      })

      deepStrictEqual(result, [2])
      deepStrictEqual(target, [1, 3])

      tester.restoreAll()
    })

    it('should remove all elements when deleteCount is large', async (t) => {
      const { tester, listPlugin } = setupListPlugin(t)

      const target = [1, 2, 3]

      const result = listPlugin.listSplice({
        target,
        start: 0,
        deleteCount: 10
      })

      deepStrictEqual(result, [1, 2, 3])
      deepStrictEqual(target, [])

      tester.restoreAll()
    })

    it('should remove to end when deleteCount not specified', async (t) => {
      const { tester, listPlugin } = setupListPlugin(t)

      const target = [1, 2, 3, 4, 5]

      const result = listPlugin.listSplice({
        target,
        start: 2
      })

      deepStrictEqual(result, [3, 4, 5])
      deepStrictEqual(target, [1, 2])

      tester.restoreAll()
    })
  })

  describe('Insert elements', () => {
    it('should insert single element at start', async (t) => {
      const { tester, listPlugin } = setupListPlugin(t)

      const target = [2, 3, 4]

      const result = listPlugin.listSplice({
        target,
        start: 0,
        deleteCount: 0,
        source: 1
      })

      deepStrictEqual(result, [])
      deepStrictEqual(target, [1, 2, 3, 4])

      tester.restoreAll()
    })

    it('should insert single element at middle', async (t) => {
      const { tester, listPlugin } = setupListPlugin(t)

      const target = [1, 2, 4]

      const result = listPlugin.listSplice({
        target,
        start: 2,
        deleteCount: 0,
        source: 3
      })

      deepStrictEqual(result, [])
      deepStrictEqual(target, [1, 2, 3, 4])

      tester.restoreAll()
    })

    it('should insert single element at end', async (t) => {
      const { tester, listPlugin } = setupListPlugin(t)

      const target = [1, 2, 3]

      const result = listPlugin.listSplice({
        target,
        start: 3,
        deleteCount: 0,
        source: 4
      })

      deepStrictEqual(result, [])
      deepStrictEqual(target, [1, 2, 3, 4])

      tester.restoreAll()
    })

    it('should insert multiple elements from array', async (t) => {
      const { tester, listPlugin } = setupListPlugin(t)

      const target = [1, 4, 5]

      const result = listPlugin.listSplice({
        target,
        start: 1,
        deleteCount: 0,
        source: [2, 3]
      })

      deepStrictEqual(result, [])
      deepStrictEqual(target, [1, 2, 3, 4, 5])

      tester.restoreAll()
    })

    it('should insert object', async (t) => {
      const { tester, listPlugin } = setupListPlugin(t)

      const target = [1, 3]
      const obj = {
        id: 2,
        name: 'B'
      }

      const result = listPlugin.listSplice({
        target,
        start: 1,
        deleteCount: 0,
        source: obj
      })

      deepStrictEqual(result, [])
      deepStrictEqual(target, [1, obj, 3])

      tester.restoreAll()
    })
  })

  describe('Replace elements', () => {
    it('should replace single element', async (t) => {
      const { tester, listPlugin } = setupListPlugin(t)

      const target = [1, 2, 3]

      const result = listPlugin.listSplice({
        target,
        start: 1,
        deleteCount: 1,
        source: 99
      })

      deepStrictEqual(result, [2])
      deepStrictEqual(target, [1, 99, 3])

      tester.restoreAll()
    })

    it('should replace multiple elements with single element', async (t) => {
      const { tester, listPlugin } = setupListPlugin(t)

      const target = [1, 2, 3, 4]

      const result = listPlugin.listSplice({
        target,
        start: 1,
        deleteCount: 2,
        source: 99
      })

      deepStrictEqual(result, [2, 3])
      deepStrictEqual(target, [1, 99, 4])

      tester.restoreAll()
    })

    it('should replace multiple elements with multiple elements', async (t) => {
      const { tester, listPlugin } = setupListPlugin(t)

      const target = [1, 2, 3, 4]

      const result = listPlugin.listSplice({
        target,
        start: 1,
        deleteCount: 2,
        source: [99, 100]
      })

      deepStrictEqual(result, [2, 3])
      deepStrictEqual(target, [1, 99, 100, 4])

      tester.restoreAll()
    })
  })

  describe('Edge cases', () => {
    it('should handle empty target array', async (t) => {
      const { tester, listPlugin } = setupListPlugin(t)

      const target = []

      const result = listPlugin.listSplice({
        target,
        start: 0,
        deleteCount: 1
      })

      deepStrictEqual(result, [])
      deepStrictEqual(target, [undefined])

      tester.restoreAll()
    })

    it('should handle start index beyond array length', async (t) => {
      const { tester, listPlugin } = setupListPlugin(t)

      const target = [1, 2, 3]

      const result = listPlugin.listSplice({
        target,
        start: 10,
        deleteCount: 1,
        source: 4
      })

      deepStrictEqual(result, [])
      deepStrictEqual(target, [1, 2, 3, 4])

      tester.restoreAll()
    })

    it('should handle negative start index', async (t) => {
      const { tester, listPlugin } = setupListPlugin(t)

      const target = [1, 2, 3, 4, 5]

      // Negative index counts from end
      const result = listPlugin.listSplice({
        target,
        start: -2,
        deleteCount: 1
      })

      deepStrictEqual(result, [4])
      deepStrictEqual(target, [1, 2, 3, undefined, 5])

      tester.restoreAll()
    })

    it('should handle deleteCount of 0', async (t) => {
      const { tester, listPlugin } = setupListPlugin(t)

      const target = [1, 2, 3]

      const result = listPlugin.listSplice({
        target,
        start: 1,
        deleteCount: 0
      })

      deepStrictEqual(result, [])
      deepStrictEqual(target, [1, undefined, 2, 3])

      tester.restoreAll()
    })

    it('should handle null source (inserts null)', async (t) => {
      const { tester, listPlugin } = setupListPlugin(t)

      const target = [1, 2, 3]

      const result = listPlugin.listSplice({
        target,
        start: 1,
        deleteCount: 1,
        source: null
      })

      deepStrictEqual(result, [2])
      deepStrictEqual(target, [1, null, 3])

      tester.restoreAll()
    })

    it('should handle undefined source (inserts undefined)', async (t) => {
      const { tester, listPlugin } = setupListPlugin(t)

      const target = [1, 2, 3]

      const result = listPlugin.listSplice({
        target,
        start: 1,
        deleteCount: 1,
        source: undefined
      })

      deepStrictEqual(result, [2])
      deepStrictEqual(target, [1, undefined, 3])

      tester.restoreAll()
    })

    it('should throw error when start is null', async (t) => {
      const { tester, listPlugin } = setupListPlugin(t)

      const target = [1, 2, 3]

      throws(() => {
        listPlugin.listSplice({
          target,
          start: null,
          deleteCount: 1
        })
      }, {
        message: /Splice with source expects a start position but found null/
      })

      tester.restoreAll()
    })

    it('should throw error when start is undefined with source', async (t) => {
      const { tester, listPlugin } = setupListPlugin(t)

      const target = [1, 2, 3]

      throws(() => {
        listPlugin.listSplice({
          target,
          start: undefined,
          deleteCount: 1,
          source: 99
        })
      }, {
        message: /Splice with source expects a start position but found undefined/
      })

      tester.restoreAll()
    })

    it('should handle splice without source (remove only)', async (t) => {
      const { tester, listPlugin } = setupListPlugin(t)

      const target = [1, 2, 3, 4, 5]

      const result = listPlugin.listSplice({
        target,
        start: 1,
        deleteCount: 2
      })

      deepStrictEqual(result, [2, 3])
      deepStrictEqual(target, [1, 4, 5])

      tester.restoreAll()
    })

    it('should handle splice without start (clear array)', async (t) => {
      const { tester, listPlugin } = setupListPlugin(t)

      const target = [1, 2, 3, 4, 5]

      const result = listPlugin.listSplice({
        target
      })

      deepStrictEqual(result, [1, 2, 3, 4, 5])
      deepStrictEqual(target, [])

      tester.restoreAll()
    })

    it('should modify original array', async (t) => {
      const { tester, listPlugin } = setupListPlugin(t)

      const target = [1, 2, 3]
      const original = target

      listPlugin.listSplice({
        target,
        start: 1,
        deleteCount: 1
      })

      strictEqual(target, original)
      deepStrictEqual(target, [1, 3])

      tester.restoreAll()
    })
  })
})
