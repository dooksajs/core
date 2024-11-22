/**
 * Get result value
 * @param {*} value
 * @param {string|string[]} [query] - Request to return a specific key value, dot notations are permitted
 * @example
 * getValue({
 *  a: {
 *      b: 'c'
 *    }
 *  }, 'a.b')
 * // Expected output: 'c'
 */
function getValue (value, query) {
  if (query == null) {
    return value
  }

  if (Array.isArray(query)) {
    const result = []

    // get value by array
    for (let i = 0; i < query.length; i++) {
      result.push(getValueByString(value, query[i]))
    }

    return result
  }

  return getValueByString(value, query)
}

/**
 * Get value by string
 * @private
 * @param {*} value
 * @param {string} query - Request to return a specific key value, dot notations are permitted
 */
function getValueByString (value, query) {
  const keys = query.split('.')
  let result = value

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]

    // prevent access to "nullish" types
    if (result == null) {
      return
    }

    result = result[key]
  }

  return result
}

export default getValue
