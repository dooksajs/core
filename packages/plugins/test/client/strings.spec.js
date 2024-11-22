import { describe, it } from 'node:test'
import { strictEqual } from 'node:assert'
import { stringReplace } from '#client'

describe('StringReplace Plugin', function () {
  it('should return a modified string', function () {
    const result = stringReplace({
      value: '111',
      pattern: '1',
      replacement: '0'
    })
    strictEqual(result, '011')
  })
})
