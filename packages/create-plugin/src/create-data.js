/**
 * @typedef {import("@dooksa/ds-scripts/src/types.js").DsData} DsDataSchema
 * @typedef {import("@dooksa/ds-scripts/src/types.js").DsSetDataOptions} DsSetDataOptions
 * @typedef {import("@dooksa/ds-scripts/src/index.js").DataResult} DataResult
 */

/**
 *
 * @param {*} setDataSchema
 * @param {*} setDataValue
 * @param {*} getDataValue
 * @param {*} plugin
 * @param {Object.<string, DsDataSchema>} data
 */
function createData (setDataSchema, setDataValue, getDataValue, plugin, data) {
  for (const key in data) {
    if (Object.hasOwnProperty.call(data, key)) {
      const dataItem = data[key]
      const schema = dataItem.schema
      const dataType = schema.type
      let dataValue

      if (typeof dataItem.default === 'function') {
        dataValue = dataItem.default()
      } else {
        switch (schema.type) {
          case 'collection':
            dataValue = {}
            break
          case 'object':
            dataValue = {}
            break
          case 'array':
            dataValue = []
            break
          case 'string':
            dataValue = ''
            break
          case 'number':
            dataValue = 0
            break
          case 'boolean':
            dataValue = true
            break
        }

        if (dataValue == null) {
          throw new Error('Plugin data could not be created')
        }
      }

      // data namespace
      const dataName = plugin.metadata.name + '/' + key

      // set data schema
      setDataSchema(dataName, schema)

      // set default data
      const result = setDataValue(dataName, dataValue)

      if (schema.type === 'collection') {
        plugin.data[key] = new DsDataCollection(dataName, key, dataType, getDataValue, setDataSchema)
      } else {
        plugin.data[key] = new DsData(dataName, key, dataType, getDataValue, setDataSchema)
      }
    }
  }
}

/**
 * @constructor
 * @param {*} namespace
 * @param {*} name
 * @param {*} type
 * @param {*} getDataValue
 * @param {*} setDataValue
 */
function DsDataProperties (namespace, name, type, getDataValue, setDataValue) {
  this.dsDataName = namespace + '/' + name
  this.namespace = namespace
  this.name = name
  this.type = type

  Object.defineProperty(this, name, {
    /**
     * Get data value
     * @returns {DataResult}
     */
    get () {
      return getDataValue(namespace)
    },
    /**
     * @param {Object} item
     * @param {*} item.value
     * @param {DsSetDataOptions} [item.options]
     */
    set (item) {
      const dataType = typeof item

      if (dataType !== 'object') {
        throw Error('Unexpected value. expected object but found: ' + dataType)
      }

      setDataValue(namespace, item.value, item.options)
    },
    writable: false
  })
}

/**
 * Set data value
 * @constructor
 * @param {*} namespace
 * @param {*} name
 * @param {*} type
 * @param {*} getDataValue
 * @param {*} setDataValue
 */
function DsData (namespace, name, type, getDataValue, setDataValue) {
  DsDataProperties.call(this, namespace, name, type, getDataValue, setDataValue)
}

/**
 * Set data collection value
 * @constructor
 * @param {*} namespace
 * @param {*} name
 * @param {*} type
 * @param {*} getDataValue
 * @param {*} setDataValue
 */
function DsDataCollection (namespace, name, type, getDataValue, setDataValue) {
  DsDataProperties.call(this, namespace, name, type, getDataValue, setDataValue)

  this.__getDataValue__ = getDataValue
}

/**
 * Get data value by Id
 * @param {string} id
 * @returns {DataResult}
 */
DsDataCollection.prototype.getValueById = function (id) {
  return this.__getDataValue__(this.dsDataName, { id })
}

export default createData
