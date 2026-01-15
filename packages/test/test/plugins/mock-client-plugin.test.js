import { it, describe } from 'node:test'
import { ok, strictEqual, deepStrictEqual } from 'node:assert'
import { mockClientPlugin } from '../../src/plugins/mock-client-plugin.js'

describe('mockClientPlugin', () => {
  describe('Basic plugin mocking', () => {
    it('should create a mock for a single plugin', async (t) => {
      const mock = await mockClientPlugin(t, {
        name: 'variable'
      })

      // Verify plugin is mocked
      ok(mock.method.variableSetValue, 'variable plugin method')
      ok(mock.restore, 'restore function should exist')

      // Verify state methods are available
      ok(mock.method.stateGetValue, 'stateGetValue should be available')
      ok(mock.method.stateSetValue, 'stateSetValue should be available')

      // Verify variable methods are available
      ok(mock.method.variableGetValue, 'variableGetValue should be available')
      ok(mock.method.variableSetValue, 'variableSetValue should be available')

      mock.restore()
    })

    it('should mock multiple plugins', async (t) => {
      const mock = await mockClientPlugin(t, {
        name: 'variable',
        modules: ['action', 'component']
      })

      // Verify methods from all plugins are available
      ok(mock.method.variableGetValue, 'variableGetValue should be available')
      ok(mock.method.actionDispatch, 'actionDispatch should be available')
      ok(mock.method.componentRemove, 'componentRemove should be available')

      mock.restore()
    })

    it('should handle plugin with no actions', async (t) => {
      const mock = await mockClientPlugin(t, {
        name: 'metadata'
      })

      ok(mock.restore, 'restore function should exist')

      mock.restore()
    })
  })

  describe('Mock method behavior', () => {
    it('should track call counts correctly', async (t) => {
      const mock = await mockClientPlugin(t, {
        name: 'variable',
        modules: ['action']
      })

      strictEqual(mock.method.stateGetValue.mock.callCount(), 0)

      mock.method.stateGetValue({ name: 'variable/scopes' })
      strictEqual(mock.method.stateGetValue.mock.callCount(), 1)

      mock.method.variableGetValue(
        { query: 'test' },
        { context: { rootId: 'root' } }
      )
      strictEqual(mock.method.stateGetValue.mock.callCount(), 2)

      mock.restore()
    })

    it('should allow custom mock implementations', async (t) => {
      const mock = await mockClientPlugin(t, {
        name: 'variable'
      })

      const customResult = { custom: 'data' }
      mock.method.stateGetValue.mock.mockImplementation(() => customResult)

      const result = mock.method.stateGetValue({ name: 'test' })
      deepStrictEqual(result, customResult)
      strictEqual(mock.method.stateGetValue.mock.callCount(), 1)

      mock.restore()
    })

    it('should track multiple calls', async (t) => {
      const mock = await mockClientPlugin(t, {
        name: 'variable'
      })

      // Mock the implementation to avoid actual state calls
      mock.method.stateGetValue.mock.mockImplementation(() => ({ isEmpty: true }))

      mock.method.stateGetValue({ name: 'test1' })
      mock.method.stateGetValue({ name: 'test2' })
      mock.method.stateGetValue({ name: 'test3' })

      strictEqual(mock.method.stateGetValue.mock.callCount(), 3)

      mock.restore()
    })
  })

  describe('State management mocking', () => {
    it('should mock stateGetValue with custom behavior', async (t) => {
      const mock = await mockClientPlugin(t, {
        name: 'variable'
      })

      // Test with empty result
      mock.method.stateGetValue.mock.mockImplementation(() => ({ isEmpty: true }))
      const result1 = mock.method.stateGetValue({ name: 'nonexistent' })
      strictEqual(result1.isEmpty, true)

      // Test with data result
      mock.method.stateGetValue.mock.mockImplementation(() => ({
        isEmpty: false,
        item: { value: 'test' }
      }))
      const result2 = mock.method.stateGetValue({ name: 'existing' })
      strictEqual(result2.isEmpty, false)
      deepStrictEqual(result2.item, { value: 'test' })

      mock.restore()
    })

    it('should mock stateSetValue', async (t) => {
      const mock = await mockClientPlugin(t, {
        name: 'variable'
      })

      const setValue = {
        name: 'variable/values',
        value: { data: 'test' }
      }
      mock.method.stateSetValue(setValue)

      strictEqual(mock.method.stateSetValue.mock.callCount(), 1)

      mock.restore()
    })
  })

  describe('Plugin action method mocking', () => {
    it('should mock variableGetValue with context injection', async (t) => {
      const mock = await mockClientPlugin(t, {
        name: 'variable'
      })

      const params = {
        query: 'user.name',
        prefixId: 'user_'
      }
      const context = {
        context: {
          rootId: 'app-root'
        }
      }

      // Mock the state methods to return test data
      mock.method.stateGetValue.mock.mockImplementation((args) => {
        if (args.name === 'variable/scopes') {
          return {
            isEmpty: false,
            item: ['scope-1', 'scope-2']
          }
        }
        if (args.name === 'variable/values') {
          return {
            isEmpty: false,
            item: { user_name: 'John Doe' }
          }
        }
        return { isEmpty: true }
      })

      const result = mock.method.variableGetValue(params, context)

      // Should have called state methods
      ok(mock.method.stateGetValue.mock.callCount() > 0)

      mock.restore()
    })

    it('should mock actionDispatch with promise handling', async (t) => {
      const mock = await mockClientPlugin(t, {
        name: 'action',
        modules: ['variable'],
        namedExports: [
          {
            module: '#client',
            name: 'apiGetById',
            value: t.mock.fn(() => Promise.resolve({ isEmpty: true }))
          },
          {
            module: '#client',
            name: 'operatorCompare',
            value: t.mock.fn(() => true)
          },
          {
            module: '#client',
            name: 'operatorEval',
            value: t.mock.fn(() => true)
          }
        ]
      })

      const mockResult = {
        success: true,
        data: { id: 'action-123' }
      }
      mock.method.actionDispatch.mock.mockImplementation(() => Promise.resolve(mockResult))

      const result = await mock.method.actionDispatch({
        id: 'test-action',
        context: { rootId: 'root' },
        payload: { data: 'test' }
      })

      deepStrictEqual(result, mockResult)
      strictEqual(mock.method.actionDispatch.mock.callCount(), 1)

      mock.restore()
    })

    it('should mock actionGetValue with query parameter', async (t) => {
      const mock = await mockClientPlugin(t, {
        name: 'action',
        namedExports: [
          {
            module: '#client',
            name: 'apiGetById',
            value: t.mock.fn(() => Promise.resolve({ isEmpty: true }))
          },
          {
            module: '#client',
            name: 'operatorCompare',
            value: t.mock.fn(() => true)
          },
          {
            module: '#client',
            name: 'operatorEval',
            value: t.mock.fn(() => true)
          }
        ]
      })

      const testData = {
        user: {
          name: 'John',
          age: 30
        }
      }
      // Mock to return the specific value based on query
      mock.method.actionGetValue.mock.mockImplementation((params) => {
        if (params.query === 'user.name') {
          return 'John'
        }
        return testData
      })

      const result = mock.method.actionGetValue({
        value: testData,
        query: 'user.name'
      })

      strictEqual(result, 'John')
      strictEqual(mock.method.actionGetValue.mock.callCount(), 1)

      mock.restore()
    })

    it('should mock actionIfElse with conditional logic', async (t) => {
      const mock = await mockClientPlugin(t, {
        name: 'action',
        namedExports: [
          {
            module: '#client',
            name: 'apiGetById',
            value: t.mock.fn(() => Promise.resolve({ isEmpty: true }))
          },
          {
            module: '#client',
            name: 'operatorCompare',
            value: t.mock.fn(() => true)
          },
          {
            module: '#client',
            name: 'operatorEval',
            value: t.mock.fn(() => true)
          }
        ]
      })

      const mockSequence = ['seq-1', 'seq-2']
      mock.method.actionIfElse.mock.mockImplementation(() => mockSequence)

      const branch = {
        if: [
          {
            op: '==',
            left: 'user.role',
            right: 'admin'
          }
        ],
        then: ['admin-seq'],
        else: ['user-seq']
      }

      const result = mock.method.actionIfElse(
        branch,
        () => {
        },
        {
          context: { rootId: 'root' },
          payload: {},
          blockValues: {}
        }
      )

      deepStrictEqual(result, mockSequence)
      strictEqual(mock.method.actionIfElse.mock.callCount(), 1)

      mock.restore()
    })
  })

  describe('Named exports configuration', () => {
    it('should accept custom named exports', async (t) => {
      const customMock = t.mock.fn(() => ({ custom: 'result' }))

      const mock = await mockClientPlugin(t, {
        name: 'variable',
        namedExports: [
          {
            module: '#client',
            name: 'customFunction',
            value: customMock
          }
        ]
      })

      // The custom function should be available in method
      ok(mock.method.customFunction, 'custom function should be available')
      strictEqual(mock.method.customFunction.mock.callCount(), 0)

      const result = mock.method.customFunction()
      deepStrictEqual(result, { custom: 'result' })
      strictEqual(mock.method.customFunction.mock.callCount(), 1)

      mock.restore()
    })

    it('should handle multiple custom exports per module', async (t) => {
      const mock1 = t.mock.fn(() => 'mock1')
      const mock2 = t.mock.fn(() => 'mock2')

      const mock = await mockClientPlugin(t, {
        name: 'variable',
        namedExports: [
          {
            module: '#client',
            name: 'export1',
            value: mock1
          },
          {
            module: '#client',
            name: 'export2',
            value: mock2
          }
        ]
      })

      ok(mock.method.export1, 'export1 should be available')
      ok(mock.method.export2, 'export2 should be available')

      strictEqual(mock.method.export1(), 'mock1')
      strictEqual(mock.method.export2(), 'mock2')

      mock.restore()
    })
  })

  describe('Error handling and edge cases', () => {
    it('should handle restore being called multiple times', async (t) => {
      const mock = await mockClientPlugin(t, {
        name: 'variable'
      })

      // Should not throw when called multiple times
      mock.restore()
      mock.restore()
      mock.restore()
    })

    it('should handle restore with errors in callbacks', async (t) => {
      const mock = await mockClientPlugin(t, {
        name: 'variable',
        namedExports: [
          {
            module: '#client',
            name: 'errorFunction',
            value: t.mock.fn(() => {
              throw new Error('Mock error')
            })
          }
        ]
      })

      // Should not throw during restore even if mock callbacks have errors
      mock.restore()
    })

    it('should handle plugin with no state', async (t) => {
      const mock = await mockClientPlugin(t, {
        name: 'string'
      })

      ok(mock.restore, 'restore function should exist')

      mock.restore()
    })

    it('should handle empty modules array', async (t) => {
      const mock = await mockClientPlugin(t, {
        name: 'variable',
        modules: []
      })

      ok(mock.restore, 'restore function should exist')

      mock.restore()
    })

    it('should handle empty namedExports array', async (t) => {
      const mock = await mockClientPlugin(t, {
        name: 'variable',
        namedExports: []
      })

      ok(mock.restore, 'restore function should exist')

      mock.restore()
    })
  })

  describe('Integration scenarios', () => {
    it('should work with complex plugin combinations', async (t) => {
      const mock = await mockClientPlugin(t, {
        name: 'variable',
        modules: ['action', 'component', 'state'],
        namedExports: [
          {
            module: '#client',
            name: 'testExport',
            value: t.mock.fn(() => 'test')
          },
          {
            module: '#client',
            name: 'apiGetById',
            value: t.mock.fn(() => Promise.resolve({ isEmpty: true }))
          },
          {
            module: '#client',
            name: 'operatorCompare',
            value: t.mock.fn(() => true)
          },
          {
            module: '#client',
            name: 'operatorEval',
            value: t.mock.fn(() => true)
          }
        ]
      })

      // Verify methods from all modules are available
      ok(mock.method.variableGetValue)
      ok(mock.method.componentRemove)
      ok(mock.method.stateGetValue)
      ok(mock.method.testExport)

      // Test calling methods
      mock.method.variableGetValue(
        { query: 'test' },
        { context: { rootId: 'root' } }
      )
      mock.method.testExport()

      // Verify call counts
      strictEqual(mock.method.variableGetValue.mock.callCount(), 1)
      strictEqual(mock.method.testExport.mock.callCount(), 1)

      mock.restore()
    })

    it('should handle sequential operations', async (t) => {
      const mock = await mockClientPlugin(t, {
        name: 'variable',
        modules: ['action'],
        namedExports: [
          {
            module: '#client',
            name: 'apiGetById',
            value: t.mock.fn(() => Promise.resolve({ isEmpty: true }))
          },
          {
            module: '#client',
            name: 'operatorCompare',
            value: t.mock.fn(() => true)
          },
          {
            module: '#client',
            name: 'operatorEval',
            value: t.mock.fn(() => true)
          }
        ]
      })

      // First operation
      mock.method.stateGetValue({ name: 'variable/scopes' })
      strictEqual(mock.method.stateGetValue.mock.callCount(), 1)

      // Second operation
      mock.method.variableGetValue(
        { query: 'test' },
        { context: { rootId: 'root' } }
      )
      strictEqual(mock.method.stateGetValue.mock.callCount(), 2)

      // Third operation
      mock.method.actionDispatch({ id: 'test-action' })
      strictEqual(mock.method.actionDispatch.mock.callCount(), 1)

      // Verify all calls were tracked
      strictEqual(mock.method.variableGetValue.mock.callCount(), 1)

      mock.restore()
    })

    it('should work with state operations that depend on each other', async (t) => {
      const mock = await mockClientPlugin(t, {
        name: 'variable'
      })

      // Mock state to return specific data
      const mockScopes = ['scope-1', 'scope-2']
      const mockValues = { 'test-key': 'test-value' }

      mock.method.stateGetValue.mock.mockImplementation((args) => {
        if (args.name === 'variable/scopes') {
          return {
            isEmpty: false,
            item: mockScopes
          }
        }
        if (args.name === 'variable/values') {
          return {
            isEmpty: false,
            item: mockValues
          }
        }
        return { isEmpty: true }
      })

      // Get scopes
      const scopes = mock.method.stateGetValue({ name: 'variable/scopes' })
      deepStrictEqual(scopes.item, mockScopes)

      // Get values
      const values = mock.method.stateGetValue({
        name: 'variable/values',
        id: 'scope-1'
      })
      deepStrictEqual(values.item, mockValues)

      strictEqual(mock.method.stateGetValue.mock.callCount(), 2)

      mock.restore()
    })
  })

  describe('Mock state behavior', () => {
    it('should handle state setup with plugin data', async (t) => {
      const mock = await mockClientPlugin(t, {
        name: 'variable'
      })

      // The mock should have set up state internally
      // We can verify this by checking that state methods work
      mock.method.stateGetValue({ name: 'variable/values' })

      strictEqual(mock.method.stateGetValue.mock.callCount(), 1)

      mock.restore()
    })

    it('should handle multiple state operations in sequence', async (t) => {
      const mock = await mockClientPlugin(t, {
        name: 'variable'
      })

      const operations = [
        { name: 'variable/scopes' },
        {
          name: 'variable/values',
          id: 'test-scope'
        },
        { name: 'variable/values' }
      ]

      operations.forEach((op) => mock.method.stateGetValue(op))

      strictEqual(mock.method.stateGetValue.mock.callCount(), operations.length)

      mock.restore()
    })
  })

  describe('Plugin method call tracking', () => {
    it('should track all variable methods', async (t) => {
      const mock = await mockClientPlugin(t, {
        name: 'variable'
      })

      // Mock the state methods to avoid actual state calls and provide proper data
      mock.method.stateGetValue.mock.mockImplementation((args) => {
        if (args.name === 'variable/scopes') {
          return {
            isEmpty: false,
            item: ['scope-1']
          }
        }
        if (args.name === 'variable/values') {
          return {
            isEmpty: false,
            item: { existingVar: 'old-value' }
          }
        }
        return { isEmpty: true }
      })
      mock.method.stateSetValue.mock.mockImplementation(() => {
      })

      // Call all available methods
      mock.method.variableGetValue(
        { query: 'test' },
        { context: { rootId: 'root' } }
      )
      mock.method.variableSetValue({
        values: [{
          id: 'var-1',
          value: 'test-value'
        }],
        scope: 'test-scope'
      })

      strictEqual(mock.method.variableGetValue.mock.callCount(), 1)
      strictEqual(mock.method.variableSetValue.mock.callCount(), 1)

      mock.restore()
    })

    it('should track all action methods', async (t) => {
      const mock = await mockClientPlugin(t, {
        name: 'action',
        namedExports: [
          {
            module: '#client',
            name: 'apiGetById',
            value: t.mock.fn(() => Promise.resolve({ isEmpty: true }))
          },
          {
            module: '#client',
            name: 'operatorCompare',
            value: t.mock.fn(() => true)
          },
          {
            module: '#client',
            name: 'operatorEval',
            value: t.mock.fn(() => true)
          }
        ]
      })

      // Mock action methods to avoid calling actual implementations
      mock.method.actionDispatch.mock.mockImplementation(() => ({ success: true }))
      mock.method.actionGetValue.mock.mockImplementation(() => 'test-value')
      mock.method.actionGetContextValue.mock.mockImplementation(() => 'context-value')
      mock.method.actionGetPayloadValue.mock.mockImplementation(() => 'payload-value')
      mock.method.actionIfElse.mock.mockImplementation(() => ['seq-1', 'seq-2'])

      // Call action methods
      mock.method.actionDispatch({ id: 'test-action' })
      mock.method.actionGetValue({
        value: { data: 'test' },
        query: 'data'
      })
      mock.method.actionGetContextValue('context.user', {
        context: { user: { id: '123' } }
      })
      mock.method.actionGetPayloadValue('payload.data', {
        payload: { data: 'test' }
      })
      mock.method.actionIfElse(
        {
          if: [{
            op: '==',
            left: 'a',
            right: 'a'
          }],
          then: ['seq-1'],
          else: ['seq-2']
        },
        () => {
        },
        {
          context: {},
          payload: {},
          blockValues: {}
        }
      )

      strictEqual(mock.method.actionDispatch.mock.callCount(), 1)
      strictEqual(mock.method.actionGetValue.mock.callCount(), 1)
      strictEqual(mock.method.actionGetContextValue.mock.callCount(), 1)
      strictEqual(mock.method.actionGetPayloadValue.mock.callCount(), 1)
      strictEqual(mock.method.actionIfElse.mock.callCount(), 1)

      mock.restore()
    })

    it('should track state methods across different plugins', async (t) => {
      const mock = await mockClientPlugin(t, {
        name: 'variable',
        modules: ['action', 'component']
      })

      // Mock state methods to avoid actual state calls
      mock.method.stateGetValue.mock.mockImplementation(() => ({ isEmpty: true }))
      mock.method.stateSetValue.mock.mockImplementation(() => {
      })
      mock.method.stateAddListener.mock.mockImplementation(() => {
      })
      mock.method.stateDeleteListener.mock.mockImplementation(() => {
      })

      // State methods should be available from all plugins
      mock.method.stateGetValue({ name: 'test' })
      mock.method.stateSetValue({
        name: 'test',
        value: 'data'
      })
      mock.method.stateAddListener({
        name: 'test',
        handler: () => {
        }
      })
      mock.method.stateDeleteListener({
        name: 'test',
        id: 'listener-1'
      })

      strictEqual(mock.method.stateGetValue.mock.callCount(), 1)
      strictEqual(mock.method.stateSetValue.mock.callCount(), 1)
      strictEqual(mock.method.stateAddListener.mock.callCount(), 1)
      strictEqual(mock.method.stateDeleteListener.mock.callCount(), 1)

      mock.restore()
    })
  })
})
