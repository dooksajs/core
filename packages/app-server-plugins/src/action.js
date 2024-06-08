import createPlugin from '@dooksa/create-plugin'
import { action, $setDataValue } from '@dooksa/plugins'
import { $seedDatabase, $getDatabaseValue, $deleteDatabaseValue } from './database.js'
import { $setRoute } from './http.js'

const serverAction = createPlugin({
  name: 'action',
  models: { ...action.models },
  setup ({ actions }) {
    $seedDatabase('action-items')
    $seedDatabase('action-blocks')
    $seedDatabase('action-sequences')

    if (actions) {
      for (let i = 0; i < actions.length; i++) {
        const action = actions[i]

        $setDataValue('action/sequences', action.sequences, {
          merge: true
        })

        $setDataValue('action/blocks', action.blocks, {
          merge: true
        })

        $setDataValue('action/items', action.items, {
          id: action.id
        })

        for (let i = 0; i < action.dependencies.length; i++) {
          $setDataValue('action/dependencies', action.dependencies[i], {
            id: action.id,
            update: {
              method: 'push'
            }
          })
        }
      }
    }

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
