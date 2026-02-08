import { describe, it, afterEach, beforeEach, mock } from 'node:test'
import { strictEqual, deepStrictEqual, rejects, throws } from 'node:assert'
import { list, action, state } from '#core'
import { createState, hydrateActionState } from '../helpers/index.js'
import { createAction } from '@dooksa/create-action'

describe('List plugin', () => {
  let testServer

  beforeEach(() => {
    state.restore()
    action.restore()
  })

  afterEach(async () => {
    state.restore()
    action.restore()
    if (testServer) {
      await testServer.stop()
      testServer = null
    }
  })

  describe('filter', () => {
    it('should filter items based on single condition', async (t) => {
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

      const options = [
        {
          name: '>',
          value: 15
        }
      ]

      const result = list.listFilter({
        items,
        options
      })

      strictEqual(result.items.length, 2)
      strictEqual(result.items[0].value, 20)
      strictEqual(result.items[1].value, 30)
      strictEqual(result.usedWidgets['w2'], true)
      strictEqual(result.usedWidgets['w3'], true)
      strictEqual(result.usedWidgets['w1'], undefined)
    })

    it('should return empty result if no items match', async (t) => {
      const items = [
        {
          value: 10,
          widgetId: 'w1'
        }
      ]
      const options = [
        {
          name: '>',
          value: 20
        }
      ]

      const result = list.listFilter({
        items,
        options
      })
      strictEqual(result.items.length, 0)
    })

    it('should filter based on multiple conditions (AND logic)', async (t) => {
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

      // value > 15 AND value < 35
      const options = [
        {
          name: '>',
          value: 15
        },
        {
          name: '<',
          value: 35
        }
      ]

      const result = list.listFilter({
        items,
        options
      })

      strictEqual(result.items.length, 2)
      strictEqual(result.items[0].value, 20)
      strictEqual(result.items[1].value, 30)
    })

    it('should handle equality check', async (t) => {
      const items = [
        {
          value: 'active',
          widgetId: 'w1'
        },
        {
          value: 'inactive',
          widgetId: 'w2'
        }
      ]

      const options = [
        {
          name: '==',
          value: 'active'
        }
      ]

      const result = list.listFilter({
        items,
        options
      })

      strictEqual(result.items.length, 1)
      strictEqual(result.items[0].value, 'active')
    })

    it('should handle inequality check', async (t) => {
      const items = [
        {
          value: 'active',
          widgetId: 'w1'
        },
        {
          value: 'inactive',
          widgetId: 'w2'
        }
      ]

      const options = [
        {
          name: '!=',
          value: 'active'
        }
      ]

      const result = list.listFilter({
        items,
        options
      })

      strictEqual(result.items.length, 1)
      strictEqual(result.items[0].value, 'inactive')
    })

    it('should return empty result if options empty', async (t) => {
      const items = [
        {
          value: 10,
          widgetId: 'w1'
        }
      ]
      const options = []

      const result = list.listFilter({
        items,
        options
      })
      strictEqual(result.items.length, 0)
    })
  })

  describe('map', () => {
    it('should map array items using an action', async (t) => {
      state.setup(createState([action]))

      const actionData = createAction('transform', [
        {
          test_transform: {}
        }
      ], { test_transform: true })

      hydrateActionState(actionData)

      const mockAction = mock.fn((params, context) => {
        const { key, value } = context.payload
        context.context.$list[key] = value * 2
      })

      action.setup({
        actions: {
          test_transform: mockAction
        }
      })

      const items = [1, 2, 3]
      const context = {}

      await list.listMap({
        context,
        items,
        actionId: 'transform'
      })

      strictEqual(mockAction.mock.callCount(), 3)
      deepStrictEqual(context.$list, [2, 4, 6])
    })

    it('should map object items using an action', async (t) => {
      state.setup(createState([action]))

      const actionData = createAction('transformObject', [
        {
          test_transformObject: {}
        }
      ], { test_transformObject: true })

      hydrateActionState(actionData)

      const mockAction = mock.fn((params, context) => {
        const { key, value } = context.payload
        context.context.$list[key] = value.toUpperCase()
      })

      action.setup({
        actions: {
          test_transformObject: mockAction
        }
      })

      const items = {
        a: 'hello',
        b: 'world'
      }
      const context = {}

      await list.listMap({
        context,
        items,
        actionId: 'transformObject'
      })

      strictEqual(mockAction.mock.callCount(), 2)
      deepStrictEqual(context.$list, {
        a: 'HELLO',
        b: 'WORLD'
      })
    })

    it('should propagate error from action', async (t) => {
      state.setup(createState([action]))

      const actionData = createAction('failAction', [
        {
          test_fail: {}
        }
      ], { test_fail: true })

      hydrateActionState(actionData)

      const mockAction = mock.fn((params, context) => {
        throw new Error('Action failed')
      })

      action.setup({
        actions: {
          test_fail: mockAction
        }
      })

      const items = [1]
      const context = {}

      await rejects(
        list.listMap({
          context,
          items,
          actionId: 'failAction'
        }),
        {
          message: /Action failed/
        }
      )
    })
  })

  describe('indexOf', () => {
    it('should return index of existing value', (t) => {
      const items = ['a', 'b', 'c']
      const result = list.listIndexOf({
        items,
        value: 'b'
      })
      strictEqual(result, 1)
    })

    it('should return -1 if value not found', (t) => {
      const items = ['a', 'b', 'c']
      const result = list.listIndexOf({
        items,
        value: 'd'
      })
      strictEqual(result, -1)
    })

    it('should handle numeric values', (t) => {
      const items = [1, 2, 3]
      const result = list.listIndexOf({
        items,
        value: 2
      })
      strictEqual(result, 1)
    })

    it('should handle mixed types', (t) => {
      const items = ['1', 2, '3']
      const result = list.listIndexOf({
        items,
        value: 2
      })
      strictEqual(result, 1)

      const result2 = list.listIndexOf({
        items,
        value: '2'
      })
      strictEqual(result2, -1)
    })
  })

  describe('push', () => {
    it('should push value to array', (t) => {
      const target = [1, 2]
      const result = list.listPush({
        target,
        source: 3
      })

      strictEqual(result, 3)
      deepStrictEqual(target, [1, 2, 3])
    })

    it('should push object value to array', (t) => {
      const target = [{ id: 1 }]
      const source = { id: 2 }
      const result = list.listPush({
        target,
        source
      })

      strictEqual(result, 2)
      deepStrictEqual(target, [{ id: 1 }, { id: 2 }])
    })
  })

  describe('sort', () => {
    it('should sort numbers ascending', (t) => {
      const items = [
        { value: 3 },
        { value: 1 },
        { value: 2 }
      ]

      const result = list.listSort({
        items,
        type: 'ascending'
      })

      strictEqual(result[0].value, 1)
      strictEqual(result[1].value, 2)
      strictEqual(result[2].value, 3)
    })

    it('should sort numbers descending', (t) => {
      const items = [
        { value: 1 },
        { value: 3 },
        { value: 2 }
      ]

      const result = list.listSort({
        items,
        type: 'descending'
      })

      strictEqual(result[0].value, 3)
      strictEqual(result[1].value, 2)
      strictEqual(result[2].value, 1)
    })

    it('should sort strings ascending (case insensitive)', (t) => {
      const items = [
        { value: 'B' },
        { value: 'a' },
        { value: 'C' }
      ]

      const result = list.listSort({
        items,
        type: 'ascending'
      })

      strictEqual(result[0].value, 'a')
      strictEqual(result[1].value, 'B')
      strictEqual(result[2].value, 'C')
    })

    it('should sort strings descending (case insensitive)', (t) => {
      const items = [
        { value: 'a' },
        { value: 'B' },
        { value: 'C' }
      ]

      const result = list.listSort({
        items,
        type: 'descending'
      })

      strictEqual(result[0].value, 'C')
      strictEqual(result[1].value, 'B')
      strictEqual(result[2].value, 'a')
    })

    it('should throw error for invalid sort type', (t) => {
      const items = []

      throws(() => {
        list.listSort({
          items,
          type: 'invalid'
        })
      }, {
        message: /Sort method does not exist: invalid/
      })
    })

    it('should handle equal values', (t) => {
      const items = [
        {
          value: 1,
          id: '1'
        },
        {
          value: 1,
          id: '2'
        }
      ]

      const result = list.listSort({
        items,
        type: 'ascending'
      })

      strictEqual(result.length, 2)
      strictEqual(result[0].value, 1)
      strictEqual(result[1].value, 1)
    })
  })

  describe('splice', () => {
    it('should remove elements from array', (t) => {
      const target = [1, 2, 3, 4, 5]
      const result = list.listSplice({
        target,
        start: 2,
        deleteCount: 2
      })

      deepStrictEqual(result, [3, 4])
      deepStrictEqual(target, [1, 2, 5])
    })

    it('should remove all elements from start if deleteCount undefined', (t) => {
      const target = [1, 2, 3, 4, 5]
      const result = list.listSplice({
        target,
        start: 2
      })

      deepStrictEqual(result, [3, 4, 5])
      deepStrictEqual(target, [1, 2])
    })

    it('should insert elements', (t) => {
      const target = [1, 2, 3]
      const result = list.listSplice({
        target,
        start: 1,
        source: [9, 8],
        deleteCount: 0
      })

      deepStrictEqual(result, [])
      deepStrictEqual(target, [1, 9, 8, 2, 3])
    })

    it('should insert single element', (t) => {
      const target = [1, 2, 3]
      const result = list.listSplice({
        target,
        start: 1,
        source: 9,
        deleteCount: 0
      })

      deepStrictEqual(result, [])
      deepStrictEqual(target, [1, 9, 2, 3])
    })

    it('should insert elements without deleteCount (default to 0)', (t) => {
      const target = [1, 2, 3]
      // deleteCount is implicitly 0 if source provided and deleteCount undefined
      const result = list.listSplice({
        target,
        start: 1,
        source: 9
      })

      deepStrictEqual(result, [])
      deepStrictEqual(target, [1, 9, 2, 3])
    })

    it('should replace elements', (t) => {
      const target = [1, 2, 3]
      const result = list.listSplice({
        target,
        start: 1,
        deleteCount: 1,
        source: 9
      })

      deepStrictEqual(result, [2])
      deepStrictEqual(target, [1, 9, 3])
    })

    it('should clear array if start is null', (t) => {
      const target = [1, 2, 3]
      const result = list.listSplice({
        target,
        start: null
      })

      deepStrictEqual(result, [1, 2, 3])
      deepStrictEqual(target, [])
    })

    it('should throw error if start is null but source provided', (t) => {
      const target = [1, 2, 3]

      throws(() => {
        list.listSplice({
          target,
          start: null,
          source: 4
        })
      }, {
        message: /Splice with source expects a start position/
      })
    })
  })
})
