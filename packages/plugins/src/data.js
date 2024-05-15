import { createPlugin } from '@dooksa/create'
import { operatorEval, listSplice } from './index.js'
import { DataSchemaException, DataValueException } from './utils/Error.js'
import { deepClone, isServer, uuid } from '@dooksa/utils'
import DataResult from './utils/DataResult.js'

/**
 * @typedef {import('../../global-typedef.js').SetDataOptions} SetDataOptions
 * @typedef {import('../../global-typedef.js').GetDataOptions} GetDataOptions
 * @typedef {import('../../global-typedef.js').DataSchema} DataSchema
 * @typedef {import('../../global-typedef.js').DataWhere} DataWhere
 */


let database = {}
const databaseSchema = {}
const dataListeners = {
  delete: {},
  deletePriority: {},
  update: {},
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
 * Filter data result based on condition
 * @private
 * @param {DataResult} data
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
 * @param {DataResult} data - Data result
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

  if (id) {
    return {
      items: listenerCollection[id],
      priority: listenerPriorityCollection[id]
    }
  }

  return {
    items: listenerCollection,
    priority: listenerPriorityCollection
  }
}

/**
 * Process listeners on update event
 * @private
 * @param {string} name - Collection name
 * @param {'update'|'delete'} on - Event name
 * @param {DataResult} item - Value that is being set
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
      return () => {}
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
function setCollectionItems (data, path, sources, metadata) {
  const schema = databaseSchema[path]
  const schemaType = schema.type

  if (schemaType !== 'object' || schemaType !== 'array') {
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
          setRelation(data.collection, id, schema.options.relation, target._item)
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
      let resultItem = newDataInstance(schemaType)
      let source = deepClone(newDataInstance(schemaType), sources[id])
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

      if (schemaType == 'object') {
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
 * Validate data
 * @private
 * @param {string} collection
 * @param {*} target
 * @param {*} source
 * @param {SetDataOptions} [options]
 * @returns {Object}
 */
