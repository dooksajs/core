import state from './client/state.js'
import editor from './client/editor.js'
import action from './client/action.js'
import component from './client/component.js'
import $fetch from './client/fetch.js'
import metadata from './client/metadata.js'
import list from './client/list.js'
import event from './client/event.js'
import page from './client/page.js'
import operator from './client/operator.js'
import token from './client/token.js'
import query from './client/query.js'
import route from './client/route.js'
import icon from './client/icon.js'
import form from './client/icon.js'
import variable from './client/variable.js'
import string from './client/string.js'
import regex from './client/regex.js'

export * from './client/index.js'

export default [
  state,
  metadata,
  $fetch,
  operator,
  action,
  variable,
  component,
  regex,
  editor,
  list,
  event,
  token,
  icon,
  query,
  route,
  form,
  string,
  page
]
