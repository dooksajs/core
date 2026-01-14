import { describe, it } from 'node:test'
import { strictEqual, deepStrictEqual, throws } from 'node:assert'
import createPlugin from '../src/index.js'

describe('Restore functionality (DEV)', function () {
  it('should add restore method in development', function () {
    const plugin = createPlugin('test', {
      metadata: { title: 'Test' },
      data: {
        count: 0
      }
    })

    strictEqual(typeof plugin.restore, 'function')
  })

  it('should restore context data', function () {
    const plugin = createPlugin('test', {
      metadata: { title: 'Test' },
      data: {
        count: 0
      },
      methods: {
        getCount () {
          return this.count
        },
        incrementCount () {
          return ++this.count
        }
      }
    })

    strictEqual(plugin.testGetCount(), 0)

    plugin.testIncrementCount()

    strictEqual(plugin.testGetCount(), 1)

    plugin.restore()

    strictEqual(plugin.testGetCount(), 0)
  })
})
