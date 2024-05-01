import dsSchema from './utils/schema.js'
import { PluginData } from '@dooksa/libraries'

/**
 * @typedef {import("../../global-typedef.js").DataSchema} DataSchema
 * @typedef {import("../../global-typedef.js").SetDataOptions} SetDataOptions
 * @typedef {import("@dooksa/libraries").DataResult} DataResult
 */

/**
 * @typedef {Object} DefineDsData - Dooksa plugin data
 * @property {(Function|string)} [default] - Default value to be set
 * @property {DataSchema} [schema] - The data schema
 * @property {string} [description] - Description of data set
 */

/**
 *
 * @param {*} setDataModal
 * @param {*} setDataValue
 * @param {*} getDataValue
 * @param {*} plugin
 * @param {Object.<string, DefineDsData>} data
 * @returns {PluginData}
 */
function createData (setDataModal, setDataValue, getDataValue, plugin, data) {
  plugin.data = new PluginData()

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

export default createData
