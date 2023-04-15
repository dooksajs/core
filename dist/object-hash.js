var z = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function J(h) {
  if (h.__esModule)
    return h;
  var d = h.default;
  if (typeof d == "function") {
    var g = function _() {
      if (this instanceof _) {
        var B = [null];
        B.push.apply(B, arguments);
        var m = Function.bind.apply(d, B);
        return new m();
      }
      return d.apply(this, arguments);
    };
    g.prototype = d.prototype;
  } else
    g = {};
  return Object.defineProperty(g, "__esModule", { value: !0 }), Object.keys(h).forEach(function(_) {
    var B = Object.getOwnPropertyDescriptor(h, _);
    Object.defineProperty(g, _, B.get ? B : {
      enumerable: !0,
      get: function() {
        return h[_];
      }
    });
  }), g;
}
var U = {}, K = {
  get exports() {
    return U;
  },
  set exports(h) {
    U = h;
  }
};
function Q(h) {
  throw new Error('Could not dynamically require "' + h + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
}
var M = {}, X = {
  get exports() {
    return M;
  },
  set exports(h) {
    M = h;
  }
};
const Y = {}, Z = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Y
}, Symbol.toStringTag, { value: "Module" })), rr = /* @__PURE__ */ J(Z);
var G;
function V() {
  return G || (G = 1, function(h, d) {
    (function(g, _) {
      h.exports = _();
    })(z, function() {
      var g = g || function(_, B) {
        var m;
        if (typeof window < "u" && window.crypto && (m = window.crypto), typeof self < "u" && self.crypto && (m = self.crypto), typeof globalThis < "u" && globalThis.crypto && (m = globalThis.crypto), !m && typeof window < "u" && window.msCrypto && (m = window.msCrypto), !m && typeof z < "u" && z.crypto && (m = z.crypto), !m && typeof Q == "function")
          try {
            m = rr;
          } catch {
          }
        var W = function() {
          if (m) {
            if (typeof m.getRandomValues == "function")
              try {
                return m.getRandomValues(new Uint32Array(1))[0];
              } catch {
              }
            if (typeof m.randomBytes == "function")
              try {
                return m.randomBytes(4).readInt32LE();
              } catch {
              }
          }
          throw new Error("Native crypto module could not be used to get secure random number.");
        }, O = Object.create || function() {
          function r() {
          }
          return function(i) {
            var s;
            return r.prototype = i, s = new r(), r.prototype = null, s;
          };
        }(), S = {}, a = S.lib = {}, b = a.Base = function() {
          return {
            /**
             * Creates a new object that inherits from this object.
             *
             * @param {Object} overrides Properties to copy into the new object.
             *
             * @return {Object} The new object.
             *
             * @static
             *
             * @example
             *
             *     var MyType = CryptoJS.lib.Base.extend({
             *         field: 'value',
             *
             *         method: function () {
             *         }
             *     });
             */
            extend: function(r) {
              var i = O(this);
              return r && i.mixIn(r), (!i.hasOwnProperty("init") || this.init === i.init) && (i.init = function() {
                i.$super.init.apply(this, arguments);
              }), i.init.prototype = i, i.$super = this, i;
            },
            /**
             * Extends this object and runs the init method.
             * Arguments to create() will be passed to init().
             *
             * @return {Object} The new object.
             *
             * @static
             *
             * @example
             *
             *     var instance = MyType.create();
             */
            create: function() {
              var r = this.extend();
              return r.init.apply(r, arguments), r;
            },
            /**
             * Initializes a newly created object.
             * Override this method to add some logic when your objects are created.
             *
             * @example
             *
             *     var MyType = CryptoJS.lib.Base.extend({
             *         init: function () {
             *             // ...
             *         }
             *     });
             */
            init: function() {
            },
            /**
             * Copies properties into this object.
             *
             * @param {Object} properties The properties to mix in.
             *
             * @example
             *
             *     MyType.mixIn({
             *         field: 'value'
             *     });
             */
            mixIn: function(r) {
              for (var i in r)
                r.hasOwnProperty(i) && (this[i] = r[i]);
              r.hasOwnProperty("toString") && (this.toString = r.toString);
            },
            /**
             * Creates a copy of this object.
             *
             * @return {Object} The clone.
             *
             * @example
             *
             *     var clone = instance.clone();
             */
            clone: function() {
              return this.init.prototype.extend(this);
            }
          };
        }(), y = a.WordArray = b.extend({
          /**
           * Initializes a newly created word array.
           *
           * @param {Array} words (Optional) An array of 32-bit words.
           * @param {number} sigBytes (Optional) The number of significant bytes in the words.
           *
           * @example
           *
           *     var wordArray = CryptoJS.lib.WordArray.create();
           *     var wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607]);
           *     var wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607], 6);
           */
          init: function(r, i) {
            r = this.words = r || [], i != B ? this.sigBytes = i : this.sigBytes = r.length * 4;
          },
          /**
           * Converts this word array to a string.
           *
           * @param {Encoder} encoder (Optional) The encoding strategy to use. Default: CryptoJS.enc.Hex
           *
           * @return {string} The stringified word array.
           *
           * @example
           *
           *     var string = wordArray + '';
           *     var string = wordArray.toString();
           *     var string = wordArray.toString(CryptoJS.enc.Utf8);
           */
          toString: function(r) {
            return (r || l).stringify(this);
          },
          /**
           * Concatenates a word array to this word array.
           *
           * @param {WordArray} wordArray The word array to append.
           *
           * @return {WordArray} This word array.
           *
           * @example
           *
           *     wordArray1.concat(wordArray2);
           */
          concat: function(r) {
            var i = this.words, s = r.words, u = this.sigBytes, v = r.sigBytes;
            if (this.clamp(), u % 4)
              for (var w = 0; w < v; w++) {
                var T = s[w >>> 2] >>> 24 - w % 4 * 8 & 255;
                i[u + w >>> 2] |= T << 24 - (u + w) % 4 * 8;
              }
            else
              for (var H = 0; H < v; H += 4)
                i[u + H >>> 2] = s[H >>> 2];
            return this.sigBytes += v, this;
          },
          /**
           * Removes insignificant bits.
           *
           * @example
           *
           *     wordArray.clamp();
           */
          clamp: function() {
            var r = this.words, i = this.sigBytes;
            r[i >>> 2] &= 4294967295 << 32 - i % 4 * 8, r.length = _.ceil(i / 4);
          },
          /**
           * Creates a copy of this word array.
           *
           * @return {WordArray} The clone.
           *
           * @example
           *
           *     var clone = wordArray.clone();
           */
          clone: function() {
            var r = b.clone.call(this);
            return r.words = this.words.slice(0), r;
          },
          /**
           * Creates a word array filled with random bytes.
           *
           * @param {number} nBytes The number of random bytes to generate.
           *
           * @return {WordArray} The random word array.
           *
           * @static
           *
           * @example
           *
           *     var wordArray = CryptoJS.lib.WordArray.random(16);
           */
          random: function(r) {
            for (var i = [], s = 0; s < r; s += 4)
              i.push(W());
            return new y.init(i, r);
          }
        }), p = S.enc = {}, l = p.Hex = {
          /**
           * Converts a word array to a hex string.
           *
           * @param {WordArray} wordArray The word array.
           *
           * @return {string} The hex string.
           *
           * @static
           *
           * @example
           *
           *     var hexString = CryptoJS.enc.Hex.stringify(wordArray);
           */
          stringify: function(r) {
            for (var i = r.words, s = r.sigBytes, u = [], v = 0; v < s; v++) {
              var w = i[v >>> 2] >>> 24 - v % 4 * 8 & 255;
              u.push((w >>> 4).toString(16)), u.push((w & 15).toString(16));
            }
            return u.join("");
          },
          /**
           * Converts a hex string to a word array.
           *
           * @param {string} hexStr The hex string.
           *
           * @return {WordArray} The word array.
           *
           * @static
           *
           * @example
           *
           *     var wordArray = CryptoJS.enc.Hex.parse(hexString);
           */
          parse: function(r) {
            for (var i = r.length, s = [], u = 0; u < i; u += 2)
              s[u >>> 3] |= parseInt(r.substr(u, 2), 16) << 24 - u % 8 * 4;
            return new y.init(s, i / 2);
          }
        }, x = p.Latin1 = {
          /**
           * Converts a word array to a Latin1 string.
           *
           * @param {WordArray} wordArray The word array.
           *
           * @return {string} The Latin1 string.
           *
           * @static
           *
           * @example
           *
           *     var latin1String = CryptoJS.enc.Latin1.stringify(wordArray);
           */
          stringify: function(r) {
            for (var i = r.words, s = r.sigBytes, u = [], v = 0; v < s; v++) {
              var w = i[v >>> 2] >>> 24 - v % 4 * 8 & 255;
              u.push(String.fromCharCode(w));
            }
            return u.join("");
          },
          /**
           * Converts a Latin1 string to a word array.
           *
           * @param {string} latin1Str The Latin1 string.
           *
           * @return {WordArray} The word array.
           *
           * @static
           *
           * @example
           *
           *     var wordArray = CryptoJS.enc.Latin1.parse(latin1String);
           */
          parse: function(r) {
            for (var i = r.length, s = [], u = 0; u < i; u++)
              s[u >>> 2] |= (r.charCodeAt(u) & 255) << 24 - u % 4 * 8;
            return new y.init(s, i);
          }
        }, f = p.Utf8 = {
          /**
           * Converts a word array to a UTF-8 string.
           *
           * @param {WordArray} wordArray The word array.
           *
           * @return {string} The UTF-8 string.
           *
           * @static
           *
           * @example
           *
           *     var utf8String = CryptoJS.enc.Utf8.stringify(wordArray);
           */
          stringify: function(r) {
            try {
              return decodeURIComponent(escape(x.stringify(r)));
            } catch {
              throw new Error("Malformed UTF-8 data");
            }
          },
          /**
           * Converts a UTF-8 string to a word array.
           *
           * @param {string} utf8Str The UTF-8 string.
           *
           * @return {WordArray} The word array.
           *
           * @static
           *
           * @example
           *
           *     var wordArray = CryptoJS.enc.Utf8.parse(utf8String);
           */
          parse: function(r) {
            return x.parse(unescape(encodeURIComponent(r)));
          }
        }, c = a.BufferedBlockAlgorithm = b.extend({
          /**
           * Resets this block algorithm's data buffer to its initial state.
           *
           * @example
           *
           *     bufferedBlockAlgorithm.reset();
           */
          reset: function() {
            this._data = new y.init(), this._nDataBytes = 0;
          },
          /**
           * Adds new data to this block algorithm's buffer.
           *
           * @param {WordArray|string} data The data to append. Strings are converted to a WordArray using UTF-8.
           *
           * @example
           *
           *     bufferedBlockAlgorithm._append('data');
           *     bufferedBlockAlgorithm._append(wordArray);
           */
          _append: function(r) {
            typeof r == "string" && (r = f.parse(r)), this._data.concat(r), this._nDataBytes += r.sigBytes;
          },
          /**
           * Processes available data blocks.
           *
           * This method invokes _doProcessBlock(offset), which must be implemented by a concrete subtype.
           *
           * @param {boolean} doFlush Whether all blocks and partial blocks should be processed.
           *
           * @return {WordArray} The processed data.
           *
           * @example
           *
           *     var processedData = bufferedBlockAlgorithm._process();
           *     var processedData = bufferedBlockAlgorithm._process(!!'flush');
           */
          _process: function(r) {
            var i, s = this._data, u = s.words, v = s.sigBytes, w = this.blockSize, T = w * 4, H = v / T;
            r ? H = _.ceil(H) : H = _.max((H | 0) - this._minBufferSize, 0);
            var A = H * w, k = _.min(A * 4, v);
            if (A) {
              for (var R = 0; R < A; R += w)
                this._doProcessBlock(u, R);
              i = u.splice(0, A), s.sigBytes -= k;
            }
            return new y.init(i, k);
          },
          /**
           * Creates a copy of this object.
           *
           * @return {Object} The clone.
           *
           * @example
           *
           *     var clone = bufferedBlockAlgorithm.clone();
           */
          clone: function() {
            var r = b.clone.call(this);
            return r._data = this._data.clone(), r;
          },
          _minBufferSize: 0
        });
        a.Hasher = c.extend({
          /**
           * Configuration options.
           */
          cfg: b.extend(),
          /**
           * Initializes a newly created hasher.
           *
           * @param {Object} cfg (Optional) The configuration options to use for this hash computation.
           *
           * @example
           *
           *     var hasher = CryptoJS.algo.SHA256.create();
           */
          init: function(r) {
            this.cfg = this.cfg.extend(r), this.reset();
          },
          /**
           * Resets this hasher to its initial state.
           *
           * @example
           *
           *     hasher.reset();
           */
          reset: function() {
            c.reset.call(this), this._doReset();
          },
          /**
           * Updates this hasher with a message.
           *
           * @param {WordArray|string} messageUpdate The message to append.
           *
           * @return {Hasher} This hasher.
           *
           * @example
           *
           *     hasher.update('message');
           *     hasher.update(wordArray);
           */
          update: function(r) {
            return this._append(r), this._process(), this;
          },
          /**
           * Finalizes the hash computation.
           * Note that the finalize operation is effectively a destructive, read-once operation.
           *
           * @param {WordArray|string} messageUpdate (Optional) A final message update.
           *
           * @return {WordArray} The hash.
           *
           * @example
           *
           *     var hash = hasher.finalize();
           *     var hash = hasher.finalize('message');
           *     var hash = hasher.finalize(wordArray);
           */
          finalize: function(r) {
            r && this._append(r);
            var i = this._doFinalize();
            return i;
          },
          blockSize: 16,
          /**
           * Creates a shortcut function to a hasher's object interface.
           *
           * @param {Hasher} hasher The hasher to create a helper for.
           *
           * @return {Function} The shortcut function.
           *
           * @static
           *
           * @example
           *
           *     var SHA256 = CryptoJS.lib.Hasher._createHelper(CryptoJS.algo.SHA256);
           */
          _createHelper: function(r) {
            return function(i, s) {
              return new r.init(s).finalize(i);
            };
          },
          /**
           * Creates a shortcut function to the HMAC's object interface.
           *
           * @param {Hasher} hasher The hasher to use in this HMAC helper.
           *
           * @return {Function} The shortcut function.
           *
           * @static
           *
           * @example
           *
           *     var HmacSHA256 = CryptoJS.lib.Hasher._createHmacHelper(CryptoJS.algo.SHA256);
           */
          _createHmacHelper: function(r) {
            return function(i, s) {
              return new C.HMAC.init(r, s).finalize(i);
            };
          }
        });
        var C = S.algo = {};
        return S;
      }(Math);
      return g;
    });
  }(X)), M;
}
(function(h, d) {
  (function(g, _) {
    h.exports = _(V());
  })(z, function(g) {
    return function(_) {
      var B = g, m = B.lib, W = m.WordArray, O = m.Hasher, S = B.algo, a = [];
      (function() {
        for (var f = 0; f < 64; f++)
          a[f] = _.abs(_.sin(f + 1)) * 4294967296 | 0;
      })();
      var b = S.MD5 = O.extend({
        _doReset: function() {
          this._hash = new W.init([
            1732584193,
            4023233417,
            2562383102,
            271733878
          ]);
        },
        _doProcessBlock: function(f, c) {
          for (var C = 0; C < 16; C++) {
            var r = c + C, i = f[r];
            f[r] = (i << 8 | i >>> 24) & 16711935 | (i << 24 | i >>> 8) & 4278255360;
          }
          var s = this._hash.words, u = f[c + 0], v = f[c + 1], w = f[c + 2], T = f[c + 3], H = f[c + 4], A = f[c + 5], k = f[c + 6], R = f[c + 7], E = f[c + 8], j = f[c + 9], D = f[c + 10], P = f[c + 11], L = f[c + 12], q = f[c + 13], I = f[c + 14], F = f[c + 15], t = s[0], e = s[1], n = s[2], o = s[3];
          t = y(t, e, n, o, u, 7, a[0]), o = y(o, t, e, n, v, 12, a[1]), n = y(n, o, t, e, w, 17, a[2]), e = y(e, n, o, t, T, 22, a[3]), t = y(t, e, n, o, H, 7, a[4]), o = y(o, t, e, n, A, 12, a[5]), n = y(n, o, t, e, k, 17, a[6]), e = y(e, n, o, t, R, 22, a[7]), t = y(t, e, n, o, E, 7, a[8]), o = y(o, t, e, n, j, 12, a[9]), n = y(n, o, t, e, D, 17, a[10]), e = y(e, n, o, t, P, 22, a[11]), t = y(t, e, n, o, L, 7, a[12]), o = y(o, t, e, n, q, 12, a[13]), n = y(n, o, t, e, I, 17, a[14]), e = y(e, n, o, t, F, 22, a[15]), t = p(t, e, n, o, v, 5, a[16]), o = p(o, t, e, n, k, 9, a[17]), n = p(n, o, t, e, P, 14, a[18]), e = p(e, n, o, t, u, 20, a[19]), t = p(t, e, n, o, A, 5, a[20]), o = p(o, t, e, n, D, 9, a[21]), n = p(n, o, t, e, F, 14, a[22]), e = p(e, n, o, t, H, 20, a[23]), t = p(t, e, n, o, j, 5, a[24]), o = p(o, t, e, n, I, 9, a[25]), n = p(n, o, t, e, T, 14, a[26]), e = p(e, n, o, t, E, 20, a[27]), t = p(t, e, n, o, q, 5, a[28]), o = p(o, t, e, n, w, 9, a[29]), n = p(n, o, t, e, R, 14, a[30]), e = p(e, n, o, t, L, 20, a[31]), t = l(t, e, n, o, A, 4, a[32]), o = l(o, t, e, n, E, 11, a[33]), n = l(n, o, t, e, P, 16, a[34]), e = l(e, n, o, t, I, 23, a[35]), t = l(t, e, n, o, v, 4, a[36]), o = l(o, t, e, n, H, 11, a[37]), n = l(n, o, t, e, R, 16, a[38]), e = l(e, n, o, t, D, 23, a[39]), t = l(t, e, n, o, q, 4, a[40]), o = l(o, t, e, n, u, 11, a[41]), n = l(n, o, t, e, T, 16, a[42]), e = l(e, n, o, t, k, 23, a[43]), t = l(t, e, n, o, j, 4, a[44]), o = l(o, t, e, n, L, 11, a[45]), n = l(n, o, t, e, F, 16, a[46]), e = l(e, n, o, t, w, 23, a[47]), t = x(t, e, n, o, u, 6, a[48]), o = x(o, t, e, n, R, 10, a[49]), n = x(n, o, t, e, I, 15, a[50]), e = x(e, n, o, t, A, 21, a[51]), t = x(t, e, n, o, L, 6, a[52]), o = x(o, t, e, n, T, 10, a[53]), n = x(n, o, t, e, D, 15, a[54]), e = x(e, n, o, t, v, 21, a[55]), t = x(t, e, n, o, E, 6, a[56]), o = x(o, t, e, n, F, 10, a[57]), n = x(n, o, t, e, k, 15, a[58]), e = x(e, n, o, t, q, 21, a[59]), t = x(t, e, n, o, H, 6, a[60]), o = x(o, t, e, n, P, 10, a[61]), n = x(n, o, t, e, w, 15, a[62]), e = x(e, n, o, t, j, 21, a[63]), s[0] = s[0] + t | 0, s[1] = s[1] + e | 0, s[2] = s[2] + n | 0, s[3] = s[3] + o | 0;
        },
        _doFinalize: function() {
          var f = this._data, c = f.words, C = this._nDataBytes * 8, r = f.sigBytes * 8;
          c[r >>> 5] |= 128 << 24 - r % 32;
          var i = _.floor(C / 4294967296), s = C;
          c[(r + 64 >>> 9 << 4) + 15] = (i << 8 | i >>> 24) & 16711935 | (i << 24 | i >>> 8) & 4278255360, c[(r + 64 >>> 9 << 4) + 14] = (s << 8 | s >>> 24) & 16711935 | (s << 24 | s >>> 8) & 4278255360, f.sigBytes = (c.length + 1) * 4, this._process();
          for (var u = this._hash, v = u.words, w = 0; w < 4; w++) {
            var T = v[w];
            v[w] = (T << 8 | T >>> 24) & 16711935 | (T << 24 | T >>> 8) & 4278255360;
          }
          return u;
        },
        clone: function() {
          var f = O.clone.call(this);
          return f._hash = this._hash.clone(), f;
        }
      });
      function y(f, c, C, r, i, s, u) {
        var v = f + (c & C | ~c & r) + i + u;
        return (v << s | v >>> 32 - s) + c;
      }
      function p(f, c, C, r, i, s, u) {
        var v = f + (c & r | C & ~r) + i + u;
        return (v << s | v >>> 32 - s) + c;
      }
      function l(f, c, C, r, i, s, u) {
        var v = f + (c ^ C ^ r) + i + u;
        return (v << s | v >>> 32 - s) + c;
      }
      function x(f, c, C, r, i, s, u) {
        var v = f + (C ^ (c | ~r)) + i + u;
        return (v << s | v >>> 32 - s) + c;
      }
      B.MD5 = O._createHelper(b), B.HmacMD5 = O._createHmacHelper(b);
    }(Math), g.MD5;
  });
})(K);
const tr = U;
var $ = {}, er = {
  get exports() {
    return $;
  },
  set exports(h) {
    $ = h;
  }
};
(function(h, d) {
  (function(g, _) {
    h.exports = _(V());
  })(z, function(g) {
    return function() {
      var _ = g, B = _.lib, m = B.WordArray, W = _.enc;
      W.Base64 = {
        /**
         * Converts a word array to a Base64 string.
         *
         * @param {WordArray} wordArray The word array.
         *
         * @return {string} The Base64 string.
         *
         * @static
         *
         * @example
         *
         *     var base64String = CryptoJS.enc.Base64.stringify(wordArray);
         */
        stringify: function(S) {
          var a = S.words, b = S.sigBytes, y = this._map;
          S.clamp();
          for (var p = [], l = 0; l < b; l += 3)
            for (var x = a[l >>> 2] >>> 24 - l % 4 * 8 & 255, f = a[l + 1 >>> 2] >>> 24 - (l + 1) % 4 * 8 & 255, c = a[l + 2 >>> 2] >>> 24 - (l + 2) % 4 * 8 & 255, C = x << 16 | f << 8 | c, r = 0; r < 4 && l + r * 0.75 < b; r++)
              p.push(y.charAt(C >>> 6 * (3 - r) & 63));
          var i = y.charAt(64);
          if (i)
            for (; p.length % 4; )
              p.push(i);
          return p.join("");
        },
        /**
         * Converts a Base64 string to a word array.
         *
         * @param {string} base64Str The Base64 string.
         *
         * @return {WordArray} The word array.
         *
         * @static
         *
         * @example
         *
         *     var wordArray = CryptoJS.enc.Base64.parse(base64String);
         */
        parse: function(S) {
          var a = S.length, b = this._map, y = this._reverseMap;
          if (!y) {
            y = this._reverseMap = [];
            for (var p = 0; p < b.length; p++)
              y[b.charCodeAt(p)] = p;
          }
          var l = b.charAt(64);
          if (l) {
            var x = S.indexOf(l);
            x !== -1 && (a = x);
          }
          return O(S, a, y);
        },
        _map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
      };
      function O(S, a, b) {
        for (var y = [], p = 0, l = 0; l < a; l++)
          if (l % 4) {
            var x = b[S.charCodeAt(l - 1)] << l % 4 * 2, f = b[S.charCodeAt(l)] >>> 6 - l % 4 * 2, c = x | f;
            y[p >>> 2] |= c << 24 - p % 4 * 8, p++;
          }
        return m.create(y, p);
      }
    }(), g.enc.Base64;
  });
})(er);
const nr = $, or = {
  process(h) {
    try {
      const d = {};
      return this._sortType(d, h), nr.stringify(tr(JSON.stringify(d)));
    } catch (d) {
      console.error(d);
    }
  },
  _sortType(h, d) {
    if (this._nullish(d))
      throw new Error("objectHash: value cannot be undefined");
    return Array.isArray(d) ? d = this._array(h, d) : typeof d == "object" ? d = this._object(h, d) : typeof d == "function" && (d = d.toString()), d;
  },
  /**
     * Check if value is undefined or null
     * @private
     * @param {*} value - Any value
     * @returns {boolean}
     */
  _nullish(h) {
    return h == null;
  },
  _array(h, d) {
    d = d.splice(), d.sort();
    for (let g = 0; g < d.length; g++) {
      const _ = d[g];
      d[g] = this._sortType(h, _);
    }
    return d;
  },
  _object(h, d) {
    const g = Object.keys(d);
    g.sort();
    for (let _ = 0; _ < g.length; _++) {
      const B = g[_];
      h[B] = {}, h[B] = this._sortType(h[B], d[B]);
    }
    return h;
  }
}, N = { b: 1, a: 2, children: [2, 3, 4, 1] };
console.log(or.process(N));
console.log(N.children);
export {
  or as default
};
