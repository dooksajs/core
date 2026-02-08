import { describe, it, afterEach, beforeEach, mock } from 'node:test'
import { strictEqual, deepStrictEqual, ok } from 'node:assert'
import { error } from '#core'

describe('Error plugin', () => {
  let restoreWindow

  // Store original console.error to restore it later
  const originalConsoleError = console.error

  beforeEach(() => {
    // Mock console.error to prevent cluttering test output and to verify calls
    console.error = mock.fn()
  })

  afterEach(() => {
    // Restore plugin state
    if (error.restore) {
      error.restore()
    } else {
      // Fallback if restore is not available (though it should be in test environment)
      error.setup({
        maxErrors: 100,
        reportEndpoint: null
      })
      error.errorClearErrors()
    }

    // Restore window mock if active
    if (restoreWindow) {
      restoreWindow()
      restoreWindow = null
    }

    // Restore console.error
    console.error = originalConsoleError

    // Restore global fetch if mocked
    if (global.fetch && global.fetch.mock) {
      global.fetch.mock.restore()
    }
  })

  describe('Setup', () => {
    it('should configure maxErrors and trim existing errors', () => {
      // Add 10 errors
      for (let i = 0; i < 10; i++) {
        error.errorLogError({ message: `Error ${i}` })
      }
      strictEqual(error.errorGetErrorCount(), 10)

      // Reduce limit to 5
      error.setup({ maxErrors: 5 })
      strictEqual(error.errorGetErrorCount(), 5)

      // Check that oldest errors were removed (should have 5-9 left)
      const remainingErrors = error.errorGetErrors()
      strictEqual(remainingErrors.length, 5)
      strictEqual(remainingErrors[0].message, 'Error 9') // Newest
      strictEqual(remainingErrors[4].message, 'Error 5') // Oldest
    })

    it('should configure reportEndpoint (verified via behavior)', async () => {
      const fetchMock = mock.fn(async () => ({ ok: true }))
      global.fetch = fetchMock

      error.setup({ reportEndpoint: '/api/errors' })
      error.errorLogError({ message: 'Test' })

      strictEqual(fetchMock.mock.callCount(), 1)
      const [url] = fetchMock.mock.calls[0].arguments
      strictEqual(url, '/api/errors')
    })
  })

  describe('Logging Errors', () => {
    it('should log a basic error', () => {
      const errorId = error.errorLogError({ message: 'Test error' })

      ok(errorId, 'Should return an error ID')
      strictEqual(error.errorGetErrorCount(), 1)

      const errors = error.errorGetErrors()
      const storedError = errors.find(e => e.id === errorId)
      ok(storedError, 'Error should be found in storage')
      strictEqual(storedError.message, 'Test error')
      strictEqual(storedError.level, 'ERROR')
      ok(storedError.timestamp, 'Should have timestamp')

      // Verify console output
      strictEqual(console.error.mock.callCount(), 1)
      const loggedMessage = console.error.mock.calls[0].arguments[0]
      ok(loggedMessage.includes('Test error'))
      ok(loggedMessage.includes('ERROR'))
    })

    it('should log an error with all fields', () => {
      const context = {
        plugin: 'test',
        action: 'run'
      }
      const errorId = error.errorLogError({
        message: 'Full error',
        level: 'FATAL',
        code: 'TEST_CODE',
        category: 'TEST_CAT',
        context,
        stack: 'Error stack'
      })

      const errors = error.errorGetErrors()
      const storedError = errors.find(e => e.id === errorId)

      strictEqual(storedError.message, 'Full error')
      strictEqual(storedError.level, 'FATAL')
      strictEqual(storedError.code, 'TEST_CODE')
      strictEqual(storedError.category, 'TEST_CAT')
      deepStrictEqual(storedError.context, context)
      strictEqual(storedError.stack, 'Error stack')

      // Verify console output
      strictEqual(console.error.mock.callCount(), 2) // Message + Stack
      const loggedMessage = console.error.mock.calls[0].arguments[0]
      ok(loggedMessage.includes('FATAL'))
      ok(loggedMessage.includes('TEST_CODE'))
      ok(loggedMessage.includes('TEST_CAT'))

      const loggedStack = console.error.mock.calls[1].arguments[0]
      strictEqual(loggedStack, 'Error stack')
    })

    it('should serialize non-string messages', () => {
      const errorId = error.errorLogError({ message: { foo: 'bar' } })
      const errors = error.errorGetErrors()
      const storedError = errors.find(e => e.id === errorId)

      strictEqual(typeof storedError.message, 'string')
      ok(storedError.message.includes('foo'))
      ok(storedError.message.includes('bar'))
    })

    it('should report to server if endpoint configured', async (t) => {
      const fetchMock = mock.fn(async () => ({ ok: true }))
      global.fetch = fetchMock

      error.setup({ reportEndpoint: '/api/report' })

      const errorId = error.errorLogError({ message: 'Report error' })

      strictEqual(fetchMock.mock.callCount(), 1)
      const [url, options] = fetchMock.mock.calls[0].arguments

      strictEqual(url, '/api/report')
      strictEqual(options.method, 'POST')
      strictEqual(options.headers['Content-Type'], 'application/json')

      const body = JSON.parse(options.body)
      strictEqual(body.id, errorId)
      strictEqual(body.message, 'Report error')
    })

    it('should handle reporting failure gracefully', async (t) => {
      // Mock fetch failure
      const fetchMock = mock.fn(async () => {
        throw new Error('Network error')
      })
      global.fetch = fetchMock

      // Spy on console.warn
      const consoleWarnMock = mock.fn()
      const originalWarn = console.warn
      console.warn = consoleWarnMock

      t.after(() => {
        console.warn = originalWarn
      })

      error.setup({ reportEndpoint: '/api/report' })

      // Should not throw
      error.errorLogError({ message: 'Report error' })

      // Give promise a tick to reject
      await new Promise(resolve => setTimeout(resolve, 0))

      strictEqual(consoleWarnMock.mock.callCount(), 1)
      ok(consoleWarnMock.mock.calls[0].arguments[0].includes('Failed to report error'))
    })
  })

  describe('Retrieving Errors', () => {
    beforeEach(() => {
      // Seed some errors
      error.errorLogError({
        message: 'Error 1',
        level: 'ERROR',
        category: 'API',
        code: 'E1'
      })
      error.errorLogError({
        message: 'Error 2',
        level: 'WARN',
        category: 'UI',
        code: 'E2'
      })
      error.errorLogError({
        message: 'Error 3',
        level: 'FATAL',
        category: 'API',
        code: 'E3'
      })
    })

    it('should get all errors', () => {
      const errors = error.errorGetErrors()
      strictEqual(errors.length, 3)
      // Order is newest first
      strictEqual(errors[0].message, 'Error 3')
      strictEqual(errors[1].message, 'Error 2')
      strictEqual(errors[2].message, 'Error 1')
    })

    it('should filter by level', () => {
      const errors = error.errorGetErrors({ filter: { level: 'FATAL' } })
      strictEqual(errors.length, 1)
      strictEqual(errors[0].message, 'Error 3')
    })

    it('should filter by category', () => {
      const errors = error.errorGetErrors({ filter: { category: 'API' } })
      strictEqual(errors.length, 2)
      strictEqual(errors[0].message, 'Error 3')
      strictEqual(errors[1].message, 'Error 1')
    })

    it('should filter by code', () => {
      const errors = error.errorGetErrors({ filter: { code: 'E2' } })
      strictEqual(errors.length, 1)
      strictEqual(errors[0].message, 'Error 2')
    })

    it('should combine filters', () => {
      const errors = error.errorGetErrors({
        filter: {
          category: 'API',
          level: 'FATAL'
        }
      })
      strictEqual(errors.length, 1)
      strictEqual(errors[0].message, 'Error 3')
    })

    it('should return empty array if no matches', () => {
      const errors = error.errorGetErrors({ filter: { code: 'NON_EXISTENT' } })
      strictEqual(errors.length, 0)
    })

    it('should limit results', () => {
      const errors = error.errorGetErrors({ limit: 2 })
      strictEqual(errors.length, 2)
      strictEqual(errors[0].message, 'Error 3')
      strictEqual(errors[1].message, 'Error 2')
    })
  })

  describe('Counting Errors', () => {
    beforeEach(() => {
      error.errorLogError({
        message: 'E1',
        level: 'ERROR'
      })
      error.errorLogError({
        message: 'E2',
        level: 'WARN'
      })
      error.errorLogError({
        message: 'E3',
        level: 'ERROR'
      })
    })

    it('should count all errors', () => {
      strictEqual(error.errorGetErrorCount(), 3)
    })

    it('should count filtered errors', () => {
      strictEqual(error.errorGetErrorCount({ filter: { level: 'ERROR' } }), 2)
      strictEqual(error.errorGetErrorCount({ filter: { level: 'WARN' } }), 1)
      strictEqual(error.errorGetErrorCount({ filter: { level: 'FATAL' } }), 0)
    })
  })

  describe('Clearing Errors', () => {
    beforeEach(() => {
      error.errorLogError({
        message: 'E1',
        level: 'ERROR',
        category: 'A'
      })
      error.errorLogError({
        message: 'E2',
        level: 'WARN',
        category: 'B'
      })
      error.errorLogError({
        message: 'E3',
        level: 'ERROR',
        category: 'A'
      })
    })

    it('should clear all errors', () => {
      const cleared = error.errorClearErrors()
      strictEqual(cleared, 3)
      strictEqual(error.errorGetErrorCount(), 0)
      deepStrictEqual(error.errorGetErrors(), [])
    })

    it('should clear filtered errors', () => {
      const cleared = error.errorClearErrors({ filter: { level: 'ERROR' } })
      strictEqual(cleared, 2)
      strictEqual(error.errorGetErrorCount(), 1)

      const remaining = error.errorGetErrors()
      strictEqual(remaining[0].message, 'E2')
    })

    it('should handle clearing with no matches', () => {
      const cleared = error.errorClearErrors({ filter: { category: 'C' } })
      strictEqual(cleared, 0)
      strictEqual(error.errorGetErrorCount(), 3)
    })
  })
})
