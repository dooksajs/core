import createPlugin from '@dooksa/create-plugin'
import { operatorEval, listSplice, actionDispatch } from './index.js'
import { DataSchemaException, DataValueException } from './utils/Error.js'
import { deepClone, generateId, isEnvServer } from '@dooksa/utils'
import { cloneDataValue, createDataValue } from './utils/createDataValue.js'
import { getValue } from './utils/getValue.js'

/**
 * @import {SetDataOptions, GetDataQuery, GetDataOption, DataSchema, DataWhere} from '../../types.js'
 * @import {DataValue} from './utils/createDataValue.js'
 */

let database = {}
const databaseSchema = {}
const dataListeners = {
  delete: {},
  deleteAll: {},
  deletePriority: {},
  update: {},
  updateAll: {},
  updatePriority: {}
}
const dataHandlers = {
  delete: {},
  update: {}
}
const databaseRelation = {}
const databaseRelationInUse = {}

function arrayHasDuplicates (array) {
  for (let i = 0; i < array.length; i++) {
    const value = array[i]

    if (array.indexOf(value) !== array.lastIndexOf(value)) {
      return true
    }
  }

  return false
}

/**
 * Check if the source exists in the target array
 * @private
 * @param {string} name - Schema path
 * @param {Array} source - Target array
 */
function arrayIsUnique (name, source) {
  const hasDuplicates = arrayHasDuplicates(source)

  if (hasDuplicates) {
    throw new DataSchemaException({
      schemaPath: name,
      keyword: 'uniqueItems',
      message: 'Type error: expected a unique item'
    })
  }
}

/**
 * Create affix
 * @param {Function|string} affix
 * @returns {string}
 */
function createAffix (affix) {
  if (typeof affix === 'function') {
    return affix()
  }

  return affix || ''
}

/**
 * Create collection id
 * @param {string} name - Name of collection
 * @param {*} option
 * @returns {string}
 */
function createCollectionId (name, option) {
  const schema = databaseSchema[name]
  const id = option.id || ''
  let prefix = option.prefixId ?? ''
  let suffix = option.suffixId ?? ''

  if (id) {
    const affixId = id.split('_')

    if (affixId.length === 3 && (affixId[0].length || affixId[2].length)) {
      return id
    }
  }

  if (schema.id) {
    if (!prefix && schema.id.prefix) {
      prefix = createAffix(schema.id.prefix)
    }

    if (!suffix && schema.id.suffix) {
      suffix = createAffix(schema.id.suffix)
    }

    if (!id) {
      if (schema.id.default) {
        return prefix + createAffix(schema.id.default) + suffix
      } else {
        return prefix + generateId() + suffix
      }
    }
  }

  return prefix + id + suffix
}

/**
 * Generate the default id for a collection
 * @private
 * @param {string} name - Collection schema path
 * @param {Object} option - Collection id prefix or suffix options
 * @param {string} [option.prefixId] - Prefix to add to the id
 * @param {string} [option.suffixId] - Suffix to add to the id
 * @returns {Object}
 */
function createDefaultCollectionId (name, option = {}) {
  const schema = databaseSchema[name]
  let prefix = option.prefixId ?? ''
  let suffix = option.suffixId ?? ''

  if (schema.id) {
    if (!prefix && schema.id.prefix) {
      prefix = createAffix(schema.id.prefix)
    }

    if (!suffix && schema.id.suffix) {
      suffix = createAffix(schema.id.suffix)
    }

    if (schema.id.default) {
      const id = createAffix(schema.id.default)

      return {
        id: prefix + id + suffix,
        noAffixId: id
      }
    } else {
      const id = generateId()

      return {
        id: prefix + id + suffix,
        noAffixId: id
      }
    }
  }

  const id = generateId()

  return {
    id: prefix + id + suffix,
    noAffixId: id
  }
}

function createTarget (type, metadata, target) {
  if (target == null) {
    target = {
      _item: newDataInstance(type),
      _metadata: {}
    }
  }

  target._metadata = setMetadata(target._metadata, metadata)

  return target
}

/**
 * Fetch related data
 * @param {string} name - Name of data collection
 * @param {DataValue} result - Data result
 * @param {GetDataOption} [options]
 */
function getExpandedData (name, result, options) {
  const relations = databaseRelation[name + '/' + result.id]

  result.isExpandEmpty = !relations

  if (relations) {
    result.isExpandEmpty = false
    result.expandIncluded = options.expandExclude ?? {}

    for (let i = 0; i < relations.length; i++) {
      const relation = relations[i]

      // prevent duplication and infinite loop
      if (result.expandIncluded[relation] != null) {
        continue
      }

      result.expandIncluded[relation] = true

      const item = relation.split('/')
      const name = item[0] + '/' + item[1]
      const id = item.splice(2).join('/')
      const value = dataGetValue({
        name,
        id,
        options: {
          expand: true,
          expandExclude: result.expandIncluded,
          expandClone: options.expandClone,
          clone: options.expandClone
        }
      })

      if (value.isEmpty) {
        continue
      }

      if (!value.isExpandEmpty) {
        for (let i = 0; i < value.expand.length; i++) {
          const item = value.expand[i]
          const name = item.collection + '/' + item.id

          if (options.expandClone) {
            item.item = cloneDataValue(item.item)
          }

          result.expandIncluded[name] = result.expand.length
          result.expand.push(item)
        }
      }

      result.expandIncluded[relation] = result.expand.length

      const expandedResult = createDataValue(name, value.id)

      expandedResult.item = !options.expandClone ? value.item : cloneDataValue(value)
      expandedResult.metadata = value.metadata

      result.expand.push(expandedResult)
    }
  }
}

/**
 * Filter data result based on condition
 * @private
 * @param {DataValue} data
 * @param {DataWhere} where
 * @returns {boolean}
 */
