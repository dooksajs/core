/**
 * @typedef {Object} ActionBlock
 * @property {string} [key]
 * @property {string} [method]
 * @property {string} [dataType]
 * @property {string} [value]
 * @property {string} [blockValue]
 * @property {string[]} [blockValues]
 */

/**
 * @typedef {Object} Action - Compiled action from createAction
 * @property {string} id
 * @property {Object.<string, ActionBlock>} blocks
 * @property {Object.<string, string[]>} blockSequences
 * @property {string[]} sequences
 * @property {string[]} dependencies
 */

/**
 * @typedef {Object} ActionValue
 * @property {string} [$id]
 * @property {ActionDispatch} [action_dispatch]
 * @property {GetVariableValue} [variable_getValue]
 * @property {GetActionValue} [action_getValue]
 * @property {ActionValue|'id'|'groupId'|'parentId'|'rootId'|'$null'} [action_getContextValue]
 * @property {ActionValue|string[]|string} [action_getPayloadValue]
 * @property {EvalCondition} [action_ifElse]
 * @property {OperatorCompare[]} [action_ifElse]
 * @property {SetActionValue} [variable_setValue]
 * @property {number|string} [$ref]
 * @property {ComponentRemove} [component_remove]
 * @property {ComponentRenderChildren} [component_renderChildren]
 * @property {StateAddListener} [state_addListener]
 * @property {StateAddListener} [state_deleteListener]
 * @property {StateDeleteValue} [state_deleteValue]
 * @property {StateFind} [state_find]
 * @property {'$null'} [state_generateId]
 * @property {StateGetValue} [state_getValue]
 * @property {StateSetValue} [state_setValue]
 * @property {string|ActionValue} [editor_getSchema]
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
 * @property {StringReplace} [string_replace]
 * @property {RegexPattern} [regex_pattern]
 */

/**
 * @typedef {Object} StringReplace
 * @property {ActionValue|string} value - Target string
 * @property {ActionValue|string} pattern - Can be a string or regular expression
 * @property {ActionValue|string} replacement - String that will replace what matches the pattern
 */

/**
 * @typedef {Object} RegexPattern
 * @property {ActionValue|string} pattern - The text of the regular expression. This can also be another RegExp object.
 * @property {ActionValue|string} [flags] - If specified, flags is a string that contains the flags to add. Alternatively, if a RegExp object is supplied for the pattern, the flags string will replace any of that object's flags (and lastIndex will be reset to 0).
 */

/**
 * @typedef {ActionValue|string} IconRender
 */

/**
 * @typedef {Object} ComponentRemove
 * @property {ActionValue|string} id
 */

/**
 * @typedef {Object} ComponentRenderChildren
 * @property {ActionValue|string} id
 * @property {ActionValue|ActionValue[]|string[]} [items]
 */

/**
 * @typedef {Object} ActionDispatchContext
 * @property {ActionValue|string} [id]
 * @property {ActionValue|string} [groupId]
 * @property {ActionValue|string} [parentId]
 * @property {ActionValue|string} [rootId]
 * @property {ActionValue|Array<ActionValue|string>} [components]
 */

/**
 * @typedef {Object} ActionDispatch
 * @property {ActionValue|string} id
 * @property {ActionDispatchContext|ActionValue} [context]
 * @property {ActionValue} [payload]
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
 * @typedef {Object} StateDeleteValue
 * @property {ActionValue|DataCollectionName} name
 * @property {ActionValue|string} id
 * @property {ActionValue|boolean} [cascade]
 * @property {ActionValue|boolean} [listeners]
 */

/**
 * Add data listener
 * @typedef {Object} StateAddListener
 * @property {DataCollectionName} name - Collection name
 * @property {'update'|'delete'} [on='update'] - Fire handler on data event
 * @property {ActionValue|string} [id] - Document Id
 * @property {number} [priority]
 * @property {boolean} [force] - Force the event to fire
 * @property {boolean} [captureAll] - Fire action on all events
 * @property {ActionValue|string} [handlerId=''] - Id of handler
 * @property {ActionValue|string} handler
 */

/**
 * Delete data listener
 * @typedef {Object} StateDeleteListener
 * @property {DataCollectionName} name - Collection name
 * @property {ActionValue|string} [id] - Document Id
 * @property {'update'|'delete'} [on='update'] - Fire handler on data event
 * @property {ActionValue|string} handlerId - The reference handler Id that will be removed
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
 * 'notNull'|
 * 'isNull'|
 * 'typeof' } Operator
 */

