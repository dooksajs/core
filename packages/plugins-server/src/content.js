import createPlugin from '@dooksa/create-plugin'
import { content } from '@dooksa/plugins'
import { databaseDeleteValue, databaseGetValue, databaseSeed } from './database.js'
import { httpSetRoute } from './http.js'

const contentServer = createPlugin('content', {
  models: content.models,
  setup () {
    databaseSeed('content-items')

    // route: get a list of component
    httpSetRoute({
      path: '/content',
      method: 'get',
      middleware: ['request/queryIsArray'],
      handlers: [
        databaseGetValue(['content/items'])
      ]
    })

    // route: delete component
    httpSetRoute({
      path: '/content',
      method: 'delete',
      middleware: ['user/auth', 'request/queryIsArray'],
      handlers: [
        databaseDeleteValue(['content/items'])
      ]
    })
  }
})

export default contentServer
