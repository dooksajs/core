import createPlugin from '@dooksa/create-plugin'
import { component } from '@dooksa/plugins'
import { databaseDeleteValue, databaseGetValue, databaseSeed } from './database.js'
import { httpSetRoute } from './http.js'

const componentServer = createPlugin('component', {
  models: component.models,
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

export default componentServer
