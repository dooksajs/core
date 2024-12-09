import { describe, it } from 'node:test'
import { deepStrictEqual, strictEqual } from 'node:assert'
import { mockWindowLocationSearch, mockPlugins, mockState } from '#mock'
import { metadata } from '#client'
const { name, state } = metadata

let importCacheQuery = 0

describe('Metadata', function () {
  describe('Setup', function () {
    it('should successfully set default languages', async function (t) {
      const restoreWindow = mockWindowLocationSearch()
      const stateMock = await mockState([{
        name,
        state
      }])

      const pluginMock = mockPlugins(t, {
        stateSetValue: stateMock.methods.stateSetValue,
        stateAddListener () {
        },
        stateGetValue: stateMock.methods.stateGetValue
      })

      const { metadata } = await import('../../src/client/metadata.js?' + importCacheQuery++)

      metadata.setup()

      const defaultLanguage = stateMock.methods.stateGetValue({
        name: 'metadata/defaultLanguage'
      })
      const currentLanguage = stateMock.methods.stateGetValue({
        name: 'metadata/currentLanguage'
      })
      const languages = stateMock.methods.stateGetValue({
        name: 'metadata/languages'
      })

      strictEqual(defaultLanguage.item, 'en')
      strictEqual(currentLanguage.item, '')
      deepStrictEqual(languages.item, ['en'])

      restoreWindow()
      pluginMock.restore()
      stateMock.restore()
    })

    it('should successfully set current language', async function (t) {
      const restoreWindow = mockWindowLocationSearch('?lang=fr')
      const database = {}

      // mock data plugin exports
      const dataMock = t.mock.module('#client', {
        namedExports: {
          stateSetValue ({ name, value }) {
            database[name] = value
          },
          stateAddListener () {
            return
          },
          stateGetValue () {
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
    function stateSetValue (database, databaseListeners) {
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
    function stateAddListener (databaseListeners) {
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
      const mockStateSetValue = stateSetValue(database, databaseListeners)
      // mock data plugin exports
      const dataMock = t.mock.module('#client', {
        namedExports: {
          stateSetValue: mockStateSetValue,
          stateAddListener: stateAddListener(databaseListeners),
          stateGetValue ({ name }) {
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

      mockStateSetValue({
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
      const mockStateSetValue = stateSetValue(database, databaseListeners)
      // mock data plugin exports
      const dataMock = t.mock.module('#client', {
        namedExports: {
          stateSetValue: mockStateSetValue,
          stateAddListener: stateAddListener(databaseListeners),
          stateGetValue ({ name }) {
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
      mockStateSetValue({
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
      const mockStateSetValue = stateSetValue(database, databaseListeners)
      // mock data plugin exports
      const dataMock = t.mock.module('#client', {
        namedExports: {
          stateSetValue: mockStateSetValue,
          stateAddListener: stateAddListener(databaseListeners),
          stateGetValue ({ name }) {
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
      mockStateSetValue({
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
