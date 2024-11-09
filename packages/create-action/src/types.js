
/**
 * @typedef {Object} Action
 * @property {string} [$id]
 * @property {ActionDispatch} [action_dispatch]
 * @property {GetActionValue} [variable_getValue]
 * @property {GetBlockValue} [action_getBlockValue]
 * @property {Action|'id'|'groupId'|'parentId'|'rootId'} [action_getContextValue]
 * @property {Action|string[]|string} [action_getPayloadValue]
 * @property {EvalCondition} [action_ifElse]
 * @property {OperatorCompare[]} [action_ifElse]
 * @property {SetActionValue} [variable_setValue]
 * @property {number|string} [$ref]
 * @property {ComponentRemove} [component_remove]
 * @property {ComponentRenderChildren} [component_renderChildren]
 * @property {DataDeleteValue} [data_deleteValue]
 * @property {DataFind} [data_find]
 * @property {'$null'} [data_generateId]
 * @property {DataGetValue} [data_getValue]
 * @property {DataSetValue} [data_setValue]
 * @property {string|Action} [editor_getSchema]
 * @property {FetchGetAll} [fetch_getAll]
 * @property {FetchGetById} [fetch_getById]
 * @property {IconRender} [icon_render]
 * @property {ListFilter} [list_filter]
 * @property {ListMap} [list_map]
 * @property {ListIndexOf} [list_indexOf]
 * @property {ListPush} [list_push]
 * @property {ListSort} [list_sort]
 * @property {ListSplice} [list_splice]
 * @property {OperatorEval} [operator_eval]
 * @property {QueryFetch} [query_fetch]
 * @property {QueryFilter} [query_filter]
 * @property {'$null'} [route_currentId]
 * @property {'$null'} [route_currentPath]
 * @property {RouteNavigate} [route_navigate]
 */

/**
 * @typedef {Object} IconRender
 * @property {Action|string} componentId
 */

/**
 * @typedef {Object} ComponentRemove
 * @property {Action|string} id
 */

/**
 * @typedef {Object} ComponentRenderChildren
 * @property {Action|string} id
 * @property {Action|Action[]|string[]} [items]
 */

/**
 * @typedef {Object} ActionDispatchContext
 * @property {Action|string} [id]
 * @property {Action|string} [groupId]
 * @property {Action|string} [parentId]
 * @property {Action|string} [rootId]
 * @property {Action|Array<Action|string>} [components]
 */

/**
 * @typedef {Object} ActionDispatch
 * @property {Action|string} id
 * @property {ActionDispatchContext|Action} [context]
 * @property {Action} [payload]
 */

/**
 * @typedef {'action/block'|
* 'action/items'|
* 'action/sequences'|
* 'variable/values'|
* 'data/collections'|
* 'content/items'|
* 'component/nodes'|
* 'component/items'|
* 'component/children'|
* 'component/parents'|
* 'component/properties'|
* 'component/options'|
* 'component/groups'|
* 'component/belongsToGroup'|
* 'component/roots'|
* 'content/items'|
* 'event/listeners'|
* 'event/handlers'|
* 'metadata/currentLanguage'|
* 'metadata/languages'|
* 'metadata/plugins'|
* 'metadata/actions'|
* 'page/id'|
* 'page/events'|
* 'page/items'|
* 'query/items'|
* 'query/where'|
* 'query/sort'} DataCollectionName
*/

/**
* @typedef {Object} DataDeleteValue
* @property {Action|DataCollectionName} name
* @property {Action|string} id
* @property {Action|boolean} [cascade]
* @property {Action|boolean} [listeners]
*/

/**
 * @typedef {'=='|
 * '!='|
 * '>'|
 * '>='|
 * '<'|
 * '<='|
 * '!'|
 * '%'|
 * '++'|
 * '--'|
 * '-'|
 * '+'|
 * '*'|
 * '**'|
 * '!!'|
 * '~'|
 * 'typeof' } Operator
 */

/**
* @typedef {Object} EvalConditionFrom
* @property {Operator} op
* @property {Action|string|number} from
* @property {Action|string|number|boolean} [to]
*/

/**
* @typedef {Object} EvalConditionAndOr
* @property {'&&'|'||'} andOr
*/

/**
* @typedef {Object} EvalConditionRef
* @property {number|string} $sequenceRef
*/

/**
* @typedef {Object} EvalCondition
* @property {Array<EvalConditionFrom|EvalConditionAndOr>} if
* @property {EvalConditionRef[]} then
* @property {EvalConditionRef[]} else
*/

/**
* @typedef {Object} GetActionValue
* @property {Action|string} [scope]
* @property {Action|string} [prefixId]
* @property {Action|string} [suffixId]
* @property {Action|string[]|string} [query]
*/

/**
* @typedef {Object} GetBlockValue
* @property {Action|string} value
* @property {Action|string[]|string} query
*/

