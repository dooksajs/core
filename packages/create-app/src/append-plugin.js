import { parseSchema } from '@dooksa/utils'

/**
 * @import {Plugin} from '../../create-plugin/src/index.js'
 */

export default function appendPlugin (appPlugins, appSetup, appDataModels, appActions) {
  /**
   * @param {Plugin} plugin
   */
  const use = (plugin) => {
    // check if plugin exists
    if (appPlugins.includes(plugin)) {
      const setup = plugin.setup

      // remove setup
      if (setup) {
        appSetup = appSetup.filter(item => item.setup !== setup)
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
        use(dependencies[i])
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
          let dataValue

          switch (schemaType) {
            case 'collection':
              dataValue = () => ({})
              break
            case 'object':
              dataValue = () => ({})
              break
            case 'array':
              dataValue = () => ([])
              break
            case 'string':
              dataValue = () => ('')
              break
            case 'number':
              dataValue = () => (0)
              break
            case 'boolean':
              dataValue = () => (true)
              break
          }

          // data namespace
          const collectionName = name + '/' + key
          const isCollection = schemaType === 'collection'

          appDataModels.values[collectionName] = dataValue()
          appDataModels.names.push(collectionName)
          appDataModels.schema.push({
            name: collectionName,
            entries: parseSchema.process({}, collectionName, modelItem, [], true),
            isCollection
          })
        }
      }
    }
  }

  return use
}
