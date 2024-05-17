const pluginFilenames = {
  viewModal: 'view-modal'
}

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

export default lazyLoader
