const pluginFilenames = {
  bootstrapModal: 'bootstrap-modal',
  bootstrapCollapse: 'bootstrap-collapse'
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

export {
  lazyLoader
}
