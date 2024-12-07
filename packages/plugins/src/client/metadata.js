import { createPlugin } from '@dooksa/create-plugin'
import { dataAddListener, dataGetValue, dataSetValue } from '#client'

export const metadata = createPlugin('metadata', {
  metadata: {
    title: 'Metadata',
    description: 'Additional information about plugins and their actions',
    icon: 'carbon:data-volume'
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
  },
  /**
   * @param {Object} param
   * @param {string} [param.defaultLanguage='en'] - Default system language
   * @param {string[]} [param.languages=['en']] - List of available languages
   */
  setup ({
    defaultLanguage = 'en',
    languages = ['en']
  } = {}) {
    const params = new URLSearchParams(window.location.search)
    const langParam = params.get('lang')
    let currentLanguage = ''

    if (langParam && languages.includes(langParam) && langParam !== defaultLanguage) {
      currentLanguage = langParam
    }

    dataSetValue({
      name: 'metadata/defaultLanguage',
      value: defaultLanguage
    })
    dataSetValue({
      name: 'metadata/currentLanguage',
      value: currentLanguage
    })
    dataSetValue({
      name: 'metadata/languages',
      value: languages
    })

    dataAddListener({
      name: 'metadata/currentLanguage',
      on: 'update',
      priority: 1,
      handler (data) {
        const defaultLanguage = dataGetValue({
          name: 'metadata/defaultLanguage'
        }).item
        const languages = dataGetValue({
          name: 'metadata/languages'
        }).item
        const lang = data.item

        if (
          lang === defaultLanguage ||
          !languages.includes(lang)
        ) {
          // to prevent adding suffixes for default language data
          // remove current language if it the same as default language
          dataSetValue({
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
