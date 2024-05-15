import { getSchemaValidator } from '../src/index.js'

const validate = getSchemaValidator()

if (validate.name === 'validate20') {
  console.log('Pass')
} else {
  throw new Error('Schema failed')
}
