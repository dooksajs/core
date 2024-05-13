import { parseSchema, isServer } from '@dooksa/utils'
import { routerCurrentId } from '../../plugins/src/router.js'
import { $addDataListener, $getDataValue, $setDataValue } from '../../plugins/src/data.js'
import { sectionAppend, sectionUpdate } from '../../plugins/src/section.js'
import { templateCreate } from '../../plugins/src/template.js'

/**
 * @typedef {Object} pageData
 * @property {string} collection
 * @property {string} [id]
 * @property {*} item
 * @property {DataMetadata} metadata
 */

/**
 * @typedef {Object} DataMetadata
 * @property {number} createdAt
 * @property {number} updatedAt
 * @property {string} [userId]
 */

function appendPlugin (appPlugins, appSetup, appActions, appComponents, appData) {
  return function use (plugin) {
    // check if plugin exists
    if (appPlugins.indexOf(plugin) !== -1) {
      const { name, setup } = plugin
      // unshift setup
      if (setup) {
        appSetup = appSetup.filter(item => item.initialize !== setup)
        appSetup.unshift({ name, initialize: setup })
      }
    }

    // store plugin
    appPlugins.push(plugin)
    const { name, actions, data, dependencies, setup, components } = plugin

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
    if (actions) {
      for (const key in actions) {
        if (Object.hasOwnProperty.call(actions, key)) {
          appActions[name + '_' + key] = actions[key].bind(actions)
        }
      }
    }

    // extract data (need to parse and set default value)
    if (data) {
      for (const key in data) {
        if (Object.hasOwnProperty.call(data, key)) {
          const dataItem = data[key]
          const schemaType = dataItem.type
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

          appData.values[collectionName] = dataValue()
          appData.schema.push({
            name: collectionName,
            entries: parseSchema.process({}, collectionName, dataItem, [], true),
            isCollection
          })
        }
      }
    }

    if (components) {
      for (let i = 0; i < plugin.components.length; i++) {
        const component = plugin.components[i]
        const id = component.name

        appComponents.items[id] = component
        appComponents.items[id].plugin = name

        if (component.content) {
          if (component.content.get) {
            appComponents.getters[id] = component.content.get
          }

          if (component.content.set) {
            appComponents.setters[id] = component.content.set
          }
        }
      }
    }
  }
}

function initialize (appSetup, appActions, appComponents, appData, use, appStartServer) {
  /**
   * Initialize dooksa!
   * @param {Object} param
   * @param {Object} [param.data={ item: [], isEmpty: true, templates: [] }]
   * @param {pageData[]} param.data.item - Current page data
   * @param {boolean} [param.data.isEmpty] - Is data empty
   * @param {string[]} [param.data.templates] - List of template ids
   * @param {Object} [param.options={}]
   * @param {Object} [param.lazy={}]
   * @param {Function} param.loader
   */
  return ({
    data = {
      item: [],
      isEmpty: true,
      templates: []
    },
    options = {},
    lazy = {},
    loader
  } = {
    loader: () => {}
  }) => {
    options.action = {
      action: (name, params) => {
        if (typeof appActions[name] === 'function') {
          return appActions[name](params)
        } else if (!isServer) {
          const pluginName = name.split('_')[0]
          const fileName = lazy[pluginName]

          if (fileName) {
            loader(fileName)
              .then(plugin => {
                use(plugin)

                for (let i = 0; i < appSetup.length; i++) {
                  const setup = appSetup[i]

                  setup.initialize(options[setup.name])

                  appSetup.splice(i)
                }
              })
          }
        }
      },
      availableMethod: (name) => {
        return typeof appActions[name] === 'function'
      }
    }

    options.component = {
      component: (name) => {
        return appComponents.items[name]
      },
      componentGetter: (name) => {
        return appComponents.getters[name]
      },
      componentSetter: (name) => {
        return appComponents.setters[name]
      }
    }

    // setup database
    for (let i = 0; i < appSetup.length; i++) {
      const setup = appSetup[i]

      if (setup.name === 'data') {
        setup.initialize(appData)

        // remove from setup queue
        appSetup.splice(i, 1)
        break
      }
    }

    // setup plugins
    for (let i = 0; i < appSetup.length; i++) {
      const setup = appSetup[i]

      setup.initialize(options[setup.name])
    }

    appSetup = []

    if (isServer() && typeof appStartServer === 'function') {
      return appStartServer(options.server)
    }

    const currentPathId = routerCurrentId()

    // set data
    for (let i = 0; i < data.item.length; i++) {
      const item = data.item[i]

      // need to check if any data requires an async plugin
      $setDataValue(item.collection, item.item, {
        id: item.id,
        metadata: item.metadata
      })
    }

    const section = $getDataValue('section/items', {
      id: currentPathId
    })

    // render page
    if (!section.isEmpty) {
      return sectionAppend({ id: section.id })
    }

    // render templates
    for (let i = 0; i < data.templates.length; i++) {
      const templateId = data.templates[i]
      const templateResult = templateCreate({ id: templateId })

      if (templateResult instanceof Promise) {
        templateResult
          .then(widgetId => {
            $setDataValue('section/items', widgetId, {
              id: currentPathId,
              suffixId: 'default',
              update: {
                method: 'push'
              }
            })
          })
      } else {
        $setDataValue('section/items', templateResult, {
          id: currentPathId,
          suffixId: 'default',
          update: {
            method: 'push'
          }
        })
      }


      const section = $getDataValue('section/items', {
        id: currentPathId
      })

      if (!section.isEmpty) {
        const id = section.id


        sectionAppend({ id })

        const viewId = $getDataValue('view/rootViewId').item
        const handlerValue = () => {
          sectionUpdate({ id, viewId })
        }

        // update section elements
        $addDataListener('section/items', {
          on: 'update',
          id,
          handler: {
            id: viewId,
            value: handlerValue
          }
        })

        // update widget section attachment
        $addDataListener('section/items', {
          on: 'update',
          id,
          force: true,
          priority: 0,
          handler: {
            id: viewId,
            value: ({ item }) => {
              for (let i = 0; i < item.length; i++) {
                $setDataValue('widget/attached', id, { id: item[i] })
              }
            }
          }
        })

        $addDataListener('section/query', {
          on: 'update',
          id,
          handler: {
            id: viewId,
            value: handlerValue
          }
        })

        $addDataListener('section/query', {
          on: 'delete',
          id,
          handler: {
            id: viewId,
            value: handlerValue
          }
        })
      }
    }
  }
}

/**
 * Create Dooksa app
 * @param {Array} plugins
 */
function createApp (plugins) {
  const appPlugins = []
  const appSetup = []
  const appActions = {}
  const appComponents = {
    items: {},
    getters: {},
    setters: {}
  }
  const appData = {
    values: {},
    schema: []
  }
  let appStartServer
  const use = appendPlugin(appPlugins, appSetup, appActions, appComponents, appData)

  for (let i = 0; i < plugins.length; i++) {
    const plugin = plugins[i]

    if (isServer() && plugin.name === 'http') {
      appStartServer = plugin.actions.start
    }

    use(plugin)
  }

  return {
    use,
    setup: initialize(appSetup, appActions, appComponents, appData, use, appStartServer)
  }
}

export { createApp }
