import createPlugin from '@dooksa/create-plugin'
import { component as componentClient } from '../client/index.js'
import { databaseDeleteValue, databaseGetValue, databaseSeed } from './database.js'
import { httpSetRoute } from './http.js'

export const component = createPlugin('component', {
  models: componentClient.models,
  setup () {
    databaseSeed('component-items')
    databaseSeed('component-children')
    databaseSeed('component-content')

    // route: get a list of component
    httpSetRoute({
      path: '/component',
      method: 'get',
      middleware: ['request/queryIsArray'],
      handlers: [
        databaseGetValue(['component/items'])
      ]
    })

    // route: delete component
    httpSetRoute({
      path: '/component',
      method: 'delete',
      middleware: ['user/auth', 'request/queryIsArray'],
      handlers: [
        databaseDeleteValue(['component/items'])
      ]
    })
  }
})

export default component
