import createPlugin from '@dooksa/create-plugin'
import { dataSetValue } from './data.js'

const metadata = createPlugin('metadata', {
  metadata: {
    title: 'Metadata',
    description: 'Additional information about plugins and their actions',
    icon: 'carbon:data-volume'
  },
  models: {
    currentLanguage: {
      type: 'string'
    },
    languages: {
      type: 'array',
      items: {
        type: 'string'
      }
    },
    plugins: {
      type: 'collection',
      items: {
        type: 'object',
        properties: {
          title: {
            type: 'string'
          },
          description: {
            type: 'string'
          },
          icon: {
            type: 'string'
          }
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
          title: {
            type: 'string'
          },
          description: {
            type: 'string'
          },
          icon: {
            type: 'string'
          }
        }
      }
    },
    actionParameters: {
      type: 'collection',
      items: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            title: {
              type: 'string'
            },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: {
                    type: 'string'
                  },
                  title: {
                    type: 'string'
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  /**
   * @param {Object} param
   * @param {string} [param.currentLanguage='en']
   * @param {string[]} [param.languages=['en']]
   */
  setup ({ currentLanguage = 'en', languages = ['en'] } = {}) {
    dataSetValue({ name: 'metadata/currentLanguage', value: currentLanguage })
    dataSetValue({ name: 'metadata/languages', value: languages })
  }
})

export { metadata }

export default metadata
