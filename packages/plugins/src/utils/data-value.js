import { deepClone } from '@dooksa/utils'

/**
 * @typedef {Object} DataMetadata
 * @property {number} createdAt
 * @property {number} updatedAt
 * @property {number} userId
 */

/**
 * @typedef {Object} DataValue
 * @property {string} id
 * @property {string} collection
 * @property {boolean} isEmpty
 * @property {boolean} isExpandEmpty
 * @property {DataValue[]} [expand]
 * @property {Object.<string, (boolean|number)>} [expandIncluded]
 * @property {boolean} isAffixEmpty
 * @property {boolean} [isValid]
 * @property {*} [target]
 * @property {*} [item]
 * @property {*} [previous]
 * @property {DataMetadata} [metadata]
 */

/**
 * Data result
 * @param {Object} param
 * @param {string} [param.collection='']
 * @param {string} [param.id='']
 * @param {*} [param.data]
 * @returns {DataValue}
 */
function createDataValue ({
  collection = '',
  id = '',
  data
} = {}) {
  const value = {
    id,
    collection,
    isEmpty: true,
    isExpandEmpty: true,
    isAffixEmpty: true
  }

  if (data) {
    value.isEmpty = false
    value.item = data
  }

  return value
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

  const splitString = id.split('_')
  let noAffixId = ''

  if (splitString.length === 3) {
    noAffixId = '_' + splitString[1] + '_'
  } else {
    noAffixId = id
  }

  return noAffixId
}


/**
 * Deep copy result data
 * @returns {DataValue}
 */
function cloneDataValue (data) {
  if (Array.isArray(data)) {
    return deepClone([], data)
  }

  if (typeof data === 'object' && data !== null) {
    return deepClone({}, data)
  }

  return data
}

export {
  createDataValue,
  cloneDataValue,
  removeAffix
}