/**
 * @typedef {Object} EvalConditionFrom
 * @property {Operator} op
 * @property {ActionValue|string|number} from
 * @property {ActionValue|string|number|boolean} [to]
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
 * @typedef {Object} GetVariableValue
 * @property {ActionValue|string} [scope]
 * @property {ActionValue|string} [prefixId]
 * @property {ActionValue|string} [suffixId]
 * @property {ActionValue|string[]|string} [query]
 */

/**
 * @typedef {Object} GetActionValue
 * @property {ActionValue|string} value
 * @property {ActionValue|string[]|string} query
 */

/**
 * @typedef {Object} StateGetValue
 * @property {ActionValue|DataCollectionName} name
 * @property {ActionValue|string} [id]
 * @property {ActionValue|string} [prefixId]
 * @property {ActionValue|string} [suffixId]
 * @property {Object} [options]
 * @property {ActionValue|boolean} [options.expand]
 * @property {Object.<string,ActionValue|boolean>} [options.expandExclude]
 * @property {ActionValue|boolean} [options.expandClone]
 * @property {ActionValue|string[]|string} [options.position]
 * @property {ActionValue|boolean} [options.clone]
 */

/**
 * @typedef {Object.<string,string|boolean|number|ActionValue>} NestedData
 */

/**
 * @typedef {Object} SetActionValueValues
 * @property {ActionValue|string} id
 * @property {ActionValue|string} [prefixId]
 * @property {ActionValue|string} [suffixId]
 * @property {ActionValue[]|
 * string[]|
 * number[]|
 * boolean[]|
 * NestedData[]|
 * ActionValue|
 * string|
 * number|
 * boolean|
 * NestedData} value
 */

/**
 * @typedef {Object} SetActionValue
 * @property {ActionValue|string} [scope] - ActionValue value ID
 * @property {ActionValue|string} [groupId] - ActionValue value group ID
 * @property {ActionValue|string} [prefixId]
 * @property {ActionValue|string} [suffixId]
 * @property {SetActionValueValues[]} values
 */

/**
 * @typedef {Object} StateSetValueOptions
 * @property {ActionValue|string} id
 * @property {Object} [metadata] - Document metadata
 * @property {ActionValue|boolean} [stopPropagation]
 * @property {ActionValue|boolean} [merge]
 * @property {ActionValue|boolean} [replace]
 * @property {Object} [update]
 * @property {ActionValue[]|string[]|number[]} [update.position]
 * @property {'push'|'pull'|'pop'|'shift'|'unshift'|'splice'} [update.method]
 * @property {ActionValue|number} [update.startIndex] - Zero-based index at which to start changing the array
 * @property {ActionValue|number} [update.deleteCount] - An integer indicating the number of elements in the array to remove from start
 */

/**
 * @typedef {Object} StateSetValue
 * @property {ActionValue|DataCollectionName} name
 * @property {ActionValue|ActionValue[]|string|number|boolean|NestedData} value
 * @property {StateSetValueOptions} [options]
 */

/**
 * @typedef {Object} StateFind
 * @property {ActionValue|DataCollectionName} name
 * @property {Object[]} where
 * @property {ActionValue|string} where[].name
 * @property {Operator} where[].op
 * @property {ActionValue|string|number} where[].value
 * @property {Object[]} where[].and
 * @property {ActionValue|string} where[].and[].name
 * @property {Operator} where[].and[].op
 * @property {ActionValue|string|number} where[].and[].value
 * @property {Object[]} where[].or
 * @property {ActionValue|string} where[].or[].name
 * @property {Operator} where[].or[].op
 * @property {ActionValue|string|number} where[].or[].value
 */

/**
 * @typedef {Object} FetchGetAll
 * @property {ActionValue|string} collection
 * @property {ActionValue|boolean} [expand]
 * @property {ActionValue|number} [limit]
 * @property {ActionValue|number} [page]
 * @property {ActionValue|number} [perPage]
 * @property {ActionValue|boolean} [sync]
 * @property {ActionValue|string} [where]
 */

/**
 * @typedef {Object} FetchGetById
 * @property {ActionValue|string} collection
 * @property {ActionValue|string[]} id
 * @property {ActionValue|boolean} [expand]
 * @property {ActionValue|boolean} [sync]
 */

/**
 * @typedef {Object} ListFilter
 * @property {ActionValue|ActionValue[]|string[]|number[]} items
 * @property {Object[]} options
 * @property {ActionValue|string} options[].name
 * @property {ActionValue|string|number|boolean} options[].value
 */

/**
 * @typedef {Object} ListMap
 * @property {ActionValue} items
 * @property {ActionValue|string} actionId
 * @property {ActionValue|ActionDispatchContext} [context]
 */

