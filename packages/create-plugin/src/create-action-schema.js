/**
 * @typedef {Object} DsActionSchemaData
 * @property {string} name - Human readable name of action
 * @property {string} description - Description of action
 * @property {DsActionSchema[]} schema
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
 * Set action schema
 * @param {*} setActionSchema
 * @param {*} plugin
 * @param {Object.<string, DsActionSchemaData>} actions
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
