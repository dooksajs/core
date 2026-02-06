import { describe, it, afterEach } from 'node:test'
import { strictEqual, deepStrictEqual, ok } from 'node:assert/strict'
import { metadata, state } from '#core'
import { mockWindow, mockStateData } from '@dooksa/test'

describe('Metadata', function () {
  afterEach(() => {
    state.restore()
    metadata.restore()
  })

  describe('Setup', function () {
    it('should successfully set default languages', async function (t) {
      const mockWindowInstance = mockWindow(t)
      const stateData = mockStateData([metadata])
      state.setup(stateData)

      // set up metadata
      metadata.setup()

      // get metadata default values
      const defaultLanguage = state.stateGetValue({
        name: 'metadata/defaultLanguage'
      })
      const currentLanguage = state.stateGetValue({
        name: 'metadata/currentLanguage'
      })
      const languages = state.stateGetValue({
        name: 'metadata/languages'
      })

      strictEqual(defaultLanguage.item, 'en')
      strictEqual(currentLanguage.item, '')
      deepStrictEqual(languages.item, ['en'])

      mockWindowInstance.restore()
    })

    it('should successfully set current language', async function (t) {
      // set current language to fr
      const mockWindowInstance = mockWindow(t, { search: '?lang=fr' })
      const stateData = mockStateData([metadata])
      state.setup(stateData)

      metadata.setup({
        languages: ['en', 'fr']
      })

      const defaultLanguage = state.stateGetValue({
        name: 'metadata/defaultLanguage'
      })
      const currentLanguage = state.stateGetValue({
        name: 'metadata/currentLanguage'
      })
      const languages = state.stateGetValue({
        name: 'metadata/languages'
      })

      strictEqual(defaultLanguage.item, 'en')
      strictEqual(currentLanguage.item, 'fr')
      deepStrictEqual(languages.item, ['en', 'fr'])

      mockWindowInstance.restore()
    })

    it('should use custom default language when provided', async function (t) {
      const mockWindowInstance = mockWindow(t, { search: '?lang=fr' })
      const stateData = mockStateData([metadata])
      state.setup(stateData)

      metadata.setup({
        defaultLanguage: 'fr',
        languages: ['en', 'fr']
      })

      const defaultLanguage = state.stateGetValue({
        name: 'metadata/defaultLanguage'
      })
      const currentLanguage = state.stateGetValue({
        name: 'metadata/currentLanguage'
      })
      const languages = state.stateGetValue({
        name: 'metadata/languages'
      })

      strictEqual(defaultLanguage.item, 'fr')
      strictEqual(currentLanguage.item, '') // Should be empty since lang=fr equals default
      deepStrictEqual(languages.item, ['en', 'fr'])

      mockWindowInstance.restore()
    })

    it('should ignore URL language when it equals default language', async function (t) {
      const mockWindowInstance = mockWindow(t, { search: '?lang=en' })
      const stateData = mockStateData([metadata])
      state.setup(stateData)

      metadata.setup({
        languages: ['en', 'fr']
      })

      const currentLanguage = state.stateGetValue({
        name: 'metadata/currentLanguage'
      })

      strictEqual(currentLanguage.item, '')

      mockWindowInstance.restore()
    })

    it('should ignore URL language when not in available languages', async function (t) {
      const mockWindowInstance = mockWindow(t, { search: '?lang=de' })
      const stateData = mockStateData([metadata])
      state.setup(stateData)

      metadata.setup({
        languages: ['en', 'fr']
      })

      const currentLanguage = state.stateGetValue({
        name: 'metadata/currentLanguage'
      })

      strictEqual(currentLanguage.item, '')

      mockWindowInstance.restore()
    })

    it('should handle empty languages array', async function (t) {
      const mockWindowInstance = mockWindow(t)
      const stateData = mockStateData([metadata])
      state.setup(stateData)

      metadata.setup({
        languages: []
      })

      const languages = state.stateGetValue({
        name: 'metadata/languages'
      })

      deepStrictEqual(languages.item, [])

      mockWindowInstance.restore()
    })

    it('should preserve existing state values when no options provided', async function (t) {
      const mockWindowInstance = mockWindow(t)
      const stateData = mockStateData([metadata])
      state.setup(stateData)

      // Set initial state
      state.stateSetValue({
        name: 'metadata/languages',
        value: ['es', 'de']
      })
      state.stateSetValue({
        name: 'metadata/defaultLanguage',
        value: 'es'
      })

      // Setup without options
      metadata.setup()

      const languages = state.stateGetValue({
        name: 'metadata/languages'
      })
      const defaultLanguage = state.stateGetValue({
        name: 'metadata/defaultLanguage'
      })

      deepStrictEqual(languages.item, ['es', 'de'])
      strictEqual(defaultLanguage.item, 'es')

      mockWindowInstance.restore()
    })
  })

  describe('Change language', function () {
    it('should successfully change current language', async function (t) {
      const mockWindowInstance = mockWindow(t, { search: '' })
      const stateData = mockStateData([metadata])
      state.setup(stateData)

      metadata.setup({
        languages: ['en', 'fr']
      })

      // change current language
      state.stateSetValue({
        name: 'metadata/currentLanguage',
        value: 'fr'
      })

      const defaultLanguage = state.stateGetValue({
        name: 'metadata/defaultLanguage'
      })
      const currentLanguage = state.stateGetValue({
        name: 'metadata/currentLanguage'
      })
      const languages = state.stateGetValue({
        name: 'metadata/languages'
      })

      strictEqual(defaultLanguage.item, 'en')
      strictEqual(currentLanguage.item, 'fr')
      deepStrictEqual(languages.item, ['en', 'fr'])

      mockWindowInstance.restore()
    })

    it('should revert language if language does not exist', async function (t) {
      const mockWindowInstance = mockWindow(t, { search: '?lang=fr' })
      const stateData = mockStateData([metadata])
      state.setup(stateData)

      metadata.setup({
        languages: ['en', 'fr']
      })

      // change language
      state.stateSetValue({
        name: 'metadata/currentLanguage',
        value: 'de'
      })

      const defaultLanguage = state.stateGetValue({
        name: 'metadata/defaultLanguage'
      })
      const currentLanguage = state.stateGetValue({
        name: 'metadata/currentLanguage'
      })
      const languages = state.stateGetValue({
        name: 'metadata/languages'
      })

      strictEqual(defaultLanguage.item, 'en')
      strictEqual(currentLanguage.item, '')
      deepStrictEqual(languages.item, ['en', 'fr'])

      mockWindowInstance.restore()
    })

    it('should not set language is the same as the default', async function (t) {
      const mockWindowInstance = mockWindow(t)
      const stateData = mockStateData([metadata])
      state.setup(stateData)

      metadata.setup({
        languages: ['en', 'fr']
      })

      // change language
      state.stateSetValue({
        name: 'metadata/currentLanguage',
        value: 'en'
      })

      const defaultLanguage = state.stateGetValue({
        name: 'metadata/defaultLanguage'
      })
      const currentLanguage = state.stateGetValue({
        name: 'metadata/currentLanguage'
      })
      const languages = state.stateGetValue({
        name: 'metadata/languages'
      })

      strictEqual(defaultLanguage.item, 'en')
      strictEqual(currentLanguage.item, '')
      deepStrictEqual(languages.item, ['en', 'fr'])

      mockWindowInstance.restore()
    })

    it('should revert to empty string when previous value is undefined', async function (t) {
      const mockWindowInstance = mockWindow(t)
      const stateData = mockStateData([metadata])
      state.setup(stateData)

      metadata.setup({
        languages: ['en', 'fr']
      })

      // Set to invalid language from empty state
      state.stateSetValue({
        name: 'metadata/currentLanguage',
        value: 'de'
      })

      const currentLanguage = state.stateGetValue({
        name: 'metadata/currentLanguage'
      })

      strictEqual(currentLanguage.item, '')

      mockWindowInstance.restore()
    })

    it('should allow changing to any valid language', async function (t) {
      const mockWindowInstance = mockWindow(t)
      const stateData = mockStateData([metadata])
      state.setup(stateData)

      metadata.setup({
        languages: ['en', 'fr', 'es', 'de']
      })

      // Test each language
      const languages = ['fr', 'es', 'de']

      for (const lang of languages) {
        state.stateSetValue({
          name: 'metadata/currentLanguage',
          value: lang
        })

        const currentLanguage = state.stateGetValue({
          name: 'metadata/currentLanguage'
        })

        strictEqual(currentLanguage.item, lang, `Should set language to ${lang}`)
      }

      mockWindowInstance.restore()
    })
  })

  describe('State Schema', function () {
    it('should have correct schema for currentLanguage', async function (t) {
      const mockWindowInstance = mockWindow(t)
      const stateData = mockStateData([metadata])
      state.setup(stateData)
      metadata.setup()

      const schema = state.stateGetSchema('metadata/currentLanguage')

      strictEqual(schema.type, 'string')

      mockWindowInstance.restore()
    })

    it('should have correct schema for defaultLanguage', async function (t) {
      const mockWindowInstance = mockWindow(t)
      const stateData = mockStateData([metadata])
      state.setup(stateData)
      metadata.setup()

      const schema = state.stateGetSchema('metadata/defaultLanguage')

      strictEqual(schema.type, 'string')

      mockWindowInstance.restore()
    })

    it('should have correct schema for languages', async function (t) {
      const mockWindowInstance = mockWindow(t)
      const stateData = mockStateData([metadata])
      state.setup(stateData)
      metadata.setup()

      const schema = state.stateGetSchema('metadata/languages')

      strictEqual(schema.type, 'array')

      mockWindowInstance.restore()
    })

    it('should have correct schema for plugins collection', async function (t) {
      const mockWindowInstance = mockWindow(t)
      const stateData = mockStateData([metadata])
      state.setup(stateData)
      metadata.setup()

      const schema = state.stateGetSchema('metadata/plugins')

      strictEqual(schema.type, 'collection')

      mockWindowInstance.restore()
    })

    it('should have correct schema for actions collection', async function (t) {
      const mockWindowInstance = mockWindow(t)
      const stateData = mockStateData([metadata])
      state.setup(stateData)
      metadata.setup()

      const schema = state.stateGetSchema('metadata/actions')

      strictEqual(schema.type, 'collection')

      mockWindowInstance.restore()
    })

    it('should have correct schema for parameters collection', async function (t) {
      const mockWindowInstance = mockWindow(t)
      const stateData = mockStateData([metadata])
      state.setup(stateData)
      metadata.setup()

      const schema = state.stateGetSchema('metadata/parameters')

      strictEqual(schema.type, 'collection')

      mockWindowInstance.restore()
    })
  })

  describe('State Operations', function () {
    it('should allow adding plugin metadata', async function (t) {
      const mockWindowInstance = mockWindow(t)
      const stateData = mockStateData([metadata])
      state.setup(stateData)

      metadata.setup()

      // Add plugin metadata
      state.stateSetValue({
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

      const plugins = state.stateGetValue({
        name: 'metadata/plugins'
      })

      // Find the plugin by ID in the array
      const plugin = plugins.item.find(p => p.id === 'test-plugin')
      strictEqual(plugin.item.title, 'Test Plugin')
      strictEqual(plugin.item.description, 'A test plugin')
      strictEqual(plugin.item.icon, 'test:icon')

      mockWindowInstance.restore()
    })

    it('should allow adding action metadata', async function (t) {
      const mockWindowInstance = mockWindow(t)
      const stateData = mockStateData([metadata])
      state.setup(stateData)

      metadata.setup()

      // First add a plugin
      state.stateSetValue({
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
      state.stateSetValue({
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

      const actions = state.stateGetValue({
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

      mockWindowInstance.restore()
    })

    it('should allow adding parameter metadata', async function (t) {
      const mockWindowInstance = mockWindow(t)
      const stateData = mockStateData([metadata])
      state.setup(stateData)

      metadata.setup()

      // Add parameter metadata
      state.stateSetValue({
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

      const parameters = state.stateGetValue({
        name: 'metadata/parameters'
      })

      // Find the parameter by ID in the array
      const parameter = parameters.item.find(p => p.id === 'test-param')
      strictEqual(parameter.item.type, 'string')
      strictEqual(parameter.item.required, true)
      strictEqual(parameter.item.default, 'test')

      mockWindowInstance.restore()
    })

    it('should handle multiple plugins in collection', async function (t) {
      const mockWindowInstance = mockWindow(t)
      const stateData = mockStateData([metadata])
      state.setup(stateData)

      metadata.setup()

      // Add multiple plugins
      state.stateSetValue({
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

      state.stateSetValue({
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

      const plugins = state.stateGetValue({
        name: 'metadata/plugins'
      })

      // Check that we have at least the two plugins we added
      const plugin1 = plugins.item.find(p => p.id === 'plugin-1')
      const plugin2 = plugins.item.find(p => p.id === 'plugin-2')

      ok(plugin1)
      ok(plugin2)
      strictEqual(plugin1.item.title, 'Plugin 1')
      strictEqual(plugin2.item.title, 'Plugin 2')

      mockWindowInstance.restore()
    })
  })

  describe('State Listener Behavior', function () {
    it('should prevent setting language to default via state listener', async function (t) {
      const mockWindowInstance = mockWindow(t)
      const stateData = mockStateData([metadata])
      state.setup(stateData)

      metadata.setup({
        languages: ['en', 'fr']
      })

      // Set a valid language first
      state.stateSetValue({
        name: 'metadata/currentLanguage',
        value: 'fr'
      })

      // Try to set to default language
      state.stateSetValue({
        name: 'metadata/currentLanguage',
        value: 'en'
      })

      const currentLanguage = state.stateGetValue({
        name: 'metadata/currentLanguage'
      })

      // Should revert to previous value (fr) or empty
      ok(currentLanguage.item === 'fr' || currentLanguage.item === '')

      mockWindowInstance.restore()
    })

    it('should prevent setting invalid language via state listener', async function (t) {
      const mockWindowInstance = mockWindow(t)
      const stateData = mockStateData([metadata])
      state.setup(stateData)

      metadata.setup({
        languages: ['en', 'fr']
      })

      // Set a valid language first
      state.stateSetValue({
        name: 'metadata/currentLanguage',
        value: 'fr'
      })

      // Try to set to invalid language
      state.stateSetValue({
        name: 'metadata/currentLanguage',
        value: 'de'
      })

      const currentLanguage = state.stateGetValue({
        name: 'metadata/currentLanguage'
      })

      // Should revert to previous value (fr) or empty
      ok(currentLanguage.item === 'fr' || currentLanguage.item === '')

      mockWindowInstance.restore()
    })

    it('should handle listener with previous value fallback', async function (t) {
      const mockWindowInstance = mockWindow(t)
      const stateData = mockStateData([metadata])
      state.setup(stateData)

      metadata.setup({
        languages: ['en', 'fr']
      })

      // Set initial language
      state.stateSetValue({
        name: 'metadata/currentLanguage',
        value: 'fr'
      })

      // Set to invalid language (listener should revert)
      state.stateSetValue({
        name: 'metadata/currentLanguage',
        value: 'de'
      })

      const currentLanguage = state.stateGetValue({
        name: 'metadata/currentLanguage'
      })

      // Should have reverted to 'fr' or empty
      ok(currentLanguage.item === 'fr' || currentLanguage.item === '')

      mockWindowInstance.restore()
    })

    it('should handle listener when no previous value exists', async function (t) {
      const mockWindowInstance = mockWindow(t)
      const stateData = mockStateData([metadata])
      state.setup(stateData)

      metadata.setup({
        languages: ['en', 'fr']
      })

      // Set to invalid language without previous value
      state.stateSetValue({
        name: 'metadata/currentLanguage',
        value: 'de'
      })

      const currentLanguage = state.stateGetValue({
        name: 'metadata/currentLanguage'
      })

      // Should revert to empty string
      strictEqual(currentLanguage.item, '')

      mockWindowInstance.restore()
    })
  })

  describe('Edge Cases', function () {
    it('should handle setup with only defaultLanguage option', async function (t) {
      const mockWindowInstance = mockWindow(t, { search: '?lang=fr' })
      const stateData = mockStateData([metadata])
      state.setup(stateData)

      metadata.setup({
        defaultLanguage: 'fr'
      })

      const defaultLanguage = state.stateGetValue({
        name: 'metadata/defaultLanguage'
      })
      const currentLanguage = state.stateGetValue({
        name: 'metadata/currentLanguage'
      })
      const languages = state.stateGetValue({
        name: 'metadata/languages'
      })

      strictEqual(defaultLanguage.item, 'fr')
      strictEqual(currentLanguage.item, '') // Should be empty since lang=fr equals default
      deepStrictEqual(languages.item, ['en']) // Should keep default

      mockWindowInstance.restore()
    })

    it('should handle setup with only languages option', async function (t) {
      const mockWindowInstance = mockWindow(t, { search: '?lang=es' })
      const stateData = mockStateData([metadata])
      state.setup(stateData)

      metadata.setup({
        languages: ['en', 'fr', 'es']
      })

      const defaultLanguage = state.stateGetValue({
        name: 'metadata/defaultLanguage'
      })
      const currentLanguage = state.stateGetValue({
        name: 'metadata/currentLanguage'
      })
      const languages = state.stateGetValue({
        name: 'metadata/languages'
      })

      strictEqual(defaultLanguage.item, 'en') // Should keep default
      strictEqual(currentLanguage.item, 'es') // Should set from URL
      deepStrictEqual(languages.item, ['en', 'fr', 'es'])

      mockWindowInstance.restore()
    })

    it('should handle URL with no lang parameter', async function (t) {
      const mockWindowInstance = mockWindow(t, { search: '?other=param' })
      const stateData = mockStateData([metadata])
      state.setup(stateData)

      metadata.setup({
        languages: ['en', 'fr']
      })

      const currentLanguage = state.stateGetValue({
        name: 'metadata/currentLanguage'
      })

      strictEqual(currentLanguage.item, '')

      mockWindowInstance.restore()
    })

    it('should handle empty URL search string', async function (t) {
      const mockWindowInstance = mockWindow(t, { search: '' })
      const stateData = mockStateData([metadata])
      state.setup(stateData)

      metadata.setup({
        languages: ['en', 'fr']
      })

      const currentLanguage = state.stateGetValue({
        name: 'metadata/currentLanguage'
      })

      strictEqual(currentLanguage.item, '')

      mockWindowInstance.restore()
    })

    it('should handle special characters in language codes', async function (t) {
      const mockWindowInstance = mockWindow(t, { search: '?lang=pt-BR' })
      const stateData = mockStateData([metadata])
      state.setup(stateData)

      metadata.setup({
        languages: ['en', 'pt-BR', 'zh-CN']
      })

      const currentLanguage = state.stateGetValue({
        name: 'metadata/currentLanguage'
      })

      strictEqual(currentLanguage.item, 'pt-BR')

      mockWindowInstance.restore()
    })

    it('should handle case sensitivity in language codes', async function (t) {
      const mockWindowInstance = mockWindow(t, { search: '?lang=FR' })
      const stateData = mockStateData([metadata])
      state.setup(stateData)

      metadata.setup({
        languages: ['en', 'fr']
      })

      const currentLanguage = state.stateGetValue({
        name: 'metadata/currentLanguage'
      })

      // Should not match since 'FR' !== 'fr'
      strictEqual(currentLanguage.item, '')

      mockWindowInstance.restore()
    })

    it('should handle repeated setup calls', async function (t) {
      const mockWindowInstance = mockWindow(t, { search: '?lang=fr' })
      const stateData = mockStateData([metadata])
      state.setup(stateData)

      // First setup
      metadata.setup({
        languages: ['en', 'fr']
      })

      let currentLanguage = state.stateGetValue({
        name: 'metadata/currentLanguage'
      })
      strictEqual(currentLanguage.item, 'fr')

      // Second setup with different options
      metadata.setup({
        languages: ['en', 'fr', 'es'],
        defaultLanguage: 'fr'
      })

      currentLanguage = state.stateGetValue({
        name: 'metadata/currentLanguage'
      })
      const languages = state.stateGetValue({
        name: 'metadata/languages'
      })
      const defaultLanguage = state.stateGetValue({
        name: 'metadata/defaultLanguage'
      })

      // Should update to new configuration
      strictEqual(currentLanguage.item, '') // fr equals new default
      deepStrictEqual(languages.item, ['en', 'fr', 'es'])
      strictEqual(defaultLanguage.item, 'fr')

      mockWindowInstance.restore()
    })

    it('should handle very long language arrays', async function (t) {
      const mockWindowInstance = mockWindow(t)
      const stateData = mockStateData([metadata])
      state.setup(stateData)

      const manyLanguages = Array.from({ length: 50 }, (_, i) => `lang${i}`)

      metadata.setup({
        languages: manyLanguages
      })

      const languages = state.stateGetValue({
        name: 'metadata/languages'
      })

      strictEqual(languages.item.length, 50)
      strictEqual(languages.item[49], 'lang49')

      mockWindowInstance.restore()
    })

    it('should handle Unicode characters in language codes', async function (t) {
      const mockWindowInstance = mockWindow(t, { search: '?lang=日本語' })
      const stateData = mockStateData([metadata])
      state.setup(stateData)

      metadata.setup({
        languages: ['en', '日本語']
      })

      const currentLanguage = state.stateGetValue({
        name: 'metadata/currentLanguage'
      })

      strictEqual(currentLanguage.item, '日本語')

      mockWindowInstance.restore()
    })
  })
})
