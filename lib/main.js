const TYPES = {
  Object,
  Array,
  Number,
  Boolean,
  String
}

/** @module objectHash */
const objectHash = {
  /**
   * Create Adler 32 hex string from object
   * @param {Object} source - The original object used to create the hash
   * @returns {string} - Adler 32 hex string
   */
  process (source) {
    try {
      const target = {}

      this._sortType(target, source)

      const encoder = new TextEncoder()
      const string = JSON.stringify(target)
      const buffer = encoder.encode(string)

      return this._adler(buffer)
    } catch (e) {
      console.error(e)
    }
  },
  _defaultType (value) {
    const name = value.constructor.name

    return TYPES[name]()
  },
  _adler (value) {
    const MOD_ADLER = 65521
    let a = 1
    let b = 0
    value = new Uint8Array(value)

    for (let i = 0; i < value.length; i++) {
      a += value[i]
      b += a
    }

    a %= MOD_ADLER
    b %= MOD_ADLER

    return this._hex(((b << 16) | a) >>> 0, 8)
  },
  /**
   * Translates a character into an ordinal.
   *
   * @param {char} c
   * @returns {number}
   *
   * @example
   * // returns 97
   * this._.ord('a');
   */
  _ord (c) {
    // Detect astral symbols
    // Thanks to @mathiasbynens for this solution
    // https://mathiasbynens.be/notes/javascript-unicode
    if (c.length === 2) {
      const high = c.charCodeAt(0)
      const low = c.charCodeAt(1)

      if (high >= 0xd800 && high < 0xdc00 &&
          low >= 0xdc00 && low < 0xe000) {
        return (high - 0xd800) * 0x400 + low - 0xdc00 + 0x10000
      }
    }

    return c.charCodeAt(0)
  },
  /**
   * Converts a character or number to its hex representation.
   *
   * @param {char|number} c
   * @param {number} [length=2] - The width of the resulting hex number.
   * @returns {string}
   *
   * @example
   * // returns "6e"
   * this._hex("n")
   *
   * // returns "6e"
   * this._hex(110)
   */
  _hex (c, length = 2) {
    c = typeof c === 'string' ? this._ord(c) : c
    return c.toString(16).padStart(length, '0')
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
    source = source.slice()
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

      target[key] = this._defaultType(source[key])
      target[key] = this._sortType(target[key], source[key])
    }

    return target
  }
}

export default objectHash
