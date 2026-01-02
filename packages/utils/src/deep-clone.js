/**
 * Simple deep clone - because JS can't have nice things {@link https://jsbench.me/gvlp19oy0u/2}
 * @template T
 * @param {T} data - Input data
 * @param {boolean} [freeze] - Deep freeze the cloned data
 * @returns {T}
 */
function deepClone (data, freeze) {
  if (typeof data !== 'object' || data === null) {
    return data
  }

  let temp

  if (Array.isArray(data)) {
    temp = new Array(data.length)

    for (let i = 0; i < data.length; i++) {
      temp[i] = deepClone(data[i], freeze)
    }

    if (freeze) {
      // @ts-ignore
      return Object.freeze(temp)
    }
    // @ts-ignore
    return temp
  }

  let key

  if (data.constructor === Object) {
    temp = new Object()

    for (key in data) {
      if (data.hasOwnProperty(key)) {
        if (key === '__proto__') {
          // Skip __proto__ to prevent prototype pollution
          continue
        } else {
          temp[key] = deepClone(data[key], freeze)
        }
      }
    }

    if (freeze) {
      // @ts-ignore
      return Object.freeze(temp)
    }
    // @ts-ignore
    return temp
  }

  const dataType = Object.prototype.toString.call(data)

  if (dataType === '[object Object]' && typeof data.constructor === 'function') {
    // @ts-ignore
    temp = new data.constructor()

    for (key in data) {
      if (data.hasOwnProperty(key) && key !== '__proto__') {
        temp[key] = deepClone(data[key], freeze)
      }
    }

    if (freeze) {
      // @ts-ignore
      return Object.freeze(temp)
    }
    // @ts-ignore
    return temp
  }

  if (dataType === '[object Date]') {
    // @ts-ignore
    return new Date(+data)
  }

  if (dataType === '[object RegExp]') {
    // @ts-ignore
    temp = new RegExp(data.source, data.flags)
    // @ts-ignore
    temp.lastIndex = data.lastIndex
    // @ts-ignore
    return temp
  }

  return data
}

export default deepClone
