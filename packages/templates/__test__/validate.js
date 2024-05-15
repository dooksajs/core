import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { getSchemaValidator } from '@dooksa/schema'

const validate = getSchemaValidator()
const files = readdirSync(resolve(import.meta.dirname, '../src'), {
  withFileTypes: true,
  recursive: true
})

// Add schema
for (let i = 0; i < files.length; i++) {
  const file = files[i]

  if (file.isFile()) {
    const fileSplit = file.name.split('.')

    if (fileSplit[fileSplit.length - 1] === 'json') {
      const data = readFileSync(resolve(file.parentPath, file.name), { encoding: 'utf-8' })
      const valid = validate(JSON.parse(data))

      if (!valid) {
        console.log(file.name, validate.errors)
      } else {
        console.log(file.name, 'is valid')
      }
    }
  }
}
