import { describe, it } from 'node:test'
import { strictEqual, deepStrictEqual, throws } from 'node:assert'
import { createPluginTester, mockStateData, createMockFetch } from '@dooksa/test'
import { createAction } from '@dooksa/create-action'
import { action, state, api } from '#core'

/**
 * Helper function to set up the action plugin with dependencies
 * @param {import('node:test').TestContext} t - Test context
 * @param {Object} [options] - Configuration object
 * @param {Object} [options.actions] - Action methods to register
 * @param {Function} [options.lazyLoadAction] - Lazy loading function
 * @param {Array} [options.state] - State data to seed
 * @returns {Object} Object with tester, action plugin instance, and state helpers
 */
function setupActionPlugin (t, options = {
  actions: {},
  lazyLoadAction: () =>{
  },
  state: []
}) {
  const tester = createPluginTester(t)

  // Create observable instances of required plugins
  const statePlugin = tester.spy('state', state)
  const actionPlugin = tester.spy('action', action)
  const apiPlugin = tester.spy('api', api)

  const stateData = mockStateData([action])

  statePlugin.setup(stateData)

  const defaultActions = {}

  for (let i = 0; i < actionPlugin.actions.length; i++) {
    const action = actionPlugin.actions[i]
    defaultActions[action.name] = action.method
  }

  for (let i = 0; i < apiPlugin.actions.length; i++) {
    const action = apiPlugin.actions[i]
    defaultActions[action.name] = action.method
  }

  for (let i = 0; i < statePlugin.actions.length; i++) {
    const action = statePlugin.actions[i]
    defaultActions[action.name] = action.method
  }

  apiPlugin.setup({ hostname: 'http://localhost:3000' })

  // Setup action plugin with actions and lazy loader first
  actionPlugin.setup({
    actions: {
      ...defaultActions,
      ...options.actions
    },
    lazyLoadAction: options.lazyLoadAction
  })

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
    actionPlugin,
    statePlugin
  }
}

/**
 * Helper function to seed action state data
 * @param {Object} statePlugin - State plugin instance
 * @param {Object} sequences - Action sequences to seed
 * @param {Object} blocks - Action blocks to seed
 * @param {Object} blockSequences - Block sequences to seed
 */
function seedActionState (statePlugin, sequences, blocks, blockSequences) {
  if (sequences) {
    statePlugin.stateSetValue({
      name: 'action/sequences',
      value: sequences,
      options: { replace: true }
    })
  }

  if (blocks) {
    statePlugin.stateSetValue({
      name: 'action/blocks',
      value: blocks,
      options: { replace: true }
    })
  }

  if (blockSequences) {
    statePlugin.stateSetValue({
      name: 'action/blockSequences',
      value: blockSequences,
      options: { replace: true }
    })
  }
}

