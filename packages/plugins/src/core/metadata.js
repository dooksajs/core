import { createPlugin } from '@dooksa/create-plugin'
import { stateAddListener, stateGetValue, stateSetValue } from '#core'

/**
 * @typedef {Object} MetadataSetupOptions
 * @property {string} [defaultLanguage='en'] - Default system language
 * @property {string[]} [languages=['en']] - List of available languages
 */

/**
 * @typedef {Object} MetadataPluginData
 * @property {string} title - Plugin title
 * @property {string} description - Plugin description
 * @property {string} icon - Plugin icon
 */

/**
 * @typedef {Object} MetadataActionData
 * @property {string} plugin - Plugin name (relation to metadata/plugins)
 * @property {string} method - Action method name
 * @property {string} title - Action title
 * @property {string} description - Action description
 * @property {string} icon - Action icon
 * @property {string} component - Action component
 */

/**
 * @typedef {Object} MetadataStateSchema
 * @property {string} currentLanguage - Current active language
 * @property {string} defaultLanguage - Default system language
 * @property {string[]} languages - Available languages
 * @property {Object.<string, MetadataPluginData>} plugins - Plugin metadata collection
 * @property {Object.<string, MetadataActionData>} actions - Action metadata collection
 * @property {Object.<string, Object>} parameters - Parameter metadata collection
 */

export const metadata = createPlugin('metadata', {
  metadata: {
    title: 'Metadata',
    description: 'Additional information about plugins and their actions',
    icon: 'carbon:data-volume'
  },
  state: {
    defaults: {
      defaultLanguage: 'en',
      languages: ['en']
    },
    schema: {
      currentLanguage: { type: 'string' },
      defaultLanguage: { type: 'string' },
      languages: {
        type: 'array',
        items: { type: 'string' }
      },
      plugins: {
        type: 'collection',
        items: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            icon: { type: 'string' }
          }
        }
      },
      actions: {
        type: 'collection',
        items: {
          type: 'object',
          properties: {
            plugin: {
              type: 'string',
              relation: 'metadata/plugins'
            },
            method: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            icon: { type: 'string' },
            component: { type: 'string' }
          }
        }
      },
      parameters: {
        type: 'collection',
        items: {
          type: 'object'
        }
      }
    }
  },
  /**
   * Sets up the metadata plugin with language configuration and validation.
   *
   * This function initializes the metadata system by:
   * 1. Reading language preferences from URL parameters
   * 2. Setting up available languages and default language
   * 3. Configuring current language based on URL or defaults
   * 4. Adding validation listener to prevent invalid language states
   *
   * @param {MetadataSetupOptions} [options] - Configuration options for language setup
   * @example
   * // Setup with custom languages
   * metadata.setup({
   *   defaultLanguage: 'en',
   *   languages: ['en', 'es', 'fr']
   * })
   */
  setup (options) {
    const params = new URLSearchParams(window.location.search)
    const langParam = params.get('lang')
    let currentLanguage = ''
    let languages
    let defaultLanguage

    // set language overwrites
    if (options) {
      languages = options.languages
      defaultLanguage = options.defaultLanguage
    }

    if (!languages) {
      languages = stateGetValue({ name: 'metadata/languages' }).item
    } else {
      stateSetValue({
        name: 'metadata/languages',
        value: languages
      })
    }

    if (!defaultLanguage) {
      defaultLanguage = stateGetValue({ name: 'metadata/defaultLanguage' }).item
    } else {
      stateSetValue({
        name: 'metadata/defaultLanguage',
        value: defaultLanguage
      })
    }

    if (langParam && languages.includes(langParam) && langParam !== defaultLanguage) {
      currentLanguage = langParam
    }

    stateSetValue({
      name: 'metadata/currentLanguage',
      value: currentLanguage
    })

    stateAddListener({
      name: 'metadata/currentLanguage',
      on: 'update',
      priority: 1,
      /**
       * Validates language changes to prevent invalid states.
       * Ensures the current language is always valid and resets to default
       * if an invalid language is set.
       *
       * @param {Object} data - Listener data
       * @param {*} data.item - The new language value
       * @param {*} data.previous - The previous language value
       */
      handler (data) {
        const defaultLanguage = stateGetValue({
          name: 'metadata/defaultLanguage'
        }).item
        const languages = stateGetValue({
          name: 'metadata/languages'
        }).item
        const lang = data.item

        if (
          lang === defaultLanguage ||
          !languages.includes(lang)
        ) {
          // to prevent adding suffixes for default language data
          // remove current language if it the same as default language
          stateSetValue({
            name: 'metadata/currentLanguage',
            value: data.previous || '',
            options: {
              stopPropagation: true
            }
          })
        }
      }
    })
  }
})

export default metadata
