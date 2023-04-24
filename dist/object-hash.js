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
  process(n) {
    try {
      const t = {};
      this._sortType(t, n);
      const e = new TextEncoder(), r = JSON.stringify(t), o = e.encode(r);
      return this._adler(o);
    } catch (t) {
      console.error(t);
    }
  },
  _defaultType(n) {
    const t = n.constructor.name;
    return i[t]();
  },
  _adler(n) {
    let e = 1, r = 0;
    n = new Uint8Array(n);
    for (let o = 0; o < n.length; o++)
      e += n[o], r += e;
    return e %= 65521, r %= 65521, this._hex((r << 16 | e) >>> 0, 8);
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
  _ord(n) {
    if (n.length === 2) {
      const t = n.charCodeAt(0), e = n.charCodeAt(1);
      if (t >= 55296 && t < 56320 && e >= 56320 && e < 57344)
        return (t - 55296) * 1024 + e - 56320 + 65536;
    }
    return n.charCodeAt(0);
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
  _hex(n, t = 2) {
    return n = typeof n == "string" ? this._ord(n) : n, n.toString(16).padStart(t, "0");
  },
  /**
   * Sort source by data type
   * @private
   * @param {Object} target - Alphanumerically sorted object
   * @param {*} source - Current value
   * @returns
   */
  _sortType(n, t) {
    if (this._nullish(t))
      throw new Error("objectHash: value cannot be undefined");
    return Array.isArray(t) ? t = this._array(n, t) : typeof t == "object" ? t = this._object(n, t) : typeof t == "function" && (t = t.toString()), t;
  },
  /**
   * Check if value is undefined or null
   * @private
   * @param {*} value - Any value
   * @returns {boolean}
   */
  _nullish(n) {
    return n == null;
  },
  /**
   * Sort array alphanumerically
   * @param {Object} target - Alphanumerically sorted object
   * @param {Array} source - Current nested array
   * @returns {Array}
   */
  _array(n, t) {
    t = t.splice(0), t.sort();
    for (let e = 0; e < t.length; e++) {
      const r = t[e];
      t[e] = this._sortType(n, r);
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
  _object(n, t) {
    const e = Object.keys(t);
    e.sort();
    for (let r = 0; r < e.length; r++) {
      const o = e[r];
      n[o] = this._defaultType(t[o]), n[o] = this._sortType(n[o], t[o]);
    }
    return n;
  }
};
export {
  s as default
};
//# sourceMappingURL=object-hash.js.map
