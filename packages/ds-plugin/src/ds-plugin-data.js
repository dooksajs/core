import { definePlugin } from '@dooksa/ds-scripts'
import { deepClone, uuid } from '@dooksa/utils'
import DataResult from './utils/DataResult.js'

function SchemaException (details) {
  this.details = details
  this.name = 'SchemaException'
}

/**
 * Data app id, it is a combination of the plugin name and data key
 * @typedef {string} dsDataId
 */

/**
 * This callback is executed when a given function succeeds
 * @callback onSuccess
 * @param {*} result - The result of the parent function
 */

/**
 * This callback is executed when a given function fails
 * @callback onError
 * @param {Object} response
 * @param {number} response.code
 * @param {string} response.message
 */

/**
 * @typedef {Object} DsSetDataOptions
 * @property {string} [id] - Document Id
 * @property {Object} [metadata] - Document metadata
 * @property {boolean} [stopPropagation] - Prevents further propagation of the update event
 * @property {boolean} [merge] - Merge target with source
 * @property {Object} [update] - Update target with source
 * @property {(string[] & number[]) | (string[] | number[])} [update.position] - Update nested data within target with source
 * @property {'push'|'pull'|'pop'|'shift'|'unshift'|'splice'} [update.method] - Type of update method
 */

/**
 * @typedef {import('@dooksa/ds-scripts/src/types.js').DsDataWhere} DsDataWhere
 */

