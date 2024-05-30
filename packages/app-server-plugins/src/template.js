import createPlugin from '@dooksa/create-plugin'
import { template } from '@dooksa/plugins'
import { $deleteDatabaseValue, $getDatabaseValue, $seedDatabase } from './database.js'
import { $setRoute } from './http.js'

export default createPlugin({
  name: 'template',
  models: template.models,
  setup () {
    $seedDatabase('template-items')
    $seedDatabase('template-metadata')

    // route: get a list or one template
    $setRoute('/template', {
      method: 'get',
      middleware: ['request/queryIsArray'],
      handlers: [
        $getDatabaseValue(['template/items'])
      ]
    })

    // route: delete section
    $setRoute('/template', {
      method: 'delete',
      middleware: ['user/auth', 'request/queryIsArray'],
      handlers: [
        $deleteDatabaseValue(['template/items'])
      ]
    })

    // route: get a list or one template metadata
    $setRoute('/template/metadata', {
      method: 'get',
      middleware: ['request/queryIsArray'],
      handlers: [
        $getDatabaseValue(['template/metadata'])
      ]
    })
  }
})