function filterData (data, where) {
  let isAndValid = false
  let isOrValid = false
  let isValid = false

  if (where.and) {
    for (let i = 0; i < where.and.length; i++) {
      const condition = where.and[i]

      if (condition.and || condition.or) {
        isAndValid = filterData(data, condition)

        if (!isAndValid) {
          break
        }
      }

      isAndValid = filterValidateValue(data, condition)

      if (!isAndValid) {
        break
      }
    }
  }

  if (where.or) {
    for (let i = 0; i < where.or.length; i++) {
      const condition = where.or[i]

      if (condition.and || condition.or) {
        isOrValid = filterData(data, condition)

        if (!isOrValid) {
          break
        }
      }

      isOrValid = filterValidateValue(data, condition)

      if (isOrValid) {
        break
      }
    }
  }

  if (where.name) {
    isValid = filterValidateValue(data, where)
  }

  return (isAndValid || isOrValid || isValid)
}

/**
 * Process where condition
 * @private
 * @param {DataValue} data - Data result
 * @param {DataWhere} condition - Where condition
 * @returns {Boolean}
 */
function filterValidateValue (data, condition) {
  let value

  if (Object.hasOwnProperty.call(data.metadata, condition.name)) {
    value = data.metadata[condition.name]
  } else {
    const properties = condition.name.split('.')

    for (let i = 0; i < properties.length; i++) {
      const property = properties[i]

      if (Object.hasOwnProperty.call(data.item, property)) {
        value = data.item[property]
      } else {
        break
      }
    }
  }

  return operatorEval({
    name: condition.op,
    values: [
      value,
      condition.value
    ]
  })
}

/**
 * Get data listeners
 * @private
 * @param {string} name - Data collection name
 * @param {'update'|'delete'} on - Event name
 * @param {string} id  - Data collection Id
 */
function getDataListeners (name, on, id) {
  const listenerType = dataListeners[on]

  if (!listenerType) {
    throw new Error('Data Listener type does not exist: "' + on + '"')
  }

  const listenerCollection = listenerType[name]

  if (!listenerCollection) {
    throw new Error('Could not find data collection listeners: "' + name + '"')
  }

  const listenerPriorityCollection = dataListeners[on + 'Priority'][name]
  const listenerAllCollection = dataListeners[on + 'All'][name]


  if (id) {
    return {
      all: listenerAllCollection,
      items: listenerCollection[id],
      priority: listenerPriorityCollection[id]
    }
  }

  return {
    all: listenerAllCollection,
    items: listenerCollection,
    priority: listenerPriorityCollection
  }
}

/**
 * Process listeners on update event
 * @private
 * @param {string} name - Collection name
 * @param {'update'|'delete'} on - Event name
 * @param {DataValue} item - Value that is being set
 * @param {boolean} [stopPropagation] - Prevents further propagation of the update event
 */
function fireDataListeners (name, on, item, stopPropagation) {
  const listeners = getDataListeners(name, on, item.id)

  if (listeners.priority) {
    for (let i = 0; i < listeners.priority.length; i++) {
      const handler = listeners.priority[i]

      if (!stopPropagation || handler.force) {
        handler.value(item)
      }
    }
  }

  if (listeners.items) {
    for (let i = 0; i < listeners.items.length; i++) {
      const handler = listeners.items[i]

      if (!stopPropagation || handler.force) {
        handler.value(item)
      }
    }
  }

  if (listeners.all) {
    for (let i = 0; i < listeners.all.length; i++) {
      const handler = listeners.all[i]

      if (!stopPropagation || handler.force) {
        handler.value(item)
      }
    }
  }
}

/**
   * Get new data instance
  * @private
  * @param {string} type - Data type name
  * @returns {Array|Boolean|Function|number|Object|string}
  */
function newDataInstance (type) {
  switch (type) {
    case 'array':
      return new Array()
    case 'boolean':
      return new Boolean().valueOf()
    case 'function':
      return () => {
      }
    case 'node':
      return new Object()
    case 'number':
      return new String().valueOf()
    case 'object':
      return new Object()
    case 'string':
      return new String().valueOf()
  }
}

/**
 * Validate and collection items
 * @param {*} data
 * @param {*} path
 * @param {*} sources
 * @param {*} metadata
 * @returns
 */
function mergeCollectionItems (data, path, sources, metadata) {
  const schema = databaseSchema[path]
  const schemaType = schema.type

  if (schemaType !== 'object' && schemaType !== 'array') {
    for (const id in sources) {
      if (Object.hasOwnProperty.call(sources, id)) {
        const clone = newDataInstance(schema.type)
        const source = deepClone(clone, sources[id], true)
        const target = {
          _item: source._item || source,
          _metadata: source._metadata || metadata
        }

        validateDataType(path, target._item, schemaType)

        if (schema.options && schema.options.relation) {
          addRelation(data.collection, id, schema.options.relation, target._item)
        }

        // store old values
        const previousData = data.target[id]

        if (previousData) {
          target._previous = {
            _item: previousData._item,
            _metadata: previousData._metadata
          }
        }

        data.target[id] = target
      }
    }

    return
  }

  for (const id in sources) {
    if (Object.hasOwnProperty.call(sources, id)) {
      let source = sources[id]
      let resultItem = newDataInstance(schemaType)
      source = deepClone(newDataInstance(schemaType), source)
      const resultMetadata = source._metadata || metadata
      source = source._item || source

      validateDataType(path, source, schemaType)

      // set current merge root id
      data.id = id

      const target = data.target[id]

      // merge target and source objects
      if (target && target._item instanceof Object) {
        deepClone(resultItem, target)
        resultItem = resultItem._item

        if (Array.isArray(resultItem)) {
          resultItem = source
        } else {
          for (const key in source) {
            if (Object.hasOwnProperty.call(source, key)) {
              resultItem[key] = source[key]
            }
          }
        }
      } else {
        resultItem = source
      }

      if (schemaType === 'object') {
        validateSchemaObject(data, path, resultItem)
      } else {
        validateSchemaArray(data, path, resultItem)
      }

      // add new item value
      const result = createTarget(schema.type, resultMetadata)

      result._item = resultItem

      // store old values
      const previousData = data.target[id]

      if (previousData) {
        result._previous = {
          _item: previousData._item,
          _metadata: previousData._metadata
        }
      }

      data.target[id] = result
    }
  }
}

