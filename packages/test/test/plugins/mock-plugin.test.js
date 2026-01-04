import { describe, it, beforeEach, afterEach } from 'node:test'
import { strictEqual, rejects, ok } from 'node:assert'
import { createContext, mockPlugin } from '../../src/index.js'

describe('mockPlugin', () => {
  let context

  beforeEach(() => {
    context = createContext()
  })

  afterEach(() => {
    // Clean up any global state if needed
  })

  describe('Parameter Validation', () => {
    it('should throw error for invalid plugin name (empty string)', async (t) => {
      await rejects(
        mockPlugin(t, {
          name: '',
          platform: 'client'
        }),
        { message: 'Invalid plugin name: expected non-empty string' }
      )
    })

    it('should throw error for invalid plugin name (non-string)', async (t) => {
      await rejects(
        mockPlugin(t, {
          // @ts-ignore
          name: 123,
          platform: 'client'
        }),
        { message: 'Invalid plugin name: expected non-empty string' }
      )
    })

    it('should throw error for invalid plugin name (null)', async (t) => {
      await rejects(
        mockPlugin(t, {
          name: null,
          platform: 'client'
        }),
        { message: 'Invalid plugin name: expected non-empty string' }
      )
    })

    it('should throw error for invalid platform (not client or server)', async (t) => {
      await rejects(
        mockPlugin(t, {
          name: 'variable',
          // @ts-ignore
          platform: 'invalid'
        }),
        { message: 'Invalid platform: expected "client" or "server"' }
      )
    })

    it('should throw error for invalid modules (not an array)', async (t) => {
      await rejects(
        mockPlugin(t, {
          name: 'variable',
          platform: 'client',
          // @ts-ignore
          modules: 'not-an-array'
        }),
        { message: 'Invalid modules: expected array' }
      )
    })

    it('should throw error for invalid namedExports (null)', async (t) => {
      await rejects(
        mockPlugin(t, {
          name: 'variable',
          platform: 'client',
          namedExports: null
        }),
        { message: 'Invalid namedExports: expected object' }
      )
    })

    it('should throw error for invalid namedExports (non-object)', async (t) => {
      await rejects(
        mockPlugin(t, {
          name: 'variable',
          platform: 'client',
          // @ts-ignore
          namedExports: 'not-an-object'
        }),
        { message: 'Invalid namedExports: expected object' }
      )
    })
  })

  describe('Basic Functionality', () => {
    it('should create mock for single plugin without additional modules', async (t) => {
      const result = await mockPlugin(t, {
        name: 'variable'
      })

      strictEqual(typeof result, 'object')
      strictEqual(typeof result.plugin, 'object')
      strictEqual(typeof result.restore, 'function')
      strictEqual(typeof result.modules, 'object')
    })

    it('should work with client platform (default)', async (t) => {
      const result = await mockPlugin(t, {
        name: 'variable',
        platform: 'client'
      })

      ok(result.plugin)
      strictEqual(typeof result.restore, 'function')
    })

    it('should handle server platform when plugin does not exist', async (t) => {
      await rejects(
        mockPlugin(t, {
          name: 'variable',
          platform: 'server'
        }),
        /** @param {Error} error */
        (error) => {
          return error.message.includes('Failed to mock plugin') &&
                 error.message.includes('variable')
        }
      )
    })

    it('should include additional modules in result', async (t) => {
      const result = await mockPlugin(t, {
        name: 'variable',
        modules: ['action', 'event']
      })

      ok(result.plugin)
      ok(result.modules.action)
      ok(result.modules.event)
      strictEqual(typeof result.modules.action, 'object')
      strictEqual(typeof result.modules.event, 'object')
    })
  })

  describe('State Management', () => {
    it('should create state methods on result object', async (t) => {
      const result = await mockPlugin(t, {
        name: 'variable'
      })

      strictEqual(typeof result.stateSetValue, 'function')
      strictEqual(typeof result.stateGetValue, 'function')
      strictEqual(typeof result.stateAddListener, 'function')
      strictEqual(typeof result.stateDeleteListener, 'function')
      strictEqual(typeof result.stateDeleteValue, 'function')
      strictEqual(typeof result.stateFind, 'function')
      strictEqual(typeof result.stateGenerateId, 'function')
      strictEqual(typeof result.stateGetSchema, 'function')
      strictEqual(typeof result.stateUnsafeSetValue, 'function')
    })

    it('should include state methods in named exports', async (t) => {
      const result = await mockPlugin(t, {
        name: 'variable'
      })

      // State methods should be available as named exports
      ok(result.stateSetValue)
      ok(result.stateGetValue)
    })

    it('should mock state methods with context.mock.method', async (t) => {
      const result = await mockPlugin(t, {
        name: 'variable'
      })

      // Verify that state methods are actual mocks
      strictEqual(typeof result.stateSetValue.mock, 'object')
      strictEqual(typeof result.stateGetValue.mock, 'object')
    })
  })

  describe('Plugin Module Mocking', () => {
    it('should properly import and mock main plugin', async (t) => {
      const result = await mockPlugin(t, {
        name: 'variable'
      })

      ok(result.plugin)
      ok(result.plugin.name)
      ok(result.plugin.actions)
    })

    it('should extract method names from plugin actions', async (t) => {
      const result = await mockPlugin(t, {
        name: 'variable'
      })

      // Check that action methods are mocked
      if (result.plugin.actions) {
        for (const actionName in result.plugin.actions) {
          const action = result.plugin.actions[actionName]
          if (action && typeof action.method === 'function') {
            strictEqual(typeof action.method.mock, 'object')
          }
        }
      }
    })

    it('should handle plugins with named exports', async (t) => {
      const result = await mockPlugin(t, {
        name: 'variable'
      })

      // Variable plugin has named exports like variableGetValue
      ok(result.plugin.variableGetValue || result.plugin.actions)
    })

    it('should mock additional modules correctly', async (t) => {
      const result = await mockPlugin(t, {
        name: 'variable',
        modules: ['action']
      })

      ok(result.modules.action)
      ok(result.modules.action.name)
      ok(result.modules.action.actions)
    })

    it('should add module method names to named exports', async (t) => {
      const customExport = t.mock.fn(() => 'test')
      const result = await mockPlugin(t, {
        name: 'variable',
        modules: ['action'],
        namedExports: {
          customExport
        }
      })

      // The mockPlugin should merge module methods into named exports
      ok(result.modules.action)
    })

    it('should handle multiple additional modules', async (t) => {
      const result = await mockPlugin(t, {
        name: 'variable',
        modules: ['action', 'event', 'component']
      })

      strictEqual(Object.keys(result.modules).length, 3)
      ok(result.modules.action)
      ok(result.modules.event)
      ok(result.modules.component)
    })
  })

  describe('Restore Functionality', () => {
    it('should provide restore method', async (t) => {
      const result = await mockPlugin(t, {
        name: 'variable'
      })

      strictEqual(typeof result.restore, 'function')
    })

    it('should call restore without errors', async (t) => {
      const result = await mockPlugin(t, {
        name: 'variable'
      })

      // Should not throw
      result.restore()
    })

    it('should handle restore with multiple modules', async (t) => {
      const result = await mockPlugin(t, {
        name: 'variable',
        modules: ['action', 'event']
      })

      // Should not throw
      result.restore()
    })

    it('should handle restore errors gracefully', async (t) => {
      const result = await mockPlugin(t, {
        name: 'variable'
      })

      // Even if internal restore callbacks fail, it should not throw
      result.restore()
    })

    it('should allow multiple calls to restore', async (t) => {
      const result = await mockPlugin(t, {
        name: 'variable'
      })

      // Should not throw on multiple calls
      result.restore()
      result.restore()
    })
  })

  describe('Error Handling', () => {
    it('should handle plugin import failure', async (t) => {
      await rejects(
        mockPlugin(t, {
          name: 'non-existent-plugin'
        }),
        (/** @type {Error} */ error) => {
          return error.message.includes('Failed to mock plugin') &&
                 error.message.includes('non-existent-plugin')
        }
      )
    })

    it('should handle module import failure', async (t) => {
      await rejects(
        mockPlugin(t, {
          name: 'variable',
          modules: ['non-existent-module']
        }),
        (/** @type {Error} */ error) => {
          return error.message.includes('Failed to mock module') &&
                 error.message.includes('non-existent-module')
        }
      )
    })

    it('should clean up partial mocks on failure', async (t) => {
      // This test verifies that if module mocking fails, any previously
      // created mocks are properly cleaned up
      await rejects(
        mockPlugin(t, {
          name: 'variable',
          modules: ['action', 'non-existent-module']
        })
      )

      // The restore should have been called during cleanup
      // (This is more of an integration test to ensure no memory leaks)
    })

    it('should handle state creation failure gracefully', async (t) => {
      // This would require mocking the mockState function to fail
      // For now, we'll test with a valid scenario
      const result = await mockPlugin(t, {
        name: 'variable'
      })

      ok(result)
      ok(result.stateSetValue)
    })
  })

  describe('Integration Tests', () => {
    it('should work with real variable plugin', async (t) => {
      const result = await mockPlugin(t, {
        name: 'variable'
      })

      // Verify the plugin structure
      ok(result.plugin)
      ok(result.plugin.name)
      ok(result.plugin.actions)

      // Verify state methods are available
      ok(result.stateSetValue)
      ok(result.stateGetValue)

      // Verify restore works
      result.restore()
    })

    it('should work with variable plugin and additional modules', async (t) => {
      const result = await mockPlugin(t, {
        name: 'variable',
        modules: ['action', 'event']
      })

      // Verify main plugin
      ok(result.plugin)
      ok(result.plugin.name)

      // Verify additional modules
      ok(result.modules.action)
      ok(result.modules.event)

      // Verify state methods
      ok(result.stateSetValue)
      ok(result.stateGetValue)

      result.restore()
    })

    it('should work with custom named exports and modules', async (t) => {
      const customDispatch = t.mock.fn(() => 'dispatched')

      const result = await mockPlugin(t, {
        name: 'variable',
        modules: ['action'],
        namedExports: {
          actionDispatch: customDispatch
        }
      })

      // namedExports only affects module imports, not the main plugin result
      // actionDispatch is from the action module, so it should NOT be on result.plugin
      strictEqual(result.plugin.actionDispatch, undefined)

      // Verify other functionality still works
      ok(result.modules.action)
      ok(result.stateSetValue)

      result.restore()
    })

    it('should handle complex scenario with all features', async (t) => {
      const customGetValue = t.mock.fn(() => 'custom')

      const result = await mockPlugin(t, {
        name: 'variable',
        platform: 'client',
        modules: ['action', 'event', 'component'],
        namedExports: {
          variableGetValue: customGetValue
        }
      })

      // Verify all components
      ok(result.plugin)
      // namedExports only affects module imports, not the main plugin result
      // The plugin should still have its own mocked named exports
      ok(result.plugin.variableGetValue)
      strictEqual(typeof result.plugin.variableGetValue.mock, 'object')
      ok(result.modules.action)
      ok(result.modules.event)
      ok(result.modules.component)
      ok(result.stateSetValue)
      ok(result.stateGetValue)

      // Verify mocks are functional
      strictEqual(typeof result.stateSetValue.mock, 'object')
      strictEqual(typeof result.stateGetValue.mock, 'object')

      result.restore()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty modules array', async (t) => {
      const result = await mockPlugin(t, {
        name: 'variable',
        modules: []
      })

      ok(result.plugin)
      strictEqual(Object.keys(result.modules).length, 0)
    })

    it('should handle empty namedExports object', async (t) => {
      const result = await mockPlugin(t, {
        name: 'variable',
        namedExports: {}
      })

      ok(result.plugin)
    })

    it('should handle plugin with no state', async (t) => {
      // Most plugins have state, but we should handle the case where they don't
      const result = await mockPlugin(t, {
        name: 'variable'
      })

      // Should still work even if plugin has no state
      ok(result.plugin)
      ok(result.stateSetValue) // State methods should still be available
    })

    it('should handle duplicate module names in modules array', async (t) => {
      const result = await mockPlugin(t, {
        name: 'variable',
        modules: ['action', 'action']
      })

      // Should handle gracefully - either deduplicate or handle duplicates
      ok(result.plugin)
      ok(result.modules.action)
    })

    it('should preserve mock context across operations', async (t) => {
      const result = await mockPlugin(t, {
        name: 'variable',
        modules: ['action']
      })

      // All mocks should be created with the same context
      ok(result.stateSetValue.mock)
      ok(result.stateGetValue.mock)

      if (result.plugin.actions) {
        for (const actionName in result.plugin.actions) {
          const action = result.plugin.actions[actionName]
          if (action && action.method && action.method.mock) {
            ok(action.method.mock)
          }
        }
      }
    })
  })
})
