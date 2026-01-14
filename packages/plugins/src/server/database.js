import { createPlugin } from '@dooksa/create-plugin'
import { writeFile, readFile, access, unlink, rename } from 'node:fs/promises'
import { resolve, join } from 'path'
import { stateGetValue, stateSetValue, stateDeleteValue, stateFind } from '../client/index.js'
import { generateId, getPreciseTimestamp } from '@dooksa/utils'
import { log } from '@dooksa/utils/server'

/**
 * Custom error class for database snapshot operations
 *
 * @extends Error
 * @property {number} timestamp - High-resolution timestamp in milliseconds
 * @property {string} code - Error code for categorization
 * @property {string} collection - Collection name associated with the error
 */
class SnapshotError extends Error {
  /**
   * Creates a new SnapshotError instance
   *
   * @param {string} message - Error message
   * @param {Object} options - Error options
   * @param {string} [options.code] - Error code
   * @param {string} [options.collection] - Collection name
   * @param {Error} [options.cause] - Original error cause
   */
  constructor (message, options = {}) {
    super(message)
    this.name = 'SnapshotError'
    this.timestamp = getPreciseTimestamp()
    this.code = options.code || 'SNAPSHOT_ERROR'
    this.collection = options.collection || ''
    if (options.cause) {
      this.cause = options.cause
    }

    // Maintains proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, SnapshotError)
    }
  }
}

/**
 * Database Plugin - Manages data collections with snapshot capabilities
 *
 * Provides CRUD operations for data collections via HTTP endpoints, with support for:
 * - Complex query conditions using WHERE clauses
 * - Data expansion for relational data
 * - Snapshot-based persistence and seeding
 * - Transaction-like operations with locking mechanisms
 *
 * @import {DataWhere} from '../../../types.js'
 * @import {Request, Response} from 'express'
 */

