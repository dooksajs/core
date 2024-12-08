import { describe, it } from 'node:test'
import { equal, strictEqual } from 'node:assert'
import { regexPattern } from '#client'

describe('Regular expression pattern plugin', function () {
  it('Match a character combination in a string', function () {
    const result = regexPattern({
      pattern: 'apple',
      flags: 'i'
    })
    strictEqual(result.test('ilikeapple'), true)
  })
})
