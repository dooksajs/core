import { createPlugin } from '@dooksa/create-plugin'
import { dataGetSchema } from './data.js'

/**
 * @typedef {Object} EditorDataSchemaObject
 * @property {boolean} isPatterned - Is property name a regex pattern
 * @property {string} name - Name of property
 * @property {string} type - Data type
 * @property {EditorDataSchemaObject[]} [properties] - Object properties
 * @property {EditorDataSchema} [items] - Array items
 *
 * @typedef {Object} EditorDataSchema
 * @property {EditorDataSchema} [items]
 * @property {EditorDataSchemaObject[]} [properties]
 * @property {string} type - Data type
 */

export const editor = createPlugin('editor', {
  metadata: {
    title: 'Editor',
    description: 'Utilities for managing components',
    icon: ''
  },
  methods: {
    schemaProperties (schemaName, properties, isPatterned = false) {
      const result = []

      for (let i = 0; i < properties.length; i++) {
        const { name, type, options } = properties[i]
        const item = {
          name,
          type,
          isPatterned
        }

        result.push(item)

        if (type === 'object') {
          const newSchemaName = schemaName + '/' + name
          const schema = dataGetSchema(newSchemaName)

          if (schema) {
            item.properties = []

            if (schema.properties) {
              item.properties = item.properties.concat(this.schemaProperties(newSchemaName, schema.properties))
            }

            if (schema.patternProperties) {
              item.properties = item.properties.concat(this.schemaProperties(newSchemaName, schema.patternProperties, true))
            }
          }
        } else if (type === 'array') {
          const newSchemaName = schemaName + '/items'
          const schema = dataGetSchema(newSchemaName)

          if (schema) {
            // @ts-ignore
            item.items = this.getSchema(newSchemaName)
          }
        }

        if (options) {
          item.options = options
        }
      }

      return result
    }
  },
  actions: {
    getSchema: {
      metadata: {
        title: 'Get data schema',
        description: 'Useful data to display data components',
        icon: 'vscode-icons:file-type-json-schema'
      },
      /**
       * Useful data to display data components
       * @param {string} name
       * @returns {EditorDataSchema}
       */
      method (name) {
        const schema = dataGetSchema(name)
        let result = {
          type: schema.type
        }

        if (schema.type === 'collection') {
          // @ts-ignore
          result = this.getSchema(name + '/items')
        } else if (schema.type === 'array') {
          // @ts-ignore
          result.items = this.getSchema(name + '/items')
        } else if (schema.type === 'object' && schema.properties) {
          // @ts-ignore
          result.properties = this.schemaProperties(name + '/items', schema.properties)
        }

        return result
      }
    }
  }
})

export const {
  editorGetSchema,
  editorSchemaProperties
} = editor

export default editor
