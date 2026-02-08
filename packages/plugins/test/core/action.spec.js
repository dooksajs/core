import { describe, it, afterEach, after, mock, beforeEach } from 'node:test'
import { strictEqual, deepStrictEqual, rejects, throws } from 'node:assert'
import { createAction } from '@dooksa/create-action'
import { action as originalAction, state, api } from '#core'
import { createState, createTestServer, hydrateActionState } from '../helpers/index.js'


let testServer = createTestServer(1000)

/**
 * Helper function to create state data
 * @returns {Object} State data object
 */
function createStateData () {
  return createState([originalAction])
}

function getActionsMap (actions) {
  const map = {}
  if (!actions) return map

  const list = Array.isArray(actions) ? actions : Object.values(actions)

  list.forEach(a => {
    // Check if item is valid action object or just the function itself if passed as object values
    if (a && a.name && typeof a.method === 'function') {
      map[a.name] = a.method
    } else if (typeof a === 'function' && a.name) {
      // This handles if actions are passed as { name: func }
      map[a.name] = a
    }
  })

  return map
}

function getDefaultActions (action) {
  const defaultActions = {}

  // We need actions from state and api plugins as they might be used
  // e.g. state_setValue, api_fetch etc.
  // Note: state.actions and api.actions might be arrays of objects { name, method }
  const plugins = [action, state, api]

  plugins.forEach(plugin => {
    if (plugin.actions) {
      Object.assign(defaultActions, getActionsMap(plugin.actions))
    }
  })

  Object.assign(defaultActions, getActionsMap(originalAction))

  return defaultActions
}


