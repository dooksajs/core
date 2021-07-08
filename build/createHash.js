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
    console.log(`sha512-${hash.digest('base64')} ${filename}`)
  }
})
