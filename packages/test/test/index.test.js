import { describe, it } from 'node:test'
import { strictEqual, deepStrictEqual } from 'node:assert'
import { createContext, createMockState, createAction } from '../src/index.js'

describe('@dooksa/test', () => {
  describe('factories', () => {
    it('createContext should create default context', () => {
      const context = createContext()

      strictEqual(context.id, 'test-component')
      strictEqual(context.parentId, 'parent-test')
      strictEqual(context.groupId, 'group-test')
      strictEqual(context.rootId, 'root-test')
    })

    it('createContext should apply overrides', () => {
      const context = createContext({
        id: 'custom-123',
        parentId: 'custom-parent'
      })

      strictEqual(context.id, 'custom-123')
      strictEqual(context.parentId, 'custom-parent')
      strictEqual(context.groupId, 'group-test')
    })

    it('createMockState should create state object', () => {
      const state = createMockState()

      strictEqual(Array.isArray(state._defaults), true)
      strictEqual(Array.isArray(state._items), true)
      strictEqual(Array.isArray(state._names), true)
      strictEqual(typeof state._values, 'object')
    })

    it('createMockState should apply overrides', () => {
      const state = createMockState({
        _values: { test: 'value' }
      })

      deepStrictEqual(state._values, { test: 'value' })
    })

    it('createAction should compile action', () => {
      const action = createAction('test-action', [
        {
          $id: 'step1',
          variable_getValue: { query: 'data' }
        }
      ])

      strictEqual(action.id, 'test-action')
      strictEqual(Array.isArray(action.sequences), true)
      strictEqual(typeof action.blocks, 'object')
    })
  })
})
