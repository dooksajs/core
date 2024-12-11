import { mockPluginModule, mockPluginModuleContext } from '#mock'
import { mockState } from './mock-state.js'

/**
 * @import {
 *   metadata,
 *   state,
 *   stateAddListener,
 *   stateDeleteListener,
 *   stateDeleteValue,
 *   stateFind,
 *   stateGenerateId,
 *   stateGetSchema,
 *   stateGetValue,
 *   stateSetValue,
 *   stateUnsafeSetValue,
 *   editor,
 *   action,
 *   component,
 *   $fetch,
 *   list,
 *   event,
 *   page,
 *   operator,
 *   token,
 *   query,
 *   route,
 *   icon,
 *   string,
 *   form,
 *   variable,
 *   regex
 *  } from '#client'
 * @import {Mock, TestContext} from 'node:test'
 */

/**
 * @typedef {Object} MockClientPluginMap
 * @property {metadata} metadata
 * @property {state} state
 * @property {editor} editor
 * @property {action} action
 * @property {component} component
 * @property {$fetch} fetch
 * @property {list} list
 * @property {event} event
 * @property {page} page
 * @property {operator} operator
 * @property {token} token
 * @property {query} query
 * @property {route} route
 * @property {icon} icon
 * @property {string} string
 * @property {form} form
 * @property {variable} variable
 * @property {regex} regex
 */

/**
 * @typedef {Object} MockStateMethods
 * @property {Mock<stateAddListener>} stateAddListener
 * @property {Mock<stateDeleteListener>} stateDeleteListener
 * @property {Mock<stateDeleteValue>} stateDeleteValue
 * @property {Mock<stateFind>} stateFind
 * @property {Mock<stateGenerateId>} stateGenerateId
 * @property {Mock<stateGetSchema>} stateGetSchema
 * @property {Mock<stateGetValue>} stateGetValue
 * @property {Mock<stateSetValue>} stateSetValue
 * @property {Mock<stateUnsafeSetValue>} stateUnsafeSetValue
 */

/**
 * @template {keyof MockClientPluginMap} Plugin
 * @typedef {{ [K in Plugin]: MockClientPluginMap[K] }} MockClientPluginMapper
 */

/**
 * @template {keyof MockClientPluginMap} Name
 * @template {keyof MockClientPluginMap} Plugin
 * @typedef {Object} MockPlugin
 * @property {MockClientPluginMap[Name]} plugin
 * @property {MockClientPluginMapper<Plugin>} modules
 * @property {Function} restore - Restore mock method
 */

/**
 * Mock a dooksa plugin
 * @template {keyof MockClientPluginMap} Name
 * @template {keyof MockClientPluginMap} Plugin
 * @param {TestContext} context - TextContext constructor
 * @param {Object} param
 * @param {Name} param.name - Name of plugin
 * @param {'client' | 'server'} [param.platform='client'] - Platform the plugin is intended to run on
 * @param {Plugin[]} [param.modules=[]] - List of plugins to the mock.
 * @param {Object.<string, Function>} [param.namedExports={}] - List of plugins to the mock.
 * @returns {Promise<MockPlugin<Name, Plugin> & MockStateMethods>}
 * @example
 * // create mock fn
 * const actionDispatch = t.mock.fn((x) => x)
 * // mock test plugin
 * const mock = await mockPlugin(t, {
 *   name: 'event',
 *   namedExports: { actionDispatch: (x) => x },
 * })
 *
 * mock.stateSetValue({
 *   name: 'event/listeners',
 *   value: ['actionId']
 *   options: {
 *     id: 'eventId',
 *     prefixId: 'componentId'
 *   }
 * })
 *
 * // run metadata setup
 * mock.plugin.emit({
 *   name: 'eventId'
 *   id: 'componentId',
 * })
 *
 * strictEqual(actionDispatch.mock.callCount(), 1)
 */
export function mockPlugin (context, {
  name,
  platform = 'client',
  modules = [],
  namedExports = {}
}) {
  return new Promise((resolve, reject) => {
    const pluginName = name
    const imports = []

    // import plugin
    imports.push(import(`../src/${platform}/${pluginName}.js`))

    // import named exports
    for (let i = 0; i < modules.length; i++) {
      const plugin = modules[i]

      imports.push(import(`../src/${platform}/${plugin}.js`))
    }

    // resolve imports
    Promise.all(imports)
      .then(result => {
        const plugins = []

        // prepare state schema
        for (let index = 0; index < result.length; index++) {
          const plugin = result[index].default

          if (plugin.state) {
            plugins.push(plugin)
          }
        }

        const mockPluginImports = []

        // mock named export plugins
        for (let i = 0; i < modules.length; i++) {
          mockPluginImports.push(
            mockPluginModule(context, modules[i], platform)
          )
        }

        // append mock plugins to named exports
        Promise.all(mockPluginImports)
          .then(results => {
            /** @type {MockClientPluginMapper<Plugin>} */
            const modules = {}

            for (let i = 0; i < results.length; i++) {
              const result = results[i]

              modules[result.name] = result.plugin

              for (let i = 0; i < result.methodNames.length; i++) {
                const name = result.methodNames[i]

                // append mock plugins to named exports
                namedExports[name] = result.plugin[name]
              }
            }

            mockState(plugins)
              .then(state => {
                /** @type {MockPlugin<Name, Plugin>} */
                const result = {
                  modules
                }
                const stateMethods = state.methods

                for (const key in stateMethods) {
                  if (
                    Object.prototype.hasOwnProperty.call(stateMethods, key) &&
                    typeof stateMethods[key] === 'function'
                  ) {
                    // create state mocks
                    const mockMethod = context.mock.method(stateMethods, key)

                    // add state methods to named exports
                    namedExports[key] = mockMethod
                    result[key] = mockMethod
                  }
                }

                // mock plugin module context
                const mockContext = mockPluginModuleContext(context, namedExports, platform)

                // mock plugin
                mockPluginModule(context, pluginName, platform)
                  .then(({ plugin }) => {
                    result.plugin = plugin
                    result.restore = () => {
                      mockContext.restore()
                      state.restore()
                    }

                    resolve(result)
                  })
                  .catch(error => reject(error))
              })
              .catch(error => reject(error))
          })
      })
      .catch(error => reject(error))
  })
}
