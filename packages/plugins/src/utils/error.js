/**
 * Base Dooksa exception class that provides enhanced error handling capabilities
 */
class DooksaException extends Error {
  /**
   * Base exception for Dooksa errors
   * @param {Object} options - Exception options
   * @param {string} options.message - Error message
   * @param {string} [options.code] - Error code for programmatic handling
   * @param {Object} [options.context] - Additional context information
   */
  constructor ({ message, code, context }) {
    super(message)

    // Maintain proper prototype chain
    this.name = this.constructor.name
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }

    // Custom properties
    this.code = code
    this.context = context || {}
    this.timestamp = Date.now()
  }

  /**
   * Serialize error for logging/API responses
   * @returns {Object} Serialized error object
   */
  toJSON () {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      context: this.context,
      timestamp: this.timestamp,
      stack: this.stack
    }
  }

  /**
   * Create a string representation of the error
   * @returns {string} Formatted error string
   */
  toString () {
    const base = `[${this.name}] ${this.message}`
    const code = this.code ? ` (code: ${this.code})` : ''
    return base + code
  }
}

/**
 * Data schema validation exception
 */
class DataSchemaException extends DooksaException {
  /**
   * Dooksa data schema error exception
   * @param {Object} options - Exception options
   * @param {string} options.message - Error message
   * @param {string} options.schemaPath - Schema path where error occurred
   * @param {string} options.keyword - Schema validation keyword that failed
   * @param {string} [options.code] - Error code (e.g., 'SCHEMA_NOT_FOUND', 'TYPE_MISMATCH')
   * @param {*} [options.expected] - Expected value/type
   * @param {*} [options.actual] - Actual value/type
   * @param {Object} [options.context] - Additional context
   */
  constructor ({ message, schemaPath, keyword, code, expected, actual, context }) {
    super({
      message,
      code,
      context
    })

    this.schemaPath = schemaPath
    this.keyword = keyword
    this.expected = expected
    this.actual = actual
  }

  /**
   * @override
   */
  toJSON () {
    return {
      ...super.toJSON(),
      schemaPath: this.schemaPath,
      keyword: this.keyword,
      expected: this.expected,
      actual: this.actual
    }
  }

  /**
   * @override
   */
  toString () {
    const base = super.toString()
    const details = this.schemaPath ? ` at ${this.schemaPath}` : ''
    return base + details
  }

  // Static factory methods for common error types

  /**
   * Create a type mismatch error
   * @param {string} schemaPath - Schema path
   * @param {string} expected - Expected type
   * @param {*} actual - Actual value
   * @returns {DataSchemaException}
   */
  static typeMismatch (schemaPath, expected, actual) {
    const actualType = typeof actual
    return new DataSchemaException({
      schemaPath,
      keyword: 'type',
      message: `Unexpected type, expected "${expected}" but got "${actualType}"`,
      code: 'TYPE_MISMATCH',
      expected,
      actual
    })
  }

  /**
   * Create a required property error
   * @param {string} schemaPath - Schema path
   * @param {string} propertyName - Missing property name
   * @returns {DataSchemaException}
   */
  static requiredProperty (schemaPath, propertyName) {
    return new DataSchemaException({
      schemaPath,
      keyword: 'required',
      message: `Required property missing: "${propertyName}"`,
      code: 'REQUIRED_PROPERTY',
      context: { propertyName }
    })
  }

  /**
   * Create an additional properties error
   * @param {string} schemaPath - Schema path
   * @param {string[]} additionalKeys - Additional property keys
   * @returns {DataSchemaException}
   */
  static additionalProperties (schemaPath, additionalKeys) {
    return new DataSchemaException({
      schemaPath,
      keyword: 'additionalProperties',
      message: `Additional properties not allowed: ${JSON.stringify(additionalKeys)}`,
      code: 'ADDITIONAL_PROPERTIES',
      context: { additionalKeys }
    })
  }

  /**
   * Create a unique items error
   * @param {string} schemaPath - Schema path
   * @returns {DataSchemaException}
   */
  static uniqueItems (schemaPath) {
    return new DataSchemaException({
      schemaPath,
      keyword: 'uniqueItems',
      message: 'Array items must be unique',
      code: 'UNIQUE_ITEMS'
    })
  }

  /**
   * Create a schema not found error
   * @param {string} schemaPath - Schema path
   * @returns {DataSchemaException}
   */
  static schemaNotFound (schemaPath) {
    return new DataSchemaException({
      schemaPath,
      keyword: 'schema',
      message: `Schema not found: "${schemaPath}"`,
      code: 'SCHEMA_NOT_FOUND'
    })
  }

  /**
   * Create a pattern property error
   * @param {string} schemaPath - Schema path
   * @param {string} propertyName - Invalid property name
   * @returns {DataSchemaException}
   */
  static patternProperty (schemaPath, propertyName) {
    return new DataSchemaException({
      schemaPath,
      keyword: 'patternProperty',
      message: `Invalid property name: "${propertyName}"`,
      code: 'PATTERN_PROPERTY',
      context: { propertyName }
    })
  }

