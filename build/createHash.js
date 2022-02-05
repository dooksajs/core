const os = require('os')
const { filename } = require('../ds.plugin.config')
const crypto = require('crypto')
const fs = require('fs')
const hash = crypto.createHash('sha512', 'resolveDS-263')
const input = fs.createReadStream(`dist/${filename}.js`)

input.on('readable', () => {
  const data = input.read()

  if (data) {
    hash.update(data)
  } else {
    const hashBase64 = `sha512-${hash.digest('base64')}`

    fs.writeFile('ds.plugin.integrity.js', `module.exports = { hash: '${hashBase64}' }` + os.EOL, () => {
      console.log(`${hashBase64} ${filename}`)
    })
  }
})
