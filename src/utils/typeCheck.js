import checkTypeError from './checkTypeError.js'

/**
 * TypeCheck traverses data to check if it does not contain invalid data
 * @param {string} namespace - The parent location of the data
 * @param {any} data - Data that is used to check if it is not null or undefined
 * @param {string} keys - The keys of the data
 * @param {string} currentKey - Current key used to access the test value
 * @param {number} depth - The current depth
 * @param {number} maxDepth - How deep we'll explore
 */
function typeCheck (namespace, data, keys = '', currentKey = '', root, depth = 0, maxDepth = 20) {
  try {
    let currentKeys = ''

    checkTypeError(namespace, data, keys, currentKeys, currentKey)

    if (depth === maxDepth) {
      throw Error(`Type checker reached maximum depth of ${maxDepth}`)
    }

    if (typeof data === 'object') {
      let prefix = '.'
      let suffix = ''

      if (Array.isArray(data)) {
        prefix = '['
        suffix = ']'
      }

      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          const item = data[key]
          const newKey = prefix + key + suffix

          if (depth === maxDepth) {
            throw Error(`Type checker reached maximum depth of ${maxDepth}`)
          }

          checkTypeError(namespace, item, keys, currentKeys, key, prefix, suffix)

          currentKeys += newKey
          keys += newKey

          // check if item is not a reference of parent and root
          if (typeof item === 'object' &&
          !Object.is(item, data) &&
          !Object.is(item, root)) {
            typeCheck(namespace, item, keys, key, data, ++depth)
          }
        }
      }
    }
  } catch (error) {
    console.error(error)
  }
}

export default typeCheck
