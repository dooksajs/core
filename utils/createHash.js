const os = require('os')
const path = require('path')
const { appDirectory } = require('./paths.js')
const { filename } = require(path.join(appDirectory, 'ds.plugin.config.js'))
const crypto = require('crypto')
const fs = require('fs')
const hash = crypto.createHash('sha512', 'resolveDS-263')

module.exports = function () {
  const input = fs.createReadStream(`dist/${filename}.js`)

  input.on('readable', () => {
    const data = input.read()

    if (data) {
      hash.update(data)
    } else {
      const hashBase64 = `sha512-${hash.digest('base64')}`

      fs.writeFile('ds.plugin.integrity.js', `module.exports = { hash: '${hashBase64}' }` + os.EOL, () => {
        console.log(`Hash for plugin: ${hashBase64}`)
      })
    }
  })
}
