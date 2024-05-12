import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const files = readdirSync(resolve(import.meta.dirname), {
  withFileTypes: true
})

const schema = {}

// process all the action files
for (let i = 0; i < files.length; i++) {
  const file = files[i]

  if (file.isFile()) {
    const fileSplit = file.name.split('.')

    if (fileSplit[fileSplit.length - 1] === 'json') {
      const data = readFileSync(resolve(file.parentPath, file.name), { encoding: 'utf-8' })
      const key = fileSplit[0]

      schema[key] = JSON.parse(data)
    }
  }
}

export {
  schema
}

export default schema.base
