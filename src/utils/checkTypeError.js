/**
 * Throw error if data is undefined or null
 * @param {string} namespace - The parent location of the data
 * @param {string} path - Location of the data
 * @param {any} data - Data that is used to check if it is not null or undefined
 * @param {string} keys - Full path to the current value
 * @param {string} currentKeys - Currently processed keys the same scope of the value
 * @param {string} key - Current key used to access the test value
 * @param {string} prefix - The first string that sets the value type e.g. "." for dot notation
 * @param {string} suffix - The last string that sets the value type e.g. "]" to close an array
 * @returns {Error}
 */
function checkTypeError (namespace, data, keys, currentKeys, key, prefix = '', suffix = '') {
  if (data === undefined || data === null) {
    const path = keys.substring(0, keys.length - currentKeys.length) + prefix + key + suffix

    throw Error(`${namespace}: "${path}" contains ${data}`)
  }
}

export default checkTypeError
