/**
 * Sort object properties alphanumerically
 * @param {(Object|Array)} source - The original "object" used to create the hash
 * @returns {(Object|Array)} - xxhash 64 string
 */
function sortObject (source) {
  let target = {}

  if (Array.isArray(source)) {
    target = []
  } else if (source.constructor !== Object) {
    throw new Error('Unexpected type: ' + typeof source)
  }

  return sortType(target, source)
}

/**
 * Sort object properties alphanumerically
 * @private
 * @param {Object|Array} target - Target value
 * @param {Object|Array} source - Current value
 * @returns {Object|Array} sorted value
 */
function sortType (target, source) {
  for (const prop in source) {
    if (Object.hasOwnProperty.call(source, prop)) {
      const nextSource = source[prop]

      if (Array.isArray(nextSource)) {
        target[prop] = sortType([], nextSource)
      } else if (typeof nextSource === 'object' && nextSource !== null) {
        target[prop] = sortType({}, nextSource)
      } else {
        // update value
        target[prop] = nextSource
      }
    }
  }

  let sortedTarget = {}

  if (typeof target === 'object' && target !== null) {
    const keys = Object.keys(target)

    keys.sort()

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]

      sortedTarget[key] = target[key]
    }
  } else {
    sortedTarget = target
  }

  return sortedTarget
}

export default sortObject
