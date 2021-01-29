import ScriptLoader from '@dooksa/script-loader'
import basePlugins from './basePlugins'
function PluginLoader () {
  // prepare global variable for plugin scripts
  if (!window.pluginLoader) {
    window.pluginLoader = {}
  }
}

PluginLoader.prototype.get = function (name, version) {
  return new Promise((resolve, reject) => {
    let pluginId = version ? `${name}/v${version}` : name
    let scriptSrc

    if (basePlugins[name]) {
      if (version && basePlugins[name].items[version]) {
        scriptSrc = basePlugins[name].items[version]
      } else {
        const current = basePlugins[name].current

        scriptSrc = current.src
        pluginId = `${name}/v${current.version}`
      }
    }

    if (scriptSrc) {
      const script = new ScriptLoader({
        id: 'plugin-' + pluginId,
        src: scriptSrc
      })

      script.load()
        .then(() => resolve(window.pluginLoader[pluginId]))
        .catch(error => reject(error))
    } else {
      const error = new Error('plugin not found: ' + pluginId)

      reject(error)
    }
  })
}

export default PluginLoader
