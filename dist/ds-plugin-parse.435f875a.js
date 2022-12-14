function te(g) {
  throw new Error('Could not dynamically require "' + g + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
}
var ue = { exports: {} };
(function(g, h) {
  (function(c) {
    g.exports = c();
  })(function() {
    return function c(d, p, w) {
      function U(I, _) {
        if (!p[I]) {
          if (!d[I]) {
            var k = typeof te == "function" && te;
            if (!_ && k)
              return k(I, !0);
            if (N)
              return N(I, !0);
            throw new Error("Cannot find module '" + I + "'");
          }
          _ = p[I] = { exports: {} }, d[I][0].call(_.exports, function(j) {
            var M = d[I][1][j];
            return U(M || j);
          }, _, _.exports, c, d, p, w);
        }
        return p[I].exports;
      }
      for (var N = typeof te == "function" && te, B = 0; B < w.length; B++)
        U(w[B]);
      return U;
    }({ 1: [function(c, d, p) {
      (function(w, U, N, B, I, _, k, j, M) {
        var m = c("crypto");
        function T(s, f) {
          f = A(s, f);
          var n;
          return (n = f.algorithm !== "passthrough" ? m.createHash(f.algorithm) : new $()).write === void 0 && (n.write = n.update, n.end = n.update), E(f, n).dispatch(s), n.update || n.end(""), n.digest ? n.digest(f.encoding === "buffer" ? void 0 : f.encoding) : (s = n.read(), f.encoding !== "buffer" ? s.toString(f.encoding) : s);
        }
        (p = d.exports = T).sha1 = function(s) {
          return T(s);
        }, p.keys = function(s) {
          return T(s, { excludeValues: !0, algorithm: "sha1", encoding: "hex" });
        }, p.MD5 = function(s) {
          return T(s, { algorithm: "md5", encoding: "hex" });
        }, p.keysMD5 = function(s) {
          return T(s, { algorithm: "md5", encoding: "hex", excludeValues: !0 });
        };
        var a = m.getHashes ? m.getHashes().slice() : ["sha1", "md5"], y = (a.push("passthrough"), ["buffer", "hex", "binary", "base64"]);
        function A(s, f) {
          var n = {};
          if (n.algorithm = (f = f || {}).algorithm || "sha1", n.encoding = f.encoding || "hex", n.excludeValues = !!f.excludeValues, n.algorithm = n.algorithm.toLowerCase(), n.encoding = n.encoding.toLowerCase(), n.ignoreUnknown = f.ignoreUnknown === !0, n.respectType = f.respectType !== !1, n.respectFunctionNames = f.respectFunctionNames !== !1, n.respectFunctionProperties = f.respectFunctionProperties !== !1, n.unorderedArrays = f.unorderedArrays === !0, n.unorderedSets = f.unorderedSets !== !1, n.unorderedObjects = f.unorderedObjects !== !1, n.replacer = f.replacer || void 0, n.excludeKeys = f.excludeKeys || void 0, s === void 0)
            throw new Error("Object argument required.");
          for (var o = 0; o < a.length; ++o)
            a[o].toLowerCase() === n.algorithm.toLowerCase() && (n.algorithm = a[o]);
          if (a.indexOf(n.algorithm) === -1)
            throw new Error('Algorithm "' + n.algorithm + '"  not supported. supported values: ' + a.join(", "));
          if (y.indexOf(n.encoding) === -1 && n.algorithm !== "passthrough")
            throw new Error('Encoding "' + n.encoding + '"  not supported. supported values: ' + y.join(", "));
          return n;
        }
        function C(s) {
          if (typeof s == "function")
            return /^function\s+\w*\s*\(\s*\)\s*{\s+\[native code\]\s+}$/i.exec(Function.prototype.toString.call(s)) != null;
        }
        function E(s, f, n) {
          n = n || [];
          function o(t) {
            return f.update ? f.update(t, "utf8") : f.write(t, "utf8");
          }
          return { dispatch: function(t) {
            return this["_" + ((t = s.replacer ? s.replacer(t) : t) === null ? "null" : typeof t)](t);
          }, _object: function(t) {
            var u, l = Object.prototype.toString.call(t), D = /\[object (.*)\]/i.exec(l);
            if (D = (D = D ? D[1] : "unknown:[" + l + "]").toLowerCase(), 0 <= (l = n.indexOf(t)))
              return this.dispatch("[CIRCULAR:" + l + "]");
            if (n.push(t), N !== void 0 && N.isBuffer && N.isBuffer(t))
              return o("buffer:"), o(t);
            if (D === "object" || D === "function" || D === "asyncfunction")
              return l = Object.keys(t), s.unorderedObjects && (l = l.sort()), s.respectType === !1 || C(t) || l.splice(0, 0, "prototype", "__proto__", "constructor"), s.excludeKeys && (l = l.filter(function(Y) {
                return !s.excludeKeys(Y);
              })), o("object:" + l.length + ":"), u = this, l.forEach(function(Y) {
                u.dispatch(Y), o(":"), s.excludeValues || u.dispatch(t[Y]), o(",");
              });
            if (!this["_" + D]) {
              if (s.ignoreUnknown)
                return o("[" + D + "]");
              throw new Error('Unknown object type "' + D + '"');
            }
            this["_" + D](t);
          }, _array: function(t, Y) {
            Y = Y !== void 0 ? Y : s.unorderedArrays !== !1;
            var l = this;
            if (o("array:" + t.length + ":"), !Y || t.length <= 1)
              return t.forEach(function(F) {
                return l.dispatch(F);
              });
            var D = [], Y = t.map(function(F) {
              var L = new $(), q = n.slice();
              return E(s, L, q).dispatch(F), D = D.concat(q.slice(n.length)), L.read().toString();
            });
            return n = n.concat(D), Y.sort(), this._array(Y, !1);
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
            o("fn:"), C(t) ? this.dispatch("[native]") : this.dispatch(t.toString()), s.respectFunctionNames !== !1 && this.dispatch("function-name:" + String(t.name)), s.respectFunctionProperties && this._object(t);
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
        function $() {
          return { buf: "", write: function(s) {
            this.buf += s;
          }, end: function(s) {
            this.buf += s;
          }, read: function() {
            return this.buf;
          } };
        }
        p.writeToStream = function(s, f, n) {
          return n === void 0 && (n = f, f = {}), E(f = A(s, f), n).dispatch(s);
        };
      }).call(this, c("lYpoI2"), typeof self < "u" ? self : typeof window < "u" ? window : {}, c("buffer").Buffer, arguments[3], arguments[4], arguments[5], arguments[6], "/fake_9a5aa49d.js", "/");
    }, { buffer: 3, crypto: 5, lYpoI2: 11 }], 2: [function(c, d, p) {
      (function(w, U, N, B, I, _, k, j, M) {
        (function(m) {
          var T = typeof Uint8Array < "u" ? Uint8Array : Array, a = "+".charCodeAt(0), y = "/".charCodeAt(0), A = "0".charCodeAt(0), C = "a".charCodeAt(0), E = "A".charCodeAt(0), $ = "-".charCodeAt(0), s = "_".charCodeAt(0);
          function f(n) {
            return n = n.charCodeAt(0), n === a || n === $ ? 62 : n === y || n === s ? 63 : n < A ? -1 : n < A + 10 ? n - A + 26 + 26 : n < E + 26 ? n - E : n < C + 26 ? n - C + 26 : void 0;
          }
          m.toByteArray = function(n) {
            var o, t;
            if (0 < n.length % 4)
              throw new Error("Invalid string. Length must be a multiple of 4");
            var u = n.length, u = n.charAt(u - 2) === "=" ? 2 : n.charAt(u - 1) === "=" ? 1 : 0, l = new T(3 * n.length / 4 - u), D = 0 < u ? n.length - 4 : n.length, Y = 0;
            function F(L) {
              l[Y++] = L;
            }
            for (o = 0; o < D; o += 4, 0)
              F((16711680 & (t = f(n.charAt(o)) << 18 | f(n.charAt(o + 1)) << 12 | f(n.charAt(o + 2)) << 6 | f(n.charAt(o + 3)))) >> 16), F((65280 & t) >> 8), F(255 & t);
            return u == 2 ? F(255 & (t = f(n.charAt(o)) << 2 | f(n.charAt(o + 1)) >> 4)) : u == 1 && (F((t = f(n.charAt(o)) << 10 | f(n.charAt(o + 1)) << 4 | f(n.charAt(o + 2)) >> 2) >> 8 & 255), F(255 & t)), l;
          }, m.fromByteArray = function(n) {
            var o, t, u, l, D = n.length % 3, Y = "";
            function F(L) {
              return "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(L);
            }
            for (o = 0, u = n.length - D; o < u; o += 3)
              t = (n[o] << 16) + (n[o + 1] << 8) + n[o + 2], Y += F((l = t) >> 18 & 63) + F(l >> 12 & 63) + F(l >> 6 & 63) + F(63 & l);
            switch (D) {
              case 1:
                Y = (Y += F((t = n[n.length - 1]) >> 2)) + F(t << 4 & 63) + "==";
                break;
              case 2:
                Y = (Y = (Y += F((t = (n[n.length - 2] << 8) + n[n.length - 1]) >> 10)) + F(t >> 4 & 63)) + F(t << 2 & 63) + "=";
            }
            return Y;
          };
        })(p === void 0 ? this.base64js = {} : p);
      }).call(this, c("lYpoI2"), typeof self < "u" ? self : typeof window < "u" ? window : {}, c("buffer").Buffer, arguments[3], arguments[4], arguments[5], arguments[6], "/node_modules/gulp-browserify/node_modules/base64-js/lib/b64.js", "/node_modules/gulp-browserify/node_modules/base64-js/lib");
    }, { buffer: 3, lYpoI2: 11 }], 3: [function(c, d, p) {
      (function(w, U, a, B, I, _, k, j, M) {
        var m = c("base64-js"), T = c("ieee754");
        function a(e, r, i) {
          if (!(this instanceof a))
            return new a(e, r, i);
          var v, b, S, H, P = typeof e;
          if (r === "base64" && P == "string")
            for (e = (H = e).trim ? H.trim() : H.replace(/^\s+|\s+$/g, ""); e.length % 4 != 0; )
              e += "=";
          if (P == "number")
            v = z(e);
          else if (P == "string")
            v = a.byteLength(e, r);
          else {
            if (P != "object")
              throw new Error("First argument needs to be a number, array or string.");
            v = z(e.length);
          }
          if (a._useTypedArrays ? b = a._augment(new Uint8Array(v)) : ((b = this).length = v, b._isBuffer = !0), a._useTypedArrays && typeof e.byteLength == "number")
            b._set(e);
          else if (O(H = e) || a.isBuffer(H) || H && typeof H == "object" && typeof H.length == "number")
            for (S = 0; S < v; S++)
              a.isBuffer(e) ? b[S] = e.readUInt8(S) : b[S] = e[S];
          else if (P == "string")
            b.write(e, 0, r);
          else if (P == "number" && !a._useTypedArrays && !i)
            for (S = 0; S < v; S++)
              b[S] = 0;
          return b;
        }
        function y(e, r, i, v) {
          return a._charsWritten = ee(function(b) {
            for (var S = [], H = 0; H < b.length; H++)
              S.push(255 & b.charCodeAt(H));
            return S;
          }(r), e, i, v);
        }
        function A(e, r, i, v) {
          return a._charsWritten = ee(function(b) {
            for (var S, H, P = [], K = 0; K < b.length; K++)
              H = b.charCodeAt(K), S = H >> 8, H = H % 256, P.push(H), P.push(S);
            return P;
          }(r), e, i, v);
        }
        function C(e, r, i) {
          var v = "";
          i = Math.min(e.length, i);
          for (var b = r; b < i; b++)
            v += String.fromCharCode(e[b]);
          return v;
        }
        function E(e, r, i, S) {
          S || (x(typeof i == "boolean", "missing or invalid endian"), x(r != null, "missing offset"), x(r + 1 < e.length, "Trying to read beyond buffer length"));
          var b, S = e.length;
          if (!(S <= r))
            return i ? (b = e[r], r + 1 < S && (b |= e[r + 1] << 8)) : (b = e[r] << 8, r + 1 < S && (b |= e[r + 1])), b;
        }
        function $(e, r, i, S) {
          S || (x(typeof i == "boolean", "missing or invalid endian"), x(r != null, "missing offset"), x(r + 3 < e.length, "Trying to read beyond buffer length"));
          var b, S = e.length;
          if (!(S <= r))
            return i ? (r + 2 < S && (b = e[r + 2] << 16), r + 1 < S && (b |= e[r + 1] << 8), b |= e[r], r + 3 < S && (b += e[r + 3] << 24 >>> 0)) : (r + 1 < S && (b = e[r + 1] << 16), r + 2 < S && (b |= e[r + 2] << 8), r + 3 < S && (b |= e[r + 3]), b += e[r] << 24 >>> 0), b;
        }
        function s(e, r, i, v) {
          if (v || (x(typeof i == "boolean", "missing or invalid endian"), x(r != null, "missing offset"), x(r + 1 < e.length, "Trying to read beyond buffer length")), !(e.length <= r))
            return v = E(e, r, i, !0), 32768 & v ? -1 * (65535 - v + 1) : v;
        }
        function f(e, r, i, v) {
          if (v || (x(typeof i == "boolean", "missing or invalid endian"), x(r != null, "missing offset"), x(r + 3 < e.length, "Trying to read beyond buffer length")), !(e.length <= r))
            return v = $(e, r, i, !0), 2147483648 & v ? -1 * (4294967295 - v + 1) : v;
        }
        function n(e, r, i, v) {
          return v || (x(typeof i == "boolean", "missing or invalid endian"), x(r + 3 < e.length, "Trying to read beyond buffer length")), T.read(e, r, i, 23, 4);
        }
        function o(e, r, i, v) {
          return v || (x(typeof i == "boolean", "missing or invalid endian"), x(r + 7 < e.length, "Trying to read beyond buffer length")), T.read(e, r, i, 52, 8);
        }
        function t(e, r, i, v, b) {
          if (b || (x(r != null, "missing value"), x(typeof v == "boolean", "missing or invalid endian"), x(i != null, "missing offset"), x(i + 1 < e.length, "trying to write beyond buffer length"), ne(r, 65535)), b = e.length, !(b <= i))
            for (var S = 0, H = Math.min(b - i, 2); S < H; S++)
              e[i + S] = (r & 255 << 8 * (v ? S : 1 - S)) >>> 8 * (v ? S : 1 - S);
        }
        function u(e, r, i, v, b) {
          if (b || (x(r != null, "missing value"), x(typeof v == "boolean", "missing or invalid endian"), x(i != null, "missing offset"), x(i + 3 < e.length, "trying to write beyond buffer length"), ne(r, 4294967295)), b = e.length, !(b <= i))
            for (var S = 0, H = Math.min(b - i, 4); S < H; S++)
              e[i + S] = r >>> 8 * (v ? S : 3 - S) & 255;
        }
        function l(e, r, i, v, b) {
          b || (x(r != null, "missing value"), x(typeof v == "boolean", "missing or invalid endian"), x(i != null, "missing offset"), x(i + 1 < e.length, "Trying to write beyond buffer length"), re(r, 32767, -32768)), e.length <= i || t(e, 0 <= r ? r : 65535 + r + 1, i, v, b);
        }
        function D(e, r, i, v, b) {
          b || (x(r != null, "missing value"), x(typeof v == "boolean", "missing or invalid endian"), x(i != null, "missing offset"), x(i + 3 < e.length, "Trying to write beyond buffer length"), re(r, 2147483647, -2147483648)), e.length <= i || u(e, 0 <= r ? r : 4294967295 + r + 1, i, v, b);
        }
        function Y(e, r, i, v, b) {
          b || (x(r != null, "missing value"), x(typeof v == "boolean", "missing or invalid endian"), x(i != null, "missing offset"), x(i + 3 < e.length, "Trying to write beyond buffer length"), se(r, 34028234663852886e22, -34028234663852886e22)), e.length <= i || T.write(e, r, i, v, 23, 4);
        }
        function F(e, r, i, v, b) {
          b || (x(r != null, "missing value"), x(typeof v == "boolean", "missing or invalid endian"), x(i != null, "missing offset"), x(i + 7 < e.length, "Trying to write beyond buffer length"), se(r, 17976931348623157e292, -17976931348623157e292)), e.length <= i || T.write(e, r, i, v, 52, 8);
        }
        p.Buffer = a, p.SlowBuffer = a, p.INSPECT_MAX_BYTES = 50, a.poolSize = 8192, a._useTypedArrays = function() {
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
              i = G(e).length;
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
          if (x(O(e), `Usage: Buffer.concat(list, [totalLength])
list should be an Array.`), e.length === 0)
            return new a(0);
          if (e.length === 1)
            return e[0];
          if (typeof r != "number")
            for (b = r = 0; b < e.length; b++)
              r += e[b].length;
          for (var i = new a(r), v = 0, b = 0; b < e.length; b++) {
            var S = e[b];
            S.copy(i, v), v += S.length;
          }
          return i;
        }, a.prototype.write = function(e, r, i, v) {
          isFinite(r) ? isFinite(i) || (v = i, i = void 0) : (K = v, v = r, r = i, i = K), r = Number(r) || 0;
          var b, S, H, P, K = this.length - r;
          switch ((!i || K < (i = Number(i))) && (i = K), v = String(v || "utf8").toLowerCase()) {
            case "hex":
              b = function(Q, J, V, X) {
                V = Number(V) || 0;
                var R = Q.length - V;
                (!X || R < (X = Number(X))) && (X = R), x((R = J.length) % 2 == 0, "Invalid hex string"), R / 2 < X && (X = R / 2);
                for (var Z = 0; Z < X; Z++) {
                  var ae = parseInt(J.substr(2 * Z, 2), 16);
                  x(!isNaN(ae), "Invalid hex string"), Q[V + Z] = ae;
                }
                return a._charsWritten = 2 * Z, Z;
              }(this, e, r, i);
              break;
            case "utf8":
            case "utf-8":
              S = this, H = r, P = i, b = a._charsWritten = ee(G(e), S, H, P);
              break;
            case "ascii":
            case "binary":
              b = y(this, e, r, i);
              break;
            case "base64":
              S = this, H = r, P = i, b = a._charsWritten = ee(oe(e), S, H, P);
              break;
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
              b = A(this, e, r, i);
              break;
            default:
              throw new Error("Unknown encoding");
          }
          return b;
        }, a.prototype.toString = function(e, r, i) {
          var v, b, S, H, P = this;
          if (e = String(e || "utf8").toLowerCase(), r = Number(r) || 0, (i = i !== void 0 ? Number(i) : P.length) === r)
            return "";
          switch (e) {
            case "hex":
              v = function(K, Q, J) {
                var V = K.length;
                (!Q || Q < 0) && (Q = 0), (!J || J < 0 || V < J) && (J = V);
                for (var X = "", R = Q; R < J; R++)
                  X += W(K[R]);
                return X;
              }(P, r, i);
              break;
            case "utf8":
            case "utf-8":
              v = function(K, Q, J) {
                var V = "", X = "";
                J = Math.min(K.length, J);
                for (var R = Q; R < J; R++)
                  K[R] <= 127 ? (V += ie(X) + String.fromCharCode(K[R]), X = "") : X += "%" + K[R].toString(16);
                return V + ie(X);
              }(P, r, i);
              break;
            case "ascii":
            case "binary":
              v = C(P, r, i);
              break;
            case "base64":
              b = P, H = i, v = (S = r) === 0 && H === b.length ? m.fromByteArray(b) : m.fromByteArray(b.slice(S, H));
              break;
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
              v = function(K, Q, J) {
                for (var V = K.slice(Q, J), X = "", R = 0; R < V.length; R += 2)
                  X += String.fromCharCode(V[R] + 256 * V[R + 1]);
                return X;
              }(P, r, i);
              break;
            default:
              throw new Error("Unknown encoding");
          }
          return v;
        }, a.prototype.toJSON = function() {
          return { type: "Buffer", data: Array.prototype.slice.call(this._arr || this, 0) };
        }, a.prototype.copy = function(e, r, i, v) {
          if (r = r || 0, (v = v || v === 0 ? v : this.length) !== (i = i || 0) && e.length !== 0 && this.length !== 0) {
            x(i <= v, "sourceEnd < sourceStart"), x(0 <= r && r < e.length, "targetStart out of bounds"), x(0 <= i && i < this.length, "sourceStart out of bounds"), x(0 <= v && v <= this.length, "sourceEnd out of bounds"), v > this.length && (v = this.length);
            var b = (v = e.length - r < v - i ? e.length - r + i : v) - i;
            if (b < 100 || !a._useTypedArrays)
              for (var S = 0; S < b; S++)
                e[S + r] = this[S + i];
            else
              e._set(this.subarray(i, i + b), r);
          }
        }, a.prototype.slice = function(e, r) {
          var i = this.length;
          if (e = q(e, i, 0), r = q(r, i, i), a._useTypedArrays)
            return a._augment(this.subarray(e, r));
          for (var v = r - e, b = new a(v, void 0, !0), S = 0; S < v; S++)
            b[S] = this[S + e];
          return b;
        }, a.prototype.get = function(e) {
          return console.log(".get() is deprecated. Access using array indexes instead."), this.readUInt8(e);
        }, a.prototype.set = function(e, r) {
          return console.log(".set() is deprecated. Access using array indexes instead."), this.writeUInt8(e, r);
        }, a.prototype.readUInt8 = function(e, r) {
          if (r || (x(e != null, "missing offset"), x(e < this.length, "Trying to read beyond buffer length")), !(e >= this.length))
            return this[e];
        }, a.prototype.readUInt16LE = function(e, r) {
          return E(this, e, !0, r);
        }, a.prototype.readUInt16BE = function(e, r) {
          return E(this, e, !1, r);
        }, a.prototype.readUInt32LE = function(e, r) {
          return $(this, e, !0, r);
        }, a.prototype.readUInt32BE = function(e, r) {
          return $(this, e, !1, r);
        }, a.prototype.readInt8 = function(e, r) {
          if (r || (x(e != null, "missing offset"), x(e < this.length, "Trying to read beyond buffer length")), !(e >= this.length))
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
          i || (x(e != null, "missing value"), x(r != null, "missing offset"), x(r < this.length, "trying to write beyond buffer length"), ne(e, 255)), r >= this.length || (this[r] = e);
        }, a.prototype.writeUInt16LE = function(e, r, i) {
          t(this, e, r, !0, i);
        }, a.prototype.writeUInt16BE = function(e, r, i) {
          t(this, e, r, !1, i);
        }, a.prototype.writeUInt32LE = function(e, r, i) {
          u(this, e, r, !0, i);
        }, a.prototype.writeUInt32BE = function(e, r, i) {
          u(this, e, r, !1, i);
        }, a.prototype.writeInt8 = function(e, r, i) {
          i || (x(e != null, "missing value"), x(r != null, "missing offset"), x(r < this.length, "Trying to write beyond buffer length"), re(e, 127, -128)), r >= this.length || (0 <= e ? this.writeUInt8(e, r, i) : this.writeUInt8(255 + e + 1, r, i));
        }, a.prototype.writeInt16LE = function(e, r, i) {
          l(this, e, r, !0, i);
        }, a.prototype.writeInt16BE = function(e, r, i) {
          l(this, e, r, !1, i);
        }, a.prototype.writeInt32LE = function(e, r, i) {
          D(this, e, r, !0, i);
        }, a.prototype.writeInt32BE = function(e, r, i) {
          D(this, e, r, !1, i);
        }, a.prototype.writeFloatLE = function(e, r, i) {
          Y(this, e, r, !0, i);
        }, a.prototype.writeFloatBE = function(e, r, i) {
          Y(this, e, r, !1, i);
        }, a.prototype.writeDoubleLE = function(e, r, i) {
          F(this, e, r, !0, i);
        }, a.prototype.writeDoubleBE = function(e, r, i) {
          F(this, e, r, !1, i);
        }, a.prototype.fill = function(e, r, i) {
          if (r = r || 0, i = i || this.length, x(typeof (e = typeof (e = e || 0) == "string" ? e.charCodeAt(0) : e) == "number" && !isNaN(e), "value is not a number"), x(r <= i, "end < start"), i !== r && this.length !== 0) {
            x(0 <= r && r < this.length, "start out of bounds"), x(0 <= i && i <= this.length, "end out of bounds");
            for (var v = r; v < i; v++)
              this[v] = e;
          }
        }, a.prototype.inspect = function() {
          for (var e = [], r = this.length, i = 0; i < r; i++)
            if (e[i] = W(this[i]), i === p.INSPECT_MAX_BYTES) {
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
        var L = a.prototype;
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
        function G(e) {
          for (var r = [], i = 0; i < e.length; i++) {
            var v = e.charCodeAt(i);
            if (v <= 127)
              r.push(e.charCodeAt(i));
            else
              for (var b = i, S = (55296 <= v && v <= 57343 && i++, encodeURIComponent(e.slice(b, i + 1)).substr(1).split("%")), H = 0; H < S.length; H++)
                r.push(parseInt(S[H], 16));
          }
          return r;
        }
        function oe(e) {
          return m.toByteArray(e);
        }
        function ee(e, r, i, v) {
          for (var b = 0; b < v && !(b + i >= r.length || b >= e.length); b++)
            r[b + i] = e[b];
          return b;
        }
        function ie(e) {
          try {
            return decodeURIComponent(e);
          } catch {
            return String.fromCharCode(65533);
          }
        }
        function ne(e, r) {
          x(typeof e == "number", "cannot write a non-number as a number"), x(0 <= e, "specified a negative value for writing an unsigned value"), x(e <= r, "value is larger than maximum value for type"), x(Math.floor(e) === e, "value has a fractional component");
        }
        function re(e, r, i) {
          x(typeof e == "number", "cannot write a non-number as a number"), x(e <= r, "value larger than maximum allowed value"), x(i <= e, "value smaller than minimum allowed value"), x(Math.floor(e) === e, "value has a fractional component");
        }
        function se(e, r, i) {
          x(typeof e == "number", "cannot write a non-number as a number"), x(e <= r, "value larger than maximum allowed value"), x(i <= e, "value smaller than minimum allowed value");
        }
        function x(e, r) {
          if (!e)
            throw new Error(r || "Failed assertion");
        }
        a._augment = function(e) {
          return e._isBuffer = !0, e._get = e.get, e._set = e.set, e.get = L.get, e.set = L.set, e.write = L.write, e.toString = L.toString, e.toLocaleString = L.toString, e.toJSON = L.toJSON, e.copy = L.copy, e.slice = L.slice, e.readUInt8 = L.readUInt8, e.readUInt16LE = L.readUInt16LE, e.readUInt16BE = L.readUInt16BE, e.readUInt32LE = L.readUInt32LE, e.readUInt32BE = L.readUInt32BE, e.readInt8 = L.readInt8, e.readInt16LE = L.readInt16LE, e.readInt16BE = L.readInt16BE, e.readInt32LE = L.readInt32LE, e.readInt32BE = L.readInt32BE, e.readFloatLE = L.readFloatLE, e.readFloatBE = L.readFloatBE, e.readDoubleLE = L.readDoubleLE, e.readDoubleBE = L.readDoubleBE, e.writeUInt8 = L.writeUInt8, e.writeUInt16LE = L.writeUInt16LE, e.writeUInt16BE = L.writeUInt16BE, e.writeUInt32LE = L.writeUInt32LE, e.writeUInt32BE = L.writeUInt32BE, e.writeInt8 = L.writeInt8, e.writeInt16LE = L.writeInt16LE, e.writeInt16BE = L.writeInt16BE, e.writeInt32LE = L.writeInt32LE, e.writeInt32BE = L.writeInt32BE, e.writeFloatLE = L.writeFloatLE, e.writeFloatBE = L.writeFloatBE, e.writeDoubleLE = L.writeDoubleLE, e.writeDoubleBE = L.writeDoubleBE, e.fill = L.fill, e.inspect = L.inspect, e.toArrayBuffer = L.toArrayBuffer, e;
        };
      }).call(this, c("lYpoI2"), typeof self < "u" ? self : typeof window < "u" ? window : {}, c("buffer").Buffer, arguments[3], arguments[4], arguments[5], arguments[6], "/node_modules/gulp-browserify/node_modules/buffer/index.js", "/node_modules/gulp-browserify/node_modules/buffer");
    }, { "base64-js": 2, buffer: 3, ieee754: 10, lYpoI2: 11 }], 4: [function(c, d, p) {
      (function(w, U, m, B, I, _, k, j, M) {
        var m = c("buffer").Buffer, T = 4, a = new m(T);
        a.fill(0), d.exports = { hash: function(y, A, C, E) {
          for (var $ = A(function(t, u) {
            t.length % T != 0 && (l = t.length + (T - t.length % T), t = m.concat([t, a], l));
            for (var l, D = [], Y = u ? t.readInt32BE : t.readInt32LE, F = 0; F < t.length; F += T)
              D.push(Y.call(t, F));
            return D;
          }(y = m.isBuffer(y) ? y : new m(y), E), 8 * y.length), A = E, s = new m(C), f = A ? s.writeInt32BE : s.writeInt32LE, n = 0; n < $.length; n++)
            f.call(s, $[n], 4 * n, !0);
          return s;
        } };
      }).call(this, c("lYpoI2"), typeof self < "u" ? self : typeof window < "u" ? window : {}, c("buffer").Buffer, arguments[3], arguments[4], arguments[5], arguments[6], "/node_modules/gulp-browserify/node_modules/crypto-browserify/helpers.js", "/node_modules/gulp-browserify/node_modules/crypto-browserify");
    }, { buffer: 3, lYpoI2: 11 }], 5: [function(c, d, p) {
      (function(w, U, m, B, I, _, k, j, M) {
        var m = c("buffer").Buffer, T = c("./sha"), a = c("./sha256"), y = c("./rng"), A = { sha1: T, sha256: a, md5: c("./md5") }, C = 64, E = new m(C);
        function $(t, u) {
          var l = A[t = t || "sha1"], D = [];
          return l || s("algorithm:", t, "is not yet supported"), { update: function(Y) {
            return m.isBuffer(Y) || (Y = new m(Y)), D.push(Y), Y.length, this;
          }, digest: function(Y) {
            var F = m.concat(D), F = u ? function(L, q, z) {
              m.isBuffer(q) || (q = new m(q)), m.isBuffer(z) || (z = new m(z)), q.length > C ? q = L(q) : q.length < C && (q = m.concat([q, E], C));
              for (var O = new m(C), W = new m(C), G = 0; G < C; G++)
                O[G] = 54 ^ q[G], W[G] = 92 ^ q[G];
              return z = L(m.concat([O, z])), L(m.concat([W, z]));
            }(l, u, F) : l(F);
            return D = null, Y ? F.toString(Y) : F;
          } };
        }
        function s() {
          var t = [].slice.call(arguments).join(" ");
          throw new Error([t, "we accept pull requests", "http://github.com/dominictarr/crypto-browserify"].join(`
`));
        }
        E.fill(0), p.createHash = function(t) {
          return $(t);
        }, p.createHmac = $, p.randomBytes = function(t, u) {
          if (!u || !u.call)
            return new m(y(t));
          try {
            u.call(this, void 0, new m(y(t)));
          } catch (l) {
            u(l);
          }
        };
        var f, n = ["createCredentials", "createCipher", "createCipheriv", "createDecipher", "createDecipheriv", "createSign", "createVerify", "createDiffieHellman", "pbkdf2"], o = function(t) {
          p[t] = function() {
            s("sorry,", t, "is not implemented yet");
          };
        };
        for (f in n)
          o(n[f]);
      }).call(this, c("lYpoI2"), typeof self < "u" ? self : typeof window < "u" ? window : {}, c("buffer").Buffer, arguments[3], arguments[4], arguments[5], arguments[6], "/node_modules/gulp-browserify/node_modules/crypto-browserify/index.js", "/node_modules/gulp-browserify/node_modules/crypto-browserify");
    }, { "./md5": 6, "./rng": 7, "./sha": 8, "./sha256": 9, buffer: 3, lYpoI2: 11 }], 6: [function(c, d, p) {
      (function(w, U, N, B, I, _, k, j, M) {
        var m = c("./helpers");
        function T(s, f) {
          s[f >> 5] |= 128 << f % 32, s[14 + (f + 64 >>> 9 << 4)] = f;
          for (var n = 1732584193, o = -271733879, t = -1732584194, u = 271733878, l = 0; l < s.length; l += 16) {
            var D = n, Y = o, F = t, L = u, n = y(n, o, t, u, s[l + 0], 7, -680876936), u = y(u, n, o, t, s[l + 1], 12, -389564586), t = y(t, u, n, o, s[l + 2], 17, 606105819), o = y(o, t, u, n, s[l + 3], 22, -1044525330);
            n = y(n, o, t, u, s[l + 4], 7, -176418897), u = y(u, n, o, t, s[l + 5], 12, 1200080426), t = y(t, u, n, o, s[l + 6], 17, -1473231341), o = y(o, t, u, n, s[l + 7], 22, -45705983), n = y(n, o, t, u, s[l + 8], 7, 1770035416), u = y(u, n, o, t, s[l + 9], 12, -1958414417), t = y(t, u, n, o, s[l + 10], 17, -42063), o = y(o, t, u, n, s[l + 11], 22, -1990404162), n = y(n, o, t, u, s[l + 12], 7, 1804603682), u = y(u, n, o, t, s[l + 13], 12, -40341101), t = y(t, u, n, o, s[l + 14], 17, -1502002290), n = A(n, o = y(o, t, u, n, s[l + 15], 22, 1236535329), t, u, s[l + 1], 5, -165796510), u = A(u, n, o, t, s[l + 6], 9, -1069501632), t = A(t, u, n, o, s[l + 11], 14, 643717713), o = A(o, t, u, n, s[l + 0], 20, -373897302), n = A(n, o, t, u, s[l + 5], 5, -701558691), u = A(u, n, o, t, s[l + 10], 9, 38016083), t = A(t, u, n, o, s[l + 15], 14, -660478335), o = A(o, t, u, n, s[l + 4], 20, -405537848), n = A(n, o, t, u, s[l + 9], 5, 568446438), u = A(u, n, o, t, s[l + 14], 9, -1019803690), t = A(t, u, n, o, s[l + 3], 14, -187363961), o = A(o, t, u, n, s[l + 8], 20, 1163531501), n = A(n, o, t, u, s[l + 13], 5, -1444681467), u = A(u, n, o, t, s[l + 2], 9, -51403784), t = A(t, u, n, o, s[l + 7], 14, 1735328473), n = C(n, o = A(o, t, u, n, s[l + 12], 20, -1926607734), t, u, s[l + 5], 4, -378558), u = C(u, n, o, t, s[l + 8], 11, -2022574463), t = C(t, u, n, o, s[l + 11], 16, 1839030562), o = C(o, t, u, n, s[l + 14], 23, -35309556), n = C(n, o, t, u, s[l + 1], 4, -1530992060), u = C(u, n, o, t, s[l + 4], 11, 1272893353), t = C(t, u, n, o, s[l + 7], 16, -155497632), o = C(o, t, u, n, s[l + 10], 23, -1094730640), n = C(n, o, t, u, s[l + 13], 4, 681279174), u = C(u, n, o, t, s[l + 0], 11, -358537222), t = C(t, u, n, o, s[l + 3], 16, -722521979), o = C(o, t, u, n, s[l + 6], 23, 76029189), n = C(n, o, t, u, s[l + 9], 4, -640364487), u = C(u, n, o, t, s[l + 12], 11, -421815835), t = C(t, u, n, o, s[l + 15], 16, 530742520), n = E(n, o = C(o, t, u, n, s[l + 2], 23, -995338651), t, u, s[l + 0], 6, -198630844), u = E(u, n, o, t, s[l + 7], 10, 1126891415), t = E(t, u, n, o, s[l + 14], 15, -1416354905), o = E(o, t, u, n, s[l + 5], 21, -57434055), n = E(n, o, t, u, s[l + 12], 6, 1700485571), u = E(u, n, o, t, s[l + 3], 10, -1894986606), t = E(t, u, n, o, s[l + 10], 15, -1051523), o = E(o, t, u, n, s[l + 1], 21, -2054922799), n = E(n, o, t, u, s[l + 8], 6, 1873313359), u = E(u, n, o, t, s[l + 15], 10, -30611744), t = E(t, u, n, o, s[l + 6], 15, -1560198380), o = E(o, t, u, n, s[l + 13], 21, 1309151649), n = E(n, o, t, u, s[l + 4], 6, -145523070), u = E(u, n, o, t, s[l + 11], 10, -1120210379), t = E(t, u, n, o, s[l + 2], 15, 718787259), o = E(o, t, u, n, s[l + 9], 21, -343485551), n = $(n, D), o = $(o, Y), t = $(t, F), u = $(u, L);
          }
          return Array(n, o, t, u);
        }
        function a(s, f, n, o, t, u) {
          return $((f = $($(f, s), $(o, u))) << t | f >>> 32 - t, n);
        }
        function y(s, f, n, o, t, u, l) {
          return a(f & n | ~f & o, s, f, t, u, l);
        }
        function A(s, f, n, o, t, u, l) {
          return a(f & o | n & ~o, s, f, t, u, l);
        }
        function C(s, f, n, o, t, u, l) {
          return a(f ^ n ^ o, s, f, t, u, l);
        }
        function E(s, f, n, o, t, u, l) {
          return a(n ^ (f | ~o), s, f, t, u, l);
        }
        function $(s, f) {
          var n = (65535 & s) + (65535 & f);
          return (s >> 16) + (f >> 16) + (n >> 16) << 16 | 65535 & n;
        }
        d.exports = function(s) {
          return m.hash(s, T, 16);
        };
      }).call(this, c("lYpoI2"), typeof self < "u" ? self : typeof window < "u" ? window : {}, c("buffer").Buffer, arguments[3], arguments[4], arguments[5], arguments[6], "/node_modules/gulp-browserify/node_modules/crypto-browserify/md5.js", "/node_modules/gulp-browserify/node_modules/crypto-browserify");
    }, { "./helpers": 4, buffer: 3, lYpoI2: 11 }], 7: [function(c, d, p) {
      (function(w, U, N, B, I, _, k, j, M) {
        d.exports = function(m) {
          for (var T, a = new Array(m), y = 0; y < m; y++)
            (3 & y) == 0 && (T = 4294967296 * Math.random()), a[y] = T >>> ((3 & y) << 3) & 255;
          return a;
        };
      }).call(this, c("lYpoI2"), typeof self < "u" ? self : typeof window < "u" ? window : {}, c("buffer").Buffer, arguments[3], arguments[4], arguments[5], arguments[6], "/node_modules/gulp-browserify/node_modules/crypto-browserify/rng.js", "/node_modules/gulp-browserify/node_modules/crypto-browserify");
    }, { buffer: 3, lYpoI2: 11 }], 8: [function(c, d, p) {
      (function(w, U, N, B, I, _, k, j, M) {
        var m = c("./helpers");
        function T(A, C) {
          A[C >> 5] |= 128 << 24 - C % 32, A[15 + (C + 64 >> 9 << 4)] = C;
          for (var E, $, s, f = Array(80), n = 1732584193, o = -271733879, t = -1732584194, u = 271733878, l = -1009589776, D = 0; D < A.length; D += 16) {
            for (var Y = n, F = o, L = t, q = u, z = l, O = 0; O < 80; O++) {
              f[O] = O < 16 ? A[D + O] : y(f[O - 3] ^ f[O - 8] ^ f[O - 14] ^ f[O - 16], 1);
              var W = a(a(y(n, 5), (W = o, $ = t, s = u, (E = O) < 20 ? W & $ | ~W & s : !(E < 40) && E < 60 ? W & $ | W & s | $ & s : W ^ $ ^ s)), a(a(l, f[O]), (E = O) < 20 ? 1518500249 : E < 40 ? 1859775393 : E < 60 ? -1894007588 : -899497514)), l = u, u = t, t = y(o, 30), o = n, n = W;
            }
            n = a(n, Y), o = a(o, F), t = a(t, L), u = a(u, q), l = a(l, z);
          }
          return Array(n, o, t, u, l);
        }
        function a(A, C) {
          var E = (65535 & A) + (65535 & C);
          return (A >> 16) + (C >> 16) + (E >> 16) << 16 | 65535 & E;
        }
        function y(A, C) {
          return A << C | A >>> 32 - C;
        }
        d.exports = function(A) {
          return m.hash(A, T, 20, !0);
        };
      }).call(this, c("lYpoI2"), typeof self < "u" ? self : typeof window < "u" ? window : {}, c("buffer").Buffer, arguments[3], arguments[4], arguments[5], arguments[6], "/node_modules/gulp-browserify/node_modules/crypto-browserify/sha.js", "/node_modules/gulp-browserify/node_modules/crypto-browserify");
    }, { "./helpers": 4, buffer: 3, lYpoI2: 11 }], 9: [function(c, d, p) {
      (function(w, U, N, B, I, _, k, j, M) {
        function m(C, E) {
          var $ = (65535 & C) + (65535 & E);
          return (C >> 16) + (E >> 16) + ($ >> 16) << 16 | 65535 & $;
        }
        function T(C, E) {
          var $, s = new Array(1116352408, 1899447441, 3049323471, 3921009573, 961987163, 1508970993, 2453635748, 2870763221, 3624381080, 310598401, 607225278, 1426881987, 1925078388, 2162078206, 2614888103, 3248222580, 3835390401, 4022224774, 264347078, 604807628, 770255983, 1249150122, 1555081692, 1996064986, 2554220882, 2821834349, 2952996808, 3210313671, 3336571891, 3584528711, 113926993, 338241895, 666307205, 773529912, 1294757372, 1396182291, 1695183700, 1986661051, 2177026350, 2456956037, 2730485921, 2820302411, 3259730800, 3345764771, 3516065817, 3600352804, 4094571909, 275423344, 430227734, 506948616, 659060556, 883997877, 958139571, 1322822218, 1537002063, 1747873779, 1955562222, 2024104815, 2227730452, 2361852424, 2428436474, 2756734187, 3204031479, 3329325298), f = new Array(1779033703, 3144134277, 1013904242, 2773480762, 1359893119, 2600822924, 528734635, 1541459225), n = new Array(64);
          C[E >> 5] |= 128 << 24 - E % 32, C[15 + (E + 64 >> 9 << 4)] = E;
          for (var o, t, u = 0; u < C.length; u += 16) {
            for (var l = f[0], D = f[1], Y = f[2], F = f[3], L = f[4], q = f[5], z = f[6], O = f[7], W = 0; W < 64; W++)
              n[W] = W < 16 ? C[W + u] : m(m(m((t = n[W - 2], y(t, 17) ^ y(t, 19) ^ A(t, 10)), n[W - 7]), (t = n[W - 15], y(t, 7) ^ y(t, 18) ^ A(t, 3))), n[W - 16]), $ = m(m(m(m(O, y(t = L, 6) ^ y(t, 11) ^ y(t, 25)), L & q ^ ~L & z), s[W]), n[W]), o = m(y(o = l, 2) ^ y(o, 13) ^ y(o, 22), l & D ^ l & Y ^ D & Y), O = z, z = q, q = L, L = m(F, $), F = Y, Y = D, D = l, l = m($, o);
            f[0] = m(l, f[0]), f[1] = m(D, f[1]), f[2] = m(Y, f[2]), f[3] = m(F, f[3]), f[4] = m(L, f[4]), f[5] = m(q, f[5]), f[6] = m(z, f[6]), f[7] = m(O, f[7]);
          }
          return f;
        }
        var a = c("./helpers"), y = function(C, E) {
          return C >>> E | C << 32 - E;
        }, A = function(C, E) {
          return C >>> E;
        };
        d.exports = function(C) {
          return a.hash(C, T, 32, !0);
        };
      }).call(this, c("lYpoI2"), typeof self < "u" ? self : typeof window < "u" ? window : {}, c("buffer").Buffer, arguments[3], arguments[4], arguments[5], arguments[6], "/node_modules/gulp-browserify/node_modules/crypto-browserify/sha256.js", "/node_modules/gulp-browserify/node_modules/crypto-browserify");
    }, { "./helpers": 4, buffer: 3, lYpoI2: 11 }], 10: [function(c, d, p) {
      (function(w, U, N, B, I, _, k, j, M) {
        p.read = function(m, T, a, y, u) {
          var C, E, $ = 8 * u - y - 1, s = (1 << $) - 1, f = s >> 1, n = -7, o = a ? u - 1 : 0, t = a ? -1 : 1, u = m[T + o];
          for (o += t, C = u & (1 << -n) - 1, u >>= -n, n += $; 0 < n; C = 256 * C + m[T + o], o += t, n -= 8)
            ;
          for (E = C & (1 << -n) - 1, C >>= -n, n += y; 0 < n; E = 256 * E + m[T + o], o += t, n -= 8)
            ;
          if (C === 0)
            C = 1 - f;
          else {
            if (C === s)
              return E ? NaN : 1 / 0 * (u ? -1 : 1);
            E += Math.pow(2, y), C -= f;
          }
          return (u ? -1 : 1) * E * Math.pow(2, C - y);
        }, p.write = function(m, T, a, y, A, l) {
          var E, $, s = 8 * l - A - 1, f = (1 << s) - 1, n = f >> 1, o = A === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0, t = y ? 0 : l - 1, u = y ? 1 : -1, l = T < 0 || T === 0 && 1 / T < 0 ? 1 : 0;
          for (T = Math.abs(T), isNaN(T) || T === 1 / 0 ? ($ = isNaN(T) ? 1 : 0, E = f) : (E = Math.floor(Math.log(T) / Math.LN2), T * (y = Math.pow(2, -E)) < 1 && (E--, y *= 2), 2 <= (T += 1 <= E + n ? o / y : o * Math.pow(2, 1 - n)) * y && (E++, y /= 2), f <= E + n ? ($ = 0, E = f) : 1 <= E + n ? ($ = (T * y - 1) * Math.pow(2, A), E += n) : ($ = T * Math.pow(2, n - 1) * Math.pow(2, A), E = 0)); 8 <= A; m[a + t] = 255 & $, t += u, $ /= 256, A -= 8)
            ;
          for (E = E << A | $, s += A; 0 < s; m[a + t] = 255 & E, t += u, E /= 256, s -= 8)
            ;
          m[a + t - u] |= 128 * l;
        };
      }).call(this, c("lYpoI2"), typeof self < "u" ? self : typeof window < "u" ? window : {}, c("buffer").Buffer, arguments[3], arguments[4], arguments[5], arguments[6], "/node_modules/gulp-browserify/node_modules/ieee754/index.js", "/node_modules/gulp-browserify/node_modules/ieee754");
    }, { buffer: 3, lYpoI2: 11 }], 11: [function(c, d, p) {
      (function(w, U, N, B, I, _, k, j, M) {
        var m, T, a;
        function y() {
        }
        (w = d.exports = {}).nextTick = (T = typeof window < "u" && window.setImmediate, a = typeof window < "u" && window.postMessage && window.addEventListener, T ? function(A) {
          return window.setImmediate(A);
        } : a ? (m = [], window.addEventListener("message", function(A) {
          var C = A.source;
          C !== window && C !== null || A.data !== "process-tick" || (A.stopPropagation(), 0 < m.length && m.shift()());
        }, !0), function(A) {
          m.push(A), window.postMessage("process-tick", "*");
        }) : function(A) {
          setTimeout(A, 0);
        }), w.title = "browser", w.browser = !0, w.env = {}, w.argv = [], w.on = y, w.addListener = y, w.once = y, w.off = y, w.removeListener = y, w.removeAllListeners = y, w.emit = y, w.binding = function(A) {
          throw new Error("process.binding is not supported");
        }, w.cwd = function() {
          return "/";
        }, w.chdir = function(A) {
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
    getTemplateLayoutIds({ template: g, sectionId: h }) {
      let c = [];
      for (let d = 0; d < g[h].layouts.length; d++) {
        const p = g[h].layouts[d];
        c.push(p);
      }
      for (let d = 0; d < g[h].content.length; d++) {
        const p = g[h].content, w = p[d].type;
        for (let U = 0; U < w.length; U++)
          if (w[U][0] === "section")
            for (let N = 0; N < p[d].value[U].length; N++) {
              const B = p[d].value[U][N][1];
              c = c.concat(this.getTemplateLayoutIds({ template: g, sectionId: B }));
            }
      }
      return c;
    },
    createModifier({ baseLayoutIds: g, baseLayouts: h, modifierLayoutIds: c, modifierLayouts: d }) {
      const p = {};
      for (let w = 0; w < c.length; w++) {
        const U = g[w], N = c[w];
        if (N !== U) {
          p[U] = {};
          for (let B = 0; B < h[U].length; B++) {
            const I = h[U][B], _ = d[N][B];
            I.componentId !== _.componentId && (p[U][B] = _.componentId);
          }
        }
      }
      return p;
    },
    _baseWidget(g, h = {}) {
      const c = {
        metadata: h,
        widgets: {
          sections: {},
          content: {}
        },
        content: {
          value: {},
          type: {},
          used: {}
        },
        layouts: {
          items: {},
          head: {}
        },
        components: {}
      };
      return g && (delete c.widgets, c.template = {}), c;
    },
    _checkCondition(g, h) {
      const c = [];
      for (let d = 0; d < h.length; d++) {
        const p = h[d];
        let w = !0;
        Object.hasOwnProperty.call(g, p) || (w = !1), c.push(w);
      }
      return c;
    },
    _traverse(g, h, c = [], d = [], p = [], w, U = !0) {
      let N;
      for (let B = 0; B < h.length; B++)
        if (g[h[B]]) {
          N = h[B];
          break;
        }
      if (N)
        if (Array.isArray(g[N])) {
          const B = g[N];
          for (let I = 0; I < B.length; I++) {
            const _ = B[I];
            if (U ? (p[I] = 1, w = I) : p[w] += 1, Array.isArray(_)) {
              let k = [];
              for (let j = 0; j < _.length; j++) {
                const M = _[j];
                k = this._checkCondition(M, c), k.includes(!0) && (d.unshift(M), this._traverse(M, h, c, d, p, w, !1));
              }
            } else if (typeof _ == "object" && this._checkCondition(_, c).includes(!0)) {
              let k;
              for (let j = 0; j < h.length; j++)
                if (_[h[j]]) {
                  k = h[j];
                  break;
                }
              if (Array.isArray(_[k]))
                for (let j = 0; j < _[k].length; j++) {
                  const M = _[k][j];
                  this._checkCondition(M, c).includes(!0) && (d.unshift(M), this._traverse(M, h, c, d, p, w, !1));
                }
              else
                d.unshift(_), this._traverse(_, h, c, d, p, w, !1);
            }
          }
        } else {
          const B = g[N];
          this._checkCondition(B, c).includes(!0) && (U || (p[w] += 1), d.unshift(B), this._traverse(B, h, c, d, p, w, !1));
        }
      return d.length || d.unshift(g), { list: d, head: p };
    },
    _toParam(g, h, c, d = []) {
      const p = {};
      let w;
      if (g.params && (g._$computedParams || g.values)) {
        const B = this._traverse(g, h, c);
        w = B.head;
        for (let I = 0; I < B.list.length; I++) {
          const _ = B.list[I];
          if (I !== 0 && (_.params.params && _._$computed || _._$computedParams || _.values)) {
            const j = I - 1;
            if (_.paramType === "object" || _.paramType === "array")
              for (let M = 0; M < _.params.length; M++)
                _.params[M].length > 1 ? _.params[M][1] = {
                  _$id: d[j]
                } : _.params[M] = {
                  _$id: d[j]
                };
            else
              _.params = {
                _$id: d[j]
              };
          }
          const k = this._createHash(_);
          d.push(k), p[k] = _;
        }
      }
      if (!d.length)
        return { item: g, params: p };
      const U = { ...g };
      let N;
      for (let B = 0; B < h.length; B++)
        if (U[h[B]]) {
          N = h[B];
          break;
        }
      if (Array.isArray(U[N])) {
        let B = 1;
        for (let I = 0; I < U[N].length; I++)
          if (Array.isArray(U[N][I]))
            for (let _ = 0; _ < U[N][I].length; _++)
              typeof U[N][I][_] == "object" && (I > 0 && (B = B + w[I - 1]), U[N][I][_] = {
                _$id: d[d.length - B]
              });
          else
            typeof U[N][I] == "object" && (I > 0 && (B = B + w[I - 1]), U[N][I] = {
              _$id: d[d.length - B]
            });
      } else
        U.params = {
          _$id: d[d.length - 1]
        };
      return { item: U, params: p };
    },
    toActionSequence(g) {
      let h, c;
      g.actions && (h = this._toAction(g.actions)), g.conditions && (c = this._toAction(g.conditions));
      const d = {
        params: {},
        dsActionSequence: {}
      };
      return h && (d.dsActionItems = h.actions, d.params = h.params, d.dsActionSequence.actions = h.sequence), c && (d.dsActionConditions = c.actions, d.params = { ...d.params, ...c.params }, d.dsActionSequence.conditions = h.sequence), d.dsActionSequence.id = this._createHash(d.dsActionSequence), d;
    },
    _toAction(g, h = {}, c = {}, d = 0, p = {}) {
      const w = [];
      for (let U = 0; U < g.length; U++) {
        const N = g[U], { item: B, params: I } = this._toParam(N, ["params", "values"], ["_$computedParams", "_$computed"]);
        delete B.onSuccess, delete B.onError;
        const _ = this._createHash(B), k = { _$id: _ }, j = `_${U}${d}`;
        if (h[_] = B, c = { ...c, ...I }, w.push(j), N.onSuccess) {
          const M = this._toAction(N.onSuccess, h, c, ++d, p);
          k.onSuccess = M.entries;
        }
        if (N.onError) {
          const M = this._toAction(N.onError, h, c, ++d, p);
          k.onError = M.entries;
        }
        p[j] = k, d === 0 && (p.entry = w);
      }
      return { actions: h, params: c, sequence: p, entries: w };
    },
    toWidget({
      data: g,
      sectionId: h = this.$method("dsUtilities/generateId"),
      groupId: c = this.$method("dsUtilities/generateId"),
      rootElement: d,
      view: p = "default",
      isTemplate: w,
      isHead: U = !0,
      metadata: N
    }) {
      g || (g = this._baseWidget(w, N));
      let B = !1, I = d.childNodes || [];
      U ? g.templateEntry = h : g.childSectionId = h, d.getAttribute instanceof Function && (B = !!d.getAttribute("ds-widget-section") || !!d.getAttribute("ds-widget")), B ? (d.removeAttribute("ds-widget"), I = [d]) : c = this.$method("dsUtilities/generateId");
      const _ = this.$method("dsUtilities/generateId"), k = this._toLayout(
        g,
        h,
        _,
        c,
        I,
        [],
        p === "default",
        w,
        p
      );
      if (!w)
        return g.widgets.sections[h] || (g.widgets.sections[h] = []), g.widgets.sections[h].push({
          groupId: c,
          instanceId: _,
          layout: {
            [p]: k.id
          }
        }), g.widgets.content[h + _ + "_" + p] = g.content.used[_], g;
      g.template[h] || (g.template[h] = {
        events: {},
        layouts: [],
        content: {}
      });
      const j = g.template[h], M = j.layouts.length;
      Object.values(k.events).length && (j.events[M] = k.events), j.layouts.push(k.id);
      const m = g.content.used[_] || [];
      for (let T = 0; T < m.length; T++) {
        const a = m[T];
        j.content[M] || (j.content[M] = []), j.content[M].push({
          value: g.content.value[a],
          type: g.content.type[a]
        });
      }
      return g;
    },
    _toLayout(g, h, c, d, p, w = [], U, N, B, I = [], _ = !0, k = 0) {
      const j = [];
      let M = {}, m = [];
      for (let T = 0; T < p.length; T++) {
        const a = p[T];
        if (a.tagName || a.constructor.name === "Text" && a.textContent.trim()) {
          const y = this._toComponent(g, h, c, d, a, U, N, B), A = { componentId: y.id };
          if (y.hasContent) {
            const E = g.content.used[c] && g.content.used[c].length;
            A.contentIndex = E - 1;
          }
          y.events && (M[k] = y.events), _ && j.push(m.length);
          const C = w.indexOf(a.parentElement);
          if (C > -1 && (A.parentIndex = C), w.push(a), m.push(A), ++k, a.tagName && a.hasAttribute("ds-widget-section")) {
            const E = this.$method("dsUtilities/generateId");
            I.push({
              sectionId: E,
              contentIndex: A.contentIndex
            });
            for (let $ = 0; $ < a.children.length; $++) {
              const s = a.children[$];
              s.tagName && !s.hasAttribute("ds-widget-section") && s.setAttribute("ds-widget", "true"), this.toWidget({
                data: g,
                sectionId: E,
                groupId: d,
                rootElement: s,
                isTemplate: N,
                view: B,
                isHead: !1
              });
            }
          } else if (a.childNodes.length && !y.hasWidget && y.hasChildren) {
            const E = this._toLayout(
              g,
              h,
              c,
              d,
              a.childNodes,
              w,
              U,
              N,
              B,
              I,
              !1,
              k
            );
            I = I.concat(E.instances), k = E.index, m = m.concat(E.items), M = { ...M, ...E.events };
          }
        }
      }
      if (_) {
        for (let a = 0; a < I.length; a++) {
          const y = I[a], A = g.content.used[c][y.contentIndex];
          let C = { default: y.sectionId };
          N && (C = [["default", y.sectionId]]), g.content.value[A] = C;
        }
        for (let a = 0; a < m.length; a++) {
          const y = m[a];
          if (Object.prototype.hasOwnProperty.call(y, "parentIndex")) {
            const A = y.parentIndex;
            Object.prototype.hasOwnProperty.call(m[A], "children") ? m[A].children.push(a) : m[A].children = [a];
          }
        }
        const T = this._createHash(m);
        return g.layouts.items[T] = m, j.length > 1 && (g.layouts.head[T] = j), { items: m, head: j, id: T, sectionId: h, events: M, index: k };
      }
      return { items: m, head: j, sectionId: h, instances: I, events: M, index: k };
    },
    _elementKey(g) {
      const h = g.split("-");
      h.shift();
      const c = h.length - 1;
      return h[c] ? h : null;
    },
    _toElement(g, h, c, d) {
      const p = this.$method("dsUtilities/generateId"), w = {
        metadata: {},
        value: {},
        attributes: {}
      };
      g.content.used[h] || (g.content.used[h] = []);
      for (let N = 0; N < c.length; N++) {
        const [B, I] = c[N], _ = this._elementKey(B);
        if (_)
          if (_.length === 3) {
            const k = p + "/" + _[1];
            w[_[0]][k] || (w[_[0]][k] = {}), w[_[0]][k][_[1]] = I;
          } else
            _.length === 2 ? (w[_[0]] || (w[_[0]] = {}), _[0] === "metadata" ? w[_[0]][_[1]] = [I, d] : w[_[0]][_[1]] = I) : (w[_[0]] || (w[_[0]] = {}), w[_[0]] = I);
      }
      g.content.used[h].push(p), g.content.value[p] = { default: w.value }, g.content.type[p] = w.metadata.type;
      const U = this.$method("dsMetadata/getLanguage");
      U !== "default" && (g.content.value[p][U] = w.value);
    },
    _createHash(g) {
      let h = ce(g, { algorithm: "md5", encoding: "base64" }), c = "";
      h = h.substring(0, h.length - 2);
      for (let d = 0; d < h.length; d++) {
        const p = h[d];
        p === "+" ? c += "$" : p === "/" ? c += "_" : c += p;
      }
      return "_" + c;
    },
    _elementContent(g, h) {
      const c = this.$component(g), d = [];
      if (c && c.get) {
        let p;
        if (c.get.type)
          p = this[`_setNodeValueBy/${c.get.type}`](h, c.get.value);
        else
          for (let w = 0; w < c.get.length; w++) {
            const U = c.get[w];
            p = this[`_setNodeValueBy/${U.type}`](h, U.value);
          }
        d.push(["ds-metadata-type", c.type]), d.push(["ds-value", p]);
      }
      return d;
    },
    "_setNodeValueBy/attribute"(g, h) {
      if (typeof h == "string")
        return g.getAttribute(h);
      const c = {};
      for (let d = 0; d < h.length; d++) {
        const { name: p, key: w } = h[d];
        c[w] = g.getAttribute(p);
      }
      return c;
    },
    "_setNodeValueBy/getter"(g, h) {
      if (typeof h == "string")
        return g.__lookupGetter__(h) ? g[h] : "";
      {
        const c = {};
        for (let d = 0; d < h.length; d++) {
          const { name: p, key: w } = h[d];
          g.__lookupGetter__(h) ? c[w] = g[p] : c[w] = "";
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
      const h = /\[(.+)\]/, c = new RegExp(h, "g").test(g);
      return { text: g, token: c };
    },
    _toComponent(g, h, c, d, p, w, U, N) {
      const B = { attributes: {} }, I = p.attributes || {};
      let _ = {}, k = [], j = !1, M = !1, m = !1, T = !!p.childNodes.length;
      if (p.tagName) {
        const a = p.tagName.toLowerCase(), y = this._elementContent(a, p);
        B.id = a, y.length && (k = k.concat(y), M = !0);
      } else {
        const a = this._parseText(p.textContent);
        M = !0, B.id = "text", k.push(["ds-metadata-type", "text"]), k.push(["ds-value", a]);
      }
      if (I.constructor.name === "NamedNodeMap")
        for (let a = 0; a < I.length; a++) {
          const y = I[a], [A, C] = this._attachAttribute(
            g,
            y.name,
            y.value,
            M,
            m,
            T,
            j,
            p,
            a
          );
          A.event && (_ = { ..._, ...A.event }), M = A.hasContent, m = A.hasWidget, T = A.hasChildren, j = A.hasAttributes, B.attributes = { ...B.attributes, ...A.attributes }, k = [...k, ...A.setAttributes], a = C;
        }
      if (m === "ds-widget") {
        p.removeAttribute("ds-widget");
        const a = this.toWidget({ data: g, rootElement: p, groupId: d, isTemporary: w, isTemplate: U, view: N, isHead: !1 });
        k.push(["ds-metadata-type", "section"]), k.push(["ds-value", { default: a.childSectionId }]);
      }
      return k.length && this._toElement(g, c, k, w), j || delete B.attributes, { id: this._addComponent(g, B), hasContent: M, hasWidget: m, hasChildren: T, events: _ };
    },
    _kebabToCamelCase(g) {
      return g.replace(/-./g, (h) => h[1].toUpperCase());
    },
    _attachAttribute(g, h, c, d, p, w, U, N, B) {
      const I = {
        hasContent: d,
        hasWidget: p,
        hasChildren: w,
        hasAttributes: U,
        attributes: {},
        setAttributes: []
      };
      if (h.startsWith("@")) {
        let _ = c.split(" ");
        if (g.metadata.actions) {
          if (_ = _.map((j) => g.metadata.actions[j] || j), !_.length)
            throw Error("dsTemplate: Could not find a matching action");
        } else
          throw Error("dsTemplate: No actions defined in template script");
        let k = h.split("ns");
        return k.length > 1 ? k = k[0].substring(1).substring(0, k[0].length - 2) + "/" + k[1].substring(1) : k = k[0].substring(1), I.event = {
          [this._kebabToCamelCase(k)]: _
        }, --B, N.removeAttribute(h), [I, B];
      }
      return h === "ds-content-html" ? (d || (I.setAttributes.push(["ds-metadata-type", "html"]), I.setAttributes.push(["ds-value", N.innerHTML]), I.hasContent = !0, I.hasChildren = !1), --B, N.removeAttribute(h), [I, B]) : h === "ds-widget" ? (d || (I.hasWidget = h, I.hasContent = !0), [I, B]) : h === "ds-widget-section" ? (d || (I.setAttributes.push(["ds-metadata-type", "section"]), I.setAttributes.push(["ds-value", ""]), I.hasWidget = h, I.hasContent = !0), [I, B]) : (h === "class" ? I.attributes[h] = this._sortClassName(c) : I.attributes[h] = c, I.hasAttributes = !0, [I, B]);
    },
    _addComponent(g, h) {
      const c = this._createHash(h);
      return this.components[c] || (g.components[c] = h), c;
    },
    _sortClassName(g) {
      return g.split(" ").sort().join(" ");
    }
  }
};
export {
  le as default
};
