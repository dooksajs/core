import {
  action,
  content,
  data,
  event,
  $fetch,
  layout,
  list,
  metadata,
  operator,
  page,
  query,
  router,
  template,
  token,
  section,
  view,
  widget
} from '@dooksa/plugins'
import {
  button,
  modal,
  icon,
  text,
  container,
  card
} from '@dooksa/components'
import createApp from '@dooksa/create-app'

export default createApp({
  plugins: [
    data,
    action,
    content,
    event,
    $fetch,
    layout,
    list,
    metadata,
    operator,
    router,
    template,
    token,
    query,
    view,
    page,
    section,
    widget
  ],
  components: [
    button,
    icon,
    modal,
    text,
    container,
    card
  ]
})
