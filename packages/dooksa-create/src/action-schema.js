/**
 * @typedef {Object} PluginActionSchemaData
 * @property {string} name - Human readable name of action
 * @property {string} description - Description of action
 * @property {PluginActionSchema[]} schema
 */

/**
 * @typedef {Object} PluginActionSchema - Dooksa action schema item
 * @property {string} [name] - Name of parameter
 * @property {string} [description] - Parameter description
 * @property {('object'|'array'|'string'|'number'|'boolean')} type - Parameter data type
 * @property {PluginActionSchema} [items]
 * @property {Object.<string, PluginSchemaObject>} [properties] - The properties of an object
 * @property {Object.<string, PluginSchemaObject>} [patternProperties] - The property name is equal regex pattern, e.g patternProperties: { '[0-9]': { } }
 * @property {boolean} [uniqueItems] - Ensure that each of the items in an array is unique
 */

/**
 * @typedef {Object} PluginSchemaObject
 * @property {string} [name] - Name of parameter
 * @property {string} [description] - Parameter description
 * @property {('object'|'array'|'string'|'number'|'boolean')} type - Parameter data type
 * @property {PluginActionSchema} [items]
 * @property {Object.<string, PluginSchemaObject>} [properties] - The properties of an object
 * @property {Object.<string, PluginSchemaObject>} [patternProperties] - The property name is equal regex pattern, e.g patternProperties: { '[0-9]': { } }
 * @property {string[]} [required] - List of required properties that must exist and contain a value
 * @property {boolean} [uniqueItems] - Ensure that each of the items in an array is unique
 */

/**
 * Set action schema
 * @param {*} setActionSchema
 * @param {*} plugin
 * @param {Object.<string, PluginActionSchemaData>} actions
 */
function createActionSchema (setActionSchema, plugin, actions) {
  for (const key in actions) {
    if (Object.hasOwnProperty.call(actions, key)) {
      const action = actions[key]
      const namespace = plugin.metadata.name + '/' + key

      // set actions
      setActionSchema(namespace, action)
    }
  }
}

export default createActionSchema
