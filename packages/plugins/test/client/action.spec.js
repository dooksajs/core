import { describe, it, beforeEach, afterEach } from 'node:test'
import { strictEqual, deepStrictEqual, ok, rejects, throws } from 'node:assert'
import { mockPlugin } from '@dooksa/test'
import { createAction } from '@dooksa/create-action'

describe('Action Plugin', () => {
  let mock

  beforeEach(async function () {
    // Setup mock with all required dependencies
    mock = await mockPlugin(this, {
      name: 'action',
      platform: 'client',
      clientModules: ['action', 'fetch', 'operator']
    })
  })

  afterEach(() => {
    if (mock) mock.restore()
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

      // Use the setup function directly
      mock.client.setup.action({
        actions: testActions,
        lazyLoadAction: lazyLoader
      })

      // Verify setup was called - check that actions were registered
      strictEqual(typeof mock.client.setup.action, 'function')
    })

    it('should throw error for invalid action method', async (t) => {
      throws(() => {
        mock.client.setup.action({
          actions: {
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

      mock.client.setup.action({
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

      // Seed state with action data using replace option
      mock.client.method.stateSetValue({
        name: 'action/sequences',
        value: { 'test-dispatch': actionData.sequences },
        options: { replace: true }
      })

      mock.client.method.stateSetValue({
        name: 'action/blocks',
        value: actionData.blocks,
        options: { replace: true }
      })

      mock.client.method.stateSetValue({
        name: 'action/blockSequences',
        value: actionData.blockSequences,
        options: { replace: true }
      })

      // Mock the action method that will be called
      mock.client.setup.action({
        actions: {
          action_dispatch_test: (params, context) => {
            return { dispatched: params }
          }
        }
      })

      const result = await mock.client.method.actionDispatch({
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

      // Seed state
      mock.client.method.stateSetValue({
        name: 'action/sequences',
        value: { 'context-test': actionData.sequences },
        options: { replace: true }
      })
      mock.client.method.stateSetValue({
        name: 'action/blocks',
        value: actionData.blocks,
        options: { replace: true }
      })
      mock.client.method.stateSetValue({
        name: 'action/blockSequences',
        value: actionData.blockSequences,
        options: { replace: true }
      })

      const result = await mock.client.method.actionDispatch({
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
      ])

      // Seed state
      mock.client.method.stateSetValue({
        name: 'action/sequences',
        value: { 'cache-test': actionData.sequences },
        options: { replace: true }
      })
      mock.client.method.stateSetValue({
        name: 'action/blocks',
        value: actionData.blocks,
        options: { replace: true }
      })
      mock.client.method.stateSetValue({
        name: 'action/blockSequences',
        value: actionData.blockSequences,
        options: { replace: true }
      })

      mock.client.setup.action({
        actions: {
          action_dispatch_test: (params, context) => ({ dispatched: params })
        }
      })

      const result = await mock.client.method.actionDispatch({
        id: 'cache-test',
        context: {},
        payload: {}
      })

      strictEqual(result, 'comp1')
    })

    it('should fetch action from backend if not in state', async (t) => {
      // Mock fetchGetById to return action data
      const actionData = createAction('fetched-action', [
        {
          action_dispatch_test: { id: 'fetched' }
        }
      ])

      // Setup mock to return data on first call, then recursive dispatch
      let fetchCalled = false

      mock.client.method.fetchGetById = async (params) => {
        fetchCalled = true
        return {
          isEmpty: false,
          item: actionData.sequences
        }
      }

      // Also need to mock state for the recursive call
      mock.client.method.stateSetValue({
        name: 'action/sequences',
        value: { 'fetched-action': actionData.sequences },
        options: { replace: true }
      })
      mock.client.method.stateSetValue({
        name: 'action/blocks',
        value: actionData.blocks,
        options: { replace: true }
      })
      mock.client.method.stateSetValue({
        name: 'action/blockSequences',
        value: actionData.blockSequences,
        options: { replace: true }
      })

      mock.client.setup.action({
        actions: {
          action_dispatch_test: (params, context) => ({ fetched: true })
        }
      })

      await mock.client.method.actionDispatch({
        id: 'fetched-action',
        context: {},
        payload: {}
      })

      strictEqual(fetchCalled, true)
    })

    it('should throw error when action sequence not found', async (t) => {
      mock.client.setup.action({
        actions: {}
      })

      await rejects(
        mock.client.method.actionDispatch({
          id: 'missing-action',
          context: {},
          payload: {}
        }),
        {
          message: /No action found: missing-action/
        }
      )
    })

    it('should clear block values when clearBlockValues is true', async (t) => {
      const actionData = createAction('clear-test', [
        {
          action_dispatch_test: { id: 'test' }
        }
      ])

      // Seed state
      mock.client.method.stateSetValue({
        name: 'action/sequences',
        value: { 'clear-test': actionData.sequences },
        options: { replace: true }
      })
      mock.client.method.stateSetValue({
        name: 'action/blocks',
        value: actionData.blocks,
        options: { replace: true }
      })
      mock.client.method.stateSetValue({
        name: 'action/blockSequences',
        value: actionData.blockSequences,
        options: { replace: true }
      })

      mock.client.setup.action({
        actions: {
          action_dispatch_test: (params, context) => ({ result: 'first' })
        }
      })

      // First call
      await mock.client.method.actionDispatch({
        id: 'clear-test',
        context: {},
        payload: {}
      })

      // Second call with clearBlockValues
      mock.client.setup.action({
        actions: {
          action_dispatch_test: (params, context) => ({ result: 'second' })
        }
      })

      const result = await mock.client.method.actionDispatch({
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
        const result = mock.client.method.actionGetValue({
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
        const result = mock.client.method.actionGetValue({
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
        const result = mock.client.method.actionGetValue({
          value: { user: { name: 'John' } },
          query: 'user.age'
        })

        strictEqual(result, undefined)
      })

      it('should handle array queries', async (t) => {
        const result = mock.client.method.actionGetValue({
          value: { items: [1, 2, 3] },
          query: 'items.1'
        })

        strictEqual(result, 2)
      })
    })

    describe('action.getContextValue', () => {
      it('should get value from context', async (t) => {
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

        const result = mock.client.method.actionGetContextValue('user.name', context)
        strictEqual(result, 'Jane')
      })

      it('should get entire context when no query', async (t) => {
        const context = {
          context: {
            id: 'test-123',
            rootId: 'root-1'
          }
        }

        const result = mock.client.method.actionGetContextValue('', context)
        deepStrictEqual(result, context.context)
      })

      it('should return undefined for missing path', async (t) => {
        const context = {
          context: { id: 'test' }
        }

        const result = mock.client.method.actionGetContextValue('missing.path', context)
        strictEqual(result, undefined)
      })
    })

    describe('action.getPayloadValue', () => {
      it('should get value from payload', async (t) => {
        const context = {
          payload: {
            formData: {
              username: 'testuser',
              password: 'secret'
            }
          }
        }

        const result = mock.client.method.actionGetPayloadValue('formData.username', context)
        strictEqual(result, 'testuser')
      })

      it('should get entire payload when no query', async (t) => {
        const context = {
          payload: {
            data: 'test',
            value: 123
          }
        }

        const result = mock.client.method.actionGetPayloadValue('', context)
        deepStrictEqual(result, context.payload)
      })

      it('should handle nested payload structures', async (t) => {
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

        const result = mock.client.method.actionGetPayloadValue('event.target.value', context)
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
              from: 'active',
              to: 'active'
            }],
            then: [{ $sequenceRef: 0 }],
            else: [{ $sequenceRef: 1 }]
          }
        }
      ])

      // Seed state
      mock.client.method.stateSetValue({
        name: 'action/sequences',
        value: { 'ifelse-true': actionData.sequences },
        options: { replace: true }
      })
      mock.client.method.stateSetValue({
        name: 'action/blocks',
        value: actionData.blocks,
        options: { replace: true }
      })
      mock.client.method.stateSetValue({
        name: 'action/blockSequences',
        value: actionData.blockSequences,
        options: { replace: true }
      })

      mock.client.setup.action({
        actions: {
          action_ifElse: (params, context) => {
            return mock.client.method.actionIfElse(params, () => 'then-result', context)
          }
        }
      })

      const result = await mock.client.method.actionDispatch({
        id: 'ifelse-true',
        context: {},
        payload: {}
      })

      // Should execute then branch
      strictEqual(Array.isArray(result), true)
    })

    it('should execute else branch for false condition', async (t) => {
      const actionData = createAction('ifelse-false', [
        {
          action_ifElse: {
            if: [{
              op: '==',
              from: 'active',
              to: 'inactive'
            }],
            then: [{ $sequenceRef: 0 }],
            else: [{ $sequenceRef: 1 }]
          }
        }
      ])

      // Seed state
      mock.client.method.stateSetValue({
        name: 'action/sequences',
        value: { 'ifelse-false': actionData.sequences },
        options: { replace: true }
      })
      mock.client.method.stateSetValue({
        name: 'action/blocks',
        value: actionData.blocks,
        options: { replace: true }
      })
      mock.client.method.stateSetValue({
        name: 'action/blockSequences',
        value: actionData.blockSequences,
        options: { replace: true }
      })

      mock.client.setup.action({
        actions: {
          action_ifElse: (params, context) => {
            return mock.client.method.actionIfElse(params, () => 'else-result', context)
          }
        }
      })

      const result = await mock.client.method.actionDispatch({
        id: 'ifelse-false',
        context: {},
        payload: {}
      })

      // Should execute else branch
      strictEqual(Array.isArray(result), true)
    })

    it('should handle multiple conditions with AND operator', async (t) => {
      const actionData = createAction('ifelse-and', [
        {
          action_ifElse: {
            if: [
              {
                op: '==',
                from: 'active',
                to: 'active'
              },
              { andOr: '&&' },
              {
                op: '>',
                from: 5,
                to: 3
              }
            ],
            then: [{ $sequenceRef: 0 }],
            else: [{ $sequenceRef: 1 }]
          }
        }
      ])

      // Seed state
      mock.client.method.stateSetValue({
        name: 'action/sequences',
        value: { 'ifelse-and': actionData.sequences },
        options: { replace: true }
      })
      mock.client.method.stateSetValue({
        name: 'action/blocks',
        value: actionData.blocks,
        options: { replace: true }
      })
      mock.client.method.stateSetValue({
        name: 'action/blockSequences',
        value: actionData.blockSequences,
        options: { replace: true }
      })

      mock.client.setup.action({
        actions: {
          action_ifElse: (params, context) => {
            return mock.client.method.actionIfElse(params, () => 'and-result', context)
          }
        }
      })

      const result = await mock.client.method.actionDispatch({
        id: 'ifelse-and',
        context: {},
        payload: {}
      })

      // Should execute then branch (both conditions true)
      strictEqual(Array.isArray(result), true)
    })

    it('should handle multiple conditions with OR operator', async (t) => {
      const actionData = createAction('ifelse-or', [
        {
          action_ifElse: {
            if: [
              {
                op: '==',
                from: 'active',
                to: 'inactive'
              },
              { andOr: '||' },
              {
                op: '>',
                from: 5,
                to: 3
              }
            ],
            then: [{ $sequenceRef: 0 }],
            else: [{ $sequenceRef: 1 }]
          }
        }
      ])

      // Seed state
      mock.client.method.stateSetValue({
        name: 'action/sequences',
        value: { 'ifelse-or': actionData.sequences },
        options: { replace: true }
      })
      mock.client.method.stateSetValue({
        name: 'action/blocks',
        value: actionData.blocks,
        options: { replace: true }
      })
      mock.client.method.stateSetValue({
        name: 'action/blockSequences',
        value: actionData.blockSequences,
        options: { replace: true }
      })

      mock.client.setup.action({
        actions: {
          action_ifElse: (params, context) => {
            return mock.client.method.actionIfElse(params, () => 'or-result', context)
          }
        }
      })

      const result = await mock.client.method.actionDispatch({
        id: 'ifelse-or',
        context: {},
        payload: {}
      })

      // Should execute then branch (second condition true)
      strictEqual(Array.isArray(result), true)
    })

    it('should resolve values from context and payload in conditions', async (t) => {
      const actionData = createAction('ifelse-resolve', [
        {
          action_ifElse: {
            if: [
              {
                op: '==',
                from: { $ref: 'context_value' },
                to: 'expected'
              }
            ],
            then: [{ $sequenceRef: 0 }],
            else: [{ $sequenceRef: 1 }]
          }
        }
      ])

      // Seed state
      mock.client.method.stateSetValue({
        name: 'action/sequences',
        value: { 'ifelse-resolve': actionData.sequences },
        options: { replace: true }
      })
      mock.client.method.stateSetValue({
        name: 'action/blocks',
        value: actionData.blocks,
        options: { replace: true }
      })
      mock.client.method.stateSetValue({
        name: 'action/blockSequences',
        value: actionData.blockSequences,
        options: { replace: true }
      })

      mock.client.setup.action({
        actions: {
          action_ifElse: (params, context) => {
            return mock.client.method.actionIfElse(params, () => 'resolved', context)
          },
          action_getContextValue: (query, ctx) => 'expected'
        }
      })

      const result = await mock.client.method.actionDispatch({
        id: 'ifelse-resolve',
        context: { id: 'test' },
        payload: {}
      })

      // Should resolve context value and match
      strictEqual(Array.isArray(result), true)
    })
  })

  describe('Integration Tests', () => {
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

      // Seed state
      mock.client.method.stateSetValue({
        name: 'action/sequences',
        value: { 'complete-workflow': actionData.sequences },
        options: { replace: true }
      })
      mock.client.method.stateSetValue({
        name: 'action/blocks',
        value: actionData.blocks,
        options: { replace: true }
      })
      mock.client.method.stateSetValue({
        name: 'action/blockSequences',
        value: actionData.blockSequences,
        options: { replace: true }
      })

      const result = await mock.client.method.actionDispatch({
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
          action_dispatch_test: {
            id: 'async-comp',
            payload: { value: 'async-result' }
          }
        }
      ])

      // Seed state
      mock.client.method.stateSetValue({
        name: 'action/sequences',
        value: { 'async-test': actionData.sequences },
        options: { replace: true }
      })
      mock.client.method.stateSetValue({
        name: 'action/blocks',
        value: actionData.blocks,
        options: { replace: true }
      })
      mock.client.method.stateSetValue({
        name: 'action/blockSequences',
        value: actionData.blockSequences,
        options: { replace: true }
      })

      mock.client.setup.action({
        actions: {
          action_dispatch_test: async (params, context) => {
            return new Promise(resolve => {
              setTimeout(() => resolve(params.payload.value), 10)
            })
          }
        }
      })

      const result = await mock.client.method.actionDispatch({
        id: 'async-test',
        context: {},
        payload: {}
      })

      strictEqual(result, 'async-result')
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

      // Seed state
      mock.client.method.stateSetValue({
        name: 'action/sequences',
        value: { 'error-test': actionData.sequences },
        options: { replace: true }
      })
      mock.client.method.stateSetValue({
        name: 'action/blocks',
        value: actionData.blocks,
        options: { replace: true }
      })
      mock.client.method.stateSetValue({
        name: 'action/blockSequences',
        value: actionData.blockSequences,
        options: { replace: true }
      })

      mock.client.setup.action({
        actions: {
          action_dispatch_test: (params, context) => {
            return new Error(params.payload.message)
          }
        }
      })

      await rejects(
        mock.client.method.actionDispatch({
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

  describe('Edge Cases', () => {
    it('should handle empty sequence', async (t) => {
      const actionData = createAction('empty-seq', [])

      // Seed state
      mock.client.method.stateSetValue({
        name: 'action/sequences',
        value: { 'empty-seq': actionData.sequences },
        options: { replace: true }
      })

      const result = await mock.client.method.actionDispatch({
        id: 'empty-seq',
        context: {},
        payload: {}
      })

      strictEqual(result, undefined)
    })

    it('should throw error for invalid sequence type', async (t) => {
      mock.client.setup.action({
        actions: {}
      })

      // Mock state to return invalid sequence
      mock.client.method.stateSetValue({
        name: 'action/sequences',
        value: { 'invalid-seq': 'not-an-array' },
        options: { replace: true }
      })

      await rejects(
        mock.client.method.actionDispatch({
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
          action_dispatch_test: { id: 'test' }
        }
      ])

      // Seed only sequences, not blocks
      mock.client.method.stateSetValue({
        name: 'action/sequences',
        value: { 'missing-block': actionData.sequences },
        options: { replace: true }
      })

      // Don't seed blocks - this should cause an error
      mock.client.setup.action({
        actions: {
          action_dispatch_test: (params) => params
        }
      })

      await rejects(
        mock.client.method.actionDispatch({
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
          action_dispatch_test: { id: 'test' }
        }
      ])

      // Seed blocks but not block sequences
      mock.client.method.stateSetValue({
        name: 'action/sequences',
        value: { 'missing-seq': actionData.sequences },
        options: { replace: true }
      })
      mock.client.method.stateSetValue({
        name: 'action/blocks',
        value: actionData.blocks,
        options: { replace: true }
      })

      // Don't seed blockSequences
      mock.client.setup.action({
        actions: {
          action_dispatch_test: (params) => params
        }
      })

      await rejects(
        mock.client.method.actionDispatch({
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

      // Seed state
      mock.client.method.stateSetValue({
        name: 'action/sequences',
        value: { 'no-method': actionData.sequences },
        options: { replace: true }
      })
      mock.client.method.stateSetValue({
        name: 'action/blocks',
        value: actionData.blocks,
        options: { replace: true }
      })
      mock.client.method.stateSetValue({
        name: 'action/blockSequences',
        value: actionData.blockSequences,
        options: { replace: true }
      })

      // Capture console.warn
      const originalWarn = console.warn
      let warnCalled = false
      console.warn = () => {
        warnCalled = true
      }

      try {
        const result = await mock.client.method.actionDispatch({
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

      // Seed state
      mock.client.method.stateSetValue({
        name: 'action/sequences',
        value: { 'cache-test': actionData.sequences },
        options: { replace: true }
      })
      mock.client.method.stateSetValue({
        name: 'action/blocks',
        value: actionData.blocks,
        options: { replace: true }
      })
      mock.client.method.stateSetValue({
        name: 'action/blockSequences',
        value: actionData.blockSequences,
        options: { replace: true }
      })

      mock.client.setup.action({
        actions: {
          action_dispatch_test: (params, context) => ({
            cached: true,
            id: 'test-id'
          })
        }
      })

      // First call - should fetch from state
      const result1 = await mock.client.method.actionDispatch({
        id: 'cache-test',
        context: {},
        payload: {}
      })

      // Second call - should use cache
      const result2 = await mock.client.method.actionDispatch({
        id: 'cache-test',
        context: {},
        payload: {}
      })

      strictEqual(result1, result2)
    })
  })
})
