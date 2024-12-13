import { describe, it, beforeEach } from 'node:test'
import { deepStrictEqual, strictEqual } from 'node:assert'
import { mockState } from '#mock'

describe('State', function () {
  /** @type {import('../../src/client/state.js').state} */
  let state

  describe('Setup', function () {
    beforeEach(async function () {
      state = await mockState([{
        name: 'test',
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
      }])
    })

    it('should add schema', function () {
      deepStrictEqual(state.stateGetSchema('test/items'), {
        type: 'collection'
      })
      deepStrictEqual(state.stateGetSchema('test/items/items'), {
        type: 'string'
      })
    })

    it('should add schema names to data/collections', function () {
      deepStrictEqual(state.stateGetValue({
        name: 'data/collections'
      }).item, ['test/items'])
    })
  })

  describe('UnsafeSetValue', function () {
    it('should set value regardless of type', async function () {
      const state = await mockState([{
        name: 'test',
        state: {
          schema: {
            items: {
              type: 'string'
            }
          }
        }
      }])

      state.stateUnsafeSetValue({
        name: 'test/items',
        value: 123
      })

      strictEqual(state.stateGetValue({
        name: 'test/items'
      }).item, 123)
    })
    it('should set value by ID regardless of type', async function () {
      const state = await mockState([{
        name: 'test',
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
      }])

      const item = state.stateUnsafeSetValue({
        name: 'test/items',
        value: 123,
        options: {
          id: 'test'
        }
      })

      strictEqual(state.stateGetValue({
        name: 'test/items',
        id: item.id
      }).item, 123)
    })

    it('should set value should dispatch "update" listener once', async function (t) {
      const state = await mockState([{
        name: 'test',
        state: {
          schema: {
            items: {
              type: 'string'
            }
          }
        }
      }])
      const mockHandler = t.mock.fn(function (data) {
        return data
      })

      state.stateAddListener({
        name: 'test/items',
        on: 'update',
        handler: mockHandler
      })

      state.stateUnsafeSetValue({
        name: 'test/items',
        value: 123
      })

      strictEqual(mockHandler.mock.callCount(), 1)
    })

    it('should set value should dispatch "update" listener zero times', async function (t) {
      const state = await mockState([{
        name: 'test',
        state: {
          schema: {
            items: {
              type: 'string'
            }
          }
        }
      }])
      const mockHandler = t.mock.fn(function () {
      })

      state.stateAddListener({
        name: 'test/items',
        on: 'update',
        handler: mockHandler
      })

      state.stateUnsafeSetValue({
        name: 'test/items',
        value: 123,
        options: {
          stopPropagation: true
        }
      })

      strictEqual(mockHandler.mock.callCount(), 0)
    })

    it('should fail with an undefined option id property', async function () {
      const state = await mockState([{
        name: 'test',
        state: {
          schema: {
            items: {
              type: 'string'
            }
          }
        }
      }])

      try {
        state.stateUnsafeSetValue({
          name: 'test/items',
          value: 123,
          options: {
            id: null
          }
        })
      } catch (error) {
        strictEqual(error.message, 'UnsafeSetValue unexpected id type found "null"')
      }
    })
  })

  describe('SetValue', function () {
    it('should fail if no schema is found', async function () {
      const state = await mockState([{
        name: 'test',
        state: {
          schema: {
            items: {
              type: 'string'
            }
          }
        }
      }])

      try {
        state.stateSetValue({
          name: 'schema/notFound',
          value: 123
        })
      } catch (error) {
        strictEqual(error.message, 'Schema not found')
      }
    })

    it('should fail if no value is provided', async function () {
      const state = await mockState([{
        name: 'test',
        state: {
          schema: {
            items: {
              type: 'string'
            }
          }
        }
      }])

      try {
        state.stateSetValue({
          name: 'test/items',
          value: null
        })
      } catch (error) {
        strictEqual(error.schemaPath, 'test/items')
        strictEqual(error.message, 'Source was undefined')
      }
    })

  })
})
