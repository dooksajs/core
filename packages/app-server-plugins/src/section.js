import createPlugin from '@dooksa/create-plugin'
import { section } from '@dooksa/plugins'
import { $setRoute } from './http.js'
import { $deleteDatabaseValue, $getDatabaseValue, $seedDatabase } from './database.js'

export default createPlugin({
  name: 'section',
  models: { ...section.models },
  setup () {
    $seedDatabase('section-items')

    // route: get a list of section
    $setRoute('/section', {
      method: 'get',
      middleware: ['request/queryIsArray'],
      handlers: [
        $getDatabaseValue(['section/items'])
      ]
    })

    // route: delete section
    $setRoute('/section', {
      method: 'delete',
      middleware: ['user/auth', 'request/queryIsArray'],
      handlers: [
        $deleteDatabaseValue(['section/items'])
      ]
    })
  }
})
