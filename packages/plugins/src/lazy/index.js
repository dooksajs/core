/**
 * @type {Object.<string, string>} List of lazy plugins
 * @example
 * {
 *   bootstrapModal: 'bootstrap-modal',
 *   bootstrapCollapse: 'bootstrap-collapse'
 * }
 */
const pluginFilenames = {}

/**
 *
 */
function lazyLoader (pluginName) {
  return new Promise((resolve, reject) => {
    const filename = pluginFilenames[pluginName]

    if (!filename) {
      return resolve()
    }

    import(`./${filename}.js`)
      .then(({ default: plugin }) => {
        resolve(plugin)
      })
      .catch(error => reject(error))
  })
}

export {
  lazyLoader
}
