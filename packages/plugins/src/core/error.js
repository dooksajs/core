import { createPlugin } from '@dooksa/create-plugin'
import { generateId } from '@dooksa/utils'
import serialize from 'serialize-javascript'

/**
 * @import {DataValue} from '../../../types.js'
 */

/**
 * # Error Plugin - Quick Reference
 *
 * A unified client-side error reporting and logging system for Dooksa applications.
 *
 * ## Setup
 *
 * ```javascript
 * // Configure error plugin
 * error_setup({
 *   maxErrors: 100,           // Store up to 100 errors
 *   reportEndpoint: '/api/errors'  // Optional: Send errors to server
 * })
 * ```
 *
 * ## Logging Errors
 *
 * ### Basic Error
 * ```javascript
 * errorLogError({ message: 'Failed to load data' })
 * ```
 *
 * ### API Error with Context
 * ```javascript
 * errorLogError({
 *   message: 'Failed to fetch user profile',
 *   level: 'ERROR',
 *   code: 'NETWORK_ERROR',
 *   category: 'API',
 *   context: {
 *     plugin: 'user',
 *     action: 'fetchProfile',
 *     userId: 'user_123',
 *     additional: { endpoint: '/api/users/123' }
 *   }
 * })
 * ```
 *
 * ### Validation Error
 * ```javascript
 * errorLogError({
 *   message: 'Email format is invalid',
 *   level: 'WARN',
 *   code: 'VALIDATION_FAILED',
 *   category: 'VALIDATION',
 *   context: {
 *     plugin: 'form',
 *     action: 'validateEmail',
 *     additional: { field: 'email', value: 'invalid@' }
 *   }
 * })
 * ```
 *
 * ### Fatal Error with Stack Trace
 * ```javascript
 * try {
 *   // Some operation that might fail
 * } catch (error) {
 *   errorLogError({
 *     message: 'Database connection lost',
 *     level: 'FATAL',
 *     code: 'DATABASE_ERROR',
 *     category: 'DATABASE',
 *     context: { plugin: 'database', action: 'connect' },
 *     stack: error.stack
 *   })
 * }
 * ```
 *
 * ## Retrieving Errors
 *
 * ### Get All Errors
 * ```javascript
 * const allErrors = errorGetErrors({})
 * ```
 *
 * ### Get Recent API Errors
 * ```javascript
 * const apiErrors = errorGetErrors({
 *   filter: { category: 'API' },
 *   limit: 10
 * })
 * ```
 *
 * ### Get Critical Errors
 * ```javascript
 * const criticalErrors = errorGetErrors({
 *   filter: { level: 'FATAL' }
 * })
 * ```
 *
 * ### Get Specific Error Type
 * ```javascript
 * const networkErrors = errorGetErrors({
 *   filter: { code: 'NETWORK_ERROR' }
 * })
 * ```
 *
 * ## Counting Errors
 *
 * ### Total Error Count
 * ```javascript
 * const totalErrors = errorGetErrorCount({})
 * console.log(`Total errors: ${totalErrors}`)
 * ```
 *
 * ### Count API Errors
 * ```javascript
 * const apiErrorCount = errorGetErrorCount({ filter: { category: 'API' } })
 * console.log(`API errors: ${apiErrorCount}`)
 * ```
 *
 * ## Clearing Errors
 *
 * ### Clear All Errors
 * ```javascript
 * const cleared = errorClearErrors({})
 * console.log(`Cleared ${cleared} errors`)
 * ```
 *
 * ### Clear API Errors Only
 * ```javascript
 * const cleared = errorClearErrors({ filter: { category: 'API' } })
 * console.log(`Cleared ${cleared} API errors`)
 * ```
 *
 * ### Clear Fatal Errors
 * ```javascript
 * const cleared = errorClearErrors({ filter: { level: 'FATAL' } })
 * console.log(`Cleared ${cleared} fatal errors`)
 * ```
 *
 * ## Error Levels
 *
 * - **'ERROR'**: Non-critical errors that don't stop application flow
 * - **'WARN'**: Potential issues that should be monitored
 * - **'FATAL'**: Critical errors that may crash the application
 *
 * ## Common Categories
 *
 * - **'API'**: API/network related errors
 * - **'VALIDATION'**: Data validation errors
 * - **'DATABASE'**: Database/storage errors
 * - **'UI'**: User interface errors
 * - **'AUTH'**: Authentication/authorization errors
 * - **'NETWORK'**: Network connectivity errors
 *
 * ## Common Error Codes
 *
 * - **'NETWORK_ERROR'**: Network request failed
 * - **'VALIDATION_FAILED'**: Data validation failed
 * - **'AUTH_REQUIRED'**: Authentication required
 * - **'PERMISSION_DENIED'**: Insufficient permissions
 * - **'DATABASE_ERROR'**: Database operation failed
 * - **'TIMEOUT_ERROR'**: Operation timed out
 * - **'NOT_FOUND'**: Resource not found
 * - **'SERVER_ERROR'**: Server-side error
 *
 * ## Best Practices
 *
 * 1. **Always include context**: Add plugin name, action name, and relevant data
 * 2. **Use appropriate error levels**: Don't mark everything as FATAL
 * 3. **Include user ID when available**: Helps track user-specific issues
 * 4. **Add stack traces for debugging**: Especially for FATAL errors
 * 5. **Use consistent codes and categories**: Makes filtering and reporting easier
 * 6. **Clear old errors periodically**: Prevent memory leaks
 * 7. **Monitor error counts**: Set up alerts for high error rates
 *
 * ## Example: Complete Error Handling Pattern
 *
 * ```javascript
 * // In your plugin's action
 * async function fetchUserProfile(userId) {
 *   try {
 *     const response = await fetch(`/api/users/${userId}`)
 *
 *     if (!response.ok) {
 *       if (response.status === 404) {
 *         errorLogError({
 *           message: 'User not found',
 *           level: 'WARN',
 *           code: 'NOT_FOUND',
 *           category: 'API',
 *           context: {
 *             plugin: 'user',
 *             action: 'fetchProfile',
 *             userId: userId,
 *             additional: { endpoint: `/api/users/${userId}`, status: response.status }
 *           }
 *         })
 *       } else {
 *         errorLogError({
 *           message: 'Failed to fetch user profile',
 *           level: 'ERROR',
 *           code: 'NETWORK_ERROR',
 *           category: 'API',
 *           context: {
 *             plugin: 'user',
 *             action: 'fetchProfile',
 *             userId: userId,
 *             additional: { endpoint: `/api/users/${userId}`, status: response.status }
 *           }
 *         })
 *       }
 *       return null
 *     }
 *
 *     return await response.json()
 *   } catch (error) {
 *     errorLogError({
 *       message: 'Unexpected error fetching user profile',
 *       level: 'FATAL',
 *       code: 'NETWORK_ERROR',
 *       category: 'API',
 *       context: {
 *         plugin: 'user',
 *         action: 'fetchProfile',
 *         userId: userId,
 *         additional: { endpoint: `/api/users/${userId}` }
 *       },
 *       stack: error.stack
 *     })
 *     throw error
 *   }
 * }
 * ```
 */