  /**
   * Create an update method error
   * @param {string} schemaPath - Schema path
   * @param {string} targetType - Expected target type
   * @param {string} actualType - Actual target type
   * @returns {DataSchemaException}
   */
  static updateMethod (schemaPath, targetType, actualType) {
    return new DataSchemaException({
      schemaPath,
      keyword: 'updateMethod',
      message: `Expected ${targetType} but found ${actualType}`,
      code: 'UPDATE_METHOD_TYPE_MISMATCH',
      expected: targetType,
      actual: actualType
    })
  }

  /**
   * Create an invalid collection error
   * @param {string} collectionName - Collection name
   * @returns {DataSchemaException}
   */
  static invalidCollection (collectionName) {
    return new DataSchemaException({
      schemaPath: collectionName,
      keyword: 'collection',
      message: `Expected collection id to be a string but got undefined`,
      code: 'INVALID_COLLECTION_ID'
    })
  }

  /**
   * Create an invalid source error
   * @param {string} schemaPath - Schema path
   * @returns {DataSchemaException}
   */
  static invalidSource (schemaPath) {
    return new DataSchemaException({
      schemaPath,
      keyword: 'source',
      message: 'Source was undefined',
      code: 'INVALID_SOURCE'
    })
  }
}

/**
 * @typedef {Object} DataValueExceptionOption
 * @property {string} [message] - Error message
 * @property {string} [code] - Error code (e.g., 'COLLECTION_NOT_FOUND', 'INVALID_OPERATION')
 * @property {string} [collection] - Collection name
 * @property {string} [id] - Data ID
 * @property {string} [operation] - Operation being performed
 * @property {Object} [context] - Additional context
 */

/**
 * Data value operation exception
 */
class DataValueException extends DooksaException {
  /**
   * Dooksa data value error exception
   * @param {DataValueExceptionOption|string} options - Exception options or message string for backward compatibility
   */
  constructor (options) {
    // Handle backward compatibility with string parameter
    if (typeof options === 'string') {
      options = { message: options }
    }

    const {
      message,
      code,
      collection,
      id,
      operation,
      context
    } = options

    super({
      message,
      code,
      context
    })

    this.collection = collection
    this.id = id
    this.operation = operation
  }

  /**
   * @override
   */
  toJSON () {
    return {
      ...super.toJSON(),
      collection: this.collection,
      id: this.id,
      operation: this.operation
    }
  }

  /**
   * @override
   */
  toString () {
    const base = super.toString()
    const details = []

    if (this.collection) details.push(`collection: ${this.collection}`)
    if (this.id) details.push(`id: ${this.id}`)
    if (this.operation) details.push(`operation: ${this.operation}`)

    if (details.length > 0) {
      return `${base} [${details.join(', ')}]`
    }

    return base
  }

  // Static factory methods for common error types

  /**
   * Create a collection not found error
   * @param {string} collectionName - Collection name
   * @returns {DataValueException}
   */
  static collectionNotFound (collectionName) {
    return new DataValueException({
      collection: collectionName,
      message: `No collection found: "${collectionName}"`,
      code: 'COLLECTION_NOT_FOUND'
    })
  }

  /**
   * Create an update position error
   * @param {string} position - Position that doesn't exist
   * @param {Object} context - Additional context
   * @returns {DataValueException}
   */
  static updatePositionNotFound (position, context = {}) {
    return new DataValueException({
      message: `Update position does not exist: ${position}`,
      code: 'UPDATE_POSITION_NOT_FOUND',
      operation: 'update',
      context: {
        position,
        ...context
      }
    })
  }

  /**
   * Create an array expected error for update operations
   * @param {string} [operation] - Operation being performed
   * @returns {DataValueException}
   */
  static arrayExpected (operation = 'update') {
    return new DataValueException({
      message: 'Update position and update method expected an array',
      code: 'ARRAY_EXPECTED',
      operation
    })
  }

  /**
   * Create an unsafe set value error
   * @param {*} id - The invalid ID value
   * @returns {DataValueException}
   */
  static unsafeSetValueInvalidId (id) {
    return new DataValueException({
      message: `UnsafeSetValue unexpected id type found "${id}"`,
      code: 'UNSAFE_SET_VALUE_INVALID_ID',
      context: { invalidId: id }
    })
  }

  /**
   * Create a data not found error
   * @param {string} collection - Collection name
   * @param {string} id - Data ID
   * @returns {DataValueException}
   */
  static dataNotFound (collection, id) {
    return new DataValueException({
      collection,
      id,
      message: `Data not found in collection "${collection}" with id "${id}"`,
      code: 'DATA_NOT_FOUND'
    })
  }

  /**
   * Create an invalid operation error
   * @param {string} operation - Invalid operation
   * @param {string} collection - Collection name
   * @param {string} id - Data ID
   * @param {Object} context - Additional context
   * @returns {DataValueException}
   */
  static invalidOperation (operation, collection, id, context = {}) {
    return new DataValueException({
      collection,
      id,
      operation,
      message: `Invalid operation "${operation}" on collection "${collection}"`,
      code: 'INVALID_OPERATION',
      context
    })
  }
}

export { DataSchemaException, DataValueException, DooksaException }