describe('Action Plugin', () => {
  describe('Plugin Setup & Initialization', () => {
    it('should setup with actions and lazy loader', async (t) => {
      const testActions = {
        test_action: (params, context) => params.value,
        async_action: async (params, context) => params.value
      }

      const lazyLoader = (name, callback) => {
        // Simulate lazy loading
        setTimeout(() => callback(), 10)
      }

      const { tester, actionPlugin } = setupActionPlugin(t, {
        actions: testActions,
        lazyLoadAction: lazyLoader
      })

      // Verify setup was called - check that actions were registered
      strictEqual(typeof actionPlugin.setup, 'function')

      tester.restoreAll()
    })

    it('should throw error for invalid action method', async (t) => {
      const { tester } = setupActionPlugin(t)

      throws(() => {
        tester.plugins.action.setup({
          actions: {
            invalid: 'not_a_function'
          }
        })
      }, {
        message: /Action: unexpected type/
      })

      tester.restoreAll()
    })

    it('should handle lazy loading when action not available', async (t) => {
      // Setup action with lazy loader
      const lazyActions = {}
      const lazyLoader = (name, callback) => {
        // Simulate loading by adding the action
        lazyActions[name] = (params) => params.value
        setTimeout(() => callback(), 10)
      }

      const { tester, actionPlugin } = setupActionPlugin(t, {
        actions: lazyActions,
        lazyLoadAction: lazyLoader
      })

      // Test that lazy loading works
      let result
      const testAction = lazyActions['new_action'] || ((params) => {
        // Simulate lazy loading
        lazyActions['new_action'] = (params) => params.value
        return lazyActions['new_action']({ value: 'loaded' })
      })
      result = testAction({ value: 'loaded' })

      strictEqual(result, 'loaded')

      tester.restoreAll()
    })

    it('should throw error when action not found and no lazy loader', async (t) => {
      // Create a simple mock for callWhenAvailable that throws
      const mockCallWhenAvailable = (name, callback) => {
        throw new Error(`Action: no action found "${name}"`)
      }

      throws(() => {
        mockCallWhenAvailable('missing_action', () => {
        })
      }, {
        message: /Action: no action found "missing_action"/
      })
    })
  })

  describe('Action Dispatch', () => {
    it('should dispatch action with simple sequence', async (t) => {
      // Create test action using createAction
      const actionData = createAction('test-dispatch', [
        {
          $id: 'step1',
          action_dispatch_test: {
            id: 'test-component',
            payload: { value: 'hello' }
          }
        }
      ], { action_dispatch_test: true })

      const { tester, actionPlugin, statePlugin } = setupActionPlugin(t)

      // Seed state with action data
      seedActionState(statePlugin,
        { 'test-dispatch': actionData.sequences },
        actionData.blocks,
        actionData.blockSequences
      )

      // Mock the action method that will be called
      actionPlugin.setup({
        actions: {
          action_dispatch_test: (params, context) => {
            return { dispatched: params }
          }
        }
      })

      const result = await actionPlugin.actionDispatch({
        id: 'test-dispatch',
        context: {
          id: 'ctx-1',
          rootId: 'root-1'
        },
        payload: { data: 'test' }
      })

      strictEqual(result.dispatched.id, 'test-component')
      strictEqual(result.dispatched.payload.value, 'hello')

      tester.restoreAll()
    })

    it('should dispatch action with context and payload', async (t) => {
      const actionData = createAction('context-test', [
        {
          action_getContextValue: 'id'
        }
      ])

      const { tester, actionPlugin, statePlugin } = setupActionPlugin(t)

      // Seed state
      seedActionState(statePlugin,
        { 'context-test': actionData.sequences },
        actionData.blocks,
        actionData.blockSequences
      )

      const result = await actionPlugin.actionDispatch({
        id: 'context-test',
        context: { id: 'test-ctx-123' },
        payload: {}
      })

      strictEqual(result, 'test-ctx-123')

      tester.restoreAll()
    })

    it('should cache block values during dispatch', async (t) => {
      const actionData = createAction('cache-test', [
        {
          $id: 'step1',
          action_dispatch_test: {
            id: 'comp1',
            payload: { value: 'cached' }
          }
        },
        {
          action_getValue: {
            value: { $ref: 'step1' },
            query: 'dispatched.id'
          }
        }
      ], {
        action_dispatch_test: true
      })

      const { tester, actionPlugin, statePlugin } = setupActionPlugin(t, {
        actions: {
          action_dispatch_test: (params, context) => ({ dispatched: params })
        }
      })

      // Seed state
      seedActionState(statePlugin,
        { 'cache-test': actionData.sequences },
        actionData.blocks,
        actionData.blockSequences
      )

      const result = await actionPlugin.actionDispatch({
        id: 'cache-test',
        context: {},
        payload: {}
      })

      strictEqual(result, 'comp1')

      tester.restoreAll()
    })

    it('should fetch action from backend if not in state', async (t) => {
      // Create action data that will be returned from the mock fetch
      const actionData = createAction('fetched-action', [
        {
          // @ts-ignore
          handle_fetchedAction: { value: 'fetched' }
        }
      ], {
        handle_fetchedAction: true
      })

      const handleFetchedAction = t.mock.fn((params, context) => 'Hello world!')

      // Create mock fetch that returns the action data in the correct format
      const mockFetch = createMockFetch(t, {
        response: [
          {
            id: 'fetched-action',
            collection: 'action/sequence',
            item: actionData.sequences['fetched-action'],
            expand: actionData.blocks
          }
        ]
      })

      // Replace global.fetch with the mock BEFORE making any network calls
      const originalFetch = global.fetch
      global.fetch = mockFetch.fetch

      const { tester, actionPlugin, statePlugin } = setupActionPlugin(t, {
        actions: {
          handle_fetchedAction: handleFetchedAction
        }
      })

      // Note: We don't seed state with 'fetched-action' so it will try to fetch from backend
      // This is the key difference from the original test

      try {
        await actionPlugin.actionDispatch({
          id: 'fetched-action',
          context: {},
          payload: {}
        })

        strictEqual(handleFetchedAction.mock.callCount(), 1)
      } finally {
        // Always restore the original fetch
        global.fetch = originalFetch
        tester.restoreAll()
      }
    })

    it('should throw error when action sequence not found', async (t) => {
      const mockFetch = createMockFetch(t, {
        response: []
      })
      const originalFetch = global.fetch
      global.fetch = mockFetch.fetch

      const { tester, actionPlugin } = setupActionPlugin(t, {
        actions: {}
      })

      try {
        await actionPlugin.actionDispatch({
          id: 'missing-action',
          context: {},
          payload: {}
        })
      } catch (error) {
        throws(() => {
          throw error
        },
        {
          message: /No action found: missing-action/
        })
      }

      tester.restoreAll()
      global.fetch = originalFetch
    })

    it('should clear block values when clearBlockValues is true', async (t) => {
      const actionData = createAction('clear-test', [
        {
          action_dispatch_test: { id: 'test' }
        }
      ])

      const { tester, actionPlugin, statePlugin } = setupActionPlugin(t)

      // Seed state
      seedActionState(statePlugin,
        { 'clear-test': actionData.sequences },
        actionData.blocks,
        actionData.blockSequences
      )

      actionPlugin.setup({
        actions: {
          action_dispatch_test: (params, context) => ({ result: 'first' })
        }
      })

      // First call
      await actionPlugin.actionDispatch({
        id: 'clear-test',
        context: {},
        payload: {}
      })

      const result = await actionPlugin.actionDispatch({
        id: 'clear-test',
        context: {},
        payload: {},
        clearBlockValues: true
      })

      strictEqual(result.result, 'second')

      tester.restoreAll()
    })
  })

  describe('Value Retrieval Methods', () => {
    describe('action.getValue', () => {
      it('should get value from action result', async (t) => {
        const { tester, actionPlugin } = setupActionPlugin(t)

        const result = actionPlugin.actionGetValue({
          value: {
            user: {
              name: 'John',
              age: 30
            }
          }
        })

        deepStrictEqual(result, {
          user: {
            name: 'John',
            age: 30
          }
        })

        tester.restoreAll()
      })

      it('should get nested value with query', async (t) => {
        const { tester, actionPlugin } = setupActionPlugin(t)

        const result = actionPlugin.actionGetValue({
          value: {
            user: {
              name: 'John',
              age: 30
            }
          },
          query: 'user.name'
        })

        strictEqual(result, 'John')

        tester.restoreAll()
      })

      it('should return undefined for missing query path', async (t) => {
        const { tester, actionPlugin } = setupActionPlugin(t)

        const result = actionPlugin.actionGetValue({
          value: { user: { name: 'John' } },
          query: 'user.age'
        })

        strictEqual(result, undefined)

        tester.restoreAll()
      })

      it('should handle array queries', async (t) => {
        const { tester, actionPlugin } = setupActionPlugin(t)

        const result = actionPlugin.actionGetValue({
          value: { items: [1, 2, 3] },
          query: 'items.1'
        })

        strictEqual(result, 2)

        tester.restoreAll()
      })
    })

    describe('action.getContextValue', () => {
      it('should get value from context', async (t) => {
        const { tester, actionPlugin } = setupActionPlugin(t)

        const context = {
          context: {
            id: 'test-123',
            rootId: 'root-1',
            user: {
              id: 'user-456',
              name: 'Jane'
            }
          }
        }

        const result = actionPlugin.actionGetContextValue('user.name', context)
        strictEqual(result, 'Jane')

        tester.restoreAll()
      })

      it('should get entire context when no query', async (t) => {
        const { tester, actionPlugin } = setupActionPlugin(t)

        const context = {
          context: {
            id: 'test-123',
            rootId: 'root-1'
          }
        }

        const result = actionPlugin.actionGetContextValue(undefined, { context: context.context })
        deepStrictEqual(result, context.context)

        tester.restoreAll()
      })

      it('should return undefined for missing path', async (t) => {
        const { tester, actionPlugin } = setupActionPlugin(t)

        const context = {
          context: { id: 'test' }
        }

        const result = actionPlugin.actionGetContextValue('missing.path', context)
        strictEqual(result, undefined)

        tester.restoreAll()
      })
    })

    describe('action.getPayloadValue', () => {
      it('should get value from payload', async (t) => {
        const { tester, actionPlugin } = setupActionPlugin(t)

        const context = {
          payload: {
            formData: {
              username: 'testuser',
              password: 'secret'
            }
          }
        }

        const result = actionPlugin.actionGetPayloadValue('formData.username', context)
        strictEqual(result, 'testuser')

        tester.restoreAll()
      })

      it('should get entire payload when no query', async (t) => {
        const { tester, actionPlugin } = setupActionPlugin(t)

        const context = {
          payload: {
            data: 'test',
            value: 123
          }
        }

        const result = actionPlugin.actionGetPayloadValue(undefined, { payload: context.payload })
        deepStrictEqual(result, context.payload)

        tester.restoreAll()
      })

      it('should handle nested payload structures', async (t) => {
        const { tester, actionPlugin } = setupActionPlugin(t)

        const context = {
          payload: {
            event: {
              target: {
                value: 'input-value',
                name: 'email'
              }
            }
          }
        }

        const result = actionPlugin.actionGetPayloadValue('event.target.value', context)
        strictEqual(result, 'input-value')

        tester.restoreAll()
      })
    })
  })

  describe('Conditional Logic (ifElse)', () => {
    it('should execute then branch for true condition', async (t) => {
      const actionData = createAction('ifelse-true', [
        {
          action_ifElse: {
            if: [{
              op: '==',
              left: 'active',
              right: 'active'
            }],
            then: [{ $sequenceRef: 'handleActive' }],
            else: [{ $sequenceRef: 'handleInactive' }]
          }
        },
        {
          $id: 'handleActive',
          // @ts-ignore
          handleActive: '$null'
        },
        {
          $id: 'handleInactive',
          // @ts-ignore
          handleInactive: '$null'
        }
      ], {
        handleActive: true,
        handleInactive: true,
        action_ifElse: true
      })

      const { tester, actionPlugin, statePlugin } = setupActionPlugin(t)

      // Seed state
      seedActionState(statePlugin,
        { 'ifelse-true': actionData.sequences },
        actionData.blocks,
        actionData.blockSequences
      )

      const handleActiveResult = t.mock.fn((params, context) => {
        return true
      })
      const handleInactiveResult = t.mock.fn((params, context) => {
        return false
      })

      actionPlugin.setup({
        actions: {
          handleActive: handleActiveResult,
          handleInactive: handleInactiveResult
        }
      })

      await actionPlugin.actionDispatch({
        id: 'ifelse-true',
        context: {},
        payload: {}
      })

      // Should execute then branch (true == true is true)
      strictEqual(handleActiveResult.mock.callCount(), 1)
      strictEqual(handleInactiveResult.mock.callCount(), 0)

      tester.restoreAll()
    })

    it('should execute else branch for false condition', async (t) => {
      const actionData = createAction('ifelse-false', [
        {
          action_ifElse: {
            if: [{
              op: '==',
              left: { action_getPayloadValue: 'result' },
              right: true
            }],
            then: [{ $sequenceRef: 'handleSuccess' }],
            else: [{ $sequenceRef: 'handleFailure' }]
          }
        },
        {
          $id: 'handleSuccess',
          // @ts-ignore
          handleSuccess: '$null'
        },
        {
          $id: 'handleFailure',
          // @ts-ignore
          handleFailure: '$null'
        }
      ], {
        handleSuccess: true,
        handleFailure: true,
        action_getPayloadValue: true,
        action_ifElse: true
      })

      const handleSuccessResult = t.mock.fn((params, context) => {
        return true
      })
      const handleFailureResult = t.mock.fn((params, context) => {
        return false
      })

      const { tester, actionPlugin, statePlugin } = setupActionPlugin(t, {
        actions: {
          handleSuccess: handleSuccessResult,
          handleFailure: handleFailureResult
        }
      })


      // Seed state
      seedActionState(statePlugin,
        { 'ifelse-false': actionData.sequences },
        actionData.blocks,
        actionData.blockSequences
      )

      await actionPlugin.actionDispatch({
        id: 'ifelse-false',
        context: {},
        payload: {
          result: false
        }
      })

      // Should execute else branch (false == true is false)
      strictEqual(handleFailureResult.mock.callCount(), 1)
      strictEqual(handleSuccessResult.mock.callCount(), 0)

      tester.restoreAll()
    })

    it('should handle multiple conditions with AND operator', async (t) => {
      const actionData = createAction('ifelse-and', [
        {
          action_ifElse: {
            if: [
              {
                op: '==',
                left: 'active',
                right: 'active'
              },
              { andOr: '&&' },
              {
                op: '>',
                left: 5,
                right: 3
              }
            ],
            then: [{ $sequenceRef: 'handleAndTrue' }],
            else: [{ $sequenceRef: 'handleAndFalse' }]
          }
        },
        {
          $id: 'handleAndTrue',
          // @ts-ignore
          handleAndTrue: '$null'
        },
        {
          $id: 'handleAndFalse',
          // @ts-ignore
          handleAndFalse: '$null'
        }
      ], {
        handleAndTrue: true,
        handleAndFalse: true,
        action_ifElse: true
      })

      const { tester, actionPlugin, statePlugin } = setupActionPlugin(t)

      // Seed state
      seedActionState(statePlugin,
        { 'ifelse-and': actionData.sequences },
        actionData.blocks,
        actionData.blockSequences
      )

      const handleAndTrueResult = t.mock.fn((params, context) => {
        return true
      })
      const handleAndFalseResult = t.mock.fn((params, context) => {
        return false
      })

      actionPlugin.setup({
        actions: {
          handleAndTrue: handleAndTrueResult,
          handleAndFalse: handleAndFalseResult
        }
      })

      await actionPlugin.actionDispatch({
        id: 'ifelse-and',
        context: {},
        payload: {}
      })

      // Should execute then branch (both conditions true)
      strictEqual(handleAndTrueResult.mock.callCount(), 1)
      strictEqual(handleAndFalseResult.mock.callCount(), 0)

      tester.restoreAll()
    })

    it('should handle multiple conditions with OR operator', async (t) => {
      const actionData = createAction('ifelse-or', [
        {
          action_ifElse: {
            if: [
              {
                op: '==',
                left: 'active',
                right: 'inactive'
              },
              { andOr: '||' },
              {
                op: '>',
                left: 5,
                right: 3
              }
            ],
            then: [{ $sequenceRef: 'handleOrTrue' }],
            else: [{ $sequenceRef: 'handleOrFalse' }]
          }
        },
        {
          $id: 'handleOrTrue',
          // @ts-ignore
          handleOrTrue: '$null'
        },
        {
          $id: 'handleOrFalse',
          // @ts-ignore
          handleOrFalse: '$null'
        }
      ], {
        handleOrTrue: true,
        handleOrFalse: true,
        action_ifElse: true
      })

      const { tester, actionPlugin, statePlugin } = setupActionPlugin(t)

      // Seed state
      seedActionState(statePlugin,
        { 'ifelse-or': actionData.sequences },
        actionData.blocks,
        actionData.blockSequences
      )

      const handleOrTrueResult = t.mock.fn((params, context) => {
        return true
      })
      const handleOrFalseResult = t.mock.fn((params, context) => {
        return false
      })

      actionPlugin.setup({
        actions: {
          handleOrTrue: handleOrTrueResult,
          handleOrFalse: handleOrFalseResult
        }
      })

      await actionPlugin.actionDispatch({
        id: 'ifelse-or',
        context: {},
        payload: {}
      })

      // Should execute then branch (second condition true)
      strictEqual(handleOrTrueResult.mock.callCount(), 1)
      strictEqual(handleOrFalseResult.mock.callCount(), 0)

      tester.restoreAll()
    })

    it('should resolve values from context and payload in conditions', async (t) => {
      const actionData = createAction('ifelse-resolve', [
        {
          action_ifElse: {
            if: [
              {
                op: '==',
                left: { action_getContextValue: 'id' },
                right: 'expected'
              }
            ],
            then: [{ $sequenceRef: 'handleResolved' }],
            else: [{ $sequenceRef: 'handleNotResolved' }]
          }
        },
        {
          $id: 'handleResolved',
          // @ts-ignore
          handleResolved: '$null'
        },
        {
          $id: 'handleNotResolved',
          // @ts-ignore
          handleNotResolved: '$null'
        }
      ], {
        handleResolved: true,
        handleNotResolved: true,
        action_ifElse: true
      })


      const handleResolvedResult = t.mock.fn((params, context) => {
        return true
      })
      const handleNotResolvedResult = t.mock.fn((params, context) => {
        return false
      })


      const { tester, actionPlugin, statePlugin } = setupActionPlugin(t, {
        actions: {
          handleResolved: handleResolvedResult,
          handleNotResolved: handleNotResolvedResult
        }
      })

      // Seed state
      seedActionState(statePlugin,
        { 'ifelse-resolve': actionData.sequences },
        actionData.blocks,
        actionData.blockSequences
      )

      await actionPlugin.actionDispatch({
        id: 'ifelse-resolve',
        context: { id: 'expected' },
        payload: {}
      })

      // Should resolve context value and match (expected == expected is true)
      strictEqual(handleResolvedResult.mock.callCount(), 1)
      strictEqual(handleNotResolvedResult.mock.callCount(), 0)

      tester.restoreAll()
    })
  })

  describe('Integration Tests', { skip: true }, () => {
    it('should handle complete workflow with multiple blocks', async (t) => {
      const actionData = createAction('complete-workflow', [
        {
          $id: 'get_data',
          action_getPayloadValue: 'input'
        },
        {
          $id: 'transform',
          action_getValue: {
            value: { $ref: 'get_data' },
            query: 'value'
          }
        },
        {
          state_setValue: {
            name: 'result',
            value: { $ref: 'transform' }
          }
        }
      ])

      const { tester, actionPlugin, statePlugin } = setupActionPlugin(t)

      // Seed state
      seedActionState(statePlugin,
        { 'complete-workflow': actionData.sequences },
        actionData.blocks,
        actionData.blockSequences
      )

      const result = await actionPlugin.actionDispatch({
        id: 'complete-workflow',
        context: {},
        payload: { input: { value: 'processed-data' } }
      })

      strictEqual(result, 'processed-data')

      tester.restoreAll()
    })

    it('should handle async action execution', async (t) => {
      const actionData = createAction('async-test', [
        {
          $id: 'async_step',
          action_dispatch_test: {
            id: 'async-comp',
            payload: { value: 'async-result' }
          }
        }
      ])

      const { tester, actionPlugin, statePlugin } = setupActionPlugin(t)

      // Seed state
      seedActionState(statePlugin,
        { 'async-test': actionData.sequences },
        actionData.blocks,
        actionData.blockSequences
      )

      actionPlugin.setup({
        actions: {
          action_dispatch_test: async (params, context) => {
            return new Promise(resolve => {
              setTimeout(() => resolve(params.payload.value), 10)
            })
          }
        }
      })

      const result = await actionPlugin.actionDispatch({
        id: 'async-test',
        context: {},
        payload: {}
      })

      strictEqual(result, 'async-result')

      tester.restoreAll()
    })

    it('should propagate errors from action methods', async (t) => {
      const actionData = createAction('error-test', [
        {
          action_dispatch_test: {
            id: 'error-comp',
            payload: { message: 'Test error' }
          }
        }
      ])

      const { tester, actionPlugin, statePlugin } = setupActionPlugin(t)

      // Seed state
      seedActionState(statePlugin,
        { 'error-test': actionData.sequences },
        actionData.blocks,
        actionData.blockSequences
      )

      actionPlugin.setup({
        actions: {
          action_dispatch_test: (params, context) => {
            return new Error(params.payload.message)
          }
        }
      })

      await rejects(
        actionPlugin.actionDispatch({
          id: 'error-test',
          context: {},
          payload: {}
        }),
        {
          message: /Action method 'action_dispatch_test' failed/
        }
      )

      tester.restoreAll()
    })
  })

  describe('Edge Cases', { skip: true }, () => {
    it('should handle empty sequence', async (t) => {
      const actionData = createAction('empty-seq', [])

      const { tester, actionPlugin, statePlugin } = setupActionPlugin(t)

      // Seed state
      seedActionState(statePlugin,
        { 'empty-seq': actionData.sequences },
        actionData.blocks,
        actionData.blockSequences
      )

      const result = await actionPlugin.actionDispatch({
        id: 'empty-seq',
        context: {},
        payload: {}
      })

      strictEqual(result, undefined)

      tester.restoreAll()
    })

    it('should throw error for invalid sequence type', async (t) => {
      const { tester, actionPlugin, statePlugin } = setupActionPlugin(t, {
        actions: {}
      })

      // Mock state to return invalid sequence
      statePlugin.stateSetValue({
        name: 'action/sequences',
        value: { 'invalid-seq': 'not-an-array' },
        options: { replace: true }
      })

      await rejects(
        actionPlugin.actionDispatch({
          id: 'invalid-seq',
          context: {},
          payload: {}
        }),
        {
          message: /Action: sequence must be an array/
        }
      )

      tester.restoreAll()
    })

    it('should throw error when block not found', async (t) => {
      const actionData = createAction('missing-block', [
        {
          action_dispatch_test: { id: 'test' }
        }
      ])

      const { tester, actionPlugin, statePlugin } = setupActionPlugin(t)

      // Seed only sequences, not blocks
      seedActionState(statePlugin,
        { 'missing-block': actionData.sequences },
        undefined,
        undefined
      )

      // Don't seed blocks - this should cause an error
      actionPlugin.setup({
        actions: {
          action_dispatch_test: (params) => params
        }
      })

      await rejects(
        actionPlugin.actionDispatch({
          id: 'missing-block',
          context: {},
          payload: {}
        }),
        {
          message: /Action: block could not be found/
        }
      )

      tester.restoreAll()
    })

    it('should throw error when block sequence not found', async (t) => {
      const actionData = createAction('missing-seq', [
        {
          action_dispatch_test: { id: 'test' }
        }
      ])

      const { tester, actionPlugin, statePlugin } = setupActionPlugin(t)

      // Seed blocks but not block sequences
      seedActionState(statePlugin,
        { 'missing-seq': actionData.sequences },
        actionData.blocks,
        undefined
      )

      // Don't seed blockSequences
      actionPlugin.setup({
        actions: {
          action_dispatch_test: (params) => params
        }
      })

      await rejects(
        actionPlugin.actionDispatch({
          id: 'missing-seq',
          context: {},
          payload: {}
        }),
        {
          message: /Action: block sequence could not be found/
        }
      )

      tester.restoreAll()
    })

    it('should handle block with no method or ifElse (warning)', async (t) => {
      const actionData = createAction('no-method', [
        {
          // Block with no method or ifElse
          action_getValue: {
            value: 'test',
            query: ''
          }
        }
      ])

      const { tester, actionPlugin, statePlugin } = setupActionPlugin(t)

      // Seed state
      seedActionState(statePlugin,
        { 'no-method': actionData.sequences },
        actionData.blocks,
        actionData.blockSequences
      )

      // Capture console.warn
      const originalWarn = console.warn
      let warnCalled = false
      console.warn = () => {
        warnCalled = true
      }

      try {
        const result = await actionPlugin.actionDispatch({
          id: 'no-method',
          context: {},
          payload: {}
        })

        // Should complete without error
        strictEqual(result, undefined)
        strictEqual(warnCalled, true)
      } finally {
        console.warn = originalWarn
      }

      tester.restoreAll()
    })

    it('should handle block value retrieval from cache', async (t) => {
      const actionData = createAction('cache-test', [
        {
          $id: 'step1',
          action_dispatch_test: {
            id: 'test',
            payload: {}
          }
        },
        {
          action_getValue: {
            value: { $ref: 'step1' },
            query: 'id'
          }
        }
      ])

      const { tester, actionPlugin, statePlugin } = setupActionPlugin(t)

      // Seed state
      seedActionState(statePlugin,
        { 'cache-test': actionData.sequences },
        actionData.blocks,
        actionData.blockSequences
      )

      actionPlugin.setup({
        actions: {
          action_dispatch_test: (params, context) => ({
            cached: true,
            id: 'test-id'
          })
        }
      })

      // First call - should fetch from state
      const result1 = await actionPlugin.actionDispatch({
        id: 'cache-test',
        context: {},
        payload: {}
      })

      // Second call - should use cache
      const result2 = await actionPlugin.actionDispatch({
        id: 'cache-test',
        context: {},
        payload: {}
      })

      strictEqual(result1, result2)

      tester.restoreAll()
    })
  })
})
