
/**
 * @import { DataSchema, DataSchemaObject } from '../../types.js'
 * @import {
 *  Schema,
 *  SchemaObjectProperty,
 *  SchemaEntry,
 *  SchemaObjectOptions,
 *  SchemaCollectionDefaultId } from '#types'
 */

/**
 * @param {Object} context - The context object that will apply the schema to
 * @param {DataSchema | SchemaObjectProperty} schema - The schema
 * @param {string} id - The schema ID
 * @returns {Schema[]}
 */
export default function createSchema (context, schema, id) {
  const $schema = optimiseSchema(context, schema)

  /** @type {Schema[]} */
  const entries = arguments[3] || []

  // check if this entry is nested
  if (arguments[4] === true) {
    // set nested id
    id = id + '/items'
  }

  if ($schema.properties || $schema.patternProperties) {
    objectSchema(context, id, $schema.entry, $schema.properties, $schema.patternProperties, $schema.entry.options, entries)
  } else {
    if ($schema.items) {
      createSchema(context, $schema.items, id, entries, true)
    }

    entries.push({
      id,
      entry: $schema.entry
    })
  }

  return entries
}

/**
 * @private
 * @param {Object} context
 * @param {DataSchema | SchemaObjectProperty} schema
 * @returns {Schema}
 */
function optimiseSchema (context, schema) {
  const result = {
    entry: createSchemaEntry(context, schema)
  }

  if (schema.properties || schema.patternProperties) {
    result.properties = []
    result.patternProperties = []
    result.entryProperties = schema.properties
    result.entryPatternProperties = schema.patternProperties

    for (const key in schema.patternProperties) {
      if (Object.hasOwnProperty.call(schema.patternProperties, key)) {
        const property = schema.patternProperties[key]
        const hasProperties = entryHasProperties(property)

        if (hasProperties) {
          result.patternProperties.push({
            name: key,
            type: property.type,
            [hasProperties]: property[hasProperties]
          })
        } else {
          const entry = createSchemaEntry(context, property, key)

          result.patternProperties.push(entry)
        }
      }
    }

    for (const key in schema.properties) {
      if (Object.hasOwnProperty.call(schema.properties, key)) {
        const property = schema.properties[key]
        const hasProperties = entryHasProperties(property)

        if (hasProperties) {
          result.properties.push({
            name: key,
            type: property.type,
            [hasProperties]: property[hasProperties]
          })
        } else {
          const entry = createSchemaEntry(context, property, key)

          result.properties.push(entry)
        }
      }
    }
  } else if (schema.items) {
    result.items = schema.items
  }

  return result
}

/**
 * @private
 * @param {Object} context
 * @param {DataSchema | SchemaObjectProperty} item - Property values
 * @param {string} [name] - Entry name
 * @returns {SchemaEntry}
 */
function createSchemaEntry (context, item, name) {
  const props = ['items', 'properties', 'patternProperties', 'type', 'name']
  const idProps = ['defaultId', 'suffixId', 'prefixId']
  /** @type {SchemaEntry} */
  const entry = { type: item.type }
  /** @type {SchemaObjectOptions} */
  const options = {}
  let additionalProperties
  /** @type {SchemaCollectionDefaultId} */
  const id = {}
  let hasOptions = false
  let hasId = false

  if (name) {
    entry.name = name
  }

  for (const key in item) {
    if (Object.hasOwnProperty.call(item, key)) {
      let value = item[key]

      // prepare additionalProperties
      if (key === 'properties') {
        additionalProperties = Object.keys(value)
      }

      // collect options
      if (idProps.includes(key)) {
        const idKey = key.substring(-1, key.length - 2)

        // add plugin context to function
        if (typeof value === 'function') {
          value = value.bind(context)
        }

        id[idKey] = value
        hasId = true
      } else if (!props.includes(key)) {
        options[key] = value
        hasOptions = true
      }
    }
  }

  if (hasOptions) {
    // add allowed properties
    if (options.additionalProperties === false) {
      options.additionalProperties = additionalProperties
    }

    if (typeof options.default === 'function') {
      options.default = options.default.bind(context)
    }

    entry.options = options
  }

  if (hasId) {
    entry.id = id
  }

  return entry
}

/**
 * @private
 * @param {Object} context
 * @param {string} id - The schema ID
 * @param {SchemaEntry} entry
 * @param {SchemaObjectProperty[]} properties
 * @param {SchemaObjectProperty[]} patternProperties
 * @param {SchemaObjectOptions} options
 * @param {Schema[]} schema
 */
function objectSchema (context, id, entry, properties, patternProperties, options, schema) {
  const item = {
    id,
    entry
  }

  const entryProperties = objectPropertySchema(context, id, properties, options, schema)
  const entryPatternProperties = objectPropertySchema(context, id, patternProperties, options, schema)

  if (entryProperties.length) {
    item.entry.properties = entryProperties
  }

  if (entryPatternProperties.length) {
    item.entry.patternProperties = entryPatternProperties
  }

  schema.push(item)
}

/**
 * @private
 * @param {Object} context
 * @param {string} id
 * @param {SchemaObjectProperty[]} properties=[]
 * @param {SchemaObjectOptions} options
 * @param {Schema[]} schema
 */
function objectPropertySchema (context, id, properties = [], options, schema) {
  const entryProperties = []

  for (let i = 0; i < properties.length; i++) {
    const property = properties[i]
    const name = property.name

    if (options &&
      Array.isArray(options.required) &&
      options.required.includes(name)
    ) {
      property.required = true
    }

    if (property.properties || property.patternProperties) {
      const $schema = optimiseSchema(context, property)

      objectSchema(context, id + '/' + name, $schema.entry, $schema.properties, $schema.patternProperties, $schema.entry.options, schema)
    } else if (property.items) {
      createSchema(context, property, id + '/' + name, schema)
    }

    entryProperties.push(property)
  }

  return entryProperties
}

/**
 * @private
 * @param {DataSchemaObject} entry
 * @returns {'items' | 'properties' | 'patternProperties' | undefined}
 */
function entryHasProperties (entry) {
  if (entry.items) {
    return 'items'
  }

  if (entry.properties) {
    return 'properties'
  }

  if (entry.patternProperties) {
    return 'patternProperties'
  }
}
