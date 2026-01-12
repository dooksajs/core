/**
 * Mock database by mocking file operations
 * This approach uses the real database plugin but mocks fs operations
 * @import {TestContext} from 'node:test'
 */

/**
 * Creates a mock database seed by mocking fs operations
 * @param {TestContext} context - Node.js TestContext for creating mocks
 * @param {Array} seedData - Seed data to inject [{ collection, item }]
 * @returns {Object} Mock restore functions
 */
export function mockDatabaseSeed (context, seedData = []) {
  const restoreCallbacks = []
  const filenames = new Set()

  // Create a map of seed data by collection name
  const seedDataMap = new Map()
  for (const data of seedData) {
    const fileName = data.collection.replace(/[A-Z]/g, letter => '-' + letter.toLowerCase()).replace('/', '-')
    seedDataMap.set(fileName, data)
    filenames.add(fileName)
  }

  // Mock access to check if file exists (promise-based)
  const mockAccess = context.mock.fn((path) => {
    // Extract filename from path
    const pathParts = path.split(/[\\/]/)
    const fileNameWithExt = pathParts[pathParts.length - 1]
    const fileName = fileNameWithExt.replace('.json', '')

    // Check if we have seed data for this file
    if (seedDataMap.has(fileName)) {
      return Promise.resolve()
    }

    // File doesn't exist - return ENOENT error
    const error = new Error('ENOENT: no such file or directory')
    const typedError = /** @type {NodeJS.ErrnoException} */ (error)
    typedError.code = 'ENOENT'
    return Promise.reject(typedError)
  })

  // Mock readFile to return our seed data (promise-based)
  const mockReadFile = context.mock.fn((path, encoding) => {
    // Extract filename from path
    const pathParts = path.split(/[\\/]/)
    const fileNameWithExt = pathParts[pathParts.length - 1]
    const fileName = fileNameWithExt.replace('.json', '')

    // Check if we have seed data for this file
    if (seedDataMap.has(fileName)) {
      const data = seedDataMap.get(fileName)
      const json = JSON.stringify({
        collection: data.collection,
        item: data.item,
        createdAt: Date.now()
      })

      return Promise.resolve(json)
    }

    // File doesn't exist - return error
    const error = new Error('ENOENT: no such file or directory')
    const typedError = /** @type {NodeJS.ErrnoException} */ (error)
    typedError.code = 'ENOENT'
    return Promise.reject(typedError)
  })

  // Mock writeFile to prevent actual file I/O
  const mockWriteFile = context.mock.fn(() => {
    // Just resolve successfully without doing anything
    return Promise.resolve()
  })

  // Mock unlink to prevent actual file deletion (used for temp file cleanup)
  const mockUnlink = context.mock.fn(() => {
    // Just resolve successfully without doing anything
    return Promise.resolve()
  })

  // Mock existsSync to return true for our seed files (kept for other database operations)
  const mockExistsSync = context.mock.fn((path) => {
    const pathParts = path.split(/[\\/]/)
    const fileNameWithExt = pathParts[pathParts.length - 1]
    const fileName = fileNameWithExt.replace('.json', '')

    // Return true if we have seed data, otherwise false
    return seedDataMap.has(fileName)
  })

  // Mock rename to prevent actual file operations (kept for other database operations)
  const mockRename = context.mock.fn((oldPath, newPath, callback) => {
    setImmediate(() => callback(null))
  })

  // Create mock contexts for fs operations
  const fsMockContext = context.mock.module('node:fs', {
    namedExports: {
      existsSync: mockExistsSync,
      rename: mockRename
    }
  })
  restoreCallbacks.push(() => fsMockContext.restore())

  // Mock fs/promises
  const fsPromisesMockContext = context.mock.module('fs/promises', {
    namedExports: {
      access: mockAccess,
      readFile: mockReadFile,
      writeFile: mockWriteFile,
      unlink: mockUnlink
    }
  })
  restoreCallbacks.push(() => fsPromisesMockContext.restore())

  return {
    filenames,
    restore: () => {
      // Execute all restore callbacks in reverse order
      for (let i = restoreCallbacks.length - 1; i >= 0; i--) {
        try {
          restoreCallbacks[i]()
        } catch (error) {
          console.warn('Error during database mock restoration:', error)
        }
      }
    }
  }
}
