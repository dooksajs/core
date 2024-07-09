import createPlugin from '@dooksa/create-plugin'
import { dataSetValue, metadata } from '@dooksa/plugins'
import { databaseSeed, databaseGetValue } from './database.js'
import { httpSetRoute } from './http.js'
import { hash } from '@dooksa/utils'

hash.init()

function createContentId (value) {
  return '_' + hash.update(value) + '_'
}

export default createPlugin('metadata', {
  models: {
    ...metadata.models
  },
  setup ({ metadata }) {
    databaseSeed('metadata-currentLanguage')
    databaseSeed('metadata-languages')

    // set plugin metadata
    for (let i = 0; i < metadata.length; i++) {
      const data = metadata[i]
      const pluginContentId = createContentId(data.name)

      dataSetValue({
        name: 'content/item',
        value: data.plugin,
        options: {
          id: pluginContentId
        }
      })
      dataSetValue({
        name: 'metadata/plugins',
        value: pluginContentId,
        options: {
          id: data.name
        }
      })

      for (const key in data.actions) {
        if (Object.hasOwnProperty.call(data.actions, key)) {
          const contentId = createContentId(key)

          dataSetValue({ name: 'content/item', value: data.actions[key], options: { id: contentId } })
          dataSetValue({
            name: 'metadata/actions',
            value: {
              values: contentId,
              plugin: pluginContentId
            },
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
        databaseGetValue(['metadata/action'])
      ]
    })
  }
})
