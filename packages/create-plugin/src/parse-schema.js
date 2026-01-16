/**
 * @import { DataSchema, DataSchemaObject } from '../../types.js'
 * @import {
 *  Schema,
 *  SchemaObjectProperty,
 *  SchemaEntry,
 *  SchemaObjectOptions,
 *  SchemaCollectionDefaultId } from '#types'
 */

// Constants for property filtering
const SCHEMA_PROPERTIES = {
  items: true,
  properties: true,
  patternProperties: true,
  type: true,
  name: true
}

const ID_PROPERTIES = {
  defaultId: true,
  suffixId: true,
  prefixId: true
}

/**
 * Parses DataSchema definition to Schema
 * @param {Object} context - The context object that will apply the schema to
 * @param {DataSchema | SchemaObjectProperty} schema - The schema
 * @param {string} id - The schema ID
 * @param {Schema[]} [entries=[]] - Accumulator for schema entries (used internally for recursion)
 * @param {boolean} [isNested=false] - Whether this is a nested schema entry
 * @returns {Schema[]}
 */
export function parseSchema (context, schema, id, entries = [], isNested = false) {
  const $schema = optimiseSchema(context, schema)

  // Handle nested schema IDs
  const schemaId = isNested ? `${id}/items` : id

  if ($schema.properties || $schema.patternProperties) {
    objectSchema(
      context,
      schemaId,
      $schema.entry,
      $schema.properties,
      $schema.patternProperties,
      $schema.entry.options,
      entries
    )
  } else {
    if ($schema.items) {
      parseSchema(context, $schema.items, schemaId, entries, true)
    }

    entries.push({
      id: schemaId,
      entry: $schema.entry
    })
  }

  return entries
}

/**
 * Optimizes and normalizes a schema definition
 * @private
 * @param {Object} context
 * @param {DataSchema | SchemaObjectProperty} schema
 * @returns {Object} Optimized schema with entry, properties, patternProperties, and items
 */
function optimiseSchema (context, schema) {
  const result = { entry: createSchemaEntry(context, schema) }

  if (schema.properties || schema.patternProperties) {
    result.properties = processSchemaProperties(context, schema.properties || {})
    result.patternProperties = processSchemaProperties(context, schema.patternProperties || {}, true)
    result.entryProperties = schema.properties
    result.entryPatternProperties = schema.patternProperties
  } else if (schema.items) {
    result.items = schema.items
  }

  return result
}

/**
 * Process schema properties (both regular and pattern properties)
 * @private
 * @param {Object} context
 * @param {Object.<string, DataSchemaObject>} [properties={}]
 * @param {boolean} [isPattern=false]
 * @returns {(SchemaObjectProperty | SchemaEntry)[]}
 */
function processSchemaProperties (context, properties = {}, isPattern = false) {
  const result = []

  for (const [key, property] of Object.entries(properties)) {
    const hasNestedSchema = entryHasProperties(property)

    if (hasNestedSchema.length) {
      const prop = createNestedProperty(property, key, hasNestedSchema)
      result.push(prop)
    } else {
      const entry = createSchemaEntry(context, property, key)
      result.push(entry)
    }
  }

  return result
}

/**
 * Creates a property object with nested schema properties
 * @private
 * @param {DataSchemaObject} property
 * @param {string} name
 * @param {string[]} nestedProps
 * @returns {SchemaObjectProperty}
 */
function createNestedProperty (property, name, nestedProps) {
  const prop = {
    name,
    type: property.type
  }

  for (const nestedProp of nestedProps) {
    prop[nestedProp] = property[nestedProp]
  }

  return prop
}

/**
 * Creates a schema entry from a property definition
 * @private
 * @param {Object} context
 * @param {DataSchema | SchemaObjectProperty} item - Property values
 * @param {string} [name] - Entry name
 * @returns {SchemaEntry}
 */
