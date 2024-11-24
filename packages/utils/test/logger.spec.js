import { log } from '#server'
import { describe, it, mock } from 'node:test'
import { deepEqual, deepStrictEqual, equal, strictEqual } from 'node:assert'

const reAnsi = new RegExp(/\u001b\[.*?m(?!\\)/g)

/**
 * Log result
 * @param {string} string
 */
function logResult (string) {
  const logMessage = string.replace(reAnsi, '')

  return {
    createdAt: getDateFromHours(logMessage.substring(0, 11)),
    message: logMessage.substring(13)
  }
}

function getDateFromHours (time) {
  const now = new Date()

  time = time.split(':')

  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), ...time)
}

/**
 * create console spy
 */
function createConsoleSpy () {
  const logs = []

  // store original console methods
  const originalLog = console.log

  // replace console methods with spies
  console.log = mock.fn(function () {
    const strings = []

    for (let i = 0; i < arguments.length; i++) {
      const argument = arguments[i]

      // split color ansi values
      if (typeof argument === 'string') {
        strings.push(logResult(argument))
      }
    }

    logs.push(strings)
  })

  // return cleanup function and captured outputs
  return {
    restore: () => {
      console.log = originalLog
    },
    getLogs: () => logs
  }
}
describe('Log', function () {
  describe('INFO level', function () {
    it('should log message', function () {
      const spy = createConsoleSpy()

      log({
        message: 'Hello world!'
      })

      const logs = spy.getLogs()

      // check how many arguments the console received
      strictEqual(logs[0].length, 1)

      const logResult = logs[0][0]

      strictEqual(logResult.createdAt instanceof Date, true)
      strictEqual(logResult.message, 'Info: Hello world!')

      spy.restore()
    })

    it('should log message with context', function () {
      const spy = createConsoleSpy()

      log({
        message: 'Hello world!',
        context: 'Party time!'
      })

      const logs = spy.getLogs()

      // check how many arguments the console received
      strictEqual(logs[0].length, 1)

      const logResult = logs[0][0]

      strictEqual(logResult.createdAt instanceof Date, true)
      strictEqual(logResult.message, 'Info: Hello world! [Party time!]')

      spy.restore()
    })

    it('should log message with duration', function () {
      const spy = createConsoleSpy()
      const now = performance.now()

      log({
        message: 'Hello world!',
        duration: now
      })

      const logs = spy.getLogs()

      // check how many arguments the console received
      strictEqual(logs[0].length, 1)

      const logResult = logs[0][0]

      strictEqual(logResult.createdAt instanceof Date, true)
      strictEqual(logResult.message, `Info: Hello world! (${Math.floor(now)} ms)`)

      spy.restore()
    })

    it('should log message with context and duration', function () {
      const spy = createConsoleSpy()
      const now = performance.now()

      log({
        message: 'Hello world!',
        context: 'Party time!',
        duration: now
      })

      const logs = spy.getLogs()

      // check how many arguments the console received
      strictEqual(logs[0].length, 1)

      const logResult = logs[0][0]

      strictEqual(logResult.createdAt instanceof Date, true)
      strictEqual(logResult.message, `Info: Hello world! [Party time!] (${Math.floor(now)} ms)`)

      spy.restore()
    })
  })

  describe('WARNING level', function () {
    it('should log message', function () {
      const spy = createConsoleSpy()

      log({
        level: 'WARN',
        message: 'Hello world!'
      })

      const logs = spy.getLogs()

      // check how many arguments the console received
      strictEqual(logs[0].length, 1)

      const logResult = logs[0][0]

      strictEqual(logResult.createdAt instanceof Date, true)
      strictEqual(logResult.message, 'Warning: Hello world!')

      spy.restore()
    })

    it('should log message with context', function () {
      const spy = createConsoleSpy()

      log({
        level: 'WARN',
        message: 'Hello world!',
        context: 'Party time!'
      })

      const logs = spy.getLogs()

      // check how many arguments the console received
      strictEqual(logs[0].length, 1)

      const logResult = logs[0][0]

      strictEqual(logResult.createdAt instanceof Date, true)
      strictEqual(logResult.message, 'Warning: Hello world! [Party time!]')

      spy.restore()
    })

    it('should log message with duration', function () {
      const spy = createConsoleSpy()
      const now = performance.now()

      log({
        level: 'WARN',
        message: 'Hello world!',
        duration: now
      })

      const logs = spy.getLogs()

      // check how many arguments the console received
      strictEqual(logs[0].length, 1)

      const logResult = logs[0][0]

      strictEqual(logResult.createdAt instanceof Date, true)
      strictEqual(logResult.message, `Warning: Hello world! (${Math.floor(now)} ms)`)

      spy.restore()
    })

    it('should log message with context and duration', function () {
      const spy = createConsoleSpy()
      const now = performance.now()

      log({
        level: 'WARN',
        message: 'Hello world!',
        context: 'Party time!',
        duration: now
      })

      const logs = spy.getLogs()

      // check how many arguments the console received
      strictEqual(logs[0].length, 1)

      const logResult = logs[0][0]

      strictEqual(logResult.createdAt instanceof Date, true)
      strictEqual(logResult.message, `Warning: Hello world! [Party time!] (${Math.floor(now)} ms)`)

      spy.restore()
    })
  })

  describe('ERROR level', function () {
    it('should log message', function () {
      const spy = createConsoleSpy()

      log({
        level: 'ERROR',
        message: 'Hello world!'
      })

      const logs = spy.getLogs()

      // check how many arguments the console received
      strictEqual(logs[0].length, 1)

      const logResult = logs[0][0]

      strictEqual(logResult.createdAt instanceof Date, true)
      strictEqual(logResult.message, 'Error: Hello world!')

      spy.restore()
    })

    it('should log message with context', function () {
      const spy = createConsoleSpy()

      log({
        level: 'ERROR',
        message: 'Hello world!',
        context: 'Party time!'
      })

      const logs = spy.getLogs()

      // check how many arguments the console received
      strictEqual(logs[0].length, 1)

      const logResult = logs[0][0]

      strictEqual(logResult.createdAt instanceof Date, true)
      strictEqual(logResult.message, 'Error: Hello world! [Party time!]')

      spy.restore()
    })

    it('should log message with duration', function () {
      const spy = createConsoleSpy()
      const now = performance.now()

      log({
        level: 'ERROR',
        message: 'Hello world!',
        duration: now
      })

      const logs = spy.getLogs()

      // check how many arguments the console received
      strictEqual(logs[0].length, 1)

      const logResult = logs[0][0]

      strictEqual(logResult.createdAt instanceof Date, true)
      strictEqual(logResult.message, `Error: Hello world! (${Math.floor(now)} ms)`)

      spy.restore()
    })

    it('should log message with context and duration', function () {
      const spy = createConsoleSpy()
      const now = performance.now()

      log({
        level: 'ERROR',
        message: 'Hello world!',
        context: 'Party time!',
        duration: now
      })

      const logs = spy.getLogs()

      // check how many arguments the console received
      strictEqual(logs[0].length, 1)

      const logResult = logs[0][0]

      strictEqual(logResult.createdAt instanceof Date, true)
      strictEqual(logResult.message, `Error: Hello world! [Party time!] (${Math.floor(now)} ms)`)

      spy.restore()
    })
  })
})
