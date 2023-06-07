import { uuid } from '@dooksa/crypto'

function SchemaException (details) {
  this.details = details
  this.name = 'SchemaException'
}

/**
 * Data id, it is a combination of the plugin name and data key
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

      Object.freeze(this.values[data.id])

      // prepare listeners
      const listenerType = data.collection ? {} : []

      this['data/update/listeners'][data.id] = listenerType
      this['data/update/refs'][data.id] = {}
      this['data/delete/listeners'][data.id] = listenerType
      this['data/delete/refs'][data.id] = {}
    },
    /**
     * Add data listener
     * @param {dsDataName} param.name - Data collection name
     * @param {string} param.on - Event name, currently, update or delete
     * @param {dsDataId} param.id - Data collection id
     * @param {function} param.listener - The listener function to run when event is fired
     */
    addListener ({ name, on, id, refId, listener }) {
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
    /**
     * Generate a unique id
     * @returns {string}
     */
    generateId () {
      return '_' + uuid() + '_'
    },
    /**
     * Get data value
     * @param {Object} param
     * @param {string} param.name - Data collection name
     * @param {string} param.id - Data collection document id
     * @param {prefixId} param.id - Data collection document prefix
     * @param {suffixId} param.id - Data collection document suffix
     * @param {Object} param.options - Options
     * @param {Object} param.options.position - Data collection document suffix
     * @returns
     */
    get ({ name, id, prefixId, suffixId, options }) {
      const result = { isEmpty: false }
      const schema = this.schema[name]

      if (id) {
        result.isAffixEmpty = true

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

          if (this.values[name][itemId] != null) {
            result.isAffixEmpty = false
            result.item = this.values[name][itemId]
          }
        }

        if (result.isAffixEmpty) {
          result.id = id
          result.item = this.values[name][result.id]

          // find document using default affixes
          if (result.item == null && schema.id) {
            let itemId

            if (schema.id.prefix && schema.id.suffix) {
              const prefix = this._affixId(schema.id.prefix)
              const suffix = this._affixId(schema.id.suffix)

              itemId = prefix + result.id + suffix
            } else if (schema.id.prefix) {
              const prefix = this._affixId(schema.id.prefix)

              itemId = prefix + result.id
            } else {
              const suffix = this._affixId(schema.id.suffix)

              itemId = result.id + suffix
            }

            result.id = itemId
            result.item = this.values[name][itemId]

            if (result.item == null) {
              result.isEmpty = true
            }
          }
        }
      } else {
        result.item = this.values[name]
      }

      if (options) {
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
        const unfreezeName = '_unfreeze' + schema.type

        if (this[unfreezeName]) {
          result.item = this[unfreezeName](result.item)
        }
      }

      return result
    },
    set ({ name, source, options }) {
      try {
        const schema = this.schema[name]

        if (!schema) {
          throw new Error('Schema not found "' + name + '"')
        }

        let target = this.values[name]

        if (target != null) {
          const unfreeze = this['_unfreeze/' + schema.type]

          if (unfreeze) {
            // @ISSUE: find a better way to make all data types immutable
            target = unfreeze(target)
          }
        } else {
          // set default value
          target = this.defaultTypes[schema.type]()
        }

        const result = this._setData(
          name,
          source,
          target,
          options
        )

        // set new value
        this.values[name] = result.target

        // freeze collection
        Object.freeze(this.values[name])

        // notify listeners
        this._onUpdate(name, result.item, result.id)

        return result
      } catch (errorMessage) {
        console.error(errorMessage)

        if (errorMessage.name === 'SchemaException') {
          return {
            valid: false,
            error: errorMessage
          }
        }

        return {
          valid: false,
          error: {
            details: errorMessage,
            name: 'Error'
          }
        }
      }
    },
    _addSchema (schema) {
      for (let i = 0; i < schema.length; i++) {
        const item = schema[i]

        this.schema[item.id] = item.entry

        if (item.relation) {
          this.relation[item.id] = item.relation
        }
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
          if (Object.hasOwnProperty.call(source, key)) {
            const element = source[key]

            this._checkType(name, element, schema.type)

            target[key] = element
          }
        }

        return target
      }

      for (const key in source) {
        if (Object.hasOwnProperty.call(source, key)) {
          const element = source[key]
          this._checkType(name, element, schema.type)

          target[key] = this.defaultTypes[schema.type]()
          target[key] = this[setDataName](data, name, target[key], element)
        }
      }

      return target
    },
    _createCollectionId (name, option) {
      const schema = this.schema[name]
      const id = option.id ? '_' + option.id + '_' : ''
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
          suffix = '_' + this._affixId(schema.id.suffix)
        }

        if (schema.id.default) {
          return prefix + this._affixId(schema.id.default) + suffix
        } else {
          return prefix + this.generateId() + suffix
        }
      }

      return prefix + this.generateId() + suffix
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
    '_option/collection' (data, name, option = {}, schema, target, source) {
      if (option.id) {
        const id = this._createCollectionId(name, option)

        if (!option.source) {
          this._checkCollectionItems(
            data,
            name + '/items',
            {},
            { [id]: source }
          )

          data.id = id
          data.rootTarget[id] = source

          return true
        }

        const schema = this.schema[name + '/items']

        target = this._changeTarget(name, target, id, schema.type)

        // update export data
        data.id = id
        data.name = name + '/' + id
      }

      // change target
      // if (option.target) {

      // }

      // update target with source
      if (option.source) {
        if (option.source.merge) {
          this._checkCollectionItems(data, name + '/items', target, source)

          return true
        }

        if (option.source.push) {
          target.push(source)

          return true
        }

        if (option.source.unshift) {
          target.unshift(source)

          return true
        }

        if (option.source.id) {
          data.id = option.source.id
          target[option.source.id] = source
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
            if (Object.hasOwnProperty.call(source, key)) {
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
      const data = { rootTarget: target }
      const schema = this.schema[name]
      const setDataName = '_setData/' + schema.type
      const hasOptions = (options && (options.depth === depth || (depth === 1 && !options.depth)))

      if (schema.options || hasOptions) {
        const currentOptions = hasOptions ? options : {}
        const optionName = '_option/' + schema.type
        const end = this[optionName](data, name, currentOptions, schema, target, source)

        if (end) {
          const result = {
            valid: true,
            target: data.rootTarget,
            value: data.rootTarget,
            name: data.name
          }

          if (data.id) {
            result.id = data.id
            result.item = data.rootTarget[data.id]

            // freeze value
            if (!schema.options?.mutable) {
              Object.freeze(data.rootTarget[data.id])
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
        valid: true,
        target: data.rootTarget,
        value: data.rootTarget,
        name: data.name
      }

      if (data.id) {
        result.id = data.id
        result.item = data.rootTarget[data.id]
      }

      return result
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

      for (let i = 0; i < source.length; i++) {
        if (!this[setDataName]) {
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

      if (options) {
        // generate id
        if (!options.id) {
          const id = this._defaultCollectionId(name, options)

          // update export data
          data.id = id
          data.name = name + '/' + id

          target[id] = source
        }

        hasOptions = options.depth === depth || (depth === 1 && !options.depth)
      } else {
        // generate id
        const id = this._defaultCollectionId(name)

        // update export data
        data.id = id
        data.name = name + '/' + id

        target[id] = source

        // change target
        target = target[id]
      }

      if (schema.options || hasOptions) {
        const currentOptions = hasOptions ? options : {}
        const end = this['_option/collection'](data, name, currentOptions, schema, target, source)

        if (end) {
          return
        }
      }

      ++depth

      if (schema.type === 'array') {
        this._checkType(name, source, schema.type)

        for (let i = 0; i < source.length; i++) {
          source[i] = this[setDataName](data, schemaName, target, source[i], options, depth)
        }
      } else {
        this[setDataName](data, schemaName, target, source, options, depth)
      }
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
          if (property.type !== 'number' && !value && propertyOptions.default) {
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
          if (Object.hasOwnProperty.call(source, key)) {
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
    '_unfreeze/collection' (value) {
      return Object.assign({}, value)
    },
    '_unfreeze/object' (value) {
      return Object.assign({}, value)
    },
    '_unfreeze/array' (value) {
      return value.slice()
    }
  }
}
