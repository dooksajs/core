import { createPlugin } from '@dooksa/create-plugin'
import { stateAddListener, stateGetValue, stateSetValue } from '#client'

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
   * @param {Object} [options]
   * @param {string} [options.defaultLanguage] - Default system language
   * @param {string[]} [options.languages] - List of available languages
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
            value: data.previous,
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
