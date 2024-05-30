import createPlugin from '@dooksa/create-plugin'
import { component } from '@dooksa/plugins'
import { $deleteDatabaseValue, $getDatabaseValue, $seedDatabase } from './database.js'
import { $setRoute } from './http.js'

const componentServer = createPlugin({
  name: 'component',
  models: component.models,
  setup () {
    $seedDatabase('component-items')
    $seedDatabase('component-children')
    $seedDatabase('component-content')

    // route: get a list of component
    $setRoute('/component', {
      method: 'get',
      middleware: ['request/queryIsArray'],
      handlers: [
        $getDatabaseValue(['component/items'])
      ]
    })

    // route: delete component
    $setRoute('/component', {
      method: 'delete',
      middleware: ['user/auth', 'request/queryIsArray'],
      handlers: [
        $deleteDatabaseValue(['component/items'])
      ]
    })
  }
})

export default componentServer
