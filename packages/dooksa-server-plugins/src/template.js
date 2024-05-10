import { createPlugin } from '@dooksa/create'
import { $setDataValue, template } from '@dooksa/plugins'
import { $deleteDatabaseValue, $getDatabaseValue, $seedDatabase } from './database.js'
import { $setRoute } from './http.js'

export default createPlugin({
  name: 'template',
  data: template.data,
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
      handlers: [
        $getDatabaseValue(['template/metadata'])
      ]
    })
  }
})
