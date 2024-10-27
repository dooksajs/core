/**
 * Primitive deep clone - because JS can't have nice things {@link https://jsbench.me/gvlp19oy0u/1}
 * @param {Object|Array} target - The deep clone of the original data
 * @param {Object|Array} source - The original data
 * @param {boolean} [freeze] - Freeze object
 * @returns {Object|Array}
 */
function deepClone (target, source, freeze) {
  if (typeof source === 'object') {
    for (const prop in source) {
      if (Object.hasOwnProperty.call(source, prop)) {
        const nextSource = source[prop]

        if (typeof nextSource === 'object') {
          if (Array.isArray(nextSource)) {
            target[prop] = deepClone([], nextSource)
          } else {
            target[prop] = deepClone({}, nextSource)
          }
        } else {
          target[prop] = nextSource
        }
      }
    }
  } else {
    target = source
  }

  if (freeze && typeof target === 'object') {
    Object.freeze(target)
  }

  return target
}


export default deepClone
