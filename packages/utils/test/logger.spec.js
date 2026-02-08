import { log } from '#server'
import { describe, it, mock } from 'node:test'
import { strictEqual, throws } from 'node:assert'

// ANSI color code patterns for verification
const ANSI_CODES = {
  grey: /\u001b\[90m/,
  yellow: /\u001b\[33m/,
  yellowBright: /\u001b\[93m/,
  red: /\u001b\[31m/,
  redBright: /\u001b\[91m/,
  white: /\u001b\[37m/,
  green: /\u001b\[32m/,
  blue: /\u001b\[34m/,
  reset: /\u001b\[0m/
}

/**
 * Extract timestamp components from log output
 */
function parseTimestamp (logOutput) {
  const timestampMatch = logOutput.match(/(\d{2}):(\d{2}):(\d{2})\.(\d{3})/)
  if (!timestampMatch) return null

  return {
    hours: timestampMatch[1],
    minutes: timestampMatch[2],
    seconds: timestampMatch[3],
    milliseconds: timestampMatch[4]
  }
}

/**
 * Extract message content (without ANSI codes and timestamp)
 */
function extractMessage (logOutput) {
  // Remove timestamp
  let content = logOutput.replace(/\d{2}:\d{2}:\d{2}\.\d{3} /, '')

  // Remove ANSI codes
  content = content.replace(/\u001b\[\d+m/g, '')

  // Remove reset codes
  content = content.replace(/\u001b\[0m/g, '')

  return content.trim()
}

/**
 * Create console spy that captures raw output
 */
function createConsoleSpy () {
  const originalLog = console.log
  const capturedLogs = []

  console.log = mock.fn(function (...args) {
    capturedLogs.push(args.join(' '))
  })

  return {
    restore: () => {
      console.log = originalLog
    },
    getLogs: () => capturedLogs
  }
}

describe('Logger', function () {

  describe('Parameter Validation', function () {

    it('should throw error when message is missing', function () {
      throws(() => {
        // @ts-ignore
        log({})
      }, {
        message: 'Invalid message parameter: message must be a non-empty string'
      })
    })

    it('should throw error when message is empty string', function () {
      throws(() => {
        log({ message: '' })
      }, {
        message: 'Invalid message parameter: message must be a non-empty string'
      })
    })

    it('should throw error when message is not a string', function () {
      throws(() => {
        // @ts-ignore
        log({ message: 123 })
      }, {
        message: 'Invalid message parameter: message must be a non-empty string'
      })

      throws(() => {
        log({ message: null })
      }, {
        message: 'Invalid message parameter: message must be a non-empty string'
      })

      throws(() => {
        log({ message: undefined })
      }, {
        message: 'Invalid message parameter: message must be a non-empty string'
      })

      throws(() => {
        // @ts-ignore
        log({ message: {} })
      }, {
        message: 'Invalid message parameter: message must be a non-empty string'
      })
    })

    it('should throw error for invalid level', function () {
      throws(() => {
        log({
          message: 'test',
          // @ts-ignore
          level: 'INVALID'
        })
      }, {
        message: 'Invalid level parameter: must be one of INFO, WARN, ERROR'
      })

      throws(() => {
        log({
          message: 'test',
          // @ts-ignore
          level: 'debug'
        })
      }, {
        message: 'Invalid level parameter: must be one of INFO, WARN, ERROR'
      })
    })

    it('should accept valid levels', function () {
      const spy = createConsoleSpy()

      // Should not throw
      log({
        message: 'test',
        level: 'INFO'
      })
      log({
        message: 'test',
        level: 'WARN'
      })
      log({
        message: 'test',
        level: 'ERROR'
      })

      spy.restore()
    })
  })

  describe('Timestamp Formatting', function () {

    it('should format timestamp with leading zeros', function () {
      const spy = createConsoleSpy()

      // Mock Date to get predictable values
      const mockDate = new Date('2024-01-01T01:02:03.045')
      const originalDate = Date
      // @ts-ignore
      Date = function () {
        return mockDate
      }
      // @ts-ignore
      Date.now = () => mockDate.getTime()

      log({ message: 'test' })

      const logs = spy.getLogs()
      const timestamp = parseTimestamp(logs[0])

      strictEqual(timestamp.hours, '01')
      strictEqual(timestamp.minutes, '02')
      strictEqual(timestamp.seconds, '03')
      strictEqual(timestamp.milliseconds, '045')

      // @ts-ignore
      Date = originalDate
      spy.restore()
    })

    it('should handle midnight (00:00:00.000)', function () {
      const spy = createConsoleSpy()

      const mockDate = new Date('2024-01-01T00:00:00.000')
      const originalDate = Date
      // @ts-ignore
      Date = function () {
        return mockDate
      }
      // @ts-ignore
      Date.now = () => mockDate.getTime()

      log({ message: 'test' })

      const logs = spy.getLogs()
      const timestamp = parseTimestamp(logs[0])

      strictEqual(timestamp.hours, '00')
      strictEqual(timestamp.minutes, '00')
      strictEqual(timestamp.seconds, '00')
      strictEqual(timestamp.milliseconds, '000')

      // @ts-ignore
      Date = originalDate
      spy.restore()
    })

    it('should handle single digit milliseconds with padding', function () {
      const spy = createConsoleSpy()

      const mockDate = new Date('2024-01-01T12:34:56.007')
      const originalDate = Date
      // @ts-ignore
      Date = function () {
        return mockDate
      }
      // @ts-ignore
      Date.now = () => mockDate.getTime()

      log({ message: 'test' })

      const logs = spy.getLogs()
      const timestamp = parseTimestamp(logs[0])

      strictEqual(timestamp.milliseconds, '007')

      // @ts-ignore
      Date = originalDate
      spy.restore()
    })
  })

  describe('INFO Level', function () {

    it('should log basic message', function () {
      const spy = createConsoleSpy()

      log({ message: 'Hello world!' })

      const logs = spy.getLogs()
      strictEqual(logs.length, 1)

      const content = extractMessage(logs[0])
      strictEqual(content, 'Info: Hello world!')

      spy.restore()
    })

    it('should include context when provided', function () {
      const spy = createConsoleSpy()

      log({
        message: 'Hello world!',
        context: 'App'
      })

      const logs = spy.getLogs()
      const content = extractMessage(logs[0])
      strictEqual(content, 'Info: Hello world! [App]')

      spy.restore()
    })

    it('should include duration when provided', function () {
      const spy = createConsoleSpy()

      log({
        message: 'Hello world!',
        duration: 123.456
      })

      const logs = spy.getLogs()
      const content = extractMessage(logs[0])
      strictEqual(content, 'Info: Hello world! (123 ms)')

      spy.restore()
    })

    it('should include both context and duration', function () {
      const spy = createConsoleSpy()

      log({
        message: 'Hello world!',
        context: 'App',
        duration: 456.789
      })

      const logs = spy.getLogs()
      const content = extractMessage(logs[0])
      strictEqual(content, 'Info: Hello world! [App] (456 ms)')

      spy.restore()
    })

    it('should handle duration of 0', function () {
      const spy = createConsoleSpy()

      log({
        message: 'Hello world!',
        duration: 0
      })

      const logs = spy.getLogs()
      const content = extractMessage(logs[0])
      strictEqual(content, 'Info: Hello world! (0 ms)')

      spy.restore()
    })

    it('should handle negative duration', function () {
      const spy = createConsoleSpy()

      log({
        message: 'Hello world!',
        duration: -50
      })

      const logs = spy.getLogs()
      const content = extractMessage(logs[0])
      strictEqual(content, 'Info: Hello world! (-50 ms)')

      spy.restore()
    })

    it('should handle very large duration', function () {
      const spy = createConsoleSpy()

      log({
        message: 'Hello world!',
        duration: 999999.999
      })

      const logs = spy.getLogs()
      const content = extractMessage(logs[0])
      strictEqual(content, 'Info: Hello world! (999999 ms)')

      spy.restore()
    })

    it('should handle string duration', function () {
      const spy = createConsoleSpy()

      log({
        message: 'Hello world!',
        // @ts-ignore
        duration: '123.456'
      })

      const logs = spy.getLogs()
      const content = extractMessage(logs[0])
      strictEqual(content, 'Info: Hello world! (123 ms)')

      spy.restore()
    })

    it('should ignore invalid duration', function () {
      const spy = createConsoleSpy()

      log({
        message: 'Hello world!',
        // @ts-ignore
        duration: 'invalid'
      })

      const logs = spy.getLogs()
      const content = extractMessage(logs[0])
      strictEqual(content, 'Info: Hello world!')

      spy.restore()
    })
  })

  describe('WARN Level', function () {

    it('should log basic warning message', function () {
      const spy = createConsoleSpy()

      log({
        level: 'WARN',
        message: 'Something is wrong'
      })

      const logs = spy.getLogs()
      const content = extractMessage(logs[0])
      strictEqual(content, 'Warning: Something is wrong')

      spy.restore()
    })

    it('should include context and duration', function () {
      const spy = createConsoleSpy()

      log({
        level: 'WARN',
        message: 'Something is wrong',
        context: 'Validation',
        duration: 200
      })

      const logs = spy.getLogs()
      const content = extractMessage(logs[0])
      strictEqual(content, 'Warning: Something is wrong [Validation] (200 ms)')

      spy.restore()
    })
  })

  describe('ERROR Level', function () {

    it('should log basic error message', function () {
      const spy = createConsoleSpy()

      log({
        level: 'ERROR',
        message: 'Critical failure'
      })

      const logs = spy.getLogs()
      const content = extractMessage(logs[0])
      strictEqual(content, 'Error: Critical failure')

      spy.restore()
    })

    it('should include context and duration', function () {
      const spy = createConsoleSpy()

      log({
        level: 'ERROR',
        message: 'Critical failure',
        context: 'Database',
        duration: 1000
      })

      const logs = spy.getLogs()
      const content = extractMessage(logs[0])
      strictEqual(content, 'Error: Critical failure [Database] (1000 ms)')

      spy.restore()
    })
  })

  describe('Edge Cases', function () {

    it('should handle empty context string', function () {
      const spy = createConsoleSpy()

      log({
        message: 'test',
        context: ''
      })

      const logs = spy.getLogs()
      const content = extractMessage(logs[0])
      strictEqual(content, 'Info: test')

      spy.restore()
    })

    it('should handle whitespace-only context', function () {
      const spy = createConsoleSpy()

      log({
        message: 'test',
        context: '   '
      })

      const logs = spy.getLogs()
      const content = extractMessage(logs[0])
      strictEqual(content, 'Info: test')

      spy.restore()
    })

    it('should handle null context', function () {
      const spy = createConsoleSpy()

      log({
        message: 'test',
        context: null
      })

      const logs = spy.getLogs()
      const content = extractMessage(logs[0])
      strictEqual(content, 'Info: test')

      spy.restore()
    })

    it('should handle undefined context', function () {
      const spy = createConsoleSpy()

      log({
        message: 'test',
        context: undefined
      })

      const logs = spy.getLogs()
      const content = extractMessage(logs[0])
      strictEqual(content, 'Info: test')

      spy.restore()
    })

    it('should handle null duration', function () {
      const spy = createConsoleSpy()

      log({
        message: 'test',
        duration: null
      })

      const logs = spy.getLogs()
      const content = extractMessage(logs[0])
      strictEqual(content, 'Info: test')

      spy.restore()
    })

    it('should handle undefined duration', function () {
      const spy = createConsoleSpy()

      log({
        message: 'test',
        duration: undefined
      })

      const logs = spy.getLogs()
      const content = extractMessage(logs[0])
      strictEqual(content, 'Info: test')

      spy.restore()
    })

    it('should handle special characters in message', function () {
      const spy = createConsoleSpy()

      log({ message: 'Test with [brackets] and {braces}' })

      const logs = spy.getLogs()
      const content = extractMessage(logs[0])
      strictEqual(content, 'Info: Test with [brackets] and {braces}')

      spy.restore()
    })

    it('should handle special characters in context', function () {
      const spy = createConsoleSpy()

      log({
        message: 'test',
        context: 'Special: @#$%^&*()'
      })

      const logs = spy.getLogs()
      const content = extractMessage(logs[0])
      strictEqual(content, 'Info: test [Special: @#$%^&*()]')

      spy.restore()
    })

    it('should handle very long message', function () {
      const spy = createConsoleSpy()

      const longMessage = 'A'.repeat(1000)
      log({ message: longMessage })

      const logs = spy.getLogs()
      const content = extractMessage(logs[0])
      strictEqual(content, `Info: ${longMessage}`)

      spy.restore()
    })

    it('should handle very long context', function () {
      const spy = createConsoleSpy()

      const longContext = 'B'.repeat(500)
      log({
        message: 'test',
        context: longContext
      })

      const logs = spy.getLogs()
      const content = extractMessage(logs[0])
      strictEqual(content, `Info: test [${longContext}]`)

      spy.restore()
    })
  })

  describe('Color Output', { skip: true }, function () {

    it('should apply grey color to timestamp', function () {
      const spy = createConsoleSpy()

      log({ message: 'test' })

      const logs = spy.getLogs()
      strictEqual(ANSI_CODES.grey.test(logs[0]), true)

      spy.restore()
    })

    it('should apply white and green for INFO level', function () {
      const spy = createConsoleSpy()

      log({ message: 'test' })

      const logs = spy.getLogs()
      strictEqual(ANSI_CODES.white.test(logs[0]), true)
      strictEqual(ANSI_CODES.green.test(logs[0]), true)

      spy.restore()
    })

    it('should apply yellowBright and yellow for WARN level', function () {
      const spy = createConsoleSpy()

      log({
        level: 'WARN',
        message: 'test'
      })

      const logs = spy.getLogs()
      strictEqual(ANSI_CODES.yellowBright.test(logs[0]), true)
      strictEqual(ANSI_CODES.yellow.test(logs[0]), true)

      spy.restore()
    })

    it('should apply redBright and red for ERROR level', function () {
      const spy = createConsoleSpy()

      log({
        level: 'ERROR',
        message: 'test'
      })

      const logs = spy.getLogs()
      strictEqual(ANSI_CODES.redBright.test(logs[0]), true)
      strictEqual(ANSI_CODES.red.test(logs[0]), true)

      spy.restore()
    })

    it('should apply yellow to context', function () {
      const spy = createConsoleSpy()

      log({
        message: 'test',
        context: 'context'
      })

      const logs = spy.getLogs()
      strictEqual(ANSI_CODES.yellow.test(logs[0]), true)

      spy.restore()
    })

    it('should apply blue to duration', function () {
      const spy = createConsoleSpy()

      log({
        message: 'test',
        duration: 100
      })

      const logs = spy.getLogs()
      strictEqual(ANSI_CODES.blue.test(logs[0]), true)

      spy.restore()
    })

    it('should include color reset codes', function () {
      const spy = createConsoleSpy()

      log({ message: 'test' })

      const logs = spy.getLogs()
      const hasColorReset = /\u001b\[39m/.test(logs[0])
      strictEqual(hasColorReset, true)

      spy.restore()
    })
  })

  describe('Default Parameter Behavior', function () {

    it('should use INFO as default level', function () {
      const spy = createConsoleSpy()

      log({ message: 'test' })

      const logs = spy.getLogs()
      const content = extractMessage(logs[0])
      strictEqual(content, 'Info: test')

      spy.restore()
    })

    it('should not include context by default', function () {
      const spy = createConsoleSpy()

      log({ message: 'test' })

      const logs = spy.getLogs()
      const content = extractMessage(logs[0])
      strictEqual(content.includes('['), false)

      spy.restore()
    })

    it('should not include duration by default', function () {
      const spy = createConsoleSpy()

      log({ message: 'test' })

      const logs = spy.getLogs()
      const content = extractMessage(logs[0])
      strictEqual(content.includes('('), false)

      spy.restore()
    })
  })
})