/**
 * Validate and collection items
 * @param {*} data
 * @param {*} path
 * @param {*} sources
 * @param {*} metadata
 * @returns
 */
function replaceCollectionItems (data, path, sources, metadata) {
  const schemaPath = path + '/items'
  const schema = databaseSchema[schemaPath]
  const schemaType = schema.type

  // set values
  for (const id in sources) {
    if (Object.hasOwnProperty.call(sources, id)) {
      const clone = newDataInstance(schemaType)
      const source = deepClone(clone, sources[id], true)
      const target = {
        _item: source._item || source,
        _metadata: source._metadata || metadata || {}
      }

      // validate current value
      validateDataType(schemaPath, target._item, schemaType)

      // validate object source values
      if (schemaType === 'object') {
        validateSchemaObject(data, schemaPath, target._item)
      } else if (schemaType === 'array') {
        validateSchemaArray(data, schemaPath, target._item)
      } else if (schema.options && schema.options.relation) {
        addRelation(data.collection, id, schema.options.relation, target._item)
      }

      data.target[id] = target
    }
  }
}

/**
 * Validate data
 * @private
 * @param {string} collection
 * @param {*} target
 * @param {*} source
 * @param {SetDataOptions} [options]
 * @returns {Object}
 */
function setData (collection, target, source, options) {
  const data = {
    target,
    collection
  }
  const schema = databaseSchema[collection]
  let isValid = true

  if (options) {
    const dataOptions = setDataOptions(data, source, options)

    isValid = dataOptions.isValid

    if (dataOptions.complete) {
      const result = {
        isValid,
        target: data.target
      }

      if (data.id) {
        const value = data.target[data.id]

        result.id = data.id
        result.item = value._item
        result.previous = value._previous
        result.metadata = value._metadata
      }

      return result
    }
  }

  const result = {
    isValid,
    target: data.target
  }

  if (data.id) {
    result.id = data.id
    result.item = data.target[data.id]._item
    result.previous = data.target[data.id]._previous
    result.metadata = data.target[data.id]._metadata
  } else if (schema.type === 'collection') {
    const schemaPath = collection + '/items'
    // create document id
    const collectionId = createDefaultCollectionId(collection)

    // set doc id for relation data
    data.id = collectionId.id

    // validate source
    validateSchema(data, schemaPath, source)

    /** @todo validate *any* until schema supports multi type schema */
    const type = databaseSchema[schemaPath] ? databaseSchema[schemaPath].type : 'object'
    const target = createTarget(type, source._metadata)

    target._item = source._item || source

    // set item in data target
    data.target[collectionId.id] = target

    result.id = collectionId.id
    result.item = target._item
    result.previous = target._previous
    result.metadata = target._metadata
  } else {
    validateSchema(data, collection, source)

    /** @todo validate *any* until schema supports multi type schema */
    const type = databaseSchema[collection] ? databaseSchema[collection].type : 'object'
    const target = createTarget(type, source._metadata)

    target._item = source._item || source

    data.target = target

    result.target = target._item
    result.item = target._item
    result.previous = target._previous
    result.metadata = target._metadata
  }
  return result
}

function setDataOptions (data, source, options) {
  if (Object.hasOwnProperty.call(options, 'id') && options.id == null) {
    throw new DataSchemaException({
      schemaPath: data.collection,
      keyword: 'collection',
      message: 'Expected collection id to be a string but got undefined'
    })
  }

  let schemaPath = data.collection + '/items'
  const schema = databaseSchema[schemaPath]

  // process document id
  if (options.id) {
    const id = createCollectionId(data.collection, options)

    data.id = id

    if (options.merge) {
      const collection = Object.create(null)
      collection[id] = source
      mergeCollectionItems(data, schemaPath, collection, options.metadata)

      return {
        complete: true,
        isValid: true
      }
    } else if (options.replace) {
      const collection = Object.create(null)
      collection[id] = source
      replaceCollectionItems(data, data.collection, collection, options.metadata)

      return {
        complete: true,
        isValid: true
      }
    }
  } else {
    if (options.merge) {
      mergeCollectionItems(data, schemaPath, source, options.metadata)

      return {
        complete: true,
        isValid: true
      }
    } else if (options.replace) {
      replaceCollectionItems(data, data.collection, source, options.metadata)

      return {
        complete: true,
        isValid: true
      }
    }

    // create new id
    const collection = createDefaultCollectionId(data.collection, options)

    data.id = collection.id
  }

  const previousTarget = data.target[data.id]

  // store previous state
  if (previousTarget) {
    const result = createTarget(schema.type, options.metadata, previousTarget)

    previousTarget._previous = {
      _item: previousTarget._item,
      _metadata: previousTarget._metadata
    }

    previousTarget._metadata = result._metadata
  } else {
    data.target[data.id] = createTarget(schema.type, options.metadata)
  }

  // insert new data
  if (!options.update) {
    validateSchema(data, schemaPath, source)

    // add new data entry
    data.target[data.id]._item = source

    return {
      complete: true,
      isValid: true
    }
  }

  const target = data.target[data.id]
  let targetItem = target._item

  // update target position
  if (options.update.position) {
    const length = options.update.position.length - 1
    const lastKey = options.update.position[length]
    let path = schemaPath

    for (let i = 0; i < length; i++) {
      const key = options.update.position[i]
      path = path + '/' + key

      if (!targetItem[key]) {
        throw new DataValueException('Update position does not exist' + options.update.position)
      }

      targetItem = targetItem[key]
    }

    // insert data
    if (!options.update.method) {
      validateSchema(data, path, source)

      targetItem[lastKey] = source

      return {
        complete: true,
        isValid: true
      }
    } else {
      // make a copy for update method
      if (Array.isArray(targetItem[lastKey])) {
        targetItem = targetItem[lastKey].slice()
      } else {
        throw new DataValueException('Update position and update method expected an array')
      }
    }

    schemaPath = path
  }

  if (options.update.method) {
    if (!Array.isArray(targetItem)) {
      throw new DataSchemaException({
        schemaPath,
        keyword: 'updateMethod',
        message: 'Expected target to be an array but found ' + typeof targetItem
      })
    }

    // Clone array if position was not changed
    if (options.update.position == null) {
      data.target[data.id]._item = target._item.slice()
      targetItem = data.target[data.id]._item
    }

    const schemaPathItem = schemaPath + '/items'
    const schemaItem = databaseSchema[schemaPathItem]
    const updateMethod = options.update.method
    let relation

    // validate source
    if (schemaItem) {
      if (schemaItem.options && schemaItem.options.relation) {
        relation = {
          target: data.collection,
          id: data.id,
          source: schemaItem.options.relation
        }
      }

      if (updateMethod === 'push' || updateMethod === 'unshift') {
        if (Array.isArray(source)) {
          for (let i = 0; i < source.length; i++) {
            const item = source[i]

            validateSchema(data, schemaPathItem, item)
          }
        } else {
          validateSchema(data, schemaPathItem, source)
        }
      }
    }

    // update target array
    const result = updateArray(targetItem, source, options.update, relation)

    if (!result.isValid) {
      return result
    }

    // check schema options of array
    const schema = databaseSchema[schemaPath]

    // ISSUE: containsDuplicates expects an array
    if (schema && schema.options) {
      if (schema.options.uniqueItems) {
        // @TODO this is too slow, perhaps use a hash table or use a Map
        const hasDuplicates = arrayHasDuplicates(targetItem)

        if (hasDuplicates) {
          // restore target
          target._item = target._previous._item

          return {
            complete: true,
            isValid: false
          }
        }
      }

      if (schema.options.relation) {
        addRelation(data.collection, data.id, schema.options.relation, source)
      }

      return {
        complete: true,
        isValid: true
      }
    }
  }

  return { isValid: true }
}

