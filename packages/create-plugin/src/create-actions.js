/**
 * @typedef {Object} DsActionData
 * @property {Function} value
 * @property {Object} defineParameters
 * @property {string} defineParameters.name - Human readable name of action
 * @property {string} defineParameters.description - Description of action
 * @property {DsActionSchema[]} [defineParameters.schema]
 */

/**
 * @typedef {Object} DsActionSchema - Dooksa action schema item
 * @property {string} [name] - Name of parameter
 * @property {string} [description] - Parameter description
 * @property {('object'|'array'|'string'|'number'|'boolean')} type - Parameter data type
 * @property {DsActionSchema} [items]
 * @property {Object.<string, DsSchemaObject>} [properties] - The properties of an object
 * @property {Object.<string, DsSchemaObject>} [patternProperties] - The property name is equal regex pattern, e.g patternProperties: { '[0-9]': { } }
 * @property {boolean} [uniqueItems] - Ensure that each of the items in an array is unique
 */

/**
 * @typedef {Object} DsSchemaObject
 * @property {string} [name] - Name of parameter
 * @property {string} [description] - Parameter description
 * @property {('object'|'array'|'string'|'number'|'boolean')} type - Parameter data type
 * @property {DsActionSchema} [items]
 * @property {Object.<string, DsSchemaObject>} [properties] - The properties of an object
 * @property {Object.<string, DsSchemaObject>} [patternProperties] - The property name is equal regex pattern, e.g patternProperties: { '[0-9]': { } }
 * @property {string[]} [required] - List of required properties that must exist and contain a value
 * @property {boolean} [uniqueItems] - Ensure that each of the items in an array is unique
 */

/**
 * Create plugin actions
 * @param {*} setActionSchema
 * @param {*} setAction
 * @param {*} plugin
 * @param {Object.<string, DsActionData>} actions
 */
function createActions (setActionSchema, setAction, plugin, actions) {
  plugin.actions = {}

  for (const key in actions) {
    if (Object.hasOwnProperty.call(actions, key)) {
      const { schema, value } = actions[key]
      const namespace = plugin.metadata.name + '/' + key

      // set actions
      setActionSchema(namespace, schema)
      setAction(namespace, value)

      // set local actions
      plugin.actions[key] = value
    }
  }

  return plugin.actions
}

export default createActions
