import createPlugin from '@dooksa/create-plugin'
import { dataSetValue } from '@dooksa/plugins'
import { databaseSeed, databaseGetValue } from './database.js'
import { httpSetRoute } from './http.js'

export default createPlugin('metadata', {
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
          pluginId: {
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
    }
  },
  setup ({ plugins }) {
    databaseSeed('metadata-currentLanguage')
    databaseSeed('metadata-languages')

    // set plugin metadata
    for (let i = 0; i < plugins.length; i++) {
      const plugin = plugins[i]
      const metadata = plugin.metadata

      dataSetValue({
        name: 'metadata/plugins',
        value: metadata.plugin,
        options: {
          id: plugin.name
        }
      })

      for (const key in metadata.actions) {
        if (Object.hasOwnProperty.call(metadata.actions, key)) {
          const actionMetadataValue = Object.assign({
            pluginId: plugin.name
          }, metadata.actions[key])

          dataSetValue({
            name: 'metadata/actions',
            value: actionMetadataValue,
            options: {
              id: key
            }
          })
        }
      }
    }

    // route: get a list of languages
    httpSetRoute({
      path: '/metadata/languages',
      handlers: [
        databaseGetValue(['metadata/languages'])
      ]
    })

    httpSetRoute({
      path: '/metadata/plugins',
      handlers: [
        databaseGetValue(['metadata/plugins'])
      ]
    })

    httpSetRoute({
      path: '/metadata/actions',
      handlers: [
        databaseGetValue(['metadata/actions'])
      ]
    })
  }
})
