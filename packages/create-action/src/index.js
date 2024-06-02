import parseAction from './parse-action.js'
import availableMethods from './available-methods.js'

/**
 * @typedef {Object} Action
 * @property {ActionDispatch} [action_dispatch]
 * @property {DeleteDataValue} [delete_dataValue]
 * @property {ComponentAppend} [component_append]
 * @property {ComponentAppend} [component_appendTemplate]
 * @property {EvalCondition} [eval_condition]
 * @property {GetActionValue} [get_actionValue]
 * @property {GetBlockValue} [get_blockValue]
 * @property {Action|string[]|string} [get_contextValue]
 * @property {Action|string[]|string} [get_payloadValue]
 * @property {Action|string[]|string} [get_sequenceValue]
 * @property {GetDataValue} [get_dataValue]
 * @property {SetActionValue} [set_actionValue]
 * @property {SetDataValue} [set_dataValue]
 * @property {'$null'} [data_generateId]
 * @property {DataFind} [data_find]
 * @property {FetchGetAll} [fetch_getAll]
 * @property {FetchGetById} [fetch_getById]
 * @property {ListFilter} [list_filter]
 * @property {ListForEach} [list_forEach]
 * @property {ListPush} [list_push]
 * @property {ListSort} [list_sort]
 * @property {ListSplice} [list_splice]
 * @property {OperatorCompare[]} [operator_compare]
 * @property {OperatorEval} [operator_eval]
 * @property {QueryFetch} [query_fetch]
 * @property {QueryFilter} [query_filter]
 * @property {'$null'} [route_currentId]
 * @property {'$null'} [route_currentPath]
 * @property {RouteNavigate} [route_navigate]
 * @property {BootstrapModalCreate} [bootstrap_modalCreate]
 * @property {BootstrapModalShow} [bootstrap_modalShow]
 */

/**
 * @typedef {Object} ComponentAppend
 * @property {Action|string} nodeId
 * @property {Action|string} id
 */

/**
 * @typedef {Object} ActionDispatch
 * @property {Action|string} id
 * @property {Object} [context]
 * @property {Action|string} [context.contentId]
 * @property {Action|string} [context.componentId]
 * @property {Array<Action|string>} [context.components]
 * @property {Action} [payload]
 */

/**
 * @typedef {'action/block'|
 * 'action/items'|
 * 'action/sequences'|
 * 'action/values'|
 * 'content/items'|
 * 'component/items'|
 * 'component/children'|
 * 'component/content'|
 * 'content/items'|
 * 'event/listeners'|
 * 'event/handlers'|
 * 'layout/items'|
 * 'layout/eventListeners'|
 * 'metadata/currentLanguage'|
 * 'metadata/currentLanguages'|
 * 'page/id'|
 * 'page/events'|
 * 'page/items'|
 * 'query/items'|
 * 'query/where'|
 * 'query/sort'} DataCollectionName
 */

/**
 * @typedef {Object} DeleteDataValue
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
 * '~'} Operator
 */

/**
 * @typedef {Object} EvalConditionFrom
 * @property {Operator} op
 * @property {Action|string|number} from
 * @property {Action|string|number} to
 */

/**
 * @typedef {Object} EvalConditionAndOr
 * @property {'&&'|'||'} andOr
 */

/**
 * @typedef {Object} EvalCondition
 * @property {Array<EvalConditionFrom|EvalConditionAndOr>} if
 * @property {number[]} then
 * @property {number[]} else
 */

/**
 * @typedef {Object} GetActionValue
 * @property {Action|string} id
 * @property {Action|string[]|string} [query]
 */

/**
 * @typedef {Object} GetBlockValue
 * @property {Action|string} value
 * @property {Action|string[]|string} query
 */

/**
 * @typedef {Object} GetDataValue
 * @property {Action|DataCollectionName} name
 * @property {Object} [query]
 * @property {Action|string} [query.id]
 * @property {Action|string} [query.prefixId]
 * @property {Action|string} [query.suffixId]
 * @property {Object} [query.options]
 * @property {Action|boolean} [query.options.expand]
 * @property {Object.<string,Action|boolean>} [query.options.expandExclude]
 * @property {Action|boolean} [query.options.expandClone]
 * @property {Action|string[]|string|number[]|number} [query.options.position]
 * @property {Action|boolean} [query.options.clone]
 */

/**
 * @typedef {Object} SetActionValue
 * @property {Action|string} id
 * @property {Action|string} [prefixId]
 * @property {Action|string} [suffixId]
 * @property {Action|string|number|boolean} value
 */

/**
 * @typedef {Object} SetDataValueOptions
 * @property {Action|string} id
 * @property {Action|boolean} stopPropagation
 * @property {Action|boolean} merge
 * @property {Object} update
 * @property {Action[]|string[]|number[]} update.position
 * @property {'push'|'pull'|'pop'|'shift'|'unshift'|'splice'} update.method
 */

/**
 * @typedef {Object} SetDataValue
 * @property {Action|DataCollectionName} name
 * @property {Action|Action[]|string|number|boolean} value
 * @property {SetDataValueOptions} [options]
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
 * @property {Action|boolean} expand
 * @property {Action|number} limit
 * @property {Action|number} page
 * @property {Action|number} perPage
 * @property {Action|boolean} sync
 * @property {Action|string} where
 */

/**
 * @typedef {Object} FetchGetById
 * @property {Action|string} collection
 * @property {Action|string[]} id
 * @property {Action|boolean} expand
 * @property {Action|boolean} sync
 */

/**
 * @typedef {Object} ListFilter
 * @property {Action|Action[]|string[]|number[]} items
 * @property {Object[]} options
 * @property {Action|string} options[].name
 * @property {Action|string|number|boolean} options[].value
 */

/**
 * @typedef {Object} ListForEach
 * @property {Action} items
 * @property {Action|string} actionId
 * @property {Action} [context]
 * @property {Action|boolean} [async]
 */

/**
 * @typedef {Object} ListPush
 * @property {Action|Action[]|string[]|number[]} target
 * @property {Action|string|number} source
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
 * @property {Action|string} name
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

/**
 * @typedef {Object} BootstrapModalCreate
 * @property {Action|string} componentId
 * @property {Object} options
 * @property {Action|boolean|'static'} options.backdrop
 * @property {Action|boolean} focus
 * @property {Action|boolean} keyboard
 */

/**
 * @typedef {Object} BootstrapModalShow
 * @property {Action|string} componentId
 */

/**
 * @param {string} id
 * @param {Action} data
 * @param {Object.<string, boolean>} [availableActions=availableMethods] - Allowed actions
 */
function createAction (id, data, availableActions = availableMethods) {
  const action = parseAction(data, availableActions)

  return {
    id,
    blocks: action.blocks,
    sequences: action.sequences,
    sequenceId: action.sequenceId
  }
}

export {
  createAction,
  availableMethods
}

export default createAction
