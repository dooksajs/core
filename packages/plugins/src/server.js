import $http from './server/http.js'
import middleware from './server/middleware.js'
import action from './server/action.js'
import metadata from './server/metadata.js'
import database from './server/database.js'
import component from './server/component.js'
import event from './server/event.js'
import page from './server/page.js'
import theme from './server/theme.js'
import user from './server/user.js'

export * from './server/index.js'

export default [
  $http,
  middleware,
  database,
  metadata,
  user,
  action,
  component,
  event,
  page,
  theme
]