function setMetadata (item = {}, options) {
  if (options) {
    // append additional metadata
    for (const key in options) {
      if (Object.hasOwnProperty.call(options, key)) {
        const value = options[key]

        item[key] = value
      }
    }
  }

  if (isEnvServer()) {
    const timestamp = Date.now()

    if (!item.userId && options && options.userId) {
      item.userId = options.userId
    }

    if (!item.createdAt) {
      item.createdAt = timestamp
    }

    item.updatedAt = timestamp
  }

  return item
}

/**
 * Add the association id
 * @param {string} collection - Primary collection
 * @param {string} docId - Primary id
 * @param {string} refCollection - Foreign collection
 * @param {string} refId - Foreign id
 */
function addRelation (collection, docId, refCollection, refId) {
  const name = collection + '/' + docId
  const usedName = refCollection + '/' + refId

  // set what is related to data
  if (!databaseRelation[name]) {
    databaseRelation[name] = [usedName]
  } else if (!databaseRelation[name].includes(usedName)) {
    databaseRelation[name].push(usedName)
  }

  // set where ref data is used
  if (!databaseRelationInUse[usedName]) {
    databaseRelationInUse[usedName] = [name]
  } else if (!databaseRelationInUse[usedName].includes(name)) {
    databaseRelationInUse[usedName].push(name)
  }
}

/**
 * Remove the association id
 * @param {string} collection - Primary collection
 * @param {string} docId - Primary id
 * @param {string} refCollection - Foreign collection
 * @param {string} refId - Foreign id
 */
function removeRelation (collection, docId, refCollection, refId) {
  const name = collection + '/' + docId
  const usedName = refCollection + '/' + refId
  const relation = databaseRelation[name]
  const relationUsedIn = databaseRelationInUse[usedName]

  if (relation) {
    const index = relation.indexOf(usedName)

    if (index != -1) {
      relation.splice(index, 1)
    }

    if (!relation.length) {
      delete databaseRelation[name]
    }
  }

  if (relationUsedIn) {
    const index = relationUsedIn.indexOf(name)

    if (index != -1) {
      relationUsedIn.splice(index, 1)
    }

    if (!relationUsedIn.length) {
      delete databaseRelationInUse[usedName]
    }
  }
}

function updateArray (target, source, options, relation) {
  const result = {
    isValid: true,
    isComplete: false
  }
  source = Array.isArray(source) ? source : [source]

  switch (options.method) {
    case 'push':
      for (let i = 0; i < source.length; i++) {
        const value = source[i]

        target.push(value)

        if (relation) {
          addRelation(relation.target, relation.id, relation.source, value)
        }
      }

      updateArrayItemFreeze(target, source.length)

      break
    case 'pull':
      for (let i = 0; i < source.length; i++) {
        const value = source[i]
        const index = target.indexOf(value)

        if (index !== -1) {
          target.splice(index, 1)

          if (relation) {
            removeRelation(relation.target, relation.id, relation.source, value)
          }
        } else {
          // Did nothing, don't fire update event
          // @TODO Ideally a new property should be used for non events like this
          result.isValid = false
          result.isComplete = true
        }
      }

      break
    case 'pop':
      const value = target.pop()

      if (relation) {
        removeRelation(relation.target, relation.id, relation.source, value)
      }

      break
    case 'shift':
      target.shift()

      break
    case 'unshift':
      for (let i = 0; i < source.length; i++) {
        const value = source[i]

        target.unshift(value)

        if (relation) {
          addRelation(relation.target, relation.id, relation.source, value)
        }
      }

      updateArrayItemFreeze(target, source.length)

      break
    case 'splice':
      listSplice({
        target,
        start: options.startIndex,
        source,
        deleteCount: options.deleteCount
      })

      if (source && relation) {
        for (let i = 0; i < source.length; i++) {
          addRelation(relation.target, relation.id, relation.source, source[i])
        }
      }

      updateArrayItemFreeze(target, source.length)
  }

  return result
}

function updateArrayItemFreeze (items, length) {
  for (let i = items.length - length; i < items.length; i++) {
    const item = items[i]

    if (typeof item === 'object') {
      Object.freeze(item)
    }
  }
}

