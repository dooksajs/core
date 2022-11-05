function te(x) {
  throw new Error('Could not dynamically require "' + x + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
}
var ue = { exports: {} };
(function(x, h) {
  (function(c) {
    x.exports = c();
  })(function() {
    return function c(m, f, g) {
      function M(p, I) {
        if (!f[p]) {
          if (!m[p]) {
            var k = typeof te == "function" && te;
            if (!I && k)
              return k(p, !0);
            if (C)
              return C(p, !0);
            throw new Error("Cannot find module '" + p + "'");
          }
          I = f[p] = { exports: {} }, m[p][0].call(I.exports, function(W) {
            var Y = m[p][1][W];
            return M(Y || W);
          }, I, I.exports, c, m, f, g);
        }
        return f[p].exports;
      }
      for (var C = typeof te == "function" && te, L = 0; L < g.length; L++)
        M(g[L]);
      return M;
    }({ 1: [function(c, m, f) {
      (function(g, M, C, L, p, I, k, W, Y) {
        var y = c("crypto");
        function j(s, d) {
          d = E(s, d);
          var n;
          return (n = d.algorithm !== "passthrough" ? y.createHash(d.algorithm) : new F()).write === void 0 && (n.write = n.update, n.end = n.update), v(d, n).dispatch(s), n.update || n.end(""), n.digest ? n.digest(d.encoding === "buffer" ? void 0 : d.encoding) : (s = n.read(), d.encoding !== "buffer" ? s.toString(d.encoding) : s);
        }
        (f = m.exports = j).sha1 = function(s) {
          return j(s);
        }, f.keys = function(s) {
          return j(s, { excludeValues: !0, algorithm: "sha1", encoding: "hex" });
        }, f.MD5 = function(s) {
          return j(s, { algorithm: "md5", encoding: "hex" });
        }, f.keysMD5 = function(s) {
          return j(s, { algorithm: "md5", encoding: "hex", excludeValues: !0 });
        };
        var u = y.getHashes ? y.getHashes().slice() : ["sha1", "md5"], b = (u.push("passthrough"), ["buffer", "hex", "binary", "base64"]);
        function E(s, d) {
          var n = {};
          if (n.algorithm = (d = d || {}).algorithm || "sha1", n.encoding = d.encoding || "hex", n.excludeValues = !!d.excludeValues, n.algorithm = n.algorithm.toLowerCase(), n.encoding = n.encoding.toLowerCase(), n.ignoreUnknown = d.ignoreUnknown === !0, n.respectType = d.respectType !== !1, n.respectFunctionNames = d.respectFunctionNames !== !1, n.respectFunctionProperties = d.respectFunctionProperties !== !1, n.unorderedArrays = d.unorderedArrays === !0, n.unorderedSets = d.unorderedSets !== !1, n.unorderedObjects = d.unorderedObjects !== !1, n.replacer = d.replacer || void 0, n.excludeKeys = d.excludeKeys || void 0, s === void 0)
            throw new Error("Object argument required.");
          for (var o = 0; o < u.length; ++o)
            u[o].toLowerCase() === n.algorithm.toLowerCase() && (n.algorithm = u[o]);
          if (u.indexOf(n.algorithm) === -1)
            throw new Error('Algorithm "' + n.algorithm + '"  not supported. supported values: ' + u.join(", "));
          if (b.indexOf(n.encoding) === -1 && n.algorithm !== "passthrough")
            throw new Error('Encoding "' + n.encoding + '"  not supported. supported values: ' + b.join(", "));
          return n;
        }
        function A(s) {
          if (typeof s == "function")
            return /^function\s+\w*\s*\(\s*\)\s*{\s+\[native code\]\s+}$/i.exec(Function.prototype.toString.call(s)) != null;
        }
        function v(s, d, n) {
          n = n || [];
          function o(t) {
            return d.update ? d.update(t, "utf8") : d.write(t, "utf8");
          }
          return { dispatch: function(t) {
            return this["_" + ((t = s.replacer ? s.replacer(t) : t) === null ? "null" : typeof t)](t);
          }, _object: function(t) {
            var a, l = Object.prototype.toString.call(t), T = /\[object (.*)\]/i.exec(l);
            if (T = (T = T ? T[1] : "unknown:[" + l + "]").toLowerCase(), 0 <= (l = n.indexOf(t)))
              return this.dispatch("[CIRCULAR:" + l + "]");
            if (n.push(t), C !== void 0 && C.isBuffer && C.isBuffer(t))
              return o("buffer:"), o(t);
            if (T === "object" || T === "function" || T === "asyncfunction")
              return l = Object.keys(t), s.unorderedObjects && (l = l.sort()), s.respectType === !1 || A(t) || l.splice(0, 0, "prototype", "__proto__", "constructor"), s.excludeKeys && (l = l.filter(function(U) {
                return !s.excludeKeys(U);
              })), o("object:" + l.length + ":"), a = this, l.forEach(function(U) {
                a.dispatch(U), o(":"), s.excludeValues || a.dispatch(t[U]), o(",");
              });
            if (!this["_" + T]) {
              if (s.ignoreUnknown)
                return o("[" + T + "]");
              throw new Error('Unknown object type "' + T + '"');
            }
            this["_" + T](t);
          }, _array: function(t, U) {
            U = U !== void 0 ? U : s.unorderedArrays !== !1;
            var l = this;
            if (o("array:" + t.length + ":"), !U || t.length <= 1)
              return t.forEach(function($) {
                return l.dispatch($);
              });
            var T = [], U = t.map(function($) {
              var N = new F(), q = n.slice();
              return v(s, N, q).dispatch($), T = T.concat(q.slice(n.length)), N.read().toString();
            });
            return n = n.concat(T), U.sort(), this._array(U, !1);
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
            o("fn:"), A(t) ? this.dispatch("[native]") : this.dispatch(t.toString()), s.respectFunctionNames !== !1 && this.dispatch("function-name:" + String(t.name)), s.respectFunctionProperties && this._object(t);
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
        function F() {
          return { buf: "", write: function(s) {
            this.buf += s;
          }, end: function(s) {
            this.buf += s;
          }, read: function() {
            return this.buf;
          } };
        }
        f.writeToStream = function(s, d, n) {
          return n === void 0 && (n = d, d = {}), v(d = E(s, d), n).dispatch(s);
        };
      }).call(this, c("lYpoI2"), typeof self < "u" ? self : typeof window < "u" ? window : {}, c("buffer").Buffer, arguments[3], arguments[4], arguments[5], arguments[6], "/fake_9a5aa49d.js", "/");
    }, { buffer: 3, crypto: 5, lYpoI2: 11 }], 2: [function(c, m, f) {
      (function(g, M, C, L, p, I, k, W, Y) {
        (function(y) {
          var j = typeof Uint8Array < "u" ? Uint8Array : Array, u = "+".charCodeAt(0), b = "/".charCodeAt(0), E = "0".charCodeAt(0), A = "a".charCodeAt(0), v = "A".charCodeAt(0), F = "-".charCodeAt(0), s = "_".charCodeAt(0);
          function d(n) {
            return n = n.charCodeAt(0), n === u || n === F ? 62 : n === b || n === s ? 63 : n < E ? -1 : n < E + 10 ? n - E + 26 + 26 : n < v + 26 ? n - v : n < A + 26 ? n - A + 26 : void 0;
          }
          y.toByteArray = function(n) {
            var o, t;
            if (0 < n.length % 4)
              throw new Error("Invalid string. Length must be a multiple of 4");
            var a = n.length, a = n.charAt(a - 2) === "=" ? 2 : n.charAt(a - 1) === "=" ? 1 : 0, l = new j(3 * n.length / 4 - a), T = 0 < a ? n.length - 4 : n.length, U = 0;
            function $(N) {
              l[U++] = N;
            }
            for (o = 0; o < T; o += 4, 0)
              $((16711680 & (t = d(n.charAt(o)) << 18 | d(n.charAt(o + 1)) << 12 | d(n.charAt(o + 2)) << 6 | d(n.charAt(o + 3)))) >> 16), $((65280 & t) >> 8), $(255 & t);
            return a == 2 ? $(255 & (t = d(n.charAt(o)) << 2 | d(n.charAt(o + 1)) >> 4)) : a == 1 && ($((t = d(n.charAt(o)) << 10 | d(n.charAt(o + 1)) << 4 | d(n.charAt(o + 2)) >> 2) >> 8 & 255), $(255 & t)), l;
          }, y.fromByteArray = function(n) {
            var o, t, a, l, T = n.length % 3, U = "";
            function $(N) {
              return "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(N);
            }
            for (o = 0, a = n.length - T; o < a; o += 3)
              t = (n[o] << 16) + (n[o + 1] << 8) + n[o + 2], U += $((l = t) >> 18 & 63) + $(l >> 12 & 63) + $(l >> 6 & 63) + $(63 & l);
            switch (T) {
              case 1:
                U = (U += $((t = n[n.length - 1]) >> 2)) + $(t << 4 & 63) + "==";
                break;
              case 2:
                U = (U = (U += $((t = (n[n.length - 2] << 8) + n[n.length - 1]) >> 10)) + $(t >> 4 & 63)) + $(t << 2 & 63) + "=";
            }
            return U;
          };
        })(f === void 0 ? this.base64js = {} : f);
      }).call(this, c("lYpoI2"), typeof self < "u" ? self : typeof window < "u" ? window : {}, c("buffer").Buffer, arguments[3], arguments[4], arguments[5], arguments[6], "/node_modules/gulp-browserify/node_modules/base64-js/lib/b64.js", "/node_modules/gulp-browserify/node_modules/base64-js/lib");
    }, { buffer: 3, lYpoI2: 11 }], 3: [function(c, m, f) {
      (function(g, M, u, L, p, I, k, W, Y) {
        var y = c("base64-js"), j = c("ieee754");
        function u(e, r, i) {
          if (!(this instanceof u))
            return new u(e, r, i);
          var _, w, S, H, P = typeof e;
          if (r === "base64" && P == "string")
            for (e = (H = e).trim ? H.trim() : H.replace(/^\s+|\s+$/g, ""); e.length % 4 != 0; )
              e += "=";
          if (P == "number")
            _ = G(e);
          else if (P == "string")
            _ = u.byteLength(e, r);
          else {
            if (P != "object")
              throw new Error("First argument needs to be a number, array or string.");
            _ = G(e.length);
          }
          if (u._useTypedArrays ? w = u._augment(new Uint8Array(_)) : ((w = this).length = _, w._isBuffer = !0), u._useTypedArrays && typeof e.byteLength == "number")
            w._set(e);
          else if (O(H = e) || u.isBuffer(H) || H && typeof H == "object" && typeof H.length == "number")
            for (S = 0; S < _; S++)
              u.isBuffer(e) ? w[S] = e.readUInt8(S) : w[S] = e[S];
          else if (P == "string")
            w.write(e, 0, r);
          else if (P == "number" && !u._useTypedArrays && !i)
            for (S = 0; S < _; S++)
              w[S] = 0;
          return w;
        }
        function b(e, r, i, _) {
          return u._charsWritten = ee(function(w) {
            for (var S = [], H = 0; H < w.length; H++)
              S.push(255 & w.charCodeAt(H));
            return S;
          }(r), e, i, _);
        }
        function E(e, r, i, _) {
          return u._charsWritten = ee(function(w) {
            for (var S, H, P = [], K = 0; K < w.length; K++)
              H = w.charCodeAt(K), S = H >> 8, H = H % 256, P.push(H), P.push(S);
            return P;
          }(r), e, i, _);
        }
        function A(e, r, i) {
          var _ = "";
          i = Math.min(e.length, i);
          for (var w = r; w < i; w++)
            _ += String.fromCharCode(e[w]);
          return _;
        }
        function v(e, r, i, S) {
          S || (B(typeof i == "boolean", "missing or invalid endian"), B(r != null, "missing offset"), B(r + 1 < e.length, "Trying to read beyond buffer length"));
          var w, S = e.length;
          if (!(S <= r))
            return i ? (w = e[r], r + 1 < S && (w |= e[r + 1] << 8)) : (w = e[r] << 8, r + 1 < S && (w |= e[r + 1])), w;
        }
        function F(e, r, i, S) {
          S || (B(typeof i == "boolean", "missing or invalid endian"), B(r != null, "missing offset"), B(r + 3 < e.length, "Trying to read beyond buffer length"));
          var w, S = e.length;
          if (!(S <= r))
            return i ? (r + 2 < S && (w = e[r + 2] << 16), r + 1 < S && (w |= e[r + 1] << 8), w |= e[r], r + 3 < S && (w += e[r + 3] << 24 >>> 0)) : (r + 1 < S && (w = e[r + 1] << 16), r + 2 < S && (w |= e[r + 2] << 8), r + 3 < S && (w |= e[r + 3]), w += e[r] << 24 >>> 0), w;
        }
        function s(e, r, i, _) {
          if (_ || (B(typeof i == "boolean", "missing or invalid endian"), B(r != null, "missing offset"), B(r + 1 < e.length, "Trying to read beyond buffer length")), !(e.length <= r))
            return _ = v(e, r, i, !0), 32768 & _ ? -1 * (65535 - _ + 1) : _;
        }
        function d(e, r, i, _) {
          if (_ || (B(typeof i == "boolean", "missing or invalid endian"), B(r != null, "missing offset"), B(r + 3 < e.length, "Trying to read beyond buffer length")), !(e.length <= r))
            return _ = F(e, r, i, !0), 2147483648 & _ ? -1 * (4294967295 - _ + 1) : _;
        }
        function n(e, r, i, _) {
          return _ || (B(typeof i == "boolean", "missing or invalid endian"), B(r + 3 < e.length, "Trying to read beyond buffer length")), j.read(e, r, i, 23, 4);
        }
        function o(e, r, i, _) {
          return _ || (B(typeof i == "boolean", "missing or invalid endian"), B(r + 7 < e.length, "Trying to read beyond buffer length")), j.read(e, r, i, 52, 8);
        }
        function t(e, r, i, _, w) {
          if (w || (B(r != null, "missing value"), B(typeof _ == "boolean", "missing or invalid endian"), B(i != null, "missing offset"), B(i + 1 < e.length, "trying to write beyond buffer length"), ne(r, 65535)), w = e.length, !(w <= i))
            for (var S = 0, H = Math.min(w - i, 2); S < H; S++)
              e[i + S] = (r & 255 << 8 * (_ ? S : 1 - S)) >>> 8 * (_ ? S : 1 - S);
        }
        function a(e, r, i, _, w) {
          if (w || (B(r != null, "missing value"), B(typeof _ == "boolean", "missing or invalid endian"), B(i != null, "missing offset"), B(i + 3 < e.length, "trying to write beyond buffer length"), ne(r, 4294967295)), w = e.length, !(w <= i))
            for (var S = 0, H = Math.min(w - i, 4); S < H; S++)
              e[i + S] = r >>> 8 * (_ ? S : 3 - S) & 255;
        }
        function l(e, r, i, _, w) {
          w || (B(r != null, "missing value"), B(typeof _ == "boolean", "missing or invalid endian"), B(i != null, "missing offset"), B(i + 1 < e.length, "Trying to write beyond buffer length"), re(r, 32767, -32768)), e.length <= i || t(e, 0 <= r ? r : 65535 + r + 1, i, _, w);
        }
        function T(e, r, i, _, w) {
          w || (B(r != null, "missing value"), B(typeof _ == "boolean", "missing or invalid endian"), B(i != null, "missing offset"), B(i + 3 < e.length, "Trying to write beyond buffer length"), re(r, 2147483647, -2147483648)), e.length <= i || a(e, 0 <= r ? r : 4294967295 + r + 1, i, _, w);
        }
        function U(e, r, i, _, w) {
          w || (B(r != null, "missing value"), B(typeof _ == "boolean", "missing or invalid endian"), B(i != null, "missing offset"), B(i + 3 < e.length, "Trying to write beyond buffer length"), se(r, 34028234663852886e22, -34028234663852886e22)), e.length <= i || j.write(e, r, i, _, 23, 4);
        }
        function $(e, r, i, _, w) {
          w || (B(r != null, "missing value"), B(typeof _ == "boolean", "missing or invalid endian"), B(i != null, "missing offset"), B(i + 7 < e.length, "Trying to write beyond buffer length"), se(r, 17976931348623157e292, -17976931348623157e292)), e.length <= i || j.write(e, r, i, _, 52, 8);
        }
        f.Buffer = u, f.SlowBuffer = u, f.INSPECT_MAX_BYTES = 50, u.poolSize = 8192, u._useTypedArrays = function() {
          try {
            var e = new ArrayBuffer(0), r = new Uint8Array(e);
            return r.foo = function() {
              return 42;
            }, r.foo() === 42 && typeof r.subarray == "function";
          } catch {
            return !1;
          }
        }(), u.isEncoding = function(e) {
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
        }, u.isBuffer = function(e) {
          return !(e == null || !e._isBuffer);
        }, u.byteLength = function(e, r) {
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
        }, u.concat = function(e, r) {
          if (B(O(e), `Usage: Buffer.concat(list, [totalLength])
list should be an Array.`), e.length === 0)
            return new u(0);
          if (e.length === 1)
            return e[0];
          if (typeof r != "number")
            for (w = r = 0; w < e.length; w++)
              r += e[w].length;
          for (var i = new u(r), _ = 0, w = 0; w < e.length; w++) {
            var S = e[w];
            S.copy(i, _), _ += S.length;
          }
          return i;
        }, u.prototype.write = function(e, r, i, _) {
          isFinite(r) ? isFinite(i) || (_ = i, i = void 0) : (K = _, _ = r, r = i, i = K), r = Number(r) || 0;
          var w, S, H, P, K = this.length - r;
          switch ((!i || K < (i = Number(i))) && (i = K), _ = String(_ || "utf8").toLowerCase()) {
            case "hex":
              w = function(X, J, Q, z) {
                Q = Number(Q) || 0;
                var R = X.length - Q;
                (!z || R < (z = Number(z))) && (z = R), B((R = J.length) % 2 == 0, "Invalid hex string"), R / 2 < z && (z = R / 2);
                for (var V = 0; V < z; V++) {
                  var ae = parseInt(J.substr(2 * V, 2), 16);
                  B(!isNaN(ae), "Invalid hex string"), X[Q + V] = ae;
                }
                return u._charsWritten = 2 * V, V;
              }(this, e, r, i);
              break;
            case "utf8":
            case "utf-8":
              S = this, H = r, P = i, w = u._charsWritten = ee(Z(e), S, H, P);
              break;
            case "ascii":
            case "binary":
              w = b(this, e, r, i);
              break;
            case "base64":
              S = this, H = r, P = i, w = u._charsWritten = ee(oe(e), S, H, P);
              break;
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
              w = E(this, e, r, i);
              break;
            default:
              throw new Error("Unknown encoding");
          }
          return w;
        }, u.prototype.toString = function(e, r, i) {
          var _, w, S, H, P = this;
          if (e = String(e || "utf8").toLowerCase(), r = Number(r) || 0, (i = i !== void 0 ? Number(i) : P.length) === r)
            return "";
          switch (e) {
            case "hex":
              _ = function(K, X, J) {
                var Q = K.length;
                (!X || X < 0) && (X = 0), (!J || J < 0 || Q < J) && (J = Q);
                for (var z = "", R = X; R < J; R++)
                  z += D(K[R]);
                return z;
              }(P, r, i);
              break;
            case "utf8":
            case "utf-8":
              _ = function(K, X, J) {
                var Q = "", z = "";
                J = Math.min(K.length, J);
                for (var R = X; R < J; R++)
                  K[R] <= 127 ? (Q += ie(z) + String.fromCharCode(K[R]), z = "") : z += "%" + K[R].toString(16);
                return Q + ie(z);
              }(P, r, i);
              break;
            case "ascii":
            case "binary":
              _ = A(P, r, i);
              break;
            case "base64":
              w = P, H = i, _ = (S = r) === 0 && H === w.length ? y.fromByteArray(w) : y.fromByteArray(w.slice(S, H));
              break;
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
              _ = function(K, X, J) {
                for (var Q = K.slice(X, J), z = "", R = 0; R < Q.length; R += 2)
                  z += String.fromCharCode(Q[R] + 256 * Q[R + 1]);
                return z;
              }(P, r, i);
              break;
            default:
              throw new Error("Unknown encoding");
          }
          return _;
        }, u.prototype.toJSON = function() {
          return { type: "Buffer", data: Array.prototype.slice.call(this._arr || this, 0) };
        }, u.prototype.copy = function(e, r, i, _) {
          if (r = r || 0, (_ = _ || _ === 0 ? _ : this.length) !== (i = i || 0) && e.length !== 0 && this.length !== 0) {
            B(i <= _, "sourceEnd < sourceStart"), B(0 <= r && r < e.length, "targetStart out of bounds"), B(0 <= i && i < this.length, "sourceStart out of bounds"), B(0 <= _ && _ <= this.length, "sourceEnd out of bounds"), _ > this.length && (_ = this.length);
            var w = (_ = e.length - r < _ - i ? e.length - r + i : _) - i;
            if (w < 100 || !u._useTypedArrays)
              for (var S = 0; S < w; S++)
                e[S + r] = this[S + i];
            else
              e._set(this.subarray(i, i + w), r);
          }
        }, u.prototype.slice = function(e, r) {
          var i = this.length;
          if (e = q(e, i, 0), r = q(r, i, i), u._useTypedArrays)
            return u._augment(this.subarray(e, r));
          for (var _ = r - e, w = new u(_, void 0, !0), S = 0; S < _; S++)
            w[S] = this[S + e];
          return w;
        }, u.prototype.get = function(e) {
          return console.log(".get() is deprecated. Access using array indexes instead."), this.readUInt8(e);
        }, u.prototype.set = function(e, r) {
          return console.log(".set() is deprecated. Access using array indexes instead."), this.writeUInt8(e, r);
        }, u.prototype.readUInt8 = function(e, r) {
          if (r || (B(e != null, "missing offset"), B(e < this.length, "Trying to read beyond buffer length")), !(e >= this.length))
            return this[e];
        }, u.prototype.readUInt16LE = function(e, r) {
          return v(this, e, !0, r);
        }, u.prototype.readUInt16BE = function(e, r) {
          return v(this, e, !1, r);
        }, u.prototype.readUInt32LE = function(e, r) {
          return F(this, e, !0, r);
        }, u.prototype.readUInt32BE = function(e, r) {
          return F(this, e, !1, r);
        }, u.prototype.readInt8 = function(e, r) {
          if (r || (B(e != null, "missing offset"), B(e < this.length, "Trying to read beyond buffer length")), !(e >= this.length))
            return 128 & this[e] ? -1 * (255 - this[e] + 1) : this[e];
        }, u.prototype.readInt16LE = function(e, r) {
          return s(this, e, !0, r);
        }, u.prototype.readInt16BE = function(e, r) {
          return s(this, e, !1, r);
        }, u.prototype.readInt32LE = function(e, r) {
          return d(this, e, !0, r);
        }, u.prototype.readInt32BE = function(e, r) {
          return d(this, e, !1, r);
        }, u.prototype.readFloatLE = function(e, r) {
          return n(this, e, !0, r);
        }, u.prototype.readFloatBE = function(e, r) {
          return n(this, e, !1, r);
        }, u.prototype.readDoubleLE = function(e, r) {
          return o(this, e, !0, r);
        }, u.prototype.readDoubleBE = function(e, r) {
          return o(this, e, !1, r);
        }, u.prototype.writeUInt8 = function(e, r, i) {
          i || (B(e != null, "missing value"), B(r != null, "missing offset"), B(r < this.length, "trying to write beyond buffer length"), ne(e, 255)), r >= this.length || (this[r] = e);
        }, u.prototype.writeUInt16LE = function(e, r, i) {
          t(this, e, r, !0, i);
        }, u.prototype.writeUInt16BE = function(e, r, i) {
          t(this, e, r, !1, i);
        }, u.prototype.writeUInt32LE = function(e, r, i) {
          a(this, e, r, !0, i);
        }, u.prototype.writeUInt32BE = function(e, r, i) {
          a(this, e, r, !1, i);
        }, u.prototype.writeInt8 = function(e, r, i) {
          i || (B(e != null, "missing value"), B(r != null, "missing offset"), B(r < this.length, "Trying to write beyond buffer length"), re(e, 127, -128)), r >= this.length || (0 <= e ? this.writeUInt8(e, r, i) : this.writeUInt8(255 + e + 1, r, i));
        }, u.prototype.writeInt16LE = function(e, r, i) {
          l(this, e, r, !0, i);
        }, u.prototype.writeInt16BE = function(e, r, i) {
          l(this, e, r, !1, i);
        }, u.prototype.writeInt32LE = function(e, r, i) {
          T(this, e, r, !0, i);
        }, u.prototype.writeInt32BE = function(e, r, i) {
          T(this, e, r, !1, i);
        }, u.prototype.writeFloatLE = function(e, r, i) {
          U(this, e, r, !0, i);
        }, u.prototype.writeFloatBE = function(e, r, i) {
          U(this, e, r, !1, i);
        }, u.prototype.writeDoubleLE = function(e, r, i) {
          $(this, e, r, !0, i);
        }, u.prototype.writeDoubleBE = function(e, r, i) {
          $(this, e, r, !1, i);
        }, u.prototype.fill = function(e, r, i) {
          if (r = r || 0, i = i || this.length, B(typeof (e = typeof (e = e || 0) == "string" ? e.charCodeAt(0) : e) == "number" && !isNaN(e), "value is not a number"), B(r <= i, "end < start"), i !== r && this.length !== 0) {
            B(0 <= r && r < this.length, "start out of bounds"), B(0 <= i && i <= this.length, "end out of bounds");
            for (var _ = r; _ < i; _++)
              this[_] = e;
          }
        }, u.prototype.inspect = function() {
          for (var e = [], r = this.length, i = 0; i < r; i++)
            if (e[i] = D(this[i]), i === f.INSPECT_MAX_BYTES) {
              e[i + 1] = "...";
              break;
            }
          return "<Buffer " + e.join(" ") + ">";
        }, u.prototype.toArrayBuffer = function() {
          if (typeof Uint8Array > "u")
            throw new Error("Buffer.toArrayBuffer not supported in this browser");
          if (u._useTypedArrays)
            return new u(this).buffer;
          for (var e = new Uint8Array(this.length), r = 0, i = e.length; r < i; r += 1)
            e[r] = this[r];
          return e.buffer;
        };
        var N = u.prototype;
        function q(e, r, i) {
          return typeof e != "number" ? i : r <= (e = ~~e) ? r : 0 <= e || 0 <= (e += r) ? e : 0;
        }
        function G(e) {
          return (e = ~~Math.ceil(+e)) < 0 ? 0 : e;
        }
        function O(e) {
          return (Array.isArray || function(r) {
            return Object.prototype.toString.call(r) === "[object Array]";
          })(e);
        }
        function D(e) {
          return e < 16 ? "0" + e.toString(16) : e.toString(16);
        }
        function Z(e) {
          for (var r = [], i = 0; i < e.length; i++) {
            var _ = e.charCodeAt(i);
            if (_ <= 127)
              r.push(e.charCodeAt(i));
            else
              for (var w = i, S = (55296 <= _ && _ <= 57343 && i++, encodeURIComponent(e.slice(w, i + 1)).substr(1).split("%")), H = 0; H < S.length; H++)
                r.push(parseInt(S[H], 16));
          }
          return r;
        }
        function oe(e) {
          return y.toByteArray(e);
        }
        function ee(e, r, i, _) {
          for (var w = 0; w < _ && !(w + i >= r.length || w >= e.length); w++)
            r[w + i] = e[w];
          return w;
        }
        function ie(e) {
          try {
            return decodeURIComponent(e);
          } catch {
            return String.fromCharCode(65533);
          }
        }
        function ne(e, r) {
          B(typeof e == "number", "cannot write a non-number as a number"), B(0 <= e, "specified a negative value for writing an unsigned value"), B(e <= r, "value is larger than maximum value for type"), B(Math.floor(e) === e, "value has a fractional component");
        }
        function re(e, r, i) {
          B(typeof e == "number", "cannot write a non-number as a number"), B(e <= r, "value larger than maximum allowed value"), B(i <= e, "value smaller than minimum allowed value"), B(Math.floor(e) === e, "value has a fractional component");
        }
        function se(e, r, i) {
          B(typeof e == "number", "cannot write a non-number as a number"), B(e <= r, "value larger than maximum allowed value"), B(i <= e, "value smaller than minimum allowed value");
        }
        function B(e, r) {
          if (!e)
            throw new Error(r || "Failed assertion");
        }
        u._augment = function(e) {
          return e._isBuffer = !0, e._get = e.get, e._set = e.set, e.get = N.get, e.set = N.set, e.write = N.write, e.toString = N.toString, e.toLocaleString = N.toString, e.toJSON = N.toJSON, e.copy = N.copy, e.slice = N.slice, e.readUInt8 = N.readUInt8, e.readUInt16LE = N.readUInt16LE, e.readUInt16BE = N.readUInt16BE, e.readUInt32LE = N.readUInt32LE, e.readUInt32BE = N.readUInt32BE, e.readInt8 = N.readInt8, e.readInt16LE = N.readInt16LE, e.readInt16BE = N.readInt16BE, e.readInt32LE = N.readInt32LE, e.readInt32BE = N.readInt32BE, e.readFloatLE = N.readFloatLE, e.readFloatBE = N.readFloatBE, e.readDoubleLE = N.readDoubleLE, e.readDoubleBE = N.readDoubleBE, e.writeUInt8 = N.writeUInt8, e.writeUInt16LE = N.writeUInt16LE, e.writeUInt16BE = N.writeUInt16BE, e.writeUInt32LE = N.writeUInt32LE, e.writeUInt32BE = N.writeUInt32BE, e.writeInt8 = N.writeInt8, e.writeInt16LE = N.writeInt16LE, e.writeInt16BE = N.writeInt16BE, e.writeInt32LE = N.writeInt32LE, e.writeInt32BE = N.writeInt32BE, e.writeFloatLE = N.writeFloatLE, e.writeFloatBE = N.writeFloatBE, e.writeDoubleLE = N.writeDoubleLE, e.writeDoubleBE = N.writeDoubleBE, e.fill = N.fill, e.inspect = N.inspect, e.toArrayBuffer = N.toArrayBuffer, e;
        };
      }).call(this, c("lYpoI2"), typeof self < "u" ? self : typeof window < "u" ? window : {}, c("buffer").Buffer, arguments[3], arguments[4], arguments[5], arguments[6], "/node_modules/gulp-browserify/node_modules/buffer/index.js", "/node_modules/gulp-browserify/node_modules/buffer");
    }, { "base64-js": 2, buffer: 3, ieee754: 10, lYpoI2: 11 }], 4: [function(c, m, f) {
      (function(g, M, y, L, p, I, k, W, Y) {
        var y = c("buffer").Buffer, j = 4, u = new y(j);
        u.fill(0), m.exports = { hash: function(b, E, A, v) {
          for (var F = E(function(t, a) {
            t.length % j != 0 && (l = t.length + (j - t.length % j), t = y.concat([t, u], l));
            for (var l, T = [], U = a ? t.readInt32BE : t.readInt32LE, $ = 0; $ < t.length; $ += j)
              T.push(U.call(t, $));
            return T;
          }(b = y.isBuffer(b) ? b : new y(b), v), 8 * b.length), E = v, s = new y(A), d = E ? s.writeInt32BE : s.writeInt32LE, n = 0; n < F.length; n++)
            d.call(s, F[n], 4 * n, !0);
          return s;
        } };
      }).call(this, c("lYpoI2"), typeof self < "u" ? self : typeof window < "u" ? window : {}, c("buffer").Buffer, arguments[3], arguments[4], arguments[5], arguments[6], "/node_modules/gulp-browserify/node_modules/crypto-browserify/helpers.js", "/node_modules/gulp-browserify/node_modules/crypto-browserify");
    }, { buffer: 3, lYpoI2: 11 }], 5: [function(c, m, f) {
      (function(g, M, y, L, p, I, k, W, Y) {
        var y = c("buffer").Buffer, j = c("./sha"), u = c("./sha256"), b = c("./rng"), E = { sha1: j, sha256: u, md5: c("./md5") }, A = 64, v = new y(A);
        function F(t, a) {
          var l = E[t = t || "sha1"], T = [];
          return l || s("algorithm:", t, "is not yet supported"), { update: function(U) {
            return y.isBuffer(U) || (U = new y(U)), T.push(U), U.length, this;
          }, digest: function(U) {
            var $ = y.concat(T), $ = a ? function(N, q, G) {
              y.isBuffer(q) || (q = new y(q)), y.isBuffer(G) || (G = new y(G)), q.length > A ? q = N(q) : q.length < A && (q = y.concat([q, v], A));
              for (var O = new y(A), D = new y(A), Z = 0; Z < A; Z++)
                O[Z] = 54 ^ q[Z], D[Z] = 92 ^ q[Z];
              return G = N(y.concat([O, G])), N(y.concat([D, G]));
            }(l, a, $) : l($);
            return T = null, U ? $.toString(U) : $;
          } };
        }
        function s() {
          var t = [].slice.call(arguments).join(" ");
          throw new Error([t, "we accept pull requests", "http://github.com/dominictarr/crypto-browserify"].join(`
`));
        }
        v.fill(0), f.createHash = function(t) {
          return F(t);
        }, f.createHmac = F, f.randomBytes = function(t, a) {
          if (!a || !a.call)
            return new y(b(t));
          try {
            a.call(this, void 0, new y(b(t)));
          } catch (l) {
            a(l);
          }
        };
        var d, n = ["createCredentials", "createCipher", "createCipheriv", "createDecipher", "createDecipheriv", "createSign", "createVerify", "createDiffieHellman", "pbkdf2"], o = function(t) {
          f[t] = function() {
            s("sorry,", t, "is not implemented yet");
          };
        };
        for (d in n)
          o(n[d]);
      }).call(this, c("lYpoI2"), typeof self < "u" ? self : typeof window < "u" ? window : {}, c("buffer").Buffer, arguments[3], arguments[4], arguments[5], arguments[6], "/node_modules/gulp-browserify/node_modules/crypto-browserify/index.js", "/node_modules/gulp-browserify/node_modules/crypto-browserify");
    }, { "./md5": 6, "./rng": 7, "./sha": 8, "./sha256": 9, buffer: 3, lYpoI2: 11 }], 6: [function(c, m, f) {
      (function(g, M, C, L, p, I, k, W, Y) {
        var y = c("./helpers");
        function j(s, d) {
          s[d >> 5] |= 128 << d % 32, s[14 + (d + 64 >>> 9 << 4)] = d;
          for (var n = 1732584193, o = -271733879, t = -1732584194, a = 271733878, l = 0; l < s.length; l += 16) {
            var T = n, U = o, $ = t, N = a, n = b(n, o, t, a, s[l + 0], 7, -680876936), a = b(a, n, o, t, s[l + 1], 12, -389564586), t = b(t, a, n, o, s[l + 2], 17, 606105819), o = b(o, t, a, n, s[l + 3], 22, -1044525330);
            n = b(n, o, t, a, s[l + 4], 7, -176418897), a = b(a, n, o, t, s[l + 5], 12, 1200080426), t = b(t, a, n, o, s[l + 6], 17, -1473231341), o = b(o, t, a, n, s[l + 7], 22, -45705983), n = b(n, o, t, a, s[l + 8], 7, 1770035416), a = b(a, n, o, t, s[l + 9], 12, -1958414417), t = b(t, a, n, o, s[l + 10], 17, -42063), o = b(o, t, a, n, s[l + 11], 22, -1990404162), n = b(n, o, t, a, s[l + 12], 7, 1804603682), a = b(a, n, o, t, s[l + 13], 12, -40341101), t = b(t, a, n, o, s[l + 14], 17, -1502002290), n = E(n, o = b(o, t, a, n, s[l + 15], 22, 1236535329), t, a, s[l + 1], 5, -165796510), a = E(a, n, o, t, s[l + 6], 9, -1069501632), t = E(t, a, n, o, s[l + 11], 14, 643717713), o = E(o, t, a, n, s[l + 0], 20, -373897302), n = E(n, o, t, a, s[l + 5], 5, -701558691), a = E(a, n, o, t, s[l + 10], 9, 38016083), t = E(t, a, n, o, s[l + 15], 14, -660478335), o = E(o, t, a, n, s[l + 4], 20, -405537848), n = E(n, o, t, a, s[l + 9], 5, 568446438), a = E(a, n, o, t, s[l + 14], 9, -1019803690), t = E(t, a, n, o, s[l + 3], 14, -187363961), o = E(o, t, a, n, s[l + 8], 20, 1163531501), n = E(n, o, t, a, s[l + 13], 5, -1444681467), a = E(a, n, o, t, s[l + 2], 9, -51403784), t = E(t, a, n, o, s[l + 7], 14, 1735328473), n = A(n, o = E(o, t, a, n, s[l + 12], 20, -1926607734), t, a, s[l + 5], 4, -378558), a = A(a, n, o, t, s[l + 8], 11, -2022574463), t = A(t, a, n, o, s[l + 11], 16, 1839030562), o = A(o, t, a, n, s[l + 14], 23, -35309556), n = A(n, o, t, a, s[l + 1], 4, -1530992060), a = A(a, n, o, t, s[l + 4], 11, 1272893353), t = A(t, a, n, o, s[l + 7], 16, -155497632), o = A(o, t, a, n, s[l + 10], 23, -1094730640), n = A(n, o, t, a, s[l + 13], 4, 681279174), a = A(a, n, o, t, s[l + 0], 11, -358537222), t = A(t, a, n, o, s[l + 3], 16, -722521979), o = A(o, t, a, n, s[l + 6], 23, 76029189), n = A(n, o, t, a, s[l + 9], 4, -640364487), a = A(a, n, o, t, s[l + 12], 11, -421815835), t = A(t, a, n, o, s[l + 15], 16, 530742520), n = v(n, o = A(o, t, a, n, s[l + 2], 23, -995338651), t, a, s[l + 0], 6, -198630844), a = v(a, n, o, t, s[l + 7], 10, 1126891415), t = v(t, a, n, o, s[l + 14], 15, -1416354905), o = v(o, t, a, n, s[l + 5], 21, -57434055), n = v(n, o, t, a, s[l + 12], 6, 1700485571), a = v(a, n, o, t, s[l + 3], 10, -1894986606), t = v(t, a, n, o, s[l + 10], 15, -1051523), o = v(o, t, a, n, s[l + 1], 21, -2054922799), n = v(n, o, t, a, s[l + 8], 6, 1873313359), a = v(a, n, o, t, s[l + 15], 10, -30611744), t = v(t, a, n, o, s[l + 6], 15, -1560198380), o = v(o, t, a, n, s[l + 13], 21, 1309151649), n = v(n, o, t, a, s[l + 4], 6, -145523070), a = v(a, n, o, t, s[l + 11], 10, -1120210379), t = v(t, a, n, o, s[l + 2], 15, 718787259), o = v(o, t, a, n, s[l + 9], 21, -343485551), n = F(n, T), o = F(o, U), t = F(t, $), a = F(a, N);
          }
          return Array(n, o, t, a);
        }
        function u(s, d, n, o, t, a) {
          return F((d = F(F(d, s), F(o, a))) << t | d >>> 32 - t, n);
        }
        function b(s, d, n, o, t, a, l) {
          return u(d & n | ~d & o, s, d, t, a, l);
        }
        function E(s, d, n, o, t, a, l) {
          return u(d & o | n & ~o, s, d, t, a, l);
        }
        function A(s, d, n, o, t, a, l) {
          return u(d ^ n ^ o, s, d, t, a, l);
        }
        function v(s, d, n, o, t, a, l) {
          return u(n ^ (d | ~o), s, d, t, a, l);
        }
        function F(s, d) {
          var n = (65535 & s) + (65535 & d);
          return (s >> 16) + (d >> 16) + (n >> 16) << 16 | 65535 & n;
        }
        m.exports = function(s) {
          return y.hash(s, j, 16);
        };
      }).call(this, c("lYpoI2"), typeof self < "u" ? self : typeof window < "u" ? window : {}, c("buffer").Buffer, arguments[3], arguments[4], arguments[5], arguments[6], "/node_modules/gulp-browserify/node_modules/crypto-browserify/md5.js", "/node_modules/gulp-browserify/node_modules/crypto-browserify");
    }, { "./helpers": 4, buffer: 3, lYpoI2: 11 }], 7: [function(c, m, f) {
      (function(g, M, C, L, p, I, k, W, Y) {
        m.exports = function(y) {
          for (var j, u = new Array(y), b = 0; b < y; b++)
            (3 & b) == 0 && (j = 4294967296 * Math.random()), u[b] = j >>> ((3 & b) << 3) & 255;
          return u;
        };
      }).call(this, c("lYpoI2"), typeof self < "u" ? self : typeof window < "u" ? window : {}, c("buffer").Buffer, arguments[3], arguments[4], arguments[5], arguments[6], "/node_modules/gulp-browserify/node_modules/crypto-browserify/rng.js", "/node_modules/gulp-browserify/node_modules/crypto-browserify");
    }, { buffer: 3, lYpoI2: 11 }], 8: [function(c, m, f) {
      (function(g, M, C, L, p, I, k, W, Y) {
        var y = c("./helpers");
        function j(E, A) {
          E[A >> 5] |= 128 << 24 - A % 32, E[15 + (A + 64 >> 9 << 4)] = A;
          for (var v, F, s, d = Array(80), n = 1732584193, o = -271733879, t = -1732584194, a = 271733878, l = -1009589776, T = 0; T < E.length; T += 16) {
            for (var U = n, $ = o, N = t, q = a, G = l, O = 0; O < 80; O++) {
              d[O] = O < 16 ? E[T + O] : b(d[O - 3] ^ d[O - 8] ^ d[O - 14] ^ d[O - 16], 1);
              var D = u(u(b(n, 5), (D = o, F = t, s = a, (v = O) < 20 ? D & F | ~D & s : !(v < 40) && v < 60 ? D & F | D & s | F & s : D ^ F ^ s)), u(u(l, d[O]), (v = O) < 20 ? 1518500249 : v < 40 ? 1859775393 : v < 60 ? -1894007588 : -899497514)), l = a, a = t, t = b(o, 30), o = n, n = D;
            }
            n = u(n, U), o = u(o, $), t = u(t, N), a = u(a, q), l = u(l, G);
          }
          return Array(n, o, t, a, l);
        }
        function u(E, A) {
          var v = (65535 & E) + (65535 & A);
          return (E >> 16) + (A >> 16) + (v >> 16) << 16 | 65535 & v;
        }
        function b(E, A) {
          return E << A | E >>> 32 - A;
        }
        m.exports = function(E) {
          return y.hash(E, j, 20, !0);
        };
      }).call(this, c("lYpoI2"), typeof self < "u" ? self : typeof window < "u" ? window : {}, c("buffer").Buffer, arguments[3], arguments[4], arguments[5], arguments[6], "/node_modules/gulp-browserify/node_modules/crypto-browserify/sha.js", "/node_modules/gulp-browserify/node_modules/crypto-browserify");
    }, { "./helpers": 4, buffer: 3, lYpoI2: 11 }], 9: [function(c, m, f) {
      (function(g, M, C, L, p, I, k, W, Y) {
        function y(A, v) {
          var F = (65535 & A) + (65535 & v);
          return (A >> 16) + (v >> 16) + (F >> 16) << 16 | 65535 & F;
        }
        function j(A, v) {
          var F, s = new Array(1116352408, 1899447441, 3049323471, 3921009573, 961987163, 1508970993, 2453635748, 2870763221, 3624381080, 310598401, 607225278, 1426881987, 1925078388, 2162078206, 2614888103, 3248222580, 3835390401, 4022224774, 264347078, 604807628, 770255983, 1249150122, 1555081692, 1996064986, 2554220882, 2821834349, 2952996808, 3210313671, 3336571891, 3584528711, 113926993, 338241895, 666307205, 773529912, 1294757372, 1396182291, 1695183700, 1986661051, 2177026350, 2456956037, 2730485921, 2820302411, 3259730800, 3345764771, 3516065817, 3600352804, 4094571909, 275423344, 430227734, 506948616, 659060556, 883997877, 958139571, 1322822218, 1537002063, 1747873779, 1955562222, 2024104815, 2227730452, 2361852424, 2428436474, 2756734187, 3204031479, 3329325298), d = new Array(1779033703, 3144134277, 1013904242, 2773480762, 1359893119, 2600822924, 528734635, 1541459225), n = new Array(64);
          A[v >> 5] |= 128 << 24 - v % 32, A[15 + (v + 64 >> 9 << 4)] = v;
          for (var o, t, a = 0; a < A.length; a += 16) {
            for (var l = d[0], T = d[1], U = d[2], $ = d[3], N = d[4], q = d[5], G = d[6], O = d[7], D = 0; D < 64; D++)
              n[D] = D < 16 ? A[D + a] : y(y(y((t = n[D - 2], b(t, 17) ^ b(t, 19) ^ E(t, 10)), n[D - 7]), (t = n[D - 15], b(t, 7) ^ b(t, 18) ^ E(t, 3))), n[D - 16]), F = y(y(y(y(O, b(t = N, 6) ^ b(t, 11) ^ b(t, 25)), N & q ^ ~N & G), s[D]), n[D]), o = y(b(o = l, 2) ^ b(o, 13) ^ b(o, 22), l & T ^ l & U ^ T & U), O = G, G = q, q = N, N = y($, F), $ = U, U = T, T = l, l = y(F, o);
            d[0] = y(l, d[0]), d[1] = y(T, d[1]), d[2] = y(U, d[2]), d[3] = y($, d[3]), d[4] = y(N, d[4]), d[5] = y(q, d[5]), d[6] = y(G, d[6]), d[7] = y(O, d[7]);
          }
          return d;
        }
        var u = c("./helpers"), b = function(A, v) {
          return A >>> v | A << 32 - v;
        }, E = function(A, v) {
          return A >>> v;
        };
        m.exports = function(A) {
          return u.hash(A, j, 32, !0);
        };
      }).call(this, c("lYpoI2"), typeof self < "u" ? self : typeof window < "u" ? window : {}, c("buffer").Buffer, arguments[3], arguments[4], arguments[5], arguments[6], "/node_modules/gulp-browserify/node_modules/crypto-browserify/sha256.js", "/node_modules/gulp-browserify/node_modules/crypto-browserify");
    }, { "./helpers": 4, buffer: 3, lYpoI2: 11 }], 10: [function(c, m, f) {
      (function(g, M, C, L, p, I, k, W, Y) {
        f.read = function(y, j, u, b, a) {
          var A, v, F = 8 * a - b - 1, s = (1 << F) - 1, d = s >> 1, n = -7, o = u ? a - 1 : 0, t = u ? -1 : 1, a = y[j + o];
          for (o += t, A = a & (1 << -n) - 1, a >>= -n, n += F; 0 < n; A = 256 * A + y[j + o], o += t, n -= 8)
            ;
          for (v = A & (1 << -n) - 1, A >>= -n, n += b; 0 < n; v = 256 * v + y[j + o], o += t, n -= 8)
            ;
          if (A === 0)
            A = 1 - d;
          else {
            if (A === s)
              return v ? NaN : 1 / 0 * (a ? -1 : 1);
            v += Math.pow(2, b), A -= d;
          }
          return (a ? -1 : 1) * v * Math.pow(2, A - b);
        }, f.write = function(y, j, u, b, E, l) {
          var v, F, s = 8 * l - E - 1, d = (1 << s) - 1, n = d >> 1, o = E === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0, t = b ? 0 : l - 1, a = b ? 1 : -1, l = j < 0 || j === 0 && 1 / j < 0 ? 1 : 0;
          for (j = Math.abs(j), isNaN(j) || j === 1 / 0 ? (F = isNaN(j) ? 1 : 0, v = d) : (v = Math.floor(Math.log(j) / Math.LN2), j * (b = Math.pow(2, -v)) < 1 && (v--, b *= 2), 2 <= (j += 1 <= v + n ? o / b : o * Math.pow(2, 1 - n)) * b && (v++, b /= 2), d <= v + n ? (F = 0, v = d) : 1 <= v + n ? (F = (j * b - 1) * Math.pow(2, E), v += n) : (F = j * Math.pow(2, n - 1) * Math.pow(2, E), v = 0)); 8 <= E; y[u + t] = 255 & F, t += a, F /= 256, E -= 8)
            ;
          for (v = v << E | F, s += E; 0 < s; y[u + t] = 255 & v, t += a, v /= 256, s -= 8)
            ;
          y[u + t - a] |= 128 * l;
        };
      }).call(this, c("lYpoI2"), typeof self < "u" ? self : typeof window < "u" ? window : {}, c("buffer").Buffer, arguments[3], arguments[4], arguments[5], arguments[6], "/node_modules/gulp-browserify/node_modules/ieee754/index.js", "/node_modules/gulp-browserify/node_modules/ieee754");
    }, { buffer: 3, lYpoI2: 11 }], 11: [function(c, m, f) {
      (function(g, M, C, L, p, I, k, W, Y) {
        var y, j, u;
        function b() {
        }
        (g = m.exports = {}).nextTick = (j = typeof window < "u" && window.setImmediate, u = typeof window < "u" && window.postMessage && window.addEventListener, j ? function(E) {
          return window.setImmediate(E);
        } : u ? (y = [], window.addEventListener("message", function(E) {
          var A = E.source;
          A !== window && A !== null || E.data !== "process-tick" || (E.stopPropagation(), 0 < y.length && y.shift()());
        }, !0), function(E) {
          y.push(E), window.postMessage("process-tick", "*");
        }) : function(E) {
          setTimeout(E, 0);
        }), g.title = "browser", g.browser = !0, g.env = {}, g.argv = [], g.on = b, g.addListener = b, g.once = b, g.off = b, g.removeListener = b, g.removeAllListeners = b, g.emit = b, g.binding = function(E) {
          throw new Error("process.binding is not supported");
        }, g.cwd = function() {
          return "/";
        }, g.chdir = function(E) {
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
    getTemplateLayoutIds(x, { template: h, sectionId: c }) {
      let m = [];
      for (let f = 0; f < h[c].layouts.length; f++) {
        const g = h[c].layouts[f];
        m.push(g);
      }
      for (let f = 0; f < h[c].elements.length; f++) {
        const g = h[c].elements, M = g[f].type;
        for (let C = 0; C < M.length; C++)
          if (M[C][0] === "section")
            for (let L = 0; L < g[f].value[C].length; L++) {
              const p = g[f].value[C][L][1];
              m = m.concat(this.getTemplateLayoutIds({}, { template: h, sectionId: p }));
            }
      }
      return m;
    },
    createModifier(x, { baseLayoutIds: h, baseLayouts: c, modifierLayoutIds: m, modifierLayouts: f }) {
      const g = {};
      for (let M = 0; M < m.length; M++) {
        const C = h[M], L = m[M];
        if (L !== C) {
          g[C] = {};
          for (let p = 0; p < c[C].length; p++) {
            const I = c[C][p], k = f[L][p];
            I.componentId !== k.componentId && (g[C][p] = k.componentId);
          }
        }
      }
      return g;
    },
    _baseWidget(x, h = {}) {
      const c = {
        metadata: h,
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
      return x && (delete c.widgets, c.template = {}), c;
    },
    _checkCondition(x, h) {
      const c = [];
      for (let m = 0; m < h.length; m++) {
        const f = h[m];
        let g = !0;
        Object.hasOwnProperty.call(x, f) || (g = !1), c.push(g);
      }
      return c;
    },
    _traverse(x, h, c = [], m = []) {
      let f;
      for (let g = 0; g < h.length; g++)
        if (x[h[g]]) {
          f = h[g];
          break;
        }
      if (f)
        if (Array.isArray(x[f])) {
          const g = x[f];
          for (let M = 0; M < g.length; M++) {
            const C = g[M];
            if (Array.isArray(C)) {
              let L = [];
              for (let p = 0; p < C.length; p++) {
                const I = C[p];
                L = this._checkCondition(I, c), L.includes(!0) && (m.unshift(I), this._traverse(I, h, c, m));
              }
            } else if (typeof C == "object" && this._checkCondition(C, c).includes(!0)) {
              let L;
              for (let p = 0; p < h.length; p++)
                if (C[h[p]]) {
                  L = h[p];
                  break;
                }
              if (Array.isArray(C[L]))
                for (let p = 0; p < C[L].length; p++) {
                  const I = C[L][p];
                  this._checkCondition(I, c).includes(!0) && (m.unshift(I), this._traverse(I, h, c, m));
                }
              else
                m.unshift(C), this._traverse(C, h, c, m);
            }
          }
        } else {
          const g = x[f];
          this._checkCondition(g, c).includes(!0) && (m.unshift(g), this._traverse(g, h, c, m));
        }
      return m.length || m.unshift(x), m;
    },
    _toParam(x, h, c, m = []) {
      const f = [], g = {};
      if (x.params && (x._$computedParams || x.values)) {
        const L = this._traverse(x, h, c);
        for (let p = 0; p < L.length; p++) {
          const I = L[p];
          if (f[p] = 1, p !== 0 && (I.params.params && I._$computed || I._$computedParams || I.values)) {
            const W = p - 1;
            if (I.paramType === "object" || I.paramType === "array")
              for (let Y = 0; Y < I.params.length; Y++)
                I.params[Y].length > 1 ? I.params[Y][1] = {
                  _$id: m[W]
                } : I.params[Y] = {
                  _$id: m[W]
                }, ++f[p];
            else if (I.values)
              for (let Y = 0; Y < I.values.length; Y++)
                I.values[Y] = {
                  _$id: m[W]
                }, ++f[p];
            else
              I.params = {
                _$id: m[W]
              };
          }
          const k = this._createHash(I);
          m.push(k), g[k] = I;
        }
      }
      const M = { ...x };
      let C;
      for (let L = 0; L < h.length; L++)
        if (M[h[L]]) {
          C = h[L];
          break;
        }
      if (Array.isArray(M[C])) {
        for (let L = 0; L < M[C].length; L++)
          if (Array.isArray(M[C][L])) {
            for (let p = 0; p < M[C][L].length; p++)
              if (typeof M[C][L][p] == "object") {
                let I;
                L === 0 ? I = 1 : I = f[L] + f[L - 1], M[C][L][p] = {
                  _$id: m[m.length - I]
                };
              }
          } else if (typeof M[C][L] == "object") {
            let p;
            L === 0 ? p = 1 : p = f[L] + f[L - 1], M[C][L] = {
              _$id: m[m.length - p]
            };
          }
      } else
        M.params = {
          _$id: m[m.length - 1]
        };
      return { item: M, params: g };
    },
    toActionSequence(x, h) {
      let c, m;
      h.actions && (c = this._toAction(h.actions)), h.conditions && (m = this._toAction(h.conditions));
      const f = {
        params: {},
        sequence: {}
      };
      return c && (f.actions = c.actions, f.params = c.params, f.sequence.actions = c.sequence), m && (f.conditions = m.actions, f.params = { ...f.params, ...m.params }, f.sequence.conditions = c.sequence), f.sequence.id = this._createHash(f.sequence), f;
    },
    _toAction(x, h = {}, c = {}, m = 0, f = {}) {
      const g = [];
      for (let M = 0; M < x.length; M++) {
        const C = x[M], { item: L, params: p } = this._toParam(C, ["params", "values"], ["_$computedParams", "_$computed"]);
        delete L.onSuccess, delete L.onError;
        const I = this._createHash(L), k = { _$id: I }, W = `_${M}${m}`;
        if (h[I] = L, c = { ...c, ...p }, g.push(W), C.onSuccess) {
          const Y = this._toAction(C.onSuccess, h, c, ++m, f);
          k.onSuccess = Y.entries;
        }
        if (C.onError) {
          const Y = this._toAction(C.onError, h, c, ++m, f);
          k.onError = Y.entries;
        }
        f[W] = k, m === 0 && (f.entry = g);
      }
      return { actions: h, params: c, sequence: f, entries: g };
    },
    toWidget(x, {
      data: h,
      sectionId: c = this.$method("dsUtilities/generateId"),
      groupId: m = this.$method("dsUtilities/generateId"),
      rootElement: f,
      view: g = "default",
      isTemplate: M,
      isHead: C = !0,
      metadata: L
    }) {
      h || (h = this._baseWidget(M, L));
      let p = !1, I = f.childNodes || [];
      C ? h.templateEntry = c : h.childSectionId = c, f.getAttribute instanceof Function && (p = !!f.getAttribute("ds-widget-section") || !!f.getAttribute("ds-widget")), p ? (f.removeAttribute("ds-widget"), I = [f]) : m = this.$method("dsUtilities/generateId");
      const k = this.$method("dsUtilities/generateId"), W = this._toLayout(
        h,
        c,
        k,
        m,
        I,
        [],
        g === "default",
        M,
        g
      );
      if (!M)
        return h.widgets.items[c] || (h.widgets.items[c] = []), h.widgets.items[c].push({
          groupId: m,
          instanceId: k,
          layout: {
            [g]: W.id
          }
        }), h.widgets.content[c + k + "_" + g] = h.elements.used[k], h;
      h.template[c] || (h.template[c] = {
        events: {},
        layouts: [],
        elements: {}
      });
      const Y = h.template[c], y = Y.layouts.length;
      Object.values(W.events).length && (Y.events[y] = W.events), Y.layouts.push(W.id);
      const j = h.elements.used[k] || [];
      for (let u = 0; u < j.length; u++) {
        const b = j[u];
        Y.elements[y] || (Y.elements[y] = []), Y.elements[y].push({
          value: h.elements.value[b],
          type: h.elements.type[b]
        });
      }
      return h;
    },
    _toLayout(x, h, c, m, f, g = [], M, C, L, p = [], I = !0, k = 0) {
      const W = [];
      let Y = {}, y = [];
      for (let j = 0; j < f.length; j++) {
        const u = f[j];
        if (u.tagName || u.constructor.name === "Text" && u.textContent.trim()) {
          const b = this._toComponent(x, h, c, m, u, M, C, L), E = { componentId: b.id };
          if (b.hasContent) {
            const v = x.elements.used[c] && x.elements.used[c].length;
            E.contentIndex = v - 1;
          }
          b.event && (Y[k] = b.event), I && W.push(y.length);
          const A = g.indexOf(u.parentElement);
          if (A > -1 && (E.parentIndex = A), g.push(u), y.push(E), ++k, u.tagName && u.getAttribute("ds-widget-section")) {
            const v = this.$method("dsUtilities/generateId");
            p.push({
              sectionId: v,
              contentIndex: E.contentIndex
            });
            for (let F = 0; F < u.children.length; F++) {
              const s = u.children[F];
              s.tagName && !s.getAttribute("ds-widget-section") && s.setAttribute("ds-widget", "true"), this.toWidget({}, {
                data: x,
                sectionId: v,
                groupId: m,
                rootElement: s,
                isTemplate: C,
                view: L,
                isHead: !1
              });
            }
          } else if (u.childNodes.length && !b.hasWidget) {
            const v = this._toLayout(
              x,
              h,
              c,
              m,
              u.childNodes,
              g,
              M,
              C,
              L,
              p,
              !1,
              k
            );
            p = p.concat(v.instances), k = v.index, y = y.concat(v.items), Y = { ...Y, ...v.events };
          }
        }
      }
      if (I) {
        for (let u = 0; u < p.length; u++) {
          const b = p[u], E = x.elements.used[c][b.contentIndex];
          let A = { default: b.sectionId };
          C && (A = [["default", b.sectionId]]), x.elements.value[E] = A;
        }
        for (let u = 0; u < y.length; u++) {
          const b = y[u];
          if (Object.prototype.hasOwnProperty.call(b, "parentIndex")) {
            const E = b.parentIndex;
            Object.prototype.hasOwnProperty.call(y[E], "children") ? y[E].children.push(u) : y[E].children = [u];
          }
        }
        const j = this._createHash(y);
        return x.layouts.items[j] = y, W.length > 1 && (x.layouts.head[j] = W), { items: y, head: W, id: j, sectionId: h, events: Y, index: k };
      }
      return { items: y, head: W, sectionId: h, instances: p, events: Y, index: k };
    },
    _elementKey(x) {
      const h = x.split("-");
      h.shift();
      const c = h.length - 1;
      return h[c] ? h : null;
    },
    _toElement(x, h, c, m) {
      const f = this.$method("dsUtilities/generateId"), g = {
        metadata: {},
        value: {},
        attributes: {}
      };
      x.elements.used[h] || (x.elements.used[h] = []);
      for (let M = 0; M < c.length; M++) {
        const [C, L] = c[M], p = this._elementKey(C);
        if (p)
          if (p.length === 3) {
            const I = f + "/" + p[1];
            g[p[0]][I] || (g[p[0]][I] = {}), g[p[0]][I][p[1]] = L;
          } else
            p.length === 2 ? (g[p[0]] || (g[p[0]] = {}), p[0] === "metadata" ? g[p[0]][p[1]] = [L, m] : g[p[0]][p[1]] = L) : (g[p[0]] || (g[p[0]] = {}), g[p[0]] = L);
      }
      x.elements.used[h].push(f), x.elements.value[f] = { default: g.value }, x.elements.type[f] = g.metadata.type, x.elements.attributes = { ...x.elements.attributes, ...g.attributes };
    },
    _createHash(x) {
      let h = ce(x, { algorithm: "md5", encoding: "base64" }), c = "";
      h = h.substring(0, h.length - 2);
      for (let m = 0; m < h.length; m++) {
        const f = h[m];
        f === "+" ? c += "$" : f === "/" ? c += "_" : c += f;
      }
      return "_" + c;
    },
    _elementContent(x, h) {
      const c = this.$component(x);
      if (c) {
        const m = [["ds-metadata-type", c.type]];
        if (c.content.value.length === 1)
          return m.push(["ds-value", h.getAttribute(c.value)]), m;
        const f = {};
        for (let g = 0; g < c.content.value.length; g++) {
          const M = c.content.value[g];
          f[M] = h.getAttribute(M);
        }
        m.push(["ds-value", f]);
      }
    },
    _parseText(x) {
      if (x === "[empty]")
        return {
          text: "",
          token: !1
        };
      const h = /\[(.+)\]/, c = new RegExp(h, "g").test(x);
      return { text: x, token: c };
    },
    _toComponent(x, h, c, m, f, g, M, C) {
      const L = { attributes: {} }, p = f.attributes || {};
      let I = {
        hasAttributes: !1,
        hasContent: !1,
        hasWidget: "",
        setAttributes: []
      };
      if (f.tagName) {
        const k = f.tagName.toLowerCase(), W = this._elementContent(k, f);
        L.id = k, W && (I.setAttributes = I.setAttributes.concat(W), I.hasContent = !0);
      } else {
        const k = this._parseText(f.textContent);
        I.hasContent = !0, L.id = "text", I.setAttributes.push(["ds-metadata-type", "text"]), I.setAttributes.push(["ds-value", k]);
      }
      if (p.constructor.name === "NamedNodeMap")
        for (let k = 0; k < p.length; k++) {
          const W = p[k];
          I = this._attachAttribute(x, W.name, W.value, L.attributes, I, f);
        }
      if (L.attributes = I.attributes, I.hasWidget === "ds-widget") {
        f.removeAttribute("ds-widget");
        const k = this.toWidget({}, { data: x, rootElement: f, groupId: m, isTemporary: g, isTemplate: M, view: C, isHead: !1 });
        I.setAttributes.push(["ds-metadata-type", "section"]), I.setAttributes.push(["ds-value", { default: k.childSectionId }]);
      }
      return I.setAttributes.length && this._toElement(x, c, I.setAttributes, g), I.hasAttributes || delete L.attributes, { id: this._addComponent(x, L), hasContent: I.hasContent, hasWidget: I.hasWidget, event: I.event };
    },
    _attachAttribute(x, h, c, m, f, g) {
      if (h.startsWith("@")) {
        let M = c.split(" ");
        return x.metadata.actions && (M = M.map((C) => x.metadata.actions[C] || C)), f.event = {
          on: h.substring(1),
          action: M
        }, g.removeAttribute(h), f;
      }
      return h === "ds-widget" ? (f.hasWidget = h, f.hasContent = !0, f) : h === "ds-widget-section" ? (f.setAttributes.push(["ds-metadata-type", "section"]), f.setAttributes.push(["ds-value", ""]), f.hasWidget = h, f.hasContent = !0, f) : (h === "class" ? m[h] = this._sortClassName(c) : m[h] = c, f.hasAttributes = !0, f.attributes = m, f);
    },
    _addComponent(x, h) {
      const c = this._createHash(h);
      return this.components[c] || (x.components[c] = h), c;
    },
    _sortClassName(x) {
      return x.split(" ").sort().join(" ");
    }
  }
};
export {
  le as default
};
