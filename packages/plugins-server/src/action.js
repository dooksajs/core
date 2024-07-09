import createPlugin from '@dooksa/create-plugin'
import { action, dataSetValue } from '@dooksa/plugins'
import { databaseSeed, databaseGetValue, databaseDeleteValue } from './database.js'
import { httpSetRoute } from './http.js'

const serverAction = createPlugin('action', {
  models: { ...action.models },
  setup ({ actions }) {
    databaseSeed('action-items')
    databaseSeed('action-blocks')
    databaseSeed('action-sequences')

    if (actions) {
      for (let i = 0; i < actions.length; i++) {
        const action = actions[i]

        dataSetValue({
          name: 'action/sequences',
          value: action.sequences,
          options: {
            merge: true
          }
        })

        dataSetValue({
          name: 'action/blocks',
          value: action.blocks,
          options: {
            merge: true
          }
        })

        dataSetValue({
          name: 'action/items',
          value: action.items,
          options: {
            id: action.id
          }
        })

        for (let i = 0; i < action.dependencies.length; i++) {
          dataSetValue({
            name: 'action/dependencies',
            value: action.dependencies[i],
            options: {
              id: action.id,
              update: {
                method: 'push'
              }
            }
          })
        }
      }
    }

    // route: get a list of action sequence entries
    httpSetRoute({
      path: '/action',
      method: 'get',
      middleware: ['request/queryIsArray'],
      handlers: [databaseGetValue(['action/items'])]
    })

    // route: delete action sequence entries
    httpSetRoute({
      path: '/action',
      method: 'delete',
      middleware: ['user/auth', 'request/queryIsArray'],
      handlers: [
        databaseDeleteValue(['action/items'])
      ]
    })

    // route: get a list of action
    httpSetRoute({
      path: '/action/sequence',
      method: 'get',
      middleware: ['request/queryIsArray'],
      handlers: [
        databaseGetValue(['action/sequences'])
      ]
    })

    // route: delete action sequence
    httpSetRoute({
      path: '/action/sequence',
      method: 'delete',
      middleware: ['user/auth', 'request/queryIsArray'],
      handlers: [
        databaseDeleteValue(['action/sequences'])
      ]
    })

    // route: get a list of action
    httpSetRoute({
      path: '/action/block',
      method: 'get',
      middleware: ['request/queryIsArray'],
      handlers: [
        databaseGetValue(['action/blocks'])
      ]
    })

    // route: delete action
    httpSetRoute({
      path: '/action/block',
      method: 'delete',
      middleware: ['user/auth', 'request/queryIsArray'],
      handlers: [
        databaseDeleteValue(['action/blocks'])
      ]
    })
  }
})

export default serverAction
