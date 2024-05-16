import createPlugin from '@dooksa/create-plugin'
import { layout } from '@dooksa/plugins'
import { $seedDatabase, $getDatabaseValue, $deleteDatabaseValue } from './database.js'
import { $setRoute } from './http.js'

export default createPlugin({
  name: 'layout',
  models: { ...layout.models },
  setup () {
    $seedDatabase('layout-items')

    // route: get a list of action
    $setRoute('/layout', {
      middleware: ['request/queryIsArray'],
      handlers: [
        $getDatabaseValue(['layout/items'])
      ]
    })

    // route: delete action sequence
    $setRoute('/layout', {
      method: 'delete',
      middleware: ['user/auth', 'request/queryIsArray'],
      handlers: [
        $deleteDatabaseValue(['layout/items'])
      ]
    })
  }
})
