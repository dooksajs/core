const i = {
  Object,
  Array,
  Number,
  Boolean,
  String
}, s = {
  /**
   * Create Adler 32 hex string from object
   * @param {Object} source - The original object used to create the hash
   * @returns {string} - Adler 32 hex string
   */
  process(e) {
    try {
      const t = {};
      this._sortType(t, e);
      const n = new TextEncoder(), r = JSON.stringify(t), o = n.encode(r);
      return this._adler(o);
    } catch (t) {
      console.error(t);
    }
  },
  _defaultType(e) {
    const t = e.constructor.name;
    return i[t]();
  },
  _adler(e) {
    let n = 1, r = 0;
    e = new Uint8Array(e);
    for (let o = 0; o < e.length; o++)
      n += e[o], r += n;
    return n %= 65521, r %= 65521, this._hex((r << 16 | n) >>> 0, 8);
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
  _ord(e) {
    if (e.length === 2) {
      const t = e.charCodeAt(0), n = e.charCodeAt(1);
      if (t >= 55296 && t < 56320 && n >= 56320 && n < 57344)
        return (t - 55296) * 1024 + n - 56320 + 65536;
    }
    return e.charCodeAt(0);
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
  _hex(e, t = 2) {
    return e = typeof e == "string" ? this._ord(e) : e, e.toString(16).padStart(t, "0");
  },
  /**
   * Sort source by data type
   * @private
   * @param {Object} target - Alphanumerically sorted object
   * @param {*} source - Current value
   * @returns
   */
  _sortType(e, t) {
    if (this._nullish(t))
      throw new Error("objectHash: value cannot be undefined");
    return Array.isArray(t) ? t = this._array(e, t) : typeof t == "object" ? t = this._object(e, t) : typeof t == "function" && (t = t.toString()), t;
  },
  /**
   * Check if value is undefined or null
   * @private
   * @param {*} value - Any value
   * @returns {boolean}
   */
  _nullish(e) {
    return e == null;
  },
  /**
   * Sort array alphanumerically
   * @param {Object} target - Alphanumerically sorted object
   * @param {Array} source - Current nested array
   * @returns {Array}
   */
  _array(e, t) {
    t = t.slice();
    for (let n = 0; n < t.length; n++) {
      const r = t[n];
      t[n] = this._sortType(e, r);
    }
    return t;
  },
  /**
   * Sort object keys alphanumerically
   * @private
   * @param {Object} target - Alphanumerically sorted object
   * @param {Object} source - Current nested object
   * @returns {Object}
   */
  _object(e, t) {
    const n = Object.keys(t);
    n.sort();
    for (let r = 0; r < n.length; r++) {
      const o = n[r];
      e[o] = this._defaultType(t[o]), e[o] = this._sortType(e[o], t[o]);
    }
    return e;
  }
};
export {
  s as default
};
//# sourceMappingURL=object-hash.js.map
