import { describe, it } from 'node:test'
import { strictEqual, deepStrictEqual, ok } from 'node:assert'
import { createPluginTester, mockStateData } from '@dooksa/test'
import { variable, state } from '#core'
import { component } from '#client'

/**
 * Helper function to set up the variable plugin with dependencies
 * @param {import('node:test').TestContext} t - Test context
 * @param {Object} [options] - Configuration object
 * @param {Object} [options.state] - State data to seed
 * @returns {Object} Object with tester, variable plugin instance, and state helpers
 */
function setupVariablePlugin (t, options = {
  state: []
}) {
  const tester = createPluginTester(t)

  // Create observable instances of required plugins
  const statePlugin = tester.spy('state', state)
  const variablePlugin = tester.spy('variable', variable)

  const stateData = mockStateData([variable, component])

  statePlugin.setup(stateData)

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
    variablePlugin,
    statePlugin
  }
}

describe('Variable plugin - getValue action', () => {
  describe('Direct scope access', () => {
    it('should get value from specific scope', async (t) => {
      const { tester, variablePlugin, statePlugin } = setupVariablePlugin(t)

      // Setup state with variable values in a scope
      statePlugin.stateSetValue({
        name: 'variable/values',
        value: {
          'test-var': 'test-value'
        },
        options: {
          id: 'scope-1'
        }
      })

      const result = variablePlugin.variableGetValue({
        scope: 'scope-1',
        query: 'test-var'
      }, { context: {} })

      strictEqual(result, 'test-value')

      tester.restoreAll()
    })

    it('should get nested value using dot notation', async (t) => {
      const { tester, variablePlugin, statePlugin } = setupVariablePlugin(t)

      statePlugin.stateSetValue({
        name: 'variable/values',
        value: {
          user: {
            profile: {
              name: 'John Doe'
            }
          }
        },
        options: {
          id: 'scope-1'
        }
      })

      const result = variablePlugin.variableGetValue({
        scope: 'scope-1',
        query: 'user.profile.name'
      }, { context: {} })

      strictEqual(result, 'John Doe')

      tester.restoreAll()
    })

    it('should apply prefix to query', async (t) => {
      const { tester, variablePlugin, statePlugin } = setupVariablePlugin(t)

      statePlugin.stateSetValue({
        name: 'variable/values',
        value: {
          'prefix_test-var': 'prefixed-value'
        },
        options: {
          id: 'scope-1'
        }
      })

      const result = variablePlugin.variableGetValue({
        scope: 'scope-1',
        query: 'test-var',
        prefixId: 'prefix_'
      }, { context: {} })

      strictEqual(result, 'prefixed-value')

      tester.restoreAll()
    })

    it('should apply suffix to query', async (t) => {
      const { tester, variablePlugin, statePlugin } = setupVariablePlugin(t)

      statePlugin.stateSetValue({
        name: 'variable/values',
        value: {
          'test-var_suffix': 'suffixed-value'
        },
        options: {
          id: 'scope-1'
        }
      })

      const result = variablePlugin.variableGetValue({
        scope: 'scope-1',
        query: 'test-var',
        suffixId: '_suffix'
      }, { context: {} })

      strictEqual(result, 'suffixed-value')

      tester.restoreAll()
    })

    it('should apply both prefix and suffix to query', async (t) => {
      const { tester, variablePlugin, statePlugin } = setupVariablePlugin(t)

      statePlugin.stateSetValue({
        name: 'variable/values',
        value: {
          'prefix_test-var_suffix': 'combined-value'
        },
        options: {
          id: 'scope-1'
        }
      })

      const result = variablePlugin.variableGetValue({
        scope: 'scope-1',
        query: 'test-var',
        prefixId: 'prefix_',
        suffixId: '_suffix'
      }, { context: {} })

      strictEqual(result, 'combined-value')

      tester.restoreAll()
    })

    it('should return undefined when scope is empty', async (t) => {
      const { tester, variablePlugin, statePlugin } = setupVariablePlugin(t)

      statePlugin.stateSetValue({
        name: 'variable/values',
        value: {},
        options: {
          id: 'empty-scope'
        }
      })

      const result = variablePlugin.variableGetValue({
        scope: 'empty-scope',
        query: 'any-var'
      }, { context: {} })

      strictEqual(result, undefined)

      tester.restoreAll()
    })

    it('should return undefined when scope does not exist', async (t) => {
      const { tester, variablePlugin } = setupVariablePlugin(t)

      const result = variablePlugin.variableGetValue({
        scope: 'non-existent-scope',
        query: 'any-var'
      }, { context: {} })

      strictEqual(result, undefined)

      tester.restoreAll()
    })
  })

  describe('Scope search', () => {
    it('should search through multiple scopes when no scope specified', async (t) => {
      const { tester, variablePlugin, statePlugin } = setupVariablePlugin(t)

      // Setup scopes for root context
      statePlugin.stateSetValue({
        name: 'variable/scopes',
        value: ['scope-1', 'scope-2', 'scope-3'],
        options: {
          id: 'root-context'
        }
      })

      // Setup values in different scopes
      statePlugin.stateSetValue({
        name: 'variable/values',
        value: {
          'var-a': 'value-a'
        },
        options: {
          id: 'scope-1'
        }
      })

      statePlugin.stateSetValue({
        name: 'variable/values',
        value: {
          'var-b': 'value-b'
        },
        options: {
          id: 'scope-2'
        }
      })

      statePlugin.stateSetValue({
        name: 'variable/values',
        value: {
          'var-c': 'value-c'
        },
        options: {
          id: 'scope-3'
        }
      })

      // Should find first matching variable
      const result = variablePlugin.variableGetValue({
        query: 'var-b'
      }, { context: { rootId: 'root-context' } })

      strictEqual(result, 'value-b')

      tester.restoreAll()
    })

    it('should return first found value when searching scopes', async (t) => {
      const { tester, variablePlugin, statePlugin } = setupVariablePlugin(t)

      statePlugin.stateSetValue({
        name: 'variable/scopes',
        value: ['scope-1', 'scope-2'],
        options: {
          id: 'root-context'
        }
      })

      // Both scopes have the same variable name
      statePlugin.stateSetValue({
        name: 'variable/values',
        value: {
          'shared-var': 'first-value'
        },
        options: {
          id: 'scope-1'
        }
      })

      statePlugin.stateSetValue({
        name: 'variable/values',
        value: {
          'shared-var': 'second-value'
        },
        options: {
          id: 'scope-2'
        }
      })

      const result = variablePlugin.variableGetValue({
        query: 'shared-var'
      }, { context: { rootId: 'root-context' } })

      // Should return first found
      strictEqual(result, 'first-value')

      tester.restoreAll()
    })

    it('should search through scopes with prefix and suffix', async (t) => {
      const { tester, variablePlugin, statePlugin } = setupVariablePlugin(t)

      statePlugin.stateSetValue({
        name: 'variable/scopes',
        value: ['scope-1'],
        options: {
          id: 'root-context'
        }
      })

      statePlugin.stateSetValue({
        name: 'variable/values',
        value: {
          'prefix_test-var_suffix': 'found-value'
        },
        options: {
          id: 'scope-1'
        }
      })

      const result = variablePlugin.variableGetValue({
        query: 'test-var',
        prefixId: 'prefix_',
        suffixId: '_suffix'
      }, { context: { rootId: 'root-context' } })

      strictEqual(result, 'found-value')

      tester.restoreAll()
    })

    it('should return undefined when variable not found in any scope', async (t) => {
      const { tester, variablePlugin, statePlugin } = setupVariablePlugin(t)

      statePlugin.stateSetValue({
        name: 'variable/scopes',
        value: ['scope-1', 'scope-2'],
        options: {
          id: 'root-context'
        }
      })

      statePlugin.stateSetValue({
        name: 'variable/values',
        value: {
          'var-a': 'value-a'
        },
        options: {
          id: 'scope-1'
        }
      })

      const result = variablePlugin.variableGetValue({
        query: 'non-existent-var'
      }, { context: { rootId: 'root-context' } })

      strictEqual(result, undefined)

      tester.restoreAll()
    })

    it('should handle empty scopes array', async (t) => {
      const { tester, variablePlugin, statePlugin } = setupVariablePlugin(t)

      statePlugin.stateSetValue({
        name: 'variable/scopes',
        value: [],
        options: {
          id: 'root-context'
        }
      })

      const result = variablePlugin.variableGetValue({
        query: 'any-var'
      }, { context: { rootId: 'root-context' } })

      strictEqual(result, undefined)

      tester.restoreAll()
    })

    it('should return undefined when context.rootId is not provided', async (t) => {
      const { tester, variablePlugin } = setupVariablePlugin(t)

      const result = variablePlugin.variableGetValue({
        query: 'any-var'
      }, { context: {} })

      strictEqual(result, undefined)

      tester.restoreAll()
    })
  })

  describe('Edge cases', () => {
    it('should handle complex nested queries', async (t) => {
      const { tester, variablePlugin, statePlugin } = setupVariablePlugin(t)

      statePlugin.stateSetValue({
        name: 'variable/values',
        value: {
          data: {
            items: [
              {
                id: 1,
                name: 'Item 1'
              },
              {
                id: 2,
                name: 'Item 2'
              }
            ]
          }
        },
        options: {
          id: 'scope-1'
        }
      })

      const result = variablePlugin.variableGetValue({
        scope: 'scope-1',
        query: 'data.items.1.name'
      }, { context: {} })

      strictEqual(result, 'Item 2')

      tester.restoreAll()
    })

    it('should handle array values in state', async (t) => {
      const { tester, variablePlugin, statePlugin } = setupVariablePlugin(t)

      statePlugin.stateSetValue({
        name: 'variable/values',
        value: {
          'array-var': ['a', 'b', 'c']
        },
        options: {
          id: 'scope-1'
        }
      })

      const result = variablePlugin.variableGetValue({
        scope: 'scope-1',
        query: 'array-var.1'
      }, { context: {} })

      strictEqual(result, 'b')

      tester.restoreAll()
    })

    it('should handle null values in state', async (t) => {
      const { tester, variablePlugin, statePlugin } = setupVariablePlugin(t)

      statePlugin.stateSetValue({
        name: 'variable/values',
        value: {
          'null-var': null
        },
        options: {
          id: 'scope-1'
        }
      })

      const result = variablePlugin.variableGetValue({
        scope: 'scope-1',
        query: 'null-var'
      }, { context: {} })

      strictEqual(result, null)

      tester.restoreAll()
    })

    it('should handle undefined values in state', async (t) => {
      const { tester, variablePlugin, statePlugin } = setupVariablePlugin(t)

      statePlugin.stateSetValue({
        name: 'variable/values',
        value: {
          'undefined-var': undefined
        },
        options: {
          id: 'scope-1'
        }
      })

      const result = variablePlugin.variableGetValue({
        scope: 'scope-1',
        query: 'undefined-var'
      }, { context: {} })

      strictEqual(result, undefined)

      tester.restoreAll()
    })

    it('should handle missing nested property', async (t) => {
      const { tester, variablePlugin, statePlugin } = setupVariablePlugin(t)

      statePlugin.stateSetValue({
        name: 'variable/values',
        value: {
          user: {
            name: 'John'
          }
        },
        options: {
          id: 'scope-1'
        }
      })

      const result = variablePlugin.variableGetValue({
        scope: 'scope-1',
        query: 'user.profile.name'
      }, { context: {} })

      strictEqual(result, undefined)

      tester.restoreAll()
    })
  })
})