/**
* @typedef {Object} DataGetValue
* @property {Action|DataCollectionName} name
* @property {Action|string} [id]
* @property {Action|string} [prefixId]
* @property {Action|string} [suffixId]
* @property {Object} [options]
* @property {Action|boolean} [options.expand]
* @property {Object.<string,Action|boolean>} [options.expandExclude]
* @property {Action|boolean} [options.expandClone]
* @property {Action|string[]|string|number[]|number} [options.position]
* @property {Action|boolean} [options.clone]
*/

/**
* @typedef {Object.<string,string|boolean|number|Action>} NestedData
*/

/**
* @typedef {Object} SetActionValue
* @property {Action|string} [scope] - Action value ID
* @property {Action|string} [groupId] - Action value group ID
* @property {Action|string} [prefixId]
* @property {Action|string} [suffixId]
* @property {Object[]} values
* @property {Action|string} values[].id
* @property {Action|string} [values[].prefixId]
* @property {Action|string} [values[].suffixId]
* @property {Action[]|
* string[]|
* number[]|
* boolean[]|
* NestedData[]|
* Action|
* string|
* number|
* boolean|
* NestedData} values[].value
*/

/**
* @typedef {Object} DataSetValueOptions
* @property {Action|string} id
* @property {Object} [metadata] - Document metadata
* @property {Action|boolean} [stopPropagation]
* @property {Action|boolean} [merge]
* @property {Action|boolean} [replace]
* @property {Object} [update]
* @property {Action[]|string[]|number[]} [update.position]
* @property {'push'|'pull'|'pop'|'shift'|'unshift'|'splice'} [update.method]
* @property {Action|number} [update.startIndex] - Zero-based index at which to start changing the array
* @property {Action|number} [update.deleteCount] - An integer indicating the number of elements in the array to remove from start
*/

/**
* @typedef {Object} DataSetValue
* @property {Action|DataCollectionName} name
* @property {Action|Action[]|string|number|boolean|NestedData} value
* @property {DataSetValueOptions} [options]
*/

/**
* @typedef {Object} DataFind
* @property {Action|DataCollectionName} name
* @property {Object[]} where
* @property {Action|string} where[].name
* @property {Operator} where[].op
* @property {Action|string|number} where[].value
* @property {Object[]} where[].and
* @property {Action|string} where[].and[].name
* @property {Operator} where[].and[].op
* @property {Action|string|number} where[].and[].value
* @property {Object[]} where[].or
* @property {Action|string} where[].or[].name
* @property {Operator} where[].or[].op
* @property {Action|string|number} where[].or[].value
*/

/**
* @typedef {Object} FetchGetAll
* @property {Action|string} collection
* @property {Action|boolean} [expand]
* @property {Action|number} [limit]
* @property {Action|number} [page]
* @property {Action|number} [perPage]
* @property {Action|boolean} [sync]
* @property {Action|string} [where]
*/

/**
* @typedef {Object} FetchGetById
* @property {Action|string} collection
* @property {Action|string[]} id
* @property {Action|boolean} [expand]
* @property {Action|boolean} [sync]
*/

/**
* @typedef {Object} ListFilter
* @property {Action|Action[]|string[]|number[]} items
* @property {Object[]} options
* @property {Action|string} options[].name
* @property {Action|string|number|boolean} options[].value
*/

/**
* @typedef {Object} ListMap
* @property {Action} items
* @property {Action|string} actionId
* @property {ActionDispatchContext} [context]
*/

/**
* @typedef {Object} ListPush
* @property {Action|Action[]|string[]|number[]} target
* @property {Action|string|number} source
*/

/**
* @typedef {Object} ListIndexOf
* @property {Action|Action[]|string[]|number[]} items
* @property {Action|string|number} value
*/

/**
* @typedef {Object} ListSort
* @property {Action|Action[]|string[]|number[]} items
* @property {'ascending'|'descending'} type
*/

/**
* @typedef {Object} ListSplice
* @property {Action|Action[]|string[]|number[]} target
* @property {Action|string|number|boolean} source
* @property {Action|number} [start]
* @property {Action|number} [number]
*/

/**
* @typedef {Object} OperatorCompare
* @property {Action|string|number|boolean} value_1
* @property {Action|string|number|boolean} value_2
* @property {Operator} op
*/

/**
* @typedef {Object} OperatorEval
* @property {Action|'=='|'!='|'>'|'>='|'<'|'<='|'!'|'%'|'++'|'--'|'-'|'+'|'*'|'**'|'!!'|'~'} name
* @property {Array<Action|string|number>} values
*/

/**
* @typedef {Object} QueryFilter
* @property {Action|string} id
* @property {Action|string} componentId
*/

/**
* @typedef {Object} QueryFetch
* @property {Action|string} id
*/

/**
* @typedef {Object} RouteNavigate
* @property {Action|string} to
*/
