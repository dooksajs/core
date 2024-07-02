import createPlugin from '@dooksa/create-plugin'
import { content } from '@dooksa/plugins'
import { $deleteDatabaseValue, $getDatabaseValue, $seedDatabase } from './database.js'
import { $setRoute } from './http.js'

const contentServer = createPlugin('content', {
  models: content.models,
  setup () {
    $seedDatabase('content-items')

    // route: get a list of component
    $setRoute('/content', {
      method: 'get',
      middleware: ['request/queryIsArray'],
      handlers: [
        $getDatabaseValue(['content/items'])
      ]
    })

    // route: delete component
    $setRoute('/content', {
      method: 'delete',
      middleware: ['user/auth', 'request/queryIsArray'],
      handlers: [
        $deleteDatabaseValue(['content/items'])
      ]
    })
  }
})

export default contentServer
