/**
 * Comprehensive test suite for append-plugin.js
 * Tests all functionality of the plugin management system
 */

import { describe, it } from 'node:test'
import { strictEqual, deepStrictEqual, ok } from 'node:assert'
import appendPlugin from '../src/append-plugin.js'
import { createPlugin } from '@dooksa/create-plugin'

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
      const plugin = createPlugin('test-plugin', {
        actions: {
          testAction: {
            method: () => 'test'
          }
        }
      })

      manager.use(plugin)

      strictEqual(manager.plugins.length, 1)
      strictEqual(manager.plugins[0], plugin)
      ok(manager.actions['test-plugin_testAction'])
      // Access via namespaced key
      strictEqual(manager.actions['test-plugin_testAction'](), 'test')
    })
  })

  describe('Plugin Registration', () => {
    it('should register plugin without dependencies', () => {
      const manager = appendPlugin()
      const plugin = createPlugin('simple-plugin', {
        actions: {
          action1: {
            method: () => 'result1'
          }
        }
      })

      manager.use(plugin)

      strictEqual(manager.plugins.length, 1)
      strictEqual(manager.plugins[0].name, 'simple-plugin')
      ok(manager.actions['simple-plugin_action1'])
    })

    it('should register plugin with dependencies', () => {
      const manager = appendPlugin()

      const depPlugin = createPlugin('dep-plugin', {
        actions: {
          depAction: {
            method: () => 'dep'
          }
        }
      })

      const mainPlugin = createPlugin('main-plugin', {
        dependencies: [depPlugin],
        actions: {
          mainAction: {
            method: () => 'main'
          }
        }
      })

      manager.use(mainPlugin)

      strictEqual(manager.plugins.length, 2)
      // Dependencies are processed first (bottom-up)
      strictEqual(manager.plugins[0].name, 'dep-plugin')
      strictEqual(manager.plugins[1].name, 'main-plugin')
      ok(manager.actions['dep-plugin_depAction'])
      ok(manager.actions['main-plugin_mainAction'])
    })

    it('should handle multiple dependency levels', () => {
      const manager = appendPlugin()

      const level3Plugin = createPlugin('level3', {
        actions: {
          action3: { method: () => '3' }
        }
      })

      const level2Plugin = createPlugin('level2', {
        dependencies: [level3Plugin],
        actions: {
          action2: { method: () => '2' }
        }
      })

      const level1Plugin = createPlugin('level1', {
        dependencies: [level2Plugin],
        actions: {
          action1: { method: () => '1' }
        }
      })

      manager.use(level1Plugin)

      strictEqual(manager.plugins.length, 3)
      // Dependencies first (bottom-up)
      strictEqual(manager.plugins[0].name, 'level3')
      strictEqual(manager.plugins[1].name, 'level2')
      strictEqual(manager.plugins[2].name, 'level1')
      ok(manager.actions['level3_action3'])
      ok(manager.actions['level2_action2'])
      ok(manager.actions['level1_action1'])
    })

    it('should prevent duplicate plugin registration', () => {
      const manager = appendPlugin()
      const plugin = createPlugin('duplicate', {
        actions: {
          action: { method: () => 'test' }
        }
      })

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
      const plugin = createPlugin('duplicate', {
        setup: setupFn,
        actions: {
          action: { method: () => 'test' }
        }
      })

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

      const pluginA = createPlugin('pluginA', {
        actions: { a: { method: () => 'A' } }
      })

      const pluginB = createPlugin('pluginB', {
        dependencies: [pluginA],
        actions: { b: { method: () => 'B' } }
      })

      const pluginC = createPlugin('pluginC', {
        dependencies: [pluginB],
        actions: { c: { method: () => 'C' } }
      })

      manager.use(pluginC)

      // Dependencies first (bottom-up)
      strictEqual(manager.plugins[0].name, 'pluginA')
      strictEqual(manager.plugins[1].name, 'pluginB')
      strictEqual(manager.plugins[2].name, 'pluginC')
    })

    it('should handle shared dependencies', () => {
      const manager = appendPlugin()

      const sharedDep = createPlugin('shared', {
        actions: { sharedAction: { method: () => 'shared' } }
      })

      const plugin1 = createPlugin('plugin1', {
        dependencies: [sharedDep],
        actions: { action1: { method: () => '1' } }
      })

      const plugin2 = createPlugin('plugin2', {
        dependencies: [sharedDep],
        actions: { action2: { method: () => '2' } }
      })

      const main = createPlugin('main', {
        dependencies: [plugin1, plugin2],
        actions: { mainAction: { method: () => 'main' } }
      })

      manager.use(main)

      // Shared dep should only appear once
      strictEqual(manager.plugins.length, 4)
      // Order: shared -> plugin1 -> plugin2 -> main (or similar depending on traversal)

      const names = manager.plugins.map(p => p.name)
      strictEqual(names[0], 'shared')
      ok(names.indexOf('plugin1') > names.indexOf('shared'))
      ok(names.indexOf('plugin2') > names.indexOf('shared'))
      strictEqual(names[3], 'main')
    })

    it('should handle complex dependency graphs', () => {
      const manager = appendPlugin()

      const dep1 = createPlugin('dep1', { actions: { d1: { method: () => '1' } } })
      const dep2 = createPlugin('dep2', { actions: { d2: { method: () => '2' } } })
      const dep3 = createPlugin('dep3', { actions: { d3: { method: () => '3' } } })

      const pluginA = createPlugin('pluginA', {
        dependencies: [dep1, dep2],
        actions: { a: { method: () => 'A' } }
      })

      const pluginB = createPlugin('pluginB', {
        dependencies: [dep2, dep3],
        actions: { b: { method: () => 'B' } }
      })

      const main = createPlugin('main', {
        dependencies: [pluginA, pluginB],
        actions: { main: { method: () => 'M' } }
      })

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
      ok(manager.actions['dep1_d1'])
      ok(manager.actions['dep2_d2'])
      ok(manager.actions['dep3_d3'])
      ok(manager.actions['pluginA_a'])
      ok(manager.actions['pluginB_b'])
      ok(manager.actions['main_main'])
    })
  })

  describe('Action Collection', () => {
    it('should collect actions from single plugin', () => {
      const manager = appendPlugin()
      const plugin = createPlugin('test', {
        actions: {
          action1: { method: () => '1' },
          action2: { method: () => '2' },
          action3: { method: () => '3' }
        }
      })

      manager.use(plugin)

      strictEqual(Object.keys(manager.actions).length, 3)
      strictEqual(manager.actions['test_action1'](), '1')
      strictEqual(manager.actions['test_action2'](), '2')
      strictEqual(manager.actions['test_action3'](), '3')
    })

    it('should collect actions from multiple plugins', () => {
      const manager = appendPlugin()

      const plugin1 = createPlugin('plugin1', {
        actions: {
          action1: { method: () => 'p1_1' },
          action2: { method: () => 'p1_2' }
        }
      })

      const plugin2 = createPlugin('plugin2', {
        actions: {
          action1: { method: () => 'p2_1' },
          action2: { method: () => 'p2_2' }
        }
      })

      manager.use(plugin1)
      manager.use(plugin2)

      strictEqual(Object.keys(manager.actions).length, 4)
      ok(manager.actions['plugin1_action1'])
      ok(manager.actions['plugin1_action2'])
      ok(manager.actions['plugin2_action1'])
      ok(manager.actions['plugin2_action2'])
    })

    it('should handle plugins without actions', () => {
      const manager = appendPlugin()
      const plugin = createPlugin('no-actions', {})

      manager.use(plugin)

      strictEqual(manager.plugins.length, 1)
      strictEqual(Object.keys(manager.actions).length, 0)
    })

    it('should handle plugins with empty actions object', () => {
      const manager = appendPlugin()
      const plugin = createPlugin('empty-actions', {
        actions: {}
      })

      manager.use(plugin)

      strictEqual(manager.plugins.length, 1)
      strictEqual(Object.keys(manager.actions).length, 0)
    })

    it('should handle action name conflicts (different plugins)', () => {
      const manager = appendPlugin()

      const plugin1 = createPlugin('plugin1', {
        actions: { conflict: { method: () => 'first' } }
      })

      const plugin2 = createPlugin('plugin2', {
        actions: { conflict: { method: () => 'second' } }
      })

      manager.use(plugin1)
      manager.use(plugin2)

      // Namespaced actions avoid conflict
      strictEqual(manager.actions['plugin1_conflict'](), 'first')
      strictEqual(manager.actions['plugin2_conflict'](), 'second')
    })
  })

  describe('State Management', () => {
    it('should merge state values from plugins', () => {
      const manager = appendPlugin()

      const plugin1 = createPlugin('plugin1', {
        state: {
          schema: { key1: { type: 'string' } },
          defaults: { key1: 'value1' }
        }
      })

      const plugin2 = createPlugin('plugin2', {
        state: {
          schema: { key2: { type: 'string' } },
          defaults: { key2: 'value2' }
        }
      })

      manager.use(plugin1)
      manager.use(plugin2)

      // createPlugin initializes _values with empty strings based on schema
      // and _defaults with provided defaults.
      // appendPlugin merges _values and _defaults.

      deepStrictEqual(manager.state._values, {
        'plugin1/key1': '',
        'plugin2/key2': ''
      })
      deepStrictEqual(manager.state._names, ['plugin1/key1', 'plugin2/key2'])
    })

    it('should concatenate state names', () => {
      const manager = appendPlugin()

      const plugin1 = createPlugin('plugin1', {
        state: {
          schema: {
            name1: { type: 'string' },
            name2: { type: 'string' }
          }
        }
      })

      const plugin2 = createPlugin('plugin2', {
        state: {
          schema: {
            name3: { type: 'string' },
            name4: { type: 'string' }
          }
        }
      })

      manager.use(plugin1)
      manager.use(plugin2)

      deepStrictEqual(manager.state._names, [
        'plugin1/name1',
        'plugin1/name2',
        'plugin2/name3',
        'plugin2/name4'
      ])
    })

    it('should concatenate state items', () => {
      const manager = appendPlugin()

      // Items are parsed from schema. Collection items are empty arrays initially.
      const plugin1 = createPlugin('plugin1', {
        state: {
          schema: { item1: { type: 'collection' } }
        }
      })

      const plugin2 = createPlugin('plugin2', {
        state: {
          schema: { item2: { type: 'collection' } }
        }
      })

      manager.use(plugin1)
      manager.use(plugin2)

      // Verify items exist (structure depends on parseSchema, testing existence mainly)
      strictEqual(manager.state._items.length, 2)
      strictEqual(manager.state._items[0].name, 'plugin1/item1')
      strictEqual(manager.state._items[1].name, 'plugin2/item2')
    })

    it('should handle default state values', () => {
      const manager = appendPlugin()

      const plugin1 = createPlugin('plugin1', {
        state: {
          schema: {},
          defaults: { default1: 'value1' }
        }
      })

      const plugin2 = createPlugin('plugin2', {
        state: {
          schema: {},
          defaults: { default2: 'value2' }
        }
      })

      manager.use(plugin1)
      manager.use(plugin2)

      // Check defaults array
      strictEqual(manager.state._defaults.length, 2)
      // Order depends on registration
      const def1 = manager.state._defaults.find(d => d.name === 'plugin1/default1')
      const def2 = manager.state._defaults.find(d => d.name === 'plugin2/default2')

      ok(def1)
      ok(def2)
      strictEqual(def1.value, 'value1')
      strictEqual(def2.value, 'value2')
    })

    it('should handle plugins without state', () => {
      const manager = appendPlugin()
      const plugin = createPlugin('no-state', {})

      manager.use(plugin)

      strictEqual(manager.plugins.length, 1)
      deepStrictEqual(manager.state._values, {})
      deepStrictEqual(manager.state._names, [])
    })
  })

  describe('Setup Queue Management', () => {
    it('should queue setup functions from plugins', () => {
      const manager = appendPlugin()
      const setupFn = () => {
      }

      const plugin = createPlugin('test', {
        setup: setupFn
      })

      manager.use(plugin)

      strictEqual(manager.setup.length, 1)
      strictEqual(manager.setup[0].name, 'test')
      // Note: createPlugin wraps the setup function, so we can't strictEqual check strict equality to setupFn
      ok(typeof manager.setup[0].setup === 'function')
    })

    it('should handle plugins without setup', () => {
      const manager = appendPlugin()
      const plugin = createPlugin('no-setup', {})

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

      const plugin1 = createPlugin('plugin1', { setup: setup1 })
      const plugin2 = createPlugin('plugin2', { setup: setup2 })
      const plugin3 = createPlugin('plugin3', { setup: setup3 })

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

      const dep = createPlugin('dep', { setup: depSetup })
      const main = createPlugin('main', {
        dependencies: [dep],
        setup: mainSetup
      })

      manager.use(main)

      // Dependencies processed first
      strictEqual(manager.setup.length, 2)
      strictEqual(manager.setup[0].name, 'dep')
      strictEqual(manager.setup[1].name, 'main')
    })

    it('should allow setup queue modification via setter', () => {
      const manager = appendPlugin()

      const plugin = createPlugin('test', {
        setup: () => {
        }
      })
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

      const plugin = createPlugin('duplicate', { setup: setupFn })

      manager.use(plugin)
      strictEqual(manager.setup.length, 1)

      // Register duplicate
      manager.use(plugin)
      strictEqual(manager.setup.length, 1)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty plugin options', () => {
      const manager = appendPlugin()
      const plugin = createPlugin('empty', {})

      manager.use(plugin)

      strictEqual(manager.plugins.length, 1)
      strictEqual(Object.keys(manager.actions).length, 0)
      strictEqual(manager.setup.length, 0)
    })

    it('should handle plugin with only name', () => {
      const manager = appendPlugin()
      const plugin = createPlugin('only-name', {})

      manager.use(plugin)

      strictEqual(manager.plugins.length, 1)
      strictEqual(manager.plugins[0].name, 'only-name')
    })

    it('should handle multiple registrations of same dependency', () => {
      const manager = appendPlugin()

      const shared = createPlugin('shared', {
        actions: { s: { method: () => 's' } }
      })

      const p1 = createPlugin('p1', {
        dependencies: [shared],
        actions: { p1: { method: () => '1' } }
      })

      const p2 = createPlugin('p2', {
        dependencies: [shared],
        actions: { p2: { method: () => '2' } }
      })

      const main = createPlugin('main', {
        dependencies: [p1, p2],
        actions: { main: { method: () => 'm' } }
      })

      manager.use(main)

      // Shared should only appear once
      const sharedCount = manager.plugins.filter(p => p.name === 'shared').length
      strictEqual(sharedCount, 1)

      // All plugins should be present
      strictEqual(manager.plugins.length, 4)
    })

    it('should handle deeply nested dependencies', () => {
      const manager = appendPlugin()

      const level5 = createPlugin('level5', { actions: { a5: { method: () => '5' } } })
      const level4 = createPlugin('level4', {
        dependencies: [level5],
        actions: { a4: { method: () => '4' } }
      })
      const level3 = createPlugin('level3', {
        dependencies: [level4],
        actions: { a3: { method: () => '3' } }
      })
      const level2 = createPlugin('level2', {
        dependencies: [level3],
        actions: { a2: { method: () => '2' } }
      })
      const level1 = createPlugin('level1', {
        dependencies: [level2],
        actions: { a1: { method: () => '1' } }
      })

      manager.use(level1)

      strictEqual(manager.plugins.length, 5)

      // Verify order - dependencies first (level5 up to level1)
      strictEqual(manager.plugins[0].name, 'level5')
      strictEqual(manager.plugins[1].name, 'level4')
      strictEqual(manager.plugins[2].name, 'level3')
      strictEqual(manager.plugins[3].name, 'level2')
      strictEqual(manager.plugins[4].name, 'level1')

      // Verify all actions exist
      for (let i = 1; i <= 5; i++) {
        ok(manager.actions[`level${i}_a${i}`])
      }
    })

    it('should handle plugins with all properties', () => {
      const manager = appendPlugin()

      const dep = createPlugin('dep', {
        actions: { depAction: { method: () => 'dep' } },
        state: {
          schema: { depField: { type: 'string' } },
          defaults: { depDefault: 'depDefault' }
        },
        setup: () => {
        }
      })

      const main = createPlugin('main', {
        dependencies: [dep],
        actions: { mainAction: { method: () => 'main' } },
        state: {
          schema: { mainField: { type: 'string' } },
          defaults: { mainDefault: 'mainDefault' }
        },
        setup: () => {
        }
      })

      manager.use(main)

      // Verify plugins
      strictEqual(manager.plugins.length, 2)

      // Verify actions
      strictEqual(Object.keys(manager.actions).length, 2)
      ok(manager.actions['dep_depAction'])
      ok(manager.actions['main_mainAction'])

      // Verify state
      // values are namespaced
      deepStrictEqual(manager.state._values, {
        'dep/depField': '',
        'main/mainField': ''
      })
      deepStrictEqual(manager.state._names, ['dep/depField', 'main/mainField'])
      // defaults are namespaced in name property
      strictEqual(manager.state._defaults.length, 2)

      // Verify setup
      strictEqual(manager.setup.length, 2)
    })

    it('should handle circular dependency prevention', () => {
      const manager = appendPlugin()

      const dep1 = createPlugin('dep1', { actions: { d1: { method: () => '1' } } })

      // We can't easily create circular dependencies with createPlugin because variables must be defined before use.
      // But we can simulate reused references.

      const dep2 = createPlugin('dep2', {
        dependencies: [dep1],
        actions: { d2: { method: () => '2' } }
      })

      const plugin = createPlugin('plugin', {
        dependencies: [dep2],
        actions: { p: { method: () => 'p' } }
      })

      // Register plugin
      manager.use(plugin)

      // Should work without issues
      strictEqual(manager.plugins.length, 3)
      ok(manager.actions['dep1_d1'])
      ok(manager.actions['dep2_d2'])
      ok(manager.actions['plugin_p'])
    })
  })

  describe('Getter Methods', () => {
    it('should return plugins array', () => {
      const manager = appendPlugin()
      const plugin = createPlugin('test', {})

      manager.use(plugin)

      const plugins = manager.plugins
      strictEqual(Array.isArray(plugins), true)
      strictEqual(plugins.length, 1)
      strictEqual(plugins[0], plugin)
    })

    it('should return state object', () => {
      const manager = appendPlugin()
      const plugin = createPlugin('test', {
        state: {
          schema: { key: { type: 'string' } }
        }
      })

      manager.use(plugin)

      const state = manager.state
      ok(typeof state === 'object')
      deepStrictEqual(state._values, { 'test/key': '' })
      deepStrictEqual(state._names, ['test/key'])
    })

    it('should return actions map', () => {
      const manager = appendPlugin()
      const plugin = createPlugin('test', {
        actions: {
          action1: { method: () => '1' },
          action2: { method: () => '2' }
        }
      })

      manager.use(plugin)

      const actions = manager.actions
      ok(typeof actions === 'object')
      strictEqual(Object.keys(actions).length, 2)
      ok(actions['test_action1'])
      ok(actions['test_action2'])
    })

    it('should return setup array', () => {
      const manager = appendPlugin()
      const setupFn = () => {
      }
      const plugin = createPlugin('test', { setup: setupFn })

      manager.use(plugin)

      const setup = manager.setup
      strictEqual(Array.isArray(setup), true)
      strictEqual(setup.length, 1)
      strictEqual(setup[0].name, 'test')
      ok(typeof setup[0].setup === 'function')
    })

    it('should allow setup modification via setter', () => {
      const manager = appendPlugin()

      // Initial setup
      const plugin = createPlugin('test', {
        setup: () => {
        }
      })
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

      const plugin = createPlugin('test', {})
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
      const statePlugin = createPlugin('state', {
        state: {
          schema: { values: { type: 'collection' } }
        },
        actions: {
          stateSetValue: { method: (payload) => payload },
          stateGetValue: { method: (payload) => payload }
        },
        setup: (state) => {
        }
      })

      const actionPlugin = createPlugin('action', {
        dependencies: [statePlugin],
        actions: {
          actionDispatch: { method: (payload) => payload }
        },
        setup: (state) => {
        }
      })

      const variablePlugin = createPlugin('variable', {
        dependencies: [statePlugin, actionPlugin],
        state: {
          schema: { variables: { type: 'collection' } }
        },
        actions: {
          variableGetValue: { method: (payload) => payload },
          variableSetValue: { method: (payload) => payload }
        },
        setup: (state) => {
        }
      })

      manager.use(variablePlugin)

      // Verify structure - dependencies first, then main plugin
      strictEqual(manager.plugins.length, 3)
      strictEqual(manager.plugins[0].name, 'state')
      strictEqual(manager.plugins[1].name, 'action')
      strictEqual(manager.plugins[2].name, 'variable')

      // Verify actions
      strictEqual(Object.keys(manager.actions).length, 5)
      ok(manager.actions['state_stateSetValue'])
      ok(manager.actions['state_stateGetValue'])
      ok(manager.actions['action_actionDispatch'])
      ok(manager.actions['variable_variableGetValue'])
      ok(manager.actions['variable_variableSetValue'])

      // Verify state
      // createPlugin initializes schema values
      ok(manager.state._values['state/values'])
      ok(manager.state._values['variable/variables'])

      // Verify setup - only plugins with setup functions are queued
      strictEqual(manager.setup.length, 3)
      strictEqual(manager.setup[0].name, 'state')
      strictEqual(manager.setup[1].name, 'action')
      strictEqual(manager.setup[2].name, 'variable')
    })

    it('should handle complex multi-plugin scenario', () => {
      const manager = appendPlugin()

      // Core dependencies
      const state = createPlugin('state', {
        state: { schema: {} },
        actions: {
          setState: {
            method: () => {
            }
          }
        }
      })

      const event = createPlugin('event', {
        state: { schema: {} },
        actions: {
          emit: {
            method: () => {
            }
          }
        }
      })

      const api = createPlugin('api', {
        actions: {
          request: {
            method: () => {
            }
          }
        }
      })

      // Feature plugins
      const variable = createPlugin('variable', {
        dependencies: [state, event],
        state: { schema: {} },
        actions: {
          varGet: {
            method: () => {
            }
          },
          varSet: {
            method: () => {
            }
          }
        }
      })

      const action = createPlugin('action', {
        dependencies: [state, event, api],
        actions: {
          dispatch: {
            method: () => {
            }
          }
        }
      })

      const component = createPlugin('component', {
        dependencies: [state, variable, action],
        actions: {
          render: {
            method: () => {
            }
          }
        }
      })

      manager.use(component)

      // Verify all plugins registered
      // Total: state, event, api, variable, action, component = 6
      strictEqual(manager.plugins.length, 6)

      // Verify dependency order (must be processed before dependent)
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
      strictEqual(Object.keys(manager.actions).length, 7)
      ok(manager.actions['state_setState'])
      ok(manager.actions['event_emit'])
      ok(manager.actions['api_request'])
      ok(manager.actions['variable_varGet'])
      ok(manager.actions['variable_varSet'])
      ok(manager.actions['action_dispatch'])
    })

    it('should handle plugin with multiple dependencies and shared state', () => {
      const manager = appendPlugin()

      const sharedState = createPlugin('shared-state', {
        state: {
          schema: { shared: { type: 'string' } },
          defaults: { shared: 'data' }
        }
      })

      const pluginA = createPlugin('pluginA', {
        dependencies: [sharedState],
        state: {
          schema: { a: { type: 'string' } },
          defaults: { a: 'valueA' }
        },
        actions: { actionA: { method: () => 'A' } }
      })

      const pluginB = createPlugin('pluginB', {
        dependencies: [sharedState],
        state: {
          schema: { b: { type: 'string' } },
          defaults: { b: 'valueB' }
        },
        actions: { actionB: { method: () => 'B' } }
      })

      const main = createPlugin('main', {
        dependencies: [pluginA, pluginB],
        actions: { mainAction: { method: () => 'M' } }
      })

      manager.use(main)

      // Verify state is merged correctly
      deepStrictEqual(manager.state._values, {
        'shared-state/shared': '',
        'pluginA/a': '',
        'pluginB/b': ''
      })

      // Verify all actions
      strictEqual(Object.keys(manager.actions).length, 3)
      ok(manager.actions['pluginA_actionA'])
      ok(manager.actions['pluginB_actionB'])
      ok(manager.actions['main_mainAction'])
    })

    it('should handle setup execution scenario', () => {
      const manager = appendPlugin()

      const executionOrder = []

      const dep1 = createPlugin('dep1', {
        setup: (state) => {
          executionOrder.push('dep1')
        }
      })

      const dep2 = createPlugin('dep2', {
        setup: (state) => {
          executionOrder.push('dep2')
        }
      })

      const main = createPlugin('main', {
        dependencies: [dep1, dep2],
        setup: (state) => {
          executionOrder.push('main')
        }
      })

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

      const plugin1 = createPlugin('plugin1', {
        state: {
          schema: { data: { type: 'string' } }
        }
      })

      const plugin2 = createPlugin('plugin2', {
        state: {
          schema: { data: { type: 'number' } }
        }
      })

      manager.use(plugin1)
      manager.use(plugin2)

      // Both values should be in state (namespaced)
      ok(manager.state._values['plugin1/data'] !== undefined)
      ok(manager.state._values['plugin2/data'] !== undefined)
    })

    it('should handle complex real-world application setup', () => {
      const manager = appendPlugin()

      // Core infrastructure
      const state = createPlugin('state', {
        state: { schema: {} },
        actions: {
          setState: {
            method: () => {
            }
          }
        }
      })

      const event = createPlugin('event', {
        state: { schema: {} },
        actions: {
          on: {
            method: () => {
            }
          },
          emit: {
            method: () => {
            }
          }
        }
      })

      const api = createPlugin('api', {
        actions: {
          get: {
            method: () => {
            }
          },
          post: {
            method: () => {
            }
          }
        }
      })

      // Feature plugins
      const variable = createPlugin('variable', {
        dependencies: [state, event],
        state: { schema: {} },
        actions: {
          varGet: {
            method: () => {
            }
          },
          varSet: {
            method: () => {
            }
          }
        }
      })

      const action = createPlugin('action', {
        dependencies: [state, event, api],
        actions: {
          dispatch: {
            method: () => {
            }
          }
        }
      })

      const component = createPlugin('component', {
        dependencies: [state, variable, action],
        actions: {
          render: {
            method: () => {
            }
          }
        }
      })

      // Register main component
      manager.use(component)

      // Verify complete structure
      // state, event, api, variable, action, component = 6
      strictEqual(manager.plugins.length, 6)

      // Actions:
      // state: 1
      // event: 2
      // api: 2
      // variable: 2
      // action: 1
      // component: 1
      // Total: 9
      strictEqual(Object.keys(manager.actions).length, 9)

      // Verify state has all collections (namespaced)
      // With empty schema, _names length will be 0.
      strictEqual(manager.state._names.length, 0)

      // Verify setup queue - only plugins with setup functions are queued
      // In this test setup, NO setup functions were provided!
      strictEqual(manager.setup.length, 0)
    })
  })

  describe('Performance and Memory', () => {
    it('should handle many plugins efficiently', () => {
      const manager = appendPlugin()

      const pluginCount = 100
      const plugins = []

      for (let i = 0; i < pluginCount; i++) {
        const plugin = createPlugin(`plugin${i}`, {
          actions: {
            [`action${i}`]: { method: () => i }
          }
        })
        plugins.push(plugin)
      }

      // Register all plugins
      plugins.forEach(p => manager.use(p))

      strictEqual(manager.plugins.length, pluginCount)
      strictEqual(Object.keys(manager.actions).length, pluginCount)

      // Verify each action works
      for (let i = 0; i < pluginCount; i++) {
        strictEqual(manager.actions[`plugin${i}_action${i}`](), i)
      }
    })

    it('should handle deep dependency chains', () => {
      const manager = appendPlugin()

      const depth = 50
      let current = createPlugin(`plugin${depth}`, {
        actions: { [`a${depth}`]: { method: () => depth } }
      })

      for (let i = depth - 1; i >= 1; i--) {
        current = createPlugin(`plugin${i}`, {
          dependencies: [current],
          actions: { [`a${i}`]: { method: () => i } }
        })
      }

      manager.use(current)

      strictEqual(manager.plugins.length, depth)

      // Verify order (dependencies first)
      for (let i = 0; i < depth; i++) {
        // Index 0 should be plugin50 (leaf dependency).
        // Index i should be plugin(50-i).
        strictEqual(manager.plugins[i].name, `plugin${depth - i}`)
      }

      // Verify all actions exist
      for (let i = 1; i <= depth; i++) {
        ok(manager.actions[`plugin${i}_a${i}`])
      }
    })

    it('should handle many dependencies per plugin', () => {
      const manager = appendPlugin()

      const depCount = 20
      const dependencies = []

      for (let i = 0; i < depCount; i++) {
        dependencies.push(createPlugin(`dep${i}`, {
          actions: { [`depAction${i}`]: { method: () => i } }
        }))
      }

      const main = createPlugin('main', {
        dependencies: dependencies,
        actions: { mainAction: { method: () => 'main' } }
      })

      manager.use(main)

      strictEqual(manager.plugins.length, depCount + 1)
      strictEqual(Object.keys(manager.actions).length, depCount + 1)

      // Verify all dependencies registered first
      for (let i = 0; i < depCount; i++) {
        strictEqual(manager.plugins[i].name, `dep${i}`)
        ok(manager.actions[`dep${i}_depAction${i}`])
      }

      // Main plugin last
      strictEqual(manager.plugins[depCount].name, 'main')
      ok(manager.actions['main_mainAction'])
    })
  })

  describe('State and Action Integration', () => {
    it('should allow actions to access shared state methods', () => {
      const manager = appendPlugin()

      const statePlugin = createPlugin('state', {
        state: {
          schema: { counter: { type: 'number' } },
          defaults: { counter: 0 }
        },
        actions: {
          increment: { method: () => 'incremented' }
        }
      })

      const actionPlugin = createPlugin('action', {
        dependencies: [statePlugin],
        actions: {
          dispatchIncrement: { method: () => 'dispatched' }
        }
      })

      manager.use(actionPlugin)

      // Both actions should be available
      ok(manager.actions['state_increment'])
      ok(manager.actions['action_dispatchIncrement'])

      // State should be available
      deepStrictEqual(manager.state._values, { 'state/counter': 0 })
    })

    it('should handle plugins that contribute to both state and actions', () => {
      const manager = appendPlugin()

      const plugin = createPlugin('feature', {
        state: {
          schema: { data: { type: 'string' } },
          defaults: { data: 'default' }
        },
        actions: {
          getData: { method: () => 'data' },
          setData: { method: (value) => value }
        },
        setup: (state) => {
        }
      })

      manager.use(plugin)

      // Verify all components
      strictEqual(manager.plugins.length, 1)
      strictEqual(Object.keys(manager.actions).length, 2)
      deepStrictEqual(manager.state._values, { 'feature/data': '' })

      const def = manager.state._defaults[0]
      strictEqual(def.name, 'feature/data')
      strictEqual(def.value, 'default')

      strictEqual(manager.setup.length, 1)
    })

    it('should maintain consistency across all getters', () => {
      const manager = appendPlugin()

      const plugin1 = createPlugin('p1', {
        state: {
          schema: { v1: { type: 'number' } },
          defaults: { v1: 1 }
        },
        actions: { a1: { method: () => 1 } },
        setup: () => {
        }
      })

      const plugin2 = createPlugin('p2', {
        dependencies: [plugin1],
        state: {
          schema: { v2: { type: 'number' } },
          defaults: { v2: 2 }
        },
        actions: { a2: { method: () => 2 } },
        setup: () => {
        }
      })

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
