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
      schema: {
        type: 'object'
      }
    },
    'data/update/refs': {
      private: true,
      schema: {
        type: 'object'
      }
    },
    'data/delete/listeners': {
      private: true,
      schema: {
        type: 'object'
      }
    },
    'data/delete/refs': {
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
    },
    defaultTypes: {
      private: true,
      default: () => ({
        string: String,
        number: Number,
        object: Object,
        array: Array,
        boolean: Boolean,
        function: Function
      })
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

        const result = { id, isEmpty: false, isCollectionEmpty: false, collection: name }
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
            result.expand = []
            result.isExpandEmpty = false
            result.expandIncluded = options.expandExclude ?? {}

            for (let i = 0; i < relations.length; i++) {
              const relation = relations[i]

              // prevent duplication and infinite loop
              if (result.expandIncluded[relation]) {
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
                  expandExclude: result.expandIncluded
                }
              })

              if (value.isEmpty) {
                continue
              }

              if (!value.isExpandEmpty) {
                for (let i = 0; i < value.expand.length; i++) {
                  const item = value.expand[i]
                  const name = item.collection + '/' + item.id

                  result.expand.push(item)
                  result.expandIncluded[name] = true
                }
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
      value (name, data, options, ignoreTypeCheck) {
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

          if (ignoreTypeCheck) {
            if (options) {
              if (options.id == null) {
                // update collection
                this.values[name] = data

                result.item = data
              } else {
                result.item = data._item || data
                result.id = options.id

                const value = this.values[name][options.id] || {}

                this.values[name][options.id] = {
                  _item: data._item || data,
                  _metadata: data._metadata || value._metadata || {}
                }
              }
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
              target,
              data._item || data,
              options
            )

            // set new value
            this.values[name] = result.target
          }

          // notify listeners
          this._onUpdate(name, result.item, result.id, result.metadata)

          return {
            collection: name,
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
    _checkCollectionItems (data, path, source, metadata) {
      const schema = this.schema[path]
      const schemaCheck = '_schema/' + schema.type

      if (!this[schemaCheck]) {
        for (const id in source) {
          if (Object.hasOwn(source, id)) {
            const item = source[id]
            const targetValue = item._item || item
            const targetMetadata = item._metadata || metadata

            this._checkType(path, targetValue, schema.type)

            if (schema.options && schema.options.relation) {
              this._setRelation(data.collection, id, schema.options.relation, targetValue)
            }

            data.target[id] = {
              _item: targetValue,
              _metadata: this._setMetadata(targetMetadata, metadata)
            }
          }
        }

        return
      }

      for (const id in source) {
        if (Object.hasOwn(source, id)) {
          const item = source[id]
          const targetValue = item._item || item
          const targetMetadata = item._metadata || metadata

          this._checkType(path, targetValue, schema.type)

          // set current merge root id
          data.id = id

          this[schemaCheck](data, path, targetValue)

          data.target[id] = this._createTarget(schema.type, targetMetadata)
          data.target[id]._item = targetValue
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
        if (array.indexOf(array[i]) !== array.lastIndexOf(array[i])) {
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
          _item: this.defaultTypes[type](),
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
          if (Object.hasOwn(data, key)) {
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
          if (Object.hasOwn(source, key)) {
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

            const value = source[key]

            if (value == null && property.default) {
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
                this._checkType(schemaName, source[key], schema.type)

                const schemaValidationName = '_schema/' + schema.type

                this[schemaValidationName](data, schemaName, source[key])
              } else {
                const propertyOptions = property.options || {}

                if (propertyOptions.relation) {
                  this._setRelation(data.collection, data.id, propertyOptions.relation, value)
                }
              }
            }

            this._checkType(path, source[key], property.type)
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
              this._checkType(schemaName, source[property.name], schema.type)

              const schemaValidationName = '_schema/' + schema.type

              this[schemaValidationName](data, schemaName, source[property.name])
            } else {
              if (propertyOptions.relation) {
                this._setRelation(data.collection, data.id, propertyOptions.relation, value)
              }
            }
          }

          this._checkType(path, source[property.name], property.type)

          propertiesChecked[property.name] = true
        }
      }
    },
    '_schema/array' (data, path, source) {
      const schema = this.schema[path]

      if (schema.options) {
        this._schemaArrayOption(path, source)
      }

      const schemaName = path + '/items'
      const schemaItems = this.schema[schemaName]

      // no validation
      if (!schemaItems) {
        return
      }

      const schemaValidationName = '_schema/' + schemaItems.type

      for (let i = 0; i < source.length; i++) {
        if (typeof this[schemaValidationName] !== 'function') {
          // set relation for array of strings
          if (schemaItems.options && schemaItems.options.relation) {
            this._setRelation(data.collection, data.id, schemaItems.options.relation, source[i])
          }

          this._checkType(schemaName, source[i], schemaItems.type)
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
            result.metadata = value._metadata
            result.noAffixId = data.noAffixId

            // freeze value
            if (typeof value._item === 'object' && (!schema.options || !schema.options.mutable)) {
              // Object.freeze(value._item)
            }
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
        result.metadata = data.target[data.id]._metadata
      } else {
        this._schemaValidation(data, collection, source)
      }

      return result
    },
    '_setData/options' (data, source, options) {
      if (Object.hasOwn(options, 'id') && options.id == null) {
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

      data.target[data.id] = this._createTarget(schema.type, options.metadata, data.target[data.id])

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

      let target = data.target[data.id]._item

      // update target position
      if (options.update.position) {
        const lastKey = options.position.length - 1
        let path = schemaPath
        let isValidPosition = true

        for (let i = 0; i < lastKey; i++) {
          const key = options.position[i]
          path = path + '/' + key

          if (!target[key]) {
            isValidPosition = false
            break
          }

          target = target[key]
        }

        // insert data
        if (!options.update.method && isValidPosition) {
          this._schemaValidation(data, path, source)

          target[lastKey] = source

          return {
            complete: true,
            isValid: true
          }
        }

        schemaPath = path
      } else {
        // update schema path to match the first item in the collection
        schemaPath = schemaPath + '/items'
      }

      if (options.update.method) {
        if (!Array.isArray(target)) {
          throw new SchemaException({
            schemaPath,
            keyword: 'updateMethod',
            message: 'Expected target to be an array but found ' + typeof target
          })
        }

        const schema = this.schema[schemaPath]

        if (schema && schema.options) {
          if (schema.options.uniqueItems) {
            const hasDuplicates = this._containsDuplicates(source)

            if (hasDuplicates) {
              return {
                complete: true,
                isValid: false
              }
            }
          }

          if (schema.options.relation) {
            this._setRelation(data.collection, data.id, schema.options.relation, source)
          }
        }

        this._updateArray(target, source, options.update.method)
      }

      return {
        isValid: true
      }
    },
    _setMetadata (item = {}, options) {
      const timestamp = Date.now()

      if (options) {
        // append additional metadata
        for (const key in options) {
          if (Object.hasOwnProperty.call(options, key)) {
            const value = options[key]

            if (key !== 'createdAt' && key !== 'updatedAt' && key !== 'userId') {
              item[key] = value
            }
          }
        }
      }

      if (this.isServer) {
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
    },
    _updateArray (target, source, method) {
      switch (method) {
        case 'push':
          target.push(source)

          break
        case 'pop':
          target.pop(source)

          break
        case 'shift':
          target.shift(source)

          break
        case 'unshift':
          target.unshift(source)

          break
      }
    }
  }
}
