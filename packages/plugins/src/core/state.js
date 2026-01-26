import { createPlugin } from '@dooksa/create-plugin'
import { operatorEval, listSplice, actionDispatch } from '#core'
import { DataSchemaException, DataValueException } from '../utils/error.js'
import { deepClone, generateId, isEnvServer, getValue, shallowCopy } from '@dooksa/utils'
import { createDataValue } from '../utils/data-value.js'

/**
 * @import {SetDataOptions, GetDataQuery, GetDataOption, DataWhere, DataDeleteValueResult, DataListenerHandler, DataListenerCollection, UpdateOptions, DataUpdateResult, CollectionIdResult, RelationInfo, DataTarget, DataValue, DataMetadata, UpdateContext, MergeResult} from '../../../types.js'
 * @import {DsPluginStateExport, SchemaEntry} from '@dooksa/create-plugin/types'
 */

/**
 * Parameters for unsafeSetValue when an ID is provided.
 *
 * @typedef {Object} UnsafeSetValueParamsWithId
 * @property {string} name - Name of the collection
 * @property {*} value - Data value to set
 * @property {Object} options - Additional options
 * @property {string} options.id - Required ID for the data
 * @property {boolean} [options.replace] - Whether to replace the target collection
 * @property {boolean} [options.stopPropagation] - Whether to stop event propagation
 */

/**
 * Parameters for unsafeSetValue when no ID is provided.
 *
 * @typedef {Object} UnsafeSetValueParamsWithoutId
 * @property {string} name - Name of the collection
 * @property {*} value - Data value to set
 * @property {Object} [options] - Additional options (optional when no ID is used)
 * @property {undefined} [options.id] - Must be undefined or omitted
 * @property {boolean} [options.replace] - Whether to replace the target collection
 * @property {boolean} [options.stopPropagation] - Whether to stop event propagation
 */

/**
 * Query parameters for getValue when an ID is provided.
 *
 * @typedef {Object} GetValueQueryWithId
 * @property {string} name - Name of the collection
 * @property {string} id - Document ID (required in this variant)
 * @property {string} [prefixId] - Whether to use prefix for ID
 * @property {string} [suffixId] - Whether to use suffix for ID
 * @property {Object} [options] - Additional options
 * @property {boolean} [options.expand] - Whether to expand related data
 * @property {boolean} [options.expandClone] - Whether to clone expanded data
 * @property {boolean} [options.clone] - Whether to clone the result
 * @property {string} [options.position] - Position path to extract specific value
 */

/**
 * Query parameters for getValue when no ID is provided.
 *
 * @typedef {Object} GetValueQueryWithoutId
 * @property {string} name - Name of the collection
 * @property {undefined} [id] - Must be omitted or undefined
 * @property {string} [prefixId] - Whether to use prefix for ID
 * @property {string} [suffixId] - Whether to use suffix for ID
 * @property {Object} [options] - Additional options
 * @property {boolean} [options.expand] - Whether to expand related data
 * @property {boolean} [options.expandClone] - Whether to clone expanded data
 * @property {boolean} [options.clone] - Whether to clone the result
 * @property {string} [options.position] - Position path to extract specific value
 */

/**
 * Determines if an array contains duplicate values.
 *
 * This function checks if any value in the array appears more than once by comparing
 * the first and last occurrence indices of each value.
 *
 * @param {Array} array - The array to check for duplicates.
 * @returns {boolean} - Returns true if there are duplicate values, false otherwise.
 * @example
 * // Returns true
 * arrayHasDuplicates([1, 2, 3, 2])
 * @example
 * // Returns false
 * arrayHasDuplicates([1, 2, 3, 4])
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
 * Validates that an array contains only unique items by checking for duplicates.
 *
 * This is a private helper used for schema validation when the 'uniqueItems' option
 * is enabled. It throws an exception if duplicates are found.
 *
 * @private
 * @param {string} name - The schema path being validated (used in error messages)
 * @param {Array} source - The array to validate for uniqueness
 * @throws {DataSchemaException} Thrown when the array contains duplicate values
 * @see arrayHasDuplicates
 */
function arrayIsUnique (name, source) {
  const hasDuplicates = arrayHasDuplicates(source)

  if (hasDuplicates) {
    throw DataSchemaException.uniqueItems(name)
  }
}

