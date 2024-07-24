import createPlugin from '@dooksa/create-plugin'
import { compileAction } from '@dooksa/create-action'
import { action, dataSetValue } from '@dooksa/plugins'
import { databaseSeed, databaseGetValue, databaseDeleteValue } from './database.js'
import { httpSetRoute } from './http.js'

const serverAction = createPlugin('action', {
  models: { ...action.models },
  setup ({ actions }) {
    databaseSeed('action-blocks')
    databaseSeed('action-blockSequences')
    databaseSeed('action-sequences')

    if (actions) {
      for (let i = 0; i < actions.length; i++) {
        const action = actions[i]
        const compiledAction = compileAction(action)

        dataSetValue({
          name: 'action/templates',
          value: {
            blocks: action.blocks,
            blockSequences: action.blockSequences,
            sequences: action.sequences
          },
          options: {
            id: action.id
          }
        })

        dataSetValue({
          name: 'action/sequences',
          value: compiledAction.sequences,
          options: {
            id: action.id
          }
        })

        dataSetValue({
          name: 'action/blocks',
          value: compiledAction.blocks,
          options: {
            merge: true
          }
        })

        dataSetValue({
          name: 'action/blockSequences',
          value: compiledAction.blockSequences,
          options: {
            merge: true
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
      path: '/action/block-sequence',
      method: 'get',
      middleware: ['request/queryIsArray'],
      handlers: [databaseGetValue(['action/blockSequences'])]
    })

    // route: delete action sequence entries
    httpSetRoute({
      path: '/action/block-sequence',
      method: 'delete',
      middleware: ['user/auth', 'request/queryIsArray'],
      handlers: [
        databaseDeleteValue(['action/blockSequences'])
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
