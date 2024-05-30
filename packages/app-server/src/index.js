import createApp from '@dooksa/create-app'
import { data } from '@dooksa/plugins'
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
  user,
  content
} from '@dooksa/server-plugins'

export default createApp({
  plugins: [
    data,
    middleware,
    $http,
    metadata,
    user,
    database,
    content,
    action,
    component,
    event,
    page,
    theme
  ]
})
