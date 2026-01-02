/**
 * Sort object properties alphanumerically
 * @param {(Object|Array)} source - The original object or array to sort
 * @returns {(Object|Array)} - New object or array with sorted properties
 * @throws {Error} - If source is not an object or array
 */
function sortObject (source) {
  // Handle null and undefined
  if (source == null) {
    throw new Error('Unexpected type: ' + typeof source)
  }

  // Handle arrays
  if (Array.isArray(source)) {
    return sortArray(source)
  }

  // Handle plain objects
  // Check if it's a plain object by checking if it's an object and not a special type
  // We need to handle the case where the object has a constructor property that's not Object
  if (typeof source === 'object') {
    // Check if it's a plain object by looking at the prototype chain
    // An object is plain if its prototype is Object.prototype
    if (Object.getPrototypeOf(source) === Object.prototype) {
      return sortObjectProperties(source)
    }
  }

  // Handle other object types (Date, RegExp, custom classes, etc.)
  // These should be treated as values, not sorted
  if (typeof source === 'object') {
    throw new Error('Unexpected type: ' + typeof source)
  }

  // Handle primitives
  throw new Error('Unexpected type: ' + typeof source)
}

/**
 * Sort array elements (recursively sort nested objects)
 * @private
 * @param {Array} array - Array to process
 * @returns {Array} - New array with sorted nested objects
 */
function sortArray (array) {
  const result = []

  for (let i = 0; i < array.length; i++) {
    const item = array[i]

    if (Array.isArray(item)) {
      result[i] = sortArray(item)
    } else if (item != null && typeof item === 'object') {
      // Check if it's a plain object
      if (Object.getPrototypeOf(item) === Object.prototype) {
        result[i] = sortObjectProperties(item)
      } else {
        // Preserve special objects (Date, RegExp, etc.) as-is
        result[i] = item
      }
    } else {
      result[i] = item
    }
  }

  return result
}

/**
 * Sort object properties alphanumerically
 * @private
 * @param {Object} obj - Object to sort
 * @returns {Object} - New object with sorted properties
 */
function sortObjectProperties (obj) {
  const result = {}

  // Get both string keys and symbol keys
  const keys = Object.keys(obj)
  const symbolKeys = Object.getOwnPropertySymbols(obj)

  keys.sort()

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    const value = obj[key]

    // Skip __proto__ for security (prevent prototype pollution)
    if (key === '__proto__') {
      continue
    }

    if (Array.isArray(value)) {
      result[key] = sortArray(value)
    } else if (value != null && typeof value === 'object') {
      // Check if it's a plain object
      if (Object.getPrototypeOf(value) === Object.prototype) {
        result[key] = sortObjectProperties(value)
      } else {
        // Preserve special objects (Date, RegExp, etc.) as-is
        result[key] = value
      }
    } else {
      result[key] = value
    }
  }

  // Add symbol keys as-is (they can't be sorted)
  for (let i = 0; i < symbolKeys.length; i++) {
    const key = symbolKeys[i]
    result[key] = obj[key]
  }

  return result
}

export default sortObject
