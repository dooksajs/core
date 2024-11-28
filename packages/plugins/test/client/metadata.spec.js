import { describe, it } from 'node:test'
import { deepStrictEqual, strictEqual } from 'node:assert'
import { mockWindowLocationSearch } from '#mock'

let importCacheQuery = 0

describe('Metadata', function () {
  describe('Setup', function () {
    it('should successfully set default languages', async function (t) {
      const restoreWindow = mockWindowLocationSearch()
      const database = {}

      // mock data plugin exports
      const dataMock = t.mock.module('#client', {
        namedExports: {
          dataSetValue ({ name, value }) {
            database[name] = value
          },
          dataAddListener () {
            return
          },
          dataGetValue () {
            return
          }
        }
      })

      const { metadata } = await import('../../src/client/metadata.js?' + importCacheQuery++)

      metadata.setup()

      strictEqual(database['metadata/defaultLanguage'], 'en')
      strictEqual(database['metadata/currentLanguage'], '')
      deepStrictEqual(database['metadata/languages'], ['en'])

      restoreWindow()
      dataMock.restore()
    })

    it('should successfully set current language', async function (t) {
      const restoreWindow = mockWindowLocationSearch('?lang=fr')
      const database = {}

      // mock data plugin exports
      const dataMock = t.mock.module('#client', {
        namedExports: {
          dataSetValue ({ name, value }) {
            database[name] = value
          },
          dataAddListener () {
            return
          },
          dataGetValue () {
            return
          }
        }
      })

      const { metadata } = await import('../../src/client/metadata.js?' + importCacheQuery++)

      metadata.setup({
        languages: ['en', 'fr']
      })

      strictEqual(database['metadata/defaultLanguage'], 'en')
      strictEqual(database['metadata/currentLanguage'], 'fr')
      deepStrictEqual(database['metadata/languages'], ['en', 'fr'])

      restoreWindow()
      dataMock.restore()
    })
  })

  describe('Change language', function () {
    /**
     * @typedef {Object} DatabaseListeners
     * @property {Object.<string, Function[]>} update
     * @property {Object.<string, Function[]>} delete
     */

    /**
     * Mock set database value
     * @param {Object} database
     * @param {DatabaseListeners} databaseListeners
     */
    function dataSetValue (database, databaseListeners) {
      /**
       * @param {Object} param
       * @param {string} param.name
       * @param {*} param.value
       * @param {Object} [param.options]
       */
      return function ({
        name,
        value,
        options
      }) {
        // store previous data
        const previous = database[name]
        // update data
        database[name] = value

        // stop event listeners
        if (options && options.stopPropagation) {
          return
        }

        // check of data listeners
        const listeners = databaseListeners.update[name]

        if (listeners) {
          for (let i = 0; i < listeners.length; i++) {
            listeners[i]({
              item: value,
              previous
            })
          }
        }
      }
    }

    /**
     * Mock add data listener
     * @param {DatabaseListeners} databaseListeners
     */
    function dataAddListener (databaseListeners) {
      return function ({
        name,
        on,
        handler
      }) {
        if (typeof handler !== 'function') {
          throw new Error('DooksaError: Expected handler to be a function but found "' + typeof handler + '"')
        }

        if (!databaseListeners[on]) {
          throw new Error('DooksaError: Unexpected data listener on value "' + on + '"')
        }

        // set listener
        if (!databaseListeners[on][name]) {
          databaseListeners[on][name] = [handler]
        } else {
          databaseListeners[on][name].push(handler)
        }
      }
    }

    it('should successfully change current language', async function (t) {
      const restoreWindow = mockWindowLocationSearch('')
      const database = {}
      const databaseListeners = {
        update: {},
        delete: {}
      }
      const mockDataSetValue = dataSetValue(database, databaseListeners)
      // mock data plugin exports
      const dataMock = t.mock.module('#client', {
        namedExports: {
          dataSetValue: mockDataSetValue,
          dataAddListener: dataAddListener(databaseListeners),
          dataGetValue ({ name }) {
            return {
              item: database[name]
            }
          }
        }
      })

      const { metadata } = await import('../../src/client/metadata.js?' + importCacheQuery++)

      metadata.setup({
        languages: ['en', 'fr']
      })

      mockDataSetValue({
        name: 'metadata/currentLanguage',
        value: 'fr'
      })

      strictEqual(database['metadata/defaultLanguage'], 'en')
      strictEqual(database['metadata/currentLanguage'], 'fr')
      deepStrictEqual(database['metadata/languages'], ['en', 'fr'])

      restoreWindow()
      dataMock.restore()
    })

    it('should revert language if language does not exist', async function (t) {
      const restoreWindow = mockWindowLocationSearch('?lang=fr')
      const database = {}
      const databaseListeners = {
        update: {},
        delete: {}
      }
      const mockDataSetValue = dataSetValue(database, databaseListeners)
      // mock data plugin exports
      const dataMock = t.mock.module('#client', {
        namedExports: {
          dataSetValue: mockDataSetValue,
          dataAddListener: dataAddListener(databaseListeners),
          dataGetValue ({ name }) {
            return {
              item: database[name]
            }
          }
        }
      })

      const { metadata } = await import('../../src/client/metadata.js?' + importCacheQuery++)

      metadata.setup({
        languages: ['en', 'fr']
      })

      // change language
      mockDataSetValue({
        name: 'metadata/currentLanguage',
        value: 'de'
      })

      strictEqual(database['metadata/defaultLanguage'], 'en')
      strictEqual(database['metadata/currentLanguage'], 'fr')
      deepStrictEqual(database['metadata/languages'], ['en', 'fr'])

      restoreWindow()
      dataMock.restore()
    })

    it('should not set language is the same as the default', async function (t) {
      const restoreWindow = mockWindowLocationSearch()
      const database = {}
      const databaseListeners = {
        update: {},
        delete: {}
      }
      const mockDataSetValue = dataSetValue(database, databaseListeners)
      // mock data plugin exports
      const dataMock = t.mock.module('#client', {
        namedExports: {
          dataSetValue: mockDataSetValue,
          dataAddListener: dataAddListener(databaseListeners),
          dataGetValue ({ name }) {
            return {
              item: database[name]
            }
          }
        }
      })

      const { metadata } = await import('../../src/client/metadata.js?' + importCacheQuery++)

      metadata.setup({
        languages: ['en', 'fr']
      })

      // change language
      mockDataSetValue({
        name: 'metadata/currentLanguage',
        value: 'en'
      })

      strictEqual(database['metadata/defaultLanguage'], 'en')
      strictEqual(database['metadata/currentLanguage'], '')
      deepStrictEqual(database['metadata/languages'], ['en', 'fr'])

      restoreWindow()
      dataMock.restore()
    })
  })
})
