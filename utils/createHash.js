import os from 'os'
import path from 'path'
import crypto from 'crypto'
import fs from 'fs'

const hash = crypto.createHash('sha512', 'resolveDS-263')

export default function (filename) {
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
