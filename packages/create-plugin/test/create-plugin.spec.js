import createPlugin from '../src/index.js'
import { describe, it } from 'node:test'
import { deepStrictEqual, strictEqual } from 'node:assert'

describe('Create plugin', function () {
  const metadata = {
    title: 'Test',
    description: 'This is a test',
    component: 'test-component-id',
    icon: 'mdi-test'
  }

  it('should return a plugin with metadata defaults', function () {
    const plugin = createPlugin('test', { metadata })

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

    deepStrictEqual(plugin.setup(), 'hello!')
  })

  it('should return the schema', function () {
    const plugin = createPlugin('test', {
      metadata,
      schema: {
        items: {
          type: 'collection',
          items: {
            type: 'string'
          }
        }
      }
    })

    deepStrictEqual(plugin.schema, {
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

      deepStrictEqual(plugin.setup(), 'redDogHello!')
    })
  })

  describe('Schema', function () {
    it('default id function contextual this should be bound to the plugins context', function () {
      const plugin = createPlugin('test', {
        metadata,
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
        },
        data: {
          colour: 'red'
        }
      })

      // @ts-ignore
      strictEqual(plugin.schema.$items[0].entries[1].entry.id.default(), 'red')
    })

    it('prefix id function contextual this should be bound to the plugins context', function () {
      const plugin = createPlugin('test', {
        metadata,
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
        },
        data: {
          colour: 'red'
        }
      })

      // @ts-ignore
      strictEqual(plugin.schema.$items[0].entries[1].entry.id.prefix(), 'red')
    })

    it('suffix id function contextual this should be bound to the plugins context', function () {
      const plugin = createPlugin('test', {
        metadata,
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
        },
        data: {
          colour: 'red'
        }
      })

      // @ts-ignore
      strictEqual(plugin.schema.$items[0].entries[1].entry.id.suffix(), 'red')
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
})