/**
 * Check data type
 * @private
 * @param {string} path - Schema path
 * @param {*} value - value to be checked
 * @param {string} type - Expected data type
 * @returns {boolean}
 */
function validateDataType (path, value, type) {
  if (value == null) {
    throw new DataSchemaException({
      schemaPath: path,
      keyword: 'type',
      message: 'Unexpected type, expected "' + type + '" but got "undefined"'
    })
  }

  if (type === 'node') {
    if (value.nodeName && Object.isFrozen(value.nodeName)) {
      return true
    }

    throw new DataSchemaException({
      schemaPath: path,
      keyword: 'type',
      message: 'Unexpected type, expected a node'
    })
  }

  // need a better method of determining the data type
  const dataType = value.constructor.name.toLowerCase()

  if (dataType === type) {
    return true
  }

  throw new DataSchemaException({
    schemaPath: path,
    keyword: 'type',
    message: 'Unexpected type, expected "' + type + '" but got "' + dataType + '"'
  })
}

function validateSchemaArray (data, path, source) {
  const schema = databaseSchema[path]

  if (schema.options) {
    validateSchemaArrayOption(path, source)
  }

  // check if source is an array
  validateDataType(schema, source, schema.type)

  const schemaName = path + '/items'
  const schemaItems = databaseSchema[schemaName]

  // no validation
  if (!schemaItems) {
    return
  }

  const schemaType = schemaItems.type

  // freeze array
  Object.freeze(source)

  for (let i = 0; i < source.length; i++) {
    const item = source[i]

    if (schemaType === 'object') {
      validateSchemaObject(data, schemaName, item)
    } else if (schemaType === 'array') {
      validateSchemaArray(data, schemaName, item)
    } else {
      // set relation for array of strings
      if (schemaItems.options && schemaItems.options.relation) {
        addRelation(data.collection, data.id, schemaItems.options.relation, item)
      }

      validateDataType(schemaName, item, schemaItems.type)

      // freeze array item
      if (typeof item === 'object') {
        Object.freeze(item)
      }
    }
  }
}

function validateSchemaArrayOption (path, source) {
  const schema = databaseSchema[path]

  if (schema.options.uniqueItems) {
    arrayIsUnique(path, source)
  }
}

function validateSchemaObject (data, path, source) {
  const schema = databaseSchema[path]

  // no validation
  if (!schema.properties && !schema.patternProperties) {
    return
  }

  if (schema.options) {
    validateSchemaObjectOption(path, source)
  }

  // freeze object
  Object.freeze(source)

  const propertiesChecked = {}

  if (schema.properties) {
    validateSchemaObjectProperties(data, schema.properties, propertiesChecked, source, path)
  }

  if (schema.patternProperties) {
    validateSchemaObjectPatternProperties(data, schema.patternProperties, propertiesChecked, source, path)
  }
}

function validateSchemaObjectOption (path, data) {
  const schema = databaseSchema[path]

  if (schema.options.additionalProperties) {
    const patternProperties = schema.patternProperties || []
    const additionalKeys = []

    for (const key in data) {
      if (Object.hasOwnProperty.call(data, key)) {
        // check if key can exist
        if (!schema.options.additionalProperties.includes(key)) {
          additionalKeys.push(key)
        }
      }
    }

    // check patterned keys
    for (let i = 0; i < patternProperties.length; i++) {
      const property = patternProperties[i]
      const regex = new RegExp(property.name)

      for (let i = 0; i < additionalKeys.length; i++) {
        const key = additionalKeys[i]

        // remove additional key
        if (regex.test(key)) {
          additionalKeys.splice(i, 1)
        }
      }
    }

    if (additionalKeys.length) {
      throw new DataSchemaException({
        schemaPath: path,
        keyword: 'additionalProperties',
        message: 'Additional properties are now allowed ' + JSON.stringify(additionalKeys)
      })
    }
  }
}

function validateSchemaObjectPatternProperties (
  data,
  properties,
  propertiesChecked,
  source,
  path
) {
  for (let i = 0; i < properties.length; i++) {
    const property = properties[i]

    for (const key in source) {
      if (Object.hasOwnProperty.call(source, key)) {
        if (propertiesChecked[key]) {
          continue
        }

        const regex = new RegExp(property.name)

        if (!regex.test(key)) {
          throw new DataSchemaException({
            schemaPath: path,
            keyword: 'patternProperty',
            message: 'Invalid property: ' + key
          })
        }

        const sourceItem = source[key]

        if (sourceItem == null && property.default) {
          // add default value
          if (typeof property.default === 'function') {
            source[key] = property.default()
          } else {
            source[key] = property.default
          }
        } else {
          const schemaName = path + '/' + property.name
          const schema = databaseSchema[schemaName]

          if (schema) {
            const schemaType = schema.type

            validateDataType(schemaName, sourceItem, schemaType)

            if (schemaType === 'object') {
              validateSchemaObject(data, schemaName, sourceItem)
            } else {
              validateSchemaArray(data, schemaName, sourceItem)
            }
          } else {
            const propertyOptions = property.options || {}

            if (propertyOptions.relation) {
              addRelation(data.collection, data.id, propertyOptions.relation, sourceItem)
            }
          }
        }

        validateDataType(path, sourceItem, property.type)
      }
    }
  }
}

