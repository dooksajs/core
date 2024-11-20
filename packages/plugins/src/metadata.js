import createPlugin from '@dooksa/create-plugin'
import { dataSetValue } from './data.js'

export const metadata = createPlugin('metadata', {
  metadata: {
    title: 'Metadata',
    description: 'Additional information about plugins and their actions',
    icon: 'carbon:data-volume'
  },
  models: {
    currentLanguage: { type: 'string' },
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
   * @param {string} [param.currentLanguage='en']
   * @param {string[]} [param.languages=['en']]
   */
  setup ({
    currentLanguage = 'en',
    languages = ['en']
  } = {}) {
    dataSetValue({
      name: 'metadata/currentLanguage',
      value: currentLanguage
    })
    dataSetValue({
      name: 'metadata/languages',
      value: languages
    })
  }
})

export default metadata
