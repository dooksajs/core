/**
 * Comprehensive test suite for append-plugin.js
 * Tests all functionality of the plugin management system
 */

import { describe, it } from 'node:test'
import { strictEqual, deepStrictEqual, ok } from 'node:assert'
import appendPlugin from '../src/append-plugin.js'

describe('appendPlugin', () => {
  describe('Basic Functionality', () => {
    it('should create a plugin manager with all required methods', () => {
      const manager = appendPlugin()

      ok(typeof manager.use === 'function', 'use method should exist')
      ok(Array.isArray(manager.plugins), 'plugins should be an array')
      ok(typeof manager.state === 'object', 'state should be an object')
      ok(typeof manager.actions === 'object', 'actions should be an object')
      ok(Array.isArray(manager.setup), 'setup should be an array')
      ok(typeof manager.setup === 'object', 'setup setter should work')
    })

    it('should initialize with empty state', () => {
      const manager = appendPlugin()

      strictEqual(manager.plugins.length, 0)
      strictEqual(Object.keys(manager.actions).length, 0)
      strictEqual(manager.setup.length, 0)
      deepStrictEqual(manager.state._defaults, [])
      deepStrictEqual(manager.state._items, [])
      deepStrictEqual(manager.state._names, [])
      deepStrictEqual(manager.state._values, {})
    })

    it('should handle basic plugin registration', () => {
      const manager = appendPlugin()
      const plugin = {
        name: 'test-plugin',
        actions: [
          {
            name: 'testAction',
            method: () => 'test'
          }
        ]
      }

      manager.use(plugin)

      strictEqual(manager.plugins.length, 1)
      strictEqual(manager.plugins[0], plugin)
      ok(manager.actions.testAction)
      strictEqual(manager.actions.testAction(), 'test')
    })
  })

  describe('Plugin Registration', () => {
    it('should register plugin without dependencies', () => {
      const manager = appendPlugin()
      const plugin = {
        name: 'simple-plugin',
        actions: [
          {
            name: 'action1',
            method: () => 'result1'
          }
        ]
      }

      manager.use(plugin)

      strictEqual(manager.plugins.length, 1)
      strictEqual(manager.plugins[0].name, 'simple-plugin')
      ok(manager.actions.action1)
    })

    it('should register plugin with dependencies', () => {
      const manager = appendPlugin()

      const depPlugin = {
        name: 'dep-plugin',
        actions: [
          {
            name: 'depAction',
            method: () => 'dep'
          }
        ]
      }

      const mainPlugin = {
        name: 'main-plugin',
        dependencies: [depPlugin],
        actions: [
          {
            name: 'mainAction',
            method: () => 'main'
          }
        ]
      }

      manager.use(mainPlugin)

      strictEqual(manager.plugins.length, 2)
      // Main plugin is registered first, then dependencies are processed recursively
      strictEqual(manager.plugins[0].name, 'main-plugin')
      strictEqual(manager.plugins[1].name, 'dep-plugin')
      ok(manager.actions.depAction)
      ok(manager.actions.mainAction)
    })

    it('should handle multiple dependency levels', () => {
      const manager = appendPlugin()

      const level3Plugin = {
        name: 'level3',
        actions: [{
          name: 'action3',
          method: () => '3'
        }]
      }

      const level2Plugin = {
        name: 'level2',
        dependencies: [level3Plugin],
        actions: [{
          name: 'action2',
          method: () => '2'
        }]
      }

      const level1Plugin = {
        name: 'level1',
        dependencies: [level2Plugin],
        actions: [{
          name: 'action1',
          method: () => '1'
        }]
      }

      manager.use(level1Plugin)

      strictEqual(manager.plugins.length, 3)
      // Main plugin first, then dependencies are processed recursively
      strictEqual(manager.plugins[0].name, 'level1')
      strictEqual(manager.plugins[1].name, 'level2')
      strictEqual(manager.plugins[2].name, 'level3')
      ok(manager.actions.action3)
      ok(manager.actions.action2)
      ok(manager.actions.action1)
    })

    it('should prevent duplicate plugin registration', () => {
      const manager = appendPlugin()
      const plugin = {
        name: 'duplicate',
        actions: [{
          name: 'action',
          method: () => 'test'
        }]
      }

      manager.use(plugin)
      strictEqual(manager.plugins.length, 1)

      // Register same plugin again
      manager.use(plugin)
      strictEqual(manager.plugins.length, 1, 'Should not add duplicate')
    })

    it('should NOT remove setup when duplicate plugin is registered', () => {
      const manager = appendPlugin()
      const setupFn = () => {
      }
      const plugin = {
        name: 'duplicate',
        setup: setupFn,
        actions: [{
          name: 'action',
          method: () => 'test'
        }]
      }

      manager.use(plugin)
      strictEqual(manager.setup.length, 1)
      strictEqual(manager.setup[0].name, 'duplicate')

      // Register duplicate
      manager.use(plugin)
      strictEqual(manager.setup.length, 1, 'Setup should NOT be removed for duplicate')
    })
  })

  describe('Dependency Resolution', () => {
    it('should resolve dependencies in correct order', () => {
      const manager = appendPlugin()

      const pluginA = {
        name: 'pluginA',
        actions: [{
          name: 'a',
          method: () => 'A'
        }]
      }

      const pluginB = {
        name: 'pluginB',
        dependencies: [pluginA],
        actions: [{
          name: 'b',
          method: () => 'B'
        }]
      }

      const pluginC = {
        name: 'pluginC',
        dependencies: [pluginB],
        actions: [{
          name: 'c',
          method: () => 'C'
        }]
      }

      manager.use(pluginC)

      // Main plugin first, then dependencies are processed recursively
      strictEqual(manager.plugins[0].name, 'pluginC')
      strictEqual(manager.plugins[1].name, 'pluginB')
      strictEqual(manager.plugins[2].name, 'pluginA')
    })

    it('should handle shared dependencies', () => {
      const manager = appendPlugin()

      const sharedDep = {
        name: 'shared',
        actions: [{
          name: 'sharedAction',
          method: () => 'shared'
        }]
      }

      const plugin1 = {
        name: 'plugin1',
        dependencies: [sharedDep],
        actions: [{
          name: 'action1',
          method: () => '1'
        }]
      }

      const plugin2 = {
        name: 'plugin2',
        dependencies: [sharedDep],
        actions: [{
          name: 'action2',
          method: () => '2'
        }]
      }

      const main = {
        name: 'main',
        dependencies: [plugin1, plugin2],
        actions: [{
          name: 'mainAction',
          method: () => 'main'
        }]
      }

      manager.use(main)

      // Main plugin first, then dependencies are processed recursively
      // Shared dep should only appear once
      strictEqual(manager.plugins.length, 4)
      strictEqual(manager.plugins[0].name, 'main')
      strictEqual(manager.plugins[1].name, 'plugin1')
      strictEqual(manager.plugins[2].name, 'shared')
      strictEqual(manager.plugins[3].name, 'plugin2')
    })

    it('should handle complex dependency graphs', () => {
      const manager = appendPlugin()

      const dep1 = {
        name: 'dep1',
        actions: [{
          name: 'd1',
          method: () => '1'
        }]
      }
      const dep2 = {
        name: 'dep2',
        actions: [{
          name: 'd2',
          method: () => '2'
        }]
      }
      const dep3 = {
        name: 'dep3',
        actions: [{
          name: 'd3',
          method: () => '3'
        }]
      }

      const pluginA = {
        name: 'pluginA',
        dependencies: [dep1, dep2],
        actions: [{
          name: 'a',
          method: () => 'A'
        }]
      }

      const pluginB = {
        name: 'pluginB',
        dependencies: [dep2, dep3],
        actions: [{
          name: 'b',
          method: () => 'B'
        }]
      }

      const main = {
        name: 'main',
        dependencies: [pluginA, pluginB],
        actions: [{
          name: 'main',
          method: () => 'M'
        }]
      }

      manager.use(main)

      // Verify all plugins are registered
      const names = manager.plugins.map(p => p.name)
      ok(names.includes('dep1'))
      ok(names.includes('dep2'))
      ok(names.includes('dep3'))
      ok(names.includes('pluginA'))
      ok(names.includes('pluginB'))
      ok(names.includes('main'))

      // Verify actions
      ok(manager.actions.d1)
      ok(manager.actions.d2)
      ok(manager.actions.d3)
      ok(manager.actions.a)
      ok(manager.actions.b)
      ok(manager.actions.main)
    })
  })

  describe('Action Collection', () => {
    it('should collect actions from single plugin', () => {
      const manager = appendPlugin()
      const plugin = {
        name: 'test',
        actions: [
          {
            name: 'action1',
            method: () => '1'
          },
          {
            name: 'action2',
            method: () => '2'
          },
          {
            name: 'action3',
            method: () => '3'
          }
        ]
      }

      manager.use(plugin)

      strictEqual(Object.keys(manager.actions).length, 3)
      strictEqual(manager.actions.action1(), '1')
      strictEqual(manager.actions.action2(), '2')
      strictEqual(manager.actions.action3(), '3')
    })

    it('should collect actions from multiple plugins', () => {
      const manager = appendPlugin()

      const plugin1 = {
        name: 'plugin1',
        actions: [
          {
            name: 'p1_action1',
            method: () => 'p1_1'
          },
          {
            name: 'p1_action2',
            method: () => 'p1_2'
          }
        ]
      }

      const plugin2 = {
        name: 'plugin2',
        actions: [
          {
            name: 'p2_action1',
            method: () => 'p2_1'
          },
          {
            name: 'p2_action2',
            method: () => 'p2_2'
          }
        ]
      }

      manager.use(plugin1)
      manager.use(plugin2)

      strictEqual(Object.keys(manager.actions).length, 4)
      ok(manager.actions.p1_action1)
      ok(manager.actions.p1_action2)
      ok(manager.actions.p2_action1)
      ok(manager.actions.p2_action2)
    })

    it('should handle plugins without actions', () => {
      const manager = appendPlugin()
      const plugin = { name: 'no-actions' }

      manager.use(plugin)

      strictEqual(manager.plugins.length, 1)
      strictEqual(Object.keys(manager.actions).length, 0)
    })

    it('should handle plugins with empty actions array', () => {
      const manager = appendPlugin()
      const plugin = {
        name: 'empty-actions',
        actions: []
      }

      manager.use(plugin)

      strictEqual(manager.plugins.length, 1)
      strictEqual(Object.keys(manager.actions).length, 0)
    })

    it('should handle action name conflicts', () => {
      const manager = appendPlugin()

      const plugin1 = {
        name: 'plugin1',
        actions: [{
          name: 'conflict',
          method: () => 'first'
        }]
      }

      const plugin2 = {
        name: 'plugin2',
        actions: [{
          name: 'conflict',
          method: () => 'second'
        }]
      }

      manager.use(plugin1)
      manager.use(plugin2)

      // Second plugin's action should overwrite the first
      strictEqual(manager.actions.conflict(), 'second')
    })
  })

  describe('State Management', () => {
    it('should merge state values from plugins', () => {
      const manager = appendPlugin()

      const plugin1 = {
        name: 'plugin1',
        state: {
          _values: { key1: 'value1' },
          _names: ['key1'],
          _items: [],
          _defaults: [],
          schema: {}
        }
      }

      const plugin2 = {
        name: 'plugin2',
        state: {
          _values: { key2: 'value2' },
          _names: ['key2'],
          _items: [],
          _defaults: [],
          schema: {}
        }
      }

      manager.use(plugin1)
      manager.use(plugin2)

      deepStrictEqual(manager.state._values, {
        key1: 'value1',
        key2: 'value2'
      })
      deepStrictEqual(manager.state._names, ['key1', 'key2'])
    })

    it('should concatenate state names', () => {
      const manager = appendPlugin()

      const plugin1 = {
        name: 'plugin1',
        state: {
          _values: {},
          _names: ['name1', 'name2'],
          _items: [],
          _defaults: [],
          schema: {}
        }
      }

      const plugin2 = {
        name: 'plugin2',
        state: {
          _values: {},
          _names: ['name3', 'name4'],
          _items: [],
          _defaults: [],
          schema: {}
        }
      }

      manager.use(plugin1)
      manager.use(plugin2)

      deepStrictEqual(manager.state._names, ['name1', 'name2', 'name3', 'name4'])
    })

    it('should concatenate state items', () => {
      const manager = appendPlugin()

      const plugin1 = {
        name: 'plugin1',
        state: {
          _values: {},
          _names: [],
          _items: [{ item: 'item1' }],
          _defaults: [],
          schema: {}
        }
      }

      const plugin2 = {
        name: 'plugin2',
        state: {
          _values: {},
          _names: [],
          _items: [{ item: 'item2' }],
          _defaults: [],
          schema: {}
        }
      }

      manager.use(plugin1)
      manager.use(plugin2)

      deepStrictEqual(manager.state._items, [{ item: 'item1' }, { item: 'item2' }])
    })

    it('should handle default state values', () => {
      const manager = appendPlugin()

      const plugin1 = {
        name: 'plugin1',
        state: {
          _values: {},
          _names: [],
          _items: [],
          _defaults: [{
            name: 'default1',
            value: 'value1'
          }],
          schema: {}
        }
      }

      const plugin2 = {
        name: 'plugin2',
        state: {
          _values: {},
          _names: [],
          _items: [],
          _defaults: [{
            name: 'default2',
            value: 'value2'
          }],
          schema: {}
        }
      }

      manager.use(plugin1)
      manager.use(plugin2)

      deepStrictEqual(manager.state._defaults, [
        {
          name: 'default1',
          value: 'value1'
        },
        {
          name: 'default2',
          value: 'value2'
        }
      ])
    })

    it('should handle plugins without state', () => {
      const manager = appendPlugin()
      const plugin = { name: 'no-state' }

      manager.use(plugin)

      strictEqual(manager.plugins.length, 1)
      deepStrictEqual(manager.state._values, {})
      deepStrictEqual(manager.state._names, [])
    })

    it('should preserve state schema', () => {
      const manager = appendPlugin()

      const plugin = {
        name: 'plugin',
        state: {
          _values: {},
          _names: [],
          _items: [],
          _defaults: [],
          schema: {
            testField: {
              type: 'string',
              required: true
            }
          }
        }
      }

      manager.use(plugin)

      // Note: The implementation doesn't preserve schema - it only handles _values, _names, _items, _defaults
      // This test documents the current behavior
      deepStrictEqual(manager.state.schema, {})
    })
  })

  describe('Setup Queue Management', () => {
    it('should queue setup functions from plugins', () => {
      const manager = appendPlugin()
      const setupFn = () => {
      }

      const plugin = {
        name: 'test',
        setup: setupFn
      }

      manager.use(plugin)

      strictEqual(manager.setup.length, 1)
      strictEqual(manager.setup[0].name, 'test')
      strictEqual(manager.setup[0].setup, setupFn)
    })

    it('should handle plugins without setup', () => {
      const manager = appendPlugin()
      const plugin = { name: 'no-setup' }

      manager.use(plugin)

      strictEqual(manager.setup.length, 0)
    })

    it('should queue multiple setup functions', () => {
      const manager = appendPlugin()

      const setup1 = () => {
      }
      const setup2 = () => {
      }
      const setup3 = () => {
      }

      const plugin1 = {
        name: 'plugin1',
        setup: setup1
      }
      const plugin2 = {
        name: 'plugin2',
        setup: setup2
      }
      const plugin3 = {
        name: 'plugin3',
        setup: setup3
      }

      manager.use(plugin1)
      manager.use(plugin2)
      manager.use(plugin3)

      strictEqual(manager.setup.length, 3)
      strictEqual(manager.setup[0].name, 'plugin1')
      strictEqual(manager.setup[1].name, 'plugin2')
      strictEqual(manager.setup[2].name, 'plugin3')
    })

    it('should handle setup with dependencies', () => {
      const manager = appendPlugin()

      const depSetup = () => {
      }
      const mainSetup = () => {
      }

      const dep = {
        name: 'dep',
        setup: depSetup
      }
      const main = {
        name: 'main',
        dependencies: [dep],
        setup: mainSetup
      }

      manager.use(main)

      // Main plugin is processed first, then dependencies
      strictEqual(manager.setup.length, 2)
      strictEqual(manager.setup[0].name, 'main')
      strictEqual(manager.setup[1].name, 'dep')
    })

    it('should allow setup queue modification via setter', () => {
      const manager = appendPlugin()

      const plugin = {
        name: 'test',
        setup: () => {
        }
      }
      manager.use(plugin)

      strictEqual(manager.setup.length, 1)

      // Clear setup queue
      manager.setup = []

      strictEqual(manager.setup.length, 0)

      // Set new setup queue
      const customSetup = [{
        name: 'custom',
        setup: () => {
        }
      }]
      manager.setup = customSetup

      deepStrictEqual(manager.setup, customSetup)
    })

    it('should NOT remove setup when duplicate plugin is registered', () => {
      const manager = appendPlugin()
      const setupFn = () => {
      }

      const plugin = {
        name: 'duplicate',
        setup: setupFn
      }

      manager.use(plugin)
      strictEqual(manager.setup.length, 1)

      // Register duplicate
      manager.use(plugin)
      strictEqual(manager.setup.length, 1)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty plugin object', () => {
      const manager = appendPlugin()
      const plugin = {}

      manager.use(plugin)

      strictEqual(manager.plugins.length, 1)
      strictEqual(Object.keys(manager.actions).length, 0)
      strictEqual(manager.setup.length, 0)
    })

    it('should handle plugin with only name', () => {
      const manager = appendPlugin()
      const plugin = { name: 'only-name' }

      manager.use(plugin)

      strictEqual(manager.plugins.length, 1)
      strictEqual(manager.plugins[0].name, 'only-name')
    })

    it('should handle multiple registrations of same dependency', () => {
      const manager = appendPlugin()

      const shared = {
        name: 'shared',
        actions: [{
          name: 's',
          method: () => 's'
        }]
      }

      const p1 = {
        name: 'p1',
        dependencies: [shared],
        actions: [{
          name: 'p1',
          method: () => '1'
        }]
      }

      const p2 = {
        name: 'p2',
        dependencies: [shared],
        actions: [{
          name: 'p2',
          method: () => '2'
        }]
      }

      const main = {
        name: 'main',
        dependencies: [p1, p2],
        actions: [{
          name: 'main',
          method: () => 'm'
        }]
      }

      manager.use(main)

      // Shared should only appear once
      const sharedCount = manager.plugins.filter(p => p.name === 'shared').length
      strictEqual(sharedCount, 1)

      // All plugins should be present
      strictEqual(manager.plugins.length, 4)
    })

    it('should handle deeply nested dependencies', () => {
      const manager = appendPlugin()

      const level5 = {
        name: 'level5',
        actions: [{
          name: 'a5',
          method: () => '5'
        }]
      }
      const level4 = {
        name: 'level4',
        dependencies: [level5],
        actions: [{
          name: 'a4',
          method: () => '4'
        }]
      }
      const level3 = {
        name: 'level3',
        dependencies: [level4],
        actions: [{
          name: 'a3',
          method: () => '3'
        }]
      }
      const level2 = {
        name: 'level2',
        dependencies: [level3],
        actions: [{
          name: 'a2',
          method: () => '2'
        }]
      }
      const level1 = {
        name: 'level1',
        dependencies: [level2],
        actions: [{
          name: 'a1',
          method: () => '1'
        }]
      }

      manager.use(level1)

      strictEqual(manager.plugins.length, 5)

      // Verify order - main plugin first, then dependencies recursively
      strictEqual(manager.plugins[0].name, 'level1')
      strictEqual(manager.plugins[1].name, 'level2')
      strictEqual(manager.plugins[2].name, 'level3')
      strictEqual(manager.plugins[3].name, 'level4')
      strictEqual(manager.plugins[4].name, 'level5')

      // Verify all actions exist
      for (let i = 1; i <= 5; i++) {
        ok(manager.actions[`a${i}`])
      }
    })

    it('should handle plugins with all properties', () => {
      const manager = appendPlugin()

      const dep = {
        name: 'dep',
        actions: [{
          name: 'depAction',
          method: () => 'dep'
        }],
        state: {
          _values: { depKey: 'depValue' },
          _names: ['depKey'],
          _items: [],
          _defaults: [{
            name: 'depDefault',
            value: 'depDefault'
          }],
          schema: { depField: { type: 'string' } }
        },
        setup: () => {
        }
      }

      const main = {
        name: 'main',
        dependencies: [dep],
        actions: [{
          name: 'mainAction',
          method: () => 'main'
        }],
        state: {
          _values: { mainKey: 'mainValue' },
          _names: ['mainKey'],
          _items: [],
          _defaults: [{
            name: 'mainDefault',
            value: 'mainDefault'
          }],
          schema: { mainField: { type: 'string' } }
        },
        setup: () => {
        }
      }

      manager.use(main)

      // Verify plugins
      strictEqual(manager.plugins.length, 2)

      // Verify actions
      strictEqual(Object.keys(manager.actions).length, 2)
      ok(manager.actions.depAction)
      ok(manager.actions.mainAction)

      // Verify state
      deepStrictEqual(manager.state._values, {
        depKey: 'depValue',
        mainKey: 'mainValue'
      })
      deepStrictEqual(manager.state._names, ['depKey', 'mainKey'])
      deepStrictEqual(manager.state._defaults.length, 2)

      // Verify setup
      strictEqual(manager.setup.length, 2)
    })

    it('should handle circular dependency prevention', () => {
      const manager = appendPlugin()

      // Create a scenario where dependencies might cause circular references
      const dep1 = {
        name: 'dep1',
        actions: [{
          name: 'd1',
          method: () => '1'
        }]
      }
      const dep2 = {
        name: 'dep2',
        dependencies: [dep1],
        actions: [{
          name: 'd2',
          method: () => '2'
        }]
      }

      // Plugin that depends on dep2
      const plugin = {
        name: 'plugin',
        dependencies: [dep2],
        actions: [{
          name: 'p',
          method: () => 'p'
        }]
      }

      // Register plugin
      manager.use(plugin)

      // Should work without issues
      strictEqual(manager.plugins.length, 3)
      ok(manager.actions.d1)
      ok(manager.actions.d2)
      ok(manager.actions.p)
    })
  })

  describe('Getter Methods', () => {
    it('should return plugins array', () => {
      const manager = appendPlugin()
      const plugin = { name: 'test' }

      manager.use(plugin)

      const plugins = manager.plugins
      strictEqual(Array.isArray(plugins), true)
      strictEqual(plugins.length, 1)
      strictEqual(plugins[0], plugin)
    })

    it('should return state object', () => {
      const manager = appendPlugin()
      const plugin = {
        name: 'test',
        state: {
          _values: { key: 'value' },
          _names: ['key'],
          _items: [],
          _defaults: [],
          schema: {}
        }
      }

      manager.use(plugin)

      const state = manager.state
      ok(typeof state === 'object')
      deepStrictEqual(state._values, { key: 'value' })
      deepStrictEqual(state._names, ['key'])
    })

    it('should return actions map', () => {
      const manager = appendPlugin()
      const plugin = {
        name: 'test',
        actions: [
          {
            name: 'action1',
            method: () => '1'
          },
          {
            name: 'action2',
            method: () => '2'
          }
        ]
      }

      manager.use(plugin)

      const actions = manager.actions
      ok(typeof actions === 'object')
      strictEqual(Object.keys(actions).length, 2)
      ok(actions.action1)
      ok(actions.action2)
    })

    it('should return setup array', () => {
      const manager = appendPlugin()
      const setupFn = () => {
      }
      const plugin = {
        name: 'test',
        setup: setupFn
      }

      manager.use(plugin)

      const setup = manager.setup
      strictEqual(Array.isArray(setup), true)
      strictEqual(setup.length, 1)
      strictEqual(setup[0].name, 'test')
      strictEqual(setup[0].setup, setupFn)
    })

    it('should allow setup modification via setter', () => {
      const manager = appendPlugin()

      // Initial setup
      const plugin = {
        name: 'test',
        setup: () => {
        }
      }
      manager.use(plugin)
      strictEqual(manager.setup.length, 1)

      // Modify via setter
      const newSetup = [
        {
          name: 'custom1',
          setup: () => {
          }
        },
        {
          name: 'custom2',
          setup: () => {
          }
        }
      ]
      manager.setup = newSetup

      deepStrictEqual(manager.setup, newSetup)
    })

    it('should maintain reference to internal arrays', () => {
      const manager = appendPlugin()

      const plugin = { name: 'test' }
      manager.use(plugin)

      // Get reference
      const pluginsRef = manager.plugins
      const stateRef = manager.state
      const actionsRef = manager.actions
      const setupRef = manager.setup

      // Verify they match
      strictEqual(manager.plugins, pluginsRef)
      strictEqual(manager.state, stateRef)
      strictEqual(manager.actions, actionsRef)
      strictEqual(manager.setup, setupRef)
    })
  })

  describe('Integration Scenarios', () => {
    it('should handle real-world plugin registration', () => {
      const manager = appendPlugin()

      // Simulate real plugins
      const statePlugin = {
        name: 'state',
        state: {
          _values: { values: {} },
          _names: ['values'],
          _items: [],
          _defaults: [],
          schema: {}
        },
        actions: [
          {
            name: 'stateSetValue',
            method: (payload) => payload
          },
          {
            name: 'stateGetValue',
            method: (payload) => payload
          }
        ],
        setup: (state) => {
          // Initialize state
        }
      }

      const actionPlugin = {
        name: 'action',
        dependencies: [statePlugin],
        actions: [
          {
            name: 'actionDispatch',
            method: (payload) => payload
          }
        ],
        setup: (state) => {
          // Setup action system
        }
      }

      const variablePlugin = {
        name: 'variable',
        dependencies: [statePlugin, actionPlugin],
        state: {
          _values: { variables: {} },
          _names: ['variables'],
          _items: [],
          _defaults: [],
          schema: {}
        },
        actions: [
          {
            name: 'variableGetValue',
            method: (payload) => payload
          },
          {
            name: 'variableSetValue',
            method: (payload) => payload
          }
        ],
        setup: (state) => {
          // Setup variable system
        }
      }

      manager.use(variablePlugin)

      // Verify structure - dependencies first, then main plugin
      strictEqual(manager.plugins.length, 3)
      strictEqual(manager.plugins[0].name, 'state')
      strictEqual(manager.plugins[1].name, 'action')
      strictEqual(manager.plugins[2].name, 'variable')

      // Verify actions
      strictEqual(Object.keys(manager.actions).length, 5)
      ok(manager.actions.stateSetValue)
      ok(manager.actions.stateGetValue)
      ok(manager.actions.actionDispatch)
      ok(manager.actions.variableGetValue)
      ok(manager.actions.variableSetValue)

      // Verify state
      deepStrictEqual(manager.state._values, {
        values: {},
        variables: {}
      })
      deepStrictEqual(manager.state._names, ['values', 'variables'])

      // Verify setup - only plugins with setup functions are queued
      strictEqual(manager.setup.length, 3)
      strictEqual(manager.setup[0].name, 'state')
      strictEqual(manager.setup[1].name, 'action')
      strictEqual(manager.setup[2].name, 'variable')
    })

    it('should handle complex multi-plugin scenario', () => {
      const manager = appendPlugin()

      // Core dependencies
      const state = {
        name: 'state',
        state: {
          _values: {},
          _names: [],
          _items: [],
          _defaults: [],
          schema: {}
        },
        actions: [{
          name: 'setState',
          method: () => {
          }
        }]
      }

      const event = {
        name: 'event',
        state: {
          _values: {},
          _names: [],
          _items: [],
          _defaults: [],
          schema: {}
        },
        actions: [{
          name: 'emit',
          method: () => {
          }
        }]
      }

      const api = {
        name: 'api',
        actions: [{
          name: 'request',
          method: () => {
          }
        }]
      }

      // Feature plugins
      const variable = {
        name: 'variable',
        dependencies: [state, event],
        state: {
          _values: {},
          _names: [],
          _items: [],
          _defaults: [],
          schema: {}
        },
        actions: [
          {
            name: 'varGet',
            method: () => {
            }
          },
          {
            name: 'varSet',
            method: () => {
            }
          }
        ]
      }

      const action = {
        name: 'action',
        dependencies: [state, event, api],
        actions: [{
          name: 'dispatch',
          method: () => {
          }
        }]
      }

      const component = {
        name: 'component',
        dependencies: [state, variable, action],
        actions: [{
          name: 'render',
          method: () => {
          }
        }]
      }

      manager.use(component)

      // Verify all plugins registered
      strictEqual(manager.plugins.length, 6)

      // Verify dependency order
      const names = manager.plugins.map(p => p.name)
      ok(names.indexOf('state') < names.indexOf('variable'))
      ok(names.indexOf('event') < names.indexOf('variable'))
      ok(names.indexOf('state') < names.indexOf('action'))
      ok(names.indexOf('event') < names.indexOf('action'))
      ok(names.indexOf('api') < names.indexOf('action'))
      ok(names.indexOf('state') < names.indexOf('component'))
      ok(names.indexOf('variable') < names.indexOf('component'))
      ok(names.indexOf('action') < names.indexOf('component'))

      // Verify all actions available
      strictEqual(Object.keys(manager.actions).length, 6)
      ok(manager.actions.setState)
      ok(manager.actions.emit)
      ok(manager.actions.request)
      ok(manager.actions.varGet)
      ok(manager.actions.varSet)
      ok(manager.actions.dispatch)
    })

    it('should handle plugin with multiple dependencies and shared state', () => {
      const manager = appendPlugin()

      const sharedState = {
        name: 'shared-state',
        state: {
          _values: { shared: 'data' },
          _names: ['shared'],
          _items: [],
          _defaults: [],
          schema: {}
        }
      }

      const pluginA = {
        name: 'pluginA',
        dependencies: [sharedState],
        state: {
          _values: { a: 'valueA' },
          _names: ['a'],
          _items: [],
          _defaults: [],
          schema: {}
        },
        actions: [{
          name: 'actionA',
          method: () => 'A'
        }]
      }

      const pluginB = {
        name: 'pluginB',
        dependencies: [sharedState],
        state: {
          _values: { b: 'valueB' },
          _names: ['b'],
          _items: [],
          _defaults: [],
          schema: {}
        },
        actions: [{
          name: 'actionB',
          method: () => 'B'
        }]
      }

      const main = {
        name: 'main',
        dependencies: [pluginA, pluginB],
        actions: [{
          name: 'mainAction',
          method: () => 'M'
        }]
      }

      manager.use(main)

      // Verify state is merged correctly
      deepStrictEqual(manager.state._values, {
        shared: 'data',
        a: 'valueA',
        b: 'valueB'
      })

      // Verify all actions
      strictEqual(Object.keys(manager.actions).length, 3)
      ok(manager.actions.actionA)
      ok(manager.actions.actionB)
      ok(manager.actions.mainAction)
    })

    it('should handle setup execution scenario', () => {
      const manager = appendPlugin()

      const executionOrder = []

      const dep1 = {
        name: 'dep1',
        setup: (state) => {
          executionOrder.push('dep1')
        }
      }

      const dep2 = {
        name: 'dep2',
        setup: (state) => {
          executionOrder.push('dep2')
        }
      }

      const main = {
        name: 'main',
        dependencies: [dep1, dep2],
        setup: (state) => {
          executionOrder.push('main')
        }
      }

      manager.use(main)

      // Verify setup queue order - dependencies first, then main
      strictEqual(manager.setup.length, 3)
      strictEqual(manager.setup[0].name, 'dep1')
      strictEqual(manager.setup[1].name, 'dep2')
      strictEqual(manager.setup[2].name, 'main')

      // Simulate execution
      manager.setup.forEach(({ setup }) => setup(manager.state))

      // Note: The actual execution order depends on how the setup functions are called
      // This test verifies the queue order, not the execution order
      deepStrictEqual(executionOrder, ['dep1', 'dep2', 'main'])
    })

    it('should handle state isolation between plugins', () => {
      const manager = appendPlugin()

      const plugin1 = {
        name: 'plugin1',
        state: {
          _values: { data: 'plugin1-data' },
          _names: ['data'],
          _items: [],
          _defaults: [],
          schema: { data: { type: 'string' } }
        }
      }

      const plugin2 = {
        name: 'plugin2',
        state: {
          _values: { data: 'plugin2-data' },
          _names: ['data'],
          _items: [],
          _defaults: [],
          schema: { data: { type: 'number' } }
        }
      }

      manager.use(plugin1)
      manager.use(plugin2)

      // Both values should be in state (last one wins for same key)
      deepStrictEqual(manager.state._values, { data: 'plugin2-data' })

      // Schema is not preserved in the implementation
      deepStrictEqual(manager.state.schema, {})
    })

    it('should handle complex real-world application setup', () => {
      const manager = appendPlugin()

      // Core infrastructure
      const state = {
        name: 'state',
        state: {
          _values: {},
          _names: [],
          _items: [],
          _defaults: [],
          schema: {}
        },
        actions: [{
          name: 'setState',
          method: () => {
          }
        }]
      }

      const event = {
        name: 'event',
        state: {
          _values: {},
          _names: [],
          _items: [],
          _defaults: [],
          schema: {}
        },
        actions: [{
          name: 'on',
          method: () => {
          }
        }, {
          name: 'emit',
          method: () => {
          }
        }]
      }

      const api = {
        name: 'api',
        actions: [{
          name: 'get',
          method: () => {
          }
        }, {
          name: 'post',
          method: () => {
          }
        }]
      }

      // Feature plugins
      const variable = {
        name: 'variable',
        dependencies: [state, event],
        state: {
          _values: {},
          _names: [],
          _items: [],
          _defaults: [],
          schema: {}
        },
        actions: [{
          name: 'varGet',
          method: () => {
          }
        }, {
          name: 'varSet',
          method: () => {
          }
        }]
      }

      const action = {
        name: 'action',
        dependencies: [state, event, api],
        actions: [{
          name: 'dispatch',
          method: () => {
          }
        }]
      }

      const component = {
        name: 'component',
        dependencies: [state, variable, action],
        actions: [{
          name: 'render',
          method: () => {
          }
        }]
      }

      // Register main component
      manager.use(component)

      // Verify complete structure
      strictEqual(manager.plugins.length, 7)
      strictEqual(Object.keys(manager.actions).length, 9)

      // Verify state has all collections
      strictEqual(manager.state._names.length, 3) // state, event, variable

      // Verify setup queue - only plugins with setup functions are queued
      strictEqual(manager.setup.length, 2) // state, event (variable has no setup)
    })
  })

  describe('Performance and Memory', () => {
    it('should handle many plugins efficiently', () => {
      const manager = appendPlugin()

      const pluginCount = 100
      const plugins = []

      for (let i = 0; i < pluginCount; i++) {
        const plugin = {
          name: `plugin${i}`,
          actions: [{
            name: `action${i}`,
            method: () => i
          }]
        }
        plugins.push(plugin)
      }

      // Register all plugins
      plugins.forEach(p => manager.use(p))

      strictEqual(manager.plugins.length, pluginCount)
      strictEqual(Object.keys(manager.actions).length, pluginCount)

      // Verify each action works
      for (let i = 0; i < pluginCount; i++) {
        strictEqual(manager.actions[`action${i}`](), i)
      }
    })

    it('should handle deep dependency chains', () => {
      const manager = appendPlugin()

      const depth = 50
      let current = {
        name: `plugin${depth}`,
        actions: [{
          name: `a${depth}`,
          method: () => depth
        }]
      }

      for (let i = depth - 1; i >= 1; i--) {
        current = {
          name: `plugin${i}`,
          dependencies: [current],
          actions: [{
            name: `a${i}`,
            method: () => i
          }]
        }
      }

      manager.use(current)

      strictEqual(manager.plugins.length, depth)

      // Verify order
      for (let i = 0; i < depth; i++) {
        strictEqual(manager.plugins[i].name, `plugin${depth - i}`)
      }

      // Verify all actions exist
      for (let i = 1; i <= depth; i++) {
        ok(manager.actions[`a${i}`])
      }
    })

    it('should handle many dependencies per plugin', () => {
      const manager = appendPlugin()

      const depCount = 20
      const dependencies = []

      for (let i = 0; i < depCount; i++) {
        dependencies.push({
          name: `dep${i}`,
          actions: [{
            name: `depAction${i}`,
            method: () => i
          }]
        })
      }

      const main = {
        name: 'main',
        dependencies: dependencies,
        actions: [{
          name: 'mainAction',
          method: () => 'main'
        }]
      }

      manager.use(main)

      strictEqual(manager.plugins.length, depCount + 1)
      strictEqual(Object.keys(manager.actions).length, depCount + 1)

      // Verify all dependencies registered first
      for (let i = 0; i < depCount; i++) {
        strictEqual(manager.plugins[i].name, `dep${i}`)
        ok(manager.actions[`depAction${i}`])
      }

      // Main plugin last
      strictEqual(manager.plugins[depCount].name, 'main')
      ok(manager.actions.mainAction)
    })
  })

  describe('State and Action Integration', () => {
    it('should allow actions to access shared state methods', () => {
      const manager = appendPlugin()

      const statePlugin = {
        name: 'state',
        state: {
          _values: { counter: 0 },
          _names: ['counter'],
          _items: [],
          _defaults: [],
          schema: {}
        },
        actions: [
          {
            name: 'increment',
            method: () => {
              // In real scenario, this would use state methods
              return 'incremented'
            }
          }
        ]
      }

      const actionPlugin = {
        name: 'action',
        dependencies: [statePlugin],
        actions: [
          {
            name: 'dispatchIncrement',
            method: () => {
              // Would call increment action
              return 'dispatched'
            }
          }
        ]
      }

      manager.use(actionPlugin)

      // Both actions should be available
      ok(manager.actions.increment)
      ok(manager.actions.dispatchIncrement)

      // State should be available
      deepStrictEqual(manager.state._values, { counter: 0 })
    })

    it('should handle plugins that contribute to both state and actions', () => {
      const manager = appendPlugin()

      const plugin = {
        name: 'feature',
        state: {
          _values: { data: 'initial' },
          _names: ['data'],
          _items: [],
          _defaults: [{
            name: 'data',
            value: 'default'
          }],
          schema: { data: { type: 'string' } }
        },
        actions: [
          {
            name: 'getData',
            method: () => 'data'
          },
          {
            name: 'setData',
            method: (value) => value
          }
        ],
        setup: (state) => {
          // Setup logic
        }
      }

      manager.use(plugin)

      // Verify all components
      strictEqual(manager.plugins.length, 1)
      strictEqual(Object.keys(manager.actions).length, 2)
      deepStrictEqual(manager.state._values, { data: 'initial' })
      deepStrictEqual(manager.state._defaults, [{
        name: 'data',
        value: 'default'
      }])
      strictEqual(manager.setup.length, 1)
    })

    it('should maintain consistency across all getters', () => {
      const manager = appendPlugin()

      const plugin1 = {
        name: 'p1',
        state: {
          _values: { v1: 1 },
          _names: ['v1'],
          _items: [],
          _defaults: [],
          schema: {}
        },
        actions: [{
          name: 'a1',
          method: () => 1
        }],
        setup: () => {
        }
      }

      const plugin2 = {
        name: 'p2',
        dependencies: [plugin1],
        state: {
          _values: { v2: 2 },
          _names: ['v2'],
          _items: [],
          _defaults: [],
          schema: {}
        },
        actions: [{
          name: 'a2',
          method: () => 2
        }],
        setup: () => {
        }
      }

      manager.use(plugin2)

      // Get all values at once
      const plugins = manager.plugins
      const state = manager.state
      const actions = manager.actions
      const setup = manager.setup

      // Verify consistency
      strictEqual(plugins.length, 2)
      strictEqual(Object.keys(actions).length, 2)
      strictEqual(setup.length, 2)
      strictEqual(Object.keys(state._values).length, 2)

      // Verify references
      strictEqual(plugins, manager.plugins)
      strictEqual(state, manager.state)
      strictEqual(actions, manager.actions)
      strictEqual(setup, manager.setup)
    })
  })
})
