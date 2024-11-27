import { parseSchema } from '@dooksa/utils/server'

/**
 * @import {Plugin} from '../../create-plugin/src/index.js'
 */

/**
 * @callback UsePlugin
 * @param {Plugin} plugin
 */

/**
 * @typedef {Object} AppModel
 * @property {Object.<string, Object|string|number|boolean|Array>} values - Default values
 * @property {string[]} names - Collection schema name
 * @property {Object[]} schema - @TODO add docs to parseSchema.process
 */

/**
 * @typedef {Object} AppPlugin
 * @property {UsePlugin} use
 * @property {Plugin[]} plugins
 * @property {AppModel} models
 * @property {Object.<string, Function>} actions
 * @property {AppSetup[]} setup
 */

/**
 * @typedef {Object} AppSetup
 * @property {string} name - Plugin name
 * @property {Function} setup - Plugin setup method
 */

/**
 * @param {'collection'|'object'|'array'|'string'|'number'|'boolean'} type
 */
function dataValue (type) {
  let value

  switch (type) {
    case 'collection':
      value = {}
      break
    case 'object':
      value = {}
      break
    case 'array':
      value = []
      break
    case 'string':
      value = ''
      break
    case 'number':
      value = 0
      break
    case 'boolean':
      value = true
      break
    default:
      throw new Error('DooksaError: Unexpected data model "' + type + '"')
  }

  return value
}

/**
 * Append plugin
 * @returns  {AppPlugin}
 */
export default function appendPlugin () {
  /** @type {Plugin[]} */
  const appPlugins = []
  /** @type {AppSetup[]} */
  let appSetup = []
  /** @type {Object.<string, Function>} */
  const appActions = {}
  /** @type {AppModel} */
  const appModels = {
    values: {},
    schema: [],
    names: []
  }

  return {
    /**
     * @param {Plugin} plugin
     */
    use (plugin) {
    // check if plugin exists
      if (appPlugins.includes(plugin)) {
        const setup = plugin.setup

        // remove setup
        if (setup) {
          for (let i = 0; i < appSetup.length; i++) {
            const item = appSetup[i]

            if (item.setup === setup) {
              appSetup.splice(i, 1)
              i--
            }
          }
        }

        return
      }

      // store plugin
      appPlugins.push(plugin)
      const dependencies = plugin.dependencies
      const name = plugin.name
      const actions = plugin.actions

      if (plugin.setup) {
        appSetup.push({
          name,
          setup: plugin.setup
        })
      }

      if (dependencies) {
        for (let i = 0; i < dependencies.length; i++) {
          this.use(dependencies[i])
        }
      }

      // append actions
      if (appActions && actions) {
        for (let i = 0; i < actions.length; i++) {
          const action = actions[i]

          appActions[action.name] = action.method
        }
      }

      // extract data (need to parse and set default value)
      if (plugin.models) {
        const models = plugin.models

        for (const key in models) {
          if (Object.hasOwnProperty.call(models, key)) {
            const modelItem = models[key]
            const schemaType = modelItem.type

            // data namespace
            const collectionName = name + '/' + key
            const isCollection = schemaType === 'collection'

            appModels.values[collectionName] = dataValue(schemaType)
            appModels.names.push(collectionName)
            appModels.schema.push({
              name: collectionName,
              entries: parseSchema.process({}, collectionName, modelItem, [], true),
              isCollection
            })
          }
        }
      }
    },
    get plugins () {
      return appPlugins
    },
    get models () {
      return appModels
    },
    get actions () {
      return appActions
    },
    get setup () {
      return appSetup
    },
    set setup (value) {
      appSetup = value
    }
  }
}
