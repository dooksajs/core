import { createPlugin, mapSchema } from '../src/index.js'
import { describe, it } from 'node:test'
import { deepStrictEqual, strictEqual } from 'node:assert'

describe('Map schema', function () {
  it('should map named schema', function () {
    const plugin = createPlugin('test', {
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

    const mappedSchema = mapSchema(plugin, ['products', 'people'])

    deepStrictEqual(mappedSchema, {
      people: {
        type: 'string'
      },
      products: {
        type: 'string'
      }
    })
  })

  it('should shallow copy schema', function () {
    const plugin = createPlugin('test', {
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

    const mappedSchema = mapSchema(plugin)

    deepStrictEqual(mappedSchema, {
      products: {
        type: 'string'
      },
      items: {
        type: 'number'
      },
      people: {
        type: 'string'
      }
    })
  })

  it('should throw an error if there is no named schema', function () {
    try {
      const plugin = createPlugin('test', {
        schema: {
          products: {
            type: 'string'
          }
        }
      })

      // attempt to map items
      mapSchema(plugin, ['items'])
    } catch (error) {
      strictEqual(error.message, 'DooksaError: mapSchema could not find property name "items"')
    }
  })

  it('should throw an error if there is no schema', function () {
    try {
      const plugin = createPlugin('test', {})

      // attempt to map schema
      mapSchema(plugin)

    } catch (error) {
      strictEqual(error.message, 'DooksaError: mapSchema could not schema')
    }
  })
})
