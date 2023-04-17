import md5 from 'crypto-js/md5'
import Base64 from 'crypto-js/enc-base64'

/** @module objectHash */

const objectHash = {
  /**
   * Create MD5 base64 string from object
   * @param {Object} source - The original object used to create the hash
   * @returns {string} - MD5 base64 string
   */
  process (source) {
    try {
      const target = {}

      this._sortType(target, source)

      return Base64.stringify((md5(JSON.stringify(target))))
    } catch (e) {
      console.error(e)
    }
  },
  /**
   * Sort source by data type
   * @private
   * @param {Object} target - Alphanumerically sorted object
   * @param {*} source - Current value
   * @returns
   */
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
  /**
   * Sort array alphanumerically
   * @param {Object} target - Alphanumerically sorted object
   * @param {Array} source - Current nested array
   * @returns {Array}
   */
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
  /**
   * Sort object keys alphanumerically
   * @private
   * @param {Object} target - Alphanumerically sorted object
   * @param {Object} source - Current nested object
   * @returns {Object}
   */
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
