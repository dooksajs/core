import { describe, it } from 'node:test'
import { strictEqual } from 'node:assert'
import { removeAffix } from '../../src/utils/data-value.js'

describe('removeAffix', function () {
  describe('Basic functionality', function () {
    it('should remove prefix and suffix from ID', function () {
      strictEqual(removeAffix('prefix_id_suffix'), '_id_')
    })

    it('should handle ID with multiple underscores', function () {
      strictEqual(removeAffix('prefix_id_with_underscores_suffix'), '_id_with_underscores_')
    })

    it('should return original ID if no affixes present', function () {
      strictEqual(removeAffix('simple_id'), 'simple_id')
    })

    it('should return original ID if only one underscore', function () {
      strictEqual(removeAffix('prefix_id'), 'prefix_id')
    })

    it('should return original ID if only two underscores', function () {
      strictEqual(removeAffix('prefix__id'), 'prefix__id')
    })
  })

  describe('Edge cases', function () {
    it('should handle empty string', function () {
      strictEqual(removeAffix(''), '')
    })

    it('should handle null', function () {
      strictEqual(removeAffix(null), '')
    })

    it('should handle undefined', function () {
      strictEqual(removeAffix(undefined), '')
    })

    it('should handle ID with only underscores', function () {
      strictEqual(removeAffix('___'), '___')
    })

    it('should handle ID starting with underscore', function () {
      strictEqual(removeAffix('_id_suffix'), '_id_')
    })

    it('should handle ID ending with underscore', function () {
      strictEqual(removeAffix('prefix_id_'), '_id_')
    })

    it('should handle ID with empty prefix', function () {
      strictEqual(removeAffix('_id_suffix'), '_id_')
    })

    it('should handle ID with empty suffix', function () {
      strictEqual(removeAffix('prefix_id_'), '_id_')
    })

    it('should handle ID with empty prefix and suffix', function () {
      strictEqual(removeAffix('__id__'), '__id__')
    })

    it('should handle ID with special characters', function () {
      strictEqual(removeAffix('prefix@#$id^&*suffix'), 'prefix@#$id^&*suffix')
    })

    it('should handle ID with numbers', function () {
      strictEqual(removeAffix('prefix123_id456_suffix789'), '_id456_')
    })

    it('should handle ID with spaces', function () {
      strictEqual(removeAffix('prefix id_suffix id'), 'prefix id_suffix id')
    })

    it('should handle very long ID', function () {
      const longId = 'verylongprefix_' + 'a'.repeat(100) + '_verylongsuffix'
      strictEqual(removeAffix(longId), '_' + 'a'.repeat(100) + '_')
    })
  })

  describe('Boundary cases', function () {
    it('should handle single character ID', function () {
      strictEqual(removeAffix('a'), 'a')
    })

    it('should handle single character with affixes', function () {
      strictEqual(removeAffix('p_a_s'), '_a_')
    })

    it('should handle ID with exactly three parts', function () {
      strictEqual(removeAffix('a_b_c'), '_b_')
    })

    it('should handle ID with more than three parts', function () {
      strictEqual(removeAffix('a_b_c_d_e'), '_b_c_d_')
    })

    it('should handle ID with Unicode characters', function () {
      strictEqual(removeAffix('prefix_ñ_id_é_suffix'), '_ñ_id_é_')
    })

    it('should handle ID with emojis', function () {
      strictEqual(removeAffix('prefix_😀_id_🎉_suffix'), '_😀_id_🎉_')
    })
  })

  describe('Consistency', function () {
    it('should be pure function', function () {
      const input = 'prefix_id_suffix'
      const result1 = removeAffix(input)
      const result2 = removeAffix(input)
      strictEqual(result1, result2)
      strictEqual(input, 'prefix_id_suffix')
    })

    it('should return new string instance', function () {
      const input = 'prefix_id_suffix'
      const result = removeAffix(input)
      strictEqual(result !== input, true)
    })

    it('should handle consecutive calls', function () {
      strictEqual(
        removeAffix(removeAffix('prefix_id_suffix')),
        '_id_'
      )
    })
  })
})