function validateSchemaObjectProperties (data, properties, propertiesChecked, source, path) {
  for (let i = 0; i < properties.length; i++) {
    const property = properties[i]
    const propertyOptions = property.options || {}
    const value = source[property.name]

    // check if field is required
    if (propertyOptions.required && value == null) {
      throw new DataSchemaException({
        schemaPath: path,
        keyword: 'required',
        message: 'Invalid data (' + path + '): required property missing: "' + property.name + '"'
      })
    }

    if (value == null && !propertyOptions.default) {
      propertiesChecked[property.name] = true
    } else {
      const sourceItem = source[property.name]

      if (value == null && propertyOptions.default) {
        // add default value
        if (typeof propertyOptions.default === 'function') {
          source[property.name] = propertyOptions.default()
        } else {
          source[property.name] = propertyOptions.default
        }
      } else {
        const schemaName = path + '/' + property.name
        const schema = databaseSchema[schemaName]

        if (schema) {
          const schemaType = schema.type

          validateDataType(schemaName, sourceItem, schemaType)

          if (schemaType === 'object') {
            validateSchemaObject(data, schemaName, sourceItem)
          } else {
            validateSchemaArray(data, schemaName, sourceItem)
          }
        } else {
          if (propertyOptions.relation) {
            addRelation(data.collection, data.id, propertyOptions.relation, value)
          }
        }
      }

      validateDataType(path, sourceItem, property.type)

      propertiesChecked[property.name] = true
    }
  }
}

function validateSchema (data, path, source) {
  const schema = databaseSchema[path]

  /** @todo validate *any* until schema supports multi type schema */
  if (!schema) {
    return
  }
  const schemaType = schema.type

  if (schemaType === 'object') {
    validateSchemaObject(data, path, source)
  } else if (schemaType === 'array') {
    validateSchemaArray(data, path, source)
  } else {
    // type check
    validateDataType(path, source, schema.type)

    if (schema.options && schema.options.relation) {
      addRelation(data.collection, data.id, schema.options.relation, source)
    }
  }
}

