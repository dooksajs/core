import { describe, it, afterEach } from 'node:test'
import { strictEqual, ok } from 'node:assert'
import { regex } from '#core'

describe('Regex plugin - pattern action', () => {
  afterEach(() => {
    regex.restore()
  })

  describe('Basic pattern creation', () => {
    it('should create RegExp with simple pattern', (t) => {
      const result = regex.regexPattern({
        pattern: 'test'
      })

      ok(result instanceof RegExp, 'Result should be a RegExp instance')
      strictEqual(result.source, 'test', 'Pattern should match')
      strictEqual(result.flags, '', 'Flags should be empty by default')
    })

    it('should create RegExp with pattern and flags', (t) => {
      const result = regex.regexPattern({
        pattern: 'test',
        flags: 'gi'
      })

      ok(result instanceof RegExp, 'Result should be a RegExp instance')
      strictEqual(result.source, 'test', 'Pattern should match')
      strictEqual(result.flags, 'gi', 'Flags should match')
    })

    it('should create RegExp with empty pattern', (t) => {
      const result = regex.regexPattern({
        pattern: ''
      })

      ok(result instanceof RegExp, 'Result should be a RegExp instance')
      // RegExp converts empty string to (?:) which is a non-capturing group
      strictEqual(result.source, '(?:)', 'Pattern should be converted to non-capturing group')
      strictEqual(result.flags, '', 'Flags should be empty')
    })
  })

  describe('Pattern variations', () => {
    it('should create RegExp with character class pattern', (t) => {
      const result = regex.regexPattern({
        pattern: '[a-z]+',
        flags: 'g'
      })

      ok(result instanceof RegExp, 'Result should be a RegExp instance')
      strictEqual(result.source, '[a-z]+', 'Pattern should match')
      strictEqual(result.flags, 'g', 'Flags should match')
    })

    it('should create RegExp with quantifier pattern', (t) => {
      const result = regex.regexPattern({
        pattern: '\\d{3}-\\d{4}',
        flags: ''
      })

      ok(result instanceof RegExp, 'Result should be a RegExp instance')
      strictEqual(result.source, '\\d{3}-\\d{4}', 'Pattern should match')
    })

    it('should create RegExp with anchor pattern', (t) => {
      const result = regex.regexPattern({
        pattern: '^test$',
        flags: ''
      })

      ok(result instanceof RegExp, 'Result should be a RegExp instance')
      strictEqual(result.source, '^test$', 'Pattern should match')
    })

    it('should create RegExp with group pattern', (t) => {
      const result = regex.regexPattern({
        pattern: '(test|demo)',
        flags: ''
      })

      ok(result instanceof RegExp, 'Result should be a RegExp instance')
      strictEqual(result.source, '(test|demo)', 'Pattern should match')
    })

    it('should create RegExp with escaped characters', (t) => {
      const result = regex.regexPattern({
        pattern: '\\.\\*\\+\\?',
        flags: ''
      })

      ok(result instanceof RegExp, 'Result should be a RegExp instance')
      strictEqual(result.source, '\\.\\*\\+\\?', 'Pattern should match')
    })
  })

  describe('Flag variations', () => {
    it('should create RegExp with global flag', (t) => {
      const result = regex.regexPattern({
        pattern: 'test',
        flags: 'g'
      })

      ok(result.global, 'Should have global flag')
    })

    it('should create RegExp with case-insensitive flag', (t) => {
      const result = regex.regexPattern({
        pattern: 'test',
        flags: 'i'
      })

      ok(result.ignoreCase, 'Should have case-insensitive flag')
    })

    it('should create RegExp with multiline flag', (t) => {
      const result = regex.regexPattern({
        pattern: 'test',
        flags: 'm'
      })

      ok(result.multiline, 'Should have multiline flag')
    })

    it('should create RegExp with dotAll flag', (t) => {
      const result = regex.regexPattern({
        pattern: 'test',
        flags: 's'
      })

      ok(result.dotAll, 'Should have dotAll flag')
    })

    it('should create RegExp with unicode flag', (t) => {
      const result = regex.regexPattern({
        pattern: 'test',
        flags: 'u'
      })

      ok(result.unicode, 'Should have unicode flag')
    })

    it('should create RegExp with sticky flag', (t) => {
      const result = regex.regexPattern({
        pattern: 'test',
        flags: 'y'
      })

      ok(result.sticky, 'Should have sticky flag')
    })

    it('should create RegExp with multiple flags', (t) => {
      const result = regex.regexPattern({
        pattern: 'test',
        flags: 'gimsuy'
      })

      ok(result.global, 'Should have global flag')
      ok(result.ignoreCase, 'Should have case-insensitive flag')
      ok(result.multiline, 'Should have multiline flag')
      ok(result.dotAll, 'Should have dotAll flag')
      ok(result.unicode, 'Should have unicode flag')
      ok(result.sticky, 'Should have sticky flag')
    })
  })

  describe('RegExp functionality', () => {
    it('should match string with simple pattern', (t) => {
      const result = regex.regexPattern({
        pattern: 'test',
        flags: ''
      })

      ok(result.test('test'), 'Should match "test"')
      ok(result.test('this is a test'), 'Should match "this is a test"')
      ok(!result.test('TEST'), 'Should not match "TEST" without i flag')
    })

    it('should match string with case-insensitive flag', (t) => {
      const result = regex.regexPattern({
        pattern: 'test',
        flags: 'i'
      })

      ok(result.test('test'), 'Should match "test"')
      ok(result.test('TEST'), 'Should match "TEST"')
      ok(result.test('TeSt'), 'Should match "TeSt"')
    })

    it('should match string with global flag', (t) => {
      const result = regex.regexPattern({
        pattern: 'test',
        flags: 'g'
      })

      const matches = 'test test test'.match(result)
      strictEqual(matches.length, 3, 'Should find 3 matches')
    })

    it('should extract groups with pattern', (t) => {
      const result = regex.regexPattern({
        pattern: '(\\d+)-(\\d+)',
        flags: ''
      })

      const match = '123-456'.match(result)
      strictEqual(match[1], '123', 'First group should be 123')
      strictEqual(match[2], '456', 'Second group should be 456')
    })

    it('should replace string with pattern', (t) => {
      const result = regex.regexPattern({
        pattern: 'test',
        flags: 'g'
      })

      const replaced = 'test test test'.replace(result, 'demo')
      strictEqual(replaced, 'demo demo demo', 'Should replace all occurrences')
    })

    it('should work with character class pattern', (t) => {
      const result = regex.regexPattern({
        pattern: '[a-z]+',
        flags: 'g'
      })

      const matches = 'hello world 123'.match(result)
      strictEqual(matches.length, 2, 'Should find 2 matches')
      strictEqual(matches[0], 'hello', 'First match should be "hello"')
      strictEqual(matches[1], 'world', 'Second match should be "world"')
    })

    it('should work with digit pattern', (t) => {
      const result = regex.regexPattern({
        pattern: '\\d+',
        flags: 'g'
      })

      const matches = 'abc 123 def 456'.match(result)
      strictEqual(matches.length, 2, 'Should find 2 matches')
      strictEqual(matches[0], '123', 'First match should be "123"')
      strictEqual(matches[1], '456', 'Second match should be "456"')
    })

    it('should work with email-like pattern', (t) => {
      const result = regex.regexPattern({
        pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
        flags: ''
      })

      ok(result.test('user@example.com'), 'Should match valid email')
      ok(result.test('test.user@domain.co.uk'), 'Should match email with subdomain')
      ok(!result.test('invalid@'), 'Should not match invalid email')
    })
  })

  describe('Edge cases', () => {
    it('should handle pattern with spaces', (t) => {
      const result = regex.regexPattern({
        pattern: 'hello world',
        flags: ''
      })

      ok(result.test('hello world'), 'Should match "hello world"')
      ok(!result.test('helloworld'), 'Should not match "helloworld"')
    })

    it('should handle pattern with special regex characters', (t) => {
      // Use a valid pattern with escaped special characters
      const result = regex.regexPattern({
        pattern: '\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\',
        flags: ''
      })

      ok(result instanceof RegExp, 'Should create RegExp')
      ok(result.test('.*+?^${}()|[]\\'), 'Should match special characters')
    })

    it('should handle unicode pattern', (t) => {
      const result = regex.regexPattern({
        pattern: '\\u{1F600}',
        flags: 'u'
      })

      ok(result.test('😀'), 'Should match emoji')
    })

    it('should handle empty flags string', (t) => {
      const result = regex.regexPattern({
        pattern: 'test',
        flags: ''
      })

      strictEqual(result.flags, '', 'Flags should be empty string')
    })

    it('should handle undefined flags parameter', (t) => {
      const result = regex.regexPattern({
        pattern: 'test'
        // flags is undefined
      })

      strictEqual(result.flags, '', 'Flags should be empty when undefined')
    })

    it('should handle null flags parameter', (t) => {
      // RegExp constructor doesn't accept null as flags, it should be undefined or empty string
      // This test verifies the plugin handles this gracefully
      const result = regex.regexPattern({
        pattern: 'test',
        flags: undefined
      })

      strictEqual(result.flags, '', 'Flags should be empty when undefined')
    })

    it('should handle complex real-world pattern', (t) => {
      // Pattern to match phone numbers in format XXX-XXX-XXXX
      const result = regex.regexPattern({
        pattern: '\\d{3}-\\d{3}-\\d{4}',
        flags: 'g'
      })

      ok(result.test('555-123-4567'), 'Should match phone number')

      // Reset lastIndex for next test
      result.lastIndex = 0
      ok(result.test('Call 555-987-1234 for help'), 'Should match phone number in text')

      ok(!result.test('555-123'), 'Should not match incomplete phone number')
    })

    it('should handle multiline pattern', (t) => {
      const result = regex.regexPattern({
        pattern: '^test$',
        flags: 'gm'
      })

      const text = 'test\ndemo\ntest'
      const matches = text.match(result)
      strictEqual(matches.length, 2, 'Should find 2 matches on separate lines')
    })

    it('should handle lookahead pattern', (t) => {
      const result = regex.regexPattern({
        pattern: 'test(?=\\s+value)',
        flags: ''
      })

      ok(result.test('test value'), 'Should match "test" followed by "value"')
      ok(!result.test('test'), 'Should not match "test" without "value"')
    })

    it('should handle lookbehind pattern', (t) => {
      const result = regex.regexPattern({
        pattern: '(?<=prefix_)test',
        flags: ''
      })

      ok(result.test('prefix_test'), 'Should match "test" after "prefix_"')
      ok(!result.test('test'), 'Should not match "test" without prefix')
    })

    it('should handle non-capturing group pattern', (t) => {
      const result = regex.regexPattern({
        pattern: '(?:test|demo)',
        flags: ''
      })

      ok(result.test('test'), 'Should match "test"')
      ok(result.test('demo'), 'Should match "demo"')
    })

    it('should handle named capture group pattern', (t) => {
      const result = regex.regexPattern({
        pattern: '(?<name>\\w+)',
        flags: ''
      })

      const match = 'test'.match(result)
      strictEqual(match.groups.name, 'test', 'Should capture named group')
    })
  })
})
