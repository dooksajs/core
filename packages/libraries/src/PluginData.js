import { DataResult } from './DataResult.js'

/**
 * @typedef {import('../../global-typedef.js').SetDataOptions} SetDataOptions
 */

/**
 * Set data value
 * @constructor
 */
function PluginData () {}

/**
 * Add data getter/setter
 * @param {*} setDataValue
 * @param {*} getDataValue
 * @param {string} namespace
 * @param {string} key
 */
PluginData.prototype.add = function (setDataValue, getDataValue, namespace, key) {
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
     * @param {SetDataOptions} [item.options]
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

export { PluginData }
