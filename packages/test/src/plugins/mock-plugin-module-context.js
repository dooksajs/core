/**
 * @import {TestContext} from 'node:test'
 */

/**
 * Mock plugin named imports
 * @param {TestContext} context
 * @param {Object.<string, Function>} namedExports - An object whose keys and values are used to create the named exports of the mock module.
 * @param {'client' | 'server'} [platform='client'] - Platform the plugin is intended to run on
 */
export function mockPluginModuleContext (context, namedExports, platform = 'client') {
  return context.mock.module('#' + platform, { namedExports })
}
