/**
 * @import {TestContext} from 'node:test'
 * @import {Plugin} from '@dooksa/create-plugin/types'
 * @import {MockClientPluginMap} from './mock-plugin.js'
 */

/**
 * @template {keyof MockClientPluginMap} Name
 * @typedef {Object} MockPluginModule
 * @property {string} name - Plugin name
 * @property {MockClientPluginMap[Name]} plugin - Plugin
 * @property {string[]} methodNames - List of plugin method names
 */

/**
 * Mock a dooksa plugin
 * @template {keyof MockClientPluginMap} Name
 * @param {TestContext} context - TextContext constructor
 * @param {Name} name - Name of plugin
 * @param {'client' | 'server'} [platform='client'] - Platform the plugin is intended to run on
 * @returns {Promise<MockPluginModule<Name>>}
 */
export function mockPluginModule (context, name, platform = 'client') {
  return new Promise((resolve, reject) => {
    import(`../src/${platform}/${name}.js?${crypto.randomUUID().substring(30)}`)
      .then(({ default: plugin }) => {
        const methodNames = Object.keys(plugin)

        for (let i = 0; i < methodNames.length; i++) {
          const name = methodNames[i]
          // mock plugin method
          context.mock.method(plugin, name)
        }

        resolve({
          plugin,
          methodNames,
          name: plugin.name
        })
      })
      .catch(error => reject(error))
  })
}