function createSchemaEntry (context, item, name) {
  /** @type {SchemaEntry} */
  const entry = { type: item.type }

  if (name) {
    entry.name = name
  }

  // Extract options and ID properties
  const { options, id, hasOptions, hasId } = extractOptionsAndId(context, item)

  if (hasOptions) {
    entry.options = options
  }

  if (hasId) {
    entry.id = id
  }

  return entry
}

/**
 * Extracts options and ID properties from schema item
 * @private
 * @param {Object} context
 * @param {Object} item
 * @returns {Object} Extracted options and ID properties
 */
function extractOptionsAndId (context, item) {
  /** @type {SchemaObjectOptions} */
  const options = {}
  /** @type {SchemaCollectionDefaultId} */
  const id = {}
  /** @type {Object.<string, boolean>} */
  const additionalProperties = {}

  let hasOptions = false
  let hasId = false

  for (const [key, value] of Object.entries(item)) {
    // Skip schema properties
    if (SCHEMA_PROPERTIES[key]) {
      // Track properties for additionalProperties validation
      if (key === 'properties') {
        for (const propKey of Object.keys(value)) {
          additionalProperties[propKey] = true
        }
      }
      continue
    }

    // Handle ID properties
    if (ID_PROPERTIES[key]) {
      const idKey = key.slice(0, -2) // Remove 'Id' suffix
      let processedValue = value

      // Bind function to context
      if (typeof value === 'function') {
        processedValue = value.bind(context)
      }

      id[idKey] = processedValue
      hasId = true
    } else {
      // Handle regular options
      options[key] = value
      hasOptions = true
    }
  }

  // Add allowed properties if additionalProperties is false
  if (hasOptions && options.additionalProperties === false) {
    options.allowedProperties = additionalProperties
  }

  // Bind default function to context
  if (hasOptions && typeof options.default === 'function') {
    options.default = options.default.bind(context)
  }

  return {
    options,
    id,
    hasOptions,
    hasId
  }
}

/**
 * Creates an object schema entry
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

  if (entryProperties.length > 0) {
    item.entry.properties = entryProperties
  }

  if (entryPatternProperties.length > 0) {
    item.entry.patternProperties = entryPatternProperties
  }

  schema.push(item)
}

/**
 * Processes object properties and handles nested schemas
 * @private
 * @param {Object} context
 * @param {string} id
 * @param {SchemaObjectProperty[]} properties
 * @param {SchemaObjectOptions} options
 * @param {Schema[]} schema
 * @returns {SchemaObjectProperty[]}
 */
function objectPropertySchema (context, id, properties = [], options, schema) {
  const entryProperties = []

  for (const property of properties) {
    const name = property.name
    const processedProperty = { ...property }

    // Mark required properties
    if (options?.required?.includes(name)) {
      processedProperty.required = true
    }

    // Handle nested object schemas
    if (processedProperty.properties || processedProperty.patternProperties) {
      const $schema = optimiseSchema(context, processedProperty)
      objectSchema(
        context,
        `${id}/${name}`,
        $schema.entry,
        $schema.properties,
        $schema.patternProperties,
        $schema.entry.options,
        schema
      )

      // Remove nested schema properties from the final property
      delete processedProperty.properties
      delete processedProperty.patternProperties
    } else if (processedProperty.items) {
      parseSchema(context, processedProperty, `${id}/${name}`, schema)
      delete processedProperty.items
    }

    entryProperties.push(processedProperty)
  }

  return entryProperties
}

/**
 * Checks if an entry has nested schema properties
 * @private
 * @param {DataSchemaObject} entry
 * @returns {string[]} Array of property names that indicate nested schemas
 */
function entryHasProperties (entry) {
  if (entry.items) {
    return ['items']
  }

  const result = []

  if (entry.properties) {
    result.push('properties')
  }

  if (entry.patternProperties) {
    result.push('patternProperties')
  }

  return result
}