/**
 * @typedef {Object} ErrorContext
 * @description Additional context information to help identify where and why an error occurred.
 * @property {string} [plugin] - Name of the plugin where the error originated (e.g., 'user', 'api', 'component')
 * @property {string} [action] - Name of the action/method where the error occurred (e.g., 'fetchProfile', 'validateForm')
 * @property {string} [userId] - ID of the user experiencing the error (useful for tracking user-specific issues)
 * @property {Object} [additional] - Any additional custom data relevant to debugging (e.g., request IDs, form data, state values)
 * @example
 * {
 *   plugin: 'user',
 *   action: 'fetchProfile',
 *   userId: 'user_123',
 *   additional: { requestId: 'req_456', endpoint: '/api/profile' }
 * }
 */

/**
 * @typedef {'ERROR' | 'WARN' | 'FATAL'} ErrorLevel
 * @description Error severity level that determines impact and urgency:
 * - 'ERROR': Non-critical errors that don't stop application flow
 * - 'WARN': Potential issues that should be monitored
 * - 'FATAL': Critical errors that may crash the application or cause data loss
 */

/**
 * @typedef {Object} ErrorData
 * @description Complete error information stored in the system
 * @property {string} id - Unique error ID (auto-generated)
 * @property {string} message - Human-readable error message
 * @property {string} [stack] - Error stack trace for debugging
 * @property {string} [code] - Machine-readable error code for categorization (e.g., 'NETWORK_ERROR', 'VALIDATION_FAILED')
 * @property {string} [category] - Error category for grouping (e.g., 'API', 'VALIDATION', 'DATABASE', 'UI')
 * @property {ErrorLevel} level - Error severity level
 * @property {ErrorContext} [context] - Context information about where the error occurred
 * @property {Object} [browser] - Browser/environment information (user agent, viewport, etc.)
 * @property {number} timestamp - Unix timestamp in milliseconds when error occurred
 */

