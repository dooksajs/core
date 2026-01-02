/**
 * Shallow copy
 * @template T
 * @param {T} data - Input data
 * @param {boolean} [freeze] - Freeze the shallow cloned data
 * @returns {T}
 */
function shallowCopy (data, freeze) {
  if (typeof data !== 'object' || data === null) {
    return data
  }

  let temp

  if (Array.isArray(data)) {
    temp = new Array(data.length)

    for (let i = 0; i < data.length; i++) {
      temp[i] = data[i]
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
      if (data.hasOwnProperty(key) && key !== '__proto__') {
        temp[key] = data[key]
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
        temp[key] = data[key]
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
    temp = new Date(+data)
    if (freeze) {
      // @ts-ignore
      return Object.freeze(temp)
    }
    // @ts-ignore
    return temp
  }

  if (dataType === '[object RegExp]') {
    // @ts-ignore
    temp = new RegExp(data.source, data.flags)
    // @ts-ignore
    temp.lastIndex = data.lastIndex
    if (freeze) {
      // @ts-ignore
      return Object.freeze(temp)
    }
    // @ts-ignore
    return temp
  }

  // Handle Error objects and other special objects
  if (
    dataType === '[object Error]' ||
    (dataType === '[object Object]' && typeof data.constructor === 'function' && data.constructor !== Object)
  ) {
    // @ts-ignore
    temp = new data.constructor(data.message)

    // Copy enumerable properties
    for (key in data) {
      if (data.hasOwnProperty(key) && key !== '__proto__' && key !== 'message') {
        temp[key] = data[key]
      }
    }

    if (freeze) {
      // @ts-ignore
      return Object.freeze(temp)
    }
    // @ts-ignore
    return temp
  }

  return data
}

export default shallowCopy
