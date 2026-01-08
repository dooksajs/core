import { describe, it, beforeEach, afterEach } from 'node:test'
import { strictEqual, deepStrictEqual, ok } from 'node:assert'
import variableContextId from '../src/variable/variable-context-id.js'
import { mockClientPlugin } from '@dooksa/test'

describe('variable-context-id action integration', function () {
  let mock

  beforeEach(async function () {
    // Mock action, variable, and component plugins
    mock = await mockClientPlugin(this, {
      name: 'variable',
      modules: ['action', 'variable']
    })

    // Register the compiled action in the action state using unsafeSetValue
    // to bypass schema validation during setup
    mock.method.stateSetValue({
      name: 'action/sequences',
      value: variableContextId.sequences,
      options: { id: 'variable-context-id' }
    })

    // Register all blocks
    for (const [blockId, block] of Object.entries(variableContextId.blocks)) {
      mock.method.stateSetValue({
        name: 'action/blocks',
        value: block,
        options: { id: blockId }
      })
    }

    // Register all block sequences
    for (const [sequenceId, blockSequence] of Object.entries(variableContextId.blockSequences)) {
      mock.method.stateSetValue({
        name: 'action/blockSequences',
        value: blockSequence,
        options: { id: sequenceId }
      })
    }
  })

  afterEach(function () {
    if (mock) {
      mock.restore()
    }
  })

  it('should set variable with context id in specified group scope', async function (t) {
    // Setup context with groupId and id
    const context = {
      groupId: 'group-123',
      id: 'component-456'
    }

    // Dispatch the action
    await mock.method.actionDispatch({
      id: 'variable-context-id',
      context
    })

    // Verify the variable was set correctly
    const variableValues = mock.method.stateGetValue({
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

    await mock.method.actionDispatch({
      id: 'variable-context-id',
      context
    })

    const variableValues = await mock.method.stateGetValue({
      name: 'variable/values',
      id: 'group-abc'
    })

    strictEqual(variableValues.item['variable_context_id'], 'element-xyz')
  })

  it('should merge with existing variables in the same scope', async function () {
    // Pre-populate the scope with existing variables
    mock.method.stateSetValue({
      name: 'variable/values',
      value: { existing_var: 'existing_value' },
      options: { id: 'group-merge' }
    })

    const context = {
      groupId: 'group-merge',
      id: 'new-value'
    }

    await mock.method.actionDispatch({
      id: 'variable-context-id',
      context
    })

    const variableValues = mock.method.stateGetValue({
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

    await mock.method.actionDispatch({
      id: 'variable-context-id',
      context
    })

    const variableValues = mock.method.stateGetValue({
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

    await mock.method.actionDispatch({
      id: 'variable-context-id',
      context
    })

    const variableValues = mock.method.stateGetValue({
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

    await mock.method.actionDispatch({
      id: 'variable-context-id',
      context
    })

    const variableValues = mock.method.stateGetValue({
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