/**
 * @typedef {Object} ListPush
 * @property {ActionValue|ActionValue[]|string[]|number[]} target
 * @property {ActionValue|string|number} source
 */

/**
 * @typedef {Object} ListIndexOf
 * @property {ActionValue|ActionValue[]|string[]|number[]} items
 * @property {ActionValue|string|number} value
 */

/**
 * @typedef {Object} ListSort
 * @property {ActionValue|ActionValue[]|string[]|number[]} items
 * @property {'ascending'|'descending'} type
 */

/**
 * @typedef {Object} ListSplice
 * @property {ActionValue|ActionValue[]|string[]|number[]} target
 * @property {ActionValue|string|number|boolean} source
 * @property {ActionValue|number} [start]
 * @property {ActionValue|number} [number]
 */

/**
 * @typedef {Object} OperatorCompare
 * @property {ActionValue|string|number|boolean} value_1
 * @property {ActionValue|string|number|boolean} value_2
 * @property {Operator} op
 */

/**
 * @typedef {Object} OperatorEval
 * @property {ActionValue|Operator} name
 * @property {Array<ActionValue|string|number>} values
 */

/**
 * @typedef {Object} QueryFilter
 * @property {ActionValue|string} id
 * @property {ActionValue|string} componentId
 */

/**
 * @typedef {Object} QueryFetch
 * @property {ActionValue|string} id
 */

/**
 * @typedef {Object} RouteNavigate
 * @property {ActionValue|string} to
 */

/**
 * @typedef {Object} ParseOptions
 * @description Configuration options for parsing action data into block-based format
 * @property {string} prefix - Prefix string for generating unique block IDs
 * @property {number} increment - Incrementing counter for unique block IDs
 */

/**
 * @typedef {Object} BlockReference
 * @description A tuple representing a reference between blocks
 * @property {string} 0 - The ID of the block containing the reference
 * @property {string|number} 1 - The value being referenced (either a block ID or sequence index)
 */

/**
 * @typedef {Object} BlockAccumulator
 * @description Accumulator object for storing parsed blocks during parsing
 * @property {Object.<string, ActionBlock>} blocks - Collection of parsed blocks keyed by unique block ID
 */

/**
 * @typedef {Object} ParseResult
 * @description The complete result of parsing action data into structured blocks
 * @property {string} [id] - The action ID if $id was specified in the input data
 * @property {Object.<string, ActionBlock>} blocks - Object mapping block IDs to block definitions
 * @property {Object.<string, string[]>} blockSequences - Object mapping sequence IDs to arrays of block IDs in execution order
 * @property {BlockReference[]} $refs - Array of block reference tuples for $ref resolution
 * @property {BlockReference[]} $sequenceRefs - Array of sequence reference tuples for $sequenceRef resolution
 */

/**
 * @typedef {Object} ParseContext
 * @description Context object maintaining state during recursive parsing
 * @property {Object.<string, ActionBlock>} blocks - Accumulator for parsed blocks
 * @property {string[]} blockSequences - Array of block IDs in execution order
 * @property {Object.<string, boolean>} methods - Object mapping available action method names to true
 * @property {ParseOptions} uuid - UUID generation state with prefix and increment
 * @property {Object} [parentBlock] - Parent block reference for nesting blocks
 * @property {string} [dataType] - Current data type being processed ('array', 'object', etc.)
 * @property {BlockReference[]} $refs - Array of reference tuples for $ref resolution
 * @property {BlockReference[]} $sequenceRefs - Array of reference tuples for $sequenceRef resolution
 * @property {boolean} isHead - Flag indicating if this is the root-level parse call
 */

/**
 * @typedef {Object} CompileResult
 * @description Result of compiling an action into optimized format
 * @property {string} sequenceId - Hashed ID representing the compiled sequence
 * @property {Object.<string, CompileBlock>} blocks - Collection of compiled blocks keyed by hash
 * @property {Object.<string, string[]>} blockSequences - Collection of compiled block sequences
 * @property {string[]} sequences - Array of sequence IDs in execution order
 */

/**
 * @typedef {Object} CompileBlock
 * @description Block structure used during compilation phase
 * @property {string} [key] - Property name for the block
 * @property {string} [method] - Action method name
 * @property {string} [dataType] - Data type ('array', 'object', etc.)
 * @property {string} [value] - Primitive value
 * @property {string} [blockValue] - Single child block reference
 * @property {string[]} [blockValues] - Array of child block references
 * @property {boolean} [ifElse] - Flag for conditional blocks
 * @property {string} [blockSequence] - Associated block sequence ID
 */
