import { parseSchema } from '@dooksa/utils'

export default function appendPlugin (appPlugins, appSetup, appDataModels, appActions) {
  const use = (plugin) => {
    // check if plugin exists
    if (appPlugins.includes(plugin)) {
      const setup = plugin.setup
      // unshift setup
      if (setup) {
        appSetup = appSetup.filter(item => item.initialize !== setup)
      }

      return
    }

    // store plugin
    appPlugins.push(plugin)
    const { name, actions, models, dependencies, setup } = plugin

    if (setup) {
      appSetup.push({
        name,
        initialize: setup
      })
    }

    if (dependencies) {
      for (let i = 0; i < dependencies.length; i++) {
        use(dependencies[i])
      }
    }

    // extract actions
    if (appActions && actions) {
      for (const key in actions) {
        if (Object.hasOwnProperty.call(actions, key)) {
          appActions[name + '_' + key] = actions[key].bind(actions)
        }
      }
    }

    // extract data (need to parse and set default value)
    if (models) {
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
          const collectionName = plugin.name + '/' + key
          const isCollection = schemaType === 'collection'

          appDataModels.values[collectionName] = dataValue()
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