export const data = createPlugin('data', {
  metadata: {
    title: 'Data',
    description: 'Dooksa state management system',
    icon: 'mdi:database'
  },
  methods: {
    getSchema (name) {
      return databaseSchema[name]
    },
    /**
     * Set data without schema validation
     * @param {Object} param
     * @param {string} param.name
     * @param {*} param.value
     * @param {Object} [param.options]
     * @param {string} param.options.id
     * @returns {DataValue}
     */
    unsafeSetValue ({ name, value, options }) {
      const result = createDataValue(name, options.id)

      if (options) {
        if (options.id == null) {
          // update collection
          database[name] = value

          result.item = value
        } else {
          result.item = value._item || value

          const data = database[name][options.id] || {}

          database[name][options.id] = {
            _item: value._item || value,
            _metadata: value._metadata || data._metadata || {}
          }
        }
      } else {
        // update collection
        database[name] = value

        result.item = value
      }

      fireDataListeners(name, 'update', result)

      return result
    }
  },
  actions: {
    generateId: {
      metadata: {
        title: 'Generate ID',
        description: 'Create a unique ID',
        icon: 'mdi:identifier'
      },
      method: generateId
    },
    find: {
      metadata: {
        title: 'Find document',
        description: 'Search for instances from a collection',
        icon: 'mdi:search'
      },
      parameters: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            required: true
          },
          where: {
            type: 'array',
            items: {
              type: 'any'
            }
          },
          options: {
            type: 'object',
            properties: {
              expand: {
                type: 'boolean'
              },
              expandClone: {
                type: 'boolean'
              },
              clone: {
                type: 'boolean'
              },
              position: {
                type: 'string'
              }
            }
          }
        }
      },
      /**
       * Retrieve all entities from collection
       * @param {Object} param
       * @param {string} param.name - Name of collection
       * @param {DataWhere[]} [param.where]
       * @param {GetDataOption} [param.options]
       */
      method ({
        name,
        where = [],
        options = {}
      }) {
        const values = database[name]

        if (values == null) {
          throw new DataValueException('No collection found: ' + name)
        }

        const schema = databaseSchema[name]

        if (schema.type === 'collection') {
          const valueItems = []

          valueLoop: for (const id in values) {
            if (Object.hasOwnProperty.call(values, id)) {
              const value = values[id]
              const dataResult = createDataValue(name, id)
              let isValid = true

              for (let i = 0; i < where.length; i++) {
                isValid = filterData(dataResult, where[i])

                if (!isValid) {
                  continue valueLoop
                }
              }

              dataResult.isEmpty = false
              dataResult.item = value._item
              dataResult.metadata = value._metadata
              dataResult.previous = value._previous

              if (options.expand) {
                getExpandedData(name, dataResult, options)
              }

              valueItems.push(dataResult)
            }
          }

          return valueItems
        }

        const result = createDataValue(name)
        let isValid = true

        result.isEmpty = false
        result.item = values._item
        result.metadata = values._metadata
        result.previous = values._previous

        for (let i = 0; i < where.length; i++) {
          isValid = filterData(result, where[i])

          if (!isValid) {
            result.isEmpty = true

            return result
          }
        }

        if (!isValid) {
          result.isEmpty = true

          return result
        }

        return [result]
      }
    },
    addListener: {
      metadata: {
        title: 'Add data listener',
        description: 'Add an action to a data event',
        icon: 'clarity:cursor-hand-click-line'
      },
      parameters: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            required: true
          },
          id: {
            type: 'string',
            required: true
          },
          on: {
            type: 'string',
            required: true
          },
          handler: {
            type: 'string',
            required: true
          },
          handlerId: {
            type: 'string'
          },
          priority: {
            type: 'boolean'
          },
          captureAll: {
            type: 'boolean'
          }
        }
      },
      /**
       * Add data listener
       * @param {Object} param
       * @param {string} param.name - Collection name
       * @param {'update'|'delete'} [param.on='update'] - Data event name
       * @param {string} [param.id] - Data collection Id
       * @param {number} [param.priority]
       * @param {boolean} [param.force] - Force the event to fire
       * @param {boolean} [param.captureAll] - Fire action on all events
       * @param {string} [param.handlerId=''] - Id of handler
       * @param {Function|string} param.handler
       */
      method ({
        name,
        id,
        on = 'update',
        priority,
        force,
        captureAll,
        handler,
        handlerId = generateId()
      }, action) {
        const listeners = getDataListeners(name, on, id)

        // set default listener value
        if (!listeners.items) {
          const priorityKey = on + 'Priority'

          if (id) {
            dataListeners[on][name][id] = []
            dataListeners[priorityKey][name][id] = []

            listeners.items = dataListeners[on][name][id] = []
            listeners.priority = dataListeners[priorityKey][name][id] = []
          } else {
            dataListeners[on][name] = []
            dataListeners[priorityKey][name] = []

            listeners.items = dataListeners[on][name]
            listeners.priority = dataListeners[priorityKey][name]
          }
        }

        if (typeof handler === 'string') {
          const id = handler
          // call action dispatch for actions
          handler = (value) =>{
            actionDispatch({
              id,
              payload: value.item,
              context: action.context
            })
          }
        }

        const handlers = dataHandlers[on][name]

        if (captureAll) {
          listeners.all.push({
            force,
            value: handler
          })

          handlers[handlerId] = handler

          return handlerId
        }

        if (id) {
          handlerId = id + handlerId
        }

        // add listener
        if (!isNaN(priority)) {
          listeners.items.push({
            force,
            value: handler
          })
          handlers[handlerId] = handler


          return handlerId
        }

        listeners.priority.push({
          force,
          priority,
          value: handler
        })

        // sort by acceding order
        listeners.priority.sort((a, b) => a.priority - b.priority)

        handlers[handlerId] = handler

        return handlerId
      }
    },
    deleteListener: {
      metadata: {
        title: 'Delete data listener',
        description: 'Remove action attached to a data event',
        icon: 'mdi:trash'
      },
      parameters: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            required: true
          },
          id: {
            type: 'string',
            required: true
          },
          on: {
            type: 'string',
            required: true
          },
          handlerId: {
            type: 'string',
            required: true
          }
        }
      },
      /**
       * Delete data listeners
       * @param {Object} item
       * @param {string} item.name - Data collection name
       * @param {string} [item.id] - Data collection Id
       * @param {'update'|'delete'} [item.on='update'] - Data event name
       * @param {string} item.handlerId - The reference handler Id that will be removed
       */
      method ({
        name,
        id,
        on = 'update',
        handlerId
      }) {
        const listeners = getDataListeners(name, on, id)

        if (id) {
          handlerId = id + handlerId
        }

        const handler = dataHandlers[on][name][handlerId]
        const handlerIndex = listeners.items.indexOf(handler)
        const handlerPriorityIndex = listeners.priority.indexOf(handler)
        let isHandler = false

        // remove handler
        if (handlerIndex !== -1) {
          listeners.items.splice(handlerIndex, 1)

          isHandler = true
        }

        if (handlerPriorityIndex !== -1) {
          listeners.priority.splice(handlerIndex, 1)

          isHandler = true
        }

        if (isHandler) {
          delete dataHandlers[on][name][handlerId]
        }
      }
    },
    deleteValue: {
      metadata: {
        title: 'Delete value',
        description: 'Delete value from app state',
        icon: 'mdi:trash'
      },
      parameters: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            required: true
          },
          id: {
            type: 'string',
            required: true
          },
          cascade: {
            type: 'boolean'
          },
          listeners: {
            type: 'boolean'
          },
          stopPropagation: {
            type: 'boolean'
          }
        }
      },
      /**
       * Delete data value
       * @param {Object} param
       * @param {string} param.name - Collection name
       * @param {string} param.id - Document id
       * @param {boolean} [param.cascade] - Delete related data
       * @param {boolean} [param.listeners] - Delete related listeners
       * @param {boolean} [param.stopPropagation] - Prevent further event phases
       * @returns {Object}
       */
      method ({
        name,
        id,
        cascade,
        listeners,
        stopPropagation
      }) {
        const collection = database[name]

        if (collection == null) {
          throw new DataSchemaException({
            schemaPath: name,
            keyword: 'schema',
            message: 'Collection not found'
          })
        }

        const relationName = name + '/' + id

        // check if data is in use
        if (databaseRelationInUse[relationName]) {
          return {
            inUse: true,
            deleted: false
          }
        }

        // check if we can clean up related data
        const relations = databaseRelation[relationName]

        if (relations) {
          for (let i = 0; i < relations.length; i++) {
            const usedRelationName = relations[i]
            const usedRelations = databaseRelationInUse[usedRelationName]

            if (usedRelations && usedRelations.length) {
              // remove relationship
              databaseRelationInUse[usedRelationName] = usedRelations.filter(item => item !== relationName)

              // clear up data if not in use
              if (!databaseRelationInUse[usedRelationName].length) {
                const splitName = usedRelationName.split('/')

                delete databaseRelationInUse[usedRelationName]

                if (cascade) {
                  // @ts-ignore
                  this.deleteValue({
                    name: splitName[0] + '/' + splitName[1],
                    id: splitName[2],
                    cascade
                  })
                }

                relations.splice(i, 1)
                i--
              }
            }
          }

          if (!relations.length) {
            delete databaseRelation[relationName]
          }
        }

        if (collection[id]) {
          const result = createDataValue(name, id)

          result.item = collection[id]._item
          result.metadata = collection[id]._metadata

          if (!stopPropagation) {
            fireDataListeners(name, 'delete', result)
          }

          delete collection[id]
        }

        return {
          inUse: false,
          deleted: true
        }
      }
    },
    getValue: {
      metadata: {
        title: 'Get value',
        description: 'Get value from app state',
        icon: 'mdi:application-braces'
      },
      parameters: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            required: true
          },
          id: {
            type: 'string'
          },
          prefixId: {
            type: 'boolean'
          },
          suffixId: {
            type: 'boolean'
          },
          options: {
            type: 'object',
            properties: {
              expand: {
                type: 'boolean'
              },
              expandClone: {
                type: 'boolean'
              },
              clone: {
                type: 'boolean'
              },
              position: {
                type: 'string'
              }
            }
          }
        }
      },
      /**
       * Get data value
       * @param {GetDataQuery} query
       * @returns {DataValue}
       */
      method (query) {
        const { name, id, prefixId, suffixId, options } = query
        const collection = database[name]

        if (collection == null) {
          throw new DataValueException('No such collection "' + name +"'")
        }

        const result = createDataValue(name, id)
        const schema = databaseSchema[name]

        // return collection
        if (schema.type === 'collection') {
          if (!query.hasOwnProperty('id')) {
            result.isEmpty = false
            result.item = collection

            return result
          } else if (id == null) {
            return result
          }
        }

        if (id != null) {
          // find document using custom affixes
          if (prefixId || suffixId) {
            let itemId

            if (prefixId && suffixId) {
              const prefix = createAffix(prefixId)
              const suffix = createAffix(suffixId)

              itemId = prefix + id + suffix
            } else if (prefixId) {
              const prefix = createAffix(prefixId)

              itemId = prefix + id
            } else if (suffixId) {
              const suffix = createAffix(suffixId)

              itemId = id + suffix
            }

            const value = collection[itemId]

            if (value != null) {
              result.isEmpty = false
              result.isAffixEmpty = false
              result.id = itemId
              result.item = value._item
              result.metadata = value._metadata || false

              if (value._previous) {
                result.previous = value._previous
              }
            }
          }

          if (result.isAffixEmpty) {
            let itemId = id

            // find document using default affixes
            if (database[name][id] == null && schema.id) {
              if (schema.id.prefix && schema.id.suffix) {
                const prefix = createAffix(schema.id.prefix)
                const suffix = createAffix(schema.id.suffix)

                itemId = prefix + id + suffix
              } else if (schema.id.prefix) {
                const prefix = createAffix(schema.id.prefix)

                itemId = prefix + id
              } else {
                const suffix = createAffix(schema.id.suffix)

                itemId = id + suffix
              }
            }

            const value = database[name][itemId]

            if (value != null) {
              result.isEmpty = false
              result.isAffixEmpty = false
              result.id = itemId
              result.item = value._item
              result.metadata = value._metadata || {}

              if (value._previous) {
                result.previous = value._previous
              }
            }
          }
        } else {
          result.item = database[name]
        }

        if (result.item == null) {
          return result
        }

        result.isEmpty = false

        if (!options) {
          return result
        }

        if (options.expand) {
          getExpandedData(name, result, options)
        }

        // return a mutable item
        if (options.clone) {
          result.item = cloneDataValue(result.item)
        }

        // return a value from position
        if (options.position) {
          result.item = getValue(result.item, options.position)
        }

        // TODO: create copy (structuredClone) if options.clone is true

        return result
      }
    },
    setValue: {
      metadata: [
        {
          id: 'updateById',
          title: 'Update document by ID',
          description: 'Update a select document',
          icon: 'mdi:content-save-cog',
          component: 'data-set-value-by-id'
        }
      ],
      parameters: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            required: true
          },
          value: {
            type: 'any', // type by reference (this name prop)
            required: true
          },
          options: {
            type: 'object',
            properties: {
              id: {
                type: 'string'
              },
              merge: {
                type: 'boolean'
              },
              stopPropagation: {
                type: 'boolean'
              },
              update: {
                type: 'object',
                properties: {
                  position: {
                    type: 'array',
                    items: {
                      type: 'string'
                    }
                  },
                  method: {
                    type: 'string'
                  },
                  startIndex: {
                    type: 'number'
                  },
                  deleteCount: {
                    type: 'number'
                  }
                }
              }
            }
          }
        }
      },
      /**
       * Set data value
       * @param {Object} param
       * @param {string} param.name - Name of collection
       * @param {*} param.value - Data to be set
       * @param {SetDataOptions} [param.options] - Set data options
       * @returns {DataValue}
       */
      method ({ name, value, options }) {
        const schema = databaseSchema[name]

        if (!schema) {
          throw new DataSchemaException({
            schemaPath: name,
            keyword: 'schema',
            message: 'Schema not found'
          })
        }

        if (value == null) {
          throw new DataSchemaException({
            schemaPath: name,
            keyword: 'source',
            message: 'Source was undefined'
          })
        }

        let result = createDataValue(name)
        let target = database[name]

        if (target == null) {
          // set default value
          target = newDataInstance(schema.type)
        }

        result = setData(
          name,
          target,
          value._item || value,
          options
        )

        if (!result.isValid) {
          return result
        }

        // freeze new item
        if (typeof result.item === 'object') {
          Object.freeze(result.item)
        }

        // set new value
        database[name] = result.target

        const dataResult = createDataValue(name, result.id)

        dataResult.item = result.item
        dataResult.isEmpty = false
        dataResult.previous = result.previous
        dataResult.metadata = result.metadata

        // notify listeners
        fireDataListeners(name, 'update', dataResult, (options && options.stopPropagation) ?? false)

        return dataResult
      }
    }
  },
  /**
   * Setup database
   * @param {Object} model
   */
  setup (model) {
    // set plugin collections
    database = model.values
    // store all collection names
    const collectionName = 'data/collections'
    database[collectionName] = model.names.sort()
    databaseSchema[collectionName] = {
      type: 'array',
      items: { type: 'string' }
    }
    // setup plugin schemas
    for (let i = 0; i < model.schema.length; i++) {
      const schema = model.schema[i]
      const entries = schema.entries
      const isCollection = schema.isCollection
      const name = schema.name

      for (let i = 0; i < entries.length; i++) {
        databaseSchema[entries[i].id] = entries[i].entry
      }

      // prepare listeners
      let defaultType = 'array'

      if (isCollection) {
        defaultType = 'object'
      }

      dataListeners.delete[name] = newDataInstance(defaultType)
      dataListeners.deleteAll[name] = []
      dataListeners.deletePriority[name] = newDataInstance(defaultType)
      dataListeners.update[name] = newDataInstance(defaultType)
      dataListeners.updateAll[name] = []
      dataListeners.updatePriority[name] = newDataInstance(defaultType)
      dataHandlers.delete[name] = {}
      dataHandlers.update[name] = {}
    }
  }
})

export const {
  dataAddListener,
  dataDeleteListener,
  dataDeleteValue,
  dataFind,
  dataGenerateId,
  dataGetSchema,
  dataGetValue,
  dataSetValue,
  dataUnsafeSetValue
} = data

export default data