export default definePlugin({
  name: 'dsData',
  version: 1,
  dependencies: [
    {
      name: 'dsOperator',
      version: 1
    }
  ],
  data: {
    'data/listener/delete': {
      private: true,
      schema: {
        type: 'object'
      }
    },
    'data/listener/delete/priority': {
      private: true,
      schema: {
        type: 'object'
      }
    },
    'data/listener/update': {
      private: true,
      schema: {
        type: 'object'
      }
    },
    'data/listener/update/priority': {
      private: true,
      schema: {
        type: 'object'
      }
    },
    'data/handler/delete': {
      private: true,
      schema: {
        type: 'object'
      }
    },
    'data/handler/update': {
      private: true,
      schema: {
        type: 'object'
      }
    },
    values: {
      private: true,
      schema: {
        type: 'object'
      }
    },
    schema: {
      private: true,
      schema: {
        type: 'object'
      }
    },
    relation: {
      private: true,
      schema: {
        type: 'object'
      }
    },
    relationUsed: {
      private: true,
      schema: {
        type: 'object'
      }
    },
    collection: {
      private: true,
      schema: {
        type: 'object'
      }
    }
  },
  methods: {
    $addDataListener: {
      /**
       * Add data listener
       * @alias DsPluginData~$addDataListener
       * @param {string} name - Collection name
       * @param {Object} param
       * @param {string} param.on - Data event name
       * @param {string} param.id - Data collection Id
       * @param {number} param.priority
       * @param {Object} param.handler
       * @param {string} param.handler.id - Id of handler
       * @param {Function|dsActionId} param.handler.value - Function or action that will be called
       */
      value (name, { on, id, priority, handler }) {
        const listeners = this._getListeners(name, on, id)

        // set default listener value
        if (!listeners.items) {
          const type = 'data/listener/' + on

          if (id) {
            this[type][name][id] = []
            this[type + '/priority'][name][id] = []

            listeners.items = this[type][name][id] = []
            listeners.priority = this[type + '/priority'][name][id] = []
          } else {
            this[type][name] = []
            this[type + '/priority'][name] = []

            listeners.items = this[type][name]
            listeners.priority = this[type + '/priority'][name]
          }
        }

        const handlers = this['data/handler/' + on][name]

        let handlerId = handler.id

        if (id) {
          handlerId = id + handler.id
        }

        // add listener
        if (!handlers[handlerId]) {
          if (!priority) {
            listeners.items.push(handler.value)
            handlers[handlerId] = handler.value

            return
          }

          listeners.priority.push({
            priority,
            value: handler.value
          })

          listeners.priority.sort((a, b) => a.priority - b.priority)

          handlers[handlerId] = handler.value
        }
      },
      export: true
    },
    /**
     * Delete data listeners
     * @param {string} name - Data collection name
     * @param {Object} item
     * @param {string} item.on - Data event name
     * @param {string} item.id - Data collection Id
     * @param {string} item.handlerId - The reference handler Id that will be removed
     */
    $deleteDataListener (name, { on, id, handlerId }) {
      const listeners = this._getListeners(name, on, id)

      if (id) {
        handlerId = id + handlerId
      }

      const handler = this['data/handler/' + on][name][handlerId]
      const handlerIndex = listeners.items.indexOf(handler)
      const handlerPriorityIndex = listeners.priority.indexOf(handler)
      let hadHandler = false

      // remove handler
      if (handlerIndex !== -1) {
        listeners.items.splice(handlerIndex, 1)

        hadHandler = true
      }

      if (handlerPriorityIndex !== -1) {
        listeners.priority.splice(handlerIndex, 1)

        hadHandler = true
      }

      if (hadHandler) {
        delete this['data/handler/' + on][name][handlerId]
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
      const collection = this.values[name]

      if (collection == null) {
        throw new SchemaException({
          schemaPath: name,
          keyword: 'schema',
          message: 'Collection not found'
        })
      }

      const relationName = name + '/' + id

      // check if data is in use
      if (this.relationUsed[relationName]) {
        return {
          inUse: true,
          deleted: false
        }
      }

      // check if we can clean up related data
      const relations = this.relation[relationName]

      if (relations) {
        for (let i = 0; i < relations.length; i++) {
          const usedRelationName = relations[i]
          const usedRelations = this.relationUsed[usedRelationName]

          if (usedRelations && usedRelations.length) {
            // remove relationship
            this.relationUsed[usedRelationName] = usedRelations.filter(item => item !== relationName)

            // clear up data if not in use
            if (!this.relationUsed[usedRelationName].length) {
              const splitName = usedRelationName.split('/')

              delete this.relationUsed[usedRelationName]

              if (cascade) {
                this.$deleteDataValue(splitName[0] + '/' + splitName[1], splitName[2], { cascade })
              }

              relations.splice(i, 1)
              i--
            }
          }
        }

        if (!relations.length) {
          delete this.relation[relationName]
        }
      }

      if (collection[id]) {
        delete collection[id]

        this._onDelete(name, id)
      }

      return {
        inUse: false,
        deleted: true
      }
    },
    $getDataValue: {
      /**
       * Get data value
       * @alias $getDataValue
       * @param {string} name - Name of collection
       * @param {Object} [param]
       * @param {string} [param.id] - Data collection document id
       * @param {string} [param.prefixId] - Data collection document prefix
       * @param {string} [param.suffixId] - Data collection document suffix
       * @param {Object} [param.options] - Options
       * @param {boolean} [param.options.expand] - Expand all relational data
       * @param {Object} [param.options.expandExclude] - Exclude items from expanding
       * @param {boolean} [param.options.expandClone] - Expanded items returns a deep clone of the item value
       * @param {string|number} [param.options.position] - Return the value by key of the data value
       * @param {boolean} [param.options.clone] - Returns a deep clone of the item value
       * @returns {DataResult}
       */
      value (name, { id, prefixId, suffixId, options } = {}) {
        if (this.values[name] == null) {
          this.$log('error', { message: 'No such collection: ' + name, code: 44 })

          // create result
          const result = new DataResult(name, id)

          result.isCollectionEmpty = true

          return result
        }

        const result = new DataResult(name, id)
        const schema = this.schema[name]

        if (schema.type === 'collection' && id == null) {
          result.isEmpty = true

          return result
        }

        if (id != null) {
          // find document using custom affixes
          if (prefixId || suffixId) {
            let itemId

            if (prefixId && suffixId) {
              const prefix = this._affixId(prefixId)
              const suffix = this._affixId(suffixId)

              itemId = prefix + id + suffix
            } else if (prefixId) {
              const prefix = this._affixId(prefixId)

              itemId = prefix + id
            } else if (suffixId) {
              const suffix = this._affixId(suffixId)

              itemId = id + suffix
            }

            const value = this.values[name][itemId]

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
            if (this.values[name][id] == null && schema.id) {
              if (schema.id.prefix && schema.id.suffix) {
                const prefix = this._affixId(schema.id.prefix)
                const suffix = this._affixId(schema.id.suffix)

                itemId = prefix + id + suffix
              } else if (schema.id.prefix) {
                const prefix = this._affixId(schema.id.prefix)

                itemId = prefix + id
              } else {
                const suffix = this._affixId(schema.id.suffix)

                itemId = id + suffix
              }
            }

            const value = this.values[name][itemId]

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
          result.item = this.values[name]
        }

        if (result.item == null) {
          return result
        }

        result.isEmpty = false

        if (!options) {
          return result
        }

        const relations = this.relation[name + '/' + result.id]

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
            const id = item[2]
            const value = this.$getDataValue(name, {
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
      export: true
    },
    $setDataValue: {
      /**
       * Set data value
       * @alias $setDataValue
       * @param {string} name - Name of collection
       * @param {*} data - Data to be set
       * @param {DsSetDataOptions} options - Set data options
       * @returns {DataResult}
       */
      value (name, data, options) {
        try {
          const schema = this.schema[name]

          if (!schema) {
            throw new SchemaException({
              schemaPath: name,
              keyword: 'schema',
              message: 'Schema not found'
            })
          }

          if (data == null) {
            throw new SchemaException({
              schemaPath: name,
              keyword: 'source',
              message: 'Source was undefined'
            })
          }

          let result = { collection: name }
          let target = this.values[name]

          if (target == null) {
            // set default value
            target = this._types(schema.type)
          }

          result = this._setData(
            name,
            target,
            data._item || data,
            options
          )

          // set new value
          this.values[name] = result.target

          // notify listeners
          if (!options || !options.stopPropagation) {
            this._onUpdate(name, result)
          }

          return {
            collection: name,
            id: result.id,
            noAffixId: result.noAffixId,
            item: result.item,
            previous: result.previous,
            isValid: true,
            metadata: result.metadata
          }
        } catch (errorMessage) {
          console.error(errorMessage)

          if (errorMessage.name === 'SchemaException') {
            return {
              isValid: false,
              error: errorMessage
            }
          }

          return {
            isValid: false,
            error: {
              details: errorMessage,
              name: 'Error'
            }
          }
        }
      },
      export: true
    },
    /**
     * Add data and its data type
     * @param {Object} data
     */
    add (data) {
      if (data.schema) {
        this._addSchema(data.schema)
      }

      const id = data.id

      // add values
      this.values[id] = data.default ?? this._types(data.type)

      // prepare listeners
      if (data.collection) {
        this['data/listener/update'][id] = {}
        this['data/listener/delete'][id] = {}
        this['data/listener/update/priority'][id] = {}
        this['data/listener/delete/priority'][id] = {}
      } else {
        this['data/listener/update'][id] = []
        this['data/listener/delete'][id] = []
        this['data/listener/update/priority'][id] = []
        this['data/listener/delete/priority'][id] = []
      }

      this['data/handler/update'][id] = {}
      this['data/handler/delete'][id] = {}
    },
    /**
     * Generate a unique id
     * @returns {string}
     */
    generateId () {
      return '_' + uuid() + '_'
    },
    /**
     * Retrieve all entities from collection
     * @param {Object} param
     * @param {string} param.name - Name of collection
     * @param {DsDataWhere[]} param.where
     */
    find ({ name, where }) {
      const values = this.values[name]

      if (values == null) {
        this.$log('error', { message: 'No such collection: ' + name, code: 44 })

        // create result
        const result = new DataResult(name)

        result.isEmpty = true

        return result
      }

      const schema = this.schema[name]

      if (schema.type === 'collection') {
        const valueItems = []

        for (const id in values) {
          if (Object.hasOwnProperty.call(values, id)) {
            const value = values[id]
            const dataResult = new DataResult(name, id)
            let isValid = true

            if (where) {
              isValid = this._filter(dataResult, where)
            }

            if (!isValid) {
              continue
            }

            dataResult.isEmpty = false
            dataResult.isCollection = false
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
        isValid = this._filter(result, where)
      }

      if (!isValid) {
        result.isEmpty = true

        return result
      }

      return [result]
    },
    unsafeSetData ({ name, data, options }) {
      const result = new DataResult(name, options.id)

      if (options) {
        if (options.id == null) {
          // update collection
          this.values[name] = data

          result.item = data
        } else {
          result.item = data._item || data

          const value = this.values[name][options.id] || {}

          this.values[name][options.id] = {
            _item: data._item || data,
            _metadata: data._metadata || value._metadata || {}
          }
        }
      } else {
        // update collection
        this.values[name] = data

        result.item = data
      }

      return result
    },
    _addSchema (schema) {
      for (let i = 0; i < schema.length; i++) {
        const item = schema[i]

        this.schema[item.id] = item.entry
      }
    },
    _affixId (affix) {
      if (typeof affix === 'function') {
        return affix()
      }

      return affix || ''
    },
    /**
     * Change the target the source will be applied to
     * @private
     * @param {string} name - Schema path
     * @param {*} target - The original target
     * @param {string|number} position - The key used to change target
     * @param {string} type - Data type
     * @returns {*} New target
     */
    _changeTarget (name, target, position, type) {
      const newTarget = target[position]

      if (newTarget) {
        return newTarget
      } else if (!newTarget && type) {
        target[position] = this._types(type)

        return target[position]
      } else {
        throw new SchemaException({
          schemaPath: name,
          keyword: 'optionTargetPosition',
          message: 'Target position undefined'
        })
      }
    },
    /**
     * Check if the source exists in the target array
     * @private
     * @param {string} name - Schema path
     * @param {Array} target - Target array
     * @param {*} source - Source to be found in array
     */
    _checkArrayUniqueItem (name, source) {
      const hasDuplicates = this._containsDuplicates(source)

      if (hasDuplicates) {
        throw new SchemaException({
          schemaPath: name,
          keyword: 'uniqueItems',
          message: 'Type error: expected a unique item'
        })
      }
    },
    _checkCollectionItems (data, path, sources, metadata) {
      const schema = this.schema[path]
      const schemaCheck = '_schema/' + schema.type

      if (!this[schemaCheck]) {
        for (const id in sources) {
          if (Object.hasOwnProperty.call(sources, id)) {
            const clone = this._types(schema.type)
            const source = deepClone(clone, sources[id], true)
            const target = {
              _item: source._item || source,
              _metadata: source._metadata || metadata
            }

            this._checkType(path, target._item, schema.type)

            if (schema.options && schema.options.relation) {
              this._setRelation(data.collection, id, schema.options.relation, target._item)
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
          let resultItem = this._types(schema.type)
          let source = deepClone(this._types(schema.type), sources[id])
          const resultMetadata = source._metadata || metadata
          source = source._item || source

          this._checkType(path, source, schema.type)

          // set current merge root id
          data.id = id

          const target = data.target[id]

          // merge target and source objects
          if (target && target._item instanceof Object) {
            deepClone(resultItem, target)
            resultItem = resultItem._item

            for (const key in source) {
              if (Object.hasOwnProperty.call(source, key)) {
                resultItem[key] = source[key]
              }
            }
          } else {
            resultItem = source
          }

          this[schemaCheck](data, path, resultItem)

          // add new item value
          const result = this._createTarget(schema.type, resultMetadata)

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
     * Check data type
     * @private
     * @param {string} name - Schema path
     * @param {*} value - value to be checked
     * @param {string} type - Expected data type
     * @returns {boolean}
     */
    _checkType (path, value, type) {
      if (value == null) {
        throw new SchemaException({
          schemaPath: path,
          keyword: 'type',
          message: 'Unexpected type, expected "' + type + '" but got "undefined"'
        })
      }

      if (type === 'node') {
        if (value.nodeName && Object.isFrozen(value.nodeName)) {
          return true
        }

        throw new SchemaException({
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

      throw new SchemaException({
        schemaPath: path,
        keyword: 'type',
        message: 'Unexpected type, expected "' + type + '" but got "' + dataType + '"'
      })
    },
    _containsDuplicates (array) {
      for (let i = 0; i < array.length; i++) {
        const value = array[i]

        if (array.indexOf(value) !== array.lastIndexOf(value)) {
          return true
        }
      }

      return false
    },
    _createCollectionId (name, option) {
      const schema = this.schema[name]
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
          prefix = this._affixId(schema.id.prefix)
        }

        if (!suffix && schema.id.suffix) {
          suffix = this._affixId(schema.id.suffix)
        }

        if (!id) {
          if (schema.id.default) {
            return prefix + this._affixId(schema.id.default) + suffix
          } else {
            return prefix + this.generateId() + suffix
          }
        }
      }

      return prefix + id + suffix
    },
    _createTarget (type, metadata, target) {
      if (target == null) {
        target = {
          _item: this._types(type),
          _metadata: {}
        }
      }

      target._metadata = this._setMetadata(target._metadata, metadata)

      return target
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
    _defaultCollectionId (name, option = {}) {
      const schema = this.schema[name]
      let prefix = option.prefixId ?? ''
      let suffix = option.suffixId ?? ''

      if (schema.id) {
        if (!prefix && schema.id.prefix) {
          prefix = this._affixId(schema.id.prefix)
        }

        if (!suffix && schema.id.suffix) {
          suffix = this._affixId(schema.id.suffix)
        }

        if (schema.id.default) {
          const id = this._affixId(schema.id.default)

          return {
            id: prefix + id + suffix,
            noAffixId: id
          }
        } else {
          const id = this.generateId()

          return {
            id: prefix + id + suffix,
            noAffixId: id
          }
        }
      }

      const id = this.generateId()

      return {
        id: prefix + id + suffix,
        noAffixId: id
      }
    },
    /**
     * Filter data result based on condition
     * @private
     * @param {DataResult} data
     * @param {DsDataWhere} where
     * @returns {boolean}
     */
    _filter (data, where) {
      let isAndValid = false
      let isOrValid = false
      let isValid = false

      if (where.and) {
        for (let i = 0; i < where.and.length; i++) {
          const condition = where.and[i]

          if (condition.and || condition.or) {
            isAndValid = this._filter(data, condition)

            if (!isAndValid) {
              break
            }
          }

          isAndValid = this._filterValidateValue(data, condition)

          if (!isAndValid) {
            break
          }
        }
      }

      if (where.or) {
        for (let i = 0; i < where.or.length; i++) {
          const condition = where.or[i]

          if (condition.and || condition.or) {
            isOrValid = this._filter(data, condition)

            if (!isOrValid) {
              break
            }
          }

          isOrValid = this._filterValidateValue(data, condition)

          if (isOrValid) {
            break
          }
        }
      }

      if (where.name) {
        isValid = this._filterValidateValue(data, where)
      }

      return (isAndValid || isOrValid || isValid)
    },
    /**
     * Process where condition
     * @private
     * @param {DataResult} data - Data result
     * @param {DsDataWhere} condition - Where condition
     * @returns {Boolean}
     */
    _filterValidateValue (data, condition) {
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

      return this.$method('dsOperator/eval', {
        name: condition.op,
        values: [
          value,
          condition.value
        ]
      })
    },
    /**
     * Get data listeners
     * @param {string} name - Data collection name
     * @param {string} on - Event name
     * @param {string} id  - Data collection Id
     * @returns {Object} - list of handlers
     */
    _getListeners (name, on, id) {
      const type = 'data/listener/' + on
      const listenerType = this[type]

      if (!listenerType) {
        throw new Error('Data Listener type does not exist: "' + on + '"')
      }

      const listenerCollection = listenerType[name]

      if (!listenerCollection) {
        throw new Error('Could not find data collection listeners: "' + name + '"')
      }

      const listenerPriorityCollection = this[type + '/priority'][name]

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
    },
    /**
     * Process listeners on update event
     * @param {string} name - Collection name
     * @param {DataResult} item - Value that is being set
     */
    _onUpdate (name, item) {
      const listeners = this._getListeners(name, 'update', item.id)

      if (listeners.priority) {
        for (let i = 0; i < listeners.priority.length; i++) {
          listeners.priority[i].value(item)
        }
      }

      if (listeners.items) {
        for (let i = 0; i < listeners.items.length; i++) {
          listeners.items[i](item)
        }
      }
    },
    /**
     * Process listeners on delete event
     * @param {string} name - Collection name
     * @param {string} id - Data id
     */
    _onDelete (name, id) {
      let listeners = this['data/listener/delete'][name]

      if (id) {
        listeners = listeners[id]
      }

      if (listeners) {
        for (let i = 0; i < listeners.length; i++) {
          listeners[i](id)
        }
      }
    },
    _schemaArrayOption (path, source) {
      const schema = this.schema[path]

      if (schema.options.uniqueItems) {
        this._checkArrayUniqueItem(path, source)
      }
    },
    _schemaObjectOption (path, data) {
      const schema = this.schema[path]

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
          throw new SchemaException({
            schemaPath: path,
            keyword: 'additionalProperties',
            message: 'Additional properties are now allowed ' + JSON.stringify(additionalKeys)
          })
        }
      }
    },
    _schemaObjectPatternProperties (data, properties, propertiesChecked, source, path) {
      for (let i = 0; i < properties.length; i++) {
        const property = properties[i]

        for (const key in source) {
          if (Object.hasOwnProperty.call(source, key)) {
            if (propertiesChecked[key]) {
              continue
            }

            const regex = new RegExp(property.name)

            if (!regex.test(key)) {
              throw new SchemaException({
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
              const schema = this.schema[schemaName]

              if (schema) {
                this._checkType(schemaName, sourceItem, schema.type)

                const schemaValidationName = '_schema/' + schema.type

                this[schemaValidationName](data, schemaName, sourceItem)
              } else {
                const propertyOptions = property.options || {}

                if (propertyOptions.relation) {
                  this._setRelation(data.collection, data.id, propertyOptions.relation, sourceItem)
                }
              }
            }

            this._checkType(path, sourceItem, property.type)
          }
        }
      }
    },
    _schemaObjectProperties (data, properties, propertiesChecked, source, path) {
      for (let i = 0; i < properties.length; i++) {
        const property = properties[i]
        const propertyOptions = property.options || {}
        const value = source[property.name]

        // check if field is required
        if (propertyOptions.required && value == null) {
          throw new SchemaException({
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
            const schema = this.schema[schemaName]

            if (schema) {
              this._checkType(schemaName, sourceItem, schema.type)

              const schemaValidationName = '_schema/' + schema.type

              this[schemaValidationName](data, schemaName, sourceItem)
            } else {
              if (propertyOptions.relation) {
                this._setRelation(data.collection, data.id, propertyOptions.relation, value)
              }
            }
          }

          this._checkType(path, sourceItem, property.type)

          propertiesChecked[property.name] = true
        }
      }
    },
    '_schema/array' (data, path, source) {
      const schema = this.schema[path]

      if (schema.options) {
        this._schemaArrayOption(path, source)
      }

      // check if source is an array
      this._checkType(schema, source, schema.type)

      const schemaName = path + '/items'
      const schemaItems = this.schema[schemaName]

      // no validation
      if (!schemaItems) {
        return
      }

      const schemaValidationName = '_schema/' + schemaItems.type

      // freeze array
      Object.freeze(source)

      for (let i = 0; i < source.length; i++) {
        if (typeof this[schemaValidationName] !== 'function') {
          const item = source[i]
          // set relation for array of strings
          if (schemaItems.options && schemaItems.options.relation) {
            this._setRelation(data.collection, data.id, schemaItems.options.relation, source[i])
          }

          this._checkType(schemaName, source[i], schemaItems.type)

          // freeze array item
          if (typeof item === 'object') {
            Object.freeze(item)
          }
        } else {
          this[schemaValidationName](data, schemaName, source[i])
        }
      }
    },
    '_schema/object' (data, path, source) {
      const schema = this.schema[path]

      // no validation
      if (!schema.properties && !schema.patternProperties) {
        return
      }

      if (schema.options) {
        this._schemaObjectOption(path, source)
      }

      // freeze object
      Object.freeze(source)

      const propertiesChecked = {}

      if (schema.properties) {
        this._schemaObjectProperties(data, schema.properties, propertiesChecked, source, path)
      }

      if (schema.patternProperties) {
        this._schemaObjectPatternProperties(data, schema.patternProperties, propertiesChecked, source, path)
      }
    },
    _schemaValidation (data, path, source) {
      const schema = this.schema[path]

      /** @todo validate *any* until schema supports multi type schema */
      if (!schema) {
        return
      }

      const schemaValidationName = '_schema/' + schema.type

      // schema check depth
      if (typeof this[schemaValidationName] === 'function') {
        this[schemaValidationName](data, path, source)

        return
      }

      // type check
      this._checkType(path, source, schema.type)

      if (schema.options && schema.options.relation) {
        this._setRelation(data.collection, data.id, schema.options.relation, source)
      }
    },
    /**
     * Validate data
     * @param {string} collection
     * @param {*} target
     * @param {*} source
     * @param {DsSetDataOptions} [options]
     * @returns {Object}
     */
    _setData (collection, target, source, options) {
      const data = { target, collection }
      const schema = this.schema[collection]
      let isValid = true

      if (options) {
        const dataOptions = this['_setData/options'](data, source, options)

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
        const collectionId = this._defaultCollectionId(collection)

        // set doc id for relation data
        data.id = collectionId.id

        // validate source
        this._schemaValidation(data, schemaPath, source)

        /** @todo validate *any* until schema supports multi type schema */
        const type = this.schema[schemaPath] ? this.schema[schemaPath].type : 'object'
        const target = this._createTarget(type, source._metadata)

        target._item = source._item || source

        // set item in data target
        data.target[collectionId.id] = target

        result.id = collectionId.id
        result.noAffixId = collectionId.noAffixId
        result.item = target._item
        result.previous = target._previous
        result.metadata = target._metadata
      } else {
        this._schemaValidation(data, collection, source)

        /** @todo validate *any* until schema supports multi type schema */
        const type = this.schema[collection] ? this.schema[collection].type : 'object'
        const target = this._createTarget(type, source._metadata)

        target._item = source._item || source

        data.target = target

        result.target = target._item
        result.item = target._item
        result.previous = target._previous
        result.metadata = target._metadata
      }

      return result
    },
    '_setData/options' (data, source, options) {
      if (Object.hasOwnProperty.call(options, 'id') && options.id == null) {
        throw new SchemaException({
          schemaPath: data.collection,
          keyword: 'collection',
          message: 'Expected collection id to be a string but got undefined'
        })
      }

      let schemaPath = data.collection + '/items'
      const schema = this.schema[schemaPath]

      // process document id
      if (options.id) {
        const id = this._createCollectionId(data.collection, options)

        data.id = id

        if (options.merge) {
          this._checkCollectionItems(data, schemaPath, { [id]: source }, options.metadata)

          return {
            complete: true,
            isValid: true
          }
        }
      } else {
        if (options.merge) {
          this._checkCollectionItems(data, schemaPath, source, options.metadata)

          return {
            complete: true,
            isValid: true
          }
        }

        // create new id
        const collection = this._defaultCollectionId(data.collection, options)

        data.id = collection.id
        data.noAffixId = collection.noAffixId
      }

      const previousTarget = data.target[data.id]

      // store previous state
      if (previousTarget) {
        const result = this._createTarget(schema.type, options.metadata, previousTarget)

        previousTarget._previous = {
          _item: previousTarget._item,
          _metadata: previousTarget._metadata
        }

        previousTarget._metadata = result._metadata
      } else {
        data.target[data.id] = this._createTarget(schema.type, options.metadata)
      }

      // insert new data
      if (!options.update) {
        this._schemaValidation(data, schemaPath, source)

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
            return this.$log('error', { message: 'Update position does not exist' + options.update.position })
          }

          targetItem = targetItem[key]
        }

        // insert data
        if (!options.update.method) {
          this._schemaValidation(data, path, source)

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
            this.$log('error', { message: 'Update position and update method expected an array' })
          }
        }

        schemaPath = path
      }

      if (options.update.method) {
        if (!Array.isArray(targetItem)) {
          throw new SchemaException({
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
        const schemaItem = this.schema[schemaPathItem]
        const updateMethod = options.update.method

        // validate source
        if (schemaItem && (updateMethod === 'push' || updateMethod === 'unshift')) {
          const schemaValidationName = '_schema/' + schemaItem.type

          if (Array.isArray(source)) {
            for (let i = 0; i < source.length; i++) {
              const item = source[i]

              if (this[schemaValidationName]) {
                this[schemaValidationName](data, schemaPathItem, item)
              } else {
                this._checkType(schemaPathItem, item, schemaItem.type)
              }
            }
          } else {
            if (this[schemaValidationName]) {
              this[schemaValidationName](data, schemaPathItem, source)
            } else {
              this._checkType(schemaPathItem, source, schemaItem.type)
            }
          }
        }

        // update target array
        this._updateArray(targetItem, source, options.update)

        // check schema options of array
        const schema = this.schema[schemaPath]

        // ISSUE: containsDuplicates expects an array
        if (schema && schema.options) {
          if (schema.options.uniqueItems) {
            const hasDuplicates = this._containsDuplicates(targetItem)

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
            this._setRelation(data.collection, data.id, schema.options.relation, source)
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
    },
    _setMetadata (item = {}, options) {
      if (options) {
        // append additional metadata
        for (const key in options) {
          if (Object.hasOwnProperty.call(options, key)) {
            const value = options[key]

            item[key] = value
          }
        }
      }

      if (this.isServer) {
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
     * Set the association id
     * @param {string} name - Name of primary key
     * @param {string} association - Name of foreign key collection
     * @param {string} value - The foreign key
     */
    _setRelation (collection, docId, refCollection, refId) {
      const name = collection + '/' + docId
      const usedName = refCollection + '/' + refId

      // set what is related to data
      if (!this.relation[name]) {
        this.relation[name] = [usedName]
      } else if (!this.relation[name].includes(usedName)) {
        this.relation[name].push(usedName)
      }

      // set where ref data is used
      if (!this.relationUsed[usedName]) {
        this.relationUsed[usedName] = [name]
      } else if (!this.relationUsed[usedName].includes(name)) {
        this.relationUsed[usedName].push(name)
      }
    },
    /**
     * Get new data type
     * @private
     * @param {string} type - Data type name
     * @returns {Array|Boolean|Function|number|Object|string}
     */
    _types (type) {
      switch (type) {
        case 'array':
          return new Array()
        case 'boolean':
          return new Boolean().valueOf()
        case 'function':
          return new Function()
        case 'node':
          return new Object()
        case 'number':
          return new String().valueOf()
        case 'object':
          return new Object()
        case 'string':
          return new String().valueOf()
      }
    },
    '_unfreeze/object' (source) {
      const target = {}

      if (source.constructor !== Object) {
        return source
      }

      for (const prop in source) {
        if (Object.hasOwnProperty.call(source, prop)) {
          target[prop] = source[prop]
        }
      }

      return target
    },
    '_unfreeze/array' (value) {
      return value.slice()
    },
    _updateArray (target, source, options) {
      source = Array.isArray(source) ? source : [source]

      switch (options.method) {
        case 'push':
          for (let i = 0; i < source.length; i++) {
            target.push(source[i])
          }

          this._updateArrayItemFreeze(target, source.length)

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

          this._updateArrayItemFreeze(target, source.length)

          break
        case 'splice':
          this.$method('dsList/splice', {
            target,
            start: options.startIndex,
            source,
            deleteCount: options.deleteCount
          })

          this._updateArrayItemFreeze(target, source.length)
      }
    },
    _updateArrayItemFreeze (items, length) {
      for (let i = items.length - length; i < items.length; i++) {
        const item = items[i]

        if (typeof item === 'object') {
          Object.freeze(item)
        }
      }
    }
  }
})
