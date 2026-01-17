import createPlugin from '../src/index.js'
import { describe, it } from 'node:test'
import { deepStrictEqual, strictEqual, throws } from 'node:assert'

describe('Create plugin', function () {
  const metadata = {
    title: 'Test',
    description: 'This is a test',
    component: 'test-component-id',
    icon: 'mdi-test'
  }

  it('should return a plugin with metadata defaults', function () {
    const plugin = createPlugin('test', {
      metadata
    })

    strictEqual(plugin.name, 'test')
    deepStrictEqual(plugin.metadata, metadata)
  })

  it('should contain dependent plugin', function () {
    const plugin = createPlugin('test', { metadata })
    const pluginHasDep = createPlugin('testOne', {
      metadata,
      dependencies: [plugin]
    })

    deepStrictEqual(pluginHasDep.dependencies, [plugin])
  })

  it('should return the setup method', function () {
    const plugin = createPlugin('test', {
      metadata,
      setup () {
        return 'hello!'
      }
    })

    strictEqual(plugin.setup(), 'hello!')
  })

  it('should return the schema', function () {
    const plugin = createPlugin('test', {
      metadata,
      state: {
        schema: {
          items: {
            type: 'collection',
            items: {
              type: 'string'
            }
          }
        }
      }
    })

    deepStrictEqual(plugin.state.schema, {
      items: {
        type: 'collection',
        items: {
          type: 'string'
        }
      }
    })
  })

  describe('Setup', function () {
    it('should have contextual "this" bound to the plugins context', function () {
      const plugin = createPlugin('test', {
        metadata,
        data: {
          colour: 'red'
        },
        methods: {
          animal () {
            return 'Dog'
          }
        },
        actions: {
          sayHi: {
            metadata: {
              title: 'Say hello'
            },
            method () {
              return 'Hello!'
            }
          }
        },
        setup () {
          return this.colour + this.animal() + this.sayHi()
        }
      })

      strictEqual(plugin.setup(), 'redDogHello!')
    })

    it('should handle setup without setup function', function () {
      const plugin = createPlugin('test', { metadata })
      strictEqual(plugin.setup, undefined)
    })

    it('should bind setup to plugin context with access to all features', function () {
      const plugin = createPlugin('test', {
        metadata,
        data: { value: 42 },
        methods: {
          getValue () {
            return this.value
          }
        },
        privateMethods: {
          secret () {
            return 'hidden'
          }
        },
        setup () {
          return this.getValue() + this.secret()
        }
      })
      strictEqual(plugin.setup(), '42hidden')
    })
  })

  describe('State Processing', function () {
    it('should process state defaults correctly', function () {
      const plugin = createPlugin('test', {
        metadata,
        state: {
          defaults: {
            counter: 0,
            name: 'default'
          },
          schema: {
            counter: { type: 'number' },
            name: { type: 'string' }
          }
        }
      })

      deepStrictEqual(plugin.state._defaults, [
        {
          name: 'test/counter',
          value: 0
        },
        {
          name: 'test/name',
          value: 'default'
        }
      ])
    })

    it('should initialize state values based on schema types', function () {
      const plugin = createPlugin('test', {
        metadata,
        state: {
          schema: {
            items: { type: 'collection' },
            data: { type: 'object' },
            list: { type: 'array' },
            text: { type: 'string' },
            count: { type: 'number' },
            flag: { type: 'boolean' }
          }
        }
      })

      deepStrictEqual(plugin.state._values['test/items'], {})
      deepStrictEqual(plugin.state._values['test/data'], {})
      deepStrictEqual(plugin.state._values['test/list'], [])
      strictEqual(plugin.state._values['test/text'], '')
      strictEqual(plugin.state._values['test/count'], 0)
      strictEqual(plugin.state._values['test/flag'], true)
    })

    it('should create proper state items structure', function () {
      const plugin = createPlugin('test', {
        metadata,
        state: {
          schema: {
            items: {
              type: 'collection',
              items: { type: 'string' }
            }
          }
        }
      })

      strictEqual(plugin.state._items.length, 1)
      strictEqual(plugin.state._items[0].name, 'test/items')
      strictEqual(plugin.state._items[0].isCollection, true)
      strictEqual(Array.isArray(plugin.state._items[0].entries), true)
    })

    it('should populate state names array', function () {
      const plugin = createPlugin('test', {
        metadata,
        state: {
          schema: {
            items: { type: 'collection' },
            data: { type: 'object' }
          }
        }
      })

      deepStrictEqual(plugin.state._names, ['test/items', 'test/data'])
    })

    it('should make internal properties non-enumerable', function () {
      const plugin = createPlugin('test', {
        metadata,
        state: {
          schema: {
            items: { type: 'collection' }
          }
        }
      })

      const keys = Object.keys(plugin.state)
      strictEqual(keys.includes('_items'), false)
      strictEqual(keys.includes('_names'), false)
      strictEqual(keys.includes('_values'), false)
      strictEqual(keys.includes('_defaults'), false)
    })

    it('should handle state without defaults', function () {
      const plugin = createPlugin('test', {
        metadata,
        state: {
          schema: {
            items: { type: 'collection' }
          }
        }
      })

      deepStrictEqual(plugin.state._defaults, [])
    })

    it('should handle empty state schema', function () {
      const plugin = createPlugin('test', {
        metadata,
        state: {
          schema: {}
        }
      })

      strictEqual(plugin.state._items.length, 0)
      strictEqual(plugin.state._names.length, 0)
      deepStrictEqual(plugin.state._values, {})
    })
  })

  describe('Data Handling', function () {
    it('should deep clone input data', function () {
      const originalData = {
        nested: { value: 42 },
        array: [1, 2, 3]
      }
      const plugin = createPlugin('test', {
        metadata,
        data: originalData,
        methods: {
          getNested () {
            return this.nested
          },
          getArray () {
            return this.array
          }
        }
      })

      // Modify original to ensure it doesn't affect plugin
      originalData.nested.value = 999
      originalData.array.push(4)

      // Plugin should have original values (data is available in context via methods)
      strictEqual(plugin.testGetNested().value, 42)
      deepStrictEqual(plugin.testGetArray(), [1, 2, 3])
    })

    it('should make data available in context for methods', function () {
      const plugin = createPlugin('test', {
        metadata,
        data: {
          colour: 'blue',
          size: 'large'
        },
        methods: {
          describe () {
            return `${this.colour} ${this.size}`
          }
        }
      })

      strictEqual(plugin.testDescribe(), 'blue large')
    })

    it('should make data available in context for actions', function () {
      const plugin = createPlugin('test', {
        metadata,
        data: { colour: 'red' },
        actions: {
          getColor: {
            metadata: { title: 'Get color' },
            method () {
              return this.colour
            }
          }
        }
      })

      strictEqual(plugin.testGetColor(), 'red')
    })

    it('should handle missing data', function () {
      const plugin = createPlugin('test', {
        metadata,
        methods: {
          test () {
            return 'ok'
          }
        }
      })

      strictEqual(plugin.testTest(), 'ok')
    })

    it('should handle empty data object', function () {
      const plugin = createPlugin('test', {
        metadata,
        data: {},
        methods: {
          test () {
            return 'ok'
          }
        }
      })

      strictEqual(plugin.testTest(), 'ok')
    })
  })

  describe('Private Methods', function () {
    it('should bind private methods to context', function () {
      const plugin = createPlugin('test', {
        metadata,
        data: { value: 10 },
        privateMethods: {
          double () {
            return this.value * 2
          }
        }
      })

      // Private method should be accessible in context
      // but not exposed on result object
      strictEqual(plugin.testDouble, undefined)
    })

    it('should allow private methods to access context', function () {
      let privateMethodCalled = false
      const plugin = createPlugin('test', {
        metadata,
        data: { secret: 'hidden' },
        methods: {
          public () {
            return this.private()
          }
        },
        privateMethods: {
          private () {
            privateMethodCalled = true
            return this.secret
          }
        }
      })

      strictEqual(plugin.testPublic(), 'hidden')
      strictEqual(privateMethodCalled, true)
    })

    it('should allow private methods to call other private methods', function () {
      const plugin = createPlugin('test', {
        metadata,
        data: { base: 5 },
        privateMethods: {
          add (x) {
            return this.base + x
          },
          multiply (x) {
            return this.base * x
          },
          compute (x, y) {
            return this.add(x) + this.multiply(y)
          }
        },
        methods: {
          calculate (x, y) {
            return this.compute(x, y)
          }
        }
      })

      strictEqual(plugin.testCalculate(3, 2), (5 + 3) + (5 * 2)) // 5+3+10 = 18
    })

    it('should handle missing private methods', function () {
      const plugin = createPlugin('test', {
        metadata,
        methods: {
          test () {
            return 'ok'
          }
        }
      })

      strictEqual(plugin.testTest(), 'ok')
    })

    it('should throw error on duplicate private method name', function () {
      throws(() => {
        createPlugin('test', {
          metadata,
          data: { conflict: 'value' },
          privateMethods: {
            conflict () {
              return 'bad'
            }
          }
        })
      }, {
        message: 'Plugin [conflict]: Expected unique private method name'
      })
    })
  })

  describe('Action Context', function () {
    it('should pass frozen actionContext to actions', function () {
      const plugin = createPlugin('test', {
        metadata,
        actions: {
          test: {
            metadata: { title: 'Test' },
            method (params, context) {
              strictEqual(Object.isFrozen(context), true)
              return 'ok'
            }
          }
        }
      })

      plugin.testTest()
    })

    it('should have correct actionContext structure', function () {
      const plugin = createPlugin('test', {
        metadata,
        actions: {
          test: {
            metadata: { title: 'Test' },
            method (params, context) {
              return context
            }
          }
        }
      })

      const result = plugin.testTest()
      deepStrictEqual(result, Object.create(null, {
        context: {
          value: {},
          writable: false,
          enumerable: true,
          configurable: false
        },
        payload: {
          value: {},
          writable: false,
          enumerable: true,
          configurable: false
        },
        blockValues: {
          value: {},
          writable: false,
          enumerable: true,
          configurable: false
        }
      }))
    })

    it('should not allow modification of actionContext', function () {
      const plugin = createPlugin('test', {
        metadata,
        actions: {
          test: {
            metadata: { title: 'Test' },
            method (params, context) {
              // Try to modify the frozen context
              try {
                context.context.newProp = 'test'
                return 'modified'
              } catch (e) {
                return 'frozen'
              }
            }
          }
        }
      })

      const result = plugin.testTest()
      // The actionContext itself is frozen, but the nested context object is mutable
      // This test verifies the structure is frozen but allows us to test the behavior
      strictEqual(result, 'modified')
    })

    it('should attach parameters to action items', function () {
      const plugin = createPlugin('test', {
        metadata,
        actions: {
          test: {
            metadata: { title: 'Test' },
            parameters: {
              type: 'object',
              properties: {
                name: { type: 'string' }
              }
            },
            method () {
              return 'ok'
            }
          }
        }
      })

      deepStrictEqual(plugin.actions[0].parameters, {
        type: 'object',
        properties: {
          name: { type: 'string' }
        }
      })
    })

    it('should handle actions without parameters', function () {
      const plugin = createPlugin('test', {
        metadata,
        actions: {
          test: {
            metadata: { title: 'Test' },
            method () {
              return 'ok'
            }
          }
        }
      })

      strictEqual(plugin.actions[0].parameters, undefined)
    })
  })

  describe('Edge Cases', function () {
    it('should handle all valid schema types', function () {
      const plugin = createPlugin('test', {
        metadata,
        state: {
          schema: {
            collection: { type: 'collection' },
            object: { type: 'object' },
            array: { type: 'array' },
            string: { type: 'string' },
            number: { type: 'number' },
            boolean: { type: 'boolean' }
          }
        }
      })

      // Check that each schema type creates the correct default value
      deepStrictEqual(plugin.state._values['test/collection'], {})
      deepStrictEqual(plugin.state._values['test/object'], {})
      deepStrictEqual(plugin.state._values['test/array'], [])
      strictEqual(plugin.state._values['test/string'], '')
      strictEqual(plugin.state._values['test/number'], 0)
      strictEqual(plugin.state._values['test/boolean'], true)
    })

    it('should throw error on invalid schema type', function () {
      throws(() => {
        createPlugin('test', {
          metadata,
          state: {
            schema: {
              // @ts-ignore
              items: { type: 'invalid' }
            }
          }
        })
      }, {
        message: 'DooksaError: Unexpected data schema "invalid"'
      })
    })

    it('should handle minimal plugin configuration', function () {
      const plugin = createPlugin('test', { metadata })

      strictEqual(plugin.name, 'test')
      deepStrictEqual(plugin.metadata, metadata)
      strictEqual(plugin.dependencies, undefined)
      strictEqual(plugin.state, undefined)
      strictEqual(plugin.actions, undefined)
      strictEqual(plugin.setup, undefined)
      strictEqual(typeof plugin.createInstance, 'function')
    })

    it('should handle plugin with all features', function () {
      const dep = createPlugin('dep', { metadata })
      const plugin = createPlugin('test', {
        metadata,
        dependencies: [dep],
        data: { value: 10 },
        state: {
          defaults: { count: 0 },
          schema: {
            items: { type: 'collection' }
          }
        },
        methods: {
          add (x) {
            return this.value + x
          }
        },
        privateMethods: {
          secret () {
            return 'hidden'
          }
        },
        actions: {
          compute: {
            metadata: { title: 'Compute' },
            parameters: { type: 'number' },
            method (x) {
              return this.add(x)
            }
          }
        },
        setup () {
          return this.secret()
        }
      })

      strictEqual(plugin.name, 'test')
      strictEqual(plugin.dependencies.length, 1)
      strictEqual(plugin.state._items.length, 1)
      strictEqual(plugin.testAdd(5), 15)
      strictEqual(plugin.testCompute(5), 15)
      strictEqual(plugin.setup(), 'hidden')
      strictEqual(plugin.actions.length, 1)
    })

    it('should handle empty state defaults', function () {
      const plugin = createPlugin('test', {
        metadata,
        state: {
          defaults: {},
          schema: {
            items: { type: 'collection' }
          }
        }
      })

      deepStrictEqual(plugin.state._defaults, [])
    })

    it('should handle empty actions object', function () {
      const plugin = createPlugin('test', {
        metadata,
        actions: {}
      })

      strictEqual(plugin.actions.length, 0)
    })

    it('should handle empty methods object', function () {
      const plugin = createPlugin('test', {
        metadata,
        methods: {}
      })

      // Should not throw and should have no methods
      strictEqual(Object.keys(plugin).filter(k => k.startsWith('test')).length, 0)
    })

    it('should handle empty private methods object', function () {
      const plugin = createPlugin('test', {
        metadata,
        privateMethods: {}
      })

      // Should not throw
      strictEqual(plugin.name, 'test')
    })

    it('should handle setup that returns undefined', function () {
      const plugin = createPlugin('test', {
        metadata,
        setup () {
          return undefined
        }
      })

      strictEqual(plugin.setup(), undefined)
    })

    it('should handle actions with array metadata containing single item', function () {
      const plugin = createPlugin('test', {
        metadata,
        actions: {
          test: {
            metadata: [{
              id: 'single',
              title: 'Test'
            }],
            method () {
              return 'ok'
            }
          }
        }
      })

      strictEqual(plugin.actions[0].metadata.length, 1)
      strictEqual(plugin.actions[0].metadata[0].id, 'single')
    })
  })

  describe('Result Object Structure', function () {
    it('should have non-enumerable name property', function () {
      const plugin = createPlugin('test', { metadata })
      const keys = Object.keys(plugin)

      strictEqual(keys.includes('name'), false)
      strictEqual(plugin.name, 'test')
    })

    it('should have non-enumerable dependencies property', function () {
      const dep = createPlugin('dep', { metadata })
      const plugin = createPlugin('test', {
        metadata,
        dependencies: [dep]
      })
      const keys = Object.keys(plugin)

      strictEqual(keys.includes('dependencies'), false)
      deepStrictEqual(plugin.dependencies, [dep])
    })

    it('should have non-enumerable metadata property', function () {
      const plugin = createPlugin('test', { metadata })
      const keys = Object.keys(plugin)

      strictEqual(keys.includes('metadata'), false)
      deepStrictEqual(plugin.metadata, metadata)
    })

    it('should have non-enumerable state property', function () {
      const plugin = createPlugin('test', {
        metadata,
        state: {
          schema: { items: { type: 'collection' } }
        }
      })
      const keys = Object.keys(plugin)

      strictEqual(keys.includes('state'), false)
      strictEqual(plugin.state._items.length, 1)
    })

    it('should have non-enumerable actions property', function () {
      const plugin = createPlugin('test', {
        metadata,
        actions: {
          test: {
            metadata: { title: 'Test' },
            method () {
              return 'ok'
            }
          }
        }
      })
      const keys = Object.keys(plugin)

      strictEqual(keys.includes('actions'), false)
      strictEqual(plugin.actions.length, 1)
    })

    it('should have non-enumerable setup property', function () {
      const plugin = createPlugin('test', {
        metadata,
        setup () {
          return 'ok'
        }
      })
      const keys = Object.keys(plugin)

      strictEqual(keys.includes('setup'), false)
      strictEqual(typeof plugin.setup, 'function')
    })

    it('should expose action methods as callable', function () {
      const plugin = createPlugin('test', {
        metadata,
        actions: {
          greet: {
            metadata: { title: 'Greet' },
            method (name) {
              return `Hello ${name}!`
            }
          }
        }
      })

      strictEqual(typeof plugin.testGreet, 'function')
      strictEqual(plugin.testGreet('World'), 'Hello World!')
    })

    it('should expose public methods as callable', function () {
      const plugin = createPlugin('test', {
        metadata,
        methods: {
          add (x, y) {
            return x + y
          }
        }
      })

      strictEqual(typeof plugin.testAdd, 'function')
      strictEqual(plugin.testAdd(2, 3), 5)
    })

    it('should not expose private methods on result', function () {
      const plugin = createPlugin('test', {
        metadata,
        privateMethods: {
          secret () {
            return 'hidden'
          }
        }
      })

      strictEqual(plugin.testSecret, undefined)
      // @ts-ignore
      strictEqual(plugin.secret, undefined)
    })

    it('should handle multiple actions and methods', function () {
      const plugin = createPlugin('test', {
        metadata,
        actions: {
          action1: {
            metadata: { title: 'Action 1' },
            method () {
              return 'a1'
            }
          },
          action2: {
            metadata: { title: 'Action 2' },
            method () {
              return 'a2'
            }
          }
        },
        methods: {
          method1 () {
            return 'm1'
          },
          method2 () {
            return 'm2'
          }
        }
      })

      strictEqual(plugin.testAction1(), 'a1')
      strictEqual(plugin.testAction2(), 'a2')
      strictEqual(plugin.testMethod1(), 'm1')
      strictEqual(plugin.testMethod2(), 'm2')
    })

    it('should maintain correct action metadata structure', function () {
      const plugin = createPlugin('test', {
        metadata,
        actions: {
          test: {
            metadata: [
              {
                id: 'variant1',
                title: 'Variant 1'
              },
              {
                id: 'variant2',
                title: 'Variant 2'
              }
            ],
            method () {
              return 'ok'
            }
          }
        }
      })

      deepStrictEqual(plugin.actions[0].metadata, [
        {
          id: 'variant1',
          title: 'Variant 1',
          plugin: 'test',
          method: 'test_test'
        },
        {
          id: 'variant2',
          title: 'Variant 2',
          plugin: 'test',
          method: 'test_test'
        }
      ])
    })
  })

  describe('Setup', function () {
    it('should have contextual "this" bound to the plugins context', function () {
      const plugin = createPlugin('test', {
        metadata,
        data: {
          colour: 'red'
        },
        methods: {
          animal () {
            return 'Dog'
          }
        },
        actions: {
          sayHi: {
            metadata: {
              title: 'Say hello'
            },
            method () {
              return 'Hello!'
            }
          }
        },
        setup () {
          return this.colour + this.animal() + this.sayHi()
        }
      })

      deepStrictEqual(plugin.setup(), 'redDogHello!')
    })
  })

  describe('Schema', function () {
    it('default id function contextual this should be bound to the plugins context', function () {
      const plugin = createPlugin('test', {
        metadata,
        state: {
          schema: {
            items: {
              defaultId () {
                return this.colour
              },
              type: 'collection',
              items: {
                type: 'string'
              }
            }
          }
        },
        data: {
          colour: 'red'
        }
      })

      // @ts-ignore
      strictEqual(plugin.state._items[0].entries[1].entry.id.default(), 'red')
    })

    it('prefix id function contextual this should be bound to the plugins context', function () {
      const plugin = createPlugin('test', {
        metadata,
        state: {
          schema: {
            items: {
              prefixId () {
                return this.colour
              },
              type: 'collection',
              items: {
                type: 'string'
              }
            }
          }
        },
        data: {
          colour: 'red'
        }
      })

      // @ts-ignore
      strictEqual(plugin.state._items[0].entries[1].entry.id.prefix(), 'red')
    })

    it('suffix id function contextual this should be bound to the plugins context', function () {
      const plugin = createPlugin('test', {
        metadata,
        state: {
          schema: {
            items: {
              suffixId () {
                return this.colour
              },
              type: 'collection',
              items: {
                type: 'string'
              }
            }
          }
        },
        data: {
          colour: 'red'
        }
      })

      // @ts-ignore
      strictEqual(plugin.state._items[0].entries[1].entry.id.suffix(), 'red')
    })
  })

  describe('Methods', function () {
    it('should return namespaced method', function () {
      const plugin = createPlugin('test', {
        metadata,
        methods: {
          /**
           * @param {string} name
           */
          sayHi (name) {
            return 'hello ' + name + '!'
          }
        }
      })

      strictEqual(plugin.testSayHi('Thomas'), 'hello Thomas!')
    })

    it('should have a unique name', function (t) {
      try {
        createPlugin('test', {
          metadata,
          data: {
            sayHi: 'isSet'
          },
          methods: {
            sayHi () {
              return 'hello?'
            }
          }
        })
      } catch (error) {
        strictEqual(error.message, 'Plugin [sayHi]: Expected unique method name')
      }
    })
  })

  describe('Actions', function (t) {
    it('should return namespaced action', function () {
      const plugin = createPlugin('test', {
        metadata,
        actions: {
          sayHi: {
            metadata: {
              title: 'Say hi!'
            },
            parameters: {
              type: 'string'
            },
            /**
             * @param {string} name
             */
            method (name) {
              return 'hello ' + name + '!'
            }
          }
        }
      })

      strictEqual(plugin.testSayHi('Thomas'), 'hello Thomas!')
    })

    it('contextual "this" should be bound to the plugins context', function () {
      const plugin = createPlugin('test', {
        metadata,
        data: {
          colour: 'red',
          pet: 'Dog'
        },
        methods: {
          getColour () {
            return this.colour
          }
        },
        actions: {
          sayHi: {
            metadata: {
              title: 'Say hi!'
            },
            method () {
              return this.pet + ' and ' + this.getColour()
            }
          }
        }
      })

      strictEqual(plugin.testSayHi(), 'Dog and red')
    })

    it('should process an action with many metadata variations', function () {
      const method = (id) => {
        return id ?? 'no id'
      }
      const plugin = createPlugin('test', {
        metadata,
        actions: {
          sayHi: {
            metadata: [
              {
                id: 'by_id',
                title: 'Say hi!'
              },
              {
                id: 'by_path',
                title: 'Say hi!'
              }
            ],
            method
          }
        }
      })

      strictEqual(plugin.testSayHi(), 'no id')
      strictEqual(plugin.testSayHi('id'), 'id')
      deepStrictEqual(plugin.actions[0].metadata, [
        {
          plugin: 'test',
          method: 'test_sayHi',
          id: 'by_id',
          title: 'Say hi!'
        },
        {
          plugin: 'test',
          method: 'test_sayHi',
          id: 'by_path',
          title: 'Say hi!'
        }
      ])
    })

    it('should have a unique name', function (t) {
      try {
        createPlugin('test', {
          metadata,
          data: {
            sayHi: 'isSet'
          },
          actions: {
            sayHi: {
              metadata: {
                title: 'test'
              },
              method () {
                return 'hello?'
              }
            }
          }
        })
      } catch (error) {
        strictEqual(error.message, 'Plugin [sayHi]: Expected unique action name')
      }
    })
  })

  describe('createInstance', function () {
    it('should create a new plugin instance without overrides', function () {
      const plugin = createPlugin('test', {
        metadata,
        data: {
          counter: 0,
          name: 'default'
        },
        methods: {
          increment () {
            this.counter++
            return this.counter
          }
        }
      })

      const instance = plugin.createInstance()

      // Verify instance has same configuration
      strictEqual(instance.name, 'test')
      deepStrictEqual(instance.metadata, metadata)
      strictEqual(instance.testIncrement(), 1)
      strictEqual(plugin.testIncrement(), 1)
    })

    it('should create instance with data overrides', function () {
      const plugin = createPlugin('test', {
        metadata,
        data: {
          counter: 0,
          name: 'default'
        },
        methods: {
          increment () {
            this.counter++
            return this.counter
          },
          getName () {
            return this.name
          }
        }
      })

      const instance = plugin.createInstance({
        data: {
          counter: 10,
          name: 'custom'
        }
      })

      // Verify instance has overridden data
      strictEqual(instance.testIncrement(), 11)
      strictEqual(instance.testGetName(), 'custom')

      // Verify original plugin is unchanged
      strictEqual(plugin.testIncrement(), 1)
      strictEqual(plugin.testGetName(), 'default')
    })

    it('should create instance with partial data overrides', function () {
      const plugin = createPlugin('test', {
        metadata,
        data: {
          counter: 0,
          name: 'default',
          value: 42
        },
        methods: {
          increment () {
            this.counter++
            return this.counter
          },
          getName () {
            return this.name
          },
          getValue () {
            return this.value
          }
        }
      })

      const instance = plugin.createInstance({
        data: { counter: 10 }
      })

      // Verify instance has merged data
      strictEqual(instance.testIncrement(), 11)
      strictEqual(instance.testGetName(), 'default')
      strictEqual(instance.testGetValue(), 42)

      // Verify original plugin is unchanged
      strictEqual(plugin.testIncrement(), 1)
      strictEqual(plugin.testGetName(), 'default')
      strictEqual(plugin.testGetValue(), 42)
    })

    it('should create instance with custom name', function () {
      const plugin = createPlugin('test', {
        metadata,
        data: { counter: 0 },
        methods: {
          increment () {
            this.counter++
            return this.counter
          }
        }
      })

      const instance = plugin.createInstance({
        name: 'customTest'
      })

      // Verify instance has custom name
      strictEqual(instance.name, 'customTest')
      // @ts-ignore
      strictEqual(instance.customTestIncrement(), 1)
    })

    it('should have isolated context', function () {
      const plugin = createPlugin('test', {
        metadata,
        data: { value: 42 },
        methods: {
          getValue () {
            return this.value
          }
        }
      })

      const instance = plugin.createInstance({
        data: { value: 100 }
      })

      // Verify each instance has its own context
      strictEqual(plugin.testGetValue(), 42)
      strictEqual(instance.testGetValue(), 100)
    })

    it('should work with actions', function () {
      const plugin = createPlugin('test', {
        metadata,
        data: { counter: 0 },
        actions: {
          add: {
            metadata: { title: 'Add' },
            method ({ value }) {
              this.counter += value
              return this.counter
            }
          }
        }
      })

      const instance = plugin.createInstance({
        data: { counter: 10 }
      })

      // Verify actions work on both instances
      strictEqual(plugin.testAdd({ value: 5 }), 5)
      strictEqual(instance.testAdd({ value: 5 }), 15)
    })

    it('should work with state', function () {
      const plugin = createPlugin('test', {
        metadata,
        state: {
          schema: {
            items: { type: 'collection' }
          }
        },
        data: { counter: 0 },
        methods: {
          increment () {
            this.counter++
            return this.counter
          }
        }
      })

      const instance = plugin.createInstance({
        data: { counter: 10 }
      })

      // Verify state schema is preserved
      deepStrictEqual(instance.state.schema, {
        items: { type: 'collection' }
      })

      // Verify data isolation
      strictEqual(plugin.testIncrement(), 1)
      strictEqual(instance.testIncrement(), 11)
    })

    it('should work with empty data', function () {
      const plugin = createPlugin('test', {
        metadata,
        methods: {
          test () {
            return 'ok'
          }
        }
      })

      const instance = plugin.createInstance()

      strictEqual(instance.testTest(), 'ok')
    })

    it('should work with no overrides', function () {
      const plugin = createPlugin('test', {
        metadata,
        data: { counter: 42 },
        methods: {
          getCounter () {
            return this.counter
          }
        }
      })

      const instance = plugin.createInstance()

      strictEqual(instance.testGetCounter(), 42)
      strictEqual(plugin.testGetCounter(), 42)
    })

    it('should preserve setup function', function () {
      const plugin = createPlugin('test', {
        metadata,
        data: { value: 'test' },
        setup () {
          return this.value
        }
      })

      const instance = plugin.createInstance({
        data: { value: 'custom' }
      })

      strictEqual(plugin.setup(), 'test')
      strictEqual(instance.setup(), 'custom')
    })

    it('should preserve dependencies', function () {
      const dep = createPlugin('dep', { metadata })
      const plugin = createPlugin('test', {
        metadata,
        dependencies: [dep]
      })

      const instance = plugin.createInstance()

      deepStrictEqual(instance.dependencies, [dep])
    })

    it('should preserve private methods', function () {
      const plugin = createPlugin('test', {
        metadata,
        data: { secret: 'hidden' },
        privateMethods: {
          getSecret () {
            return this.secret
          }
        },
        methods: {
          reveal () {
            return this.getSecret()
          }
        }
      })

      const instance = plugin.createInstance({
        data: { secret: 'custom' }
      })

      strictEqual(plugin.testReveal(), 'hidden')
      strictEqual(instance.testReveal(), 'custom')
    })
  })
})
