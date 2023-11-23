import checksum from '@dooksa/crypto-hash'

const TYPES = {
  Object,
  Array,
  Number,
  Boolean,
  String
}

/**
 * Create xxhash hash from object
 * @param {Object} source - The original object used to create the hash
 * @returns {string} - xxhash 64 string
 */
function objectHash (source) {
  try {
    if (source == null) {
      throw new Error('Source is undefined')
    }

    const target = sortType(defaultType(source), source)

    return checksum(target)
  } catch (e) {
    console.error(e)
  }
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
    if (Object.hasOwn(source, prop)) {
      const nextSource = source[prop]

      if (Array.isArray(nextSource)) {
        target[prop] = sortType([], nextSource)
      } else if (nextSource.constructor === Object) {
        target[prop] = sortType({}, nextSource)
      } else {
        // update value
        target[prop] = nextSource
      }
    }
  }

  let sortedTarget = {}

  if (target.constructor === Object) {
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

function defaultType (value) {
  const name = value?.constructor.name

  return TYPES[name]()
}

export default objectHash
