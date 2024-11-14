import { createAppServer } from '@dooksa/create-app'
import clientPlugins, { data } from '@dooksa/plugins'
import actions from '@dooksa/actions'
import {
  $http,
  action,
  metadata,
  database,
  component,
  event,
  middleware,
  page,
  theme,
  user
} from '@dooksa/plugins-server'

export default createAppServer({
  plugins: [
    data,
    middleware,
    $http,
    metadata,
    user,
    database,
    action,
    component,
    event,
    page,
    theme
  ],
  clientPlugins,
  actions
})
