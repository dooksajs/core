import { Worker } from 'worker_threads'
import path from 'path'
import { fileURLToPath } from 'url'

/**
 * @typedef {Object} TestServer
 * @property {Worker} worker - The underlying worker thread managing the test server
 * @property {string|null} baseUrl - The base URL of the started server (null until started)
 * @property {Array<Object>} startPromises - Queue of pending start operation promises
 * @property {Array<Object>} restorePromises - Queue of pending restore operation promises
 * @property {Function|null} messageHandler - Reference to the worker message handler
 * @property {Function} start - Starts the test server with provided configuration
 * @property {Function} stop - Stops the test server and terminates the worker
 * @property {Function} restore - Restores the test server to initial state
 * @property {Function} setupMessageHandlers - Sets up message handling for the worker
 * @property {Function} handleWorkerError - Handles errors from the worker process
 * @property {Function} rejectPromise - Removes and rejects a specific promise
 * @property {Function} cleanupPromises - Clears all pending promises
 */

/**
 * Creates a test server instance that manages a worker process for testing purposes
 * @param {number} [timeout=3000] - Callback timeout
 * @returns {TestServer} A test server object with start, stop, and restore functionality
 */
export default function createTestServer (timeout=3000) {
  const __dirname = path.dirname(fileURLToPath(import.meta.url))

  return {
    worker: new Worker(path.resolve(__dirname, './server-worker.js')),
    baseUrl: null,

    /** @type {Array<{resolve: Function, reject: Function}>} */
    startPromises: [],

    /** @type {Array<{resolve: Function, reject: Function}>} */
    restorePromises: [],

    /** @type {Function|null} */
    messageHandler: null,

    /**
     * Starts the test server with the provided configuration
     * @param {Object} config - Server configuration options
     * @param {Array} [config.routes=[]] - Array of route definitions to register
     * @param {Array} [config.data=[]] - Array of data fixtures to load
     * @param {Array} [config.plugins=[]] - Array of plugins to initialize
     * @returns {Promise<string>} Resolves with the server base URL when ready
     * @throws {Error} If the server fails to start or times out after 10 seconds
     */
    async start ({ routes = [], data = [], plugins = [] } = {}) {
      return new Promise((resolve, reject) => {
        // Add this promise to the queue
        this.startPromises.push({
          resolve,
          reject
        })

        // Set up message handler only once
        if (!this.messageHandler) {
          this.setupMessageHandlers()
        }

        plugins = plugins.map(plugin => plugin.createObservableInstance())

        this.worker.postMessage({
          status: 'start',
          routes,
          data,
          plugins
        })

        // Add timeout to prevent indefinite hanging
        setTimeout(() => {
          if (this.startPromises.some(p => p.resolve === resolve)) {
            this.rejectPromise(this.startPromises, resolve,
              new Error('Start operation timed out'))
          }
        }, timeout)
      })
    },

    /**
     * Stops the test server and terminates the worker process
     * @returns {Promise<void>} Resolves when the worker has been terminated
     */
    async stop () {
      this.worker.postMessage({ status: 'shutdown' })
      await this.worker.terminate()

      // Clean up any remaining promises
      this.cleanupPromises()
    },

    /**
     * Restores the test server to its initial state
     * @returns {Promise<void>} Resolves when the server has been restored
     * @throws {Error} If the restore operation fails or times out after 5 seconds
     */
    restore () {
      return new Promise((resolve, reject) => {
        this.restorePromises.push({
          resolve,
          reject
        })

        if (!this.messageHandler) {
          this.setupMessageHandlers()
        }

        this.worker.postMessage({ status: 'restore' })

        setTimeout(() => {
          if (this.restorePromises.some(p => p.resolve === resolve)) {
            this.rejectPromise(this.restorePromises, resolve,
              new Error('Restore operation timed out'))
          }
        }, timeout) // 5 second timeout
      })
    },

    /**
     * Sets up event listeners for the worker process to handle messages, errors, and exit events
     * This method ensures only one set of handlers is registered regardless of how many
     * operations are pending
     */
    setupMessageHandlers () {
      this.messageHandler = (msg) => {
        if (msg.status === 'ready' && this.startPromises.length > 0) {
          this.baseUrl = `http://localhost:${msg.port}`

          // Resolve all pending start promises
          while (this.startPromises.length > 0) {
            const { resolve } = this.startPromises.shift()
            resolve(this.baseUrl)
          }
        }

        if (msg.status === 'restored' && this.restorePromises.length > 0) {
          // Resolve all pending restore promises
          while (this.restorePromises.length > 0) {
            const { resolve } = this.restorePromises.shift()
            resolve()
          }
        }
      }

      this.worker.on('message', this.messageHandler)
      this.worker.on('error', (error) => {
        this.handleWorkerError(error)
      })
      this.worker.on('exit', (code) => {
        if (code !== 0) {
          this.handleWorkerError(new Error(`Worker stopped with exit code ${code}`))
        }
      })
    },

    /**
     * Handles errors from the worker process by rejecting all pending promises
     * @param {Error} error - The error that occurred in the worker
     */
    handleWorkerError (error) {
      // Reject all pending promises when worker encounters an error
      this.startPromises.forEach(({ reject }) => reject(error))
      this.startPromises = []

      this.restorePromises.forEach(({ reject }) => reject(error))
      this.restorePromises = []
    },

    /**
     * Removes and rejects a specific promise from the given array
     * @param {Array<{resolve: Function, reject: Function}>} promiseArray - Array to search in
     * @param {Function} targetResolve - The resolve function of the promise to remove
     * @param {Error} error - The error to reject the promise with
     */
    rejectPromise (promiseArray, targetResolve, error) {
      const index = promiseArray.findIndex(p => p.resolve === targetResolve)

      if (index !== -1) {
        const { reject } = promiseArray.splice(index, 1)[0]
        reject(error)
      }
    },

    /**
     * Clears all pending promises when the worker terminates
     * This prevents memory leaks and ensures no dangling promises remain
     */
    cleanupPromises () {
      this.startPromises = []
      this.restorePromises = []
    }
  }
}
