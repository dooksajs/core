import { createPlugin } from '@dooksa/create'
import { metadata } from '@dooksa/plugins'
import { $seedDatabase, $getDatabaseValue, $deleteDatabaseValue } from './database.js'
import { $setRoute } from './http.js'

export default createPlugin({
  name: 'metadata',
  models: { ...metadata.models },
  setup () {
    $seedDatabase('metadata-currentLanguage')
    $seedDatabase('metadata-languages')

    // route: get a list of languages
    $setRoute('/metadata/languages', {
      handlers: [
        $getDatabaseValue(['metadata/languages'])
      ]
    })
  }
})
