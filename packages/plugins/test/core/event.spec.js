import { describe, it, afterEach } from 'node:test'
import { strictEqual, deepStrictEqual, ok } from 'node:assert'
import { event, state, action, eventEmit } from '#core'
import { createState, hydrateActionState } from '../helpers/index.js'
import { createAction } from '@dooksa/create-action'

/**
 * Helper function to create state data
 * @returns {Object} State data object
 */
function createStateData () {
  return createState([event, action, state])
}

describe('Event Plugin', () => {
  afterEach(() => {
    state.restore()
    action.restore()
  })

  describe('Initialization', () => {
    it('should have correct metadata', (t) => {
      strictEqual(event.metadata.title, 'Event')
      strictEqual(event.metadata.description, 'Event manager')
      strictEqual(event.metadata.icon, 'mdi:fire')
    })

    it('should have correct state schema', (t) => {
      const listenersSchema = event.state.schema.listeners
      const handlersSchema = event.state.schema.handlers

      ok(listenersSchema, 'Listeners schema should exist')
      strictEqual(listenersSchema.type, 'collection')
      strictEqual(listenersSchema.items.type, 'array')
      strictEqual(listenersSchema.items.items.type, 'string')
      strictEqual(listenersSchema.items.items.relation, 'action/items')

      ok(handlersSchema, 'Handlers schema should exist')
      strictEqual(handlersSchema.type, 'collection')
      strictEqual(handlersSchema.items.type, 'array')
      strictEqual(handlersSchema.uniqueItems, true)
    })

    it('should verify eventEmit is exported correctly', (t) => {
      strictEqual(typeof eventEmit, 'function')
    })
  })

  describe('Event Emission', () => {
    it('should return empty array if no listeners found', async (t) => {
      const stateData = createStateData()
      state.setup(stateData)
      action.setup({ actions: {} })

      const result = await Promise.all(eventEmit({
        name: 'click',
        id: 'btn1'
      }))

      deepStrictEqual(result, [])
    })

    it('should return empty array if listeners array is empty', async (t) => {
      const stateData = createStateData()
      state.setup(stateData)
      action.setup({ actions: {} })

      // Register empty listener array
      state.stateSetValue({
        name: 'event/listeners',
        value: [],
        options: {
          id: 'btn1',
          prefixId: 'click'
        }
      })

      const result = await Promise.all(eventEmit({
        name: 'click',
        id: 'btn1'
      }))

      deepStrictEqual(result, [])
    })

    it('should trigger action for registered listener', async (t) => {
      const stateData = createStateData()
      state.setup(stateData)

      // Mock action method
      const mockActionMethod = t.mock.fn((params, context) => {
        return params
      })

      // Create action definition
      const actionData = createAction('my_action', [
        {
          my_action_method: {
            test: 'value'
          }
        }
      ], { my_action_method: true })

      // Seed state with action definition
      hydrateActionState(actionData)

      // Setup action plugin with the method implementation
      action.setup({
        actions: {
          my_action_method: mockActionMethod
        }
      })

      // Register listener
      state.stateSetValue({
        name: 'event/listeners',
        value: ['my_action'],
        options: {
          id: 'btn1',
          prefixId: 'click'
        }
      })

      // Emit event
      const payload = { value: 'test' }
      const context = { user: 'user1' }

      await Promise.all(eventEmit({
        name: 'click',
        id: 'btn1',
        payload,
        context
      }))

      // Verify action method was called
      strictEqual(mockActionMethod.mock.callCount(), 1)
      const callArgs = mockActionMethod.mock.calls[0].arguments

      // Check that params passed to method match block definition
      strictEqual(callArgs[0].test, 'value')

      // Check context and payload are passed in the second argument (context object)
      deepStrictEqual(callArgs[1].payload, payload)
      deepStrictEqual(callArgs[1].context, context)
    })

    it('should trigger multiple actions for same listener', async (t) => {
      const stateData = createStateData()
      state.setup(stateData)

      const action1Method = t.mock.fn()
      const action2Method = t.mock.fn()

      // Create action definitions
      const action1Data = createAction('action1', [
        { method1: {} }
      ], { method1: true })

      const action2Data = createAction('action2', [
        { method2: {} }
      ], { method2: true })

      // Seed state
      hydrateActionState([action1Data, action2Data])

      action.setup({
        actions: {
          method1: action1Method,
          method2: action2Method
        }
      })

      state.stateSetValue({
        name: 'event/listeners',
        value: ['action1', 'action2'],
        options: {
          id: 'btn1',
          prefixId: 'click'
        }
      })

      await Promise.all(eventEmit({
        name: 'click',
        id: 'btn1'
      }))

      strictEqual(action1Method.mock.callCount(), 1)
      strictEqual(action2Method.mock.callCount(), 1)
    })

    it('should handle different event names for same element id', async (t) => {
      const stateData = createStateData()
      state.setup(stateData)

      const clickMethod = t.mock.fn()
      const hoverMethod = t.mock.fn()

      const clickActionData = createAction('clickAction', [
        { clickMethod: {} }
      ], { clickMethod: true })

      const hoverActionData = createAction('hoverAction', [
        { hoverMethod: {} }
      ], { hoverMethod: true })

      hydrateActionState([clickActionData, hoverActionData])

      action.setup({
        actions: {
          clickMethod,
          hoverMethod
        }
      })

      // Register click listener
      state.stateSetValue({
        name: 'event/listeners',
        value: ['clickAction'],
        options: {
          id: 'btn1',
          prefixId: 'click'
        }
      })

      // Register hover listener
      state.stateSetValue({
        name: 'event/listeners',
        value: ['hoverAction'],
        options: {
          id: 'btn1',
          prefixId: 'hover'
        }
      })

      // Emit click
      await Promise.all(eventEmit({
        name: 'click',
        id: 'btn1'
      }))

      strictEqual(clickMethod.mock.callCount(), 1)
      strictEqual(hoverMethod.mock.callCount(), 0)

      // Emit hover
      await Promise.all(eventEmit({
        name: 'hover',
        id: 'btn1'
      }))

      strictEqual(clickMethod.mock.callCount(), 1)
      strictEqual(hoverMethod.mock.callCount(), 1)
    })

    it('should handle different element ids for same event name', async (t) => {
      const stateData = createStateData()
      state.setup(stateData)

      const btn1Method = t.mock.fn()
      const btn2Method = t.mock.fn()

      const btn1ActionData = createAction('btn1Action', [
        { btn1Method: {} }
      ], { btn1Method: true })

      const btn2ActionData = createAction('btn2Action', [
        { btn2Method: {} }
      ], { btn2Method: true })

      hydrateActionState([btn1ActionData, btn2ActionData])

      action.setup({
        actions: {
          btn1Method,
          btn2Method
        }
      })

      state.stateSetValue({
        name: 'event/listeners',
        value: ['btn1Action'],
        options: {
          id: 'btn1',
          prefixId: 'click'
        }
      })

      state.stateSetValue({
        name: 'event/listeners',
        value: ['btn2Action'],
        options: {
          id: 'btn2',
          prefixId: 'click'
        }
      })

      // Emit for btn1
      await Promise.all(eventEmit({
        name: 'click',
        id: 'btn1'
      }))

      strictEqual(btn1Method.mock.callCount(), 1)
      strictEqual(btn2Method.mock.callCount(), 0)
    })
  })
})