export const error = createPlugin('error', {
  metadata: {
    title: 'Error Reporting',
    description: 'Client-side error reporting and logging system',
    icon: 'mdi:alert-circle-outline'
  },
  data: {
    /** @type {Object.<string, ErrorData>} */
    errors: Object.create(null),
    /** @type {string[]} */
    errorIds: [],
    /** @type {number} */
    maxErrors: 100,
    /** @type {string|null} */
    reportEndpoint: null
  },
  privateMethods: {
    /**
     * Captures browser and environment information
     * @returns {Object} Browser information object
     */
    captureBrowserInfo () {
      const browser = {}

      if (typeof window !== 'undefined') {
        browser.userAgent = navigator.userAgent
        browser.platform = navigator.platform
        browser.language = navigator.language
        browser.url = window.location.href
        browser.pathname = window.location.pathname
        browser.hostname = window.location.hostname
        browser.viewport = {
          width: window.innerWidth,
          height: window.innerHeight
        }
        browser.screen = {
          width: screen.width,
          height: screen.height
        }
        browser.timestamp = Date.now()
      }

      return browser
    },

    /**
     * Formats error for console output
     * @param {ErrorData} errorData - Error data to format
     * @returns {string} Formatted error message
     */
    formatErrorForConsole (errorData) {
      const timestamp = new Date(errorData.timestamp)
      const timeStr = timestamp.toISOString().split('T')[1].split('.')[0]

      let output = `[${timeStr}] `

      switch (errorData.level) {
        case 'FATAL':
          output += '🚨 FATAL: '
          break
        case 'ERROR':
          output += '❌ ERROR: '
          break
        case 'WARN':
          output += '⚠️  WARN: '
          break
        default:
          output += 'ℹ️  INFO: '
      }

      output += errorData.message

      if (errorData.code) {
        output += ` [${errorData.code}]`
      }

      if (errorData.category) {
        output += ` {${errorData.category}}`
      }

      if (errorData.context?.plugin) {
        output += ` (plugin: ${errorData.context.plugin}`
        if (errorData.context.action) {
          output += `, action: ${errorData.context.action}`
        }
        output += ')'
      }

      return output
    },

    /**
     * Checks if error matches filter criteria
     * @param {ErrorData} errorData - Error data to check
     * @param {Object} [filter = {}] - Filter criteria
     * @returns {boolean} True if error matches filter
     */
    matchesFilter (errorData, filter = {}) {
      if (!errorData) return false

      if (filter.code && errorData.code !== filter.code) {
        return false
      }

      if (filter.category && errorData.category !== filter.category) {
        return false
      }

      if (filter.level && errorData.level !== filter.level) {
        return false
      }

      return true
    },

    /**
     * Trims error collection to max size
     */
    trimErrors () {
      while (this.errorIds.length > this.maxErrors) {
        const oldestId = this.errorIds.shift()
        if (oldestId) {
          delete this.errors[oldestId]
        }
      }
    },

    /**
     * Stores error in state and manages error collection size
     * @param {ErrorData} errorData - Error data to store
     */
    storeError (errorData) {
      // Add to state
      this.errors[errorData.id] = errorData
      this.errorIds.push(errorData.id)

      // Trim if exceeds max
      this.trimErrors()
    },

    /**
     * Reports error to server if endpoint is configured
     * @param {ErrorData} errorData - Error data to report
     * @returns {Promise<void>}
     */
    async reportToServer (errorData) {
      if (!this.reportEndpoint) {
        return
      }

      try {
        await fetch(this.reportEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(errorData)
        })
      } catch (reportError) {
        // Silently fail - don't want error reporting to cause more errors
        console.warn('Failed to report error to server:', reportError)
      }
    }
  },
  actions: {
    logError: {
      metadata: {
        title: 'Log Error',
        description: 'Log an error with context and store it',
        icon: 'mdi:alert-circle'
      },
      parameters: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            required: true
          },
          level: {
            type: 'string',
            component: {
              title: 'Error Level',
              id: 'action-param-string'
            }
          },
          code: {
            type: 'string',
            component: {
              title: 'Error Code',
              id: 'action-param-string'
            }
          },
          category: {
            type: 'string',
            component: {
              title: 'Error Category',
              id: 'action-param-string'
            }
          },
          context: {
            type: 'object',
            component: {
              title: 'Error Context',
              id: 'action-param-object'
            }
          },
          stack: {
            type: 'string',
            component: {
              title: 'Stack Trace',
              id: 'action-param-string'
            }
          }
        }
      },
      /**
       * Logs an error with context information and stores it in state
       * @param {Object} param - Parameters for logging error
       * @param {string} param.message - Error message (required). Should be clear and descriptive.
       * @param {'ERROR' | 'WARN' | 'FATAL'} [param.level='ERROR'] - Error severity level:
       *   - 'ERROR': Non-critical errors that don't stop application flow (e.g., failed validation)
       *   - 'WARN': Potential issues that should be monitored (e.g., deprecated API usage)
       *   - 'FATAL': Critical errors that may crash the application (e.g., database connection lost)
       * @param {string} [param.code] - Machine-readable error code for categorization.
       *   Use consistent codes like 'NETWORK_ERROR', 'VALIDATION_FAILED', 'AUTH_REQUIRED'.
       *   Helps with filtering and automated error handling.
       * @param {string} [param.category] - Error category for grouping related errors.
       *   Common categories: 'API', 'VALIDATION', 'DATABASE', 'UI', 'AUTH', 'NETWORK'.
       *   Useful for filtering and reporting.
       * @param {ErrorContext} [param.context] - Additional context information to help debug.
       *   Include plugin name, action name, user ID, and any relevant data.
       * @param {string} [param.stack] - Stack trace for debugging. Usually auto-captured from Error objects.
       *   Include when available for better debugging.
       * @returns {string} Error ID for reference and tracking
       * @example
       * // Basic error logging
       * errorLogError({ message: 'Failed to load user data' })
       * @example
       * // API error with full context
       * errorLogError({
       *   message: 'Failed to fetch user profile',
       *   level: 'ERROR',
       *   code: 'NETWORK_ERROR',
       *   category: 'API',
       *   context: {
       *     plugin: 'user',
       *     action: 'fetchProfile',
       *     userId: 'user_123',
       *     additional: { endpoint: '/api/users/123', method: 'GET' }
       *   }
       * })
       * @example
       * // Validation error
       * errorLogError({
       *   message: 'Email format is invalid',
       *   level: 'WARN',
       *   code: 'VALIDATION_FAILED',
       *   category: 'VALIDATION',
       *   context: {
       *     plugin: 'form',
       *     action: 'validateEmail',
       *     additional: { field: 'email', value: 'invalid@' }
       *   }
       * })
       * @example
       * // Fatal error with stack trace
       * try {
       *   // Some operation that might fail
       * } catch (error) {
       *   errorLogError({
       *     message: 'Database connection lost',
       *     level: 'FATAL',
       *     code: 'DATABASE_ERROR',
       *     category: 'DATABASE',
       *     context: { plugin: 'database', action: 'connect' },
       *     stack: error.stack
       *   })
       * }
       */
      method ({
        message,
        level = 'ERROR',
        code,
        category,
        context,
        stack
      }) {
        const errorId = generateId()
        const timestamp = Date.now()

        // Capture browser info
        const browser = this.captureBrowserInfo()

        // Create error data object
        /** @type {ErrorData} */
        const errorData = {
          id: errorId,
          message: typeof message === 'string' ? message : serialize(message),
          level,
          timestamp,
          browser
        }

        if (code) errorData.code = code
        if (category) errorData.category = category
        if (context) errorData.context = context
        if (stack) errorData.stack = stack

        // Store error in state
        this.storeError(errorData)

        // Format and log to console
        const formattedMessage = this.formatErrorForConsole(errorData)
        console.error(formattedMessage)

        // Add stack trace to console if available
        if (stack) {
          console.error(stack)
        }

        // Report to server if configured
        this.reportToServer(errorData)

        return errorId
      }
    },
    getErrors: {
      metadata: {
        title: 'Get Errors',
        description: 'Retrieve stored errors with optional filtering',
        icon: 'mdi:database-search'
      },
      parameters: {
        type: 'object',
        properties: {
          filter: {
            type: 'object',
            component: {
              title: 'Filter',
              id: 'action-param-object'
            }
          },
          limit: {
            type: 'number',
            component: {
              title: 'Limit',
              id: 'action-param-number'
            }
          }
        }
      },
      /**
       * Retrieves stored errors with optional filtering
       * @param {Object} param - Parameters for retrieving errors
       * @param {Object} [param.filter] - Filter criteria to match specific errors.
       *   Multiple filters can be combined - errors must match ALL filter conditions.
       * @param {string} [param.filter.code] - Filter by exact error code match.
       *   Example: 'NETWORK_ERROR', 'VALIDATION_FAILED', 'AUTH_REQUIRED'
       * @param {string} [param.filter.category] - Filter by exact category match.
       *   Example: 'API', 'VALIDATION', 'DATABASE', 'UI', 'AUTH', 'NETWORK'
       * @param {'ERROR' | 'WARN' | 'FATAL'} [param.filter.level] - Filter by severity level.
       *   Example: 'ERROR', 'WARN', 'FATAL'
       * @param {number} [param.limit] - Maximum number of errors to return.
       *   Useful for performance when you only need recent errors.
       *   Returns errors from newest to oldest.
       * @returns {ErrorData[]} Array of error objects, sorted from newest to oldest
       * @example
       * // Get all errors (no filtering)
       * const allErrors = errorGetErrors({})
       * @example
       * // Get recent API errors (limited to 10)
       * const apiErrors = errorGetErrors({
       *   filter: { category: 'API' },
       *   limit: 10
       * })
       * @example
       * // Get all critical errors
       * const criticalErrors = errorGetErrors({
       *   filter: { level: 'FATAL' }
       * })
       * @example
       * // Get specific error type
       * const networkErrors = errorGetErrors({
       *   filter: { code: 'NETWORK_ERROR' }
       * })
       * @example
       * // Combine multiple filters (errors must match ALL conditions)
       * const recentApiErrors = errorGetErrors({
       *   filter: {
       *     category: 'API',
       *     level: 'ERROR'
       *   },
       *   limit: 5
       * })
       */
      method ({ filter, limit } = {}) {
        const errors = []
        const ids = this.errorIds

        // Iterate from newest to oldest
        for (let i = ids.length - 1; i >= 0; i--) {
          const id = ids[i]
          const errorData = this.errors[id]

          if (this.matchesFilter(errorData, filter)) {
            errors.push(errorData)

            if (limit && errors.length >= limit) {
              break
            }
          }
        }

        return errors
      }
    },
    clearErrors: {
      metadata: {
        title: 'Clear Errors',
        description: 'Clear stored errors',
        icon: 'mdi:trash-can-outline'
      },
      parameters: {
        type: 'object',
        properties: {
          filter: {
            type: 'object',
            component: {
              title: 'Filter',
              id: 'action-param-object'
            }
          }
        }
      },
      /**
       * Clears stored errors
       * @param {Object} param - Parameters for clearing errors
       * @param {Object} [param.filter] - Filter criteria to selectively clear errors.
       *   If no filter is provided, ALL errors will be cleared.
       *   Multiple filters can be combined - errors must match ALL filter conditions.
       * @param {string} [param.filter.code] - Clear errors with exact error code match.
       *   Example: 'NETWORK_ERROR', 'VALIDATION_FAILED', 'AUTH_REQUIRED'
       * @param {string} [param.filter.category] - Clear errors with exact category match.
       *   Example: 'API', 'VALIDATION', 'DATABASE', 'UI', 'AUTH', 'NETWORK'
       * @param {'ERROR' | 'WARN' | 'FATAL'} [param.filter.level] - Clear errors with specific severity level.
       *   Example: 'ERROR', 'WARN', 'FATAL'
       * @returns {number} Number of errors that were cleared
       * @example
       * // Clear ALL errors (use with caution!)
       * const cleared = errorClearErrors({})
       * console.log(`Cleared ${cleared} errors`)
       * @example
       * // Clear only API errors
       * const cleared = errorClearErrors({ filter: { category: 'API' } })
       * console.log(`Cleared ${cleared} API errors`)
       * @example
       * // Clear all fatal errors
       * const cleared = errorClearErrors({ filter: { level: 'FATAL' } })
       * console.log(`Cleared ${cleared} fatal errors`)
       * @example
       * // Clear specific error type
       * const cleared = errorClearErrors({ filter: { code: 'NETWORK_ERROR' } })
       * console.log(`Cleared ${cleared} network errors`)
       * @example
       * // Combine multiple filters (errors must match ALL conditions)
       * const cleared = errorClearErrors({
       *   filter: {
       *     category: 'API',
       *     level: 'ERROR'
       *   }
       * })
       * console.log(`Cleared ${cleared} API errors`)
       */
      method ({ filter = {} } = {}) {
        let cleared = 0

        if (Object.keys(filter).length === 0) {
          // Clear all errors
          cleared = this.errorIds.length
          this.errors = Object.create(null)
          this.errorIds = []
        } else {
          // Clear filtered errors
          const remainingIds = []
          const remainingErrors = Object.create(null)

          for (const id of this.errorIds) {
            const errorData = this.errors[id]

            if (this.matchesFilter(errorData, filter)) {
              cleared++
            } else {
              remainingIds.push(id)
              remainingErrors[id] = errorData
            }
          }

          this.errorIds = remainingIds
          this.errors = remainingErrors
        }

        return cleared
      }
    },
    getErrorCount: {
      metadata: {
        title: 'Get Error Count',
        description: 'Get count of stored errors',
        icon: 'mdi:counter'
      },
      parameters: {
        type: 'object',
        properties: {
          filter: {
            type: 'object',
            component: {
              title: 'Filter',
              id: 'action-param-object'
            }
          }
        }
      },
      /**
       * Gets count of stored errors
       * @param {Object} param - Parameters for counting errors
       * @param {Object} [param.filter] - Filter criteria to count specific errors.
       *   If no filter is provided, counts ALL errors.
       *   Multiple filters can be combined - errors must match ALL filter conditions.
       * @param {string} [param.filter.code] - Count errors with exact error code match.
       *   Example: 'NETWORK_ERROR', 'VALIDATION_FAILED', 'AUTH_REQUIRED'
       * @param {string} [param.filter.category] - Count errors with exact category match.
       *   Example: 'API', 'VALIDATION', 'DATABASE', 'UI', 'AUTH', 'NETWORK'
       * @param {'ERROR' | 'WARN' | 'FATAL'} [param.filter.level] - Count errors with specific severity level.
       *   Example: 'ERROR', 'WARN', 'FATAL'
       * @returns {number} Number of errors matching the criteria
       * @example
       * // Get total error count (all errors)
       * const totalErrors = errorGetErrorCount({})
       * console.log(`Total errors: ${totalErrors}`)
       * @example
       * // Get count of API errors
       * const apiErrorCount = errorGetErrorCount({ filter: { category: 'API' } })
       * console.log(`API errors: ${apiErrorCount}`)
       * @example
       * // Get count of critical errors
       * const criticalCount = errorGetErrorCount({ filter: { level: 'FATAL' } })
       * console.log(`Critical errors: ${criticalCount}`)
       * @example
       * // Get count of specific error type
       * const networkErrorCount = errorGetErrorCount({ filter: { code: 'NETWORK_ERROR' } })
       * console.log(`Network errors: ${networkErrorCount}`)
       * @example
       * // Combine multiple filters (errors must match ALL conditions)
       * const recentApiErrorCount = errorGetErrorCount({
       *   filter: {
       *     category: 'API',
       *     level: 'ERROR'
       *   }
       * })
       * console.log(`Recent API errors: ${recentApiErrorCount}`)
       */
      method ({ filter } = {}) {
        if (!filter) {
          return this.errorIds.length
        }

        let count = 0

        for (const id of this.errorIds) {
          const errorData = this.errors[id]

          if (this.matchesFilter(errorData, filter)) {
            count++
          }
        }

        return count
      }
    }
  },
  /**
   * Setup the error plugin configuration
   * @param {Object} param - Setup parameters
   * @param {number} [param.maxErrors=100] - Maximum number of errors to store in memory.
   *   When this limit is reached, the oldest errors are automatically removed.
   *   Set this based on your application's error volume and memory constraints.
   *   Common values: 50 (low volume), 100 (default), 500 (high volume)
   * @param {string} [param.reportEndpoint] - Endpoint URL for reporting errors to server.
   *   When configured, each error will be sent to this endpoint via POST request.
   *   Example: '/api/errors/report' or 'https://monitoring.example.com/errors'
   *   If not configured, errors are only stored locally and logged to console.
   * @example
   * // Basic setup with default configuration
   * error_setup({})
   * @example
   * // Setup with custom max errors
   * error_setup({ maxErrors: 50 })
   * @example
   * // Setup with server reporting
   * error_setup({
   *   maxErrors: 100,
   *   reportEndpoint: '/api/errors/report'
   * })
   * @example
   * // Setup for high-volume application
   * error_setup({
   *   maxErrors: 500,
   *   reportEndpoint: 'https://monitoring.example.com/api/errors'
   * })
   */
  setup ({ maxErrors = 100, reportEndpoint } = {}) {
    this.maxErrors = maxErrors
    this.reportEndpoint = reportEndpoint
    this.trimErrors()
  }
})

export const {
  errorLogError,
  errorGetErrors,
  errorClearErrors,
  errorGetErrorCount
} = error

export default error
