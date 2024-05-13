import { createApp } from '@dooksa/create'
import { data } from '@dooksa/plugins'
import {
  $http,
  component,
  action,
  database,
  event,
  middleware,
  page,
  section,
  template,
  layout,
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