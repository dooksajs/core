function te(g) {
  throw new Error('Could not dynamically require "' + g + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
}
var ue = { exports: {} };
(function(g, p) {
  (function(c) {
    g.exports = c();
  })(function() {
    return function c(h, m, y) {
      function C(d, x) {
        if (!m[d]) {
          if (!h[d]) {
            var j = typeof te == "function" && te;
            if (!x && j)
              return j(d, !0);
            if (k)
              return k(d, !0);
            throw new Error("Cannot find module '" + d + "'");
          }
          x = m[d] = { exports: {} }, h[d][0].call(x.exports, function(Y) {
            var D = h[d][1][Y];
            return C(D || Y);
          }, x, x.exports, c, h, m, y);
        }
        return m[d].exports;
      }
      for (var k = typeof te == "function" && te, A = 0; A < y.length; A++)
        C(y[A]);
      return C;
    }({ 1: [function(c, h, m) {
      (function(y, C, k, A, d, x, j, Y, D) {
        var w = c("crypto");
        function U(s, f) {
          f = E(s, f);
          var n;
          return (n = f.algorithm !== "passthrough" ? w.createHash(f.algorithm) : new N()).write === void 0 && (n.write = n.update, n.end = n.update), I(f, n).dispatch(s), n.update || n.end(""), n.digest ? n.digest(f.encoding === "buffer" ? void 0 : f.encoding) : (s = n.read(), f.encoding !== "buffer" ? s.toString(f.encoding) : s);
        }
        (m = h.exports = U).sha1 = function(s) {
          return U(s);
        }, m.keys = function(s) {
          return U(s, { excludeValues: !0, algorithm: "sha1", encoding: "hex" });
        }, m.MD5 = function(s) {
          return U(s, { algorithm: "md5", encoding: "hex" });
        }, m.keysMD5 = function(s) {
          return U(s, { algorithm: "md5", encoding: "hex", excludeValues: !0 });
        };
        var a = w.getHashes ? w.getHashes().slice() : ["sha1", "md5"], b = (a.push("passthrough"), ["buffer", "hex", "binary", "base64"]);
        function E(s, f) {
          var n = {};
          if (n.algorithm = (f = f || {}).algorithm || "sha1", n.encoding = f.encoding || "hex", n.excludeValues = !!f.excludeValues, n.algorithm = n.algorithm.toLowerCase(), n.encoding = n.encoding.toLowerCase(), n.ignoreUnknown = f.ignoreUnknown === !0, n.respectType = f.respectType !== !1, n.respectFunctionNames = f.respectFunctionNames !== !1, n.respectFunctionProperties = f.respectFunctionProperties !== !1, n.unorderedArrays = f.unorderedArrays === !0, n.unorderedSets = f.unorderedSets !== !1, n.unorderedObjects = f.unorderedObjects !== !1, n.replacer = f.replacer || void 0, n.excludeKeys = f.excludeKeys || void 0, s === void 0)
            throw new Error("Object argument required.");
          for (var o = 0; o < a.length; ++o)
            a[o].toLowerCase() === n.algorithm.toLowerCase() && (n.algorithm = a[o]);
          if (a.indexOf(n.algorithm) === -1)
            throw new Error('Algorithm "' + n.algorithm + '"  not supported. supported values: ' + a.join(", "));
          if (b.indexOf(n.encoding) === -1 && n.algorithm !== "passthrough")
            throw new Error('Encoding "' + n.encoding + '"  not supported. supported values: ' + b.join(", "));
          return n;
        }
        function B(s) {
          if (typeof s == "function")
            return /^function\s+\w*\s*\(\s*\)\s*{\s+\[native code\]\s+}$/i.exec(Function.prototype.toString.call(s)) != null;
        }
        function I(s, f, n) {
          n = n || [];
          function o(t) {
            return f.update ? f.update(t, "utf8") : f.write(t, "utf8");
          }
          return { dispatch: function(t) {
            return this["_" + ((t = s.replacer ? s.replacer(t) : t) === null ? "null" : typeof t)](t);
          }, _object: function(t) {
            var u, l = Object.prototype.toString.call(t), M = /\[object (.*)\]/i.exec(l);
            if (M = (M = M ? M[1] : "unknown:[" + l + "]").toLowerCase(), 0 <= (l = n.indexOf(t)))
              return this.dispatch("[CIRCULAR:" + l + "]");
            if (n.push(t), k !== void 0 && k.isBuffer && k.isBuffer(t))
              return o("buffer:"), o(t);
            if (M === "object" || M === "function" || M === "asyncfunction")
              return l = Object.keys(t), s.unorderedObjects && (l = l.sort()), s.respectType === !1 || B(t) || l.splice(0, 0, "prototype", "__proto__", "constructor"), s.excludeKeys && (l = l.filter(function(F) {
                return !s.excludeKeys(F);
              })), o("object:" + l.length + ":"), u = this, l.forEach(function(F) {
                u.dispatch(F), o(":"), s.excludeValues || u.dispatch(t[F]), o(",");
              });
            if (!this["_" + M]) {
              if (s.ignoreUnknown)
                return o("[" + M + "]");
              throw new Error('Unknown object type "' + M + '"');
            }
            this["_" + M](t);
          }, _array: function(t, F) {
            F = F !== void 0 ? F : s.unorderedArrays !== !1;
            var l = this;
            if (o("array:" + t.length + ":"), !F || t.length <= 1)
              return t.forEach(function($) {
                return l.dispatch($);
              });
            var M = [], F = t.map(function($) {
              var T = new N(), q = n.slice();
              return I(s, T, q).dispatch($), M = M.concat(q.slice(n.length)), T.read().toString();
            });
            return n = n.concat(M), F.sort(), this._array(F, !1);
          }, _date: function(t) {
            return o("date:" + t.toJSON());
          }, _symbol: function(t) {
            return o("symbol:" + t.toString());
          }, _error: function(t) {
            return o("error:" + t.toString());
          }, _boolean: function(t) {
            return o("bool:" + t.toString());
          }, _string: function(t) {
            o("string:" + t.length + ":"), o(t.toString());
          }, _function: function(t) {
            o("fn:"), B(t) ? this.dispatch("[native]") : this.dispatch(t.toString()), s.respectFunctionNames !== !1 && this.dispatch("function-name:" + String(t.name)), s.respectFunctionProperties && this._object(t);
          }, _number: function(t) {
            return o("number:" + t.toString());
          }, _xml: function(t) {
            return o("xml:" + t.toString());
          }, _null: function() {
            return o("Null");
          }, _undefined: function() {
            return o("Undefined");
          }, _regexp: function(t) {
            return o("regex:" + t.toString());
          }, _uint8array: function(t) {
            return o("uint8array:"), this.dispatch(Array.prototype.slice.call(t));
          }, _uint8clampedarray: function(t) {
            return o("uint8clampedarray:"), this.dispatch(Array.prototype.slice.call(t));
          }, _int8array: function(t) {
            return o("int8array:"), this.dispatch(Array.prototype.slice.call(t));
          }, _uint16array: function(t) {
            return o("uint16array:"), this.dispatch(Array.prototype.slice.call(t));
          }, _int16array: function(t) {
            return o("int16array:"), this.dispatch(Array.prototype.slice.call(t));
          }, _uint32array: function(t) {
            return o("uint32array:"), this.dispatch(Array.prototype.slice.call(t));
          }, _int32array: function(t) {
            return o("int32array:"), this.dispatch(Array.prototype.slice.call(t));
          }, _float32array: function(t) {
            return o("float32array:"), this.dispatch(Array.prototype.slice.call(t));
          }, _float64array: function(t) {
            return o("float64array:"), this.dispatch(Array.prototype.slice.call(t));
          }, _arraybuffer: function(t) {
            return o("arraybuffer:"), this.dispatch(new Uint8Array(t));
          }, _url: function(t) {
            return o("url:" + t.toString());
          }, _map: function(t) {
            return o("map:"), t = Array.from(t), this._array(t, s.unorderedSets !== !1);
          }, _set: function(t) {
            return o("set:"), t = Array.from(t), this._array(t, s.unorderedSets !== !1);
          }, _file: function(t) {
            return o("file:"), this.dispatch([t.name, t.size, t.type, t.lastModfied]);
          }, _blob: function() {
            if (s.ignoreUnknown)
              return o("[blob]");
            throw Error(`Hashing Blob objects is currently not supported
(see https://github.com/puleos/object-hash/issues/26)
Use "options.replacer" or "options.ignoreUnknown"
`);
          }, _domwindow: function() {
            return o("domwindow");
          }, _bigint: function(t) {
            return o("bigint:" + t.toString());
          }, _process: function() {
            return o("process");
          }, _timer: function() {
            return o("timer");
          }, _pipe: function() {
            return o("pipe");
          }, _tcp: function() {
            return o("tcp");
          }, _udp: function() {
            return o("udp");
          }, _tty: function() {
            return o("tty");
          }, _statwatcher: function() {
            return o("statwatcher");
          }, _securecontext: function() {
            return o("securecontext");
          }, _connection: function() {
            return o("connection");
          }, _zlib: function() {
            return o("zlib");
          }, _context: function() {
            return o("context");
          }, _nodescript: function() {
            return o("nodescript");
          }, _httpparser: function() {
            return o("httpparser");
          }, _dataview: function() {
            return o("dataview");
          }, _signal: function() {
            return o("signal");
          }, _fsevent: function() {
            return o("fsevent");
          }, _tlswrap: function() {
            return o("tlswrap");
          } };
        }
        function N() {
          return { buf: "", write: function(s) {
            this.buf += s;
          }, end: function(s) {
            this.buf += s;
          }, read: function() {
            return this.buf;
          } };
        }
        m.writeToStream = function(s, f, n) {
          return n === void 0 && (n = f, f = {}), I(f = E(s, f), n).dispatch(s);
        };
      }).call(this, c("lYpoI2"), typeof self < "u" ? self : typeof window < "u" ? window : {}, c("buffer").Buffer, arguments[3], arguments[4], arguments[5], arguments[6], "/fake_9a5aa49d.js", "/");
    }, { buffer: 3, crypto: 5, lYpoI2: 11 }], 2: [function(c, h, m) {
      (function(y, C, k, A, d, x, j, Y, D) {
        (function(w) {
          var U = typeof Uint8Array < "u" ? Uint8Array : Array, a = "+".charCodeAt(0), b = "/".charCodeAt(0), E = "0".charCodeAt(0), B = "a".charCodeAt(0), I = "A".charCodeAt(0), N = "-".charCodeAt(0), s = "_".charCodeAt(0);
          function f(n) {
            return n = n.charCodeAt(0), n === a || n === N ? 62 : n === b || n === s ? 63 : n < E ? -1 : n < E + 10 ? n - E + 26 + 26 : n < I + 26 ? n - I : n < B + 26 ? n - B + 26 : void 0;
          }
          w.toByteArray = function(n) {
            var o, t;
            if (0 < n.length % 4)
              throw new Error("Invalid string. Length must be a multiple of 4");
            var u = n.length, u = n.charAt(u - 2) === "=" ? 2 : n.charAt(u - 1) === "=" ? 1 : 0, l = new U(3 * n.length / 4 - u), M = 0 < u ? n.length - 4 : n.length, F = 0;
            function $(T) {
              l[F++] = T;
            }
            for (o = 0; o < M; o += 4, 0)
              $((16711680 & (t = f(n.charAt(o)) << 18 | f(n.charAt(o + 1)) << 12 | f(n.charAt(o + 2)) << 6 | f(n.charAt(o + 3)))) >> 16), $((65280 & t) >> 8), $(255 & t);
            return u == 2 ? $(255 & (t = f(n.charAt(o)) << 2 | f(n.charAt(o + 1)) >> 4)) : u == 1 && ($((t = f(n.charAt(o)) << 10 | f(n.charAt(o + 1)) << 4 | f(n.charAt(o + 2)) >> 2) >> 8 & 255), $(255 & t)), l;
          }, w.fromByteArray = function(n) {
            var o, t, u, l, M = n.length % 3, F = "";
            function $(T) {
              return "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(T);
            }
            for (o = 0, u = n.length - M; o < u; o += 3)
              t = (n[o] << 16) + (n[o + 1] << 8) + n[o + 2], F += $((l = t) >> 18 & 63) + $(l >> 12 & 63) + $(l >> 6 & 63) + $(63 & l);
            switch (M) {
              case 1:
                F = (F += $((t = n[n.length - 1]) >> 2)) + $(t << 4 & 63) + "==";
                break;
              case 2:
                F = (F = (F += $((t = (n[n.length - 2] << 8) + n[n.length - 1]) >> 10)) + $(t >> 4 & 63)) + $(t << 2 & 63) + "=";
            }
            return F;
          };
        })(m === void 0 ? this.base64js = {} : m);
      }).call(this, c("lYpoI2"), typeof self < "u" ? self : typeof window < "u" ? window : {}, c("buffer").Buffer, arguments[3], arguments[4], arguments[5], arguments[6], "/node_modules/gulp-browserify/node_modules/base64-js/lib/b64.js", "/node_modules/gulp-browserify/node_modules/base64-js/lib");
    }, { buffer: 3, lYpoI2: 11 }], 3: [function(c, h, m) {
      (function(y, C, a, A, d, x, j, Y, D) {
        var w = c("base64-js"), U = c("ieee754");
        function a(e, r, i) {
          if (!(this instanceof a))
            return new a(e, r, i);
          var _, v, L, H, P = typeof e;
          if (r === "base64" && P == "string")
            for (e = (H = e).trim ? H.trim() : H.replace(/^\s+|\s+$/g, ""); e.length % 4 != 0; )
              e += "=";
          if (P == "number")
            _ = z(e);
          else if (P == "string")
            _ = a.byteLength(e, r);
          else {
            if (P != "object")
              throw new Error("First argument needs to be a number, array or string.");
            _ = z(e.length);
          }
          if (a._useTypedArrays ? v = a._augment(new Uint8Array(_)) : ((v = this).length = _, v._isBuffer = !0), a._useTypedArrays && typeof e.byteLength == "number")
            v._set(e);
          else if (O(H = e) || a.isBuffer(H) || H && typeof H == "object" && typeof H.length == "number")
            for (L = 0; L < _; L++)
              a.isBuffer(e) ? v[L] = e.readUInt8(L) : v[L] = e[L];
          else if (P == "string")
            v.write(e, 0, r);
          else if (P == "number" && !a._useTypedArrays && !i)
            for (L = 0; L < _; L++)
              v[L] = 0;
          return v;
        }
        function b(e, r, i, _) {
          return a._charsWritten = ee(function(v) {
            for (var L = [], H = 0; H < v.length; H++)
              L.push(255 & v.charCodeAt(H));
            return L;
          }(r), e, i, _);
        }
        function E(e, r, i, _) {
          return a._charsWritten = ee(function(v) {
            for (var L, H, P = [], K = 0; K < v.length; K++)
              H = v.charCodeAt(K), L = H >> 8, H = H % 256, P.push(H), P.push(L);
            return P;
          }(r), e, i, _);
        }
        function B(e, r, i) {
          var _ = "";
          i = Math.min(e.length, i);
          for (var v = r; v < i; v++)
            _ += String.fromCharCode(e[v]);
          return _;
        }
        function I(e, r, i, L) {
          L || (S(typeof i == "boolean", "missing or invalid endian"), S(r != null, "missing offset"), S(r + 1 < e.length, "Trying to read beyond buffer length"));
          var v, L = e.length;
          if (!(L <= r))
            return i ? (v = e[r], r + 1 < L && (v |= e[r + 1] << 8)) : (v = e[r] << 8, r + 1 < L && (v |= e[r + 1])), v;
        }
        function N(e, r, i, L) {
          L || (S(typeof i == "boolean", "missing or invalid endian"), S(r != null, "missing offset"), S(r + 3 < e.length, "Trying to read beyond buffer length"));
          var v, L = e.length;
          if (!(L <= r))
            return i ? (r + 2 < L && (v = e[r + 2] << 16), r + 1 < L && (v |= e[r + 1] << 8), v |= e[r], r + 3 < L && (v += e[r + 3] << 24 >>> 0)) : (r + 1 < L && (v = e[r + 1] << 16), r + 2 < L && (v |= e[r + 2] << 8), r + 3 < L && (v |= e[r + 3]), v += e[r] << 24 >>> 0), v;
        }
        function s(e, r, i, _) {
          if (_ || (S(typeof i == "boolean", "missing or invalid endian"), S(r != null, "missing offset"), S(r + 1 < e.length, "Trying to read beyond buffer length")), !(e.length <= r))
            return _ = I(e, r, i, !0), 32768 & _ ? -1 * (65535 - _ + 1) : _;
        }
        function f(e, r, i, _) {
          if (_ || (S(typeof i == "boolean", "missing or invalid endian"), S(r != null, "missing offset"), S(r + 3 < e.length, "Trying to read beyond buffer length")), !(e.length <= r))
            return _ = N(e, r, i, !0), 2147483648 & _ ? -1 * (4294967295 - _ + 1) : _;
        }
        function n(e, r, i, _) {
          return _ || (S(typeof i == "boolean", "missing or invalid endian"), S(r + 3 < e.length, "Trying to read beyond buffer length")), U.read(e, r, i, 23, 4);
        }
        function o(e, r, i, _) {
          return _ || (S(typeof i == "boolean", "missing or invalid endian"), S(r + 7 < e.length, "Trying to read beyond buffer length")), U.read(e, r, i, 52, 8);
        }
        function t(e, r, i, _, v) {
          if (v || (S(r != null, "missing value"), S(typeof _ == "boolean", "missing or invalid endian"), S(i != null, "missing offset"), S(i + 1 < e.length, "trying to write beyond buffer length"), ne(r, 65535)), v = e.length, !(v <= i))
            for (var L = 0, H = Math.min(v - i, 2); L < H; L++)
              e[i + L] = (r & 255 << 8 * (_ ? L : 1 - L)) >>> 8 * (_ ? L : 1 - L);
        }
        function u(e, r, i, _, v) {
          if (v || (S(r != null, "missing value"), S(typeof _ == "boolean", "missing or invalid endian"), S(i != null, "missing offset"), S(i + 3 < e.length, "trying to write beyond buffer length"), ne(r, 4294967295)), v = e.length, !(v <= i))
            for (var L = 0, H = Math.min(v - i, 4); L < H; L++)
              e[i + L] = r >>> 8 * (_ ? L : 3 - L) & 255;
        }
        function l(e, r, i, _, v) {
          v || (S(r != null, "missing value"), S(typeof _ == "boolean", "missing or invalid endian"), S(i != null, "missing offset"), S(i + 1 < e.length, "Trying to write beyond buffer length"), re(r, 32767, -32768)), e.length <= i || t(e, 0 <= r ? r : 65535 + r + 1, i, _, v);
        }
        function M(e, r, i, _, v) {
          v || (S(r != null, "missing value"), S(typeof _ == "boolean", "missing or invalid endian"), S(i != null, "missing offset"), S(i + 3 < e.length, "Trying to write beyond buffer length"), re(r, 2147483647, -2147483648)), e.length <= i || u(e, 0 <= r ? r : 4294967295 + r + 1, i, _, v);
        }
        function F(e, r, i, _, v) {
          v || (S(r != null, "missing value"), S(typeof _ == "boolean", "missing or invalid endian"), S(i != null, "missing offset"), S(i + 3 < e.length, "Trying to write beyond buffer length"), se(r, 34028234663852886e22, -34028234663852886e22)), e.length <= i || U.write(e, r, i, _, 23, 4);
        }
        function $(e, r, i, _, v) {
          v || (S(r != null, "missing value"), S(typeof _ == "boolean", "missing or invalid endian"), S(i != null, "missing offset"), S(i + 7 < e.length, "Trying to write beyond buffer length"), se(r, 17976931348623157e292, -17976931348623157e292)), e.length <= i || U.write(e, r, i, _, 52, 8);
        }
        m.Buffer = a, m.SlowBuffer = a, m.INSPECT_MAX_BYTES = 50, a.poolSize = 8192, a._useTypedArrays = function() {
          try {
            var e = new ArrayBuffer(0), r = new Uint8Array(e);
            return r.foo = function() {
              return 42;
            }, r.foo() === 42 && typeof r.subarray == "function";
          } catch {
            return !1;
          }
        }(), a.isEncoding = function(e) {
          switch (String(e).toLowerCase()) {
            case "hex":
            case "utf8":
            case "utf-8":
            case "ascii":
            case "binary":
            case "base64":
            case "raw":
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
              return !0;
            default:
              return !1;
          }
        }, a.isBuffer = function(e) {
          return !(e == null || !e._isBuffer);
        }, a.byteLength = function(e, r) {
          var i;
          switch (e += "", r || "utf8") {
            case "hex":
              i = e.length / 2;
              break;
            case "utf8":
            case "utf-8":
              i = Z(e).length;
              break;
            case "ascii":
            case "binary":
            case "raw":
              i = e.length;
              break;
            case "base64":
              i = oe(e).length;
              break;
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
              i = 2 * e.length;
              break;
            default:
              throw new Error("Unknown encoding");
          }
          return i;
        }, a.concat = function(e, r) {
          if (S(O(e), `Usage: Buffer.concat(list, [totalLength])
list should be an Array.`), e.length === 0)
            return new a(0);
          if (e.length === 1)
            return e[0];
          if (typeof r != "number")
            for (v = r = 0; v < e.length; v++)
              r += e[v].length;
          for (var i = new a(r), _ = 0, v = 0; v < e.length; v++) {
            var L = e[v];
            L.copy(i, _), _ += L.length;
          }
          return i;
        }, a.prototype.write = function(e, r, i, _) {
          isFinite(r) ? isFinite(i) || (_ = i, i = void 0) : (K = _, _ = r, r = i, i = K), r = Number(r) || 0;
          var v, L, H, P, K = this.length - r;
          switch ((!i || K < (i = Number(i))) && (i = K), _ = String(_ || "utf8").toLowerCase()) {
            case "hex":
              v = function(G, J, Q, X) {
                Q = Number(Q) || 0;
                var R = G.length - Q;
                (!X || R < (X = Number(X))) && (X = R), S((R = J.length) % 2 == 0, "Invalid hex string"), R / 2 < X && (X = R / 2);
                for (var V = 0; V < X; V++) {
                  var ae = parseInt(J.substr(2 * V, 2), 16);
                  S(!isNaN(ae), "Invalid hex string"), G[Q + V] = ae;
                }
                return a._charsWritten = 2 * V, V;
              }(this, e, r, i);
              break;
            case "utf8":
            case "utf-8":
              L = this, H = r, P = i, v = a._charsWritten = ee(Z(e), L, H, P);
              break;
            case "ascii":
            case "binary":
              v = b(this, e, r, i);
              break;
            case "base64":
              L = this, H = r, P = i, v = a._charsWritten = ee(oe(e), L, H, P);
              break;
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
              v = E(this, e, r, i);
              break;
            default:
              throw new Error("Unknown encoding");
          }
          return v;
        }, a.prototype.toString = function(e, r, i) {
          var _, v, L, H, P = this;
          if (e = String(e || "utf8").toLowerCase(), r = Number(r) || 0, (i = i !== void 0 ? Number(i) : P.length) === r)
            return "";
          switch (e) {
            case "hex":
              _ = function(K, G, J) {
                var Q = K.length;
                (!G || G < 0) && (G = 0), (!J || J < 0 || Q < J) && (J = Q);
                for (var X = "", R = G; R < J; R++)
                  X += W(K[R]);
                return X;
              }(P, r, i);
              break;
            case "utf8":
            case "utf-8":
              _ = function(K, G, J) {
                var Q = "", X = "";
                J = Math.min(K.length, J);
                for (var R = G; R < J; R++)
                  K[R] <= 127 ? (Q += ie(X) + String.fromCharCode(K[R]), X = "") : X += "%" + K[R].toString(16);
                return Q + ie(X);
              }(P, r, i);
              break;
            case "ascii":
            case "binary":
              _ = B(P, r, i);
              break;
            case "base64":
              v = P, H = i, _ = (L = r) === 0 && H === v.length ? w.fromByteArray(v) : w.fromByteArray(v.slice(L, H));
              break;
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
              _ = function(K, G, J) {
                for (var Q = K.slice(G, J), X = "", R = 0; R < Q.length; R += 2)
                  X += String.fromCharCode(Q[R] + 256 * Q[R + 1]);
                return X;
              }(P, r, i);
              break;
            default:
              throw new Error("Unknown encoding");
          }
          return _;
        }, a.prototype.toJSON = function() {
          return { type: "Buffer", data: Array.prototype.slice.call(this._arr || this, 0) };
        }, a.prototype.copy = function(e, r, i, _) {
          if (r = r || 0, (_ = _ || _ === 0 ? _ : this.length) !== (i = i || 0) && e.length !== 0 && this.length !== 0) {
            S(i <= _, "sourceEnd < sourceStart"), S(0 <= r && r < e.length, "targetStart out of bounds"), S(0 <= i && i < this.length, "sourceStart out of bounds"), S(0 <= _ && _ <= this.length, "sourceEnd out of bounds"), _ > this.length && (_ = this.length);
            var v = (_ = e.length - r < _ - i ? e.length - r + i : _) - i;
            if (v < 100 || !a._useTypedArrays)
              for (var L = 0; L < v; L++)
                e[L + r] = this[L + i];
            else
              e._set(this.subarray(i, i + v), r);
          }
        }, a.prototype.slice = function(e, r) {
          var i = this.length;
          if (e = q(e, i, 0), r = q(r, i, i), a._useTypedArrays)
            return a._augment(this.subarray(e, r));
          for (var _ = r - e, v = new a(_, void 0, !0), L = 0; L < _; L++)
            v[L] = this[L + e];
          return v;
        }, a.prototype.get = function(e) {
          return console.log(".get() is deprecated. Access using array indexes instead."), this.readUInt8(e);
        }, a.prototype.set = function(e, r) {
          return console.log(".set() is deprecated. Access using array indexes instead."), this.writeUInt8(e, r);
        }, a.prototype.readUInt8 = function(e, r) {
          if (r || (S(e != null, "missing offset"), S(e < this.length, "Trying to read beyond buffer length")), !(e >= this.length))
            return this[e];
        }, a.prototype.readUInt16LE = function(e, r) {
          return I(this, e, !0, r);
        }, a.prototype.readUInt16BE = function(e, r) {
          return I(this, e, !1, r);
        }, a.prototype.readUInt32LE = function(e, r) {
          return N(this, e, !0, r);
        }, a.prototype.readUInt32BE = function(e, r) {
          return N(this, e, !1, r);
        }, a.prototype.readInt8 = function(e, r) {
          if (r || (S(e != null, "missing offset"), S(e < this.length, "Trying to read beyond buffer length")), !(e >= this.length))
            return 128 & this[e] ? -1 * (255 - this[e] + 1) : this[e];
        }, a.prototype.readInt16LE = function(e, r) {
          return s(this, e, !0, r);
        }, a.prototype.readInt16BE = function(e, r) {
          return s(this, e, !1, r);
        }, a.prototype.readInt32LE = function(e, r) {
          return f(this, e, !0, r);
        }, a.prototype.readInt32BE = function(e, r) {
          return f(this, e, !1, r);
        }, a.prototype.readFloatLE = function(e, r) {
          return n(this, e, !0, r);
        }, a.prototype.readFloatBE = function(e, r) {
          return n(this, e, !1, r);
        }, a.prototype.readDoubleLE = function(e, r) {
          return o(this, e, !0, r);
        }, a.prototype.readDoubleBE = function(e, r) {
          return o(this, e, !1, r);
        }, a.prototype.writeUInt8 = function(e, r, i) {
          i || (S(e != null, "missing value"), S(r != null, "missing offset"), S(r < this.length, "trying to write beyond buffer length"), ne(e, 255)), r >= this.length || (this[r] = e);
        }, a.prototype.writeUInt16LE = function(e, r, i) {
          t(this, e, r, !0, i);
        }, a.prototype.writeUInt16BE = function(e, r, i) {
          t(this, e, r, !1, i);
        }, a.prototype.writeUInt32LE = function(e, r, i) {
          u(this, e, r, !0, i);
        }, a.prototype.writeUInt32BE = function(e, r, i) {
          u(this, e, r, !1, i);
        }, a.prototype.writeInt8 = function(e, r, i) {
          i || (S(e != null, "missing value"), S(r != null, "missing offset"), S(r < this.length, "Trying to write beyond buffer length"), re(e, 127, -128)), r >= this.length || (0 <= e ? this.writeUInt8(e, r, i) : this.writeUInt8(255 + e + 1, r, i));
        }, a.prototype.writeInt16LE = function(e, r, i) {
          l(this, e, r, !0, i);
        }, a.prototype.writeInt16BE = function(e, r, i) {
          l(this, e, r, !1, i);
        }, a.prototype.writeInt32LE = function(e, r, i) {
          M(this, e, r, !0, i);
        }, a.prototype.writeInt32BE = function(e, r, i) {
          M(this, e, r, !1, i);
        }, a.prototype.writeFloatLE = function(e, r, i) {
          F(this, e, r, !0, i);
        }, a.prototype.writeFloatBE = function(e, r, i) {
          F(this, e, r, !1, i);
        }, a.prototype.writeDoubleLE = function(e, r, i) {
          $(this, e, r, !0, i);
        }, a.prototype.writeDoubleBE = function(e, r, i) {
          $(this, e, r, !1, i);
        }, a.prototype.fill = function(e, r, i) {
          if (r = r || 0, i = i || this.length, S(typeof (e = typeof (e = e || 0) == "string" ? e.charCodeAt(0) : e) == "number" && !isNaN(e), "value is not a number"), S(r <= i, "end < start"), i !== r && this.length !== 0) {
            S(0 <= r && r < this.length, "start out of bounds"), S(0 <= i && i <= this.length, "end out of bounds");
            for (var _ = r; _ < i; _++)
              this[_] = e;
          }
        }, a.prototype.inspect = function() {
          for (var e = [], r = this.length, i = 0; i < r; i++)
            if (e[i] = W(this[i]), i === m.INSPECT_MAX_BYTES) {
              e[i + 1] = "...";
              break;
            }
          return "<Buffer " + e.join(" ") + ">";
        }, a.prototype.toArrayBuffer = function() {
          if (typeof Uint8Array > "u")
            throw new Error("Buffer.toArrayBuffer not supported in this browser");
          if (a._useTypedArrays)
            return new a(this).buffer;
          for (var e = new Uint8Array(this.length), r = 0, i = e.length; r < i; r += 1)
            e[r] = this[r];
          return e.buffer;
        };
        var T = a.prototype;
        function q(e, r, i) {
          return typeof e != "number" ? i : r <= (e = ~~e) ? r : 0 <= e || 0 <= (e += r) ? e : 0;
        }
        function z(e) {
          return (e = ~~Math.ceil(+e)) < 0 ? 0 : e;
        }
        function O(e) {
          return (Array.isArray || function(r) {
            return Object.prototype.toString.call(r) === "[object Array]";
          })(e);
        }
        function W(e) {
          return e < 16 ? "0" + e.toString(16) : e.toString(16);
        }
        function Z(e) {
          for (var r = [], i = 0; i < e.length; i++) {
            var _ = e.charCodeAt(i);
            if (_ <= 127)
              r.push(e.charCodeAt(i));
            else
              for (var v = i, L = (55296 <= _ && _ <= 57343 && i++, encodeURIComponent(e.slice(v, i + 1)).substr(1).split("%")), H = 0; H < L.length; H++)
                r.push(parseInt(L[H], 16));
          }
          return r;
        }
        function oe(e) {
          return w.toByteArray(e);
        }
        function ee(e, r, i, _) {
          for (var v = 0; v < _ && !(v + i >= r.length || v >= e.length); v++)
            r[v + i] = e[v];
          return v;
        }
        function ie(e) {
          try {
            return decodeURIComponent(e);
          } catch {
            return String.fromCharCode(65533);
          }
        }
        function ne(e, r) {
          S(typeof e == "number", "cannot write a non-number as a number"), S(0 <= e, "specified a negative value for writing an unsigned value"), S(e <= r, "value is larger than maximum value for type"), S(Math.floor(e) === e, "value has a fractional component");
        }
        function re(e, r, i) {
          S(typeof e == "number", "cannot write a non-number as a number"), S(e <= r, "value larger than maximum allowed value"), S(i <= e, "value smaller than minimum allowed value"), S(Math.floor(e) === e, "value has a fractional component");
        }
        function se(e, r, i) {
          S(typeof e == "number", "cannot write a non-number as a number"), S(e <= r, "value larger than maximum allowed value"), S(i <= e, "value smaller than minimum allowed value");
        }
        function S(e, r) {
          if (!e)
            throw new Error(r || "Failed assertion");
        }
        a._augment = function(e) {
          return e._isBuffer = !0, e._get = e.get, e._set = e.set, e.get = T.get, e.set = T.set, e.write = T.write, e.toString = T.toString, e.toLocaleString = T.toString, e.toJSON = T.toJSON, e.copy = T.copy, e.slice = T.slice, e.readUInt8 = T.readUInt8, e.readUInt16LE = T.readUInt16LE, e.readUInt16BE = T.readUInt16BE, e.readUInt32LE = T.readUInt32LE, e.readUInt32BE = T.readUInt32BE, e.readInt8 = T.readInt8, e.readInt16LE = T.readInt16LE, e.readInt16BE = T.readInt16BE, e.readInt32LE = T.readInt32LE, e.readInt32BE = T.readInt32BE, e.readFloatLE = T.readFloatLE, e.readFloatBE = T.readFloatBE, e.readDoubleLE = T.readDoubleLE, e.readDoubleBE = T.readDoubleBE, e.writeUInt8 = T.writeUInt8, e.writeUInt16LE = T.writeUInt16LE, e.writeUInt16BE = T.writeUInt16BE, e.writeUInt32LE = T.writeUInt32LE, e.writeUInt32BE = T.writeUInt32BE, e.writeInt8 = T.writeInt8, e.writeInt16LE = T.writeInt16LE, e.writeInt16BE = T.writeInt16BE, e.writeInt32LE = T.writeInt32LE, e.writeInt32BE = T.writeInt32BE, e.writeFloatLE = T.writeFloatLE, e.writeFloatBE = T.writeFloatBE, e.writeDoubleLE = T.writeDoubleLE, e.writeDoubleBE = T.writeDoubleBE, e.fill = T.fill, e.inspect = T.inspect, e.toArrayBuffer = T.toArrayBuffer, e;
        };
      }).call(this, c("lYpoI2"), typeof self < "u" ? self : typeof window < "u" ? window : {}, c("buffer").Buffer, arguments[3], arguments[4], arguments[5], arguments[6], "/node_modules/gulp-browserify/node_modules/buffer/index.js", "/node_modules/gulp-browserify/node_modules/buffer");
    }, { "base64-js": 2, buffer: 3, ieee754: 10, lYpoI2: 11 }], 4: [function(c, h, m) {
      (function(y, C, w, A, d, x, j, Y, D) {
        var w = c("buffer").Buffer, U = 4, a = new w(U);
        a.fill(0), h.exports = { hash: function(b, E, B, I) {
          for (var N = E(function(t, u) {
            t.length % U != 0 && (l = t.length + (U - t.length % U), t = w.concat([t, a], l));
            for (var l, M = [], F = u ? t.readInt32BE : t.readInt32LE, $ = 0; $ < t.length; $ += U)
              M.push(F.call(t, $));
            return M;
          }(b = w.isBuffer(b) ? b : new w(b), I), 8 * b.length), E = I, s = new w(B), f = E ? s.writeInt32BE : s.writeInt32LE, n = 0; n < N.length; n++)
            f.call(s, N[n], 4 * n, !0);
          return s;
        } };
      }).call(this, c("lYpoI2"), typeof self < "u" ? self : typeof window < "u" ? window : {}, c("buffer").Buffer, arguments[3], arguments[4], arguments[5], arguments[6], "/node_modules/gulp-browserify/node_modules/crypto-browserify/helpers.js", "/node_modules/gulp-browserify/node_modules/crypto-browserify");
    }, { buffer: 3, lYpoI2: 11 }], 5: [function(c, h, m) {
      (function(y, C, w, A, d, x, j, Y, D) {
        var w = c("buffer").Buffer, U = c("./sha"), a = c("./sha256"), b = c("./rng"), E = { sha1: U, sha256: a, md5: c("./md5") }, B = 64, I = new w(B);
        function N(t, u) {
          var l = E[t = t || "sha1"], M = [];
          return l || s("algorithm:", t, "is not yet supported"), { update: function(F) {
            return w.isBuffer(F) || (F = new w(F)), M.push(F), F.length, this;
          }, digest: function(F) {
            var $ = w.concat(M), $ = u ? function(T, q, z) {
              w.isBuffer(q) || (q = new w(q)), w.isBuffer(z) || (z = new w(z)), q.length > B ? q = T(q) : q.length < B && (q = w.concat([q, I], B));
              for (var O = new w(B), W = new w(B), Z = 0; Z < B; Z++)
                O[Z] = 54 ^ q[Z], W[Z] = 92 ^ q[Z];
              return z = T(w.concat([O, z])), T(w.concat([W, z]));
            }(l, u, $) : l($);
            return M = null, F ? $.toString(F) : $;
          } };
        }
        function s() {
          var t = [].slice.call(arguments).join(" ");
          throw new Error([t, "we accept pull requests", "http://github.com/dominictarr/crypto-browserify"].join(`
`));
        }
        I.fill(0), m.createHash = function(t) {
          return N(t);
        }, m.createHmac = N, m.randomBytes = function(t, u) {
          if (!u || !u.call)
            return new w(b(t));
          try {
            u.call(this, void 0, new w(b(t)));
          } catch (l) {
            u(l);
          }
        };
        var f, n = ["createCredentials", "createCipher", "createCipheriv", "createDecipher", "createDecipheriv", "createSign", "createVerify", "createDiffieHellman", "pbkdf2"], o = function(t) {
          m[t] = function() {
            s("sorry,", t, "is not implemented yet");
          };
        };
        for (f in n)
          o(n[f]);
      }).call(this, c("lYpoI2"), typeof self < "u" ? self : typeof window < "u" ? window : {}, c("buffer").Buffer, arguments[3], arguments[4], arguments[5], arguments[6], "/node_modules/gulp-browserify/node_modules/crypto-browserify/index.js", "/node_modules/gulp-browserify/node_modules/crypto-browserify");
    }, { "./md5": 6, "./rng": 7, "./sha": 8, "./sha256": 9, buffer: 3, lYpoI2: 11 }], 6: [function(c, h, m) {
      (function(y, C, k, A, d, x, j, Y, D) {
        var w = c("./helpers");
        function U(s, f) {
          s[f >> 5] |= 128 << f % 32, s[14 + (f + 64 >>> 9 << 4)] = f;
          for (var n = 1732584193, o = -271733879, t = -1732584194, u = 271733878, l = 0; l < s.length; l += 16) {
            var M = n, F = o, $ = t, T = u, n = b(n, o, t, u, s[l + 0], 7, -680876936), u = b(u, n, o, t, s[l + 1], 12, -389564586), t = b(t, u, n, o, s[l + 2], 17, 606105819), o = b(o, t, u, n, s[l + 3], 22, -1044525330);
            n = b(n, o, t, u, s[l + 4], 7, -176418897), u = b(u, n, o, t, s[l + 5], 12, 1200080426), t = b(t, u, n, o, s[l + 6], 17, -1473231341), o = b(o, t, u, n, s[l + 7], 22, -45705983), n = b(n, o, t, u, s[l + 8], 7, 1770035416), u = b(u, n, o, t, s[l + 9], 12, -1958414417), t = b(t, u, n, o, s[l + 10], 17, -42063), o = b(o, t, u, n, s[l + 11], 22, -1990404162), n = b(n, o, t, u, s[l + 12], 7, 1804603682), u = b(u, n, o, t, s[l + 13], 12, -40341101), t = b(t, u, n, o, s[l + 14], 17, -1502002290), n = E(n, o = b(o, t, u, n, s[l + 15], 22, 1236535329), t, u, s[l + 1], 5, -165796510), u = E(u, n, o, t, s[l + 6], 9, -1069501632), t = E(t, u, n, o, s[l + 11], 14, 643717713), o = E(o, t, u, n, s[l + 0], 20, -373897302), n = E(n, o, t, u, s[l + 5], 5, -701558691), u = E(u, n, o, t, s[l + 10], 9, 38016083), t = E(t, u, n, o, s[l + 15], 14, -660478335), o = E(o, t, u, n, s[l + 4], 20, -405537848), n = E(n, o, t, u, s[l + 9], 5, 568446438), u = E(u, n, o, t, s[l + 14], 9, -1019803690), t = E(t, u, n, o, s[l + 3], 14, -187363961), o = E(o, t, u, n, s[l + 8], 20, 1163531501), n = E(n, o, t, u, s[l + 13], 5, -1444681467), u = E(u, n, o, t, s[l + 2], 9, -51403784), t = E(t, u, n, o, s[l + 7], 14, 1735328473), n = B(n, o = E(o, t, u, n, s[l + 12], 20, -1926607734), t, u, s[l + 5], 4, -378558), u = B(u, n, o, t, s[l + 8], 11, -2022574463), t = B(t, u, n, o, s[l + 11], 16, 1839030562), o = B(o, t, u, n, s[l + 14], 23, -35309556), n = B(n, o, t, u, s[l + 1], 4, -1530992060), u = B(u, n, o, t, s[l + 4], 11, 1272893353), t = B(t, u, n, o, s[l + 7], 16, -155497632), o = B(o, t, u, n, s[l + 10], 23, -1094730640), n = B(n, o, t, u, s[l + 13], 4, 681279174), u = B(u, n, o, t, s[l + 0], 11, -358537222), t = B(t, u, n, o, s[l + 3], 16, -722521979), o = B(o, t, u, n, s[l + 6], 23, 76029189), n = B(n, o, t, u, s[l + 9], 4, -640364487), u = B(u, n, o, t, s[l + 12], 11, -421815835), t = B(t, u, n, o, s[l + 15], 16, 530742520), n = I(n, o = B(o, t, u, n, s[l + 2], 23, -995338651), t, u, s[l + 0], 6, -198630844), u = I(u, n, o, t, s[l + 7], 10, 1126891415), t = I(t, u, n, o, s[l + 14], 15, -1416354905), o = I(o, t, u, n, s[l + 5], 21, -57434055), n = I(n, o, t, u, s[l + 12], 6, 1700485571), u = I(u, n, o, t, s[l + 3], 10, -1894986606), t = I(t, u, n, o, s[l + 10], 15, -1051523), o = I(o, t, u, n, s[l + 1], 21, -2054922799), n = I(n, o, t, u, s[l + 8], 6, 1873313359), u = I(u, n, o, t, s[l + 15], 10, -30611744), t = I(t, u, n, o, s[l + 6], 15, -1560198380), o = I(o, t, u, n, s[l + 13], 21, 1309151649), n = I(n, o, t, u, s[l + 4], 6, -145523070), u = I(u, n, o, t, s[l + 11], 10, -1120210379), t = I(t, u, n, o, s[l + 2], 15, 718787259), o = I(o, t, u, n, s[l + 9], 21, -343485551), n = N(n, M), o = N(o, F), t = N(t, $), u = N(u, T);
          }
          return Array(n, o, t, u);
        }
        function a(s, f, n, o, t, u) {
          return N((f = N(N(f, s), N(o, u))) << t | f >>> 32 - t, n);
        }
        function b(s, f, n, o, t, u, l) {
          return a(f & n | ~f & o, s, f, t, u, l);
        }
        function E(s, f, n, o, t, u, l) {
          return a(f & o | n & ~o, s, f, t, u, l);
        }
        function B(s, f, n, o, t, u, l) {
          return a(f ^ n ^ o, s, f, t, u, l);
        }
        function I(s, f, n, o, t, u, l) {
          return a(n ^ (f | ~o), s, f, t, u, l);
        }
        function N(s, f) {
          var n = (65535 & s) + (65535 & f);
          return (s >> 16) + (f >> 16) + (n >> 16) << 16 | 65535 & n;
        }
        h.exports = function(s) {
          return w.hash(s, U, 16);
        };
      }).call(this, c("lYpoI2"), typeof self < "u" ? self : typeof window < "u" ? window : {}, c("buffer").Buffer, arguments[3], arguments[4], arguments[5], arguments[6], "/node_modules/gulp-browserify/node_modules/crypto-browserify/md5.js", "/node_modules/gulp-browserify/node_modules/crypto-browserify");
    }, { "./helpers": 4, buffer: 3, lYpoI2: 11 }], 7: [function(c, h, m) {
      (function(y, C, k, A, d, x, j, Y, D) {
        h.exports = function(w) {
          for (var U, a = new Array(w), b = 0; b < w; b++)
            (3 & b) == 0 && (U = 4294967296 * Math.random()), a[b] = U >>> ((3 & b) << 3) & 255;
          return a;
        };
      }).call(this, c("lYpoI2"), typeof self < "u" ? self : typeof window < "u" ? window : {}, c("buffer").Buffer, arguments[3], arguments[4], arguments[5], arguments[6], "/node_modules/gulp-browserify/node_modules/crypto-browserify/rng.js", "/node_modules/gulp-browserify/node_modules/crypto-browserify");
    }, { buffer: 3, lYpoI2: 11 }], 8: [function(c, h, m) {
      (function(y, C, k, A, d, x, j, Y, D) {
        var w = c("./helpers");
        function U(E, B) {
          E[B >> 5] |= 128 << 24 - B % 32, E[15 + (B + 64 >> 9 << 4)] = B;
          for (var I, N, s, f = Array(80), n = 1732584193, o = -271733879, t = -1732584194, u = 271733878, l = -1009589776, M = 0; M < E.length; M += 16) {
            for (var F = n, $ = o, T = t, q = u, z = l, O = 0; O < 80; O++) {
              f[O] = O < 16 ? E[M + O] : b(f[O - 3] ^ f[O - 8] ^ f[O - 14] ^ f[O - 16], 1);
              var W = a(a(b(n, 5), (W = o, N = t, s = u, (I = O) < 20 ? W & N | ~W & s : !(I < 40) && I < 60 ? W & N | W & s | N & s : W ^ N ^ s)), a(a(l, f[O]), (I = O) < 20 ? 1518500249 : I < 40 ? 1859775393 : I < 60 ? -1894007588 : -899497514)), l = u, u = t, t = b(o, 30), o = n, n = W;
            }
            n = a(n, F), o = a(o, $), t = a(t, T), u = a(u, q), l = a(l, z);
          }
          return Array(n, o, t, u, l);
        }
        function a(E, B) {
          var I = (65535 & E) + (65535 & B);
          return (E >> 16) + (B >> 16) + (I >> 16) << 16 | 65535 & I;
        }
        function b(E, B) {
          return E << B | E >>> 32 - B;
        }
        h.exports = function(E) {
          return w.hash(E, U, 20, !0);
        };
      }).call(this, c("lYpoI2"), typeof self < "u" ? self : typeof window < "u" ? window : {}, c("buffer").Buffer, arguments[3], arguments[4], arguments[5], arguments[6], "/node_modules/gulp-browserify/node_modules/crypto-browserify/sha.js", "/node_modules/gulp-browserify/node_modules/crypto-browserify");
    }, { "./helpers": 4, buffer: 3, lYpoI2: 11 }], 9: [function(c, h, m) {
      (function(y, C, k, A, d, x, j, Y, D) {
        function w(B, I) {
          var N = (65535 & B) + (65535 & I);
          return (B >> 16) + (I >> 16) + (N >> 16) << 16 | 65535 & N;
        }
        function U(B, I) {
          var N, s = new Array(1116352408, 1899447441, 3049323471, 3921009573, 961987163, 1508970993, 2453635748, 2870763221, 3624381080, 310598401, 607225278, 1426881987, 1925078388, 2162078206, 2614888103, 3248222580, 3835390401, 4022224774, 264347078, 604807628, 770255983, 1249150122, 1555081692, 1996064986, 2554220882, 2821834349, 2952996808, 3210313671, 3336571891, 3584528711, 113926993, 338241895, 666307205, 773529912, 1294757372, 1396182291, 1695183700, 1986661051, 2177026350, 2456956037, 2730485921, 2820302411, 3259730800, 3345764771, 3516065817, 3600352804, 4094571909, 275423344, 430227734, 506948616, 659060556, 883997877, 958139571, 1322822218, 1537002063, 1747873779, 1955562222, 2024104815, 2227730452, 2361852424, 2428436474, 2756734187, 3204031479, 3329325298), f = new Array(1779033703, 3144134277, 1013904242, 2773480762, 1359893119, 2600822924, 528734635, 1541459225), n = new Array(64);
          B[I >> 5] |= 128 << 24 - I % 32, B[15 + (I + 64 >> 9 << 4)] = I;
          for (var o, t, u = 0; u < B.length; u += 16) {
            for (var l = f[0], M = f[1], F = f[2], $ = f[3], T = f[4], q = f[5], z = f[6], O = f[7], W = 0; W < 64; W++)
              n[W] = W < 16 ? B[W + u] : w(w(w((t = n[W - 2], b(t, 17) ^ b(t, 19) ^ E(t, 10)), n[W - 7]), (t = n[W - 15], b(t, 7) ^ b(t, 18) ^ E(t, 3))), n[W - 16]), N = w(w(w(w(O, b(t = T, 6) ^ b(t, 11) ^ b(t, 25)), T & q ^ ~T & z), s[W]), n[W]), o = w(b(o = l, 2) ^ b(o, 13) ^ b(o, 22), l & M ^ l & F ^ M & F), O = z, z = q, q = T, T = w($, N), $ = F, F = M, M = l, l = w(N, o);
            f[0] = w(l, f[0]), f[1] = w(M, f[1]), f[2] = w(F, f[2]), f[3] = w($, f[3]), f[4] = w(T, f[4]), f[5] = w(q, f[5]), f[6] = w(z, f[6]), f[7] = w(O, f[7]);
          }
          return f;
        }
        var a = c("./helpers"), b = function(B, I) {
          return B >>> I | B << 32 - I;
        }, E = function(B, I) {
          return B >>> I;
        };
        h.exports = function(B) {
          return a.hash(B, U, 32, !0);
        };
      }).call(this, c("lYpoI2"), typeof self < "u" ? self : typeof window < "u" ? window : {}, c("buffer").Buffer, arguments[3], arguments[4], arguments[5], arguments[6], "/node_modules/gulp-browserify/node_modules/crypto-browserify/sha256.js", "/node_modules/gulp-browserify/node_modules/crypto-browserify");
    }, { "./helpers": 4, buffer: 3, lYpoI2: 11 }], 10: [function(c, h, m) {
      (function(y, C, k, A, d, x, j, Y, D) {
        m.read = function(w, U, a, b, u) {
          var B, I, N = 8 * u - b - 1, s = (1 << N) - 1, f = s >> 1, n = -7, o = a ? u - 1 : 0, t = a ? -1 : 1, u = w[U + o];
          for (o += t, B = u & (1 << -n) - 1, u >>= -n, n += N; 0 < n; B = 256 * B + w[U + o], o += t, n -= 8)
            ;
          for (I = B & (1 << -n) - 1, B >>= -n, n += b; 0 < n; I = 256 * I + w[U + o], o += t, n -= 8)
            ;
          if (B === 0)
            B = 1 - f;
          else {
            if (B === s)
              return I ? NaN : 1 / 0 * (u ? -1 : 1);
            I += Math.pow(2, b), B -= f;
          }
          return (u ? -1 : 1) * I * Math.pow(2, B - b);
        }, m.write = function(w, U, a, b, E, l) {
          var I, N, s = 8 * l - E - 1, f = (1 << s) - 1, n = f >> 1, o = E === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0, t = b ? 0 : l - 1, u = b ? 1 : -1, l = U < 0 || U === 0 && 1 / U < 0 ? 1 : 0;
          for (U = Math.abs(U), isNaN(U) || U === 1 / 0 ? (N = isNaN(U) ? 1 : 0, I = f) : (I = Math.floor(Math.log(U) / Math.LN2), U * (b = Math.pow(2, -I)) < 1 && (I--, b *= 2), 2 <= (U += 1 <= I + n ? o / b : o * Math.pow(2, 1 - n)) * b && (I++, b /= 2), f <= I + n ? (N = 0, I = f) : 1 <= I + n ? (N = (U * b - 1) * Math.pow(2, E), I += n) : (N = U * Math.pow(2, n - 1) * Math.pow(2, E), I = 0)); 8 <= E; w[a + t] = 255 & N, t += u, N /= 256, E -= 8)
            ;
          for (I = I << E | N, s += E; 0 < s; w[a + t] = 255 & I, t += u, I /= 256, s -= 8)
            ;
          w[a + t - u] |= 128 * l;
        };
      }).call(this, c("lYpoI2"), typeof self < "u" ? self : typeof window < "u" ? window : {}, c("buffer").Buffer, arguments[3], arguments[4], arguments[5], arguments[6], "/node_modules/gulp-browserify/node_modules/ieee754/index.js", "/node_modules/gulp-browserify/node_modules/ieee754");
    }, { buffer: 3, lYpoI2: 11 }], 11: [function(c, h, m) {
      (function(y, C, k, A, d, x, j, Y, D) {
        var w, U, a;
        function b() {
        }
        (y = h.exports = {}).nextTick = (U = typeof window < "u" && window.setImmediate, a = typeof window < "u" && window.postMessage && window.addEventListener, U ? function(E) {
          return window.setImmediate(E);
        } : a ? (w = [], window.addEventListener("message", function(E) {
          var B = E.source;
          B !== window && B !== null || E.data !== "process-tick" || (E.stopPropagation(), 0 < w.length && w.shift()());
        }, !0), function(E) {
          w.push(E), window.postMessage("process-tick", "*");
        }) : function(E) {
          setTimeout(E, 0);
        }), y.title = "browser", y.browser = !0, y.env = {}, y.argv = [], y.on = b, y.addListener = b, y.once = b, y.off = b, y.removeListener = b, y.removeAllListeners = b, y.emit = b, y.binding = function(E) {
          throw new Error("process.binding is not supported");
        }, y.cwd = function() {
          return "/";
        }, y.chdir = function(E) {
          throw new Error("process.chdir is not supported");
        };
      }).call(this, c("lYpoI2"), typeof self < "u" ? self : typeof window < "u" ? window : {}, c("buffer").Buffer, arguments[3], arguments[4], arguments[5], arguments[6], "/node_modules/gulp-browserify/node_modules/process/browser.js", "/node_modules/gulp-browserify/node_modules/process");
    }, { buffer: 3, lYpoI2: 11 }] }, {}, [1])(1);
  });
})(ue);
const ce = ue.exports, le = {
  name: "dsParse",
  version: 1,
  actions: {
    toWidget: {
      name: "toWidget",
      title: "Convert HTML to dsWidgets",
      params: {
        id: "string",
        rootElement: "object"
      }
    }
  },
  dependencies: [
    {
      name: "dsUtilities",
      version: 1
    }
  ],
  data: {
    components: {}
  },
  methods: {
    getTemplateLayoutIds({ template: g, sectionId: p }) {
      let c = [];
      for (let h = 0; h < g[p].layouts.length; h++) {
        const m = g[p].layouts[h];
        c.push(m);
      }
      for (let h = 0; h < g[p].elements.length; h++) {
        const m = g[p].elements, y = m[h].type;
        for (let C = 0; C < y.length; C++)
          if (y[C][0] === "section")
            for (let k = 0; k < m[h].value[C].length; k++) {
              const A = m[h].value[C][k][1];
              c = c.concat(this.getTemplateLayoutIds({ template: g, sectionId: A }));
            }
      }
      return c;
    },
    createModifier({ baseLayoutIds: g, baseLayouts: p, modifierLayoutIds: c, modifierLayouts: h }) {
      const m = {};
      for (let y = 0; y < c.length; y++) {
        const C = g[y], k = c[y];
        if (k !== C) {
          m[C] = {};
          for (let A = 0; A < p[C].length; A++) {
            const d = p[C][A], x = h[k][A];
            d.componentId !== x.componentId && (m[C][A] = x.componentId);
          }
        }
      }
      return m;
    },
    _baseWidget(g, p = {}) {
      const c = {
        metadata: p,
        widgets: {
          items: {},
          content: {}
        },
        elements: {
          attributes: {},
          used: {},
          value: {},
          type: {}
        },
        layouts: {
          items: {},
          head: {}
        },
        components: {}
      };
      return g && (delete c.widgets, c.template = {}), c;
    },
    _checkCondition(g, p) {
      const c = [];
      for (let h = 0; h < p.length; h++) {
        const m = p[h];
        let y = !0;
        Object.hasOwnProperty.call(g, m) || (y = !1), c.push(y);
      }
      return c;
    },
    _traverse(g, p, c = [], h = []) {
      let m;
      for (let y = 0; y < p.length; y++)
        if (g[p[y]]) {
          m = p[y];
          break;
        }
      if (m)
        if (Array.isArray(g[m])) {
          const y = g[m];
          for (let C = 0; C < y.length; C++) {
            const k = y[C];
            if (Array.isArray(k)) {
              let A = [];
              for (let d = 0; d < k.length; d++) {
                const x = k[d];
                A = this._checkCondition(x, c), A.includes(!0) && (h.unshift(x), this._traverse(x, p, c, h));
              }
            } else if (typeof k == "object" && this._checkCondition(k, c).includes(!0)) {
              let A;
              for (let d = 0; d < p.length; d++)
                if (k[p[d]]) {
                  A = p[d];
                  break;
                }
              if (Array.isArray(k[A]))
                for (let d = 0; d < k[A].length; d++) {
                  const x = k[A][d];
                  this._checkCondition(x, c).includes(!0) && (h.unshift(x), this._traverse(x, p, c, h));
                }
              else
                h.unshift(k), this._traverse(k, p, c, h);
            }
          }
        } else {
          const y = g[m];
          this._checkCondition(y, c).includes(!0) && (h.unshift(y), this._traverse(y, p, c, h));
        }
      return h.length || h.unshift(g), h;
    },
    _toParam(g, p, c, h = []) {
      const m = [], y = {};
      if (g.params && (g._$computedParams || g.values)) {
        const A = this._traverse(g, p, c);
        for (let d = 0; d < A.length; d++) {
          const x = A[d];
          if (m[d] = 1, d !== 0 && (x.params.params && x._$computed || x._$computedParams || x.values)) {
            const Y = d - 1;
            if (x.paramType === "object" || x.paramType === "array")
              for (let D = 0; D < x.params.length; D++)
                x.params[D].length > 1 ? x.params[D][1] = {
                  _$id: h[Y]
                } : x.params[D] = {
                  _$id: h[Y]
                }, ++m[d];
            else if (x.values)
              for (let D = 0; D < x.values.length; D++)
                x.values[D] = {
                  _$id: h[Y]
                }, ++m[d];
            else
              x.params = {
                _$id: h[Y]
              };
          }
          const j = this._createHash(x);
          h.push(j), y[j] = x;
        }
      }
      const C = { ...g };
      let k;
      for (let A = 0; A < p.length; A++)
        if (C[p[A]]) {
          k = p[A];
          break;
        }
      if (Array.isArray(C[k])) {
        let A = 1;
        for (let d = 0; d < C[k].length; d++)
          if (Array.isArray(C[k][d]))
            for (let x = 0; x < C[k][d].length; x++)
              typeof C[k][d][x] == "object" && (d > 0 && (A = A + m[d - 1]), C[k][d][x] = {
                _$id: h[h.length - A]
              });
          else
            typeof C[k][d] == "object" && (d > 0 && (A = A + m[d - 1]), C[k][d] = {
              _$id: h[h.length - A]
            });
      } else
        C.params = {
          _$id: h[h.length - 1]
        };
      return { item: C, params: y };
    },
    toActionSequence(g) {
      let p, c;
      g.actions && (p = this._toAction(g.actions)), g.conditions && (c = this._toAction(g.conditions));
      const h = {
        params: {},
        sequence: {}
      };
      return p && (h.actions = p.actions, h.params = p.params, h.sequence.actions = p.sequence), c && (h.conditions = c.actions, h.params = { ...h.params, ...c.params }, h.sequence.conditions = p.sequence), h.sequence.id = this._createHash(h.sequence), h;
    },
    _toAction(g, p = {}, c = {}, h = 0, m = {}) {
      const y = [];
      for (let C = 0; C < g.length; C++) {
        const k = g[C], { item: A, params: d } = this._toParam(k, ["params", "values"], ["_$computedParams", "_$computed"]);
        delete A.onSuccess, delete A.onError;
        const x = this._createHash(A), j = { _$id: x }, Y = `_${C}${h}`;
        if (p[x] = A, c = { ...c, ...d }, y.push(Y), k.onSuccess) {
          const D = this._toAction(k.onSuccess, p, c, ++h, m);
          j.onSuccess = D.entries;
        }
        if (k.onError) {
          const D = this._toAction(k.onError, p, c, ++h, m);
          j.onError = D.entries;
        }
        m[Y] = j, h === 0 && (m.entry = y);
      }
      return { actions: p, params: c, sequence: m, entries: y };
    },
    toWidget({
      data: g,
      sectionId: p = this.$method("dsUtilities/generateId"),
      groupId: c = this.$method("dsUtilities/generateId"),
      rootElement: h,
      view: m = "default",
      isTemplate: y,
      isHead: C = !0,
      metadata: k
    }) {
      g || (g = this._baseWidget(y, k));
      let A = !1, d = h.childNodes || [];
      C ? g.templateEntry = p : g.childSectionId = p, h.getAttribute instanceof Function && (A = !!h.getAttribute("ds-widget-section") || !!h.getAttribute("ds-widget")), A ? (h.removeAttribute("ds-widget"), d = [h]) : c = this.$method("dsUtilities/generateId");
      const x = this.$method("dsUtilities/generateId"), j = this._toLayout(
        g,
        p,
        x,
        c,
        d,
        [],
        m === "default",
        y,
        m
      );
      if (!y)
        return g.widgets.items[p] || (g.widgets.items[p] = []), g.widgets.items[p].push({
          groupId: c,
          instanceId: x,
          layout: {
            [m]: j.id
          }
        }), g.widgets.content[p + x + "_" + m] = g.elements.used[x], g;
      g.template[p] || (g.template[p] = {
        events: {},
        layouts: [],
        elements: {}
      });
      const Y = g.template[p], D = Y.layouts.length;
      Object.values(j.events).length && (Y.events[D] = j.events), Y.layouts.push(j.id);
      const w = g.elements.used[x] || [];
      for (let U = 0; U < w.length; U++) {
        const a = w[U];
        Y.elements[D] || (Y.elements[D] = []), Y.elements[D].push({
          value: g.elements.value[a],
          type: g.elements.type[a]
        });
      }
      return g;
    },
    _toLayout(g, p, c, h, m, y = [], C, k, A, d = [], x = !0, j = 0) {
      const Y = [];
      let D = {}, w = [];
      for (let U = 0; U < m.length; U++) {
        const a = m[U];
        if (a.tagName || a.constructor.name === "Text" && a.textContent.trim()) {
          const b = this._toComponent(g, p, c, h, a, C, k, A), E = { componentId: b.id };
          if (b.hasContent) {
            const I = g.elements.used[c] && g.elements.used[c].length;
            E.contentIndex = I - 1;
          }
          b.events && (D[j] = b.events), x && Y.push(w.length);
          const B = y.indexOf(a.parentElement);
          if (B > -1 && (E.parentIndex = B), y.push(a), w.push(E), ++j, a.tagName && a.hasAttribute("ds-widget-section")) {
            const I = this.$method("dsUtilities/generateId");
            d.push({
              sectionId: I,
              contentIndex: E.contentIndex
            });
            for (let N = 0; N < a.children.length; N++) {
              const s = a.children[N];
              s.tagName && !s.hasAttribute("ds-widget-section") && s.setAttribute("ds-widget", "true"), this.toWidget({
                data: g,
                sectionId: I,
                groupId: h,
                rootElement: s,
                isTemplate: k,
                view: A,
                isHead: !1
              });
            }
          } else if (a.childNodes.length && !b.hasWidget && b.hasChildren) {
            const I = this._toLayout(
              g,
              p,
              c,
              h,
              a.childNodes,
              y,
              C,
              k,
              A,
              d,
              !1,
              j
            );
            d = d.concat(I.instances), j = I.index, w = w.concat(I.items), D = { ...D, ...I.events };
          }
        }
      }
      if (x) {
        for (let a = 0; a < d.length; a++) {
          const b = d[a], E = g.elements.used[c][b.contentIndex];
          let B = { default: b.sectionId };
          k && (B = [["default", b.sectionId]]), g.elements.value[E] = B;
        }
        for (let a = 0; a < w.length; a++) {
          const b = w[a];
          if (Object.prototype.hasOwnProperty.call(b, "parentIndex")) {
            const E = b.parentIndex;
            Object.prototype.hasOwnProperty.call(w[E], "children") ? w[E].children.push(a) : w[E].children = [a];
          }
        }
        const U = this._createHash(w);
        return g.layouts.items[U] = w, Y.length > 1 && (g.layouts.head[U] = Y), { items: w, head: Y, id: U, sectionId: p, events: D, index: j };
      }
      return { items: w, head: Y, sectionId: p, instances: d, events: D, index: j };
    },
    _elementKey(g) {
      const p = g.split("-");
      p.shift();
      const c = p.length - 1;
      return p[c] ? p : null;
    },
    _toElement(g, p, c, h) {
      const m = this.$method("dsUtilities/generateId"), y = {
        metadata: {},
        value: {},
        attributes: {}
      };
      g.elements.used[p] || (g.elements.used[p] = []);
      for (let C = 0; C < c.length; C++) {
        const [k, A] = c[C], d = this._elementKey(k);
        if (d)
          if (d.length === 3) {
            const x = m + "/" + d[1];
            y[d[0]][x] || (y[d[0]][x] = {}), y[d[0]][x][d[1]] = A;
          } else
            d.length === 2 ? (y[d[0]] || (y[d[0]] = {}), d[0] === "metadata" ? y[d[0]][d[1]] = [A, h] : y[d[0]][d[1]] = A) : (y[d[0]] || (y[d[0]] = {}), y[d[0]] = A);
      }
      g.elements.used[p].push(m), g.elements.value[m] = { default: y.value }, g.elements.type[m] = y.metadata.type, g.elements.attributes = { ...g.elements.attributes, ...y.attributes };
    },
    _createHash(g) {
      let p = ce(g, { algorithm: "md5", encoding: "base64" }), c = "";
      p = p.substring(0, p.length - 2);
      for (let h = 0; h < p.length; h++) {
        const m = p[h];
        m === "+" ? c += "$" : m === "/" ? c += "_" : c += m;
      }
      return "_" + c;
    },
    _elementContent(g, p) {
      const c = this.$component(g), h = [];
      if (c && c.getter) {
        let m;
        for (let y = 0; y < c.getter.length; y++) {
          const C = c.getter[y];
          m = this[`_getNodeValueBy/${C.type}`](p, C.value);
        }
        h.push(["ds-metadata-type", c.type]), h.push(["ds-value", m]);
      }
      return h;
    },
    "_getNodeContent/attribute"(g, p) {
      if (typeof setter == "string")
        return g.getAttribute(p);
      const c = {};
      for (let h = 0; h < p.length; h++) {
        const { name: m, key: y } = p[h];
        c[y] = g.setAttribute(m);
      }
      return c;
    },
    "_getNodeContent/getter"(g, p) {
      if (typeof p == "string")
        return g.__lookupGetter__(p) ? g[p] : "";
      {
        const c = {};
        for (let h = 0; h < p.length; h++) {
          const { name: m, key: y } = p[h];
          g.__lookupGetter__(p) ? c[y] = g[m] : c[y] = "";
        }
        return c;
      }
    },
    _parseText(g) {
      if (g === "[empty]")
        return {
          text: "",
          token: !1
        };
      const p = /\[(.+)\]/, c = new RegExp(p, "g").test(g);
      return { text: g, token: c };
    },
    _toComponent(g, p, c, h, m, y, C, k) {
      const A = { attributes: {} }, d = m.attributes || {};
      let x = {}, j = [], Y = !1, D = !1, w = !1, U = !!m.childNodes.length;
      if (m.tagName) {
        const a = m.tagName.toLowerCase(), b = this._elementContent(a, m);
        A.id = a, b.length && (j = j.concat(b), D = !0);
      } else {
        const a = this._parseText(m.textContent);
        D = !0, A.id = "text", j.push(["ds-metadata-type", "text"]), j.push(["ds-value", a]);
      }
      if (d.constructor.name === "NamedNodeMap")
        for (let a = 0; a < d.length; a++) {
          const b = d[a], [E, B] = this._attachAttribute(
            g,
            b.name,
            b.value,
            D,
            w,
            U,
            Y,
            m,
            a
          );
          E.event && (x = { ...x, ...E.event }), D = E.hasContent, w = E.hasWidget, U = E.hasChildren, Y = E.hasAttributes, A.attributes = { ...A.attributes, ...E.attributes }, j = [...j, ...E.setAttributes], a = B;
        }
      if (w === "ds-widget") {
        m.removeAttribute("ds-widget");
        const a = this.toWidget({ data: g, rootElement: m, groupId: h, isTemporary: y, isTemplate: C, view: k, isHead: !1 });
        j.push(["ds-metadata-type", "section"]), j.push(["ds-value", { default: a.childSectionId }]);
      }
      return j.length && this._toElement(g, c, j, y), Y || delete A.attributes, { id: this._addComponent(g, A), hasContent: D, hasWidget: w, hasChildren: U, events: x };
    },
    _attachAttribute(g, p, c, h, m, y, C, k, A) {
      const d = {
        hasContent: h,
        hasWidget: m,
        hasChildren: y,
        hasAttributes: C,
        attributes: {},
        setAttributes: []
      };
      if (p.startsWith("@")) {
        let x = c.split(" ");
        return g.metadata.actions && (x = x.map((j) => g.metadata.actions[j] || j)), d.event = {
          on: p.substring(1),
          action: x
        }, --A, k.removeAttribute(p), [d, A];
      }
      return p === "ds-content-html" ? (h || (d.setAttributes.push(["ds-metadata-type", "html"]), d.setAttributes.push(["ds-value", k.innerHTML]), d.hasContent = !0, d.hasChildren = !1), --A, k.removeAttribute(p), [d, A]) : p === "ds-widget" ? (h || (d.hasWidget = p, d.hasContent = !0), [d, A]) : p === "ds-widget-section" ? (h || (d.setAttributes.push(["ds-metadata-type", "section"]), d.setAttributes.push(["ds-value", ""]), d.hasWidget = p, d.hasContent = !0), [d, A]) : (p === "class" ? d.attributes[p] = this._sortClassName(c) : d.attributes[p] = c, d.hasAttributes = !0, [d, A]);
    },
    _addComponent(g, p) {
      const c = this._createHash(p);
      return this.components[c] || (g.components[c] = p), c;
    },
    _sortClassName(g) {
      return g.split(" ").sort().join(" ");
    }
  }
};
export {
  le as default
};
