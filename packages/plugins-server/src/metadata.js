import createPlugin from '@dooksa/create-plugin'
import { $setDataValue, metadata } from '@dooksa/plugins'
import { $seedDatabase, $getDatabaseValue } from './database.js'
import { $setRoute } from './http.js'
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
    $seedDatabase('metadata-currentLanguage')
    $seedDatabase('metadata-languages')

    // set plugin metadata
    for (let i = 0; i < metadata.length; i++) {
      const data = metadata[i]
      const pluginContentId = createContentId(data.name)

      $setDataValue('content/item', data.plugin, { id: pluginContentId })
      $setDataValue('metadata/plugins', pluginContentId, { id: data.name })

      for (const key in data.actions) {
        if (Object.hasOwnProperty.call(data.actions, key)) {
          const contentId = createContentId(key)

          $setDataValue('content/item', data.actions[key], { id: contentId })
          $setDataValue('metadata/actions', {
            values: contentId,
            plugin: pluginContentId
          }, { id: key })
        }
      }
    }

    // route: get a list of languages
    $setRoute('/metadata/languages', {
      handlers: [
        $getDatabaseValue(['metadata/languages'])
      ]
    })

    $setRoute('/metadata/plugins', {
      handlers: [
        $getDatabaseValue(['metadata/plugins'])
      ]
    })

    $setRoute('/metadata/actions', {
      handlers: [
        $getDatabaseValue(['metadata/action'])
      ]
    })
  }
})
