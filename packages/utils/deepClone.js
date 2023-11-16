/**
 * Primitive deep clone - because JS can't have nice things {@link https://jsbench.me/gvlp19oy0u/1}
 * @param {Object|Array} target - The deep clone of the original data
 * @param {Object|Array} source - The original data
 * @returns {Object|Array}
 */
function deepClone (target, source) {
  for (const prop in source) {
    if (Object.hasOwn(source, prop)) {
      const nextSource = source[prop]

      if (Array.isArray(nextSource)) {
        target[prop] = deepClone([], nextSource)
      } else if (nextSource.constructor === Object) {
        target[prop] = deepClone({}, nextSource)
      } else {
        // update value
        target[prop] = nextSource
      }
    }
  }

  return target
}

export default deepClone
