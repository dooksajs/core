/**
 * @import {DataValue, DataTarget, DataMetadata} from '../../../types.js'
 */

/**
 * Creates a DataValue object from the provided parameters
 * @template Data
 * @param {Object} param - The parameters for creating the data value
 * @param {string} [param.collection=''] - The collection name for the data
 * @param {string} [param.id] - The unique identifier for the data
 * @param {Data|DataTarget} [param.value] - The data value, either raw data or a DataTarget object containing _item, _metadata, and optionally _previous
 * @returns {DataValue} A DataValue object containing the collection, id (if provided), item, and optionally metadata and previous values
 */
function createDataValue ({
  collection = '',
  id,
  value
} = {}) {
  const result = {
    collection,
    isEmpty: true,
    isExpandEmpty: true
  }

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

      result.isEmpty = false
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
