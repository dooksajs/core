import { describe, it } from 'node:test'
import { strictEqual, deepStrictEqual } from 'node:assert/strict'
import { mockWindowLocationSearch, mockPlugin } from '#mock'

describe('Metadata', function () {
  describe('Setup', function () {
    it('should successfully set default languages', async function (t) {
      const restoreWindow = mockWindowLocationSearch(t)
      const mock = await mockPlugin(t, { name: 'metadata' })

      // set up metadata
      mock.plugin.setup()

      // get metadata default values
      const defaultLanguage = mock.stateGetValue({
        name: 'metadata/defaultLanguage'
      })
      const currentLanguage = mock.stateGetValue({
        name: 'metadata/currentLanguage'
      })
      const languages = mock.stateGetValue({
        name: 'metadata/languages'
      })

      strictEqual(defaultLanguage.item, 'en')
      strictEqual(currentLanguage.item, '')
      deepStrictEqual(languages.item, ['en'])

      restoreWindow()
      mock.restore()
    })

    it('should successfully set current language', async function (t) {
      // set current language to fr
      const restoreWindow = mockWindowLocationSearch(t, '?lang=fr')
      const mock = await mockPlugin(t, { name: 'metadata' })

      mock.plugin.setup({
        languages: ['en', 'fr']
      })

      const defaultLanguage = mock.stateGetValue({
        name: 'metadata/defaultLanguage'
      })
      const currentLanguage = mock.stateGetValue({
        name: 'metadata/currentLanguage'
      })
      const languages = mock.stateGetValue({
        name: 'metadata/languages'
      })

      strictEqual(defaultLanguage.item, 'en')
      strictEqual(currentLanguage.item, 'fr')
      deepStrictEqual(languages.item, ['en', 'fr'])

      restoreWindow()
      mock.restore()
    })
  })

  describe('Change language', function () {
    it('should successfully change current language', async function (t) {
      const restoreWindow = mockWindowLocationSearch(t, '')
      const mock = await mockPlugin(t, { name: 'metadata' })

      mock.plugin.setup({
        languages: ['en', 'fr']
      })

      // change current language
      mock.stateSetValue({
        name: 'metadata/currentLanguage',
        value: 'fr'
      })

      const defaultLanguage = mock.stateGetValue({
        name: 'metadata/defaultLanguage'
      })
      const currentLanguage = mock.stateGetValue({
        name: 'metadata/currentLanguage'
      })
      const languages = mock.stateGetValue({
        name: 'metadata/languages'
      })

      strictEqual(defaultLanguage.item, 'en')
      strictEqual(currentLanguage.item, 'fr')
      deepStrictEqual(languages.item, ['en', 'fr'])

      restoreWindow()
      mock.restore()
    })

    it('should revert language if language does not exist', async function (t) {
      const restoreWindow = mockWindowLocationSearch(t, '?lang=fr')
      const mock = await mockPlugin(t, { name: 'metadata' })

      mock.plugin.setup({
        languages: ['en', 'fr']
      })

      // change language
      mock.stateSetValue({
        name: 'metadata/currentLanguage',
        value: 'de'
      })

      const defaultLanguage = mock.stateGetValue({
        name: 'metadata/defaultLanguage'
      })
      const currentLanguage = mock.stateGetValue({
        name: 'metadata/currentLanguage'
      })
      const languages = mock.stateGetValue({
        name: 'metadata/languages'
      })

      strictEqual(defaultLanguage.item, 'en')
      strictEqual(currentLanguage.item, '')
      deepStrictEqual(languages.item, ['en', 'fr'])

      restoreWindow()
      mock.restore()
    })

    it('should not set language is the same as the default', async function (t) {
      const restoreWindow = mockWindowLocationSearch(t)
      const mock = await mockPlugin(t, { name: 'metadata' })

      mock.plugin.setup({
        languages: ['en', 'fr']
      })

      // change language
      mock.stateSetValue({
        name: 'metadata/currentLanguage',
        value: 'en'
      })

      const defaultLanguage = mock.stateGetValue({
        name: 'metadata/defaultLanguage'
      })
      const currentLanguage = mock.stateGetValue({
        name: 'metadata/currentLanguage'
      })
      const languages = mock.stateGetValue({
        name: 'metadata/languages'
      })

      strictEqual(defaultLanguage.item, 'en')
      strictEqual(currentLanguage.item, '')
      deepStrictEqual(languages.item, ['en', 'fr'])

      restoreWindow()
      mock.restore()
    })
  })
})
