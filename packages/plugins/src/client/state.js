import { createPlugin } from '@dooksa/create-plugin'
import { operatorEval, listSplice, actionDispatch } from '#client'
import { DataSchemaException, DataValueException } from '../utils/error.js'
import { deepClone, generateId, isEnvServer, getValue, shallowCopy } from '@dooksa/utils'
import { createDataValue } from '../utils/data-value.js'

/**
 * @import {SetDataOptions, GetDataQuery, GetDataOption, DataWhere, DataDeleteValueResult, DataListenerHandler, DataListenerCollection} from '../../../types.js'
 * @import {DataValue, DataMetadata, DataTarget} from '../utils/data-value.js'
 * @import {DsPluginStateExport, SchemaEntry} from '@dooksa/create-plugin/types'
 */

/**
 * Determines if an array contains duplicate values.
 *
 * @param {Array} array - The array to check for duplicates.
 * @returns {boolean} - Returns true if there are duplicates, otherwise false.
 */
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
    throw DataSchemaException.uniqueItems(name)
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

export const state = createPlugin('state', {
  metadata: {
    description: 'Dooksa state management system',
    icon: 'mdi:database',
    title: 'Data'
  },
  data: {
    handlerOnUpdate: {},
    handlers: {
      delete: {},
      update: {}
    },
    listeners: {
      delete: {
        all: {},
        items: {},
        priority: {}
      },
      update: {
        all: {},
        items: {},
        priority: {}
      }
    },
    relations: {},
    relationsInUse: {},
    schema: {},
    values: {}
  },
  privateMethods: {
    /**
     * Creates an affix string from a function or string value.
     * @param {Function|string} affix - The affix value or function to generate it
     * @returns {string} The generated affix string
     */
    createAffix (affix) {
      if (typeof affix === 'function') {
        return affix()
      }

      return affix || ''
    },
    /**
     * Creates a collection ID with optional prefix and suffix.
     * @param {string} name - Name of collection
     * @param {Object} option - Options for ID generation
     * @param {string} [option.id] - Custom ID to use
     * @param {string} [option.prefixId] - Prefix to add to the ID
     * @param {string} [option.suffixId] - Suffix to add to the ID
     * @returns {string} The generated collection ID
     */
    createCollectionId (name, option) {
      const schema = this.getSchema(name)
      const id = option.id || ''
      let prefix = option.prefixId ?? ''
      let suffix = option.suffixId ?? ''

      if (id) {
        const affixId = id.split('_', 3)

        // check if ID has both affixes
        if (affixId.length === 3 && (affixId[0].length || affixId[2].length)) {
          return id
        }
      }

      if (schema.id) {
        if (!prefix && schema.id.prefix) {
          prefix = this.createAffix(schema.id.prefix)
        }

        if (!suffix && schema.id.suffix) {
          suffix = this.createAffix(schema.id.suffix)
        }

        if (!id) {
          if (schema.id.default) {
            return prefix + this.createAffix(schema.id.default) + suffix
          } else {
            return prefix + generateId() + suffix
          }
        }
      }

      return prefix + id + suffix
    },
    /**
     * Generate the default id for a collection
     * @private
     * @param {string} name - Collection schema path
     * @param {Object} option - Collection id prefix or suffix options
     * @param {string} [option.prefixId] - Prefix to add to the id
     * @param {string} [option.suffixId] - Suffix to add to the id
     * @returns {Object}
     */
    createDefaultCollectionId (name, option = {}) {
      const schema = this.getSchema(name)
      let prefix = option.prefixId ?? ''
      let suffix = option.suffixId ?? ''

      if (schema.id) {
        if (!prefix && schema.id.prefix) {
          prefix = this.createAffix(schema.id.prefix)
        }

        if (!suffix && schema.id.suffix) {
          suffix = this.createAffix(schema.id.suffix)
        }

        if (schema.id.default) {
          const id = this.createAffix(schema.id.default)

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
    },
    /**
     * Creates a data target object with metadata.
     * @param {string} type - The data type for the target item
     * @param {Object} metadata - Metadata to set on the target
     * @param {DataTarget} [target] - Optional existing target to update
     * @returns {DataTarget} The created or updated target object
     */
    createTarget (type, metadata, target) {
      if (target == null) {
        target = {
          _item: newDataInstance(type),
          _metadata: {}
        }
      }

      target._metadata = this.setMetadata(target._metadata, metadata)

      return target
    },
    /**
     * Filter data result based on condition
     * @private
     * @param {DataValue} data
     * @param {DataWhere} where
     * @returns {boolean}
     */
    filterData (data, where) {
      let isAndValid = false
      let isOrValid = false
      let isValid = false

      if (where.and) {
        for (let i = 0; i < where.and.length; i++) {
          const condition = where.and[i]

          if (condition.and || condition.or) {
            isAndValid = this.filterData(data, condition)

            if (!isAndValid) {
              break
            }
          }

          isAndValid = this.filterValidateValue(data, condition)

          if (!isAndValid) {
            break
          }
        }
      }

      if (where.or) {
        for (let i = 0; i < where.or.length; i++) {
          const condition = where.or[i]

          if (condition.and || condition.or) {
            isOrValid = this.filterData(data, condition)

            if (!isOrValid) {
              break
            }
          }

          isOrValid = this.filterValidateValue(data, condition)

          if (isOrValid) {
            break
          }
        }
      }

      if (where.name) {
        isValid = this.filterValidateValue(data, where)
      }

      return (isAndValid || isOrValid || isValid)
    },
    /**
     * Process where condition
     * @private
     * @param {DataValue} data - Data result
     * @param {DataWhere} condition - Where condition
     * @returns {Boolean}
     */
    filterValidateValue (data, condition) {
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
    },
    /**
     * Replaces collection items with new data.
     * @param {Object} data - The data object containing target and collection info
     * @param {string} path - Schema path for the collection
     * @param {Object} sources - Object containing items to replace with
     * @param {Object} metadata - Metadata to apply to new items
     */
    replaceCollectionItems (data, path, sources, metadata) {
      const schemaPath = path + '/items'
      const schema = this.getSchema(schemaPath)
      const schemaType = schema.type

      // set values
      for (const id in sources) {
        if (Object.hasOwnProperty.call(sources, id)) {
          const clone = newDataInstance(schemaType)
          const source = deepClone(sources[id], true)
          const target = {
            _item: source._item || source,
            _metadata: source._metadata || metadata || {}
          }

          // validate current value
          this.validateDataType(data, schemaPath, target._item, schemaType)

          if (schema.options && schema.options.relation) {
            this.addRelation(data.collection, id, schema.options.relation, target._item)
          }

          data.target[id] = target
        }
      }
    },
    /**
     * Validate data
     * @private
     * @param {string} collection
     * @param {*} target
     * @param {*} source
     * @param {SetDataOptions} [options]
     * @returns {Object}
     */
    setData (collection, target, source, options) {
      const data = {
        target,
        collection
      }
      const schema = this.getSchema(collection)
      let isValid = true

      if (options) {
        const dataOptions = this.setDataOptions(data, source, options)

        isValid = dataOptions.isValid

        if (dataOptions.complete) {
          let value = data.target
          const result = {
            isValid,
            target: value
          }

          if (data.id) {
            value = data.target[data.id]

            result.id = data.id
          }

          result.item = value._item
          result.previous = value._previous
          result.metadata = this.setMetadata(value._metadata, options.metadata)

          return result
        }
      }

      const result = {
        isValid,
        target: data.target
      }

      if (data.id && data.target[data.id]) {
        const target = data.target[data.id]

        result.id = data.id
        result.item = target._item
        result.previous = target._previous
        result.metadata = this.setMetadata(target._metadata, options.metadata)
      } else if (schema.type === 'collection') {
        const schemaPath = collection + '/items'
        // create document id
        const collectionId = this.createDefaultCollectionId(collection)

        // set doc id for relation data
        data.id = collectionId.id

        // validate source
        this.validateSchema(data, schemaPath, source)

        const schema = this.getSchema(schemaPath)
        /** @todo validate *any* until schema supports multi type schema */
        const type = schema ? schema.type : 'object'
        const target = this.createTarget(type, source._metadata)

        target._item = source._item || source

        // set item in data target
        data.target[collectionId.id] = target

        result.id = collectionId.id
        result.item = target._item
        result.previous = target._previous
        result.metadata = target._metadata
      } else {
        this.validateSchema(data, collection, source)

        const schema = this.getSchema(collection)
        /** @todo validate *any* until schema supports multi type schema */
        const type = schema ? schema.type : 'object'
        const target = this.createTarget(type, source._metadata)

        target._item = source._item || source

        data.target = target

        result.target = target
        result.item = target._item
        result.metadata = target._metadata

        if (target._previous) {
          result.previous = target._previous
        }
      }
      return result
    },
    /**
     * Set DataMetadata to target.
     * @param {DataMetadata|Object} [item={}] - The item to set metadata for.
     * @param {Object} [options={}] - Additional metadata options.
     * @returns {DataMetadata}
     */
    setMetadata (item = {}, options) {
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
        /** @TODO need to store nano time */
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
    },
    /**
     * Updates an array with various operations (push, pull, pop, shift, unshift, splice).
     * @param {Array} target - The target array to update
     * @param {Array|*} source - Source data for the operation
     * @param {Object} options - Update options
     * @param {string} options.method - The operation method
     * @param {number} [options.startIndex] - Start index for splice
     * @param {number} [options.deleteCount] - Number of items to delete for splice
     * @param {Object} [relation] - Relation information
     * @param {string} relation.target - Target collection
     * @param {string} relation.id - Target ID
     * @param {string} relation.source - Source collection
     * @returns {Object} Result with isValid and isComplete flags
     */
    updateArray (target, source, options, relation) {
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
              this.addRelation(relation.target, relation.id, relation.source, value)
            }
          }

          this.updateArrayItemFreeze(target, source.length)

          break
        case 'pull':
          for (let i = 0; i < source.length; i++) {
            const value = source[i]
            const index = target.indexOf(value)

            if (index !== -1) {
              target.splice(index, 1)

              if (relation) {
                this.removeRelation(relation.target, relation.id, relation.source, value)
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
            this.removeRelation(relation.target, relation.id, relation.source, value)
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
              this.addRelation(relation.target, relation.id, relation.source, value)
            }
          }

          this.updateArrayItemFreeze(target, source.length)

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
              this.addRelation(relation.target, relation.id, relation.source, source[i])
            }
          }

          this.updateArrayItemFreeze(target, source.length)
      }

      return result
    },
    /**
     * Freezes newly added array items to make them immutable.
     * @param {Array} items - The array containing items to freeze
     * @param {number} length - Number of items from the end to freeze
     */
    updateArrayItemFreeze (items, length) {
      for (let i = items.length - length; i < items.length; i++) {
        const item = items[i]

        if (typeof item === 'object') {
          Object.freeze(item)
        }
      }
    },
    /**
     * Check data type
     * @private
     * @param {*} data - Schema path
     * @param {string} path - Schema path
     * @param {*} value - value to be checked
     * @param {string} type - Expected data type
     */
    validateDataType (data, path, value, type) {
      if (type === 'object') {
        this.validateSchemaObject(data, path, value)
        return true
      } else if (type === 'array') {
        this.validateSchemaArray(data, path, value)
        return true
      }

      if (value == null) {
        throw DataSchemaException.typeMismatch(path, type, value)
      }

      if (type === 'node') {
        if (value.nodeName && Object.isFrozen(value.nodeName)) {
          return true
        }

        throw new DataSchemaException({
          schemaPath: path,
          keyword: 'type',
          message: 'Unexpected type, expected a node',
          code: 'TYPE_MISMATCH',
          expected: 'node',
          actual: typeof value
        })
      }

      /**
       * @TODO extend type checker for more types
       */
      const dataType = typeof value

      if (typeof value === type) {
        return true
      }

      throw DataSchemaException.typeMismatch(path, type, value)
    },
    validateSchemaArray (data, path, source) {
      const schema = this.getSchema(path)

      if (schema.options) {
        this.validateSchemaArrayOption(path, source)
      }

      // check if source is an array
      if (!Array.isArray(source)) {
        throw new DataSchemaException({
          schemaPath: path,
          keyword: 'type',
          message: 'Unexpected type, expected "array" but got "'+ typeof source +'"'
        })
      }

      const schemaName = path + '/items'
      const schemaItems = this.getSchema(schemaName)

      // no validation
      if (!schemaItems) {
        return
      }

      // freeze array
      Object.freeze(source)

      for (let i = 0; i < source.length; i++) {
        const item = source[i]

        // set relation for array of strings
        if (schemaItems.options && schemaItems.options.relation) {
          this.addRelation(data.collection, data.id, schemaItems.options.relation, item)
        }

        this.validateDataType(data, schemaName, item, schemaItems.type)
      }
    },
    validateSchemaArrayOption (path, source) {
      const schema = this.getSchema(path)

      if (schema.options.uniqueItems) {
        arrayIsUnique(path, source)
      }
    },
    validateSchemaObject (data, path, source) {
      const schema = this.getSchema(path)

      // no validation
      if (!schema.properties && !schema.patternProperties) {
        return true
      }

      if (schema.options) {
        this.validateSchemaObjectOption(path, source)
      }

      // freeze object
      Object.freeze(source)

      if (schema.properties || schema.patternProperties) {
        this.validateSchemaObjectProperties(data, schema.properties, schema.patternProperties, source, path)
      }
    },
    validateSchemaObjectOption (path, data) {
      const schema = this.getSchema(path)

      if (schema.options.additionalProperties === false) {
        if (!schema.patternProperties) {
          for (const key in data) {
            if (Object.hasOwnProperty.call(data, key)) {
              // check if key is additional
              if (!schema.options.allowedProperties[key]) {
                throw new DataSchemaException({
                  schemaPath: path,
                  keyword: 'additionalProperties',
                  message: 'Additional properties are now allowed "' + key + '"'
                })
              }
            }
          }
        } else {
          const patternProperties = schema.patternProperties
          const additionalKeys = []

          for (const key in data) {
            if (Object.hasOwnProperty.call(data, key)) {
              // check if key is additional
              if (!schema.options.allowedProperties[key]) {
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
              message: 'Additional properties are now allowed "' + JSON.stringify(additionalKeys) +'"'
            })
          }
        }
      }
    },
    validateSchemaObjectProperty (data, property, name, source, path) {
      const options = property.options || {}
      const value = source[name]

      if (value == null) {
        if (!options.default) {
          return
        } else {
          // add default value
          if (typeof options.default === 'function') {
            source[name] = options.default()
          } else {
            source[name] = deepClone(options.default, true)
          }

          return
        }
      }

      let schemaName = path + '/' + property.name
      const schema = this.getSchema(schemaName)
      let schemaType = property.type

      if (!schema) {
        schemaName = path
      } else {
        schemaType = schema.type
      }

      this.validateDataType(data, schemaName, value, schemaType)

      if (options.relation) {
        this.addRelation(data.collection, data.id, options.relation, value)
      }
    },
    validateSchemaObjectProperties (data, properties = [], patternProperties = [], source, path) {
      const checkedProperties = {}

      for (let i = 0; i < properties.length; i++) {
        const property = properties[i]
        const name = property.name

        // check if field is required
        if (source[name] == null && property.required) {
          throw new DataSchemaException({
            schemaPath: path,
            keyword: 'required',
            message: 'Invalid data (' + path + '): required property missing: "' + name + '"'
          })
        }

        this.validateSchemaObjectProperty(
          data,
          property,
          name,
          source,
          path
        )

        checkedProperties[name] = true
      }

      for (let i = 0; i < patternProperties.length; i++) {
        const property = patternProperties[i]
        const patternedProperty = new RegExp(property.name)

        for (const name in source) {
          if (Object.prototype.hasOwnProperty.call(source, name)) {
            if (checkedProperties[name]) {
              continue
            }

            if (!patternedProperty.test(name)) {
              throw new DataSchemaException({
                schemaPath: path,
                keyword: 'patternProperty',
                message: 'Invalid property: ' + name
              })
            }

            this.validateSchemaObjectProperty(
              data,
              property,
              name,
              source,
              path
            )
          }
        }
      }
    },
    validateSchema (data, path, source) {
      const schema = this.getSchema(path)

      /** @TODO validate *any* until schema supports multi type schema */
      if (!schema) {
        return
      }

      // type check
      this.validateDataType(data, path, source, schema.type)

      if (schema.options && schema.options.relation) {
        this.addRelation(data.collection, data.id, schema.options.relation, source)
      }
    },
    setDataUpdateOptions (data, schemaPath, source, options) {
      let target = data.target

      // set target to data collection
      if (data.id) {
        target = target[data.id]
      }

      let targetItem = target._item

      // update target position
      if (options.position) {
        const length = options.position.length - 1
        const lastKey = options.position[length]
        let path = schemaPath

        for (let i = 0; i < length; i++) {
          const key = options.update.position[i]
          path = path + '/' + key

          if (!targetItem[key]) {
            throw DataValueException.updatePositionNotFound(options.position.join('.'))
          }

          targetItem = targetItem[key]
        }

        // insert data
        if (!options.method) {
          this.validateSchema(data, path, source)

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
            throw DataValueException.arrayExpected()
          }
        }

        schemaPath = path
      }

      if (options.method) {
        if (!Array.isArray(targetItem)) {
          throw new DataSchemaException({
            schemaPath,
            keyword: 'updateMethod',
            message: 'Expected target to be an array but found ' + typeof targetItem
          })
        }

        // Clone array if position was not changed
        if (options.position == null) {
          if (data.id) {
            data.target[data.id]._item = target._item.slice()
            targetItem = data.target[data.id]._item
          } else {
            data.target._item = target._item.slice()
            targetItem = data.target._item
          }
        }

        const schemaItem = this.getSchema(schemaPath)
        let relation

        if (schemaItem && schemaItem.options && schemaItem.options.relation) {
          relation = {
            target: data.collection,
            id: data.id,
            source: schemaItem.options.relation
          }
        }

        // update target array
        const result = this.updateArray(targetItem, source, options, relation)

        if (!result.isValid) {
          return result
        }

        // check schema options of array
        const schema = this.getSchema(schemaPath)

        // ISSUE: containsDuplicates expects an array
        if (schema && schema.options) {
          // if (schema.options.uniqueItems) {
          //   // @TODO this is too slow, perhaps use a hash table or use a Map
          //   const hasDuplicates = arrayHasDuplicates(targetItem)

          //   if (hasDuplicates) {
          //     // restore target
          //     target._item = target._previous._item

          //     return {
          //       complete: true,
          //       isValid: false
          //     }
          //   }
          // }

          if (schema.options.relation) {
            this.addRelation(data.collection, data.id, schema.options.relation, source)
          }

          return {
            complete: true,
            isValid: true
          }
        }
      }
    },
    setDataOptions (data, source, options) {
      if (Object.hasOwnProperty.call(options, 'id') && options.id == null) {
        throw new DataSchemaException({
          schemaPath: data.collection,
          keyword: 'collection',
          message: 'Expected collection id to be a string but got undefined'
        })
      }

      let schemaPath = data.collection
      let schema = this.getSchema(data.collection)
      let isCollection = schema.type === 'collection'

      if (
        schema.type === 'array' ||
        isCollection
      ) {
        schemaPath = data.collection + '/items'
        schema = this.getSchema(schemaPath)
      }

      // process document id
      if (options.id && isCollection) {
        const id = this.createCollectionId(data.collection, options)

        data.id = id

        if (options.merge) {
          this.mergeCollectionItems(data, schemaPath, { [id]: source }, options.metadata)

          return {
            complete: true,
            isValid: true
          }
        } else if (options.replace) {
          this.replaceCollectionItems(data, data.collection, { [id]: source }, options.metadata)

          return {
            complete: true,
            isValid: true
          }
        }
      } else {
        if (options.merge) {
          if (isCollection) {
            this.mergeCollectionItems(data, schemaPath, source, options.metadata)
          } else {
            this.mergeItems(data, schemaPath, source, options.metadata)
          }

          return {
            complete: true,
            isValid: true
          }
        } else if (options.replace) {
          this.replaceCollectionItems(data, data.collection, source, options.metadata)

          return {
            complete: true,
            isValid: true
          }
        }

        if (isCollection) {
          // create new id
          const collection = this.createDefaultCollectionId(data.collection, options)

          data.id = collection.id
        }
      }

      let previousTarget = data.target

      if (isCollection) {
        previousTarget = data.target[data.id]
      }

      // store previous state
      if (previousTarget) {
        // previous state that was set
        if (previousTarget._item) {
          const result = this.createTarget(schema.type, options.metadata, previousTarget)

          previousTarget._previous = {
            _item: previousTarget._item,
            _metadata: previousTarget._metadata
          }

          previousTarget._metadata = result._metadata
        } else {
          // handle new instance
          const newDataInstance = this.createTarget(schema.type, options.metadata)
          const newDataPreviousInstance = this.createTarget(schema.type, options.metadata)

          // set previous value
          newDataPreviousInstance._item = previousTarget
          newDataInstance._previous = newDataPreviousInstance

          data.target = newDataInstance
        }
      } else {
        const newDataInstance = this.createTarget(schema.type, options.metadata)

        // add new data
        if (isCollection) {
          data.target[data.id] = newDataInstance
        } else {
          data.target = newDataInstance
        }
      }

      // insert new data
      if (!options.update) {
        this.validateSchema(data, schemaPath, source)

        if (schema.type === 'array') {
          this.setDataUpdateOptions(data, schemaPath, source, {
            method: 'push'
          })
        } else {
          // add new data
          if (isCollection) {
            data.target[data.id]._item = source
          } else {
            data.target._item = source
          }
        }

        return {
          complete: true,
          isValid: true
        }
      }

      this.setDataUpdateOptions(data, schemaPath, source, options.update)

      return { isValid: true }
    },
    /**
     * Add the association id
     * @param {string} collection - Primary collection
     * @param {string} docId - Primary id
     * @param {string} refCollection - Foreign collection
     * @param {string} refId - Foreign id
     */
    addRelation (collection, docId, refCollection, refId) {
      const name = collection + '/' + docId
      const usedName = refCollection + '/' + refId

      // set what is related to data
      if (!this.relations[name]) {
        this.relations[name] = [usedName]
      } else if (!this.relations[name].includes(usedName)) {
        this.relations[name].push(usedName)
      }

      // set where ref data is used
      if (!this.relationsInUse[usedName]) {
        this.relationsInUse[usedName] = [name]
      } else if (!this.relationsInUse[usedName].includes(name)) {
        this.relationsInUse[usedName].push(name)
      }
    },
    /**
     * Retrieves a handler for a specific collection and event.
     * @param {string} name - Collection name
     * @param {'update'|'delete'} on - Event trigger
     * @param {string} [id] - Optional handler ID to get specific handler
     * @returns {Object|Function} The handler object or specific handler function
     */
    getHandler (name, on, id) {
      const handler = this.handlers[on][name]

      if (id) {
        return handler[id]
      }

      return handler
    },
    /**
     * Fetches and expands related data for a result.
     * @param {string} name - Name of data collection
     * @param {DataValue} result - Data result to expand
     * @param {GetDataOption} [options] - Options for data expansion
     */
    getExpandedData (name, result, options) {
      const relations = this.relations[name + '/' + result.id]

      result.isExpandEmpty = !relations
      result.expand = result.expand || []

      if (relations) {
        result.expandIncluded = options.expandExclude ?? {}

        for (let i = 0; i < relations.length; i++) {
          const relation = relations[i]

          // prevent duplication and infinite loop
          if (result.expandIncluded[relation] != null) {
            continue
          }

          result.expandIncluded[relation] = true

          const item = relation.split('/', 3)

          if (item.length !== 3) {
            throw new Error('DooksaError: Unexpected relation name "' + relation + '"')
          }

          const name = item[0] + '/' + item[1]
          const id = item[2]
          const value = this.getValue({
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
                item.item = deepClone(item.item)
              }

              result.expandIncluded[name] = result.expand.length
              result.expand.push(item)
            }
          }

          result.expandIncluded[relation] = result.expand.length

          const expandedResult = createDataValue({
            collection: name,
            id: value.id,
            value: {
              _item: !options.expandClone ? value.item : deepClone(value),
              _metadata: value.metadata
            }
          })

          result.expand.push(expandedResult)
        }
      }
    },
    /**
     * Get listeners
     * @private
     * @param {string} name - Data collection name
     * @param {'update'|'delete'} on - Event trigger
     * @param {string} id  - Data collection Id
     * @returns {DataListenerCollection}
     */
    getListeners (name, on, id) {
      const all = this.listeners[on].all[name]

      if (!all) {
        throw new Error('Could not find listener target "' + name + '"')
      }

      const items = this.listeners[on].items[name]
      const priority = this.listeners[on].priority[name]

      if (id) {
        return {
          all,
          items: items[id],
          priority: priority[id]
        }
      }

      return {
        all,
        items,
        priority
      }
    },
    /**
     * Process listeners on update event
     * @private
     * @param {string} name - Collection name
     * @param {'update'|'delete'} on - Event name
     * @param {DataValue} item - Value that is being set
     * @param {boolean} [stopPropagation] - Prevents further propagation of the update event
     */
    dispatchEvent (name, on, item, stopPropagation) {
      const { all, priority, items } = this.getListeners(name, on, item.id)

      if (priority) {
        for (let i = 0; i < priority.length; i++) {
          const handler = priority[i]

          if (!stopPropagation || handler.force) {
            handler.value(item)
          }
        }
      }

      if (items) {
        for (let i = 0; i < items.length; i++) {
          const handler = items[i]

          if (!stopPropagation || handler.force) {
            handler.value(item)
          }
        }
      }

      for (let i = 0; i < all.length; i++) {
        const handler = all[i]

        if (!stopPropagation || handler.force) {
          handler.value(item)
        }
      }
    },
    /**
     * Validate and collection items
     * @template {Object.<string, DataTarget> & DataTarget} Data
     * @param {DataValue} data
     * @param {string} path - Schema path
     * @param {Data} sources
     * @param {DataMetadata} metadata
     */
    mergeCollectionPrimitiveItems (data, path, sources, metadata) {
      const schema = this.getSchema(path)

      for (const id in sources) {
        if (Object.hasOwnProperty.call(sources, id)) {
          const source = deepClone(sources[id], true)
          const result = {
            _item: source._item || source,
            _metadata: source._metadata || metadata
          }

          if (
            schema.options &&
            schema.options.relation &&
            typeof result._item === 'string'
          ) {
            this.addRelation(data.collection, id, schema.options.relation, result._item)
          }

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

    },
    mergeItems (data, path, sources, metadata) {
      const schema = this.getSchema(path)
      const schemaType = schema.type

      if (schemaType !== 'object') {
        this.validateDataType(data, path, sources, schemaType)

        const target = data.target

        if (target) {
          // backup previous value
          target._previous = target._item
          target._item = deepClone(sources, true)
        } else {
          // create new target
          data.target = this.createTarget(schemaType, metadata)
          data.target._item = deepClone(sources, true)
        }

        return
      }

      const hasTarget = Boolean(data.target && data.target._item)
      let targetItem

      if (hasTarget) {
        targetItem = shallowCopy(data.target._item)
      } else {
        targetItem = {}
      }

      for (const id in sources) {
        if (Object.hasOwnProperty.call(sources, id)) {
          // deep freeze clone
          const source = deepClone(sources[id], true)

          // get target
          const targetValue = targetItem[id]

          // merge target and source objects
          if (typeof targetValue === 'object' && !Array.isArray(source)) {
            // unfreeze target
            const result = shallowCopy(targetValue)

            // merge object
            for (const key in source) {
              if (Object.hasOwnProperty.call(source, key)) {
                result[key] = source[key]
              }
            }

            // add new item value
            targetItem[id] = result
          } else {
            targetItem[id] = source
          }
        }
      }

      /**
       * @TODO the schema properties need to be split into named paths to allow validation per property
       * Currently, only complete objects are validated, hence the need to validate after the merge
       */
      // validate result source
      this.validateDataType(data, path, targetItem, schemaType)

      if (hasTarget) {
        // store previous data
        data.target._previous = {
          _item: data.target._item,
          _metadata: data.target._metadata
        }
      }

      // set object source
      data.target._item = targetItem
    },
    /**
     * Validate and collection items
     * @template {Object.<string, DataTarget> & DataTarget} Data
     * @param {DataValue} data
     * @param {string} path - Schema path
     * @param {Data} sources
     * @param {DataMetadata} metadata
     */
    mergeCollectionItems (data, path, sources, metadata) {
      let schema = this.getSchema(path)
      let schemaType = schema.type


      if (schemaType !== 'object' && schemaType !== 'array') {
        this.validateDataType(data, path, sources, schemaType)

        return this.mergeCollectionPrimitiveItems(data, path, sources, metadata)
      }

      for (const id in sources) {
        if (Object.hasOwnProperty.call(sources, id)) {
          const source = sources[id]
          // set collection id for relation validation
          data.id = id
          // validate result source
          this.validateDataType(data, path, source, schemaType)
          // get target
          const target = data.target[id]
          // deep clone source
          let resultItem = deepClone(source)
          const resultMetadata = resultItem._metadata || metadata || target?._metadata
          // get source value
          const item = resultItem._item || resultItem

          // merge target and source objects
          if (typeof target === 'object' && !Array.isArray(item)) {
            // unfreeze target
            resultItem = shallowCopy(target._item)

            // merge object
            for (const key in item) {
              if (Object.hasOwnProperty.call(item, key)) {
                resultItem[key] = item[key]
              }
            }
          } else {
            // set new value
            resultItem = item
          }

          // add new item value
          const result = this.createTarget(schema.type, resultMetadata)
          const previousData = data.target[id]

          if (previousData) {
            // store previous data
            result._previous = {
              _item: previousData._item,
              _metadata: previousData._metadata
            }
          }

          result._item = resultItem
          data.target[id] = result
        }
      }
    },
    /**
     * Remove the association id
     * @param {string} collection - Primary collection
     * @param {string} docId - Primary id
     * @param {string} refCollection - Foreign collection
     * @param {string} refId - Foreign id
     */
    removeRelation (collection, docId, refCollection, refId) {
      const name = collection + '/' + docId
      const usedName = refCollection + '/' + refId
      const relation = this.relations[name]
      const relationUsedIn = this.relationsInUse[usedName]

      if (relation) {
        const index = relation.indexOf(usedName)

        if (index != -1) {
          relation.splice(index, 1)
        }

        if (!relation.length) {
          delete this.relations[name]
        }
      }

      if (relationUsedIn) {
        const index = relationUsedIn.indexOf(name)

        if (index != -1) {
          relationUsedIn.splice(index, 1)
        }

        if (!relationUsedIn.length) {
          delete this.relationsInUse[usedName]
        }
      }
    },
    /**
     * Creates a collection item based on the given data and optional ID.
     * @param {Object.<string, DataTarget<*>> | DataTarget<*>} collection - The collection to create the item in.
     * @param {object} data - The data to use for the new item.
     * @param {string} [id] - Optional ID for the new item within the collection.
     * @returns {DataTarget<*>} The created item object.
     */
    createCollectionItem (collection, data, id) {
      const item = {
        _item: data._item || data,
        _metadata: data._metadata || {}
      }
      let previousData = collection

      if (id) {
        previousData = collection[id]
      }

      // store current _item value to previous
      if (typeof previousData === 'object' && previousData.hasOwnProperty('_item')) {
        item._previous = {
          _item: previousData._item,
          _metadata: previousData._metadata
        }

        // assign previous metadata if missing from incoming data
        if (!item._metadata && previousData._metadata) {
          item._metadata = previousData._metadata
        }
      }

      return item
    }
  },
  methods: {
    /**
     * Retrieves a schema entry by path.
     * @param {string} path - The schema path to retrieve
     * @returns {SchemaEntry} The schema entry for the given path
     */
    getSchema (path) {
      return this.schema[path]
    },
    /**
     * Sets data without schema validation.
     * @param {Object} param - Parameters object
     * @param {string} param.name - Name of the collection
     * @param {*} param.value - Data value to set
     * @param {Object} [param.options] - Additional options
     * @param {string} [param.options.id] - Optional ID for the data
     * @param {boolean} [param.options.replace] - Whether to replace the target collection
     * @param {boolean} [param.options.stopPropagation] - Whether to stop event propagation
     * @returns {DataValue|DataValue[]} The created data value(s)
     */
    unsafeSetValue ({ name, value, options = {} }) {
      const collection = this.values[name]

      if (options.hasOwnProperty('id')) {
        const id = options.id

        if (id == null) {
          throw DataValueException.unsafeSetValueInvalidId(options.id)
        }
        const item = this.createCollectionItem(collection, value, id)
        const result = createDataValue({
          collection: name,
          value: item,
          id
        })
        // set new data
        collection[id] = item

        this.dispatchEvent(name, 'update', result, options.stopPropagation)

        return result
      }

      // update entire collection
      const schema = this.getSchema(name)

      if (schema.type === 'collection') {
        const results = []
        let replacement = collection

        if (options.replace) {
          replacement = {}
        }

        for (const id in value) {
          if (Object.prototype.hasOwnProperty.call(value, id)) {
            const item = this.createCollectionItem(collection, value[id], id)
            // set new value
            replacement[id] = item

            const result = createDataValue({
              collection: name,
              id,
              value: item
            })
            results.push(result)
            this.dispatchEvent(name, 'update', result, options.stopPropagation)
          }
        }
        // update collection
        this.values[name] = replacement

        return results
      }

      const item = this.createCollectionItem(collection, value)
      const result = createDataValue({
        collection: name,
        value: item
      })

      // update collection
      this.values[name] = item
      this.dispatchEvent(name, 'update', result, options.stopPropagation)

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
      /**
       * Generates a unique identifier.
       * @returns {string} A unique ID string
       */
      method: generateId
    },
    find: {
      metadata: {
        title: 'Find document',
        description: 'Search for instances from a collection',
        icon: 'mdi:search',
        component: 'state-find'
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
       * Retrieves all entities from a collection with optional filtering.
       * @param {Object} param - Parameters object
       * @param {string} param.name - Name of collection to search
       * @param {DataWhere[]} [param.where] - Filter conditions
       * @param {GetDataOption} [param.options] - Additional options for retrieval
       * @returns {DataValue[]} Array of matching data values
       */
      method ({
        name,
        where = [],
        options = {}
      }) {
        const values = this.values[name]

        if (values == null) {
          throw DataValueException.collectionNotFound(name)
        }

        const schema = this.getSchema(name)

        if (schema.type === 'collection') {
          const valueItems = []

          valueLoop: for (const id in values) {
            if (Object.hasOwnProperty.call(values, id)) {
              const value = values[id]
              const dataResult = createDataValue({
                collection: name,
                id,
                value
              })
              let isValid = true

              for (let i = 0; i < where.length; i++) {
                isValid = this.filterData(dataResult, where[i])

                if (!isValid) {
                  continue valueLoop
                }
              }

              if (options.expand) {
                this.getExpandedData(name, dataResult, options)
              }

              valueItems.push(dataResult)
            }
          }

          return valueItems
        }

        const result = createDataValue({
          collection: name,
          value: values
        })
        let isValid = true

        for (let i = 0; i < where.length; i++) {
          isValid = this.filterData(result, where[i])

          if (!isValid) {
            result.isEmpty = true

            return [result]
          }
        }

        if (!isValid) {
          result.isEmpty = true

          return [result]
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
       * Adds a listener to a data collection event.
       * @param {Object} param - Parameters object
       * @param {string} param.name - Collection name
       * @param {'update'|'delete'} [param.on='update'] - Data event name
       * @param {string} [param.id] - Data collection Id
       * @param {number} [param.priority] - Priority for the listener
       * @param {boolean} [param.force] - Force the event to fire even if propagation is stopped
       * @param {boolean} [param.captureAll] - Fire action on all events
       * @param {string} [param.handlerId=''] - ID of handler
       * @param {Function|string} param.handler - Handler function or action ID
       * @param {Object} [action] - Action context
       * @returns {string} Handler instance ID
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
        const listeners = this.getListeners(name, on, id)

        // set default listener value
        if (!listeners.items) {
          const items = []
          const priority = []

          listeners.items = items
          listeners.priority = priority

          if (id) {
            this.listeners[on].items[name][id] = items
            this.listeners[on].priority[name][id] = priority
          } else {
            this.listeners[on].items[name] = items
            this.listeners[on].priority[name] = priority
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

        const handlers = this.getHandler(name, on)
        const item = { value: handler }

        if (force) {
          item.force = force
        }

        if (captureAll) {
          listeners.all.push(item)

          handlers[handlerId] = handler

          return handlerId
        }

        if (id) {
          handlerId = id + handlerId
        }

        if (isNaN(priority)) {
          // add listener item
          listeners.items.push(item)
          handlers[handlerId] = handler

          return handlerId
        }

        item.priority = priority

        // add priority listener
        listeners.priority.push(item)

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
       * Removes a listener from a data collection event.
       * @param {Object} param - Parameters object
       * @param {string} param.name - Data collection name
       * @param {string} [param.id] - Data collection Id
       * @param {'update'|'delete'} [param.on='update'] - Data event name
       * @param {string} param.handlerId - The reference handler ID to remove
       */
      method ({
        name,
        id,
        on = 'update',
        handlerId
      }) {
        const listeners = this.getListeners(name, on, id)

        if (id) {
          handlerId = id + handlerId
        }

        const handler = this.getHandler(name, on, handlerId)

        if (!handler) {
          DEV: {
            throw new Error(`DooksaError: deleteListener expected a handler "${on}.${name}.${id}"`)
          }
          return
        }

        const handlerIndex = listeners.items.indexOf(handler)
        const handlerPriorityIndex = listeners.priority.indexOf(handler)

        // remove handler
        if (handlerIndex !== -1) {
          listeners.items.splice(handlerIndex, 1)
        }

        if (handlerPriorityIndex !== -1) {
          listeners.priority.splice(handlerIndex, 1)
        }

        delete this.handlers[on][name][handlerId]
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
       * Deletes a data value from the state.
       * @param {Object} param - Parameters object
       * @param {string} param.name - Collection name
       * @param {string} param.id - Document ID to delete
       * @param {boolean} [param.cascade] - Whether to delete related data
       * @param {boolean} [param.listeners] - Whether to delete related listeners
       * @param {boolean} [param.stopPropagation] - Whether to stop event propagation
       * @returns {DataDeleteValueResult} Result indicating if data was deleted or is in use
       */
      method ({
        name,
        id,
        cascade,
        listeners,
        stopPropagation
      }) {
        const collection = this.values[name]

        if (collection == null) {
          throw new DataSchemaException({
            schemaPath: name,
            keyword: 'schema',
            message: 'Collection not found'
          })
        }

        const relationName = name + '/' + id

        // check if data is in use
        if (this.relationsInUse[relationName]) {
          return {
            inUse: true,
            deleted: false
          }
        }

        // check if we can clean up related data
        const relations = this.relations[relationName]

        if (relations) {
          for (let i = 0; i < relations.length; i++) {
            const usedRelationName = relations[i]
            const usedRelations = this.relationsInUse[usedRelationName]

            if (usedRelations && usedRelations.length) {
              // remove relationship
              this.relationsInUse[usedRelationName] = usedRelations.filter(item => item !== relationName)

              // clear up data if not in use
              if (!this.relationsInUse[usedRelationName].length) {
                const splitName = usedRelationName.split('/', 2)

                delete this.relationsInUse[usedRelationName]

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
            delete this.relations[relationName]
          }
        }

        if (collection[id]) {
          const result = createDataValue({
            collection: name,
            id,
            value: collection[id]
          })

          if (!stopPropagation) {
            this.dispatchEvent(name, 'delete', result)
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
       * Retrieves data values from the state with optional filtering and expansion.
       * @param {Object} query - Query parameters
       * @param {string} query.name - Name of the collection
       * @param {string} [query.id] - Optional document ID
       * @param {string} [query.prefixId] - Whether to use prefix for ID
       * @param {string} [query.suffixId] - Whether to use suffix for ID
       * @param {Object} [query.options] - Additional options
       * @param {boolean} [query.options.expand] - Whether to expand related data
       * @param {boolean} [query.options.expandClone] - Whether to clone expanded data
       * @param {boolean} [query.options.clone] - Whether to clone the result
       * @param {string} [query.options.position] - Position path to extract specific value
       * @returns {DataValue | Object.<string, DataValue>} The retrieved data value(s)
       */
      method (query) {
        const { name, id, prefixId, suffixId, options } = query
        const collection = this.values[name]

        if (collection == null) {
          throw DataValueException.noSuchCollection(name)
        }

        const schema = this.getSchema(name)

        // return collection
        if (schema.type === 'collection') {
          if (!query.hasOwnProperty('id')) {
            const value = []
            /** @type {DataValue} */
            const result = createDataValue({
              collection: name,
              id,
              value
            })

            for (const id in collection) {
              if (Object.prototype.hasOwnProperty.call(collection, id)) {
                value.push(createDataValue({
                  collection: name,
                  id,
                  value: collection[id]
                }))
              }
            }

            if (!value.length) {
              // no documents found
              result.isEmpty = true
            }

            return result
          } else if (id == null) {
            const result = createDataValue({
              collection: name,
              id
            })
            result.isEmpty = true
            return result
          }
        }

        let result = createDataValue({ collection: name })

        if (id != null) {
          let isAffixEmpty = true

          // find document using custom affixes
          if (prefixId || suffixId) {
            let itemId

            if (prefixId && suffixId) {
              const prefix = this.createAffix(prefixId)
              const suffix = this.createAffix(suffixId)

              itemId = prefix + id + suffix
            } else if (prefixId) {
              const prefix = this.createAffix(prefixId)

              itemId = prefix + id
            } else if (suffixId) {
              const suffix = this.createAffix(suffixId)

              itemId = id + suffix
            }

            const value = collection[itemId]

            if (value != null) {
              isAffixEmpty = false
              result = createDataValue({
                collection: name,
                id,
                value
              })
            }
          }

          if (isAffixEmpty) {
            let itemId = id

            // find document using default affixes
            if (this.values[name][id] == null && schema.id) {
              if (schema.id.prefix && schema.id.suffix) {
                const prefix = this.createAffix(schema.id.prefix)
                const suffix = this.createAffix(schema.id.suffix)

                itemId = prefix + id + suffix
              } else if (schema.id.prefix) {
                const prefix = this.createAffix(schema.id.prefix)

                itemId = prefix + id
              } else {
                const suffix = this.createAffix(schema.id.suffix)

                itemId = id + suffix
              }
            }

            const value = this.values[name][itemId]

            if (value != null) {
              result = createDataValue({
                collection: name,
                id,
                value
              })
            } else {
              result.isAffixEmpty = true
            }
          }

          // return empty value
          if (result.item == null) {
            result.isEmpty = true

            if (options && options.expand) {
              result.isExpandEmpty = true
            }

            return result
          }
        } else {
          result = createDataValue({
            collection: name,
            value: collection
          })
        }

        if (!options) {
          return result
        }

        if (options.expand) {
          this.getExpandedData(name, result, options)
        }

        // return a mutable item
        if (options.clone) {
          result.item = deepClone(result.item)
        }

        // return a value from position
        if (options.position) {
          result.item = getValue(result.item, options.position)
        }

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
       * Sets a data value in the state with schema validation.
       * @param {Object} param - Parameters object
       * @param {string} param.name - Name of collection
       * @param {*} param.value - Data to be set
       * @param {SetDataOptions} [param.options] - Set data options
       * @returns {DataValue} The created data value
       */
      method ({ name, value, options }) {
        const schema = this.getSchema(name)

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

        const result = this.setData(
          name,
          this.values[name],
          value._item || value,
          options
        )

        if (!result.isValid) {
          return result
        }

        // freeze non collection objects
        if (schema.type !== 'collection' && typeof result.item === 'object') {
          Object.freeze(result.item)
        }

        // set new value
        this.values[name] = result.target

        const dataResult = createDataValue({
          collection: name,
          id: result.id,
          value: result.item
        })

        dataResult.previous = result.previous
        dataResult.metadata = result.metadata

        // notify listeners
        this.dispatchEvent(name, 'update', dataResult, (options && options.stopPropagation))

        return dataResult
      }
    }
  },
  /**
   * Sets up the state plugin with initial data and schemas.
   * @param {DsPluginStateExport} state - The state export containing values, schemas, and defaults
   */
  setup (state) {
    // set plugin default values
    this.values = state._values
    // store all collection names
    const collectionName = 'data/collections'
    this.values[collectionName] = state._names.sort()
    this.schema[collectionName] = {
      items: { type: 'string' },
      type: 'array'
    }

    // setup plugin schemas
    for (let i = 0; i < state._items.length; i++) {
      const item = state._items[i]
      const entries = item.entries
      const isCollection = item.isCollection
      const name = item.name

      for (let i = 0; i < entries.length; i++) {
        const item = entries[i]

        this.schema[item.id] = item.entry
      }

      // prepare listeners
      let defaultType = 'array'

      if (isCollection) {
        defaultType = 'object'
      }

      // prepare collection listeners
      this.listeners.delete.all[name] = []
      this.listeners.delete.items[name] = newDataInstance(defaultType)
      this.listeners.delete.priority[name] = newDataInstance(defaultType)
      this.listeners.update.all[name] = []
      this.listeners.update.items[name] = newDataInstance(defaultType)
      this.listeners.update.priority[name] = newDataInstance(defaultType)
      // prepare collection handlers
      this.handlers.delete[name] = {}
      this.handlers.update[name] = {}
    }

    // set default values
    for (let i = 0; i < state._defaults.length; i++) {
      this.setValue(state._defaults[i])
    }
  }
})

export const {
  stateAddListener,
  stateDeleteListener,
  stateDeleteValue,
  stateFind,
  stateGenerateId,
  stateGetSchema,
  stateGetValue,
  stateSetValue,
  stateUnsafeSetValue
} = state

export default state
