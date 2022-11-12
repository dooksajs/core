import checkTypeError from './checkTypeError'

/**
 * TypeCheck traverses data to check if it does not contain invalid data
 * @param {string} namespace - The parent location of the data
 * @param {any} data - Data that is used to check if it is not null or undefined
 * @param {string} keys - The keys of the data
 */
export default function typeCheck (namespace, data, keys = '', currentKey = '') {
  try {
    let currentKeys = ''

    checkTypeError(namespace, data, keys, currentKeys, currentKey)

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

          checkTypeError(namespace, item, keys, currentKeys, key, prefix, suffix)

          currentKeys += newKey
          keys += newKey

          if (typeof item === 'object') {
            typeCheck(namespace, item, keys, key)
          }
        }
      }
    }
  } catch (error) {
    console.error(error)
  }
}
