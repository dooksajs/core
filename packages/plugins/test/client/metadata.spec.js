import { describe, it } from 'node:test'
import { strictEqual, deepStrictEqual, ok } from 'node:assert/strict'
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

    it('should use custom default language when provided', async function (t) {
      const restoreWindow = mockWindowLocationSearch(t, '?lang=fr')
      const mock = await mockPlugin(t, { name: 'metadata' })

      mock.plugin.setup({
        defaultLanguage: 'fr',
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

      strictEqual(defaultLanguage.item, 'fr')
      strictEqual(currentLanguage.item, '') // Should be empty since lang=fr equals default
      deepStrictEqual(languages.item, ['en', 'fr'])

      restoreWindow()
      mock.restore()
    })

    it('should ignore URL language when it equals default language', async function (t) {
      const restoreWindow = mockWindowLocationSearch(t, '?lang=en')
      const mock = await mockPlugin(t, { name: 'metadata' })

      mock.plugin.setup({
        languages: ['en', 'fr']
      })

      const currentLanguage = mock.stateGetValue({
        name: 'metadata/currentLanguage'
      })

      strictEqual(currentLanguage.item, '')

      restoreWindow()
      mock.restore()
    })

    it('should ignore URL language when not in available languages', async function (t) {
      const restoreWindow = mockWindowLocationSearch(t, '?lang=de')
      const mock = await mockPlugin(t, { name: 'metadata' })

      mock.plugin.setup({
        languages: ['en', 'fr']
      })

      const currentLanguage = mock.stateGetValue({
        name: 'metadata/currentLanguage'
      })

      strictEqual(currentLanguage.item, '')

      restoreWindow()
      mock.restore()
    })

    it('should handle empty languages array', async function (t) {
      const restoreWindow = mockWindowLocationSearch(t)
      const mock = await mockPlugin(t, { name: 'metadata' })

      mock.plugin.setup({
        languages: []
      })

      const languages = mock.stateGetValue({
        name: 'metadata/languages'
      })

      deepStrictEqual(languages.item, [])

      restoreWindow()
      mock.restore()
    })

    it('should preserve existing state values when no options provided', async function (t) {
      const restoreWindow = mockWindowLocationSearch(t)
      const mock = await mockPlugin(t, { name: 'metadata' })

      // Set initial state
      mock.stateSetValue({
        name: 'metadata/languages',
        value: ['es', 'de']
      })
      mock.stateSetValue({
        name: 'metadata/defaultLanguage',
        value: 'es'
      })

      // Setup without options
      mock.plugin.setup()

      const languages = mock.stateGetValue({
        name: 'metadata/languages'
      })
      const defaultLanguage = mock.stateGetValue({
        name: 'metadata/defaultLanguage'
      })

      deepStrictEqual(languages.item, ['es', 'de'])
      strictEqual(defaultLanguage.item, 'es')

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

    it('should revert to empty string when previous value is undefined', async function (t) {
      const restoreWindow = mockWindowLocationSearch(t)
      const mock = await mockPlugin(t, { name: 'metadata' })

      mock.plugin.setup({
        languages: ['en', 'fr']
      })

      // Set to invalid language from empty state
      mock.stateSetValue({
        name: 'metadata/currentLanguage',
        value: 'de'
      })

      const currentLanguage = mock.stateGetValue({
        name: 'metadata/currentLanguage'
      })

      strictEqual(currentLanguage.item, '')

      restoreWindow()
      mock.restore()
    })

    it('should allow changing to any valid language', async function (t) {
      const restoreWindow = mockWindowLocationSearch(t)
      const mock = await mockPlugin(t, { name: 'metadata' })

      mock.plugin.setup({
        languages: ['en', 'fr', 'es', 'de']
      })

      // Test each language
      const languages = ['fr', 'es', 'de']

      for (const lang of languages) {
        mock.stateSetValue({
          name: 'metadata/currentLanguage',
          value: lang
        })

        const currentLanguage = mock.stateGetValue({
          name: 'metadata/currentLanguage'
        })

        strictEqual(currentLanguage.item, lang, `Should set language to ${lang}`)
      }

      restoreWindow()
      mock.restore()
    })
  })

  describe('State Schema', function () {
    it('should have correct schema for currentLanguage', async function (t) {
      const restoreWindow = mockWindowLocationSearch(t)
      const mock = await mockPlugin(t, { name: 'metadata' })

      const schema = mock.stateGetSchema('metadata/currentLanguage')

      strictEqual(schema.type, 'string')

      restoreWindow()
      mock.restore()
    })

    it('should have correct schema for defaultLanguage', async function (t) {
      const restoreWindow = mockWindowLocationSearch(t)
      const mock = await mockPlugin(t, { name: 'metadata' })

      const schema = mock.stateGetSchema('metadata/defaultLanguage')

      strictEqual(schema.type, 'string')

      restoreWindow()
      mock.restore()
    })

    it('should have correct schema for languages', async function (t) {
      const restoreWindow = mockWindowLocationSearch(t)
      const mock = await mockPlugin(t, { name: 'metadata' })

      const schema = mock.stateGetSchema('metadata/languages')

      strictEqual(schema.type, 'array')

      restoreWindow()
      mock.restore()
    })

    it('should have correct schema for plugins collection', async function (t) {
      const restoreWindow = mockWindowLocationSearch(t)
      const mock = await mockPlugin(t, { name: 'metadata' })

      const schema = mock.stateGetSchema('metadata/plugins')

      strictEqual(schema.type, 'collection')

      restoreWindow()
      mock.restore()
    })

    it('should have correct schema for actions collection', async function (t) {
      const restoreWindow = mockWindowLocationSearch(t)
      const mock = await mockPlugin(t, { name: 'metadata' })

      const schema = mock.stateGetSchema('metadata/actions')

      strictEqual(schema.type, 'collection')

      restoreWindow()
      mock.restore()
    })

    it('should have correct schema for parameters collection', async function (t) {
      const restoreWindow = mockWindowLocationSearch(t)
      const mock = await mockPlugin(t, { name: 'metadata' })

      const schema = mock.stateGetSchema('metadata/parameters')

      strictEqual(schema.type, 'collection')

      restoreWindow()
      mock.restore()
    })
  })

  describe('State Operations', function () {
    it('should allow adding plugin metadata', async function (t) {
      const restoreWindow = mockWindowLocationSearch(t)
      const mock = await mockPlugin(t, { name: 'metadata' })

      mock.plugin.setup()

      // Add plugin metadata
      mock.stateSetValue({
        name: 'metadata/plugins',
        value: {
          title: 'Test Plugin',
          description: 'A test plugin',
          icon: 'test:icon'
        },
        options: {
          id: 'test-plugin'
        }
      })

      const plugins = mock.stateGetValue({
        name: 'metadata/plugins'
      })

      // Find the plugin by ID in the array
      const plugin = plugins.item.find(p => p.id === 'test-plugin')
      strictEqual(plugin.item.title, 'Test Plugin')
      strictEqual(plugin.item.description, 'A test plugin')
      strictEqual(plugin.item.icon, 'test:icon')

      restoreWindow()
      mock.restore()
    })

    it('should allow adding action metadata', async function (t) {
      const restoreWindow = mockWindowLocationSearch(t)
      const mock = await mockPlugin(t, { name: 'metadata' })

      mock.plugin.setup()

      // First add a plugin
      mock.stateSetValue({
        name: 'metadata/plugins',
        value: {
          title: 'Test Plugin',
          description: 'A test plugin',
          icon: 'test:icon'
        },
        options: {
          id: 'test-plugin'
        }
      })

      // Then add an action
      mock.stateSetValue({
        name: 'metadata/actions',
        value: {
          plugin: 'test-plugin',
          method: 'testMethod',
          title: 'Test Action',
          description: 'A test action',
          icon: 'action:icon',
          component: 'TestComponent'
        },
        options: {
          id: 'test-action'
        }
      })

      const actions = mock.stateGetValue({
        name: 'metadata/actions'
      })

      // Find the action by ID in the array
      const action = actions.item.find(a => a.id === 'test-action')
      strictEqual(action.item.plugin, 'test-plugin')
      strictEqual(action.item.method, 'testMethod')
      strictEqual(action.item.title, 'Test Action')
      strictEqual(action.item.description, 'A test action')
      strictEqual(action.item.icon, 'action:icon')
      strictEqual(action.item.component, 'TestComponent')

      restoreWindow()
      mock.restore()
    })

    it('should allow adding parameter metadata', async function (t) {
      const restoreWindow = mockWindowLocationSearch(t)
      const mock = await mockPlugin(t, { name: 'metadata' })

      mock.plugin.setup()

      // Add parameter metadata
      mock.stateSetValue({
        name: 'metadata/parameters',
        value: {
          type: 'string',
          required: true,
          default: 'test'
        },
        options: {
          id: 'test-param'
        }
      })

      const parameters = mock.stateGetValue({
        name: 'metadata/parameters'
      })

      // Find the parameter by ID in the array
      const parameter = parameters.item.find(p => p.id === 'test-param')
      strictEqual(parameter.item.type, 'string')
      strictEqual(parameter.item.required, true)
      strictEqual(parameter.item.default, 'test')

      restoreWindow()
      mock.restore()
    })

    it('should handle multiple plugins in collection', async function (t) {
      const restoreWindow = mockWindowLocationSearch(t)
      const mock = await mockPlugin(t, { name: 'metadata' })

      mock.plugin.setup()

      // Add multiple plugins
      mock.stateSetValue({
        name: 'metadata/plugins',
        value: {
          title: 'Plugin 1',
          description: 'First plugin',
          icon: 'icon1'
        },
        options: {
          id: 'plugin-1'
        }
      })

      mock.stateSetValue({
        name: 'metadata/plugins',
        value: {
          title: 'Plugin 2',
          description: 'Second plugin',
          icon: 'icon2'
        },
        options: {
          id: 'plugin-2'
        }
      })

      const plugins = mock.stateGetValue({
        name: 'metadata/plugins'
      })

      // Check that we have at least the two plugins we added
      const plugin1 = plugins.item.find(p => p.id === 'plugin-1')
      const plugin2 = plugins.item.find(p => p.id === 'plugin-2')

      ok(plugin1)
      ok(plugin2)
      strictEqual(plugin1.item.title, 'Plugin 1')
      strictEqual(plugin2.item.title, 'Plugin 2')

      restoreWindow()
      mock.restore()
    })
  })

  describe('State Listener Behavior', function () {
    it('should prevent setting language to default via state listener', async function (t) {
      const restoreWindow = mockWindowLocationSearch(t)
      const mock = await mockPlugin(t, { name: 'metadata' })

      mock.plugin.setup({
        languages: ['en', 'fr']
      })

      // Set a valid language first
      mock.stateSetValue({
        name: 'metadata/currentLanguage',
        value: 'fr'
      })

      // Try to set to default language
      mock.stateSetValue({
        name: 'metadata/currentLanguage',
        value: 'en'
      })

      const currentLanguage = mock.stateGetValue({
        name: 'metadata/currentLanguage'
      })

      // Should revert to previous value (fr) or empty
      ok(currentLanguage.item === 'fr' || currentLanguage.item === '')

      restoreWindow()
      mock.restore()
    })

    it('should prevent setting invalid language via state listener', async function (t) {
      const restoreWindow = mockWindowLocationSearch(t)
      const mock = await mockPlugin(t, { name: 'metadata' })

      mock.plugin.setup({
        languages: ['en', 'fr']
      })

      // Set a valid language first
      mock.stateSetValue({
        name: 'metadata/currentLanguage',
        value: 'fr'
      })

      // Try to set to invalid language
      mock.stateSetValue({
        name: 'metadata/currentLanguage',
        value: 'de'
      })

      const currentLanguage = mock.stateGetValue({
        name: 'metadata/currentLanguage'
      })

      // Should revert to previous value (fr) or empty
      ok(currentLanguage.item === 'fr' || currentLanguage.item === '')

      restoreWindow()
      mock.restore()
    })

    it('should handle listener with previous value fallback', async function (t) {
      const restoreWindow = mockWindowLocationSearch(t)
      const mock = await mockPlugin(t, { name: 'metadata' })

      mock.plugin.setup({
        languages: ['en', 'fr']
      })

      // Set initial language
      mock.stateSetValue({
        name: 'metadata/currentLanguage',
        value: 'fr'
      })

      // Set to invalid language (listener should revert)
      mock.stateSetValue({
        name: 'metadata/currentLanguage',
        value: 'de'
      })

      const currentLanguage = mock.stateGetValue({
        name: 'metadata/currentLanguage'
      })

      // Should have reverted to 'fr' or empty
      ok(currentLanguage.item === 'fr' || currentLanguage.item === '')

      restoreWindow()
      mock.restore()
    })

    it('should handle listener when no previous value exists', async function (t) {
      const restoreWindow = mockWindowLocationSearch(t)
      const mock = await mockPlugin(t, { name: 'metadata' })

      mock.plugin.setup({
        languages: ['en', 'fr']
      })

      // Set to invalid language without previous value
      mock.stateSetValue({
        name: 'metadata/currentLanguage',
        value: 'de'
      })

      const currentLanguage = mock.stateGetValue({
        name: 'metadata/currentLanguage'
      })

      // Should revert to empty string
      strictEqual(currentLanguage.item, '')

      restoreWindow()
      mock.restore()
    })
  })

  describe('Edge Cases', function () {
    it('should handle setup with only defaultLanguage option', async function (t) {
      const restoreWindow = mockWindowLocationSearch(t, '?lang=fr')
      const mock = await mockPlugin(t, { name: 'metadata' })

      mock.plugin.setup({
        defaultLanguage: 'fr'
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

      strictEqual(defaultLanguage.item, 'fr')
      strictEqual(currentLanguage.item, '') // Should be empty since lang=fr equals default
      deepStrictEqual(languages.item, ['en']) // Should keep default

      restoreWindow()
      mock.restore()
    })

    it('should handle setup with only languages option', async function (t) {
      const restoreWindow = mockWindowLocationSearch(t, '?lang=es')
      const mock = await mockPlugin(t, { name: 'metadata' })

      mock.plugin.setup({
        languages: ['en', 'fr', 'es']
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

      strictEqual(defaultLanguage.item, 'en') // Should keep default
      strictEqual(currentLanguage.item, 'es') // Should set from URL
      deepStrictEqual(languages.item, ['en', 'fr', 'es'])

      restoreWindow()
      mock.restore()
    })

    it('should handle URL with no lang parameter', async function (t) {
      const restoreWindow = mockWindowLocationSearch(t, '?other=param')
      const mock = await mockPlugin(t, { name: 'metadata' })

      mock.plugin.setup({
        languages: ['en', 'fr']
      })

      const currentLanguage = mock.stateGetValue({
        name: 'metadata/currentLanguage'
      })

      strictEqual(currentLanguage.item, '')

      restoreWindow()
      mock.restore()
    })

    it('should handle empty URL search string', async function (t) {
      const restoreWindow = mockWindowLocationSearch(t, '')
      const mock = await mockPlugin(t, { name: 'metadata' })

      mock.plugin.setup({
        languages: ['en', 'fr']
      })

      const currentLanguage = mock.stateGetValue({
        name: 'metadata/currentLanguage'
      })

      strictEqual(currentLanguage.item, '')

      restoreWindow()
      mock.restore()
    })

    it('should handle special characters in language codes', async function (t) {
      const restoreWindow = mockWindowLocationSearch(t, '?lang=pt-BR')
      const mock = await mockPlugin(t, { name: 'metadata' })

      mock.plugin.setup({
        languages: ['en', 'pt-BR', 'zh-CN']
      })

      const currentLanguage = mock.stateGetValue({
        name: 'metadata/currentLanguage'
      })

      strictEqual(currentLanguage.item, 'pt-BR')

      restoreWindow()
      mock.restore()
    })

    it('should handle case sensitivity in language codes', async function (t) {
      const restoreWindow = mockWindowLocationSearch(t, '?lang=FR')
      const mock = await mockPlugin(t, { name: 'metadata' })

      mock.plugin.setup({
        languages: ['en', 'fr']
      })

      const currentLanguage = mock.stateGetValue({
        name: 'metadata/currentLanguage'
      })

      // Should not match since 'FR' !== 'fr'
      strictEqual(currentLanguage.item, '')

      restoreWindow()
      mock.restore()
    })

    it('should handle repeated setup calls', async function (t) {
      const restoreWindow = mockWindowLocationSearch(t, '?lang=fr')
      const mock = await mockPlugin(t, { name: 'metadata' })

      // First setup
      mock.plugin.setup({
        languages: ['en', 'fr']
      })

      let currentLanguage = mock.stateGetValue({
        name: 'metadata/currentLanguage'
      })
      strictEqual(currentLanguage.item, 'fr')

      // Second setup with different options
      mock.plugin.setup({
        languages: ['en', 'fr', 'es'],
        defaultLanguage: 'fr'
      })

      currentLanguage = mock.stateGetValue({
        name: 'metadata/currentLanguage'
      })
      const languages = mock.stateGetValue({
        name: 'metadata/languages'
      })
      const defaultLanguage = mock.stateGetValue({
        name: 'metadata/defaultLanguage'
      })

      // Should update to new configuration
      strictEqual(currentLanguage.item, '') // fr equals new default
      deepStrictEqual(languages.item, ['en', 'fr', 'es'])
      strictEqual(defaultLanguage.item, 'fr')

      restoreWindow()
      mock.restore()
    })

    it('should handle very long language arrays', async function (t) {
      const restoreWindow = mockWindowLocationSearch(t)
      const mock = await mockPlugin(t, { name: 'metadata' })

      const manyLanguages = Array.from({ length: 50 }, (_, i) => `lang${i}`)

      mock.plugin.setup({
        languages: manyLanguages
      })

      const languages = mock.stateGetValue({
        name: 'metadata/languages'
      })

      strictEqual(languages.item.length, 50)
      strictEqual(languages.item[49], 'lang49')

      restoreWindow()
      mock.restore()
    })

    it('should handle Unicode characters in language codes', async function (t) {
      const restoreWindow = mockWindowLocationSearch(t, '?lang=日本語')
      const mock = await mockPlugin(t, { name: 'metadata' })

      mock.plugin.setup({
        languages: ['en', '日本語']
      })

      const currentLanguage = mock.stateGetValue({
        name: 'metadata/currentLanguage'
      })

      strictEqual(currentLanguage.item, '日本語')

      restoreWindow()
      mock.restore()
    })
  })
})
