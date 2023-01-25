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
      value: {},
      type: 'object'
    },
    'data/delete/listeners': {
      private: true,
      value: {},
      type: 'object'
    },
    values: {
      private: true,
      value: {},
      type: 'object'
    },
    types: {
      private: true,
      value: {},
      type: 'object'
    },
    getters: {
      private: true,
      value: {},
      type: 'object'
    },
    setters: {
      private: true,
      value: {},
      type: 'object'
    }
  },
  methods: {
    /**
     * Add data and its data type
     * @param {Object} param
     * @param {dsDataId} param.id - Data id
     * @param {string} param.value - Data value
     * @param {string} param.type - Data type
     */
    add ({ id, value, type }) {
      // add values
      this.values[id] = value
      this.types[id] = type
      // prepare listeners
      this['data/update/listeners'][id] = {}
      this['data/delete/listeners'][id] = {}
    },
    /**
     * Add custom getter
     * @param {Object} param
     * @param {dsDataId} param.id - Data id
     * @param {function} param.item - Custom getter function
     */
    addGetter ({ id, item }) {
      this.getters[id] = item
    },
    /**
     * Add data listener
     * @param {dsDataId} param.id - Data id
     * @param {string} param.on - Event name, currently, update or delete
     * @param {string} param.key - Observable key
     * @param {Object} param.payload
     * @param {Object.<*>} param.payload.arguments - Arguments to pass to the listener function
     * @param {function} param.payload.action - The listener function to run when event is fired
     */
    addListener ({ id, on, key, payload }) {
      const event = this['data/' + on + '/listeners']

      if (!event) {
        throw new Error('Data event type does not exist: "' + on + '"')
      }

      const listeners = event[id][key]

      // add listener
      if (!listeners) {
        event[id][key] = [payload]
      } else {
        const listenerExists = listeners.indexOf(payload)

        // Avoid listener duplications
        if (listenerExists !== -1) {
          listeners.push(payload)
        }
      }
    },
    /**
     * Add custom setter
     * @param {Object} param
     * @param {dsDataId} param.id - Data id
     * @param {function} param.item - Custom setter function
     */
    addSetter ({ id, item }) {
      this.setters[id] = item
    },
    /**
     * Get data value
     * @param {Object} param
     * @param {dsDataId} param.id - Data id
     * @param {string} param.name - Name of getter
     * @param {Object.<*>} param.query - Query data to send to the getter
     * @param {onSuccess} param.onSuccess
     * @param {onError} param.onError
     * @returns {(number|boolean|string|Object|Array)}
     */
    get ({ id, name, query, onSuccess, onError } = {}) {
      const customGetterId = id + '/' + name

      // custom getter
      if (this.getters[customGetterId]) {
        const value = this.getters[customGetterId](query)

        if (value instanceof Promise) {
          return Promise.resolve(value)
            .then(result => onSuccess(result))
            .catch(error => onError(error))
        }

        return value
      }

      return this._getValue(id, name, query, onSuccess, onError)
    },
    /**
     * Set data value
     * @param {dsDataId} param.id - Data id
     * @param {string} param.name - Event name, currently, update or delete
     * @param {(Object.<*>|Array|number|string)} param.payload - The augments to give the setter function and/or the value to be set
     */
    set ({ id, name, payload }) {
      const customSetterId = id + '/' + name
      // @ISSUE: use a break label
      if (this.setters[customSetterId]) {
        // custom setter
        this.setters[customSetterId](payload)
      } else if (this.values[id]) {
        this._setValue(id, name, payload)
      }
    },
    /**
     * Check if data to be set is the expected type
     * @param {dsDataId} id
     * @param {*} value
     * @returns {boolean}
     */
    _checkType (id, value) {
      const type = typeof value

      if (this.types[id] === type) {
        return true
      }

      if (this.types[id] === 'array' && Array.isArray(value)) {
        return true
      }
    },
    /**
     * Process the getter to get value by data type
     * @param {dsDataId} id
     * @param {string} name - Name of getter
     * @param {Object.<*>} query - Query data to send to the getter
     * @returns {*}
     */
    _getValue  (id, name, query) {
      if (this.values[id]) {
        const getterName = '_processGetter/' + this.types[id] + '/' + name

        if (this[getterName]) {
          return this[getterName](id, query)
        }

        return this.values[id]
      }
    },
    /**
     * Process listeners on update event
     * @param {dsDataId} id
     * @param {string} key - Data key
     * @param {(string|number|boolean|Object|Array)} value - Value that is being set
     */
    _onUpdate (id, key, value) {
      const listeners = this['data/update/listeners'][id][key]

      if (listeners) {
        for (let i = 0; i < listeners.length; i++) {
          const listener = listeners[i]

          listener.action(listener.arguments, value)
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
    /**
     * Getter by key
     * @param {dsDataId} id
     * @param {Object} payload
     * @param {Object} payload.key - Object key
     * @returns {*}
     */
    '_processGetter/object/keyValue' (id, payload) {
      return this.values[id][payload.key]
    },
    /**
     * Set key value
     * @param {dsDataId} id
     * @param {Object} payload
     * @param {Object} payload.key - Object key
     * @param {(Object|Array|number|string|boolean)} payload.value - Value to be set
     */
    '_processSetter/object/keyValue' (id, payload) {
      const dataValue = this.values[id]

      // run update triggers
      if (dataValue[payload.key]) {
        this._onUpdate(id, payload.key, payload.value)
      }

      dataValue[payload.key] = payload.value
    },
    /**
     * Merge object setter
     * @param {dsDataId} id
     * @param {Object} payload
     */
    '_processSetter/object/merge' (id, payload) {
      const dataValue = this.values[id]

      for (const key in payload) {
        if (Object.hasOwnProperty.call(payload, key)) {
          const value = payload[key]

          // run update triggers
          if (dataValue[key]) {
            this._onUpdate(id, key, value)
          }

          dataValue[key] = value
        }
      }
    },
    /**
     * Set value using a process setter or custom setter
     * @param {dsDataId} id
     * @param {string} name - Name of setter
     * @param {*} payload - Argument for setter and or value
     */
    _setValue (id, name, payload) {
      if (this.types[id]) {
        const setterName = '_processSetter/' + this.types[id] + '/' + name

        // check if its a setter query
        if (this[setterName]) {
          this[setterName](id, payload)
        } else if (this._checkType(payload)) {
          this.values[id] = payload
        }
      }
    }
  }
}