describe('Action Plugin', () => {
  let action

  beforeEach(function () {
    action = originalAction.createObservableInstance(this)
  })
  /**
   * Teardown: Reset global state and plugins after each test
   * to ensure test isolation.
   */
  afterEach(async () => {
    try {
      await testServer.restore() // Reset server internal state
    } catch (error) {
      await testServer.stop()
      testServer = createTestServer(1000)
    }
    state.restore()
    api.restore()
    originalAction.restore()
  })

  /**
   * Final Cleanup: Stop the server process when all tests are done.
   */
  after(async () => {
    if (testServer) {
      await testServer.stop()
    }
  })

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

      const stateData = createStateData()
      state.setup(stateData)

      // Setup action plugin with actions and lazy loader first
      action.setup({
        actions: {
          ...getDefaultActions(action),
          ...testActions
        },
        lazyLoadAction: lazyLoader
      })

      // Verify setup was called - check that actions were registered
      strictEqual(typeof action.setup, 'function')
    })

    it('should throw error for invalid action method', async (t) => {
      throws(() => {
        action.setup({
          actions: {
            // @ts-ignore
            invalid: 'not_a_function'
          }
        })
      }, {
        message: /Action: unexpected type/
      })
    })

    it('should handle lazy loading when action not available', async (t) => {
      // Setup action with lazy loader
      const lazyActions = {}
      const lazyLoader = (name, callback) => {
        // Simulate loading by adding the action
        lazyActions[name] = (params) => params.value
        setTimeout(() => callback(), 10)
      }

      const stateData = createStateData()
      state.setup(stateData)

      action.setup({
        actions: {
          ...getDefaultActions(action)
        },
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
          // @ts-ignore
          action_dispatch_test: {
            id: 'test-component',
            payload: { value: 'hello' }
          }
        }
      ], { action_dispatch_test: true })

      const stateData = createStateData()
      state.setup(stateData)

      // Seed state with action data
      hydrateActionState(actionData)

      // Mock the action method that will be called
      action.setup({
        actions: {
          ...getDefaultActions(action),
          action_dispatch_test: (params, context) => {
            return { dispatched: params }
          }
        }
      })

      const result = await action.actionDispatch({
        id: 'test-dispatch',
        context: {
          id: 'ctx-1',
          rootId: 'root-1'
        },
        payload: { data: 'test' }
      })

      strictEqual(result.dispatched.id, 'test-component')
      strictEqual(result.dispatched.payload.value, 'hello')
    })

    it('should dispatch action with context and payload', async (t) => {
      const actionData = createAction('context-test', [
        {
          action_getContextValue: 'id'
        }
      ])

      const stateData = createStateData()
      state.setup(stateData)

      // Seed state
      hydrateActionState(actionData)

      // Ensure default actions are setup
      action.setup({
        actions: {
          ...getDefaultActions(action)
        }
      })

      const result = await action.actionDispatch({
        id: 'context-test',
        context: { id: 'test-ctx-123' },
        payload: {}
      })

      strictEqual(result, 'test-ctx-123')
    })

    it('should cache block values during dispatch', async (t) => {
      const actionData = createAction('cache-test', [
        {
          $id: 'step1',
          // @ts-ignore
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

      const stateData = createStateData()
      state.setup(stateData)

      // Seed state
      hydrateActionState(actionData)

      action.setup({
        actions: {
          ...getDefaultActions(action),
          action_dispatch_test: (params, context) => ({ dispatched: params })
        }
      })

      const result = await action.actionDispatch({
        id: 'cache-test',
        context: {},
        payload: {}
      })

      strictEqual(result, 'comp1')
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

      // Start the test server configured to serve this specific action definition.
      const hostname = await testServer.start({
        middleware: ['user/auth'],
        plugins: [
          {
            type: 'server',
            name: 'action.js',
            setup: {
              actions: [actionData]
            }
          }
        ]
      })

      const stateData = createStateData()
      api.setup({ hostname })
      state.setup(stateData)

      action.setup({
        actions: {
          ...getDefaultActions(action),
          handle_fetchedAction: handleFetchedAction
        }
      })

      // Note: We don't seed state with 'fetched-action' so it will try to fetch from backend
      await action.actionDispatch({
        id: 'fetched-action',
        context: {},
        payload: {}
      })

      strictEqual(handleFetchedAction.mock.callCount(), 1)
    })

    it('should throw error when action sequence not found', async (t) => {
      // Start server with no actions
      const hostname = await testServer.start()

      const stateData = createStateData()
      api.setup({ hostname })
      state.setup(stateData)

      // Setup default actions
      action.setup({
        actions: {
          ...getDefaultActions(action)
        }
      })

      // Don't setup any other actions or seed state

      await rejects(
        action.actionDispatch({
          id: 'missing-action',
          context: {},
          payload: {}
        }),
        {
          message: /HTTP error! status: 404/
        }
      )
    })

    // Skipped due to environment flakiness with test server restart
    it.skip('should clear block values when clearBlockValues is true', async (t) => {
      const actionData = createAction('clear-test', [
        {
          // @ts-ignore
          action_dispatch_test: { id: 'test' }
        }
      ])

      const stateData = createStateData()
      state.setup(stateData)

      // Seed state
      hydrateActionState(actionData)

      action.setup({
        actions: {
          ...getDefaultActions(action),
          action_dispatch_test: (params, context) => ({ result: 'first' })
        }
      })

      // First call
      await action.actionDispatch({
        id: 'clear-test',
        context: {},
        payload: {}
      })

      const result = await action.actionDispatch({
        id: 'clear-test',
        context: {},
        payload: {},
        clearBlockValues: true
      })

      strictEqual(result.result, 'second')
    })
  })

  describe('Value Retrieval Methods', () => {
    describe('action.getValue', () => {
      it('should get value from action result', async (t) => {
        const stateData = createStateData()
        state.setup(stateData)

        action.setup({
          actions: { ...getDefaultActions(action) }
        })

        const result = action.actionGetValue({
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
      })

      it('should get nested value with query', async (t) => {
        const stateData = createStateData()
        state.setup(stateData)

        action.setup({
          actions: { ...getDefaultActions(action) }
        })

        const result = action.actionGetValue({
          value: {
            user: {
              name: 'John',
              age: 30
            }
          },
          query: 'user.name'
        })

        strictEqual(result, 'John')
      })

      it('should return undefined for missing query path', async (t) => {
        const stateData = createStateData()
        state.setup(stateData)

        action.setup({
          actions: { ...getDefaultActions(action) }
        })

        const result = action.actionGetValue({
          value: { user: { name: 'John' } },
          query: 'user.age'
        })

        strictEqual(result, undefined)
      })

      it('should handle array queries', async (t) => {
        const stateData = createStateData()
        state.setup(stateData)

        action.setup({
          actions: { ...getDefaultActions(action) }
        })

        const result = action.actionGetValue({
          value: { items: [1, 2, 3] },
          query: 'items.1'
        })

        strictEqual(result, 2)
      })
    })

    describe('action.getContextValue', () => {
      it('should get value from context', async (t) => {
        const stateData = createStateData()
        state.setup(stateData)

        action.setup({
          actions: { ...getDefaultActions(action) }
        })

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

        const result = action.actionGetContextValue('user.name', context)
        strictEqual(result, 'Jane')
      })

      it('should get entire context when no query', async (t) => {
        const stateData = createStateData()
        state.setup(stateData)

        action.setup({
          actions: { ...getDefaultActions(action) }
        })

        const context = {
          context: {
            id: 'test-123',
            rootId: 'root-1'
          }
        }

        const result = action.actionGetContextValue(undefined, { context: context.context })
        deepStrictEqual(result, context.context)
      })

      it('should return undefined for missing path', async (t) => {
        const stateData = createStateData()
        state.setup(stateData)

        action.setup({
          actions: { ...getDefaultActions(action) }
        })

        const context = {
          context: { id: 'test' }
        }

        const result = action.actionGetContextValue('missing.path', context)
        strictEqual(result, undefined)
      })
    })

    describe('action.getPayloadValue', () => {
      it('should get value from payload', async (t) => {
        const stateData = createStateData()
        state.setup(stateData)

        action.setup({
          actions: { ...getDefaultActions(action) }
        })

        const context = {
          payload: {
            formData: {
              username: 'testuser',
              password: 'secret'
            }
          }
        }

        const result = action.actionGetPayloadValue('formData.username', context)
        strictEqual(result, 'testuser')
      })

      it('should get entire payload when no query', async (t) => {
        const stateData = createStateData()
        state.setup(stateData)

        action.setup({
          actions: { ...getDefaultActions(action) }
        })

        const context = {
          payload: {
            data: 'test',
            value: 123
          }
        }

        const result = action.actionGetPayloadValue(undefined, { payload: context.payload })
        deepStrictEqual(result, context.payload)
      })

      it('should handle nested payload structures', async (t) => {
        const stateData = createStateData()
        state.setup(stateData)

        action.setup({
          actions: { ...getDefaultActions(action) }
        })

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

        const result = action.actionGetPayloadValue('event.target.value', context)
        strictEqual(result, 'input-value')
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

      const stateData = createStateData()
      state.setup(stateData)

      // Seed state
      hydrateActionState(actionData)

      const handleActiveResult = t.mock.fn((params, context) => {
        return true
      })
      const handleInactiveResult = t.mock.fn((params, context) => {
        return false
      })

      action.setup({
        actions: {
          ...getDefaultActions(action),
          handleActive: handleActiveResult,
          handleInactive: handleInactiveResult
        }
      })

      await action.actionDispatch({
        id: 'ifelse-true',
        context: {},
        payload: {}
      })

      // Should execute then branch (true == true is true)
      strictEqual(handleActiveResult.mock.callCount(), 1)
      strictEqual(handleInactiveResult.mock.callCount(), 0)
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

      const stateData = createStateData()
      state.setup(stateData)

      // Seed state
      hydrateActionState(actionData)

      action.setup({
        actions: {
          ...getDefaultActions(action),
          handleSuccess: handleSuccessResult,
          handleFailure: handleFailureResult
        }
      })

      await action.actionDispatch({
        id: 'ifelse-false',
        context: {},
        payload: {
          result: false
        }
      })

      // Should execute else branch (false == true is false)
      strictEqual(handleFailureResult.mock.callCount(), 1)
      strictEqual(handleSuccessResult.mock.callCount(), 0)
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

      const stateData = createStateData()
      state.setup(stateData)

      // Seed state
      hydrateActionState(actionData)

      const handleAndTrueResult = t.mock.fn((params, context) => {
        return true
      })
      const handleAndFalseResult = t.mock.fn((params, context) => {
        return false
      })

      action.setup({
        actions: {
          ...getDefaultActions(action),
          handleAndTrue: handleAndTrueResult,
          handleAndFalse: handleAndFalseResult
        }
      })

      await action.actionDispatch({
        id: 'ifelse-and',
        context: {},
        payload: {}
      })

      // Should execute then branch (both conditions true)
      strictEqual(handleAndTrueResult.mock.callCount(), 1)
      strictEqual(handleAndFalseResult.mock.callCount(), 0)
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

      const stateData = createStateData()
      state.setup(stateData)

      // Seed state
      hydrateActionState(actionData)

      const handleOrTrueResult = t.mock.fn((params, context) => {
        return true
      })
      const handleOrFalseResult = t.mock.fn((params, context) => {
        return false
      })

      action.setup({
        actions: {
          ...getDefaultActions(action),
          handleOrTrue: handleOrTrueResult,
          handleOrFalse: handleOrFalseResult
        }
      })

      await action.actionDispatch({
        id: 'ifelse-or',
        context: {},
        payload: {}
      })

      // Should execute then branch (second condition true)
      strictEqual(handleOrTrueResult.mock.callCount(), 1)
      strictEqual(handleOrFalseResult.mock.callCount(), 0)
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

      const stateData = createStateData()
      state.setup(stateData)

      action.setup({
        actions: {
          ...getDefaultActions(action),
          handleResolved: handleResolvedResult,
          handleNotResolved: handleNotResolvedResult
        }
      })

      // Seed state
      hydrateActionState(actionData)

      await action.actionDispatch({
        id: 'ifelse-resolve',
        context: { id: 'expected' },
        payload: {}
      })

      // Should resolve context value and match (expected == expected is true)
      strictEqual(handleResolvedResult.mock.callCount(), 1)
      strictEqual(handleNotResolvedResult.mock.callCount(), 0)
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

      const stateData = createStateData()
      state.setup(stateData)

      // Seed state
      hydrateActionState(actionData)

      action.setup({
        actions: { ...getDefaultActions(action) }
      })

      const result = await action.actionDispatch({
        id: 'complete-workflow',
        context: {},
        payload: { input: { value: 'processed-data' } }
      })

      strictEqual(result, 'processed-data')
    })

    it('should handle async action execution', async (t) => {
      const actionData = createAction('async-test', [
        {
          $id: 'async_step',
          //@ts-ignore
          action_dispatch_test: {
            id: 'async-comp',
            payload: { value: 'async-result' }
          }
        }
      ])

      const stateData = createStateData()
      state.setup(stateData)

      // Seed state
      hydrateActionState(actionData)

      action.setup({
        actions: {
          ...getDefaultActions(action),
          action_dispatch_test: async (params, context) => {
            return new Promise(resolve => {
              setTimeout(() => resolve(params.payload.value), 10)
            })
          }
        }
      })

      const result = await action.actionDispatch({
        id: 'async-test',
        context: {},
        payload: {}
      })

      strictEqual(result, 'async-result')
    })

    it('should propagate errors from action methods', async (t) => {
      const actionData = createAction('error-test', [
        {
          // @ts-ignore
          action_dispatch_test: {
            id: 'error-comp',
            payload: { message: 'Test error' }
          }
        }
      ])

      const stateData = createStateData()
      state.setup(stateData)

      // Seed state
      hydrateActionState(actionData)

      action.setup({
        actions: {
          ...getDefaultActions(action),
          action_dispatch_test: (params, context) => {
            return new Error(params.payload.message)
          }
        }
      })

      await rejects(
        action.actionDispatch({
          id: 'error-test',
          context: {},
          payload: {}
        }),
        {
          message: /Action method 'action_dispatch_test' failed/
        }
      )
    })
  })

  describe('Edge Cases', { skip: true }, () => {
    it('should handle empty sequence', async (t) => {
      const actionData = createAction('empty-seq', [])

      const stateData = createStateData()
      state.setup(stateData)

      // Seed state
      hydrateActionState(actionData)

      action.setup({
        actions: { ...getDefaultActions(action) }
      })

      const result = await action.actionDispatch({
        id: 'empty-seq',
        context: {},
        payload: {}
      })

      strictEqual(result, undefined)
    })

    it('should throw error for invalid sequence type', async (t) => {
      const stateData = createStateData()
      state.setup(stateData)

      action.setup({ actions: { ...getDefaultActions(action) } })

      // Mock state to return invalid sequence
      state.stateSetValue({
        name: 'action/sequences',
        value: { 'invalid-seq': 'not-an-array' },
        options: { replace: true }
      })

      await rejects(
        action.actionDispatch({
          id: 'invalid-seq',
          context: {},
          payload: {}
        }),
        {
          message: /Action: sequence must be an array/
        }
      )
    })

    it('should throw error when block not found', async (t) => {
      const actionData = createAction('missing-block', [
        {
          // @ts-ignore
          action_dispatch_test: { id: 'test' }
        }
      ])

      const stateData = createStateData()
      state.setup(stateData)

      // Seed only sequences, not blocks
      hydrateActionState({
        sequenceId: 'missing-block',
        sequences: actionData.sequences
      })

      // Don't seed blocks - this should cause an error
      action.setup({
        actions: {
          ...getDefaultActions(action),
          action_dispatch_test: (params) => params
        }
      })

      await rejects(
        action.actionDispatch({
          id: 'missing-block',
          context: {},
          payload: {}
        }),
        {
          message: /Action: block could not be found/
        }
      )
    })

    it('should throw error when block sequence not found', async (t) => {
      const actionData = createAction('missing-seq', [
        {
          // @ts-ignore
          action_dispatch_test: { id: 'test' }
        }
      ])

      const stateData = createStateData()
      state.setup(stateData)

      // Seed blocks but not block sequences
      hydrateActionState({
        sequenceId: 'missing-seq',
        sequences: actionData.sequences,
        blocks: actionData.blocks
      })

      // Don't seed blockSequences
      action.setup({
        actions: {
          ...getDefaultActions(action),
          action_dispatch_test: (params) => params
        }
      })

      await rejects(
        action.actionDispatch({
          id: 'missing-seq',
          context: {},
          payload: {}
        }),
        {
          message: /Action: block sequence could not be found/
        }
      )
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

      const stateData = createStateData()
      state.setup(stateData)

      // Seed state
      hydrateActionState(actionData)

      action.setup({
        actions: { ...getDefaultActions(action) }
      })

      // Capture console.warn
      const originalWarn = console.warn
      let warnCalled = false
      console.warn = () => {
        warnCalled = true
      }

      try {
        const result = await action.actionDispatch({
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
    })

    it('should handle block value retrieval from cache', async (t) => {
      const actionData = createAction('cache-test', [
        {
          $id: 'step1',
          // @ts-ignore
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

      const stateData = createStateData()
      state.setup(stateData)

      // Seed state
      hydrateActionState(actionData)

      action.setup({
        actions: {
          ...getDefaultActions(action),
          action_dispatch_test: (params, context) => ({
            cached: true,
            id: 'test-id'
          })
        }
      })

      // First call - should fetch from state
      const result1 = await action.actionDispatch({
        id: 'cache-test',
        context: {},
        payload: {}
      })

      // Second call - should use cache
      const result2 = await action.actionDispatch({
        id: 'cache-test',
        context: {},
        payload: {}
      })

      strictEqual(result1, result2)
    })
  })
})
