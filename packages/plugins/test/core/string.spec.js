import { describe, it } from 'node:test'
import { strictEqual } from 'node:assert'
import { stringReplace } from '#core'

describe('String plugin - replace action', () => {
  describe('Basic string replacement', () => {
    it('should replace the first occurrence of a substring', () => {
      const result = stringReplace({
        value: 'hello world',
        pattern: 'world',
        replacement: 'there'
      })
      strictEqual(result, 'hello there', 'Should replace "world" with "there"')
    })

    it('should only replace the first occurrence when pattern is a string', () => {
      const result = stringReplace({
        value: 'test test test',
        pattern: 'test',
        replacement: 'demo'
      })
      strictEqual(result, 'demo test test', 'Should only replace first occurrence')
    })

    it('should handle empty string value', () => {
      const result = stringReplace({
        value: '',
        pattern: 'test',
        replacement: 'demo'
      })
      strictEqual(result, '', 'Should return empty string')
    })

    it('should handle empty pattern (inserts replacement at start)', () => {
      const result = stringReplace({
        value: 'test',
        pattern: '',
        replacement: 'pre-'
      })
      // 'pre-test' in most JS engines for String.replace with empty string pattern
      strictEqual(result, 'pre-test', 'Should insert replacement at start')
    })

    it('should handle empty replacement (removes pattern)', () => {
      const result = stringReplace({
        value: 'hello world',
        pattern: 'world',
        replacement: ''
      })
      strictEqual(result, 'hello ', 'Should remove the pattern')
    })
  })

  describe('RegExp replacement', () => {
    it('should replace matches using a RegExp pattern', () => {
      const result = stringReplace({
        value: 'hello world',
        pattern: /world/,
        replacement: 'there'
      })
      strictEqual(result, 'hello there', 'Should replace match')
    })

    it('should replace all occurrences with global RegExp', () => {
      const result = stringReplace({
        value: 'test test test',
        pattern: /test/g,
        replacement: 'demo'
      })
      strictEqual(result, 'demo demo demo', 'Should replace all occurrences')
    })

    it('should be case insensitive with "i" flag', () => {
      const result = stringReplace({
        value: 'Hello World',
        pattern: /world/i,
        replacement: 'there'
      })
      strictEqual(result, 'Hello there', 'Should replace match ignoring case')
    })
  })

  describe('Special replacement patterns', () => {
    it('should handle $$ to insert a dollar sign', () => {
      const result = stringReplace({
        value: 'price: 10',
        pattern: '10',
        replacement: '$$10'
      })
      strictEqual(result, 'price: $10', 'Should insert dollar sign')
    })

    it('should handle $& to insert the matched substring', () => {
      const result = stringReplace({
        value: 'hello world',
        pattern: 'world',
        replacement: 'beautiful $&'
      })
      strictEqual(result, 'hello beautiful world', 'Should insert matched substring')
    })

    it('should handle $` to insert the portion of the string that precedes the matched substring', () => {
      const result = stringReplace({
        value: 'hello world',
        pattern: 'world',
        replacement: '$`'
      })
      strictEqual(result, 'hello hello ', 'Should insert preceding portion')
    })

    it('should handle $\' to insert the portion of the string that follows the matched substring', () => {
      const result = stringReplace({
        value: 'hello world!',
        pattern: 'hello',
        replacement: '$\''
      })
      strictEqual(result, ' world! world!', 'Should insert following portion')
    })
  })

  describe('Edge cases and Error Handling', () => {
    it('should return original string if no match found', () => {
      const result = stringReplace({
        value: 'hello world',
        pattern: 'universe',
        replacement: 'there'
      })
      strictEqual(result, 'hello world', 'Should return original string')
    })

    // Note: The implementation assumes inputs are valid strings/RegExps as per JSDoc types.
    // If `value` is undefined/null, it will throw. We can verify this behavior if desired,
    // but usually type safety is assumed or handled by the caller/runtime validation.
    // Given the plugin implementation is just `return value.replace(...)`, it will throw on null/undefined value.
  })
})
