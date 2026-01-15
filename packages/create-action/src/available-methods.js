
/**
 * @typedef {Object} AvailableMethods
 * @description Object mapping of all available action method names to true.
 * Used by parseAction and createAction to identify valid action methods.
 * @property {boolean} action_dispatch - Dispatch an action
 * @property {boolean} action_getContextValue - Get action context value
 * @property {boolean} action_getPayloadValue - Get action payload value
 * @property {boolean} action_getValue - Get action value
 * @property {boolean} action_ifElse - Conditional action
 * @property {boolean} component_remove - Remove component
 * @property {boolean} component_renderChildren - Render component children
 * @property {boolean} editor_getSchema - Get editor schema
 * @property {boolean} api_getAll - Fetch all items
 * @property {boolean} api_getById - Fetch by ID
 * @property {boolean} icon_render - Render icon
 * @property {boolean} list_filter - Filter list
 * @property {boolean} list_indexOf - Get list index
 * @property {boolean} list_map - Map list
 * @property {boolean} list_push - Push to list
 * @property {boolean} list_sort - Sort list
 * @property {boolean} list_splice - Splice list
 * @property {boolean} operator_compare - Compare values
 * @property {boolean} operator_eval - Evaluate operator
 * @property {boolean} page_getItemsByPath - Get page items by path
 * @property {boolean} page_save - Save page
 * @property {boolean} query_fetch - Fetch query
 * @property {boolean} query_filter - Filter query
 * @property {boolean} regex_pattern - Regex pattern
 * @property {boolean} route_currentId - Get current route ID
 * @property {boolean} route_currentPath - Get current route path
 * @property {boolean} route_navigate - Navigate to route
 * @property {boolean} state_addListener - Add state listener
 * @property {boolean} state_deleteListener - Delete state listener
 * @property {boolean} state_deleteValue - Delete state value
 * @property {boolean} state_find - Find state value
 * @property {boolean} state_generateId - Generate state ID
 * @property {boolean} state_getValue - Get state value
 * @property {boolean} state_setValue - Set state value
 * @property {boolean} string_replace - Replace string
 * @property {boolean} token_textContent - Token text content
 * @property {boolean} variable_getValue - Get variable value
 * @property {boolean} variable_setValue - Set variable value
 */

/**
 * Object mapping of all available action method names to true.
 * Used by parseAction and createAction to identify valid action methods.
 *
 * @type {AvailableMethods}
 */
const availableMethods = {
  action_dispatch: true,
  action_getContextValue: true,
  action_getPayloadValue: true,
  action_getValue: true,
  action_ifElse: true,
  component_remove: true,
  component_renderChildren: true,
  editor_getSchema: true,
  api_getAll: true,
  api_getById: true,
  icon_render: true,
  list_filter: true,
  list_indexOf: true,
  list_map: true,
  list_push: true,
  list_sort: true,
  list_splice: true,
  operator_compare: true,
  operator_eval: true,
  page_getItemsByPath: true,
  page_save: true,
  query_fetch: true,
  query_filter: true,
  regex_pattern: true,
  route_currentId: true,
  route_currentPath: true,
  route_navigate: true,
  state_addListener: true,
  state_deleteListener: true,
  state_deleteValue: true,
  state_find: true,
  state_generateId: true,
  state_getValue: true,
  state_setValue: true,
  string_replace: true,
  token_textContent: true,
  variable_getValue: true,
  variable_setValue: true
}

export default availableMethods
