/**
 * Represents metadata associated with a data entity
 * @typedef {Object} DataMetadata
 * @property {number} createdAt - Timestamp indicating when the data was initially created (Unix timestamp in milliseconds)
 * @property {number} updatedAt - Timestamp of the most recent update to the data (Unix timestamp in milliseconds)
 * @property {number} [userId] - Unique identifier of the user who created or last modified the data
 */

/**
 * @template Data
 * @typedef {Object} DataValue
 * @property {string} [id]
 * @property {string} collection
 * @property {boolean} [isEmpty]
 * @property {boolean} [isExpandEmpty]
 * @property {DataValue<Data>[]} [expand]
 * @property {Object.<string, (boolean|number)>} [expandIncluded]
 * @property {boolean} [isAffixEmpty]
 * @property {boolean} [isValid]
 * @property {Object.<string, DataTarget<Data>> & DataTarget<Data>} [target]
 * @property {Data} [item]
 * @property {Data} [previous]
 * @property {DataMetadata} [metadata]
 */

/**
 * @template Data
 * @typedef {Object} DataTarget
 * @property {Data} _item
 * @property {DataMetadata} _metadata
 * @property {DataPreviousTarget} [_previous]
 */

/**
 * @typedef {Object} DataPreviousTarget
 * @property {*} _item
 * @property {DataMetadata} _metadata
 */

/**
 * Data result
 * @template Data
 * @param {Object} param
 * @param {string} [param.collection='']
 * @param {string} [param.id]
 * @param {Data} [param.value]
 * @returns {DataValue<Data>}
 */
function createDataValue ({
  collection = '',
  id,
  value
} = {}) {
  const result = { collection }

  if (typeof id === 'string') {
    result.id = id
  }

  if (value) {
    if (value._item != null) {
      result.item = value._item

      if (value._metadata) {
        result.metadata = value._metadata
      }

      if (value._previous) {
        result.previous = value._previous
      }
    } else {
      result.item = value
    }
  }

  return result
}

/**
 * Id without affixes
 * @param {string} id - The id without affixes
 * @returns {string}
 */
function removeAffix (id) {
  if (!id) {
    return ''
  }

  const splitString = id.split('_', 3)
  let noAffixId = ''

  if (splitString.length === 3) {
    noAffixId = '_' + splitString[1] + '_'
  } else {
    noAffixId = id
  }

  return noAffixId
}

export {
  createDataValue,
  removeAffix
}
