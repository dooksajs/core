import { describe, it, beforeEach, afterEach } from 'node:test'
import { strictEqual, deepStrictEqual, ok } from 'node:assert/strict'
import { mockPlugin, mockWindow } from '@dooksa/test'

describe('Metadata', function () {
  describe('Setup', function () {
    it('should successfully set default languages', async function (t) {
      const mockWindowInstance = mockWindow(t)
      const mock = await mockPlugin(this, {
        name: 'metadata',
        platform: 'client'
      })

      // set up metadata
      mock.client.setup.metadata()

      // get metadata default values
      const defaultLanguage = mock.client.method.stateGetValue({
        name: 'metadata/defaultLanguage'
      })
      const currentLanguage = mock.client.method.stateGetValue({
        name: 'metadata/currentLanguage'
      })
      const languages = mock.client.method.stateGetValue({
        name: 'metadata/languages'
      })

      strictEqual(defaultLanguage.item, 'en')
      strictEqual(currentLanguage.item, '')
      deepStrictEqual(languages.item, ['en'])

      mockWindowInstance.restore()
      mock.restore()
    })

    it('should successfully set current language', async function (t) {
      // set current language to fr
      const mockWindowInstance = mockWindow(t, { search: '?lang=fr' })
      const mock = await mockPlugin(this, {
        name: 'metadata',
        platform: 'client'
      })

      mock.client.setup.metadata({
        languages: ['en', 'fr']
      })

      const defaultLanguage = mock.client.method.stateGetValue({
        name: 'metadata/defaultLanguage'
      })
      const currentLanguage = mock.client.method.stateGetValue({
        name: 'metadata/currentLanguage'
      })
      const languages = mock.client.method.stateGetValue({
        name: 'metadata/languages'
      })

      strictEqual(defaultLanguage.item, 'en')
      strictEqual(currentLanguage.item, 'fr')
      deepStrictEqual(languages.item, ['en', 'fr'])

      mockWindowInstance.restore()
      mock.restore()
    })

    it('should use custom default language when provided', async function (t) {
      const mockWindowInstance = mockWindow(t, { search: '?lang=fr' })
      const mock = await mockPlugin(this, {
        name: 'metadata',
        platform: 'client'
      })

      mock.client.setup.metadata({
        defaultLanguage: 'fr',
        languages: ['en', 'fr']
      })

      const defaultLanguage = mock.client.method.stateGetValue({
        name: 'metadata/defaultLanguage'
      })
      const currentLanguage = mock.client.method.stateGetValue({
        name: 'metadata/currentLanguage'
      })
      const languages = mock.client.method.stateGetValue({
        name: 'metadata/languages'
      })

      strictEqual(defaultLanguage.item, 'fr')
      strictEqual(currentLanguage.item, '') // Should be empty since lang=fr equals default
      deepStrictEqual(languages.item, ['en', 'fr'])

      mockWindowInstance.restore()
      mock.restore()
    })

    it('should ignore URL language when it equals default language', async function (t) {
      const mockWindowInstance = mockWindow(t, { search: '?lang=en' })
      const mock = await mockPlugin(this, {
        name: 'metadata',
        platform: 'client'
      })

      mock.client.setup.metadata({
        languages: ['en', 'fr']
      })

      const currentLanguage = mock.client.method.stateGetValue({
        name: 'metadata/currentLanguage'
      })

      strictEqual(currentLanguage.item, '')

      mockWindowInstance.restore()
      mock.restore()
    })

    it('should ignore URL language when not in available languages', async function (t) {
      const mockWindowInstance = mockWindow(t, { search: '?lang=de' })
      const mock = await mockPlugin(this, {
        name: 'metadata',
        platform: 'client'
      })

      mock.client.setup.metadata({
        languages: ['en', 'fr']
      })

      const currentLanguage = mock.client.method.stateGetValue({
        name: 'metadata/currentLanguage'
      })

      strictEqual(currentLanguage.item, '')

      mockWindowInstance.restore()
      mock.restore()
    })

    it('should handle empty languages array', async function (t) {
      const mockWindowInstance = mockWindow(t)
      const mock = await mockPlugin(this, {
        name: 'metadata',
        platform: 'client'
      })

      mock.client.setup.metadata({
        languages: []
      })

      const languages = mock.client.method.stateGetValue({
        name: 'metadata/languages'
      })

      deepStrictEqual(languages.item, [])

      mockWindowInstance.restore()
      mock.restore()
    })

    it('should preserve existing state values when no options provided', async function (t) {
      const mockWindowInstance = mockWindow(t)
      const mock = await mockPlugin(this, {
        name: 'metadata',
        platform: 'client'
      })

      // Set initial state
      mock.client.method.stateSetValue({
        name: 'metadata/languages',
        value: ['es', 'de']
      })
      mock.client.method.stateSetValue({
        name: 'metadata/defaultLanguage',
        value: 'es'
      })

      // Setup without options
      mock.client.setup.metadata()

      const languages = mock.client.method.stateGetValue({
        name: 'metadata/languages'
      })
      const defaultLanguage = mock.client.method.stateGetValue({
        name: 'metadata/defaultLanguage'
      })

      deepStrictEqual(languages.item, ['es', 'de'])
      strictEqual(defaultLanguage.item, 'es')

      mockWindowInstance.restore()
      mock.restore()
    })
  })

  describe('Change language', function () {
    it('should successfully change current language', async function (t) {
      const mockWindowInstance = mockWindow(t, { search: '' })
      const mock = await mockPlugin(this, {
        name: 'metadata',
        platform: 'client'
      })

      mock.client.setup.metadata({
        languages: ['en', 'fr']
      })

      // change current language
      mock.client.method.stateSetValue({
        name: 'metadata/currentLanguage',
        value: 'fr'
      })

      const defaultLanguage = mock.client.method.stateGetValue({
        name: 'metadata/defaultLanguage'
      })
      const currentLanguage = mock.client.method.stateGetValue({
        name: 'metadata/currentLanguage'
      })
      const languages = mock.client.method.stateGetValue({
        name: 'metadata/languages'
      })

      strictEqual(defaultLanguage.item, 'en')
      strictEqual(currentLanguage.item, 'fr')
      deepStrictEqual(languages.item, ['en', 'fr'])

      mockWindowInstance.restore()
      mock.restore()
    })

    it('should revert language if language does not exist', async function (t) {
      const mockWindowInstance = mockWindow(t, { search: '?lang=fr' })
      const mock = await mockPlugin(this, {
        name: 'metadata',
        platform: 'client'
      })

      mock.client.setup.metadata({
        languages: ['en', 'fr']
      })

      // change language
      mock.client.method.stateSetValue({
        name: 'metadata/currentLanguage',
        value: 'de'
      })

      const defaultLanguage = mock.client.method.stateGetValue({
        name: 'metadata/defaultLanguage'
      })
      const currentLanguage = mock.client.method.stateGetValue({
        name: 'metadata/currentLanguage'
      })
      const languages = mock.client.method.stateGetValue({
        name: 'metadata/languages'
      })

      strictEqual(defaultLanguage.item, 'en')
      strictEqual(currentLanguage.item, '')
      deepStrictEqual(languages.item, ['en', 'fr'])

      mockWindowInstance.restore()
      mock.restore()
    })

    it('should not set language is the same as the default', async function (t) {
      const mockWindowInstance = mockWindow(t)
      const mock = await mockPlugin(this, {
        name: 'metadata',
        platform: 'client'
      })

      mock.client.setup.metadata({
        languages: ['en', 'fr']
      })

      // change language
      mock.client.method.stateSetValue({
        name: 'metadata/currentLanguage',
        value: 'en'
      })

      const defaultLanguage = mock.client.method.stateGetValue({
        name: 'metadata/defaultLanguage'
      })
      const currentLanguage = mock.client.method.stateGetValue({
        name: 'metadata/currentLanguage'
      })
      const languages = mock.client.method.stateGetValue({
        name: 'metadata/languages'
      })

      strictEqual(defaultLanguage.item, 'en')
      strictEqual(currentLanguage.item, '')
      deepStrictEqual(languages.item, ['en', 'fr'])

      mockWindowInstance.restore()
      mock.restore()
    })

    it('should revert to empty string when previous value is undefined', async function (t) {
      const mockWindowInstance = mockWindow(t)
      const mock = await mockPlugin(this, {
        name: 'metadata',
        platform: 'client'
      })

      mock.client.setup.metadata({
        languages: ['en', 'fr']
      })

      // Set to invalid language from empty state
      mock.client.method.stateSetValue({
        name: 'metadata/currentLanguage',
        value: 'de'
      })

      const currentLanguage = mock.client.method.stateGetValue({
        name: 'metadata/currentLanguage'
      })

      strictEqual(currentLanguage.item, '')

      mockWindowInstance.restore()
      mock.restore()
    })

    it('should allow changing to any valid language', async function (t) {
      const mockWindowInstance = mockWindow(t)
      const mock = await mockPlugin(this, {
        name: 'metadata',
        platform: 'client'
      })

      mock.client.setup.metadata({
        languages: ['en', 'fr', 'es', 'de']
      })

      // Test each language
      const languages = ['fr', 'es', 'de']

      for (const lang of languages) {
        mock.client.method.stateSetValue({
          name: 'metadata/currentLanguage',
          value: lang
        })

        const currentLanguage = mock.client.method.stateGetValue({
          name: 'metadata/currentLanguage'
        })

        strictEqual(currentLanguage.item, lang, `Should set language to ${lang}`)
      }

      mockWindowInstance.restore()
      mock.restore()
    })
  })

  describe('State Schema', function () {
    it('should have correct schema for currentLanguage', async function (t) {
      const mockWindowInstance = mockWindow(t)
      const mock = await mockPlugin(this, {
        name: 'metadata',
        platform: 'client'
      })

      const schema = mock.client.method.stateGetSchema('metadata/currentLanguage')

      strictEqual(schema.type, 'string')

      mockWindowInstance.restore()
      mock.restore()
    })

    it('should have correct schema for defaultLanguage', async function (t) {
      const mockWindowInstance = mockWindow(t)
      const mock = await mockPlugin(this, {
        name: 'metadata',
        platform: 'client'
      })

      const schema = mock.client.method.stateGetSchema('metadata/defaultLanguage')

      strictEqual(schema.type, 'string')

      mockWindowInstance.restore()
      mock.restore()
    })

    it('should have correct schema for languages', async function (t) {
      const mockWindowInstance = mockWindow(t)
      const mock = await mockPlugin(this, {
        name: 'metadata',
        platform: 'client'
      })

      const schema = mock.client.method.stateGetSchema('metadata/languages')

      strictEqual(schema.type, 'array')

      mockWindowInstance.restore()
      mock.restore()
    })

    it('should have correct schema for plugins collection', async function (t) {
      const mockWindowInstance = mockWindow(t)
      const mock = await mockPlugin(this, {
        name: 'metadata',
        platform: 'client'
      })

      const schema = mock.client.method.stateGetSchema('metadata/plugins')

      strictEqual(schema.type, 'collection')

      mockWindowInstance.restore()
      mock.restore()
    })

    it('should have correct schema for actions collection', async function (t) {
      const mockWindowInstance = mockWindow(t)
      const mock = await mockPlugin(this, {
        name: 'metadata',
        platform: 'client'
      })

      const schema = mock.client.method.stateGetSchema('metadata/actions')

      strictEqual(schema.type, 'collection')

      mockWindowInstance.restore()
      mock.restore()
    })

    it('should have correct schema for parameters collection', async function (t) {
      const mockWindowInstance = mockWindow(t)
      const mock = await mockPlugin(this, {
        name: 'metadata',
        platform: 'client'
      })

      const schema = mock.client.method.stateGetSchema('metadata/parameters')

      strictEqual(schema.type, 'collection')

      mockWindowInstance.restore()
      mock.restore()
    })
  })

  describe('State Operations', function () {
    it('should allow adding plugin metadata', async function (t) {
      const mockWindowInstance = mockWindow(t)
      const mock = await mockPlugin(this, {
        name: 'metadata',
        platform: 'client'
      })

      mock.client.setup.metadata()

      // Add plugin metadata
      mock.client.method.stateSetValue({
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

      const plugins = mock.client.method.stateGetValue({
        name: 'metadata/plugins'
      })

      // Find the plugin by ID in the array
      const plugin = plugins.item.find(p => p.id === 'test-plugin')
      strictEqual(plugin.item.title, 'Test Plugin')
      strictEqual(plugin.item.description, 'A test plugin')
      strictEqual(plugin.item.icon, 'test:icon')

      mockWindowInstance.restore()
      mock.restore()
    })

    it('should allow adding action metadata', async function (t) {
      const mockWindowInstance = mockWindow(t)
      const mock = await mockPlugin(this, {
        name: 'metadata',
        platform: 'client'
      })

      mock.client.setup.metadata()

      // First add a plugin
      mock.client.method.stateSetValue({
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
      mock.client.method.stateSetValue({
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

      const actions = mock.client.method.stateGetValue({
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
      mock.restore()
    })

    it('should allow adding parameter metadata', async function (t) {
      const mockWindowInstance = mockWindow(t)
      const mock = await mockPlugin(this, {
        name: 'metadata',
        platform: 'client'
      })

      mock.client.setup.metadata()

      // Add parameter metadata
      mock.client.method.stateSetValue({
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

      const parameters = mock.client.method.stateGetValue({
        name: 'metadata/parameters'
      })

      // Find the parameter by ID in the array
      const parameter = parameters.item.find(p => p.id === 'test-param')
      strictEqual(parameter.item.type, 'string')
      strictEqual(parameter.item.required, true)
      strictEqual(parameter.item.default, 'test')

      mockWindowInstance.restore()
      mock.restore()
    })

    it('should handle multiple plugins in collection', async function (t) {
      const mockWindowInstance = mockWindow(t)
      const mock = await mockPlugin(this, {
        name: 'metadata',
        platform: 'client'
      })

      mock.client.setup.metadata()

      // Add multiple plugins
      mock.client.method.stateSetValue({
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

      mock.client.method.stateSetValue({
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

      const plugins = mock.client.method.stateGetValue({
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
      mock.restore()
    })
  })

  describe('State Listener Behavior', function () {
    it('should prevent setting language to default via state listener', async function (t) {
      const mockWindowInstance = mockWindow(t)
      const mock = await mockPlugin(this, {
        name: 'metadata',
        platform: 'client'
      })

      mock.client.setup.metadata({
        languages: ['en', 'fr']
      })

      // Set a valid language first
      mock.client.method.stateSetValue({
        name: 'metadata/currentLanguage',
        value: 'fr'
      })

      // Try to set to default language
      mock.client.method.stateSetValue({
        name: 'metadata/currentLanguage',
        value: 'en'
      })

      const currentLanguage = mock.client.method.stateGetValue({
        name: 'metadata/currentLanguage'
      })

      // Should revert to previous value (fr) or empty
      ok(currentLanguage.item === 'fr' || currentLanguage.item === '')

      mockWindowInstance.restore()
      mock.restore()
    })

    it('should prevent setting invalid language via state listener', async function (t) {
      const mockWindowInstance = mockWindow(t)
      const mock = await mockPlugin(this, {
        name: 'metadata',
        platform: 'client'
      })

      mock.client.setup.metadata({
        languages: ['en', 'fr']
      })

      // Set a valid language first
      mock.client.method.stateSetValue({
        name: 'metadata/currentLanguage',
        value: 'fr'
      })

      // Try to set to invalid language
      mock.client.method.stateSetValue({
        name: 'metadata/currentLanguage',
        value: 'de'
      })

      const currentLanguage = mock.client.method.stateGetValue({
        name: 'metadata/currentLanguage'
      })

      // Should revert to previous value (fr) or empty
      ok(currentLanguage.item === 'fr' || currentLanguage.item === '')

      mockWindowInstance.restore()
      mock.restore()
    })

    it('should handle listener with previous value fallback', async function (t) {
      const mockWindowInstance = mockWindow(t)
      const mock = await mockPlugin(this, {
        name: 'metadata',
        platform: 'client'
      })

      mock.client.setup.metadata({
        languages: ['en', 'fr']
      })

      // Set initial language
      mock.client.method.stateSetValue({
        name: 'metadata/currentLanguage',
        value: 'fr'
      })

      // Set to invalid language (listener should revert)
      mock.client.method.stateSetValue({
        name: 'metadata/currentLanguage',
        value: 'de'
      })

      const currentLanguage = mock.client.method.stateGetValue({
        name: 'metadata/currentLanguage'
      })

      // Should have reverted to 'fr' or empty
      ok(currentLanguage.item === 'fr' || currentLanguage.item === '')

      mockWindowInstance.restore()
      mock.restore()
    })

    it('should handle listener when no previous value exists', async function (t) {
      const mockWindowInstance = mockWindow(t)
      const mock = await mockPlugin(this, {
        name: 'metadata',
        platform: 'client'
      })

      mock.client.setup.metadata({
        languages: ['en', 'fr']
      })

      // Set to invalid language without previous value
      mock.client.method.stateSetValue({
        name: 'metadata/currentLanguage',
        value: 'de'
      })

      const currentLanguage = mock.client.method.stateGetValue({
        name: 'metadata/currentLanguage'
      })

      // Should revert to empty string
      strictEqual(currentLanguage.item, '')

      mockWindowInstance.restore()
      mock.restore()
    })
  })

  describe('Edge Cases', function () {
    it('should handle setup with only defaultLanguage option', async function (t) {
      const mockWindowInstance = mockWindow(t, { search: '?lang=fr' })
      const mock = await mockPlugin(this, {
        name: 'metadata',
        platform: 'client'
      })

      mock.client.setup.metadata({
        defaultLanguage: 'fr'
      })

      const defaultLanguage = mock.client.method.stateGetValue({
        name: 'metadata/defaultLanguage'
      })
      const currentLanguage = mock.client.method.stateGetValue({
        name: 'metadata/currentLanguage'
      })
      const languages = mock.client.method.stateGetValue({
        name: 'metadata/languages'
      })

      strictEqual(defaultLanguage.item, 'fr')
      strictEqual(currentLanguage.item, '') // Should be empty since lang=fr equals default
      deepStrictEqual(languages.item, ['en']) // Should keep default

      mockWindowInstance.restore()
      mock.restore()
    })

    it('should handle setup with only languages option', async function (t) {
      const mockWindowInstance = mockWindow(t, { search: '?lang=es' })
      const mock = await mockPlugin(this, {
        name: 'metadata',
        platform: 'client'
      })

      mock.client.setup.metadata({
        languages: ['en', 'fr', 'es']
      })

      const defaultLanguage = mock.client.method.stateGetValue({
        name: 'metadata/defaultLanguage'
      })
      const currentLanguage = mock.client.method.stateGetValue({
        name: 'metadata/currentLanguage'
      })
      const languages = mock.client.method.stateGetValue({
        name: 'metadata/languages'
      })

      strictEqual(defaultLanguage.item, 'en') // Should keep default
      strictEqual(currentLanguage.item, 'es') // Should set from URL
      deepStrictEqual(languages.item, ['en', 'fr', 'es'])

      mockWindowInstance.restore()
      mock.restore()
    })

    it('should handle URL with no lang parameter', async function (t) {
      const mockWindowInstance = mockWindow(t, { search: '?other=param' })
      const mock = await mockPlugin(this, {
        name: 'metadata',
        platform: 'client'
      })

      mock.client.setup.metadata({
        languages: ['en', 'fr']
      })

      const currentLanguage = mock.client.method.stateGetValue({
        name: 'metadata/currentLanguage'
      })

      strictEqual(currentLanguage.item, '')

      mockWindowInstance.restore()
      mock.restore()
    })

    it('should handle empty URL search string', async function (t) {
      const mockWindowInstance = mockWindow(t, { search: '' })
      const mock = await mockPlugin(this, {
        name: 'metadata',
        platform: 'client'
      })

      mock.client.setup.metadata({
        languages: ['en', 'fr']
      })

      const currentLanguage = mock.client.method.stateGetValue({
        name: 'metadata/currentLanguage'
      })

      strictEqual(currentLanguage.item, '')

      mockWindowInstance.restore()
      mock.restore()
    })

    it('should handle special characters in language codes', async function (t) {
      const mockWindowInstance = mockWindow(t, { search: '?lang=pt-BR' })
      const mock = await mockPlugin(this, {
        name: 'metadata',
        platform: 'client'
      })

      mock.client.setup.metadata({
        languages: ['en', 'pt-BR', 'zh-CN']
      })

      const currentLanguage = mock.client.method.stateGetValue({
        name: 'metadata/currentLanguage'
      })

      strictEqual(currentLanguage.item, 'pt-BR')

      mockWindowInstance.restore()
      mock.restore()
    })

    it('should handle case sensitivity in language codes', async function (t) {
      const mockWindowInstance = mockWindow(t, { search: '?lang=FR' })
      const mock = await mockPlugin(this, {
        name: 'metadata',
        platform: 'client'
      })

      mock.client.setup.metadata({
        languages: ['en', 'fr']
      })

      const currentLanguage = mock.client.method.stateGetValue({
        name: 'metadata/currentLanguage'
      })

      // Should not match since 'FR' !== 'fr'
      strictEqual(currentLanguage.item, '')

      mockWindowInstance.restore()
      mock.restore()
    })

    it('should handle repeated setup calls', async function (t) {
      const mockWindowInstance = mockWindow(t, { search: '?lang=fr' })
      const mock = await mockPlugin(this, {
        name: 'metadata',
        platform: 'client'
      })

      // First setup
      mock.client.setup.metadata({
        languages: ['en', 'fr']
      })

      let currentLanguage = mock.client.method.stateGetValue({
        name: 'metadata/currentLanguage'
      })
      strictEqual(currentLanguage.item, 'fr')

      // Second setup with different options
      mock.client.setup.metadata({
        languages: ['en', 'fr', 'es'],
        defaultLanguage: 'fr'
      })

      currentLanguage = mock.client.method.stateGetValue({
        name: 'metadata/currentLanguage'
      })
      const languages = mock.client.method.stateGetValue({
        name: 'metadata/languages'
      })
      const defaultLanguage = mock.client.method.stateGetValue({
        name: 'metadata/defaultLanguage'
      })

      // Should update to new configuration
      strictEqual(currentLanguage.item, '') // fr equals new default
      deepStrictEqual(languages.item, ['en', 'fr', 'es'])
      strictEqual(defaultLanguage.item, 'fr')

      mockWindowInstance.restore()
      mock.restore()
    })

    it('should handle very long language arrays', async function (t) {
      const mockWindowInstance = mockWindow(t)
      const mock = await mockPlugin(this, {
        name: 'metadata',
        platform: 'client'
      })

      const manyLanguages = Array.from({ length: 50 }, (_, i) => `lang${i}`)

      mock.client.setup.metadata({
        languages: manyLanguages
      })

      const languages = mock.client.method.stateGetValue({
        name: 'metadata/languages'
      })

      strictEqual(languages.item.length, 50)
      strictEqual(languages.item[49], 'lang49')

      mockWindowInstance.restore()
      mock.restore()
    })

    it('should handle Unicode characters in language codes', async function (t) {
      const mockWindowInstance = mockWindow(t, { search: '?lang=日本語' })
      const mock = await mockPlugin(this, {
        name: 'metadata',
        platform: 'client'
      })

      mock.client.setup.metadata({
        languages: ['en', '日本語']
      })

      const currentLanguage = mock.client.method.stateGetValue({
        name: 'metadata/currentLanguage'
      })

      strictEqual(currentLanguage.item, '日本語')

      mockWindowInstance.restore()
      mock.restore()
    })
  })
})
