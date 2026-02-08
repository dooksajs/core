import { describe, it, beforeEach, afterEach } from 'node:test'
import { strictEqual, ok } from 'node:assert'
import { createState, hydrateActionState, getDefaultActions } from '#test'
import { createPlugin } from '@dooksa/create-plugin'
import { action, state, variable } from '#core'
import variableContextId from '../src/variable/variable-context-id.js'

const componentPlugin = createPlugin('component', {
  state: {
    schema: {
      belongsToScopes: {
        type: 'collection',
        items: {
          type: 'array',
          items: { type: 'string' }
        }
      }
    }
  }
})

describe('variable-context-id action integration', function () {
  beforeEach(function () {
    const stateData = createState([action, variable, state, componentPlugin])
    state.setup(stateData)

    hydrateActionState(variableContextId)

    action.setup({
      actions: getDefaultActions(action, [variable])
    })
  })

  afterEach(function () {
    state.restore()
    variable.restore()
    action.restore()
  })

  it('should set variable with context id in specified group scope', async function () {
    // Setup context with groupId and id
    const context = {
      groupId: 'group-123',
      id: 'component-456'
    }

    // Dispatch the action
    await action.actionDispatch({
      id: variableContextId.id,
      context
    })

    // Verify the variable was set correctly
    const variableValues = state.stateGetValue({
      name: 'variable/values',
      id: 'group-123'
    })

    strictEqual(variableValues.item['variable_context_id'], 'component-456')
  })

  it('should handle different context values', async function () {
    const context = {
      groupId: 'group-abc',
      id: 'element-xyz'
    }

    await action.actionDispatch({
      id: variableContextId.id,
      context
    })

    const variableValues = await state.stateGetValue({
      name: 'variable/values',
      id: 'group-abc'
    })

    strictEqual(variableValues.item['variable_context_id'], 'element-xyz')
  })

  it('should merge with existing variables in the same scope', async function () {
    // Pre-populate the scope with existing variables
    state.stateSetValue({
      name: 'variable/values',
      value: { existing_var: 'existing_value' },
      options: { id: 'group-merge' }
    })

    const context = {
      groupId: 'group-merge',
      id: 'new-value'
    }

    await action.actionDispatch({
      id: variableContextId.id,
      context
    })

    const variableValues = state.stateGetValue({
      name: 'variable/values',
      id: 'group-merge'
    })

    // Should have both the existing and new variable
    strictEqual(variableValues.item['existing_var'], 'existing_value')
    strictEqual(variableValues.item['variable_context_id'], 'new-value')
  })

  it('should handle empty string context values', async function () {
    const context = {
      groupId: 'group-empty',
      id: ''
    }

    await action.actionDispatch({
      id: variableContextId.id,
      context
    })

    const variableValues = state.stateGetValue({
      name: 'variable/values',
      id: 'group-empty'
    })

    strictEqual(variableValues.item['variable_context_id'], '')
  })

  it('should handle null context values', async function () {
    const context = {
      groupId: 'group-null',
      id: null
    }

    await action.actionDispatch({
      id: variableContextId.id,
      context
    })

    const variableValues = state.stateGetValue({
      name: 'variable/values',
      id: 'group-null'
    })

    strictEqual(variableValues.item['variable_context_id'], null)
  })

  it('should handle undefined context values', async function () {
    const context = {
      groupId: 'group-undefined',
      id: undefined
    }

    await action.actionDispatch({
      id: variableContextId.id,
      context
    })

    const variableValues = state.stateGetValue({
      name: 'variable/values',
      id: 'group-undefined'
    })

    strictEqual(variableValues.item['variable_context_id'], undefined)
  })

  it('should verify action structure is correct', function () {
    // Verify the compiled action has the expected structure
    strictEqual(variableContextId.id, 'variable-context-id')
    ok(Array.isArray(variableContextId.sequences))
    ok(typeof variableContextId.blocks === 'object')
    ok(typeof variableContextId.blockSequences === 'object')

    // Should have at least one sequence
    strictEqual(variableContextId.sequences.length, 1)
  })
})
