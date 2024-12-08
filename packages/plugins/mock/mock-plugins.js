/**
 * @param {import('node:test').TestContext} context
 * @param {Object.<string, Function>} namedExports
 * @param {'client' | 'server'} [platform='client']
 */
export function mockPlugins (context, namedExports, platform = 'client') {
  return context.mock.module('#' + platform, { namedExports })
}
