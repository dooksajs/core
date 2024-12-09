import { createPlugin, mapState } from '../src/index.js'
import { describe, it } from 'node:test'
import { deepStrictEqual, strictEqual } from 'node:assert'

describe('Map state', function () {
  it('should map named schema', function () {
    const plugin = createPlugin('test', {
      state: {
        schema: {
          products: {
            type: 'string'
          },
          items: {
            type: 'number'
          },
          people: {
            type: 'string'
          }
        }
      }
    })

    const mappedState = mapState(plugin, ['products', 'people'])

    deepStrictEqual(mappedState, {
      schema: {
        people: {
          type: 'string'
        },
        products: {
          type: 'string'
        }
      }
    })
  })

  it('should deep clone schema', function () {
    const plugin = createPlugin('test', {
      state: {
        schema: {
          products: {
            type: 'string'
          },
          items: {
            type: 'number'
          },
          people: {
            type: 'string'
          }
        }
      }
    })

    const mappedState = mapState(plugin)

    deepStrictEqual(mappedState, {
      schema: {
        products: {
          type: 'string'
        },
        items: {
          type: 'number'
        },
        people: {
          type: 'string'
        }
      }
    })
  })

  it('should throw an error if there is no named schema', function () {
    try {
      const plugin = createPlugin('test', {
        state: {
          schema: {
            products: {
              type: 'string'
            }
          }
        }
      })

      // attempt to map items
      mapState(plugin, ['items'])
    } catch (error) {
      strictEqual(error.message, 'DooksaError: mapState could not find property name "items"')
    }
  })

  it('should throw an error if there is no schema', function () {
    try {
      const plugin = createPlugin('test', {})

      // attempt to map schema
      mapState(plugin)

    } catch (error) {
      strictEqual(error.message, 'DooksaError: mapState could not find state schema')
    }
  })

  it('should throw an error if there is no plugin', function () {
    try {
      // attempt to map schema
      // @ts-expect-error
      mapState()

    } catch (error) {
      strictEqual(error.message, 'DooksaError: mapState expects a plugin')
    }
  })
})
