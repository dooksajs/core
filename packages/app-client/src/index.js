import {
  action,
  content,
  component,
  data,
  event,
  $fetch,
  list,
  metadata,
  operator,
  page,
  query,
  route,
  token
} from '@dooksa/plugins'
import {
  button,
  modal,
  icon,
  text,
  container,
  card,
  link,
  root,
  cardBody,
  cardImg,
  cardTitle
} from '@dooksa/components'
import createApp from '@dooksa/create-app'

export default createApp({
  plugins: [
    data,
    action,
    content,
    component,
    event,
    $fetch,
    list,
    metadata,
    operator,
    route,
    token,
    query,
    page
  ],
  components: [
    root,
    button,
    icon,
    modal,
    text,
    container,
    card,
    cardBody,
    cardImg,
    cardTitle,
    link
  ]
})
