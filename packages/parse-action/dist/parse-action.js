const A = {
  Object,
  Array,
  Number,
  Boolean,
  String
}, g = {
  /**
   * Create Adler 32 hex string from object
   * @param {Object} source - The original object used to create the hash
   * @returns {string} - Adler 32 hex string
   */
  process(e) {
    try {
      if (!e)
        throw new Error("source is undefined");
      const t = {};
      this._sortType(t, e);
      const n = new TextEncoder(), r = JSON.stringify(t), s = n.encode(r);
      return this._adler(s);
    } catch (t) {
      console.error(t);
    }
  },
  _defaultType(e) {
    const t = e == null ? void 0 : e.constructor.name;
    return A[t]();
  },
  _adler(e) {
    let t = 1, n = 0;
    e = new Uint8Array(e);
    for (let r = 0; r < e.length; r++)
      t += e[r], n += t;
    return t %= 65521, n %= 65521, this._hex((n << 16 | t) >>> 0, 8);
  },
  /**
   * Translates a character into an ordinal.
   *
   * @param {char} c
   * @returns {number}
   *
   * @example
   * // returns 97
   * this._ord('a');
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
    if (t == null)
      throw new Error("objectHash: value cannot be undefined");
    return Array.isArray(t) ? t = this._array(e, t) : typeof t == "object" ? t = this._object(e, t) : typeof t == "function" && (t = t.toString()), t;
  },
  /**
   * Traverse arrays values
   * @param {Object} target - Alphanumerically sorted object
   * @param {Array} source - Current nested array
   * @returns {Array}
   */
  _array(e, t) {
    t = t.slice();
    for (let n = 0; n < t.length; n++) {
      const r = t[n];
      e = this._defaultType(r), t[n] = this._sortType(e, r);
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
      const s = n[r];
      e[s] = this._defaultType(t[s]), e[s] = this._sortType(e[s], t[s]);
    }
    return e;
  }
}, b = (e) => {
  const t = _({ source: e }).actions, n = {}, r = [];
  let s = [], c = t[0].path.length;
  for (let i = 0; i < t.length; i++) {
    const o = t[i], p = g.process(o.source), u = {
      path: o.path,
      id: p
    };
    let f = e;
    if (c !== o.path.length) {
      for (let h = 0; h < s.length; h++) {
        const y = t[s[h]];
        for (let l = 0; l < o.path.length; l++)
          if (o.path[l] !== y.path[l]) {
            s.splice(h, 1);
            break;
          }
      }
      s.length && (u.children = s.slice(), s = []);
    }
    const d = o.path.length - 1;
    for (let h = 0; h < d; h++) {
      const y = o.path[h];
      f = f[y];
    }
    s.push(i), c = o.path.length, d > -1 && (f[o.path[d]] = {
      _$id: p
    }), r.push(u), n[p] = o.source;
  }
  const a = g.process(r);
  return { items: n, sequence: r, sequenceId: a };
}, _ = ({
  source: e,
  node: t = { path: [] },
  actions: n = [],
  lastNode: r = 0
}) => {
  e.dsAction && (e._$a = e.dsAction, delete e.dsAction, e.dsParams && (e._$p = e.dsParams, delete e.dsParams), n.unshift({
    path: t.path.slice(),
    source: e
  }));
  const s = Object.keys(e);
  for (let c = 0; c < s.length; c++) {
    const a = s[c], i = e[a];
    if (s.length > 1 && (r = t.path.length), typeof i == "object") {
      t.path.push(a);
      const o = _({
        source: i,
        node: t,
        actions: n,
        lastNode: r
      });
      t.path = o.node.path.slice(0, r);
    }
  }
  return { actions: n, node: t };
};
export {
  b as default
};
//# sourceMappingURL=parse-action.js.map
