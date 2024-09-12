import createPlugin from '@dooksa/create-plugin'
import { dataSetValue, metadata } from '@dooksa/plugins'
import { databaseSeed, databaseGetValue } from './database.js'
import { httpSetRoute } from './http.js'

export default createPlugin('metadata', {
  models: {
    ...metadata.models
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
          dataSetValue({
            name: 'metadata/actions',
            value: metadata.actions[key],
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
