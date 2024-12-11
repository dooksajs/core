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
})
