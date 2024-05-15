import Ajv from 'ajv/dist/2020.js'
import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * Get template build schema
 * @param {string} version
 */
function getSchemaValidator (version = '1.0') {
  const files = readdirSync(resolve(import.meta.dirname, version), {
    withFileTypes: true
  })

  const schemas = []

  // Add schema
  for (let i = 0; i < files.length; i++) {
    const file = files[i]

    if (file.isFile()) {
      const fileSplit = file.name.split('.')

      if (fileSplit[fileSplit.length - 1] === 'json') {
        const data = readFileSync(resolve(file.parentPath, file.name), { encoding: 'utf-8' })

        schemas.push(JSON.parse(data))
      }
    }
  }

  // @ts-ignore
  const ajv = new Ajv({ schemas })

  return ajv.getSchema('https://schema.dooksa.org/1.0/template-build.schema.json')
}

export {
  getSchemaValidator
}
