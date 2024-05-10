import { createPlugin } from '@dooksa/create'
import { widget } from '@dooksa/plugins'
import { $deleteDatabaseValue, $getDatabaseValue, $seedDatabase } from './database.js'
import { $setRoute } from './http.js'

export default createPlugin({
  name: 'widget',
  data: { ...widget.data },
  setup () {
    $seedDatabase('widget-items')
    $seedDatabase('widget-content')
    $seedDatabase('widget-events')
    $seedDatabase('widget-groups')
    $seedDatabase('widget-mode')
    $seedDatabase('widget-layouts')
    $seedDatabase('widget-sections')

    // route: get a list of action
    $setRoute('/layout', {
      method: 'get',
      middleware: ['request/queryIsArray'],
      handlers: [
        $getDatabaseValue(['widget/items'])
      ]
    })

    // route: delete action sequence
    $setRoute('/layout', {
      method: 'delete',
      middleware: ['user/auth', 'request/queryIsArray'],
      handlers: [
        $deleteDatabaseValue(['widget/items'])
      ]
    })
  }
})
