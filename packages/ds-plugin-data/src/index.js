import { uuid } from '@dooksa/crypto'

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
 * Dooksa content management plugin
 * @namespace dsData
 */
export default {
  name: 'dsData',
  version: 1,
  data: {
    'data/update/listeners': {
      private: true,
      default: {}
    },
    'data/update/refs': {
      private: true,
      default: {}
    },
    'data/delete/listeners': {
      private: true,
      default: {}
    },
    'data/delete/refs': {
      private: true,
      default: {}
    },
    values: {
      private: true,
      default: {}
    },
    schema: {
      private: true,
      default: {}
    },
    relation: {
      private: true,
      default: {}
    },
    relationUsed: {
      private: true,
      default: {}
    },
    collection: {
      private: true,
      default: {}
    },
    defaultTypes: {
      private: true,
      default: {
        string: String,
        number: Number,
        object: Object,
        array: Array,
        boolean: Boolean
      }
    }
  },
  /** @lends dsData */
  methods: {
    /**
     * Add data listener
     * @param {dsDataName} param.name - Data collection name
     * @param {string} param.on - Event name, currently, update or delete
     * @param {dsDataId} param.id - Data collection id
     * @param {function} param.listener - The listener function to run when event is fired
     */
    $addDataListener (name, { on, id, refId, listener }) {
      const listenerName = 'data/' + on + '/listeners'
      let listeners = this[listenerName]

      if (!listeners) {
        throw new Error('Data event type does not exist: "' + on + '"')
      }

      const listenerRefs = this['data/' + on + '/refs'][name]
      listeners = listeners[name]

      if (!listeners) {
        throw new Error('Data event name does not exist: "' + name + '"')
      }

      if (id) {
        refId = id + refId
        listeners = listeners[id]

        // add listener
        if (!listeners) {
          this[listenerName][name][id] = [listener]
          listenerRefs[refId] = true
        } else if (!listenerRefs[refId]) {
          listeners.push(listener)
          listenerRefs[refId] = true
        }
      } else if (!listenerRefs[refId]) {
        // add listener
        listeners.push(listener)
        listenerRefs[refId] = true
      }
    },
    $deleteDataValue (name, id, { cascade } = {}) {
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
      }

      return {
        deleted: true
      }
    },
    $getDataValue: {
      /**
       * Get data value
       * @name $getDataValue
       * @memberof dsData#
       * @param {Object} param
       * @param {string} param.name - Data collection name
       * @param {string} param.id - Data collection document id
       * @param {prefixId} param.prefixId - Data collection document prefix
       * @param {suffixId} param.suffixId - Data collection document suffix
       * @param {Object} param.options - Options
       * @param {boolean} param.options.expand - Expand all relational data
       * @param {Object} param.options.expandExclude - Exclude items from expanding
       * @param {string|number} param.options.position - Return the value by key of the data value
       * @returns {Object}
       */
      value (name, { id, prefixId, suffixId, options } = {}) {
        if (this.values[name] == null) {
          return {
            isEmpty: true,
            isCollectionEmpty: true
          }
        }

        const result = { id, isEmpty: false, isCollectionEmpty: false }
        const schema = this.schema[name]

        if (Object.hasOwn(arguments[0], 'id') && id == null) {
          result.isEmpty = true

          return result
        } else if (id != null) {
          result.isAffixEmpty = true

          // Better off creating a result constructor
          Object.defineProperty(result, 'noAffixId', {
            get () {
              let noAffixId = this.id.split('_')

              if (noAffixId.length === 3) {
                noAffixId = '_' + noAffixId[1] + '_'
              } else {
                noAffixId = this.id
              }

              return noAffixId
            }
          })

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
              result.isAffixEmpty = false
              result.id = itemId
              result.item = value._item
              result.metadata = value._metadata || false
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

            if (value == null) {
              result.isEmpty = true
            } else {
              result.id = itemId
              result.item = value._item
              result.metadata = value._metadata || {}
            }
          }
        } else {
          // dump whole collection
          result.item = this.values[name]
        }

        if (options) {
          const relations = this.relation[name + '/' + result.id]

          result.isExpandEmpty = !relations

          if (options.expand && relations) {
            const expandExclude = options.expandExclude ?? {}

            result.expand = []
            result.isExpandEmpty = false

            for (let i = 0; i < relations.length; i++) {
              const relation = relations[i]

              // prevent duplication and infinite loop
              if (expandExclude[relations]) {
                continue
              }

              expandExclude[relation] = true

              const item = relation.split('/')
              const name = item[0] + '/' + item[1]
              const id = item[2]
              const value = this.$getDataValue(name, { id, options: { expand: true, expandExclude } })

              if (value.isEmpty) {
                continue
              }

              if (!value.isExpandEmpty) {
                result.expand = result.expand.concat(value.expand)
              }

              result.expand.push({
                collection: name,
                id: value.id,
                item: value.item,
                metadata: value.metadata
              })
            }
          }

          if (Number.isInteger(options.position)) {
            // check if index is within range
            if (options.position < result.item.length && options.position > -1) {
              result.item = result.item[options.position]
            } else {
              throw new Error('Get data value by index was out of range')
            }
          }
        }

        if (result.item == null) {
          result.isEmpty = true

          return result
        } else {
          // create copy
          // TODO: Make this a proxy to handle unfreeze
          const unfreezeName = '_unfreeze/' + schema.type

          if (this[unfreezeName]) {
            result.item = this[unfreezeName](result.item)
          }
        }

        return result
      },
      export: true
    },
    $setDataValue: {
      value (name, { source, options, typeCheck = true }) {
        try {
          const schema = this.schema[name]

          if (!schema) {
            throw new SchemaException({
              schemaPath: name,
              keyword: 'schema',
              message: 'Schema not found'
            })
          }

          if (source == null) {
            throw new SchemaException({
              schemaPath: name,
              keyword: 'source',
              message: 'Source was undefined'
            })
          }

          let result = {}

          if (!typeCheck && options) {
            if (options.id == null) {
              throw new SchemaException({
                schemaPath: name,
                keyword: 'collection',
                message: 'Collection id was undefined'
              })
            }

            result.item = source._item || source
            result.id = options.id
            const value = this.values[name][options.id] || {}

            this.values[name][options.id] = {
              _item: source._item || source,
              _metadata: source._metadata || value._metadata || {}
            }
          } else {
            let target = this.values[name]
            // TODO: Move this inside setData and unfreeze when needed
            if (target != null) {
              const unfreeze = this['_unfreeze/' + schema.type]

              if (unfreeze) {
                target = unfreeze(target)
              }
            } else {
              // set default value
              target = this.defaultTypes[schema.type]()
            }

            result = this._setData(
              name,
              source._item || source,
              target,
              options
            )

            // set new value
            this.values[name] = result.target
          }

          // notify listeners
          this._onUpdate(name, result.item, result.id, result.metadata)

          return {
            id: result.id,
            noAffixId: result.noAffixId,
            item: result.item,
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
     * @param {dsDataId} data.id - Data id
     * @param {string} data.default - Data value
     * @param {string} data.type - Data type
     */
    add (data) {
      if (data.schema) {
        this._addSchema(data.schema)
      }

      // add values
      this.values[data.id] = data.default ?? this.defaultTypes[data.type]()

      // prepare listeners
      const listenerType = data.collection ? {} : []

      this['data/update/listeners'][data.id] = listenerType
      this['data/update/refs'][data.id] = {}
      this['data/delete/listeners'][data.id] = listenerType
      this['data/delete/refs'][data.id] = {}
    },
    /**
     * Generate a unique id
     * @returns {string}
     */
    generateId () {
      return '_' + uuid() + '_'
    },
    _setMetadata (item = {}, options) {
      const timestamp = Date.now()

      if (!item.userId && options.userId) {
        item.userId = options.userId
      }

      if (!item.createdAt) {
        item.createdAt = timestamp
      }

      item.updatedAt = timestamp

      return item
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
        if (Object.isFrozen(newTarget)) {
          const unfreeze = this['_unfreeze/' + type]

          // @ISSUE: find a better way to make all data types immutable
          target[position] = unfreeze(newTarget)

          return target[position]
        }

        return newTarget
      } else if (!newTarget && type) {
        target[position] = this.defaultTypes[type]()

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
    _checkArrayUniqueItem (name, target, source) {
      if (target.includes(source)) {
        throw new SchemaException({
          schemaPath: name,
          keyword: 'uniqueItems',
          message: 'Type error: expected a unique item'
        })
      }
    },
    _checkCollectionItems (data, name, target, source) {
      const schema = this.schema[name]
      const setDataName = '_setData/' + schema.type

      if (!this[setDataName]) {
        for (const key in source) {
          if (Object.hasOwn(source, key)) {
            const value = source[key]
            const item = value._item || value

            this._checkType(name, item, schema.type)

            target[key] = {
              _item: item,
              _metadata: value._metadata || {}
            }
          }
        }

        return target
      }

      for (const key in source) {
        if (Object.hasOwn(source, key)) {
          const value = source[key]
          const item = value._item || value

          this._checkType(name, item, schema.type)

          // set current merge root id
          data.id = key

          target[key] = {
            _item: this.defaultTypes[schema.type](),
            _metadata: value._metadata || {}
          }

          target[key]._item = this[setDataName](data, name, target[key]._item, item)
        }
      }

      return target
    },
    _createCollectionId (name, option) {
      const schema = this.schema[name]
      const id = option.id || ''
      let prefix = option.prefixId ?? ''
      let suffix = option.suffixId ?? ''

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
    /**
     * Check data type
     * @private
     * @param {string} name - Schema path
     * @param {*} value - value to be checked
     * @param {string} type - Expected data type
     * @returns {boolean}
     */
    _checkType (name, value, type) {
      if (value !== null) {
        if (type === 'node') {
          if (value.nodeName && Object.isFrozen(value.nodeName)) {
            return true
          }

          throw new SchemaException({
            schemaPath: name,
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
          schemaPath: name,
          keyword: 'type',
          message: 'Unexpected type, expected "' + type + '" but got "' + dataType + '"'
        })
      }

      throw new SchemaException({
        schemaPath: name,
        keyword: 'type',
        message: 'Unexpected type, expected "' + type + '" but got "undefined"'
      })
    },
    /**
     * Generate the default id for a collection
     * @private
     * @param {string} name - Collection schema path
     * @param {Object} option - Collection id prefix or suffix options
     * @param {string} option.prefixId - Prefix to add to the id
     * @param {string} option.suffixId - Suffix to add to the id
     * @returns {string}
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
     * Process listeners on update event
     * @param {dsDataId} id
     * @param {string} key - Data key
     * @param {(string|number|boolean|Object|Array)} value - Value that is being set
     */
    _onUpdate (name, value, id) {
      let listeners = this['data/update/listeners'][name]

      if (id) {
        listeners = listeners[id]
      }

      if (listeners) {
        for (let i = 0; i < listeners.length; i++) {
          const listener = listeners[i]
          listener(value)
        }
      }
    },
    /**
     * Process listeners on delete event
     * @param {dsDataId} id
     * @param {string} key - Data key
     * @param {(string|number|boolean|Object|Array)} value - Value that is being deleted
     */
    _onDelete (id, key, value) {
      const listeners = this['data/delete/listeners'][id][key]

      if (listeners) {
        for (let i = 0; i < listeners.length; i++) {
          const listener = listeners[i]

          listener.action(listener.arguments, value)
        }
      }
    },
    '_option/array' (data, name, option, schema, target, source) {
      // change target
      if (option.target) {
        // target enter array position
        if (Number.isInteger(option.target.position)) {
          target = this._changeTarget(name, target, option.target.position)
          data.name = name
        }
      }

      // check schema options
      if (schema.options) {
        if (schema.options.uniqueItems) {
          for (let i = 0; i < source.length; i++) {
            if (schema.options && schema.options.uniqueItems) {
              this._checkArrayUniqueItem(name, target, source[i])
            }
          }
        }
      }

      // update target with source
      if (option.source) {
        if (option.source.push) {
          target.push(source)
        }

        if (option.source.shift) {
          target.shift(source)
        }
      }
    },
    '_option/collection' (data, name, options = {}, schema, target, source) {
      if (Object.hasOwn(options, 'id') && options.id == null) {
        throw new SchemaException({
          schemaPath: name,
          keyword: 'collection',
          message: 'Expected collection id to be a string but got undefined'
        })
      } else if (options.id) {
        // update id
        const id = this._createCollectionId(name, options)

        // update root data
        data.id = id
        data.name = name + '/' + id

        // update or create entry by id
        if (!options.source) {
          const rootTarget = data.rootTarget[id]

          if (rootTarget) {
            rootTarget._item = source
          } else {
            data.rootTarget[id] = {
              _item: source,
              _metadata: {}
            }

            if (this.isServer) {
              data.rootTarget[id]._metadata = this._setMetadata({}, options)
            }
          }

          this._checkCollectionItems(
            data,
            name + '/items',
            {},
            { [id]: source }
          )

          return true
        }
      } else if (!options.source || options.suffixId || options.prefixId) {
        // create new id
        const collection = this._defaultCollectionId(name, options)

        // update data
        data.id = collection.id
        data.noAffixId = collection.noAffixId
        data.name = name + '/' + collection.id

        // create new entry
        data.rootTarget[collection.id] = {
          _item: source,
          _metadata: {}
        }

        if (this.isServer) {
          data.rootTarget[collection.id]._metadata = this._setMetadata({}, options)
        }

        target = data.rootTarget[collection.id]._item
      }

      // change target
      // if (option.target) {

      // }

      /**
       * option source rootTarget needs to be updated
       */

      // update target with source
      if (options.source) {
        if (data.id) {
          // add metadata
          if (options.source.metadata) {
            const rootTarget = data.rootTarget[data.id]
            rootTarget._metadata = rootTarget._metadata || {}
            rootTarget._metadata = Object.assign(rootTarget._metadata, options.source.metadata)
          }

          // Add item to an array
          if (options.source.push || options.source.unshift) {
            const schemaPath = name + '/items' + '/items'
            const schema = this.schema[schemaPath]
            const rootTarget = data.rootTarget[data.id]

            if (schema) {
              this._checkType(schemaPath, source, schema.type)

              if (schema.options && schema.options.relation) {
                this._setRelation(data.rootName, data.id, schema.options.relation, source)
              }
            }

            if (!rootTarget) {
              data.rootTarget[data.id] = {
                _item: [],
                _metadata: {}
              }

              if (this.isServer) {
                data.rootTarget[data.id]._metadata = this._setMetadata({}, options)
              }

              target = data.rootTarget[data.id]._item
            } else if (Object.isFrozen(rootTarget._item)) {
              target = this['_unfreeze/array'](rootTarget._item)
            } else {
              target = rootTarget._item
            }

            if (options.source.push) {
              target.push(source)
            } else {
              target.unshift(source)
            }

            return true
          }
        }

        if (options.source.merge) {
          // merge target
          if (options.id) {
            const schemaPath = name + '/items' + '/items'
            const schema = this.schema[schemaPath]

            if (Array.isArray(source)) {
              for (let i = 0; i < source.length; i++) {
                const item = source[i]

                this._checkType(schemaPath, item, schema.type)
              }

              data.rootTarget[options.id] = data.rootTarget[options.id].concat(source)
            } else if (source instanceof Object && source.constructor === Object) {
              for (const key in source) {
                if (Object.hasOwn(source, key)) {
                  const item = source[key]

                  this._checkType(schemaPath, item, schema.type)

                  target[key] = item
                }
              }
            } else {
              this._checkType(schemaPath, source, schema.type)

              data.rootTarget[options.id] = source
            }

            return true
          }

          // merge collection
          this._checkCollectionItems(data, name + '/items', target, source)

          return true
        }

        // update target property
        if (options.source.id) {
          data.id = options.source.id
          target[options.source.id] = source
        }
      }
    },
    '_option/object' (data, name, option, schema, target, source) {
      // change target
      if (option.target) {
        if (option.target.position) {
          const schema = this.schema[name + '/' + option.target.position] || {}

          target = this._changeTarget(name, target, option.target.position, schema.type)
          data.name = name + '/' + option.target.position
        }
      }

      // check schema options
      if (schema.options) {
        if (schema.options.additionalProperties) {
          const patternProperties = schema.patternProperties || []
          const additionalKeys = []

          for (const key in source) {
            if (Object.hasOwn(source, key)) {
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
              schemaPath: name,
              keyword: 'additionalProperties',
              message: 'Additional properties are now allowed ' + JSON.stringify(additionalKeys)
            })
          }
        }
      }

      // update target with source
      // if (option.source) {}
    },
    _setData (name, source, target, options, depth = 1) {
      const data = { rootTarget: target, rootName: name }
      const schema = this.schema[name]
      const setDataName = '_setData/' + schema.type
      const hasOptions = (options && (options.depth === depth || (depth === 1 && !options.depth)))

      if (schema.options || hasOptions) {
        const currentOptions = hasOptions ? options : {}
        const optionName = '_option/' + schema.type
        const end = this[optionName](data, name, currentOptions, schema, target, source)

        if (end) {
          const result = {
            isValid: true,
            target: data.rootTarget,
            name: data.name
          }

          if (data.id) {
            const value = data.rootTarget[data.id]

            result.id = data.id
            result.item = value._item
            result.metadata = value._metadata

            // freeze value
            if (typeof value._item === 'object' && (!schema.options || !schema.options.mutable)) {
              // Object.freeze(value._item)
            }
          }

          return result
        }
      }

      // update depth
      ++depth

      if (this[setDataName]) {
        // set data by type
        this[setDataName](data, name, target, source, options, depth)
      } else {
        // type check
        this._checkType(name, source, schema.type)

        data.rootTarget = source
      }

      const result = {
        isValid: true,
        target: data.rootTarget,
        value: data.rootTarget,
        name: data.name
      }

      if (data.id) {
        result.id = data.id
        result.noAffixId = data.noAffixId
        result.item = data.rootTarget[data.id]._item
        result.metadata = data.rootTarget[data.id]._metadata
      }

      return result
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
    '_setData/array' (data, name, target, source, options, depth) {
      const schema = this.schema[name]
      const schemaName = name + '/items'
      const schemaItems = this.schema[schemaName]

      // no validation
      if (!schemaItems) {
        return source
      }

      const hasOptions = (options && (options.depth === depth || (depth === 1 && !options.depth)))

      if (schema.options || hasOptions) {
        const currentOptions = hasOptions ? options : {}

        this['_option/' + schema.type](data, name, currentOptions, schema, target, source)
      }

      ++depth

      const setDataName = '_setData/' + schemaItems.type
      const setData = this[setDataName]

      for (let i = 0; i < source.length; i++) {
        if (typeof setData !== 'function') {
          // set relation for array of strings
          if (schemaItems.options && schemaItems.options.relation) {
            this._setRelation(data.rootName, data.id, schemaItems.options.relation, source[i])
          }

          this._checkType(schemaName, source[i], schemaItems.type)
        } else {
          source[i] = this[setDataName](data, schemaName, target, source[i], options, depth)
        }
      }

      return source
    },
    '_setData/collection' (data, name, target, source, options, depth) {
      const schemaName = name + '/items'
      const schema = this.schema[schemaName]
      const setDataName = '_setData/' + schema.type

      if (!this[setDataName]) {
        return target
      }

      let hasOptions

      // Apply depth options (feature may not be useful)
      if (options) {
        hasOptions = options.depth === depth || (depth === 1 && !options.depth)
      }

      if (schema.options || hasOptions) {
        const currentOptions = hasOptions ? options : {}
        const end = this['_option/collection'](data, name, currentOptions, schema, target, source)

        if (end) {
          return
        }
      }

      ++depth

      this._checkType(name, source, schema.type)

      this[setDataName](data, schemaName, target, source, options, depth)
    },
    '_setData/object' (data, name, target, source, options, depth) {
      const schema = this.schema[name]

      // no validation
      if (!schema.properties && !schema.patternProperties) {
        return source
      }

      const hasOptions = (options && (options.depth === depth || (depth === 1 && !options.depth)))

      if (schema.options || hasOptions) {
        const currentOptions = hasOptions ? options : {}

        this['_option/object'](data, name, currentOptions, schema, target, source)
      }

      const properties = schema.properties || []
      const patternProperties = schema.patternProperties || []
      const propertiesChecked = []

      for (let i = 0; i < properties.length; i++) {
        const property = properties[i]
        const propertyOptions = property.options || {}
        const value = source[property.name]

        // check if field is required
        if (propertyOptions.required && value == null) {
          throw new SchemaException({
            schemaPath: name,
            keyword: 'required',
            message: 'Invalid data (' + name + '): required property missing: "' + property.name + '"'
          })
        }

        if (value == null && !propertyOptions.default) {
          propertiesChecked.push(property.name)
        } else {
          if (value == null && propertyOptions.default) {
            // add default value
            if (typeof propertyOptions.default === 'function') {
              source[property.name] = propertyOptions.default()
            } else {
              source[property.name] = propertyOptions.default
            }
          } else {
            const schemaName = name + '/' + property.name
            const schema = this.schema[schemaName]

            if (schema) {
              this._checkType(schemaName, source[property.name], schema.type)

              const setDataName = '_setData/' + schema.type
              const newTarget = target ?? this.defaultTypes[schema.type]()

              source[property.name] = this[setDataName](data, schemaName, newTarget[property.name], value, options, depth)
            } else {
              if (propertyOptions.relation) {
                this._setRelation(data.rootName, data.id, propertyOptions.relation, value)
              }

              source[property.name] = value
            }
          }

          this._checkType(name, source[property.name], property.type)

          propertiesChecked.push(property.name)
        }
      }

      for (let i = 0; i < patternProperties.length; i++) {
        const property = patternProperties[i]

        for (const key in source) {
          if (Object.hasOwn(source, key)) {
            if (!propertiesChecked.includes(key)) {
              const regex = new RegExp(property.name)

              if (!regex.test(key)) {
                throw new SchemaException({
                  schemaPath: name,
                  keyword: 'patternProperty',
                  message: 'Invalid property: ' + key
                })
              }

              const value = source[key]

              if (property.type !== 'number' && !value && property.default) {
                // add default value
                if (typeof property.default === 'function') {
                  source[property.name] = property.default()
                } else {
                  source[property.name] = property.default
                }
              } else {
                const schemaName = name + '/' + property.name
                const schema = this.schema[schemaName]

                if (schema) {
                  source[key] = this['_setData/' + schema.type](data, schemaName, target, value, options, depth)
                } else {
                  source[key] = value
                }
              }

              this._checkType(name, source[key], property.type)
            }
          }
        }
      }

      return source
    },
    '_unfreeze/object' (source) {
      const target = {}

      if (source.constructor.name !== 'Object') {
        return source
      }

      for (const prop in source) {
        if (Object.hasOwn(source, prop)) {
          target[prop] = source[prop]
        }
      }

      return target
    },
    '_unfreeze/array' (value) {
      return value.slice()
    }
  }
}
