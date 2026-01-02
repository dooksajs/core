import { describe, it } from 'node:test'
import { strictEqual, throws } from 'node:assert'
import capitalize from '../src/capitalise.js'

describe('capitalize', function () {
  describe('Basic functionality', function () {
    it('should capitalize single lowercase word', function () {
      strictEqual(capitalize('hello'), 'Hello')
    })

    it('should capitalize first letter only of multi-character string', function () {
      strictEqual(capitalize('world'), 'World')
    })

    it('should preserve already capitalized first letter', function () {
      strictEqual(capitalize('Hello'), 'Hello')
    })

    it('should preserve rest of string unchanged', function () {
      strictEqual(capitalize('hello WORLD'), 'Hello WORLD')
    })

    it('should handle single character string', function () {
      strictEqual(capitalize('a'), 'A')
    })

    it('should handle string with all uppercase letters', function () {
      strictEqual(capitalize('HELLO'), 'HELLO')
    })

    it('should handle string with mixed case', function () {
      strictEqual(capitalize('hELLO'), 'HELLO')
    })
  })

  describe('Multiple words and spaces', function () {
    it('should capitalize first word in multi-word string', function () {
      strictEqual(capitalize('hello world'), 'Hello world')
    })

    it('should handle leading spaces', function () {
      strictEqual(capitalize(' hello'), ' hello')
    })

    it('should handle trailing spaces', function () {
      strictEqual(capitalize('hello '), 'Hello ')
    })

    it('should handle multiple spaces between words', function () {
      strictEqual(capitalize('hello  world'), 'Hello  world')
    })

    it('should handle tab characters', function () {
      strictEqual(capitalize('hello\tworld'), 'Hello\tworld')
    })

    it('should handle newlines', function () {
      strictEqual(capitalize('hello\nworld'), 'Hello\nworld')
    })
  })

  describe('Unicode and special characters', function () {
    it('should handle accented characters', function () {
      strictEqual(capitalize('über'), 'Über')
      strictEqual(capitalize('ñño'), 'Ñño')
      strictEqual(capitalize('café'), 'Café')
    })

    it('should handle multi-byte Unicode characters', function () {
      strictEqual(capitalize('ñoño'), 'Ñoño')
      strictEqual(capitalize('ça va'), 'Ça va')
    })

    it('should handle emojis', function () {
      strictEqual(capitalize('🎉 party'), '🎉 party')
      strictEqual(capitalize('😀 hello'), '😀 hello')
    })

    it('should handle special characters', function () {
      strictEqual(capitalize('@username'), '@username')
      strictEqual(capitalize('#hashtag'), '#hashtag')
      strictEqual(capitalize('$money'), '$money')
    })

    it('should handle numbers at start', function () {
      strictEqual(capitalize('123abc'), '123abc')
      strictEqual(capitalize('456'), '456')
    })

    it('should handle symbols at start', function () {
      strictEqual(capitalize('_private'), '_private')
      strictEqual(capitalize('-dash'), '-dash')
      strictEqual(capitalize('+plus'), '+plus')
    })
  })

  describe('Edge cases', function () {
    it('should handle empty string', function () {
      throws(() => capitalize(''), {
        message: 'Cannot capitalize empty string'
      })
    })

    it('should handle null input', function () {
      throws(() => capitalize(null), {
        message: 'Expected string, got object'
      })
    })

    it('should handle undefined input', function () {
      throws(() => capitalize(undefined), {
        message: 'Expected string, got undefined'
      })
    })

    it('should handle number input', function () {
      throws(() => {
        // @ts-ignore
        capitalize(123)
      }, {
        message: 'Expected string, got number'
      })
    })

    it('should handle boolean input', function () {
      throws(() => {
        // @ts-ignore
        capitalize(true)
      }, {
        message: 'Expected string, got boolean'
      })
    })

    it('should handle object input', function () {
      throws(() => {
        // @ts-ignore
        capitalize({})
      }, {
        message: 'Expected string, got object'
      })
    })

    it('should handle array input', function () {
      throws(() => {
        // @ts-ignore
        capitalize([])
      }, {
        message: 'Expected string, got object'
      })
    })

    it('should handle function input', function () {
      throws(() => {
        // @ts-ignore
        capitalize(() => {
        })
      }, {
        message: 'Expected string, got function'
      })
    })
  })

  describe('Whitespace handling', function () {
    it('should handle string with only spaces', function () {
      strictEqual(capitalize('   '), '   ')
    })

    it('should handle string with only tabs', function () {
      strictEqual(capitalize('\t\t'), '\t\t')
    })

    it('should handle string with mixed whitespace', function () {
      strictEqual(capitalize(' \t\n'), ' \t\n')
    })

    it('should handle zero-width spaces', function () {
      const zeroWidthSpace = '\u200B'
      strictEqual(capitalize(zeroWidthSpace + 'test'), '\u200Btest')
    })
  })

  describe('Already capitalized strings', function () {
    it('should not change already capitalized first letter', function () {
      strictEqual(capitalize('Hello'), 'Hello')
      strictEqual(capitalize('HELLO'), 'HELLO')
      strictEqual(capitalize('Hello World'), 'Hello World')
    })

    it('should handle strings starting with uppercase after whitespace', function () {
      strictEqual(capitalize(' hello'), ' hello')
      strictEqual(capitalize('\tHello'), '\tHello')
    })
  })

  describe('Very long strings', function () {
    it('should handle long string', function () {
      const longString = 'a'.repeat(1000)
      const expected = 'A' + 'a'.repeat(999)
      strictEqual(capitalize(longString), expected)
    })

    it('should handle very long string with spaces', function () {
      const longString = 'hello world '.repeat(100)
      const expected = 'Hello world ' + 'hello world '.repeat(99)
      strictEqual(capitalize(longString), expected)
    })
  })

  describe('Boundary cases', function () {
    it('should handle string with only first letter different', function () {
      strictEqual(capitalize('aBCDE'), 'ABCDE')
    })

    it('should handle string where first letter is already correct', function () {
      strictEqual(capitalize('ABcde'), 'ABcde')
    })

    it('should handle string with numbers and letters', function () {
      strictEqual(capitalize('1st'), '1st')
      strictEqual(capitalize('2nd place'), '2nd place')
    })

    it('should handle string with punctuation', function () {
      strictEqual(capitalize('!hello'), '!hello')
      strictEqual(capitalize('?what'), '?what')
      strictEqual(capitalize('"quote"'), '"quote"')
    })
  })

  describe('Consistency with other utils', function () {
    it('should be pure function (no side effects)', function () {
      const input = 'hello'
      const result1 = capitalize(input)
      const result2 = capitalize(input)
      strictEqual(result1, result2)
      strictEqual(input, 'hello') // Original unchanged
    })

    it('should return new string instance', function () {
      const input = 'hello'
      const result = capitalize(input)
      strictEqual(result !== input, true)
    })

    it('should handle consecutive calls', function () {
      strictEqual(
        capitalize(capitalize('hello')),
        'Hello'
      )
    })
  })
})
