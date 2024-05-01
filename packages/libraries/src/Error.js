class DataSchemaException extends Error {
  /**
   * Dooksa data schema error exception
   * @param {Object} error
   * @param {string} error.message - Error message
   * @param {string} error.schemaPath - Schema path
   * @param {string} error.keyword - Schema keyword
   */
  constructor ({ message, schemaPath, keyword }) {
    super(message)
    // overwrites
    this.name = 'DsDataSchemaError'
    // custom properties
    this.schemaPath = schemaPath
    this.keyword = keyword
  }
}

class DataValueException extends Error {
  /**
   * Dooksa data value error exception
   * @param {string} message
   */
  constructor (message) {
    super(message)
    this.name = 'DsDataValueError'
  }
}

export { DataSchemaException, DataValueException }
