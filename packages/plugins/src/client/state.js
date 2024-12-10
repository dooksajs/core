import { createPlugin } from '@dooksa/create-plugin'
import { operatorEval, listSplice, actionDispatch } from '#client'
import { DataSchemaException, DataValueException } from '../utils/error.js'
import { deepClone, generateId, isEnvServer, getValue, shallowCopy } from '@dooksa/utils'
import { createDataValue } from '../utils/data-value.js'

/**
 * @import {SetDataOptions, GetDataQuery, GetDataOption, DataWhere} from '../../../types.js'
 * @import {DataValue} from '#types'
 * @import {PluginStateExport} from '@dooksa/create-plugin/types'
 */

/**
 * @typedef {Object} DataListenerHandler
 * @property {boolean} [force]
 * @property {number} [priority]
 * @property {Function} value
 */

/**
 * @typedef {Object} DataListenerCollection
 * @property {DataListenerHandler[]} all - Handlers that will fire on data instances
 * @property {DataListenerHandler[] | undefined} items - Handlers related to an specific data instance
 * @property {DataListenerHandler[] | undefined} priority - Handlers that will emit before "all" or "items" handlers
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
    throw new DataSchemaException({
      schemaPath: name,
      keyword: 'uniqueItems',
      message: 'Type error: expected a unique item'
    })
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
     * Create affix
     * @param {Function|string} affix
     * @returns {string}
     */
    createAffix (affix) {
      if (typeof affix === 'function') {
        return affix()
      }

      return affix || ''
    },
    /**
     * Create collection id
     * @param {string} name - Name of collection
     * @param {*} option
     * @returns {string}
     */
    createCollectionId (name, option) {
      const schema = this.getSchema(name)
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
     * Validate and collection items
     * @param {*} data
     * @param {*} path
     * @param {*} sources
     * @param {*} metadata
     * @returns
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
          this.validateDataType(schemaPath, target._item, schemaType)

          // validate object source values
          if (schemaType === 'object') {
            this.validateSchemaObject(data, schemaPath, target._item)
          } else if (schemaType === 'array') {
            this.validateSchemaArray(data, schemaPath, target._item)
          } else if (schema.options && schema.options.relation) {
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

        result.target = target._item
        result.item = target._item
        result.previous = target._previous
        result.metadata = target._metadata
      }
      return result
    },
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
     * @param {string} path - Schema path
     * @param {*} value - value to be checked
     * @param {string} type - Expected data type
     * @returns {boolean}
     */
    validateDataType (path, value, type) {
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
    },
    validateSchemaArray (data, path, source) {
      const schema = this.getSchema(path)

      if (schema.options) {
        this.validateSchemaArrayOption(path, source)
      }

      // check if source is an array
      this.validateDataType(schema, source, schema.type)

      const schemaName = path + '/items'
      const schemaItems = this.getSchema(schemaName)

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
          this.validateSchemaObject(data, schemaName, item)
        } else if (schemaType === 'array') {
          this.validateSchemaArray(data, schemaName, item)
        } else {
          // set relation for array of strings
          if (schemaItems.options && schemaItems.options.relation) {
            this.addRelation(data.collection, data.id, schemaItems.options.relation, item)
          }

          this.validateDataType(schemaName, item, schemaItems.type)

          // freeze array item
          if (typeof item === 'object') {
            Object.freeze(item)
          }
        }
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
        return
      }

      if (schema.options) {
        this.validateSchemaObjectOption(path, source)
      }

      // freeze object
      Object.freeze(source)

      const propertiesChecked = {}

      if (schema.properties) {
        this.validateSchemaObjectProperties(data, schema.properties, propertiesChecked, source, path)
      }

      if (schema.patternProperties) {
        this.validateSchemaObjectPatternProperties(data, schema.patternProperties, propertiesChecked, source, path)
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
    validateSchemaObjectPatternProperties (
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
              const schema = this.getSchema(schemaName)

              if (schema) {
                const schemaType = schema.type

                this.validateDataType(schemaName, sourceItem, schemaType)

                if (schemaType === 'object') {
                  this.validateSchemaObject(data, schemaName, sourceItem)
                } else {
                  this.validateSchemaArray(data, schemaName, sourceItem)
                }
              } else {
                const propertyOptions = property.options || {}

                if (propertyOptions.relation) {
                  this.addRelation(data.collection, data.id, propertyOptions.relation, sourceItem)
                }
              }
            }

            this.validateDataType(path, sourceItem, property.type)
          }
        }
      }
    },
    validateSchemaObjectProperties (data, properties, propertiesChecked, source, path) {
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
            const schema = this.getSchema(schemaName)

            if (schema) {
              const schemaType = schema.type

              this.validateDataType(schemaName, sourceItem, schemaType)

              if (schemaType === 'object') {
                this.validateSchemaObject(data, schemaName, sourceItem)
              } else {
                this.validateSchemaArray(data, schemaName, sourceItem)
              }
            } else {
              if (propertyOptions.relation) {
                this.addRelation(data.collection, data.id, propertyOptions.relation, value)
              }
            }
          }

          this.validateDataType(path, sourceItem, property.type)

          propertiesChecked[property.name] = true
        }
      }
    },
    validateSchema (data, path, source) {
      const schema = this.getSchema(path)

      /** @todo validate *any* until schema supports multi type schema */
      if (!schema) {
        return
      }
      const schemaType = schema.type

      if (schemaType === 'object') {
        this.validateSchemaObject(data, path, source)
      } else if (schemaType === 'array') {
        this.validateSchemaArray(data, path, source)
      } else {
        // type check
        this.validateDataType(path, source, schema.type)

        if (schema.options && schema.options.relation) {
          this.addRelation(data.collection, data.id, schema.options.relation, source)
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

      let schemaPath = data.collection + '/items'
      const schema = this.getSchema(schemaPath)

      // process document id
      if (options.id) {
        const id = this.createCollectionId(data.collection, options)

        data.id = id

        if (options.merge) {
          const collection = Object.create(null)
          collection[id] = source
          this.mergeCollectionItems(data, schemaPath, collection, options.metadata)

          return {
            complete: true,
            isValid: true
          }
        } else if (options.replace) {
          const collection = Object.create(null)
          collection[id] = source
          this.replaceCollectionItems(data, data.collection, collection, options.metadata)

          return {
            complete: true,
            isValid: true
          }
        }
      } else {
        if (options.merge) {
          this.mergeCollectionItems(data, schemaPath, source, options.metadata)

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

        // create new id
        const collection = this.createDefaultCollectionId(data.collection, options)

        data.id = collection.id
      }

      const previousTarget = data.target[data.id]

      // store previous state
      if (previousTarget) {
        const result = this.createTarget(schema.type, options.metadata, previousTarget)

        previousTarget._previous = {
          _item: previousTarget._item,
          _metadata: previousTarget._metadata
        }

        previousTarget._metadata = result._metadata
      } else {
        data.target[data.id] = this.createTarget(schema.type, options.metadata)
      }

      // insert new data
      if (!options.update) {
        this.validateSchema(data, schemaPath, source)

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
        const schemaItem = this.getSchema(schemaPath)
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

                this.validateSchema(data, schemaPathItem, item)
              }
            } else {
              this.validateSchema(data, schemaPathItem, source)
            }
          }
        }

        // update target array
        const result = this.updateArray(targetItem, source, options.update, relation)

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
     * @param {string} name - Collection name
     * @param {'update' | 'delete'} on - Event trigger
     * @param {string} [id] - Handler ID
     */
    getHandler (name, on, id) {
      const handler = this.handlers[on][name]

      if (id) {
        return handler[id]
      }

      return handler
    },
    /**
     * Fetch related data
     * @param {string} name - Name of data collection
     * @param {DataValue} result - Data result
     * @param {GetDataOption} [options]
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

          const item = relation.split('/')
          const name = item[0] + '/' + item[1]
          const id = item.splice(2).join('/')
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
            id: value.id
          })

          expandedResult.item = !options.expandClone ? value.item : deepClone(value)
          expandedResult.metadata = value.metadata

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
      const priority = this.listeners[on].items[name]

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
     * @param {*} data
     * @param {*} path
     * @param {*} sources
     * @param {*} metadata
     * @returns
     */
    mergeCollectionItems (data, path, sources, metadata) {
      const schema = this.getSchema(path)
      const schemaType = schema.type

      if (schemaType !== 'object' && schemaType !== 'array') {
        for (const id in sources) {
          if (Object.hasOwnProperty.call(sources, id)) {
            const source = deepClone(sources[id], true)
            const target = {
              _item: source._item || source,
              _metadata: source._metadata || metadata
            }

            this.validateDataType(path, target._item, schemaType)

            if (schema.options && schema.options.relation) {
              this.addRelation(data.collection, id, schema.options.relation, target._item)
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
          const source = sources[id]

          // validate source
          this.validateDataType(path, source, schemaType)

          // deep clone source
          let resultItem = deepClone(source)
          const resultMetadata = resultItem._metadata || metadata
          // get source value
          const item = resultItem._item || resultItem

          // set current merge root id
          data.id = id

          // get target
          const target = data.target[id]

          // merge target and source objects
          if (target && typeof target._item === 'object') {
            if (Array.isArray(item)) {
              // replace array
              resultItem = item
            } else {
              resultItem = shallowCopy(target._item)

              // merge object
              for (const key in item) {
                if (Object.hasOwnProperty.call(item, key)) {
                  resultItem[key] = item[key]
                }
              }
            }
          } else {
            // set new value
            resultItem = item
          }

          if (schemaType === 'object') {
            this.validateSchemaObject(data, path, resultItem)
          } else {
            this.validateSchemaArray(data, path, resultItem)
          }

          // add new item value
          const result = this.createTarget(schema.type, resultMetadata)

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
    }
  },
  methods: {
    /**
     * @param path - Schema path name
     */
    getSchema (path) {
      return this.schema[path]
    },
    /**
     * Set data without schema validation
     * @param {Object} param
     * @param {string} param.name
     * @param {*} param.value
     * @param {Object} [param.options]
     * @param {string} param.options.id
     * @param {boolean} [param.options.stopPropagation]
     * @returns {DataValue}
     */
    unsafeSetValue ({ name, value, options }) {
      const result = createDataValue({
        collection: name,
        id: options.id
      })

      let stopPropagation = false

      if (options) {
        if (options.id == null) {
          // update collection
          this.values[name] = value

          result.item = value
        } else {
          result.item = value._item || value

          const data = this.values[name][options.id] || {}

          this.values[name][options.id] = {
            _item: value._item || value,
            _metadata: value._metadata || data._metadata || {}
          }
        }

        stopPropagation = options.stopPropagation
      } else {
        // update collection
        this.values[name] = value

        result.item = value
      }

      this.dispatchEvent(name, 'update', result, stopPropagation)

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
        const values = this.values[name]

        if (values == null) {
          throw new DataValueException('No collection found: ' + name)
        }

        const schema = this.getSchema(name)

        if (schema.type === 'collection') {
          const valueItems = []

          valueLoop: for (const id in values) {
            if (Object.hasOwnProperty.call(values, id)) {
              const value = values[id]
              const dataResult = createDataValue({
                collection: name,
                id
              })
              let isValid = true

              for (let i = 0; i < where.length; i++) {
                isValid = this.filterData(dataResult, where[i])

                if (!isValid) {
                  continue valueLoop
                }
              }

              dataResult.item = value._item
              dataResult.metadata = value._metadata
              dataResult.previous = value._previous

              if (options.expand) {
                this.getExpandedData(name, dataResult, options)
              }

              valueItems.push(dataResult)
            }
          }

          return valueItems
        }

        const result = createDataValue({ collection: name })
        let isValid = true

        result.item = values._item
        result.metadata = values._metadata
        result.previous = values._previous

        for (let i = 0; i < where.length; i++) {
          isValid = this.filterData(result, where[i])

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
       * @param {Object} [action]
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
                const splitName = usedRelationName.split('/')

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
            id
          })

          result.item = collection[id]._item
          result.metadata = collection[id]._metadata

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
       * Get data value
       * @param {GetDataQuery} query
       * @returns {DataValue}
       */
      method (query) {
        const { name, id, prefixId, suffixId, options } = query
        const collection = this.values[name]

        if (collection == null) {
          throw new DataValueException('No such collection "' + name +"'")
        }

        const result = createDataValue({
          collection: name,
          id
        })
        const schema = this.getSchema(name)

        // return collection
        if (schema.type === 'collection') {
          if (!query.hasOwnProperty('id')) {
            result.item = collection

            return result
          } else if (id == null) {
            result.isEmpty = true
            return result
          }
        }

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
              result.id = itemId
              result.item = value._item
              result.metadata = value._metadata || false

              if (value._previous) {
                result.previous = value._previous
              }
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
              result.id = itemId
              result.item = value._item
              result.metadata = value._metadata || {}

              if (value._previous) {
                result.previous = value._previous
              }
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
          result.item = collection
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
       * Set data value
       * @param {Object} param
       * @param {string} param.name - Name of collection
       * @param {*} param.value - Data to be set
       * @param {SetDataOptions} [param.options] - Set data options
       * @returns {DataValue}
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

        let result = createDataValue({ collection: name })
        let target = this.values[name]

        if (target == null) {
          // set default value
          target = newDataInstance(schema.type)
        }

        result = this.setData(
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
        this.values[name] = result.target

        const dataResult = createDataValue({
          collection: name,
          id: result.id,
          data: result.item
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
   * Setup database
   * @param {PluginStateExport} state
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