describe('Variable plugin - setValue action', () => {
  describe('Direct scope access', () => {
    it('should set value in specific scope', async (t) => {
      const { tester, variablePlugin, statePlugin } = setupVariablePlugin(t)

      variablePlugin.variableSetValue({
        scope: 'scope-1',
        values: [
          {
            id: 'var-1',
            value: 'test-value'
          }
        ]
      }, { context: { id: 'component-1' } })

      // Verify state was set
      const values = statePlugin.stateGetValue({
        name: 'variable/values',
        id: 'scope-1'
      })

      strictEqual(values.item['var-1'], 'test-value')

      tester.restoreAll()
    })

    it('should generate ID automatically when not provided', async (t) => {
      const { tester, variablePlugin, statePlugin } = setupVariablePlugin(t)

      // Clear any existing values in scope-1
      statePlugin.stateSetValue({
        name: 'variable/values',
        value: {},
        options: {
          id: 'scope-1',
          replace: true
        }
      })

      await variablePlugin.variableSetValue({
        scope: 'scope-1',
        values: [
          {
            value: 'auto-generated-value'
          }
        ]
      }, { context: { id: 'component-1' } })

      const values = statePlugin.stateGetValue({
        name: 'variable/values',
        id: 'scope-1'
      })

      // Find the auto-generated key and verify the value
      const keys = Object.keys(values.item)
      strictEqual(keys.length, 1, 'Should have exactly one key')
      strictEqual(values.item[keys[0]], 'auto-generated-value')

      tester.restoreAll()
    })

    it('should apply prefix to generated ID', async (t) => {
      const { tester, variablePlugin, statePlugin } = setupVariablePlugin(t)

      await variablePlugin.variableSetValue({
        scope: 'scope-1',
        values: [
          {
            value: 'prefixed-value',
            prefixId: 'pre_'
          }
        ]
      }, { context: { id: 'component-1' } })

      const values = statePlugin.stateGetValue({
        name: 'variable/values',
        id: 'scope-1'
      })

      // Find the key that starts with 'pre_' and verify the value
      const keys = Object.keys(values.item).filter(k => k.startsWith('pre_'))
      strictEqual(keys.length, 1, 'Should have exactly one prefixed key')
      strictEqual(values.item[keys[0]], 'prefixed-value')

      tester.restoreAll()
    })

    it('should apply suffix to generated ID', async (t) => {
      const { tester, variablePlugin, statePlugin } = setupVariablePlugin(t)

      await variablePlugin.variableSetValue({
        scope: 'scope-1',
        values: [
          {
            value: 'suffixed-value',
            suffixId: '_suf'
          }
        ]
      }, { context: { id: 'component-1' } })

      const values = statePlugin.stateGetValue({
        name: 'variable/values',
        id: 'scope-1'
      })

      // Find the key that ends with '_suf' and verify the value
      const keys = Object.keys(values.item).filter(k => k.endsWith('_suf'))
      strictEqual(keys.length, 1, 'Should have exactly one suffixed key')
      strictEqual(values.item[keys[0]], 'suffixed-value')

      tester.restoreAll()
    })

    it('should apply both prefix and suffix to generated ID', async (t) => {
      const { tester, variablePlugin, statePlugin } = setupVariablePlugin(t)

      await variablePlugin.variableSetValue({
        scope: 'scope-1',
        values: [
          {
            value: 'combined-value',
            prefixId: 'pre_',
            suffixId: '_suf'
          }
        ]
      }, { context: { id: 'component-1' } })

      const values = statePlugin.stateGetValue({
        name: 'variable/values',
        id: 'scope-1'
      })

      // Find the key that starts with 'pre_' and ends with '_suf' and verify the value
      const keys = Object.keys(values.item).filter(k => k.startsWith('pre_') && k.endsWith('_suf'))
      strictEqual(keys.length, 1, 'Should have exactly one combined key')
      strictEqual(values.item[keys[0]], 'combined-value')

      tester.restoreAll()
    })

    it('should use provided ID with prefix and suffix', async (t) => {
      const { tester, variablePlugin, statePlugin } = setupVariablePlugin(t)

      await variablePlugin.variableSetValue({
        scope: 'scope-1',
        values: [
          {
            id: 'my-var',
            value: 'provided-id-value',
            prefixId: 'pre_',
            suffixId: '_suf'
          }
        ]
      }, { context: { id: 'component-1' } })

      const values = statePlugin.stateGetValue({
        name: 'variable/values',
        id: 'scope-1'
      })

      strictEqual(values.item['pre_my-var_suf'], 'provided-id-value')

      tester.restoreAll()
    })

    it('should set multiple values at once', async (t) => {
      const { tester, variablePlugin, statePlugin } = setupVariablePlugin(t)

      // Clear any existing values in scope-1
      statePlugin.stateSetValue({
        name: 'variable/values',
        value: {},
        options: {
          id: 'scope-1',
          replace: true
        }
      })

      await variablePlugin.variableSetValue({
        scope: 'scope-1',
        values: [
          {
            id: 'var-1',
            value: 'value-1'
          },
          {
            id: 'var-2',
            value: 'value-2'
          },
          {
            value: 'value-3'
          } // auto-generated ID
        ]
      }, { context: { id: 'component-1' } })

      const values = statePlugin.stateGetValue({
        name: 'variable/values',
        id: 'scope-1'
      })

      strictEqual(values.item['var-1'], 'value-1')
      strictEqual(values.item['var-2'], 'value-2')

      // Find the auto-generated ID key (should be the one that's not var-1 or var-2)
      const keys = Object.keys(values.item).filter(k => k !== 'var-1' && k !== 'var-2')
      strictEqual(keys.length, 1, 'Should have exactly one auto-generated key')
      strictEqual(values.item[keys[0]], 'value-3')

      tester.restoreAll()
    })

    it('should merge with existing values in scope', async (t) => {
      const { tester, variablePlugin, statePlugin } = setupVariablePlugin(t)

      // Pre-populate scope with existing values
      statePlugin.stateSetValue({
        name: 'variable/values',
        value: {
          'existing-var': 'existing-value'
        },
        options: {
          id: 'scope-1'
        }
      })

      await variablePlugin.variableSetValue({
        scope: 'scope-1',
        values: [
          {
            id: 'new-var',
            value: 'new-value'
          }
        ]
      }, { context: { id: 'component-1' } })

      const values = statePlugin.stateGetValue({
        name: 'variable/values',
        id: 'scope-1'
      })

      strictEqual(values.item['existing-var'], 'existing-value')
      strictEqual(values.item['new-var'], 'new-value')

      tester.restoreAll()
    })

    it('should update existing value in scope', async (t) => {
      const { tester, variablePlugin, statePlugin } = setupVariablePlugin(t)

      statePlugin.stateSetValue({
        name: 'variable/values',
        value: {
          'var-1': 'old-value'
        },
        options: {
          id: 'scope-1'
        }
      })

      await variablePlugin.variableSetValue({
        scope: 'scope-1',
        values: [
          {
            id: 'var-1',
            value: 'new-value'
          }
        ]
      }, { context: { id: 'component-1' } })

      const values = statePlugin.stateGetValue({
        name: 'variable/values',
        id: 'scope-1'
      })

      strictEqual(values.item['var-1'], 'new-value')

      tester.restoreAll()
    })

    it('should handle empty values array', async (t) => {
      const { tester, variablePlugin } = setupVariablePlugin(t)

      await variablePlugin.variableSetValue({
        scope: 'scope-1',
        values: []
      }, { context: { id: 'component-1' } })

      // Should not throw error
      ok(true)

      tester.restoreAll()
    })

    it('should add component to scope in component/belongsToScopes', async (t) => {
      const { tester, variablePlugin, statePlugin } = setupVariablePlugin(t)

      await variablePlugin.variableSetValue({
        scope: 'scope-1',
        values: [
          {
            id: 'var-1',
            value: 'value-1'
          }
        ]
      }, { context: { id: 'component-1' } })

      const belongsTo = statePlugin.stateGetValue({
        name: 'component/belongsToScopes',
        id: 'component-1'
      })

      // The mock state may return an array due to accumulation across tests
      // We just need to verify that scope-1 is included
      const result = Array.isArray(belongsTo.item)
        ? belongsTo.item[belongsTo.item.length - 1]
        : belongsTo.item

      strictEqual(result, 'scope-1')

      tester.restoreAll()
    })

    it('should handle complex nested values', async (t) => {
      const { tester, variablePlugin, statePlugin } = setupVariablePlugin(t)

      await variablePlugin.variableSetValue({
        scope: 'scope-1',
        values: [
          {
            id: 'complex-var',
            value: {
              nested: {
                deep: 'deep-value'
              }
            }
          }
        ]
      }, { context: { id: 'component-1' } })

      const values = statePlugin.stateGetValue({
        name: 'variable/values',
        id: 'scope-1'
      })

      deepStrictEqual(values.item['complex-var'], {
        nested: {
          deep: 'deep-value'
        }
      })

      tester.restoreAll()
    })

    it('should handle array values', async (t) => {
      const { tester, variablePlugin, statePlugin } = setupVariablePlugin(t)

      await variablePlugin.variableSetValue({
        scope: 'scope-1',
        values: [
          {
            id: 'array-var',
            value: ['a', 'b', 'c']
          }
        ]
      }, { context: { id: 'component-1' } })

      const values = statePlugin.stateGetValue({
        name: 'variable/values',
        id: 'scope-1'
      })

      deepStrictEqual(values.item['array-var'], ['a', 'b', 'c'])

      tester.restoreAll()
    })

    it('should handle null and undefined values', async (t) => {
      const { tester, variablePlugin, statePlugin } = setupVariablePlugin(t)

      await variablePlugin.variableSetValue({
        scope: 'scope-1',
        values: [
          {
            id: 'null-var',
            value: null
          },
          {
            id: 'undefined-var',
            value: undefined
          }
        ]
      }, { context: { id: 'component-1' } })

      const values = statePlugin.stateGetValue({
        name: 'variable/values',
        id: 'scope-1'
      })

      strictEqual(values.item['null-var'], null)
      strictEqual(values.item['undefined-var'], undefined)

      tester.restoreAll()
    })
  })

  describe('Context-based scope search', () => {
    it('should set value in current context when no scope specified', async (t) => {
      const { tester, variablePlugin, statePlugin } = setupVariablePlugin(t)

      // Setup scopes for root context
      statePlugin.stateSetValue({
        name: 'variable/scopes',
        value: ['scope-1'],
        options: {
          id: 'root-context'
        }
      })

      // Setup existing values in scope-1
      statePlugin.stateSetValue({
        name: 'variable/values',
        value: {
          'existing-var': 'existing-value'
        },
        options: {
          id: 'scope-1'
        }
      })

      await variablePlugin.variableSetValue({
        values: [
          {
            id: 'new-var',
            value: 'new-value'
          }
        ]
      }, {
        context: {
          rootId: 'root-context',
          id: 'component-1'
        }
      })

      // Should set in root context since new-var doesn't exist in scope-1
      const values = statePlugin.stateGetValue({
        name: 'variable/values',
        id: 'root-context'
      })

      strictEqual(values.item['new-var'], 'new-value')

      tester.restoreAll()
    })

    it('should set value in current context when not found in parent scopes', async (t) => {
      const { tester, variablePlugin, statePlugin } = setupVariablePlugin(t)

      // Setup scopes for root context
      statePlugin.stateSetValue({
        name: 'variable/scopes',
        value: ['scope-1'],
        options: {
          id: 'root-context'
        }
      })

      // Setup values in scope-1 without matching variable
      statePlugin.stateSetValue({
        name: 'variable/values',
        value: {
          'other-var': 'other-value'
        },
        options: {
          id: 'scope-1'
        }
      })

      await variablePlugin.variableSetValue({
        values: [
          {
            id: 'new-var',
            value: 'new-value'
          }
        ]
      }, {
        context: {
          rootId: 'root-context',
          id: 'component-1'
        }
      })

      // Should set in root context
      const values = statePlugin.stateGetValue({
        name: 'variable/values',
        id: 'root-context'
      })

      strictEqual(values.item['new-var'], 'new-value')

      tester.restoreAll()
    })

    it('should stop searching when all values are set', async (t) => {
      const { tester, variablePlugin, statePlugin } = setupVariablePlugin(t)

      statePlugin.stateSetValue({
        name: 'variable/scopes',
        value: ['scope-1', 'scope-2'],
        options: {
          id: 'root-context'
        }
      })

      // Both scopes have the same variable
      statePlugin.stateSetValue({
        name: 'variable/values',
        value: {
          'shared-var': 'scope-1-value'
        },
        options: {
          id: 'scope-1'
        }
      })

      statePlugin.stateSetValue({
        name: 'variable/values',
        value: {
          'shared-var': 'scope-2-value'
        },
        options: {
          id: 'scope-2'
        }
      })

      await variablePlugin.variableSetValue({
        values: [
          {
            id: 'shared-var',
            value: 'updated-value'
          }
        ]
      }, {
        context: {
          rootId: 'root-context',
          id: 'component-1'
        }
      })

      // Should update first scope only
      const values1 = statePlugin.stateGetValue({
        name: 'variable/values',
        id: 'scope-1'
      })

      const values2 = statePlugin.stateGetValue({
        name: 'variable/values',
        id: 'scope-2'
      })

      strictEqual(values1.item['shared-var'], 'updated-value')
      strictEqual(values2.item['shared-var'], 'scope-2-value')

      tester.restoreAll()
    })

    it('should return undefined when context.rootId is not provided', async (t) => {
      const { tester, variablePlugin } = setupVariablePlugin(t)

      await variablePlugin.variableSetValue({
        values: [
          {
            id: 'new-var',
            value: 'new-value'
          }
        ]
      }, { context: {} })

      // Should not throw error
      ok(true)

      tester.restoreAll()
    })
  })

  describe('Edge cases', () => {
    it('should handle empty scopes array', async (t) => {
      const { tester, variablePlugin, statePlugin } = setupVariablePlugin(t)

      statePlugin.stateSetValue({
        name: 'variable/scopes',
        value: [],
        options: {
          id: 'root-context'
        }
      })

      await variablePlugin.variableSetValue({
        values: [
          {
            id: 'new-var',
            value: 'new-value'
          }
        ]
      }, {
        context: {
          rootId: 'root-context',
          id: 'component-1'
        }
      })

      // Should set in root context
      const values = statePlugin.stateGetValue({
        name: 'variable/values',
        id: 'root-context'
      })

      strictEqual(values.item['new-var'], 'new-value')

      tester.restoreAll()
    })

    it('should handle setting values when scope has no existing values', async (t) => {
      const { tester, variablePlugin, statePlugin } = setupVariablePlugin(t)

      statePlugin.stateSetValue({
        name: 'variable/scopes',
        value: ['scope-1'],
        options: {
          id: 'root-context'
        }
      })

      // Don't set any values in scope-1
      await variablePlugin.variableSetValue({
        values: [
          {
            id: 'new-var',
            value: 'new-value'
          }
        ]
      }, {
        context: {
          rootId: 'root-context',
          id: 'component-1'
        }
      })

      // Should set in root context
      const values = statePlugin.stateGetValue({
        name: 'variable/values',
        id: 'root-context'
      })

      strictEqual(values.item['new-var'], 'new-value')

      tester.restoreAll()
    })

    it('should handle setting values with prefix and suffix in context search', async (t) => {
      const { tester, variablePlugin, statePlugin } = setupVariablePlugin(t)

      statePlugin.stateSetValue({
        name: 'variable/scopes',
        value: ['scope-1'],
        options: {
          id: 'root-context'
        }
      })

      statePlugin.stateSetValue({
        name: 'variable/values',
        value: {
          'pre_test-var_suf': 'existing-value'
        },
        options: {
          id: 'scope-1'
        }
      })

      await variablePlugin.variableSetValue({
        values: [
          {
            id: 'test-var',
            value: 'updated-value',
            prefixId: 'pre_',
            suffixId: '_suf'
          }
        ]
      }, {
        context: {
          rootId: 'root-context',
          id: 'component-1'
        }
      })

      // Should update in scope-1
      const values = statePlugin.stateGetValue({
        name: 'variable/values',
        id: 'scope-1'
      })

      strictEqual(values.item['pre_test-var_suf'], 'updated-value')

      tester.restoreAll()
    })

    it('should handle setting multiple values with some matching and some not', async (t) => {
      const { tester, variablePlugin, statePlugin } = setupVariablePlugin(t)

      statePlugin.stateSetValue({
        name: 'variable/scopes',
        value: ['scope-1'],
        options: {
          id: 'root-context'
        }
      })

      statePlugin.stateSetValue({
        name: 'variable/values',
        value: {
          'existing-var': 'old-value'
        },
        options: {
          id: 'scope-1'
        }
      })

      await variablePlugin.variableSetValue({
        values: [
          {
            id: 'existing-var',
            value: 'updated-value'
          },
          {
            id: 'new-var',
            value: 'new-value'
          }
        ]
      }, {
        context: {
          rootId: 'root-context',
          id: 'component-1'
        }
      })

      // Should update existing in scope-1 and add new to root context
      const scopeValues = statePlugin.stateGetValue({
        name: 'variable/values',
        id: 'scope-1'
      })

      const rootValues = statePlugin.stateGetValue({
        name: 'variable/values',
        id: 'root-context'
      })

      strictEqual(scopeValues.item['existing-var'], 'updated-value')
      strictEqual(rootValues.item['new-var'], 'new-value')

      tester.restoreAll()
    })
  })
})
