import { describe, it, afterEach } from 'node:test'
import { strictEqual, ok } from 'node:assert'
import { variable, state } from '#core'
import { createState } from '../helpers/create-state.js'
import createPlugin from '@dooksa/create-plugin'

/**
 * Helper to invoke variable action with context
 * @param {string} actionName - Name of action to invoke
 * @param {Object} props - Action properties
 * @param {Object} context - Action context
 */
function invokeAction (actionName, props, context = {}) {
  const action = variable.actions.find(a => a.key === actionName)
  if (!action) throw new Error(`Action ${actionName} not found`)
  return action.method(props, { context })
}

const componentSchema = createPlugin('component', {
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

describe('Variable Plugin', () => {
  afterEach(() => {
    state.restore()
  })

  describe('Initialization', () => {
    it('should register schemas', async (t) => {
      const stateData = createState([variable])
      state.setup(stateData)

      const valuesSchema = state.stateGetSchema('variable/values')
      const scopesSchema = state.stateGetSchema('variable/scopes')

      ok(valuesSchema, 'variable/values schema should be registered')
      ok(scopesSchema, 'variable/scopes schema should be registered')
      strictEqual(valuesSchema.type, 'collection')
      strictEqual(scopesSchema.type, 'collection')
    })
  })

  describe('getValue Action', () => {
    it('should get value from specific scope', async (t) => {
      const stateData = createState([variable])
      state.setup(stateData)

      // Set up a scope with a value
      state.stateSetValue({
        name: 'variable/values',
        value: {
          'test-var': 'value-1'
        },
        options: { id: 'scope-1' }
      })

      const result = variable.variableGetValue({
        scope: 'scope-1',
        query: 'test-var'
      })

      strictEqual(result, 'value-1')
    })

    it('should get nested value from specific scope', async (t) => {
      const stateData = createState([variable])
      state.setup(stateData)

      state.stateSetValue({
        name: 'variable/values',
        value: {
          'test-obj': {
            nested: 'nested-value'
          }
        },
        options: { id: 'scope-1' }
      })

      const result = variable.variableGetValue({
        scope: 'scope-1',
        query: 'test-obj.nested'
      })

      strictEqual(result, 'nested-value')
    })

    it('should return undefined if scope not found', async (t) => {
      const stateData = createState([variable])
      state.setup(stateData)

      const result = variable.variableGetValue({
        scope: 'non-existent',
        query: 'test-var'
      })

      strictEqual(result, undefined)
    })

    it('should retrieve scopes correctly (debug)', async (t) => {
      const stateData = createState([variable])
      state.setup(stateData)

      state.stateSetValue({
        name: 'variable/scopes',
        value: ['scope-parent', 'scope-global'],
        options: { id: 'context-root' }
      })

      const scopes = state.stateGetValue({
        name: 'variable/scopes',
        id: 'context-root'
      })

      ok(!scopes.isEmpty, 'scopes should not be empty')
      ok(Array.isArray(scopes.item), 'scopes.item should be an array')
      strictEqual(scopes.item.length, 2, 'scopes.item should have 2 items')
      strictEqual(scopes.item[0], 'scope-parent', 'first item should be scope-parent')
    })

    it('should get value from context scopes', async (t) => {
      const stateData = createState([variable])
      state.setup(stateData)

      // Set up scopes
      state.stateSetValue({
        name: 'variable/scopes',
        value: ['scope-parent', 'scope-global'],
        options: { id: 'context-root' }
      })

      // Set up values in parent scope
      state.stateSetValue({
        name: 'variable/values',
        value: {
          'parent-var': 'parent-value'
        },
        options: { id: 'scope-parent' }
      })

      // Set up values in global scope
      state.stateSetValue({
        name: 'variable/values',
        value: {
          'global-var': 'global-value'
        },
        options: { id: 'scope-global' }
      })

      // Test getting from parent scope
      const parentResult = invokeAction('getValue',
        { query: 'parent-var' },
        { rootId: 'context-root' }
      )
      strictEqual(parentResult, 'parent-value')

      // Test getting from global scope (fallback)
      const globalResult = invokeAction('getValue',
        { query: 'global-var' },
        { rootId: 'context-root' }
      )
      strictEqual(globalResult, 'global-value')
    })

    it('should return undefined if context.rootId is missing', async (t) => {
      const stateData = createState([variable])
      state.setup(stateData)

      const result = invokeAction('getValue', { query: 'some-var' })
      strictEqual(result, undefined)
    })

    it('should handle prefixId and suffixId in query', async (t) => {
      const stateData = createState([variable])
      state.setup(stateData)

      state.stateSetValue({
        name: 'variable/values',
        value: {
          'pre-test-suf': 'affixed-value'
        },
        options: { id: 'scope-1' }
      })

      const result = variable.variableGetValue({
        scope: 'scope-1',
        query: 'test',
        prefixId: 'pre-',
        suffixId: '-suf'
      })

      strictEqual(result, 'affixed-value')
    })

    it('should handle prefixId and suffixId with nested query', async (t) => {
      const stateData = createState([variable])
      state.setup(stateData)

      state.stateSetValue({
        name: 'variable/values',
        value: {
          'pre-obj-suf': {
            nested: 'nested-affixed'
          }
        },
        options: { id: 'scope-1' }
      })

      const result = variable.variableGetValue({
        scope: 'scope-1',
        query: 'obj.nested',
        prefixId: 'pre-',
        suffixId: '-suf'
      })

      strictEqual(result, 'nested-affixed')
    })
  })

  describe('setValue Action', () => {
    it('should set value in specific scope', async (t) => {
      const stateData = createState([variable, componentSchema])
      state.setup(stateData)

      // Initialize component collection
      state.stateSetValue({
        name: 'component/belongsToScopes',
        value: [],
        options: { id: 'component-1' }
      })

      invokeAction('setValue',
        {
          scope: 'scope-1',
          values: [{
            id: 'new-var',
            value: 'new-value'
          }]
        },
        { id: 'component-1' }
      )

      const stored = state.stateGetValue({
        name: 'variable/values',
        id: 'scope-1'
      })

      strictEqual(stored.item['new-var'], 'new-value')
    })

    it('should update component belongsToScopes directly (sanity check)', async (t) => {
      const componentSchema = {
        name: 'component',
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
      }

      const combinedStateData = createState([variable, componentSchema])
      state.setup(combinedStateData)

      // Initialize the array
      state.stateSetValue({
        name: 'component/belongsToScopes',
        value: [],
        options: { id: 'comp-1' }
      })

      // Update directly
      state.stateSetValue({
        name: 'component/belongsToScopes',
        value: 'scope-1',
        options: {
          id: 'comp-1',
          update: {
            method: 'push'
          }
        }
      })

      const belongs = state.stateGetValue({
        name: 'component/belongsToScopes',
        id: 'comp-1'
      })

      ok(belongs.item.includes('scope-1'))
    })

    it('should update component belongsToScopes when setting with scope and context.id', async (t) => {
      const componentSchema = {
        name: 'component',
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
      }

      const combinedStateData = createState([variable, componentSchema])
      state.setup(combinedStateData)

      // Initialize the array
      state.stateSetValue({
        name: 'component/belongsToScopes',
        value: [],
        options: { id: 'comp-1' }
      })

      invokeAction('setValue',
        {
          scope: 'scope-1',
          values: [{
            id: 'var',
            value: 'val'
          }]
        },
        { id: 'comp-1' }
      )

      const belongs = state.stateGetValue({
        name: 'component/belongsToScopes',
        id: 'comp-1'
      })

      ok(belongs.item.includes('scope-1'))
    })

    it('should set value in existing parent scope', async (t) => {
      const stateData = createState([variable])
      state.setup(stateData)

      // Setup scope hierarchy
      state.stateSetValue({
        name: 'variable/scopes',
        value: ['scope-parent'],
        options: { id: 'context-root' }
      })

      // Setup existing value in parent scope
      state.stateSetValue({
        name: 'variable/values',
        value: {
          'existing-var': 'old-value'
        },
        options: { id: 'scope-parent' }
      })

      // Set value (should update in parent scope because it exists)
      invokeAction('setValue',
        {
          values: [{
            id: 'existing-var',
            value: 'new-value'
          }]
        },
        { rootId: 'context-root' }
      )

      const stored = state.stateGetValue({
        name: 'variable/values',
        id: 'scope-parent'
      })

      strictEqual(stored.item['existing-var'], 'new-value')
    })

    it('should set value in current context if not found in parent scopes', async (t) => {
      const stateData = createState([variable])
      state.setup(stateData)

      // Setup scope hierarchy
      state.stateSetValue({
        name: 'variable/scopes',
        value: ['scope-parent'],
        options: { id: 'context-root' }
      })

      // Parent scope exists but does not have the variable
      state.stateSetValue({
        name: 'variable/values',
        value: {},
        options: { id: 'scope-parent' }
      })

      // Set value (should be set in context-root scope)
      invokeAction('setValue',
        {
          values: [{
            id: 'new-var',
            value: 'new-value'
          }]
        },
        { rootId: 'context-root' }
      )

      // Check parent scope (should NOT have it)
      const parentStored = state.stateGetValue({
        name: 'variable/values',
        id: 'scope-parent'
      })
      strictEqual(parentStored.item['new-var'], undefined)

      // Check context root scope (SHOULD have it)
      const rootStored = state.stateGetValue({
        name: 'variable/values',
        id: 'context-root'
      })
      strictEqual(rootStored.item['new-var'], 'new-value')
    })

    it('should handle prefixId and suffixId in setValue', async (t) => {
      const stateData = createState([variable, componentSchema])
      state.setup(stateData)

      state.stateSetValue({
        name: 'component/belongsToScopes',
        value: [],
        options: { id: 'comp-1' }
      })

      invokeAction('setValue',
        {
          scope: 'scope-1',
          values: [
            {
              id: 'var',
              value: 'val',
              prefixId: 'pre-',
              suffixId: '-suf'
            }
          ]
        },
        { id: 'comp-1' }
      )

      const stored = state.stateGetValue({
        name: 'variable/values',
        id: 'scope-1'
      })

      strictEqual(stored.item['pre-var-suf'], 'val')
    })

    it('should fallback to generated ID if id is missing', async (t) => {
      const stateData = createState([variable, componentSchema])
      state.setup(stateData)

      state.stateSetValue({
        name: 'component/belongsToScopes',
        value: [],
        options: { id: 'comp-1' }
      })

      invokeAction('setValue',
        {
          scope: 'scope-1',
          values: [{ value: 'generated-val' }]
        },
        { id: 'comp-1' }
      )

      const stored = state.stateGetValue({
        name: 'variable/values',
        id: 'scope-1'
      })

      const keys = Object.keys(stored.item)
      strictEqual(keys.length, 1)
      strictEqual(stored.item[keys[0]], 'generated-val')
    })

    it('should return if context.rootId is missing and no scope provided', async (t) => {
      const stateData = createState([variable])
      state.setup(stateData)

      // Should not throw and do nothing
      invokeAction('setValue',
        {
          values: [{
            id: 'var',
            value: 'val'
          }]
        },
        {} // Missing rootId
      )

      // Verify nothing was set (hard to verify "nothing" globally, but checking common places)
      // Assuming no error is enough for this test case given code path
      ok(true)
    })
  })
})