/**
 * Creates a new data instance of the specified type.
 *
 * This factory function generates default instances for various data types used
 * throughout the state management system. It handles primitive types, objects,
 * arrays, functions, and special types like DOM nodes.
 *
 * @private
 * @param {string} type - The data type name. Valid values: 'array', 'boolean', 'function', 'node', 'number', 'object', 'string'
 * @returns {Array|Boolean|Function|number|Object|string} A new instance of the specified type
 * @throws {Error} If an unsupported type is provided
 * @example
 * newDataInstance('array') // Returns []
 * newDataInstance('object') // Returns {}
 * newDataInstance('string') // Returns ''
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
    default:
      throw new Error(`Unsupported data type: ${type}`)
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
     *
     * This helper is used to generate prefixes or suffixes for IDs. If the affix
     * is a function, it will be called to generate the value dynamically.
     *
     * @param {Function|string} affix - The affix value or function to generate it
     * @returns {string} The generated affix string
     * @example
     * createAffix('prefix_') // Returns 'prefix_'
     * createAffix(() => 'dynamic') // Returns 'dynamic'
     * createAffix('') // Returns ''
     */
    createAffix (affix) {
      if (typeof affix === 'function') {
        return affix()
      }

      return affix || ''
    },

    /**
     * Creates a collection ID with optional prefix and suffix.
     *
     * This method generates IDs for collection items, applying any configured
     * affixes from the schema. It handles custom IDs, prefix/suffix options,
     * and default ID generation.
     *
     * @param {string} name - Name of collection
     * @param {Object} option - Options for ID generation
     * @param {string} [option.id] - Custom ID to use
     * @param {string} [option.prefixId] - Prefix to add to the ID
     * @param {string} [option.suffixId] - Suffix to add to the ID
     * @returns {string} The generated collection ID
     * @example
     * // With schema: { id: { prefix: 'user_', suffix: '_v1' } }
     * createCollectionId('users', { id: '123' })
     * // Returns 'user_123_v1'
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
     * Generate the default id for a collection.
     *
     * This method creates a new collection ID with optional affixes and returns
     * both the full ID and the ID without affixes for internal use.
     *
     * @private
     * @param {string} name - Collection schema path
     * @param {Object} [option={}] - Collection id prefix or suffix options
     * @param {string} [option.prefixId] - Prefix to add to the id
     * @param {string} [option.suffixId] - Suffix to add to the id
     * @returns {CollectionIdResult} Object containing the full ID and ID without affixes
     * @example
     * createDefaultCollectionId('users', {})
     * // Returns { id: 'user_abc123_v1', noAffixId: 'abc123' }
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
     *
     * A data target is a container that holds both the actual data value (_item)
     * and its metadata (_metadata). This method creates or updates such containers.
     *
     * @param {string} type - The data type for the target item
     * @param {Object} metadata - Metadata to set on the target
     * @param {DataTarget} [target] - Optional existing target to update
     * @returns {DataTarget} The created or updated target object
     * @example
     * createTarget('object', { userId: '123' })
     * // Returns { _item: {}, _metadata: { userId: '123', ... } }
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
     * Filters data results based on complex conditions.
     *
     * This method evaluates boolean logic using AND/OR operators to determine if data
     * matches the specified criteria. It supports nested conditions for complex filtering.
     *
     * @private
     * @param {DataValue<*>} data - The data value to filter
     * @param {DataWhere} where - Filter conditions with 'and', 'or', or 'name' properties
     * @returns {boolean} True if the data matches the conditions, false otherwise
     * @example
     * // Simple condition
     * filterData(dataResult, { name: 'status', op: '==', value: 'active' })
     * @example
     * // Complex nested condition
     * filterData(dataResult, {
     *   and: [
     *     { name: 'status', op: '==', value: 'active' },
     *     { or: [
     *       { name: 'role', op: '==', value: 'admin' },
     *       { name: 'permissions', op: '>=', value: 5 }
     *     ]}
     *   ]
     * })
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
     * Evaluates a single filter condition against data.
     *
     * Extracts the value from the data (either from metadata or item properties)
     * and compares it using the specified operator.
     *
     * @private
     * @param {DataValue<*>} data - The data value containing item and metadata
     * @param {DataWhere} condition - Condition with name, operator, and value
     * @returns {boolean} True if the condition is satisfied
     * @example
     * filterValidateValue(dataResult, { name: 'age', op: '>', value: 18 })
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
     * Replaces entire collection items with new data.
     *
     * This method completely replaces all items in a collection with the provided
     * source data, validating each item and managing relationships.
     *
     * @private
     * @param {Object} data - The data object containing target and collection info
     * @param {string} path - Schema path for the collection
     * @param {Object} sources - Object containing items to replace with (keyed by ID)
     * @param {Object} metadata - Metadata to apply to new items
     * @example
     * replaceCollectionItems(data, 'users', { '1': { name: 'John' } }, { userId: 'admin' })
     */
    replaceCollectionItems (data, path, sources, metadata) {
      const schemaPath = path + '/items'
      const schema = this.getSchema(schemaPath)
      const schemaType = schema.type

      // set values
      for (const id in sources) {
        if (Object.hasOwnProperty.call(sources, id)) {
          /** @TODO need to look into this, clone is not being used? */
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
     * Validates and processes data for setting in the state.
     *
     * This is the core method for setting data. It handles validation, ID generation,
     * relationship management, and creates the appropriate data structure.
     *
     * @private
     * @param {string} collection - Collection name
     * @param {Object} target - Target data container
     * @param {*} source - Source data to set
     * @param {SetDataOptions} [options] - Options for data setting
     * @returns {Object} Result with validation status, item, previous value, and metadata
     * @example
     * setData('users', {}, { name: 'John' }, { id: '123' })
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
            result.item = value._item
            result.previous = value._previous
            result.metadata = this.setMetadata(value._metadata, options.metadata)
          } else {
            // When no ID is specified (e.g., merging a collection), return the target itself
            result.item = value
          }

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
     * Adds or updates metadata for a data item.
     *
     * This method merges new metadata with existing metadata and automatically
     * adds timestamps on the server side.
     *
     * @param {DataMetadata|Object} [item={}] - The item to set metadata for
     * @param {Object} [options={}] - Additional metadata options
     * @returns {DataMetadata} The complete metadata object
     * @example
     * setMetadata({}, { userId: '123', customField: 'value' })
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
     *
     * This method provides comprehensive array manipulation capabilities, supporting
     * standard array operations while optionally managing data relationships.
     *
     * @private
     * @param {Array} target - The target array to update
     * @param {Array|*} source - Source data for the operation (will be converted to array if needed)
     * @param {Object} options - Update options
     * @param {string} options.method - The operation method: 'push', 'pull', 'pop', 'shift', 'unshift', or 'splice'
     * @param {number} [options.unique] - Ensure item is unique
     * @param {number} [options.startIndex] - Start index for splice operation
     * @param {number} [options.deleteCount] - Number of items to delete for splice
     * @param {Object} [relation] - Optional relation information for relationship management
     * @param {string} relation.target - Target collection name
     * @param {string} relation.id - Target document ID
     * @param {string} relation.source - Source collection name
     * @returns {Object} Result with isValid and isComplete flags
     * @example
     * // Push operation
     * updateArray(['a'], ['b'], { method: 'push' })
     * // Result: ['a', 'b']
     * @example
     * // Splice operation
     * updateArray(['a', 'b', 'c'], ['x'], { method: 'splice', startIndex: 1, deleteCount: 1 })
     * // Result: ['a', 'x', 'c']
     */
    updateArray (target, source, options, relation) {
      const existingSet = options.unique ? new Set(target) : null
      const result = {
        isValid: true,
        isComplete: false
      }

      // ensure source is an array of items
      source = Array.isArray(source) ? source : [source]

      switch (options.method) {
        case 'push':
          for (let i = 0; i < source.length; i++) {
            const value = source[i]

            // check if uniqueness
            if (options.unique && existingSet.has(value)) {
              continue
            }

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

            // check uniqueness
            if (options.unique && existingSet.has(value)) {
              continue
            }

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
     *
     * This prevents accidental modification of array elements after they've been
     * added to the state, ensuring data integrity.
     *
     * @private
     * @param {Array} items - The array containing items to freeze
     * @param {number} length - Number of items from the end to freeze
     * @example
     * // Freezes the last 2 items in the array
     * updateArrayItemFreeze(['a', 'b', 'c', 'd'], 2)
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
     * Validates that data matches the expected type and schema.
     *
     * This is the main type validation method that delegates to specific validators
     * based on the type. It handles objects, arrays, and primitive types.
     *
     * @private
     * @param {*} data - Schema path context
     * @param {string} path - Schema path for error reporting
     * @param {*} value - Value to be checked
     * @param {string} type - Expected data type ('object', 'array', 'node', 'string', 'number', 'boolean', 'function')
     * @returns {boolean} True if validation passes
     * @throws {DataSchemaException} If type mismatch occurs
     * @example
     * validateDataType(data, 'users/1/name', 'John', 'string') // Returns true
     * validateDataType(data, 'users/1/age', 'twenty', 'number') // Throws exception
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

    /**
     * Validates an array against its schema definition.
     *
     * This method checks if the source is an array, applies array-specific options
     * (like uniqueItems), validates each item, and manages array relationships.
     *
     * @private
     * @param {Object} data - The data context
     * @param {string} path - Schema path for the array
     * @param {Array} source - The array to validate
     * @throws {DataSchemaException} If validation fails
     * @example
     * validateSchemaArray(data, 'users/1/tags', ['tag1', 'tag2'])
     */
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

    /**
     * Validates array-specific options like uniqueItems.
     *
     * @private
     * @param {string} path - Schema path
     * @param {Array} source - Array to validate
     * @throws {DataSchemaException} If uniqueItems constraint is violated
     */
    validateSchemaArrayOption (path, source) {
      const schema = this.getSchema(path)

      if (schema.options.uniqueItems) {
        arrayIsUnique(path, source)
      }
    },

    /**
     * Validates an object against its schema definition.
     *
     * This method checks object properties, pattern properties, and applies
     * validation rules like additionalProperties restrictions.
     *
     * @private
     * @param {Object} data - The data context
     * @param {string} path - Schema path for the object
     * @param {Object} source - The object to validate
     * @returns {boolean} True if validation passes
     * @throws {DataSchemaException} If validation fails
     * @example
     * validateSchemaObject(data, 'users/1/profile', { name: 'John', age: 30 })
     */
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

      return true
    },

    /**
     * Validates object-specific options like additionalProperties restrictions.
     *
     * @private
     * @param {string} path - Schema path
     * @param {Object} data - Object to validate
     * @throws {DataSchemaException} If additionalProperties constraint is violated
     */
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

    /**
     * Validates a single object property against its schema.
     *
     * Handles default values, required fields, and relationship management.
     *
     * @private
     * @param {Object} data - The data context
     * @param {Object} property - Property schema definition
     * @param {string} name - Property name
     * @param {Object} source - Source object containing the property
     * @param {string} path - Schema path
     * @example
     * validateSchemaObjectProperty(data, { name: 'age', type: 'number' }, 'age', { age: 25 }, 'users/1')
     */
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

    /**
     * Validates all properties of an object against its schema.
     *
     * Handles both explicit properties and pattern-based properties.
     *
     * @private
     * @param {Object} data - The data context
     * @param {Array} properties - Array of property definitions
     * @param {Array} patternProperties - Array of pattern-based property definitions
     * @param {Object} source - The object to validate
     * @param {string} path - Schema path
     * @throws {DataSchemaException} If required properties are missing or validation fails
     */
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

    /**
     * Validates data against its schema definition.
     *
     * This is the main entry point for schema validation. It checks the type
     * and applies any schema-level options like relationships.
     *
     * @private
     * @param {Object} data - The data context
     * @param {string} path - Schema path
     * @param {*} source - Data to validate
     * @throws {DataSchemaException} If schema validation fails
     * @example
     * validateSchema(data, 'users', { name: 'John', age: 30 })
     */
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

    /**
     * Handles update operations for data with position and method options.
     *
     * This method processes updates to nested data positions and array operations,
     * managing relationships and validation throughout.
     *
     * @private
     * @param {Object} data - The data context
     * @param {string} schemaPath - Current schema path
     * @param {*} source - Source data for the update
     * @param {Object} options - Update options
     * @param {string[]} [options.position] - Position path for nested updates
     * @param {string} [options.method] - Array operation method
     * @param {number} [options.startIndex] - Start index for splice
     * @param {number} [options.deleteCount] - Delete count for splice
     * @returns {Object} Result with complete and isValid flags
     * @example
     * // Update nested property
     * setDataUpdateOptions(data, 'users/1', 'John', { position: ['name'] })
     * @example
     * // Array push operation
     * setDataUpdateOptions(data, 'users/1/tags', 'tag1', { method: 'push' })
     */
    setDataUpdateOptions (data, schemaPath, source, options) {
      let target = data.target

      // set target to data collection
      if (data.id) {
        target = target[data.id]
      }

      let targetItem = target._item

      // update target position
      if (options.position && options.position.length) {
        const length = options.position.length - 1
        const lastKey = options.position[length]
        let path = schemaPath

        for (let i = 0; i < length; i++) {
          const key = options.position[i]
          path = path + '/' + key

          if (!targetItem[key]) {
            throw DataValueException.updatePositionNotFound(options.position.join('.'))
          }

          targetItem = targetItem[key]
        }

        // insert data
        if (!options.method) {
          this.validateSchema(data, path, source)

          // Check if targetItem is frozen and create a shallow copy if needed
          if (Object.isFrozen(targetItem)) {
            targetItem = shallowCopy(targetItem)
            // Update the parent reference to point to the copy
            if (options.position.length > 1) {
              let parent = data.target
              if (data.id) {
                parent = parent[data.id]
              }
              parent = parent._item
              for (let i = 0; i < length - 1; i++) {
                parent = parent[options.position[i]]
              }
              parent[options.position[length - 1]] = targetItem
            } else {
              // Direct parent is the target item
              if (data.id) {
                data.target[data.id]._item = targetItem
              } else {
                data.target._item = targetItem
              }
            }
          }

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
        if (options.position == null || !options.position.length) {
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
        // @ts-ignore
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

          // Note: relation is already handled in updateArray for each item
          // No need to validate source again here
        }

        return {
          complete: true,
          isValid: true
        }
      }
    },

    /**
     * Processes data setting options for collection types.
     *
     * This method handles collection-specific operations including ID generation,
     * merge/replace operations, and update operations for collection items.
     *
     * @private
     * @param {Object} data - The data context containing collection and target information
     * @param {*} source - Source data to set in the collection
     * @param {SetDataOptions} options - Options for data setting including merge, replace, and update
     * @returns {Object} Result with completion status and validation state
     * @throws {DataSchemaException} If collection ID is null or invalid
     * @example
     * setCollectionData(data, { name: 'John' }, { id: '123', merge: true })
     * @example
     * setCollectionData(data, { name: 'Jane' }, { replace: true })
     */
    setCollectionData (data, source, options) {
      if (Object.hasOwnProperty.call(options, 'id') && options.id == null) {
        throw new DataSchemaException({
          schemaPath: data.collection,
          keyword: 'collection',
          message: 'Expected collection id to be a string but got undefined'
        })
      }

      const schemaPath = `${data.collection}/items`
      const nestedSchema = this.getSchema(schemaPath)

      // Resolve ID
      let id = options.id

      if (id) {
        id = this.createCollectionId(data.collection, options)
      } else if (!options.merge && !options.replace) {
        id = this.createDefaultCollectionId(data.collection, options).id
      } else {
        id = null
      }

      data.id = id

      // Merge or replace collection
      if (options.merge || options.replace) {
        const wrappedSource = id ? { [id]: source } : source

        if (options.merge) {
          this.mergeCollectionItems(data, schemaPath, wrappedSource, options.metadata)
        } else {
          this.replaceCollectionItems(data, data.collection, wrappedSource, options.metadata)
        }

        return {
          complete: true,
          isValid: true
        }
      }

      // Create state management instance
      const instance = this.prepareTargetInstance(data.target[id], nestedSchema.type, options.metadata)
      data.target[id] = instance

      // Update data
      if (options.update) {
        return this.setDataUpdateOptions(data, schemaPath, source, options.update)
      }

      this.validateSchema(data, schemaPath, source)
      instance._item = source

      return {
        complete: true,
        isValid: true
      }
    },

    /**
     * Processes data setting options for standard (non-collection) types.
     *
     * This method handles standard data operations including merge, replace, and update
     * operations for non-collection data types like objects and arrays.
     *
     * @private
     * @param {Object} data - The data context containing collection and target information
     * @param {*} source - Source data to set
     * @param {SetDataOptions} options - Options for data setting including merge, replace, and update
     * @param {SchemaEntry} schema - The schema definition for the data type
     * @returns {Object} Result with completion status and validation state
     * @example
     * setStandardData(data, { name: 'John' }, { merge: true }, schema)
     * @example
     * setStandardData(data, ['a', 'b'], { replace: true }, schema)
     */
    setStandardData (data, source, options, schema) {
      let schemaPath = data.collection
      let targetSchema = schema

      // If array and not merging, we drill down to items
      if (schema.type === 'array' && !options.merge) {
        schemaPath = schemaPath + '/items'
        targetSchema = this.getSchema(schemaPath)
      }

      // Merge or replace data
      if (options.merge || options.replace) {
        if (options.merge && data.target._item) {
          this.mergeItems(data, schemaPath, source, options)
        } else {
          this.validateDataType(data, schemaPath, source, targetSchema.type)

          const target = data.target

          if (target) {
            // backup previous value
            target._previous = target._item
            target._item = deepClone(source, true)
          } else {
            // create new target
            data.target = this.createTarget(targetSchema.type, options.metadata)
            data.target._item = deepClone(source, true)
          }
        }

        return {
          complete: true,
          isValid: true
        }
      }

      // Create state management instance
      const instance = this.prepareTargetInstance(data.target, targetSchema.type, options.metadata)
      data.target = instance

      // Update data
      if (options.update) {
        return this.setDataUpdateOptions(data, schemaPath, source, options.update)
      }

      this.validateSchema(data, schemaPath, source)

      if (targetSchema.type === 'array') {
        return this.setDataUpdateOptions(data, schemaPath, source, { method: 'push' })
      }

      // Set data
      instance._item = source

      return {
        complete: true,
        isValid: true
      }
    },

    /**
     * Processes data setting options and determines the appropriate action.
     *
     * This method handles merge, replace, ID generation, and update operations
     * based on the provided options. It's the main coordinator for data setting.
     *
     * @private
     * @param {Object} data - The data context
     * @param {*} source - Source data to set
     * @param {SetDataOptions} options - Options for data setting
     * @returns {Object} Result with completion status and validation state
     * @throws {DataSchemaException} If collection ID is null
     * @example
     * setDataOptions(data, { name: 'John' }, { id: '123', merge: true })
     * @example
     * setDataOptions(data, { name: 'John' }, { replace: true })
     */
    setDataOptions (data, source, options) {
      const schema = this.getSchema(data.collection)

      if (schema.type === 'collection') {
        return this.setCollectionData(data, source, options)
      }

      return this.setStandardData(data, source, options, schema)
    },

    /**
     * Helper: Handles history preservation (Snapshotting).
     */
    prepareTargetInstance (previousTarget, schemaType, metadata) {
      // SCENARIO 1: No previous data exists
      if (!previousTarget) {
        return this.createTarget(schemaType, metadata)
      }

      // SCENARIO 2: Existing state has an item (In-place update/history shift)
      if (previousTarget._item) {
        const result = this.createTarget(schemaType, metadata, previousTarget)

        // Move current state to history
        previousTarget._previous = {
          _item: previousTarget._item,
          _metadata: previousTarget._metadata
        }

        // Update current metadata
        previousTarget._metadata = result._metadata

        return previousTarget // Mutated in place
      }

      // SCENARIO 3: Existing state is a raw value (Wrapping logic)
      const newDataInstance = this.createTarget(schemaType, metadata)
      const snapshot = this.createTarget(schemaType, metadata)

      snapshot._item = previousTarget
      newDataInstance._previous = snapshot

      return newDataInstance
    },

    /**
     * Adds a relationship between two data items.
     *
     * This method creates bidirectional relationships by storing both:
     * 1. What data references other data (relations)
     * 2. Where data is being referenced (relationsInUse)
     *
     * @private
     * @param {string} collection - Primary collection name
     * @param {string} docId - Primary document ID
     * @param {string} refCollection - Foreign collection name
     * @param {string} refId - Foreign document ID
     * @example
     * // User '123' has a reference to profile '456'
     * addRelation('users', '123', 'profiles', '456')
     * // Results in:
     * // relations['users/123'] = ['profiles/456']
     * // relationsInUse['profiles/456'] = ['users/123']
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
     *
     * This method provides access to event handlers that are triggered
     * when data changes occur.
     *
     * @private
     * @param {string} name - Collection name
     * @param {'update'|'delete'} on - Event trigger type
     * @param {string} [id] - Optional handler ID to get specific handler
     * @returns {Object|Function} The handler object or specific handler function
     * @example
     * // Get all handlers for users collection update events
     * getHandler('users', 'update')
     * @example
     * // Get specific handler by ID
     * getHandler('users', 'update', 'handler123')
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
     *
     * This method recursively loads related data and adds it to the result's
     * expand array, preventing infinite loops and duplicates.
     *
     * @private
     * @param {string} name - Name of data collection
     * @param {DataValue<*>} result - Data result to expand
     * @param {GetDataOption} [options] - Options for data expansion
     * @example
     * // Get user with expanded profile and posts
     * getExpandedData('users', userResult, { expand: true })
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
     * Internal helper to set the listener into the correct storage array
     * and handle initialization and priority sorting.
     *
     * This method manages the core logic for storing event listeners in the state system.
     * It handles both priority-based and standard (non-priority) listeners, initializes
     * storage arrays when needed, and maintains proper sorting for priority listeners.
     *
     * @private
     * @param {Object} params - Parameters for registering a listener
     * @param {string} params.name - The collection name the listener is attached to
     * @param {string} [params.id] - Optional document ID for item-specific listeners
     * @param {'update'|'delete'} params.on - The event type (update or delete)
     * @param {number} [params.priority] - Optional priority value for ordered execution
     * @param {Object} params.listenerItem - The listener object containing the handler function
     * @param {Object} params.listenersContext - The context object containing items and priority arrays
     * @param {Object} params.handlersMap - The handlers map to store the executable handler
     * @param {string} params.handlerId - The unique ID for this handler
     * @param {Function} params.executableHandler - The actual function to execute when the event fires
     * @returns {string} The final handler ID (may be modified with prefix if ID is provided)
     * @example
     * // Register a priority listener
     * registerListener({
     *   name: 'users',
     *   id: '123',
     *   on: 'update',
     *   priority: 10,
     *   listenerItem: { value: handlerFunc },
     *   listenersContext: { items: [], priority: [] },
     *   handlersMap: {},
     *   handlerId: 'abc123',
     *   executableHandler: handlerFunc
     * })
     */
    registerListener ({
      name,
      id,
      on,
      priority,
      listenerItem,
      listenersContext,
      handlersMap,
      handlerId,
      executableHandler
    }) {
      // Initialize storage arrays if they don't exist
      if (!listenersContext.items) {
        const newItems = []
        const newPriority = []

        // Update the context reference
        listenersContext.items = newItems
        listenersContext.priority = newPriority

        // Update the main state storage
        if (id) {
          this.listeners[on].items[name][id] = newItems
          this.listeners[on].priority[name][id] = newPriority
        } else {
          this.listeners[on].items[name] = newItems
          this.listeners[on].priority[name] = newPriority
        }
      }

      // Register handler function to map
      handlersMap[handlerId] = executableHandler

      // Add to Standard Items (No Priority)
      if (isNaN(priority)) {
        listenersContext.items.push(listenerItem)
        return handlerId
      }

      // Add to priority items (With Sorting)
      listenerItem.priority = priority
      listenersContext.priority.push(listenerItem)

      // Sort ascending by priority
      listenersContext.priority.sort((a, b) => {
        return a.priority - b.priority
      })

      return handlerId
    },

    /**
     * Removes a listener from a data collection event.
     *
     * This is the internal implementation that handles the actual removal logic.
     * It searches through items, priority, and all arrays to find and remove the handler.
     *
     * @private
     * @param {Object} params - Parameters object
     * @param {string} params.name - Data collection name
     * @param {string} [params.id] - Data collection Id
     * @param {'update'|'delete'} params.on - Data event name
     * @param {string} params.handlerId - The reference handler ID to remove
     * @returns {boolean} True if handler was found and removed, false otherwise
     * @example
     * unregisterListener({ name: 'users', id: '123', on: 'update', handlerId: 'abc123' })
     */
    unregisterListener ({
      name,
      id,
      on,
      handlerId
    }) {
      const listeners = this.getListeners(name, on, id)
      const handler = this.getHandler(name, on, handlerId)

      if (handler == null) {
        return false
      }

      // Remove from items array
      if (Array.isArray(listeners.items)) {
        const itemsIndex = listeners.items.findIndex(item => item.value === handler)
        if (itemsIndex !== -1) {
          listeners.items.splice(itemsIndex, 1)
        }
      }

      // Remove from priority array
      if (Array.isArray(listeners.priority)) {
        const priorityIndex = listeners.priority.findIndex(item => item.value === handler)
        if (priorityIndex !== -1) {
          listeners.priority.splice(priorityIndex, 1)
        }
      }

      // Remove from all array
      if (Array.isArray(listeners.all)) {
        const allIndex = listeners.all.findIndex(item => item.value === handler)
        if (allIndex !== -1) {
          listeners.all.splice(allIndex, 1)
        }
      }

      // Delete from handlers map
      delete this.handlers[on][name][handlerId]

      return true
    },

    /**
     * Retrieves event listeners for a collection.
     *
     * This method returns all listeners (priority, items, and capture-all)
     * for a specific collection and event type.
     *
     * @private
     * @param {string} name - Data collection name
     * @param {'update'|'delete'} on - Event trigger
     * @param {string} [id] - Optional data collection ID for item-specific listeners
     * @returns {DataListenerCollection} Object containing all listener types
     * @throws {Error} If the listener target is not found
     * @example
     * // Get all listeners for users collection
     * getListeners('users', 'update')
     * @example
     * // Get listeners for specific user ID
     * getListeners('users', 'update', '123')
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
     * Dispatches an event to all registered listeners.
     *
     * This method notifies all listeners of a data change event, respecting
     * priority order and propagation settings.
     *
     * @private
     * @param {string} name - Collection name
     * @param {'update'|'delete'} on - Event name
     * @param {DataValue<*>} item - Value that is being set or deleted
     * @param {boolean} [stopPropagation] - Prevents further propagation of the update event
     * @example
     * // Dispatch update event for user
     * dispatchEvent('users', 'update', userResult)
     * @example
     * // Dispatch with propagation stopped
     * dispatchEvent('users', 'update', userResult, true)
     */
    dispatchEvent (name, on, item, stopPropagation) {
      const { all, priority, items } = this.getListeners(name, on, item.id)

      if (Array.isArray(priority)) {
        for (let i = 0; i < priority.length; i++) {
          const handler = priority[i]

          if (!stopPropagation || handler.force) {
            handler.value(item)
          }
        }
      }

      if (Array.isArray(items)) {
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
     * Merges primitive collection items into the data target.
     *
     * This method handles merging for non-object/non-array collection items
     * (like strings or numbers) into the state.
     *
     * @private
     * @param {Object} data - The data context
     * @param {string} path - Schema path
     * @param {Object} sources - Object containing items to merge (keyed by ID)
     * @param {DataMetadata} metadata - Metadata to apply to items
     * @example
     * mergeCollectionPrimitiveItems(data, 'users/tags', { '1': 'tag1', '2': 'tag2' }, { userId: '123' })
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

    /**
     * Merges items into a non-collection data target.
     *
     * This method merges new data with existing data, preserving previous values
     * and handling both object and primitive types.
     *
     * @private
     * @param {Object} data - The data context
     * @param {string} path - Schema path
     * @param {*} sources - Data to merge
     * @param {SetDataOptions} options - Options for data setting including metadata
     * @example
     * // Merge objects
     * mergeItems(data, 'users/1/profile', { name: 'John', age: 30 }, { userId: '123' })
     * @example
     * // Merge primitives
     * mergeItems(data, 'users/1/age', 25, { userId: '123' })
     */
    mergeItems (data, path, sources, options) {
      const schema = this.getSchema(path)
      const schemaType = schema.type

      if (schemaType !== 'object' && schemaType !=='array') {
        this.validateDataType(data, path, sources, schemaType)

        const target = data.target

        if (target) {
          // backup previous value
          target._previous = target._item
          target._item = deepClone(sources, true)
        } else {
          // create new target
          data.target = this.createTarget(schemaType, options.metadata)
          data.target._item = deepClone(sources, true)
        }

        return
      }

      const hasTarget = Boolean(data.target && data.target._item)
      let targetItem

      if (hasTarget) {
        targetItem = shallowCopy(data.target._item)
      } else {
        targetItem = schemaType === 'object' ? {} : []
      }

      if (schemaType === 'array') {
        let relation

        if (schema.options && schema.options.relation) {
          relation = {
            target: data.collection,
            id: data.id,
            source: schema.options.relation
          }
        }

        this.updateArray(targetItem, sources, { method: 'push' }, relation)
      } else {
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
      }

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
     * Merges collection items into the state.
     *
     * This method handles merging for collection data, supporting both
     * object/array items and primitive items.
     *
     * @private
     * @param {Object} data - The data context
     * @param {string} path - Schema path
     * @param {Object} sources - Object containing items to merge (keyed by ID)
     * @param {DataMetadata} metadata - Metadata to apply to items
     * @example
     * // Merge user profiles
     * mergeCollectionItems(data, 'users/profiles', { '1': { name: 'John' } }, { userId: '123' })
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
     * Removes a relationship between two data items.
     *
     * This method removes bidirectional relationships by updating both:
     * 1. What data references other data (relations)
     * 2. Where data is being referenced (relationsInUse)
     *
     * @private
     * @param {string} collection - Primary collection name
     * @param {string} docId - Primary document ID
     * @param {string} refCollection - Foreign collection name
     * @param {string} refId - Foreign document ID
     * @example
     * // Remove relationship between user '123' and profile '456'
     * removeRelation('users', '123', 'profiles', '456')
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
     *
     * This method wraps data in the internal collection item structure,
     * preserving previous values if they exist.
     *
     * @private
     * @param {Object} collection - The collection to create the item in
     * @param {object} data - The data to use for the new item
     * @param {string} [id] - Optional ID for the new item within the collection
     * @returns {Object} The created collection item object
     * @example
     * createCollectionItem({}, { name: 'John' }, '123')
     * // Returns { _item: { name: 'John' }, _metadata: {} }
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
     *
     * @param {string} path - The schema path to retrieve
     * @returns {SchemaEntry} The schema entry for the given path
     * @example
     * getSchema('users') // Returns schema for users collection
     * getSchema('users/items') // Returns schema for user items
     */
    getSchema (path) {
      return this.schema[path]
    },

    /**
     * Sets data without schema validation.
     *
     * This method provides a way to set data directly without validation,
     * useful for internal operations or when data is already validated.
     * @template T
     * @overload
     * @param {UnsafeSetValueParamsWithId} param
     * @returns {DataValue<DataValue<T>>}
     *
     * @overload
     * @param {UnsafeSetValueParamsWithoutId} param
     * @returns {DataValue<DataValue<T>[]>}
     *
     * @param {UnsafeSetValueParamsWithId | UnsafeSetValueParamsWithoutId} param
     * @returns {DataValue<T[]> | DataValue<T>} The created data value(s)
     * @example
     * unsafeSetValue({ name: 'users/profiles', value: { name: 'John' }, options: { id: '123' } })
     * @example
     * unsafeSetValue({ name: 'users/profiles', value: { userId_1: { name: 'John' } }, options: { replace: true } })
     */
    unsafeSetValue ({ name, value, options = {} }) {
      const collection = this.values[name]

      // update entire collection
      const schema = this.getSchema(name)

      if (schema.type === 'collection') {
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

        const values = []
        let replacement = collection
        const result = createDataValue({
          collection: name,
          value: values
        })

        if (options.replace) {
          replacement = Object.create(null)
        }

        for (const [id, entry] of Object.entries(value)) {
          const item = this.createCollectionItem(collection, entry, id)
          // set new value
          replacement[id] = item

          const result = createDataValue({
            collection: name,
            id,
            value: item
          })
          values.push(result)
          this.dispatchEvent(name, 'update', result, options.stopPropagation)
        }

        // update collection
        this.values[name] = replacement

        result.isEmpty = !values.length

        return result
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
       *
       * @returns {string} A unique ID string
       * @example
       * generateId() // Returns something like 'abc123def456'
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
       *
       * @param {Object} param - Parameters object
       * @param {string} param.name - Name of collection to search
       * @param {DataWhere[]} [param.where] - Filter conditions
       * @param {GetDataOption} [param.options] - Additional options for retrieval
       * @returns {DataValue<*>[]} Array of matching data values
       * @example
       * find({ name: 'users', where: [{ name: 'status', op: '==', value: 'active' }] })
       * @example
       * find({ name: 'users', options: { expand: true } })
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
       *
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
       * @example
       * addListener({ name: 'users', id: '123', on: 'update', handler: 'myAction' })
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

        // check if we've selected a collection
        if (captureAll || (!Array.isArray(listeners.items) && typeof listeners.items === 'object')) {
          listeners.all.push(item)

          handlers[handlerId] = handler

          return handlerId
        }

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
       *
       * @param {Object} param - Parameters object
       * @param {string} param.name - Data collection name
       * @param {string} [param.id] - Data collection Id
       * @param {'update'|'delete'} [param.on='update'] - Data event name
       * @param {string} param.handlerId - The reference handler ID to remove
       * @example
       * deleteListener({ name: 'users', id: '123', on: 'update', handlerId: 'abc123' })
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

        if (Array.isArray(listeners.items)) {
          const handlerIndex = listeners.items.indexOf(handler)
          const handlerPriorityIndex = listeners.priority.indexOf(handler)

          // remove handler
          if (handlerIndex !== -1) {
            listeners.items.splice(handlerIndex, 1)
          }

          if (handlerPriorityIndex !== -1) {
            listeners.priority.splice(handlerPriorityIndex, 1)
          }
        }

        const handlerIndex = listeners.all.indexOf(handler)

        if (handlerIndex !== -1) {
          listeners.all.splice(handlerIndex, 1)
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
       *
       * @param {Object} param - Parameters object
       * @param {string} param.name - Collection name
       * @param {string} param.id - Document ID to delete
       * @param {boolean} [param.cascade] - Whether to delete related data
       * @param {boolean} [param.listeners] - Whether to delete related listeners
       * @param {boolean} [param.stopPropagation] - Whether to stop event propagation
       * @returns {DataDeleteValueResult} Result indicating if data was deleted or is in use
       * @example
       * deleteValue({ name: 'users', id: '123', cascade: true })
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
       * @overload
       * @param {GetValueQueryWithId} query
       * @returns {DataValue<*>}
       *
       * @overload
       * @param {GetValueQueryWithoutId} query
       * @returns {DataValue<*>[]}
       *
       * Retrieves data values from the state with optional filtering and expansion.
       *
       * @param {GetValueQueryWithId | GetValueQueryWithoutId} query - Query parameters
       * @returns {DataValue<*>[] | DataValue<*>} The retrieved data value(s)
       * @example
       * getValue({ name: 'users', id: '123' })
       * @example
       * getValue({ name: 'users', options: { expand: true, clone: true } })
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
            /** @type {DataValue<*>} */
            const result = createDataValue({
              collection: name,
              id,
              value
            })

            for (const [id, entry] of Object.entries(collection)) {
              value.push(createDataValue({
                collection: name,
                id,
                value: entry
              }))
            }

            result.isEmpty = !value.length

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
          const value = getValue(result.item, options.position)

          result.isEmpty = !value
          result.item = value
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
       *
       * @param {Object} param - Parameters object
       * @param {string} param.name - Name of collection
       * @param {*} param.value - Data to be set
       * @param {SetDataOptions} [param.options] - Set data options
       * @returns {DataValue<*>} The created data value
       * @example
       * setValue({ name: 'users', value: { name: 'John' }, options: { id: '123' } })
       * @example
       * setValue({ name: 'users', value: { name: 'Jane' }, options: { id: '123', merge: true } })
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
   *
   * This method initializes the state management system with provided schemas,
   * default values, and prepares the internal data structures.
   *
   * @param {DsPluginStateExport} state - The state export containing values, schemas, and defaults
   * @example
   * setup({
   *   _values: { users: {} },
   *   _names: ['users'],
   *   _items: [{ name: 'users', entries: [...], isCollection: true }],
   *   _defaults: []
   * })
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
