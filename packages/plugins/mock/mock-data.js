import createPlugin from '@dooksa/create-plugin'

/**
 * @import {data} from '../src/client/data.js'
 * @import {PluginSchemaGetter, PluginSchema} from '@dooksa/create-plugin/types'
 */

/**
 * @typedef {Object} MockData
 * @property {data} data - Data plugin
 * @property {Function} restore - Reset database
 */

/**
 * @param {Object[]} [plugins=[]]
 * @param {string} plugins[].name - Name of plugin
 * @param {PluginSchema} plugins[].schema - Plugin schema
 * @returns {Promise<MockData>}
 */
export function mockData (plugins = []) {
  return new Promise((resolve, reject) => {
    /** @type {PluginSchemaGetter} */
    const _schema = {
      $values: {},
      $items: [],
      $names: []
    }

    // crate schema for database
    for (let i = 0; i < plugins.length; i++) {
      const { name, schema } = plugins[i]
      const plugin = createPlugin(name, { schema })

      _schema.$values = Object.assign(_schema.$values, plugin.schema.$values)
      _schema.$names = _schema.$names.concat(plugin.schema.$names)
      _schema.$items = _schema.$items.concat(plugin.schema.$items)
    }

    // import data module
    import('../src/client/data.js')
      .then(({ data }) => {
        // setup data
        data.setup(_schema)

        resolve({
          data,
          restore () {
            // restore default database
            data.setup({
              $values: {},
              $items: [],
              $names: []
            })
          }
        })
      })
      .catch(error => reject(error))
  })
}
