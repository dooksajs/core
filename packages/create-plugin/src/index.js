import createData from './create-data.js'
import createActions from './create-actions.js'

/**
 * @typedef {import("@dooksa/ds-scripts/src/types.js").DsData} DsDataSchema
 * @typedef {import("./create-actions.js").DsActionData} DsActionData
 */

/**
 * @callback defineHelper
 * @param {Object} helper
 * @param {Object} helper.context
 * @param {defineData} helper.defineData - Define plugin data
 * @param {defineActions} helper.defineActions - Define plugin actions
 * @param {defineContextProperties} helper.defineContextProperties - Define global context properties
 */

/**
 * @callback defineContextProperties - Define plugin actions
 * @param {Object} values
 */

/**
 * @callback defineData - Define plugin actions
 * @param {Object.<string, DsDataSchema>} data
 */

/**
 * @callback defineActions - Define plugin actions
 * @param {Object.<string, DsActionData>} actions
 */

/**
 * Create plugin helper
 * @param {string} name
 * @param {defineHelper} defineHelper
 * @returns {Object}
 */
function createPlugin (name, defineHelper) {
  const context = getPluginContext()
  const plugin = { name }
  const {
    setAction,
    setActionSchema,
    setDataSchema,
    setDataValue,
    getDataValue
  } = context

  defineHelper({
    context,
    defineActions (actions) {
      return createActions(
        setAction,
        setActionSchema,
        plugin,
        actions
      )
    },
    defineData (data) {
      return createData(
        setDataSchema,
        setDataValue,
        getDataValue,
        plugin,
        data
      )
    },
    defineContextProperties (values) {
      for (const key in values) {
        if (Object.hasOwnProperty.call(values, key)) {
          setContextProperty(key, values[key])
        }
      }
    }
  })

  return plugin
}


export default createPlugin
