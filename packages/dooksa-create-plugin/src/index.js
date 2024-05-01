import createData from './create-data.js'
import createActions from './create-actions.js'
import createActionSchema from './create-action-schema.js'

/**
 * @typedef {import("./create-action-schema.js").DsActionSchemaData} DsActionSchemaData
 * @typedef {import("./create-actions.js").DsAction} DsAction
 * @typedef {import("./create-data.js").DsData} DsData
 * @typedef {import("./create-data.js").DefineDsData} DefineDsData
 */

/**
 * @callback defineHelper
 * @param {Object} helper
 * @param {Object} helper.context
 * @param {defineData} helper.defineData - Define plugin data
 * @param {defineActions} helper.defineActions - Define plugin actions
 * @param {defineActionSchema} helper.defineActionSchema - Define plugin actions
 * @param {defineContextProperties} helper.defineContextProperties - Define global context properties
 * @param {defineSetup} helper.defineSetup - Define plugin setup callback
 */

/**
 * @callback defineSetup
 * @param {Function} callback - Initialization function
 */

/**
 * @callback defineContextProperties - Define plugin actions
 * @param {Object} values
 */

/**
 * @callback defineData - Define plugin actions
 * @param {Object.<string, DefineDsData>} data
 * @returns {DsData}
 */

/**
 * @callback defineActions - Define plugin actions
 * @param {Object.<string, Function>} actions
 * @return {DsAction}
 */

/**
 * @callback defineActionSchema - Define plugin action schema
 * @param {Object.<string, DsActionSchemaData>} actions
 */

/**
 * @typedef {Object} dsPlugin - Dooksa plugin instance
 * @property {string} dsPlugin.name - Name of plugin
 * @property {DsData} [dsPlugin.data] - Plugin data
 * @property {DsAction} [dsPlugin.actions] - Plugin actions
 */

/**
 * Create plugin helper
 * @param {string} name
 * @param {defineHelper} defineHelper
 * @return {dsPlugin}
 */
function createPlugin (name, defineHelper) {
  const context = getPluginContext()
  const plugin = { name }
  const {
    getDataValue,
    setAction,
    setActionSchema,
    setDataSchema,
    setDataValue,
    setSetup
  } = context

  defineHelper({
    context,
    defineActions (actions) {
      return createActions(
        setAction,
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
    defineActionSchema (data) {
      return createActionSchema(
        setActionSchema,
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
    },
    defineSetup (setup) {
      setSetup(setup)
    }
  })

  return plugin
}

export default createPlugin