function setData (collection, target, source, options) {
  const data = { target, collection }
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
        result.noAffixId = data.noAffixId
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
    result.noAffixId = data.noAffixId
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
    result.noAffixId = collectionId.noAffixId
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
      setCollectionItems(data, schemaPath, { [id]: source }, options.metadata)

      return {
        complete: true,
        isValid: true
      }
    }
  } else {
    if (options.merge) {
      setCollectionItems(data, schemaPath, source, options.metadata)

      return {
        complete: true,
        isValid: true
      }
    }

    // create new id
    const collection = createDefaultCollectionId(data.collection, options)

    data.id = collection.id
    data.noAffixId = collection.noAffixId
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

    // validate source
    if (schemaItem && (updateMethod === 'push' || updateMethod === 'unshift')) {
      const schemaType = schemaItem.type

      if (Array.isArray(source)) {
        for (let i = 0; i < source.length; i++) {
          const item = source[i]

          if (schemaType === 'array' || schemaType === 'object') {
            if (schemaType === 'array') {
              validateSchemaArray(data, schemaPathItem, item)
            } else {
              validateSchemaObject(data, schemaPathItem, item)
            }
          } else {
            validateDataType(schemaPathItem, item, schemaItem.type)
          }
        }
      } else {
        if (schemaType === 'array' || schemaType === 'object') {
          if (schemaType === 'array') {
            validateSchemaArray(data, schemaPathItem, source)
          } else {
            validateSchemaObject(data, schemaPathItem, source)
          }
        } else {
          validateDataType(schemaPathItem, source, schemaItem.type)
        }
      }
    }

    // update target array
    updateArray(targetItem, source, options.update)

    // check schema options of array
    const schema = databaseSchema[schemaPath]

    // ISSUE: containsDuplicates expects an array
    if (schema && schema.options) {
      if (schema.options.uniqueItems) {
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
        setRelation(data.collection, data.id, schema.options.relation, source)
      }

      return {
        complete: true,
        isValid: true
      }
    }
  }

  return {
    isValid: true
  }
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

  if (isServer()) {
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
 * Set the association id
 * @param {string} collection - Primary collection
 * @param {string} docId - Primary id
 * @param {string} refCollection - Foreign collection
 * @param {string} refId - Foreign id
 */
function setRelation (collection, docId, refCollection, refId) {
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

function updateArray (target, source, options) {
  source = Array.isArray(source) ? source : [source]

  switch (options.method) {
    case 'push':
      for (let i = 0; i < source.length; i++) {
        target.push(source[i])
      }

      updateArrayItemFreeze(target, source.length)

      break
    case 'pull':
      for (let i = 0; i < source.length; i++) {
        const value = source[i]
        const index = target.indexOf(value)

        if (index !== -1) {
          target.splice(index, 1)
        }
      }

      break
    case 'pop':
      target.pop()

      break
    case 'shift':
      target.shift()

      break
    case 'unshift':
      for (let i = 0; i < source.length; i++) {
        target.unshift(source[i])
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

      updateArrayItemFreeze(target, source.length)
  }
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
        setRelation(data.collection, data.id, schemaItems.options.relation, item)
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

function validateSchemaObjectPatternProperties (data, properties, propertiesChecked, source, path) {
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
              setRelation(data.collection, data.id, propertyOptions.relation, sourceItem)
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
            setRelation(data.collection, data.id, propertyOptions.relation, value)
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
      setRelation(data.collection, data.id, schema.options.relation, source)
    }
  }
}

/**
 * Generate a unique id
 * @returns {string}
 */
function generateId () {
  return '_' + uuid() + '_'
}

const data = createPlugin({
  name: 'data',
  actions: {
    generateId,
    /**
     * Retrieve all entities from collection
     * @param {Object} param
     * @param {string} param.name - Name of collection
     * @param {DataWhere[]} param.where
     */
    find ({ name, where }) {
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
            const dataResult = new DataResult(name, id)
            let isValid = true

            if (where) {
              for (let i = 0; i < where.length; i++) {
                isValid = filterData(dataResult, where[i])

                if (!isValid) {
                  continue valueLoop
                }
              }
            }

            dataResult.isEmpty = false
            dataResult.item = value._item
            dataResult.metadata = value._metadata
            dataResult.previous = value._previous
            valueItems.push(dataResult)
          }
        }

        return valueItems
      }

      const result = new DataResult(name)
      let isValid = true

      result.isEmpty = false
      result.item = values._item
      result.metadata = values._metadata
      result.previous = values._previous

      if (where) {
        for (let i = 0; i < where.length; i++) {
          isValid = filterData(result, where[i])

          if (!isValid) {
            result.isEmpty = true

            return result
          }
        }
      }

      if (!isValid) {
        result.isEmpty = true

        return result
      }

      return [result]
    },
    /**
     * Set data without schema validation
     * @param {Object} param
     * @param {string} param.name
     * @param {*} param.data
     * @param {Object} param.options
     * @param {string} param.options.id
     * @returns {DataResult}
     */
    unsafeSetData ({ name, data, options }) {
      const result = new DataResult(name, options.id)

      if (options) {
        if (options.id == null) {
          // update collection
          database[name] = data

          result.item = data
        } else {
          result.item = data._item || data

          const value = database[name][options.id] || {}

          database[name][options.id] = {
            _item: data._item || data,
            _metadata: data._metadata || value._metadata || {}
          }
        }
      } else {
        // update collection
        database[name] = data

        result.item = data
      }

      return result
    },
    /**
     * Add data listener
     * @param {string} name - Collection name
     * @param {Object} param
     * @param {'update'|'delete'} param.on - Data event name
     * @param {string} [param.id] - Data collection Id
     * @param {number} [param.priority]
     * @param {boolean} [param.force=false] - Force the event to fire
     * @param {Object} param.handler
     * @param {string} param.handler.id - Id of handler
     * @param {Function|string} param.handler.value - Function or action that will be called
     */
    $addDataListener (name, { on, id, priority, force = false, handler }) {
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

      const handlers = dataHandlers[on][name]

      let handlerId = handler.id

      if (id) {
        handlerId = id + handler.id
      }

      // add listener
      if (!handlers[handlerId]) {
        if (!isNaN(priority)) {
          listeners.items.push({
            force,
            value: handler.value
          })
          handlers[handlerId] = handler.value

          return
        }

        listeners.priority.push({
          force,
          priority,
          value: handler.value
        })

        // sort by acceding order
        listeners.priority.sort((a, b) => a.priority - b.priority)

        handlers[handlerId] = handler.value
      }
    },
    /**
     * Delete data listeners
     * @param {string} name - Data collection name
     * @param {Object} item
     * @param {string} item.on - Data event name
     * @param {string} [item.id] - Data collection Id
     * @param {string} item.handlerId - The reference handler Id that will be removed
     */
    $deleteDataListener (name, { on, id, handlerId }) {
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
    },
    /**
     * Delete data value
     * @param {string} name - Collection name
     * @param {string} id - Document id
     * @param {Object} [options]
     * @param {boolean} [options.cascade] - Delete related data
     * @param {boolean} [options.listeners] - Delete related listeners
     * @returns {Object}
     */
    $deleteDataValue (name, id, { cascade, listeners } = {}) {
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
                $deleteDataValue(splitName[0] + '/' + splitName[1], splitName[2], { cascade })
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
        const result = new DataResult(name, id)

        result.item = collection[id]

        fireDataListeners(name, 'delete', result)

        delete collection[id]
      }

      return {
        inUse: false,
        deleted: true
      }
    },
    /**
     * Get data value
     * @param {string} name - Name of collection
     * @param {GetDataOptions} [param]
     * @returns {DataResult}
     */
    $getDataValue (name, { id, prefixId, suffixId, options } = {}) {
      if (database[name] == null) {
        throw new DataValueException('No such collection "' + name +"'")
      }

      const result = new DataResult(name, id)
      const schema = databaseSchema[name]

      if (schema.type === 'collection' && id == null) {
        result.isEmpty = true

        return result
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

          const value = database[name][itemId]

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

      const relations = databaseRelation[name + '/' + result.id]

      result.isExpandEmpty = !relations

      if (options.expand && relations) {
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
          const value = $getDataValue(name, {
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
                item.item = item.clone()
              }

              result.expandIncluded[name] = result.expand.length
              result.expand.push(item)
            }
          }

          result.expandIncluded[relation] = result.expand.length

          result.expand.push({
            collection: name,
            id: value.id,
            item: !options.expandClone ? value.item : value.clone(),
            metadata: value.metadata
          })
        }
      }

      // return a mutable item
      if (options.clone) {
        result.item = result.clone()
      }

      // return a value from position
      if (Number.isInteger(options.position)) {
        if (result.item[options.position]) {
          result.item = result.item[options.position]
        } else {
          result.isEmpty = true

          return result
        }
      }

      // TODO: create copy (structuredClone) if options.clone is true

      return result
    },
    /**
     * Set data value
     * @param {string} name - Name of collection
     * @param {*} data - Data to be set
     * @param {DsSetDataOptions} [options] - Set data options
     * @returns {DataResult}
     */
    $setDataValue (name, data, options) {
      const schema = databaseSchema[name]

      if (!schema) {
        throw new DataSchemaException({
          schemaPath: name,
          keyword: 'schema',
          message: 'Schema not found'
        })
      }

      if (data == null) {
        throw new DataSchemaException({
          schemaPath: name,
          keyword: 'source',
          message: 'Source was undefined'
        })
      }

      let result = { collection: name }
      let target = database[name]

      if (target == null) {
        // set default value
        target = newDataInstance(schema.type)
      }

      result = setData(
        name,
        target,
        data._item || data,
        options
      )

      // freeze new item
      if (typeof result.item === 'object') {
        Object.freeze(result.item)
      }

      // set new value
      database[name] = result.target

      // notify listeners
      fireDataListeners(name, 'update', result, (options && options.stopPropagation) ?? false)

      return {
        collection: name,
        id: result.id,
        noAffixId: result.noAffixId,
        item: result.item,
        previous: result.previous,
        isValid: true,
        metadata: result.metadata
      }
    },
    /**
     * Add data modal
     * @param {string} namespace
     * @param {*} schema - Result of schema.process
     */
    $setDataModal (namespace, schema) {
      if (!schema) {
        throw new DataSchemaException({
          message: 'Data modal expects schema',
          schemaPath: 'modal',
          keyword: 'modal'
        })
      }

      // set data item schema
      for (let i = 0; i < schema.length; i++) {
        const item = schema[i]

        databaseSchema[item.id] = item.entry
      }

      // listener data type
      let type = 'array'
      if (schema.isCollection) {
        type = 'object'
      }

      // prepare listeners
      dataListeners.delete[namespace] = newDataInstance(type)
      dataListeners.deletePriority[namespace] = newDataInstance(type)
      dataListeners.update[namespace] = newDataInstance(type)
      dataListeners.updatePriority[namespace] = newDataInstance(type)

      // prepare handlers
      dataHandlers.delete[namespace] = {}
      dataHandlers.update[namespace] = {}
    }
  },
  /**
   * Setup database
   * @param {Object} modal
   */
  setup (modal) {
    database = modal.values

    // setup plugin modals
    for (let i = 0; i < modal.schema.length; i++) {
      const { entries, isCollection, name } = modal.schema[i]

      for (let i = 0; i < entries.length; i++) {
        const { id, entry } = entries[i]

        databaseSchema[id] = entry
      }

      // prepare listeners
      let defaultType = 'array'

      if (isCollection) {
        defaultType = 'object'
      }

      dataListeners.delete[name] = newDataInstance(defaultType)
      dataListeners.deletePriority[name] = newDataInstance(defaultType)
      dataListeners.update[name] = newDataInstance(defaultType)
      dataListeners.updatePriority[name] = newDataInstance(defaultType)
      dataHandlers.delete[name] = {}
      dataHandlers.update[name] = {}
    }
  }
})

const dataGenerateId = data.actions.generateId
const dataFind = data.actions.find
const dataUnsafeSetData = data.actions.unsafeSetData
const $setDataValue = data.actions.$setDataValue
const $deleteDataValue = data.actions.$deleteDataValue
const $getDataValue = data.actions.$getDataValue
const $addDataListener = data.actions.$addDataListener
const $deleteDataListener = data.actions.$deleteDataListener
const $setDataModal = data.actions.$setDataModal

export {
  dataGenerateId,
  dataFind,
  dataUnsafeSetData,
  $addDataListener,
  $deleteDataListener,
  $deleteDataValue,
  $getDataValue,
  $setDataValue,
  $setDataModal
}

export default data
