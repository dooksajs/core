import md5 from 'crypto-js/md5'
import Base64 from 'crypto-js/enc-base64'

const objectHash = {
  process (source) {
    try {
      const target = {}

      this._sortType(target, source)

      return Base64.stringify((md5(JSON.stringify(target))))
    } catch (e) {
      console.error(e)
    }
  },
  _sortType (target, source) {
    if (this._nullish(source)) {
      throw new Error('objectHash: value cannot be undefined')
    }

    if (Array.isArray(source)) {
      source = this._array(target, source)
    } else if (typeof source === 'object') {
      source = this._object(target, source)
    } else if (typeof source === 'function') {
      source = source.toString()
    }

    return source
  },
  /**
     * Check if value is undefined or null
     * @private
     * @param {*} value - Any value
     * @returns {boolean}
     */
  _nullish (value) {
    return (value === undefined || value === null)
  },
  _array (target, source) {
    // make a copy
    source = source.splice()
    // sort
    source.sort()

    for (let i = 0; i < source.length; i++) {
      const value = source[i]

      source[i] = this._sortType(target, value)
    }

    return source
  },
  _object (target, source) {
    const keys = Object.keys(source)

    keys.sort()

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      target[key] = {}
      target[key] = this._sortType(target[key], source[key])
    }

    return target
  }
}

export default objectHash
