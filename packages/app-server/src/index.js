import createApp from '@dooksa/create-app'
import { data } from '@dooksa/plugins'
import {
  $http,
  action,
  database,
  event,
  layout,
  middleware,
  page,
  section,
  template,
  theme,
  user,
  widget
} from '@dooksa/server-plugins'

export default createApp({
  plugins: [
    data,
    middleware,
    $http,
    user,
    action,
    database,
    event,
    layout,
    page,
    section,
    template,
    theme,
    widget
  ]
})
