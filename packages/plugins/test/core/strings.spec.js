import { describe, it } from 'node:test'
import { strictEqual, ok } from 'node:assert'
import { createPluginTester } from '@dooksa/test'
import { string } from '#core'

/**
 * Helper function to set up the string plugin for testing
 * @param {import('node:test').TestContext} t - Test context
 * @returns {Object} Object with tester and string plugin instance
 */
function setupStringPlugin (t) {
  const tester = createPluginTester(t)

  // Create observable instance of string plugin
  const stringPlugin = tester.spy('string', string)

  return {
    tester,
    stringPlugin
  }
}

describe('String plugin - replace action', () => {
  describe('Basic string replacement', () => {
    it('should replace single character', async (t) => {
      const { tester, stringPlugin } = setupStringPlugin(t)

      const result = stringPlugin.stringReplace({
        value: '111',
        pattern: '1',
        replacement: '0'
      })

      strictEqual(result, '011')

      tester.restoreAll()
    })

    it('should replace multiple characters', async (t) => {
      const { tester, stringPlugin } = setupStringPlugin(t)

      const result = stringPlugin.stringReplace({
        value: 'hello world',
        pattern: 'world',
        replacement: 'universe'
      })

      strictEqual(result, 'hello universe')

      tester.restoreAll()
    })

    it('should replace with empty string', async (t) => {
      const { tester, stringPlugin } = setupStringPlugin(t)

      const result = stringPlugin.stringReplace({
        value: 'hello world',
        pattern: 'world',
        replacement: ''
      })

      strictEqual(result, 'hello ')

      tester.restoreAll()
    })

    it('should replace with special characters', async (t) => {
      const { tester, stringPlugin } = setupStringPlugin(t)

      const result = stringPlugin.stringReplace({
        value: 'test string',
        pattern: 'string',
        replacement: '!@#$%^&*()'
      })

      strictEqual(result, 'test !@#$%^&*()')

      tester.restoreAll()
    })
  })

  describe('Pattern as string', () => {
    it('should replace with string pattern', async (t) => {
      const { tester, stringPlugin } = setupStringPlugin(t)

      const result = stringPlugin.stringReplace({
        value: 'foo bar baz',
        pattern: 'bar',
        replacement: 'qux'
      })

      strictEqual(result, 'foo qux baz')

      tester.restoreAll()
    })

    it('should only replace first occurrence with string pattern', async (t) => {
      const { tester, stringPlugin } = setupStringPlugin(t)

      const result = stringPlugin.stringReplace({
        value: 'aaa',
        pattern: 'a',
        replacement: 'b'
      })

      strictEqual(result, 'baa')

      tester.restoreAll()
    })
  })

  describe('Pattern as RegExp', () => {
    it('should replace with RegExp pattern (global)', async (t) => {
      const { tester, stringPlugin } = setupStringPlugin(t)

      const result = stringPlugin.stringReplace({
        value: 'aaa',
        pattern: /a/g,
        replacement: 'b'
      })

      strictEqual(result, 'bbb')

      tester.restoreAll()
    })

    it('should replace with RegExp pattern (case-insensitive)', async (t) => {
      const { tester, stringPlugin } = setupStringPlugin(t)

      const result = stringPlugin.stringReplace({
        value: 'Hello World',
        pattern: /hello/i,
        replacement: 'Hi'
      })

      strictEqual(result, 'Hi World')

      tester.restoreAll()
    })

    it('should replace with RegExp pattern (multiple matches)', async (t) => {
      const { tester, stringPlugin } = setupStringPlugin(t)

      const result = stringPlugin.stringReplace({
        value: 'test123test456test',
        pattern: /\d+/g,
        replacement: 'X'
      })

      strictEqual(result, 'testXtestXtest')

      tester.restoreAll()
    })
  })

  describe('Edge cases', () => {
    it('should handle empty value string', async (t) => {
      const { tester, stringPlugin } = setupStringPlugin(t)

      const result = stringPlugin.stringReplace({
        value: '',
        pattern: 'anything',
        replacement: 'something'
      })

      strictEqual(result, '')

      tester.restoreAll()
    })

    it('should handle pattern not found', async (t) => {
      const { tester, stringPlugin } = setupStringPlugin(t)

      const result = stringPlugin.stringReplace({
        value: 'hello world',
        pattern: 'xyz',
        replacement: 'abc'
      })

      strictEqual(result, 'hello world')

      tester.restoreAll()
    })

    it('should handle empty pattern', async (t) => {
      const { tester, stringPlugin } = setupStringPlugin(t)

      const result = stringPlugin.stringReplace({
        value: 'hello',
        pattern: '',
        replacement: 'X'
      })

      // Empty pattern should insert replacement at the beginning
      strictEqual(result, 'Xhello')

      tester.restoreAll()
    })

    it('should handle replacement with undefined', async (t) => {
      const { tester, stringPlugin } = setupStringPlugin(t)

      const result = stringPlugin.stringReplace({
        value: 'hello world',
        pattern: 'world',
        replacement: undefined
      })

      // undefined is converted to string "undefined"
      strictEqual(result, 'hello undefined')

      tester.restoreAll()
    })

    it('should handle replacement with null', async (t) => {
      const { tester, stringPlugin } = setupStringPlugin(t)

      const result = stringPlugin.stringReplace({
        value: 'hello world',
        pattern: 'world',
        replacement: null
      })

      // null is converted to string "null"
      strictEqual(result, 'hello null')

      tester.restoreAll()
    })

    it('should handle replacement with number', async (t) => {
      const { tester, stringPlugin } = setupStringPlugin(t)

      const result = stringPlugin.stringReplace({
        value: 'hello world',
        pattern: 'world',
        replacement: 123
      })

      // number is converted to string
      strictEqual(result, 'hello 123')

      tester.restoreAll()
    })

    it('should handle replacement with object', async (t) => {
      const { tester, stringPlugin } = setupStringPlugin(t)

      const result = stringPlugin.stringReplace({
        value: 'hello world',
        pattern: 'world',
        replacement: { key: 'value' }
      })

      // object is converted to string
      ok(result.includes('[object Object]'))

      tester.restoreAll()
    })

    it('should handle special regex characters in string pattern', async (t) => {
      const { tester, stringPlugin } = setupStringPlugin(t)

      const result = stringPlugin.stringReplace({
        value: 'test.com',
        pattern: '.',
        replacement: 'X'
      })

      // String pattern treats '.' as literal dot
      strictEqual(result, 'testXcom')

      tester.restoreAll()
    })

    it('should handle Unicode characters', async (t) => {
      const { tester, stringPlugin } = setupStringPlugin(t)

      const result = stringPlugin.stringReplace({
        value: 'Hello 世界',
        pattern: '世界',
        replacement: 'World'
      })

      strictEqual(result, 'Hello World')

      tester.restoreAll()
    })

    it('should handle emoji replacement', async (t) => {
      const { tester, stringPlugin } = setupStringPlugin(t)

      const result = stringPlugin.stringReplace({
        value: 'I ❤️ JavaScript',
        pattern: '❤️',
        replacement: '❤️'
      })

      strictEqual(result, 'I ❤️ JavaScript')

      tester.restoreAll()
    })
  })

  describe('Complex patterns', () => {
    it('should replace with capture groups', async (t) => {
      const { tester, stringPlugin } = setupStringPlugin(t)

      const result = stringPlugin.stringReplace({
        value: 'John Doe',
        pattern: /(\w+) (\w+)/,
        replacement: '$2, $1'
      })

      strictEqual(result, 'Doe, John')

      tester.restoreAll()
    })

    it('should replace with function replacement', async (t) => {
      const { tester, stringPlugin } = setupStringPlugin(t)

      const result = stringPlugin.stringReplace({
        value: 'a b c',
        pattern: /\w+/g,
        replacement: (match) => match.toUpperCase()
      })

      strictEqual(result, 'A B C')

      tester.restoreAll()
    })

    it('should replace with complex regex', async (t) => {
      const { tester, stringPlugin } = setupStringPlugin(t)

      const result = stringPlugin.stringReplace({
        value: 'Price: $100.00',
        pattern: /\$\d+(\.\d{2})?/,
        replacement: '$99.99'
      })

      strictEqual(result, 'Price: $99.99')

      tester.restoreAll()
    })
  })

  describe('Plugin instance verification', () => {
    it('should verify plugin is properly created', async (t) => {
      const { tester, stringPlugin } = setupStringPlugin(t)

      ok(stringPlugin)
      ok(typeof stringPlugin.stringReplace === 'function')

      tester.restoreAll()
    })

    it('should verify method is callable', async (t) => {
      const { tester, stringPlugin } = setupStringPlugin(t)

      const result = stringPlugin.stringReplace({
        value: 'test',
        pattern: 't',
        replacement: 'x'
      })

      strictEqual(typeof result, 'string')
      strictEqual(result, 'xest')

      tester.restoreAll()
    })
  })
})
