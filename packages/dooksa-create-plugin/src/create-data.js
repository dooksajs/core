import dsSchema from './utils/schema.js'

/**
 * @typedef {import("@dooksa/ds-scripts/src/types.js").DsDataSchema} DsDataSchema
 * @typedef {import("@dooksa/ds-scripts/src/types.js").DsSetDataOptions} DsSetDataOptions
 * @typedef {import("@dooksa/ds-scripts/src/index.js").DataResult} DataResult
 */

/**
 * @typedef {Object} DefineDsData - Dooksa plugin data
 * @property {(Function|string)} [default] - Default value to be set
 * @property {DsDataSchema} [schema] - The data schema
 * @property {string} [description] - Description of data set
 */

/**
 *
 * @param {*} setDataModal
 * @param {*} setDataValue
 * @param {*} getDataValue
 * @param {*} plugin
 * @param {Object.<string, DefineDsData>} data
 * @returns {DsData}
 */
function createData (setDataModal, setDataValue, getDataValue, plugin, data) {
  plugin.data = new DsData()

  for (const key in data) {
    if (Object.hasOwnProperty.call(data, key)) {
      const dataItem = data[key]
      const schema = dataItem.schema
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
      const collectionName = plugin.metadata.name + '/' + key
      const isCollection = schema.type === 'collection'

      // set data schema
      setDataModal(collectionName, {
        default: dataValue,
        schema: dsSchema.process({}, collectionName, schema, [], true),
        isCollection
      })

      // set default data
      setDataValue(collectionName, dataValue)

      plugin.data.add(setDataValue, getDataValue, collectionName, key)
    }
  }


  return plugin.data
}

/**
 * Set data value
 * @constructor
 */
function DsData () {}

/**
 * Add data getter/setter
 * @param {*} setDataValue
 * @param {*} getDataValue
 * @param {string} namespace
 * @param {string} key
 */
DsData.prototype.add = function (setDataValue, getDataValue, namespace, key) {
  Object.defineProperty(this, key, {
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
    }
  })
}

export { DsData }

export default createData
