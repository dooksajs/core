/**
 * Represents metadata associated with a data entity
 * @typedef {Object} DataMetadata
 * @property {number} createdAt - Timestamp indicating when the data was initially created (Unix timestamp in milliseconds)
 * @property {number} updatedAt - Timestamp of the most recent update to the data (Unix timestamp in milliseconds)
 * @property {number} [userId] - Unique identifier of the user who created or last modified the data
 */

/**
 * Represents a data value with optional metadata and expansion capabilities
 * @template Data
 * @typedef {Object} DataValue
 * @property {string} [id] - The unique identifier for the data value
 * @property {string} collection - The collection name this data belongs to
 * @property {boolean} [isEmpty] - Flag indicating if the data value is empty
 * @property {boolean} [isExpandEmpty] - Flag indicating if expanded data is empty
 * @property {DataValue<Data>[]} [expand] - Array of expanded data values
 * @property {Object.<string, (boolean|number)>} [expandIncluded] - Object indicating which fields are included in expansion
 * @property {boolean} [isAffixEmpty] - Flag indicating if affixes are empty
 * @property {boolean} [isValid] - Flag indicating if the data value is valid
 * @property {Object.<string, DataTarget<Data>> & DataTarget<Data>} [target] - Target data with expandable references
 * @property {Data} [item] - The actual data item
 * @property {Data} [previous] - Previous version of the data item
 * @property {DataMetadata} [metadata] - Metadata associated with the data
 */

/**
 * Represents a data target containing the actual data item and its metadata
 * @template Data
 * @typedef {Object} DataTarget
 * @property {Data} _item - The actual data item
 * @property {DataMetadata} _metadata - Metadata associated with the data item
 * @property {DataPreviousTarget} [_previous] - Previous version of the data target
 */

/**
 * Represents a previous version of a data target
 * @typedef {Object} DataPreviousTarget
 * @property {*} _item - The previous data item
 * @property {DataMetadata} _metadata - Metadata from the previous version
 */

/**
 * Creates a DataValue object from the provided parameters
 * @template Data
 * @param {Object} param - The parameters for creating the data value
 * @param {string} [param.collection=''] - The collection name for the data
 * @param {string} [param.id] - The unique identifier for the data
 * @param {Data|DataTarget<Data>} [param.value] - The data value, either raw data or a DataTarget object containing _item, _metadata, and optionally _previous
 * @returns {DataValue<Data>} A DataValue object containing the collection, id (if provided), item, and optionally metadata and previous values
 */
function createDataValue ({
  collection = '',
  id,
  value
} = {}) {
  const result = { collection }

  if (typeof id === 'string' && id !== '') {
    result.id = id
  }

  if (value) {
    // Check if value is a DataTarget-like object
    if (value && typeof value === 'object' && '_item' in value && value._item != null) {
      result.item = value._item

      if (value._metadata) {
        result.metadata = value._metadata
      }

      if (value._previous) {
        result.previous = value._previous
      }
    } else {
      // Raw data value
      result.item = value
    }
  }

  return result
}

/**
 * Removes affixes from an ID string
 * @param {string} id - The ID string that may contain affixes (format: prefix_id_suffix)
 * @returns {string} The ID without affixes, or the original ID if it doesn't match the affix pattern
 */
function removeAffix (id) {
  if (!id) {
    return ''
  }

  const splitString = id.split('_', 3)

  // If we have exactly 3 parts (prefix, id, suffix), return everything between first and last underscore
  if (splitString.length === 3 && splitString[1] !== '') {
    const firstUnderscore = id.indexOf('_')
    const lastUnderscore = id.lastIndexOf('_')
    return id.substring(firstUnderscore, lastUnderscore + 1)
  }

  // Otherwise return the original ID
  return id
}

export {
  createDataValue,
  removeAffix
}
