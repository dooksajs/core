/**
 * Get result value
 * @param {*} value
 * @param {string|string[]} [query] - Request to return a specific key value, dot notations are permitted
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

function getValueByString (value, query) {
  const keys = query.split('.')
  let result = value

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]

    if (result == null) {
      return
    }

    result = result[key]

  }

  return result
}

export default getValue
