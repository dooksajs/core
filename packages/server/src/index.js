import { createApp } from '@dooksa/create'
import { data } from '@dooksa/plugins'
import {
  $http,
  action,
  component,
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
} from '../../server-plugins/src/index.js'

export default createApp([
  data,
  middleware,
  $http,
  user,
  component,
  action,
  database,
  event,
  layout,
  page,
  section,
  template,
  theme,
  widget
])