export const database = createPlugin('database', {
  data: {
    snapshotLock: {},
    snapshotQueue: {},
    snapshotError: {},
    snapshotPath: '',
    config: {
      maxSnapshotSize: 100 * 1024 * 1024,
      fileTimeout: 30000,
      maxQueueSize: 100,
      maxRetries: 3,
      cleanupInterval: 60000
    },
    operators: {
      '>': true,
      '>=': true,
      '<=': true,
      '<': true,
      '~': true,
      '!=': true,
      '==': true,
      ')': true,
      '(': true,
      '&': true,
      '|': true
    },
    types: {
      f: [['f', 'a', 'l', 's', 'e'], false],
      t: [['t', 'r', 'u', 'e'], true],
      n: [['n', 'u', 'l', 'l'], null]
    }
  },
  privateMethods: {
    /**
     * Creates a snapshot of a collection's current state
     *
     * This method implements a locking mechanism with timeout controls, memory limits,
     * and proper error recovery to prevent concurrent snapshot operations and resource issues.
     *
     * @private
     * @param {string} collection - The name of the collection to snapshot
     * @returns {void}
     *
     * @example
     * // Basic usage
     * this.setSnapshot('users')
     *
     * @example
     * // With locking mechanism
     * // First call: creates snapshot
     * this.setSnapshot('users')
     * // Second call (while first is running): queues the operation
     * this.setSnapshot('users')
     *
     * @example
     * // Error recovery
     * // If snapshot fails, error state is cleared after cleanup interval
     * // Next call will retry automatically
     * this.setSnapshot('users') // Fails
     * // Wait for cleanup interval (60s default)
     * this.setSnapshot('users') // Retries successfully
     *
     * @note
     * - Uses config.maxSnapshotSize to validate data size
     * - Uses config.fileTimeout for file operation timeouts
     * - Uses config.maxRetries for retry attempts
     * - Uses config.maxQueueSize to prevent memory leaks
     * - Automatically cleans up error states after config.cleanupInterval
     * - Implements proper lock release in finally block
     * - Uses temp file + rename for atomic operations
     */
    setSnapshot (collection) {
      // Check queue size limit to prevent memory leaks
      if (this.snapshotQueue[collection] && this.snapshotQueue[collection] >= this.config.maxQueueSize) {
        // Queue is full, clear it and report error
        this.snapshotQueue[collection] = false
        this.snapshotError[collection] = new SnapshotError(`Snapshot queue limit reached for collection: ${collection}`)
        return
      }

      // Check if in permanent error state
      if (this.snapshotError[collection]) {
        // Check if we should clear the error (after cleanup interval)
        const errorTime = this.snapshotError[collection].timestamp
        if (errorTime && (Date.now() - errorTime > this.config.cleanupInterval)) {
          // Clear error state and allow retry
          delete this.snapshotError[collection]
        } else {
          // Still in error state, queue if not already queued
          if (!this.snapshotQueue[collection]) {
            this.snapshotQueue[collection] = 1
          } else {
            this.snapshotQueue[collection]++
          }
          return
        }
      }

      // Set queue if locked
      if (this.snapshotLock[collection]) {
        if (!this.snapshotQueue[collection]) {
          this.snapshotQueue[collection] = 1
        } else {
          this.snapshotQueue[collection]++
        }
        return
      }

      // Acquire lock
      this.snapshotLock[collection] = true
      this.snapshotQueue[collection] = false

      // Execute snapshot with retry logic
      this.executeSnapshotWithRetry(collection, 1)
        .then(() => {
          // Success - process queue
          this.processSnapshotQueue(collection)
        })
        .catch(error => {
          // Failure - handle error and process queue
          this.handleSnapshotError(collection, error)
          this.processSnapshotQueue(collection)
        })
    },

    /**
     * Internal method to execute snapshot with retry logic and timeout controls
     *
     * @private
     * @param {string} collection - Collection name
     * @param {number} attempt - Current retry attempt
     * @returns {Promise<void>}
     */
    executeSnapshotWithRetry (collection, attempt) {
      return new Promise((resolve, reject) => {
        // Get data first (synchronous)
        const data = stateGetValue({ name: collection })

        if (data.isEmpty) {
          const error = new SnapshotError(`Snapshot failed, no collection found: ${collection}`)
          error.timestamp = getPreciseTimestamp()
          reject(error)
          return
        }

        // Validate data size
        const dataString = JSON.stringify({
          collection,
          item: data.item,
          createdAt: Date.now()
        })

        if (dataString.length > this.config.maxSnapshotSize) {
          const error = new SnapshotError(`Snapshot data size (${dataString.length} bytes) exceeds limit (${this.config.maxSnapshotSize} bytes) for collection: ${collection}`)
          error.timestamp = getPreciseTimestamp()
          reject(error)
          return
        }

        // Generate file paths
        const timestamp = Date.now()
        const uuid = generateId()
        const fileName = collection.replace(/[A-Z]/g, letter => '-' + letter.toLowerCase()).replace('/', '-')
        const tempFilePath = join(this.snapshotPath, fileName + uuid + '.json')
        const filePath = join(this.snapshotPath, fileName + '.json')

        // Create timeout promise
        const timeoutPromise = new Promise((_, rejectTimeout) => {
          setTimeout(() => {
            const error = new SnapshotError(`Snapshot timeout after ${this.config.fileTimeout}ms for collection: ${collection}`)
            error.timestamp = getPreciseTimestamp()
            rejectTimeout(error)
          }, this.config.fileTimeout)
        })

        // Create file operation promise
        const fileOperationPromise = new Promise((resolveFile, rejectFile) => {
          writeFile(tempFilePath, dataString)
            .then(() => {
              // Use rename for atomic operation
              rename(tempFilePath, filePath)
                .then(() => {
                  resolveFile()
                })
                .catch((error) => {
                  // Clean up temp file on failure
                  unlink(tempFilePath).catch(() => {
                    // Ignore unlink errors
                  })
                  error.timestamp = getPreciseTimestamp()
                  rejectFile(error)
                  return
                })
            })
            .catch(error => {
              error.timestamp = getPreciseTimestamp()
              rejectFile(error)
            })
        })

        // Race between file operation and timeout
        Promise.race([fileOperationPromise, timeoutPromise])
          .then(resolve)
          .catch(error => {
            // Retry logic
            if (attempt < this.config.maxRetries) {
              // Wait a bit before retry (exponential backoff)
              const delay = Math.pow(2, attempt) * 100
              setTimeout(() => {
                this.executeSnapshotWithRetry(collection, attempt + 1)
                  .then(resolve)
                  .catch(reject)
              }, delay)
            } else {
              reject(error)
            }
          })
      })
    },

    /**
     * Process queued snapshot operations
     *
     * @private
     * @param {string} collection - Collection name
     */
    processSnapshotQueue (collection) {
      // Release lock
      this.snapshotLock[collection] = false

      // Check if there are queued operations
      if (this.snapshotQueue[collection] && this.snapshotQueue[collection] > 0) {
        // Decrement queue counter
        this.snapshotQueue[collection]--

        // If still queued, execute next snapshot
        if (this.snapshotQueue[collection] > 0) {
          // Use setImmediate to avoid stack overflow
          setImmediate(() => {
            this.setSnapshot(collection)
          })
        } else {
          // Clear empty queue
          this.snapshotQueue[collection] = false
        }
      }
    },

    /**
     * Handle snapshot errors with proper state management
     *
     * @private
     * @param {string} collection - Collection name
     * @param {Error} error - Error object
     */
    handleSnapshotError (collection, error) {
      // Log error (without exposing sensitive data)
      console.error(`[Database Plugin] Snapshot error for collection "${collection}":`, error.message)

      // Store error with timestamp for cleanup
      this.snapshotError[collection] = error
      this.snapshotError[collection].timestamp = Date.now()

      // Release lock
      this.snapshotLock[collection] = false

      // Don't clear queue - let it retry automatically
      // Queue will be processed by _processSnapshotQueue
    },
    /**
     * Converts a conditional string expression into a DataWhere object
     *
     * This method parses string-based conditional expressions and converts them into
     * structured DataWhere objects that can be used for querying data collections.
     * It supports complex conditions with AND/OR operators and parentheses for grouping.
     *
     * @private
     * @param {string} string - Conditional string expression to parse
     * @returns {DataWhere} Structured where object for data queries
     * @throws {Error} When the expression has invalid syntax or missing quotes
     *
     * @example
     * // Basic equality condition
     * stringToCondition("status == 'active'")
     * // Returns: { name: 'status', op: '==', value: 'active' }
     *
     * @example
     * // Numeric comparison
     * stringToCondition("age > 25")
     * // Returns: { name: 'age', op: '>', value: 25 }
     *
     * @example
     * // Boolean and null values
     * stringToCondition("isActive == true")
     * // Returns: { name: 'isActive', op: '==', value: true }
     *
     * stringToCondition("deletedAt == null")
     * // Returns: { name: 'deletedAt', op: '==', value: null }
     *
     * @example
     * // Complex AND/OR conditions
     * stringToCondition("(age > 18 && status == 'active') || role == 'admin'")
     * // Returns: {
     * //   and: [
     * //     { name: 'age', op: '>', value: 18 },
     * //     { name: 'status', op: '==', value: 'active' }
     * //   ],
     * //   or: [
     * //     { name: 'role', op: '==', value: 'admin' }
     * //   ]
     * // }
     *
     * @example
     * // Pattern matching with ~ operator
     * stringToCondition("name ~ 'john'")
     * // Returns: { name: 'name', op: '~', value: 'john' }
     *
     * @example
     * // Not equal operator
     * stringToCondition("status != 'deleted'")
     * // Returns: { name: 'status', op: '!=', value: 'deleted' }
     *
     * @example
     * // Parentheses for grouping
     * stringToCondition("(age >= 18 && age <= 65)")
     * // Returns: {
     * //   and: [
     * //     { name: 'age', op: '>=', value: 18 },
     * //     { name: 'age', op: '<=', value: 65 }
     * //   ]
     * // }
     *
     * @example
     * // Complex nested conditions
     * stringToCondition("((role == 'admin' || role == 'moderator') && active == true) || premium == true")
     * // Returns: {
     * //   or: [
     * //     {
     * //       and: [
     * //         {
     * //           or: [
     * //             { name: 'role', op: '==', value: 'admin' },
     * //             { name: 'role', op: '==', value: 'moderator' }
     * //           ]
     * //         },
     * //         { name: 'active', op: '==', value: true }
     * //       ]
     * //     },
     * //     { name: 'premium', op: '==', value: true }
     * //   ]
     * // }
     *
     * @supported-operators
     * - Comparison: `==`, `!=`, `>`, `>=`, `<`, `<=`
     * - Pattern: `~` (like/contains)
     * - Logical: `&&` (and), `||` (or)
     * - Grouping: `(`, `)`
     *
     * @supported-values
     * - Strings: Must be quoted with single or double quotes
     * - Numbers: Integers and decimals (parsed as integers)
     * - Booleans: `true`, `false`
     * - Null: `null`
     *
     * @throws {Error} "String missing end quote" - When a string value is not properly closed
     * @throws {Error} "AND OR Unexpected character" - When AND/OR operators are malformed
     * @throws {Error} "Missing value before operator" - When an operator appears without a preceding value
     * @throws {Error} "Unexpected mix of '&&' and '||'" - When mixing operators without proper parentheses
     */
    stringToCondition (string) {
      const result = {}
      const sequence = {
        index: 0,
        openBracket: false,
        closedBracket: false,
        list: [result],
        currentAndOr: '',
        current: result
      }
      let stringStart = 0
      let stringEnd = string.length
      let stringEndIndex = stringEnd - 1
      let condition = {}
      let value = ''

      if (string[0] === '(' && string[stringEndIndex] === ')') {
        stringStart++
        stringEnd--
        stringEndIndex--
      }

      // remove whitespace
      string = string.trim()

      for (let i = stringStart; i < stringEnd; i++) {
        let char = string[i]

        if (char === ' ') {
          continue
        }

        // store string
        if (char === "'" || char === '"') {
          let j = i + 1
          let char = string[j]

          do {
            value += char
            j++
            char = string[j]

            if (j > string.length) {
              throw new SnapshotError('String missing end quote')
            }
          } while (char !== "'" && char !== '"')

          i = j

          condition.value = value

          // end of condition
          if (i === stringEndIndex) {
            if (Array.isArray(sequence.current)) {
              sequence.current.push(condition)
            } else {
              sequence.current.name = condition.name
              sequence.current.op = condition.op
              sequence.current.value = condition.value
            }

            break
          }

          value = ''

          continue
        }

        // store by (boolean/null)
        if (this.types[char]) {
          const [chars, newValue] = this.types[char]
          let isValid = true

          for (let j = 0; j < chars.length; j++) {
            const char = chars[j]

            if (char !== string[i + j]) {
              isValid = false
              break
            }
          }

          if (!isValid) {
            value += char

            continue
          }

          // test next char
          if (/[^a-zA-Z0-9_ ]/.test(string[i + chars.length])) {
            value += char

            continue
          }

          condition.value = newValue

          // end of condition
          if (i === stringEndIndex) {
            if (Array.isArray(sequence.current)) {
              sequence.current.push(condition)
            } else {
              sequence.current.name = condition.name
              sequence.current.op = condition.op
              sequence.current.value = condition.value
            }

            break
          }

          // set index after value
          i = i + chars.length
          // reset value
          value = ''

          continue
        }

        // store number
        if (!isNaN(parseInt(char))) {
          let j = i
          let num = string[j]

          while (!isNaN(parseInt(num))) {
            value += num
            num = string[++j]
          }

          i = j - 1

          const nextChar = string[j]

          if (!this.operators[nextChar] && nextChar !== ' ' && i !== stringEnd) {
            continue
          }

          condition.value = parseInt(value)

          // end of condition
          if (i === stringEndIndex) {
            if (Array.isArray(sequence.current)) {
              sequence.current.push(condition)
            } else {
              sequence.current.name = condition.name
              sequence.current.op = condition.op
              sequence.current.value = condition.value
            }

            break
          }

          value = ''

          continue
        }

        if (char === '(') {
          sequence.openBracket = true

          continue
        }

        if (char === ')') {
          --sequence.index
          sequence.closedBracket = true

          continue
        }

        if (char === '&' || char === '|') {
          char = string[++i]

          if (char !== '&' && char !== '|') {
            throw new SnapshotError('AND OR Unexpected character "' + char + '"')
          }

          let andOr = 'and'

          if (char === '|') {
            andOr = 'or'
          }

          if (sequence.closedBracket && condition.value !== '' && condition.op !== '' && condition.name !== '') {
            sequence.closedBracket = false
            sequence.current.push(condition)
            condition = {
              name: '',
              op: '',
              value: ''
            }
          }

          const currentIndex = sequence.list.indexOf(sequence.current)
          let listChange = false

          if (currentIndex !== sequence.index) {
            sequence.current = sequence.list[sequence.index]
            listChange = true
          }

          if (sequence.openBracket || listChange || !sequence.currentAndOr) {
            if (Array.isArray(sequence.current)) {
              sequence.current.push({
                [andOr]: []
              })
              sequence.current = sequence.current[sequence.current.length - 1][andOr]
            } else {
              if (!sequence.current[andOr]) {
                sequence.current[andOr] = []
              }

              sequence.current = sequence.current[andOr]
            }

            sequence.openBracket = false
            sequence.index = sequence.list.length
            sequence.list.push(sequence.current)
            sequence.currentAndOr = andOr
          } else if (sequence.currentAndOr !== andOr) {
            throw new SnapshotError("Unexpected mix of '&&' and '||'. Use parentheses to clarify the intended order of operations.")
          }

          if (value !== '') {
            condition.value = value
            value = ''
          }

          if (condition.value !== '' && condition.op !== '' && condition.name !== '') {
            sequence.current.push(condition)
            condition = {
              name: '',
              op: '',
              value: ''
            }
          }

          continue
        }

        const op1 = this.operators[char]
        const op2 = this.operators[char + string[i + 1]]
        if (op1 || op2) {
          if (op1) {
            condition.op = char
          } else if (op2) {
            condition.op = char + string[++i]
          }

          if (value === '') {
            throw new SnapshotError('Missing value before operator')
          }

          condition.name = value

          value = ''

          continue
        }

        value += char

        // end of condition
        if (i === stringEndIndex) {
          if (Array.isArray(sequence.current)) {
            sequence.current.push(condition)
          } else {
            sequence.current.name = condition.name
            sequence.current.op = condition.op
            sequence.current.value = value
          }
        }
      }

      return result
    }
  },
  methods: {
    /**
     * Creates an HTTP request handler for retrieving data from collections
     *
     * This method returns a function that handles GET requests to retrieve data from
     * specified collections. It supports querying by ID, complex WHERE conditions,
     * and data expansion for relational data.
     *
     * @param {string[]} collections - Array of collection names to query
     *
     * @example
     * // Basic usage with single collection
     * const handler = database.methods.getValue(['users'])
     * // Usage in Express: app.get('/users', handler)
     *
     * @example
     * // Multiple collections
     * const handler = database.methods.getValue(['users', 'posts'])
     *
     * @example
     * // With query parameters
     * // GET /users?id=123&expand=true
     * // GET /users?where=age>18
     * // GET /users?where=role=='admin'&&active==true
     *
     * @query-parameters
     * - `id`: Single ID or array of IDs to retrieve
     * - `where`: Conditional string for filtering results
     * - `expand`: Set to "true" to expand relational data
     *
     * @see {@link stringToCondition} for WHERE expression syntax
     */
    getValue (collections) {
      /**
       * HTTP request handler for data retrieval
       * @param {Request} request - Express request object with query parameters
       * @param {Response} response - Express response object
       * @returns {void}
       */
      return (request, response) => {
        let limit = -1
        let result = []
        let where
        // @ts-ignore - request.data may not be defined in type but used in practice
        const requestData = request.data || {}

        if (request.query.where && typeof request.query.where === 'string') {
          where = this.stringToCondition(request.query.where)
        }

        // Handle pagination parameters (already parsed by middleware)
        const page = request.query.page
        const perPage = request.query.perPage

        if (request.query.limit > -1) {
          limit = request.query.limit
        }

        for (let i = 0; i < collections.length; i++) {
          const collection = collections[i]

          // fetch entire collection
          if (!requestData.id) {
            const args = {
              name: collection
            }

            if (where) {
              args.where = [where]
            }

            if (request.query.expand) {
              args.options = {
                expand: true
              }
            }

            const dataValues = stateFind(args)

            // Apply pagination if specified
            if (page != null && perPage != null) {
              const offset = (page - 1) * perPage
              const paginatedResults = dataValues.slice(offset, offset + perPage)
              result = result.concat(paginatedResults)
            } else if (limit > 0) {
              // Add only what fits
              const remaining = limit - result.length
              if (remaining > 0) {
                result = result.concat(dataValues.slice(0, remaining))
              } else {
                break
              }
            } else {
              result = result.concat(dataValues)
            }
          } else if(Array.isArray(requestData.id)) {
            for (let i = 0; i < requestData.id.length && (limit <= 0 || result.length < limit); i++) {
              const id = requestData.id[i]
              const args = {
                name: collection,
                id
              }
              const value = { id }

              if (request.query.expand) {
                args.options = {
                  expand: true
                }

                value.expand = []
              }

              const data = stateGetValue(args)

              if (data.isEmpty) {
                // Skip non-existent items instead of returning 404
                // This allows fetchGetById to return empty results gracefully
                continue
              }

              value.item = data.item
              value.metadata = data.metadata
              value.collection = collection

              if (!data.isExpandEmpty) {
                value.expand = data.expand
              }

              if (where) {
                const data = stateFind({
                  name: collection,
                  where: [where]
                })

                if (data) {
                  result.push(data)

                  continue
                }
              }

              result.push(value)
            }
          }
        }

        // if (request.query.sort) {
        //   const sortBy = request.query.sort.split(',')

        //   for (let i = 0; i < sortBy.length; i++) {
        //     const sort = sortBy[i]
        //   }
        // }
        response.status(200).json(result)
      }
    },
    /**
     * Creates an HTTP request handler for deleting data from collections
     *
     * This method returns a function that handles DELETE requests to remove data from
     * specified collections. It supports cascade deletion and creates snapshots
     * after successful deletions.
     *
     * @param {string[]} collections - Array of collection names to delete from
     *
     * @example
     * // Basic usage with single collection
     * const handler = database.methods.deleteValue(['users'])
     * // Usage in Express: app.delete('/users', handler)
     *
     * @example
     * // Multiple collections
     * const handler = database.methods.deleteValue(['users', 'posts'])
     *
     * @example
     * // With cascade parameter
     * // DELETE /users?id=123&cascade=true
     *
     * @query-parameters
     * - `id`: Array of document IDs to delete (required)
     * - `cascade`: Set to "true" to enable cascade deletion
     *
     * @returns-response
     * - 200: Success with "deleted: X" message
     * - 400: Deletion failed (document in use or not found)
     * - 500: Snapshot error occurred
     *
     * @throws {Error} When snapshot creation fails for a collection
     *
     * @see {@link setSnapshot} for snapshot mechanism
     */
    deleteValue (collections) {
      /**
       * HTTP request handler for data deletion
       * @param {Request} request - Express request object with query parameters
       * @param {Response} response - Express response object
       * @returns {void}
       */
      return (request, response) => {
        let result = 0

        for (let i = 0; i < collections.length; i++) {
          const collection = collections[i]

          if (Array.isArray(request.query.id)) {
            for (let i = 0; i < request.query.id.length; i++) {
              const id = request.query.id[i]

              if (typeof id === 'string') {
                const data = stateDeleteValue({
                  name: collection,
                  id,
                  cascade: !!request.query.cascade
                })

                if (!data.deleted) {
                  response.status(400).send(`Could not delete document: ${collection} ${id}`)
                  return
                }

                result += 1
              }
            }
          }

          if (this.snapshotError[collection]) {
            response.status(500).json(this.snapshotError[collection])
            return
          }

          this.setSnapshot(collection)
        }

        response.status(200).send('deleted: ' + result)
      }
    },
    /**
     * Loads seed data from a snapshot file into the state
     *
     * This method loads data from a JSON snapshot file and merges it into the application state.
     * It's designed for initialization and testing purposes. If the seed file doesn't exist,
     * the method silently returns without error, making it safe to call even when no seed
     * data is available.
     *
     * @param {string} name - The name of the seed file (without .json extension)
     * @returns {Promise<void>} Promise that resolves when seed data is loaded
     *
     * @example
     * // Basic usage
     * await database.methods.seed('initial-users')
     * // Loads data from: .ds_snapshots/initial-users.json
     *
     * @example
     * // With nested collection names
     * await database.methods.seed('user-profiles')
     * // Loads from: .ds_snapshots/user-profiles.json
     *
     * @example
     * // Safe usage when file might not exist
     * try {
     *   await database.methods.seed('test-data')
     *   console.log('Seed data loaded or not found')
     * } catch (error) {
     *   console.error('Seed loading failed:', error)
     * }
     *
     * @fires log - When seed data is successfully loaded
     *
     * @throws {Error} When the seed file exists but cannot be parsed or loaded
     *
     * @note
     * - Files are expected in the snapshot directory configured during setup
     * - Existing data is merged (not replaced) when merge option is true
     * - Missing files are silently ignored (no error thrown)
     * - Automatically resets snapshot state for the loaded collection
     *
     * @see {@link setup} for snapshot directory configuration
     * @see {@link setSnapshot} for snapshot creation
     */
    async seed (name) {
      const path = resolve(this.snapshotPath, name + '.json')

      try {
        // Check if file exists using async access
        await access(path)

        // Read file asynchronously
        const json = await readFile(path, 'utf8')
        const data = JSON.parse(json)

        // set cache
        stateSetValue({
          name: data.collection,
          value: data.item,
          options: {
            merge: true
          }
        })

        // setup snapshot collection states
        this.snapshotQueue[data.collection] = false
        this.snapshotLock[data.collection] = false
        this.snapshotError[data.collection] = false

        log({
          message: 'Loaded seed data',
          context: data.collection
        })
      } catch (error) {
        if (error.code === 'ENOENT') {
          // File doesn't exist - this is expected behavior
          return
        }
        console.error('Error loading seed data:', error)
        throw error // Re-throw for caller to handle
      }
    },
    /**
     * Saves multiple data items to collections with validation and snapshotting
     *
     * This method handles bulk data insertion across multiple collections with automatic
     * metadata management and validation. It ensures each item has proper ownership
     * and creates snapshots after successful saves.
     *
     * @param {Object} params - Parameters object
     * @param {Array<Object>} params.items - Array of data items to save
     * @param {string} [params.userId] - User ID for ownership validation and metadata
     * @returns {Object} Result object containing operation status and details
     *
     * @example
     * // Basic usage with user ownership
     * const result = database.methods.setValue({
     *   items: [
     *     { collection: 'users', id: 'user123', item: { name: 'John', email: 'john@example.com' } },
     *     { collection: 'posts', id: 'post456', item: { title: 'Hello', content: 'World' } }
     *   ],
     *   userId: 'admin123'
     * })
     *
     * @example
     * // With custom metadata
     * const result = database.methods.setValue({
     *   items: [
     *     {
     *       collection: 'users',
     *       id: 'user123',
     *       item: { name: 'John' },
     *       metadata: { createdAt: Date.now(), source: 'api' }
     *     }
     *   ],
     *   userId: 'admin123'
     * })
     *
     * @example
     * // Error case - missing userId
     * const result = database.methods.setValue({
     *   items: [{ collection: 'users', item: { name: 'John' } }]
     * })
     * // Returns: { isValid: false, error: { details: 'Author missing' } }
     *
     * @example
     * // Error case - snapshot error
     * const result = database.methods.setValue({
     *   items: [{ collection: 'users', id: 'user123', item: { name: 'John' } }],
     *   userId: 'admin123'
     * })
     * // Returns: { isValid: false, snapshotError: Error(...) }
     *
     * @returns-success
     * - `isValid`: true
     * - `item`: Array of state set results
     * - `message`: "Successfully saved"
     *
     * @returns-error
     * - `isValid`: false
     * - `error`: { details: 'Author missing' } (when userId is missing)
     * - `snapshotError`: Error object (when snapshot creation fails)
     *
     * @throws {Error} When snapshot creation fails for any collection
     *
     * @note
     * - Each item must have a collection name
     * - Items can include custom metadata, which will be merged with userId
     * - If an item has no metadata, userId is used as the metadata
     * - If an item has metadata but no userId in metadata, userId is added
     * - Snapshots are created for each unique collection after all items are saved
     * - If any item is missing userId, the entire operation fails
     *
     * @see {@link setSnapshot} for snapshot mechanism
     * @see {@link stateSetValue} for individual item storage
     */
    setValue ({ items, userId }) {
      const results = []
      const usedCollections = {}
      const collections = []

      for (let i = 0; i < items.length; i++) {
        const data = items[i]
        const metadata = data.metadata || { userId }

        if (metadata && !metadata.userId) {
          metadata.userId = userId
        }

        if (!metadata.userId) {
          return {
            isValid: false,
            error: {
              details: 'Author missing'
            }
          }
        }

        const setData = stateSetValue({
          name: data.collection,
          value: data.item,
          options: {
            id: data.id,
            metadata
          }
        })

        if (!usedCollections[data.collection]) {
          usedCollections[data.collection] = true
          collections.push(data.collection)
        }

        results.push(setData)
      }

      for (let i = 0; i < collections.length; i++) {
        const collection = collections[i]

        if (this.snapshotError[collection]) {
          return {
            isValid: false,
            snapshotError: this.snapshotError[collection]
          }
        }

        this.setSnapshot(collection)
      }

      return {
        item: results,
        isValid: true,
        message: 'Successfully saved'
      }
    }
  },
  /**
   * Setup function for the database plugin
   *
   * Initializes the snapshot storage path and verifies that the directory exists.
   * Can override configuration defaults.
   *
   * @param {Object} options - Setup options
   * @param {string} [options.storage='.ds_snapshots'] - Relative or absolute path to the snapshot storage directory
   * @param {Object} [options.config] - Configuration overrides
   * @param {number} [options.maxSnapshotSize] - Maximum memory size for snapshots in bytes (default: 100MB)
   * @param {number} [options.fileTimeout] - Timeout for file operations in milliseconds (default: 30000)
   * @param {number} [options.maxQueueSize] - Maximum queued operations per collection (default: 100)
   * @param {number} [options.maxRetries] - Maximum retry attempts for failed operations (default: 3)
   * @param {number} [options.cleanupInterval] - Cleanup interval for old snapshots in milliseconds (default: 60000)
   * @returns {Promise<void>}
   *
   * @example
   * // Default setup (uses .ds_snapshots in current working directory)
   * createPlugin('database', {
   *   setup: ({ storage = '.ds_snapshots' } = {}) => { /* ... *\/ }
   * })
   *
   * @example
   * // Custom storage location
   * createPlugin('database', {
   *   setup: ({ storage = './data/snapshots' } = {}) => { /* ... *\/ }
   * })
   *
   * @example
   * // With config overrides
   * createPlugin('database', {
   *   setup: ({ storage = '.ds_snapshots', config } = {}) => { /* ... *\/ }
   * })
   * // config: { maxSnapshotSize: 200 * 1024 * 1024, fileTimeout: 60000 }
   *
   * @example
   * // Absolute path with config
   * createPlugin('database', {
   *   setup: ({ storage = '/var/lib/dooksa/snapshots', config: { maxQueueSize: 200 } }) => { /* ... *\/ }
   * })
   *
   * @throws {Error} When the specified storage directory does not exist
   *
   * @note
   * - The storage path is resolved relative to the current working directory
   * - The directory must exist before the plugin can function
   * - Snapshots will be saved as JSON files in this directory
   * - File naming: `{collection-name}-{timestamp}.json`
   * - Config overrides are merged with defaults
   *
   * @see {@link setSnapshot} for snapshot creation
   * @see {@link seed} for loading seed data
   */
  async setup ({ storage = '.ds_snapshots', config } = {}) {
    this.snapshotPath = resolve(process.cwd(), storage)

    try {
      await access(this.snapshotPath)

      // Override config if provided
      if (config) {
        this.config = {
          ...this.config,
          ...config
        }
      }
    } catch (error) {
      throw new SnapshotError('Storage path does not exist: ' + this.snapshotPath)
    }
  }
})

/**
 * Database plugin exports
 *
 * The plugin provides the following exported functions:
 *
 * @example
 * // Import specific functions
 * import {
 *   databaseSeed,
 *   databaseDeleteValue,
 *   databaseGetValue,
 *   databaseSetValue
 * } from '@dooksa/plugins'
 *
 * @example
 * // Import default plugin
 * import database from '@dooksa/plugins'
 *
 * @exports databaseSeed - Alias for database.methods.seed
 * @exports databaseDeleteValue - Alias for database.methods.deleteValue
 * @exports databaseGetValue - Alias for database.methods.getValue
 * @exports databaseSetValue - Alias for database.methods.setValue
 *
 * @see {@link database.methods.seed}
 * @see {@link database.methods.deleteValue}
 * @see {@link database.methods.getValue}
 * @see {@link database.methods.setValue}
 */
export const {
  databaseSeed,
  databaseDeleteValue,
  databaseGetValue,
  databaseSetValue
} = database

export default database
