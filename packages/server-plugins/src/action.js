import createPlugin from '@dooksa/create-plugin'
import { action } from '@dooksa/plugins'
import { $seedDatabase, $getDatabaseValue, $deleteDatabaseValue } from './database.js'
import { $setRoute } from './http.js'

const serverAction = createPlugin({
  name: 'action',
  models: { ...action.models },
  setup () {
    $seedDatabase('action-items')
    $seedDatabase('action-blocks')
    $seedDatabase('action-sequences')

    // route: get a list of action sequence entries
    $setRoute('/action', {
      method: 'get',
      middleware: ['request/queryIsArray'],
      handlers: [$getDatabaseValue(['action/items'])]
    })

    // route: delete action sequence entries
    $setRoute('/action', {
      method: 'delete',
      middleware: ['user/auth', 'request/queryIsArray'],
      handlers: [
        $deleteDatabaseValue(['action/items'])
      ]
    })

    // route: get a list of action
    $setRoute('/action/sequence', {
      method: 'get',
      middleware: ['request/queryIsArray'],
      handlers: [
        $getDatabaseValue(['action/sequences'])
      ]
    })

    // route: delete action sequence
    $setRoute('/action/sequence', {
      method: 'delete',
      middleware: ['user/auth', 'request/queryIsArray'],
      handlers: [
        $deleteDatabaseValue(['action/sequences'])
      ]
    })

    // route: get a list of action
    $setRoute('/action/block', {
      method: 'get',
      middleware: ['request/queryIsArray'],
      handlers: [
        $getDatabaseValue(['action/blocks'])
      ]
    })

    // route: delete action
    $setRoute('/action/block', {
      method: 'delete',
      middleware: ['user/auth', 'request/queryIsArray'],
      handlers: [
        $deleteDatabaseValue(['action/blocks'])
      ]
    })
  }
})

export default serverAction
