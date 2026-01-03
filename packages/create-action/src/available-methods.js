/**
 * @typedef {Object} AvailableMethods
 * @description Object mapping of all available action method names to true.
 * Used by parseAction and createAction to identify valid action methods.
 * @property {boolean} action_dispatch - Dispatch an action
 * @property {boolean} action_getValue - Get action value
 * @property {boolean} action_getContextValue - Get action context value
 * @property {boolean} action_getPayloadValue - Get action payload value
 * @property {boolean} variable_getValue - Get variable value
 * @property {boolean} variable_setValue - Set variable value
 * @property {boolean} component_remove - Remove component
 * @property {boolean} component_renderChildren - Render component children
 * @property {boolean} state_addListener - Add state listener
 * @property {boolean} state_deleteListener - Delete state listener
 * @property {boolean} state_deleteValue - Delete state value
 * @property {boolean} state_find - Find state value
 * @property {boolean} state_generateId - Generate state ID
 * @property {boolean} state_getSchema - Get state schema
 * @property {boolean} state_getValue - Get state value
 * @property {boolean} state_setValue - Set state value
 * @property {boolean} editor_getSchema - Get editor schema
 * @property {boolean} icon_render - Render icon
 * @property {boolean} fetch_getAll - Fetch all items
 * @property {boolean} fetch_getById - Fetch by ID
 * @property {boolean} list_filter - Filter list
 * @property {boolean} list_map - Map list
 * @property {boolean} list_indexOf - Get list index
 * @property {boolean} list_push - Push to list
 * @property {boolean} list_sort - Sort list
 * @property {boolean} list_splice - Splice list
 * @property {boolean} operator_compare - Compare values
 * @property {boolean} operator_eval - Evaluate operator
 * @property {boolean} query_fetch - Fetch query
 * @property {boolean} query_filter - Filter query
 * @property {boolean} route_currentId - Get current route ID
 * @property {boolean} route_currentPath - Get current route path
 * @property {boolean} route_navigate - Navigate to route
 * @property {boolean} token_textContent - Token text content
 * @property {boolean} string_replace - Replace string
 * @property {boolean} regex_pattern - Regex pattern
 */

/**
 * Object mapping of all available action method names to true.
 * Used by parseAction and createAction to identify valid action methods.
 *
 * @type {AvailableMethods}
 */
const availableMethods = {
  action_dispatch: true,
  action_getValue: true,
  action_getContextValue: true,
  action_getPayloadValue: true,
  variable_getValue: true,
  variable_setValue: true,
  component_remove: true,
  component_renderChildren: true,
  state_addListener: true,
  state_deleteListener: true,
  state_deleteValue: true,
  state_find: true,
  state_generateId: true,
  state_getSchema: true,
  state_getValue: true,
  state_setValue: true,
  editor_getSchema: true,
  icon_render: true,
  fetch_getAll: true,
  fetch_getById: true,
  list_filter: true,
  list_map: true,
  list_indexOf: true,
  list_push: true,
  list_sort: true,
  list_splice: true,
  operator_compare: true,
  operator_eval: true,
  query_fetch: true,
  query_filter: true,
  route_currentId: true,
  route_currentPath: true,
  route_navigate: true,
  token_textContent: true,
  string_replace: true,
  regex_pattern: true
}

export default availableMethods
