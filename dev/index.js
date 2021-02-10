import DsPlugins from '@dooksa/ds-plugins'

const plugins = new DsPlugins({ isDev: true })
plugins.action({ pluginName: 'dsFirebaseAuth', methodName: 'error', params: { code: '404', message: 'page not found' } })
console.log(plugins)
