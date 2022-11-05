var k = function(o, i) {
  return k = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(t, e) {
    t.__proto__ = e;
  } || function(t, e) {
    for (var n in e)
      Object.prototype.hasOwnProperty.call(e, n) && (t[n] = e[n]);
  }, k(o, i);
};
function p(o, i) {
  if (typeof i != "function" && i !== null)
    throw new TypeError("Class extends value " + String(i) + " is not a constructor or null");
  function t() {
    this.constructor = o;
  }
  k(o, i), o.prototype = i === null ? Object.create(i) : (t.prototype = i.prototype, new t());
}
var E = function() {
  return E = Object.assign || function(o) {
    for (var i, t = 1, e = arguments.length; t < e; t++)
      for (var n in i = arguments[t])
        Object.prototype.hasOwnProperty.call(i, n) && (o[n] = i[n]);
    return o;
  }, E.apply(this, arguments);
};
function y(o, i, t, e) {
  return new (t || (t = Promise))(function(n, r) {
    function s(d) {
      try {
        l(e.next(d));
      } catch (u) {
        r(u);
      }
    }
    function a(d) {
      try {
        l(e.throw(d));
      } catch (u) {
        r(u);
      }
    }
    function l(d) {
      var u;
      d.done ? n(d.value) : (u = d.value, u instanceof t ? u : new t(function(h) {
        h(u);
      })).then(s, a);
    }
    l((e = e.apply(o, i || [])).next());
  });
}
function m(o, i) {
  var t, e, n, r, s = { label: 0, sent: function() {
    if (1 & n[0])
      throw n[1];
    return n[1];
  }, trys: [], ops: [] };
  return r = { next: a(0), throw: a(1), return: a(2) }, typeof Symbol == "function" && (r[Symbol.iterator] = function() {
    return this;
  }), r;
  function a(l) {
    return function(d) {
      return function(u) {
        if (t)
          throw new TypeError("Generator is already executing.");
        for (; s; )
          try {
            if (t = 1, e && (n = 2 & u[0] ? e.return : u[0] ? e.throw || ((n = e.return) && n.call(e), 0) : e.next) && !(n = n.call(e, u[1])).done)
              return n;
            switch (e = 0, n && (u = [2 & u[0], n.value]), u[0]) {
              case 0:
              case 1:
                n = u;
                break;
              case 4:
                return s.label++, { value: u[1], done: !1 };
              case 5:
                s.label++, e = u[1], u = [0];
                continue;
              case 7:
                u = s.ops.pop(), s.trys.pop();
                continue;
              default:
                if (n = s.trys, !((n = n.length > 0 && n[n.length - 1]) || u[0] !== 6 && u[0] !== 2)) {
                  s = 0;
                  continue;
                }
                if (u[0] === 3 && (!n || u[1] > n[0] && u[1] < n[3])) {
                  s.label = u[1];
                  break;
                }
                if (u[0] === 6 && s.label < n[1]) {
                  s.label = n[1], n = u;
                  break;
                }
                if (n && s.label < n[2]) {
                  s.label = n[2], s.ops.push(u);
                  break;
                }
                n[2] && s.ops.pop(), s.trys.pop();
                continue;
            }
            u = i.call(o, s);
          } catch (h) {
            u = [6, h], e = 0;
          } finally {
            t = n = 0;
          }
        if (5 & u[0])
          throw u[1];
        return { value: u[0] ? u[1] : void 0, done: !0 };
      }([l, d]);
    };
  }
}
var N, _ = function(o) {
  function i(t) {
    var e, n = this;
    return (n = o.call(this, "ClientResponseError") || this).url = "", n.status = 0, n.data = {}, n.isAbort = !1, n.originalError = null, Object.setPrototypeOf(n, i.prototype), t instanceof i || (n.originalError = t), t !== null && typeof t == "object" && (n.url = typeof t.url == "string" ? t.url : "", n.status = typeof t.status == "number" ? t.status : 0, n.data = t.data !== null && typeof t.data == "object" ? t.data : {}), typeof DOMException < "u" && t instanceof DOMException && (n.isAbort = !0), n.name = "ClientResponseError " + n.status, n.message = ((e = n.data) === null || e === void 0 ? void 0 : e.message) || "Something went wrong while processing your request.", n;
  }
  return p(i, o), i.prototype.toJSON = function() {
    return E({}, this);
  }, i;
}(Error), O = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;
function x(o, i, t) {
  var e = Object.assign({}, t || {}), n = e.encode || M;
  if (!O.test(o))
    throw new TypeError("argument name is invalid");
  var r = n(i);
  if (r && !O.test(r))
    throw new TypeError("argument val is invalid");
  var s = o + "=" + r;
  if (e.maxAge != null) {
    var a = e.maxAge - 0;
    if (isNaN(a) || !isFinite(a))
      throw new TypeError("option maxAge is invalid");
    s += "; Max-Age=" + Math.floor(a);
  }
  if (e.domain) {
    if (!O.test(e.domain))
      throw new TypeError("option domain is invalid");
    s += "; Domain=" + e.domain;
  }
  if (e.path) {
    if (!O.test(e.path))
      throw new TypeError("option path is invalid");
    s += "; Path=" + e.path;
  }
  if (e.expires) {
    if (!function(l) {
      return Object.prototype.toString.call(l) === "[object Date]" || l instanceof Date;
    }(e.expires) || isNaN(e.expires.valueOf()))
      throw new TypeError("option expires is invalid");
    s += "; Expires=" + e.expires.toUTCString();
  }
  if (e.httpOnly && (s += "; HttpOnly"), e.secure && (s += "; Secure"), e.priority)
    switch (typeof e.priority == "string" ? e.priority.toLowerCase() : e.priority) {
      case "low":
        s += "; Priority=Low";
        break;
      case "medium":
        s += "; Priority=Medium";
        break;
      case "high":
        s += "; Priority=High";
        break;
      default:
        throw new TypeError("option priority is invalid");
    }
  if (e.sameSite)
    switch (typeof e.sameSite == "string" ? e.sameSite.toLowerCase() : e.sameSite) {
      case !0:
        s += "; SameSite=Strict";
        break;
      case "lax":
        s += "; SameSite=Lax";
        break;
      case "strict":
        s += "; SameSite=Strict";
        break;
      case "none":
        s += "; SameSite=None";
        break;
      default:
        throw new TypeError("option sameSite is invalid");
    }
  return s;
}
function J(o) {
  return o.indexOf("%") !== -1 ? decodeURIComponent(o) : o;
}
function M(o) {
  return encodeURIComponent(o);
}
function L(o) {
  if (o)
    try {
      var i = decodeURIComponent(N(o.split(".")[1]).split("").map(function(t) {
        return "%" + ("00" + t.charCodeAt(0).toString(16)).slice(-2);
      }).join(""));
      return JSON.parse(i) || {};
    } catch {
    }
  return {};
}
N = typeof atob == "function" ? atob : function(o) {
  var i = String(o).replace(/=+$/, "");
  if (i.length % 4 == 1)
    throw new Error("'atob' failed: The string to be decoded is not correctly encoded.");
  for (var t, e, n = 0, r = 0, s = ""; e = i.charAt(r++); ~e && (t = n % 4 ? 64 * t + e : e, n++ % 4) ? s += String.fromCharCode(255 & t >> (-2 * n & 6)) : 0)
    e = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".indexOf(e);
  return s;
};
var g = function() {
  function o(i) {
    i === void 0 && (i = {}), this.load(i || {});
  }
  return o.prototype.load = function(i) {
    this.id = i.id !== void 0 ? i.id : "", this.created = i.created !== void 0 ? i.created : "", this.updated = i.updated !== void 0 ? i.updated : "";
  }, Object.defineProperty(o.prototype, "isNew", { get: function() {
    return !this.id || this.id === "00000000-0000-0000-0000-000000000000";
  }, enumerable: !1, configurable: !0 }), o.prototype.clone = function() {
    return new this.constructor(JSON.parse(JSON.stringify(this)));
  }, o.prototype.export = function() {
    return Object.assign({}, this);
  }, o;
}(), q = function(o) {
  function i() {
    return o !== null && o.apply(this, arguments) || this;
  }
  return p(i, o), i.prototype.load = function(t) {
    o.prototype.load.call(this, t);
    for (var e = 0, n = Object.entries(t); e < n.length; e++) {
      var r = n[e], s = r[0], a = r[1];
      this[s] = a;
    }
    this["@collectionId"] = t["@collectionId"] !== void 0 ? t["@collectionId"] : "", this["@collectionName"] = t["@collectionName"] !== void 0 ? t["@collectionName"] : "", this["@expand"] = t["@expand"] !== void 0 ? t["@expand"] : {};
  }, i;
}(g), P = function(o) {
  function i() {
    return o !== null && o.apply(this, arguments) || this;
  }
  return p(i, o), i.prototype.load = function(t) {
    o.prototype.load.call(this, t), this.email = typeof t.email == "string" ? t.email : "", this.verified = !!t.verified, this.lastResetSentAt = typeof t.lastResetSentAt == "string" ? t.lastResetSentAt : "", this.lastVerificationSentAt = typeof t.lastVerificationSentAt == "string" ? t.lastVerificationSentAt : "", this.profile = t.profile ? new q(t.profile) : null;
  }, i;
}(g), A = function(o) {
  function i() {
    return o !== null && o.apply(this, arguments) || this;
  }
  return p(i, o), i.prototype.load = function(t) {
    o.prototype.load.call(this, t), this.avatar = typeof t.avatar == "number" ? t.avatar : 0, this.email = typeof t.email == "string" ? t.email : "", this.lastResetSentAt = typeof t.lastResetSentAt == "string" ? t.lastResetSentAt : "";
  }, i;
}(g), V = function() {
  function o() {
    this.baseToken = "", this.baseModel = null, this._onChangeCallbacks = [];
  }
  return Object.defineProperty(o.prototype, "token", { get: function() {
    return this.baseToken;
  }, enumerable: !1, configurable: !0 }), Object.defineProperty(o.prototype, "model", { get: function() {
    return this.baseModel;
  }, enumerable: !1, configurable: !0 }), Object.defineProperty(o.prototype, "isValid", { get: function() {
    return !function(i, t) {
      t === void 0 && (t = 0);
      var e = L(i);
      return !(Object.keys(e).length > 0 && (!e.exp || e.exp - t > Date.now() / 1e3));
    }(this.token);
  }, enumerable: !1, configurable: !0 }), o.prototype.save = function(i, t) {
    this.baseToken = i || "", this.baseModel = t !== null && typeof t == "object" ? (t == null ? void 0 : t.verified) !== "undefined" ? new P(t) : new A(t) : null, this.triggerChange();
  }, o.prototype.clear = function() {
    this.baseToken = "", this.baseModel = null, this.triggerChange();
  }, o.prototype.loadFromCookie = function(i, t) {
    t === void 0 && (t = "pb_auth");
    var e = function(r, s) {
      var a = {};
      if (typeof r != "string")
        return a;
      for (var l = Object.assign({}, s || {}).decode || J, d = 0; d < r.length; ) {
        var u = r.indexOf("=", d);
        if (u === -1)
          break;
        var h = r.indexOf(";", d);
        if (h === -1)
          h = r.length;
        else if (h < u) {
          d = r.lastIndexOf(";", u - 1) + 1;
          continue;
        }
        var c = r.slice(d, u).trim();
        if (a[c] === void 0) {
          var f = r.slice(u + 1, h).trim();
          f.charCodeAt(0) === 34 && (f = f.slice(1, -1));
          try {
            a[c] = l(f);
          } catch {
            a[c] = f;
          }
        }
        d = h + 1;
      }
      return a;
    }(i || "")[t] || "", n = {};
    try {
      (typeof (n = JSON.parse(e)) === null || typeof n != "object" || Array.isArray(n)) && (n = {});
    } catch {
    }
    this.save(n.token || "", n.model || {});
  }, o.prototype.exportToCookie = function(i, t) {
    var e, n, r;
    t === void 0 && (t = "pb_auth");
    var s = { secure: !0, sameSite: !0, httpOnly: !0, path: "/" }, a = L(this.token);
    a != null && a.exp ? s.expires = new Date(1e3 * a.exp) : s.expires = new Date("1970-01-01"), i = Object.assign({}, s, i);
    var l = { token: this.token, model: ((e = this.model) === null || e === void 0 ? void 0 : e.export()) || null }, d = x(t, JSON.stringify(l), i), u = typeof Blob < "u" ? new Blob([d]).size : d.length;
    return l.model && u > 4096 && (l.model = { id: (n = l == null ? void 0 : l.model) === null || n === void 0 ? void 0 : n.id, email: (r = l == null ? void 0 : l.model) === null || r === void 0 ? void 0 : r.email }, this.model instanceof P && (l.model.verified = this.model.verified), d = x(t, JSON.stringify(l), i)), d;
  }, o.prototype.onChange = function(i, t) {
    var e = this;
    return t === void 0 && (t = !1), this._onChangeCallbacks.push(i), t && i(this.token, this.model), function() {
      for (var n = e._onChangeCallbacks.length - 1; n >= 0; n--)
        if (e._onChangeCallbacks[n] == i)
          return delete e._onChangeCallbacks[n], void e._onChangeCallbacks.splice(n, 1);
    };
  }, o.prototype.triggerChange = function() {
    for (var i = 0, t = this._onChangeCallbacks; i < t.length; i++) {
      var e = t[i];
      e && e(this.token, this.model);
    }
  }, o;
}(), z = function(o) {
  function i(t) {
    t === void 0 && (t = "pocketbase_auth");
    var e = o.call(this) || this;
    return e.storageFallback = {}, e.storageKey = t, e;
  }
  return p(i, o), Object.defineProperty(i.prototype, "token", { get: function() {
    return (this._storageGet(this.storageKey) || {}).token || "";
  }, enumerable: !1, configurable: !0 }), Object.defineProperty(i.prototype, "model", { get: function() {
    var t, e = this._storageGet(this.storageKey) || {};
    return e === null || typeof e != "object" || e.model === null || typeof e.model != "object" ? null : ((t = e.model) === null || t === void 0 ? void 0 : t.verified) !== void 0 ? new P(e.model) : new A(e.model);
  }, enumerable: !1, configurable: !0 }), i.prototype.save = function(t, e) {
    this._storageSet(this.storageKey, { token: t, model: e }), o.prototype.save.call(this, t, e);
  }, i.prototype.clear = function() {
    this._storageRemove(this.storageKey), o.prototype.clear.call(this);
  }, i.prototype._storageGet = function(t) {
    var e;
    if (typeof window < "u" && (window == null ? void 0 : window.localStorage)) {
      var n = ((e = window == null ? void 0 : window.localStorage) === null || e === void 0 ? void 0 : e.getItem(t)) || "";
      try {
        return JSON.parse(n);
      } catch {
        return n;
      }
    }
    return this.storageFallback[t];
  }, i.prototype._storageSet = function(t, e) {
    var n;
    if (typeof window < "u" && (window == null ? void 0 : window.localStorage)) {
      var r = e;
      typeof e != "string" && (r = JSON.stringify(e)), (n = window == null ? void 0 : window.localStorage) === null || n === void 0 || n.setItem(t, r);
    } else
      this.storageFallback[t] = e;
  }, i.prototype._storageRemove = function(t) {
    var e;
    typeof window < "u" && ((e = window == null ? void 0 : window.localStorage) === null || e === void 0 || e.removeItem(t)), delete this.storageFallback[t];
  }, i;
}(V), R = function(o) {
  this.client = o;
}, H = function(o) {
  function i() {
    return o !== null && o.apply(this, arguments) || this;
  }
  return p(i, o), i.prototype.getAll = function(t) {
    return t === void 0 && (t = {}), this.client.send("/api/settings", { method: "GET", params: t }).then(function(e) {
      return e || {};
    });
  }, i.prototype.update = function(t, e) {
    return t === void 0 && (t = {}), e === void 0 && (e = {}), this.client.send("/api/settings", { method: "PATCH", params: e, body: t }).then(function(n) {
      return n || {};
    });
  }, i.prototype.testS3 = function(t) {
    return t === void 0 && (t = {}), this.client.send("/api/settings/test/s3", { method: "POST", params: t }).then(function() {
      return !0;
    });
  }, i.prototype.testEmail = function(t, e, n) {
    n === void 0 && (n = {});
    var r = { email: t, template: e };
    return this.client.send("/api/settings/test/email", { method: "POST", params: n, body: r }).then(function() {
      return !0;
    });
  }, i;
}(R), G = function(o, i, t, e, n) {
  this.page = o > 0 ? o : 1, this.perPage = i >= 0 ? i : 0, this.totalItems = t >= 0 ? t : 0, this.totalPages = e >= 0 ? e : 0, this.items = n || [];
}, F = function(o) {
  function i() {
    return o !== null && o.apply(this, arguments) || this;
  }
  return p(i, o), i.prototype._getFullList = function(t, e, n) {
    var r = this;
    e === void 0 && (e = 100), n === void 0 && (n = {});
    var s = [], a = function(l) {
      return y(r, void 0, void 0, function() {
        return m(this, function(d) {
          return [2, this._getList(t, l, e, n).then(function(u) {
            var h = u, c = h.items, f = h.totalItems;
            return s = s.concat(c), c.length && f > s.length ? a(l + 1) : s;
          })];
        });
      });
    };
    return a(1);
  }, i.prototype._getList = function(t, e, n, r) {
    var s = this;
    return e === void 0 && (e = 1), n === void 0 && (n = 30), r === void 0 && (r = {}), r = Object.assign({ page: e, perPage: n }, r), this.client.send(t, { method: "GET", params: r }).then(function(a) {
      var l = [];
      if (a != null && a.items) {
        a.items = a.items || [];
        for (var d = 0, u = a.items; d < u.length; d++) {
          var h = u[d];
          l.push(s.decode(h));
        }
      }
      return new G((a == null ? void 0 : a.page) || 1, (a == null ? void 0 : a.perPage) || 0, (a == null ? void 0 : a.totalItems) || 0, (a == null ? void 0 : a.totalPages) || 0, l);
    });
  }, i.prototype._getOne = function(t, e, n) {
    var r = this;
    return n === void 0 && (n = {}), this.client.send(t + "/" + encodeURIComponent(e), { method: "GET", params: n }).then(function(s) {
      return r.decode(s);
    });
  }, i.prototype._create = function(t, e, n) {
    var r = this;
    return e === void 0 && (e = {}), n === void 0 && (n = {}), this.client.send(t, { method: "POST", params: n, body: e }).then(function(s) {
      return r.decode(s);
    });
  }, i.prototype._update = function(t, e, n, r) {
    var s = this;
    return n === void 0 && (n = {}), r === void 0 && (r = {}), this.client.send(t + "/" + encodeURIComponent(e), { method: "PATCH", params: r, body: n }).then(function(a) {
      return s.decode(a);
    });
  }, i.prototype._delete = function(t, e, n) {
    return n === void 0 && (n = {}), this.client.send(t + "/" + encodeURIComponent(e), { method: "DELETE", params: n }).then(function() {
      return !0;
    });
  }, i;
}(R), T = function(o) {
  function i() {
    return o !== null && o.apply(this, arguments) || this;
  }
  return p(i, o), i.prototype.getFullList = function(t, e) {
    return t === void 0 && (t = 100), e === void 0 && (e = {}), this._getFullList(this.baseCrudPath(), t, e);
  }, i.prototype.getList = function(t, e, n) {
    return t === void 0 && (t = 1), e === void 0 && (e = 30), n === void 0 && (n = {}), this._getList(this.baseCrudPath(), t, e, n);
  }, i.prototype.getOne = function(t, e) {
    return e === void 0 && (e = {}), this._getOne(this.baseCrudPath(), t, e);
  }, i.prototype.create = function(t, e) {
    return t === void 0 && (t = {}), e === void 0 && (e = {}), this._create(this.baseCrudPath(), t, e);
  }, i.prototype.update = function(t, e, n) {
    return e === void 0 && (e = {}), n === void 0 && (n = {}), this._update(this.baseCrudPath(), t, e, n);
  }, i.prototype.delete = function(t, e) {
    return e === void 0 && (e = {}), this._delete(this.baseCrudPath(), t, e);
  }, i;
}(F), K = function(o) {
  function i() {
    return o !== null && o.apply(this, arguments) || this;
  }
  return p(i, o), i.prototype.decode = function(t) {
    return new A(t);
  }, i.prototype.baseCrudPath = function() {
    return "/api/admins";
  }, i.prototype.authResponse = function(t) {
    var e = this.decode((t == null ? void 0 : t.admin) || {});
    return (t == null ? void 0 : t.token) && (t == null ? void 0 : t.admin) && this.client.authStore.save(t.token, e), Object.assign({}, t, { token: (t == null ? void 0 : t.token) || "", admin: e });
  }, i.prototype.authViaEmail = function(t, e, n, r) {
    return n === void 0 && (n = {}), r === void 0 && (r = {}), n = Object.assign({ email: t, password: e }, n), this.client.send(this.baseCrudPath() + "/auth-via-email", { method: "POST", params: r, body: n, headers: { Authorization: "" } }).then(this.authResponse.bind(this));
  }, i.prototype.refresh = function(t, e) {
    return t === void 0 && (t = {}), e === void 0 && (e = {}), this.client.send(this.baseCrudPath() + "/refresh", { method: "POST", params: e, body: t }).then(this.authResponse.bind(this));
  }, i.prototype.requestPasswordReset = function(t, e, n) {
    return e === void 0 && (e = {}), n === void 0 && (n = {}), e = Object.assign({ email: t }, e), this.client.send(this.baseCrudPath() + "/request-password-reset", { method: "POST", params: n, body: e }).then(function() {
      return !0;
    });
  }, i.prototype.confirmPasswordReset = function(t, e, n, r, s) {
    return r === void 0 && (r = {}), s === void 0 && (s = {}), r = Object.assign({ token: t, password: e, passwordConfirm: n }, r), this.client.send(this.baseCrudPath() + "/confirm-password-reset", { method: "POST", params: s, body: r }).then(this.authResponse.bind(this));
  }, i;
}(T), $ = function(o) {
  function i() {
    return o !== null && o.apply(this, arguments) || this;
  }
  return p(i, o), i.prototype.load = function(t) {
    o.prototype.load.call(this, t), this.userId = typeof t.userId == "string" ? t.userId : "", this.provider = typeof t.provider == "string" ? t.provider : "", this.providerId = typeof t.providerId == "string" ? t.providerId : "";
  }, i;
}(g), B = function(o) {
  function i() {
    return o !== null && o.apply(this, arguments) || this;
  }
  return p(i, o), i.prototype.decode = function(t) {
    return new P(t);
  }, i.prototype.baseCrudPath = function() {
    return "/api/users";
  }, i.prototype.authResponse = function(t) {
    var e = this.decode((t == null ? void 0 : t.user) || {});
    return (t == null ? void 0 : t.token) && (t == null ? void 0 : t.user) && this.client.authStore.save(t.token, e), Object.assign({}, t, { token: (t == null ? void 0 : t.token) || "", user: e });
  }, i.prototype.listAuthMethods = function(t) {
    return t === void 0 && (t = {}), this.client.send(this.baseCrudPath() + "/auth-methods", { method: "GET", params: t }).then(function(e) {
      return Object.assign({}, e, { emailPassword: !!(e != null && e.emailPassword), authProviders: Array.isArray(e == null ? void 0 : e.authProviders) ? e == null ? void 0 : e.authProviders : [] });
    });
  }, i.prototype.authViaEmail = function(t, e, n, r) {
    return n === void 0 && (n = {}), r === void 0 && (r = {}), n = Object.assign({ email: t, password: e }, n), this.client.send(this.baseCrudPath() + "/auth-via-email", { method: "POST", params: r, body: n, headers: { Authorization: "" } }).then(this.authResponse.bind(this));
  }, i.prototype.authViaOAuth2 = function(t, e, n, r, s, a) {
    return s === void 0 && (s = {}), a === void 0 && (a = {}), s = Object.assign({ provider: t, code: e, codeVerifier: n, redirectUrl: r }, s), this.client.send(this.baseCrudPath() + "/auth-via-oauth2", { method: "POST", params: a, body: s, headers: { Authorization: "" } }).then(this.authResponse.bind(this));
  }, i.prototype.refresh = function(t, e) {
    return t === void 0 && (t = {}), e === void 0 && (e = {}), this.client.send(this.baseCrudPath() + "/refresh", { method: "POST", params: e, body: t }).then(this.authResponse.bind(this));
  }, i.prototype.requestPasswordReset = function(t, e, n) {
    return e === void 0 && (e = {}), n === void 0 && (n = {}), e = Object.assign({ email: t }, e), this.client.send(this.baseCrudPath() + "/request-password-reset", { method: "POST", params: n, body: e }).then(function() {
      return !0;
    });
  }, i.prototype.confirmPasswordReset = function(t, e, n, r, s) {
    return r === void 0 && (r = {}), s === void 0 && (s = {}), r = Object.assign({ token: t, password: e, passwordConfirm: n }, r), this.client.send(this.baseCrudPath() + "/confirm-password-reset", { method: "POST", params: s, body: r }).then(this.authResponse.bind(this));
  }, i.prototype.requestVerification = function(t, e, n) {
    return e === void 0 && (e = {}), n === void 0 && (n = {}), e = Object.assign({ email: t }, e), this.client.send(this.baseCrudPath() + "/request-verification", { method: "POST", params: n, body: e }).then(function() {
      return !0;
    });
  }, i.prototype.confirmVerification = function(t, e, n) {
    return e === void 0 && (e = {}), n === void 0 && (n = {}), e = Object.assign({ token: t }, e), this.client.send(this.baseCrudPath() + "/confirm-verification", { method: "POST", params: n, body: e }).then(this.authResponse.bind(this));
  }, i.prototype.requestEmailChange = function(t, e, n) {
    return e === void 0 && (e = {}), n === void 0 && (n = {}), e = Object.assign({ newEmail: t }, e), this.client.send(this.baseCrudPath() + "/request-email-change", { method: "POST", params: n, body: e }).then(function() {
      return !0;
    });
  }, i.prototype.confirmEmailChange = function(t, e, n, r) {
    return n === void 0 && (n = {}), r === void 0 && (r = {}), n = Object.assign({ token: t, password: e }, n), this.client.send(this.baseCrudPath() + "/confirm-email-change", { method: "POST", params: r, body: n }).then(this.authResponse.bind(this));
  }, i.prototype.listExternalAuths = function(t, e) {
    return e === void 0 && (e = {}), this.client.send(this.baseCrudPath() + "/" + encodeURIComponent(t) + "/external-auths", { method: "GET", params: e }).then(function(n) {
      var r = [];
      if (Array.isArray(n))
        for (var s = 0, a = n; s < a.length; s++) {
          var l = a[s];
          r.push(new $(l));
        }
      return r;
    });
  }, i.prototype.unlinkExternalAuth = function(t, e, n) {
    return n === void 0 && (n = {}), this.client.send(this.baseCrudPath() + "/" + encodeURIComponent(t) + "/external-auths/" + encodeURIComponent(e), { method: "DELETE", params: n }).then(function() {
      return !0;
    });
  }, i;
}(T), Q = function() {
  function o(i) {
    i === void 0 && (i = {}), this.load(i || {});
  }
  return o.prototype.load = function(i) {
    this.id = i.id !== void 0 ? i.id : "", this.name = i.name !== void 0 ? i.name : "", this.type = i.type !== void 0 ? i.type : "text", this.system = !!i.system, this.required = !!i.required, this.unique = !!i.unique, this.options = typeof i.options == "object" && i.options !== null ? i.options : {};
  }, o;
}(), W = function(o) {
  function i() {
    return o !== null && o.apply(this, arguments) || this;
  }
  return p(i, o), i.prototype.load = function(t) {
    o.prototype.load.call(this, t), this.name = typeof t.name == "string" ? t.name : "", this.system = !!t.system, this.listRule = typeof t.listRule == "string" ? t.listRule : null, this.viewRule = typeof t.viewRule == "string" ? t.viewRule : null, this.createRule = typeof t.createRule == "string" ? t.createRule : null, this.updateRule = typeof t.updateRule == "string" ? t.updateRule : null, this.deleteRule = typeof t.deleteRule == "string" ? t.deleteRule : null, t.schema = Array.isArray(t.schema) ? t.schema : [], this.schema = [];
    for (var e = 0, n = t.schema; e < n.length; e++) {
      var r = n[e];
      this.schema.push(new Q(r));
    }
  }, i;
}(g), X = function(o) {
  function i() {
    return o !== null && o.apply(this, arguments) || this;
  }
  return p(i, o), i.prototype.decode = function(t) {
    return new W(t);
  }, i.prototype.baseCrudPath = function() {
    return "/api/collections";
  }, i.prototype.import = function(t, e, n) {
    return e === void 0 && (e = !1), n === void 0 && (n = {}), y(this, void 0, void 0, function() {
      return m(this, function(r) {
        return [2, this.client.send(this.baseCrudPath() + "/import", { method: "PUT", params: n, body: { collections: t, deleteMissing: e } }).then(function() {
          return !0;
        })];
      });
    });
  }, i;
}(T), Y = function(o) {
  function i() {
    return o !== null && o.apply(this, arguments) || this;
  }
  return p(i, o), i.prototype.decode = function(t) {
    return new q(t);
  }, i.prototype.baseCrudPath = function(t) {
    return "/api/collections/" + encodeURIComponent(t) + "/records";
  }, i.prototype.getFileUrl = function(t, e, n) {
    n === void 0 && (n = {});
    var r = [];
    r.push(this.client.baseUrl.replace(/\/+$/gm, "")), r.push("api"), r.push("files"), r.push(t["@collectionId"]), r.push(t.id), r.push(e);
    var s = r.join("/");
    if (Object.keys(n).length) {
      var a = new URLSearchParams(n);
      s += (s.includes("?") ? "&" : "?") + a;
    }
    return s;
  }, i;
}(function(o) {
  function i() {
    return o !== null && o.apply(this, arguments) || this;
  }
  return p(i, o), i.prototype.getFullList = function(t, e, n) {
    return e === void 0 && (e = 100), n === void 0 && (n = {}), this._getFullList(this.baseCrudPath(t), e, n);
  }, i.prototype.getList = function(t, e, n, r) {
    return e === void 0 && (e = 1), n === void 0 && (n = 30), r === void 0 && (r = {}), this._getList(this.baseCrudPath(t), e, n, r);
  }, i.prototype.getOne = function(t, e, n) {
    return n === void 0 && (n = {}), this._getOne(this.baseCrudPath(t), e, n);
  }, i.prototype.create = function(t, e, n) {
    return e === void 0 && (e = {}), n === void 0 && (n = {}), this._create(this.baseCrudPath(t), e, n);
  }, i.prototype.update = function(t, e, n, r) {
    return n === void 0 && (n = {}), r === void 0 && (r = {}), this._update(this.baseCrudPath(t), e, n, r);
  }, i.prototype.delete = function(t, e, n) {
    return n === void 0 && (n = {}), this._delete(this.baseCrudPath(t), e, n);
  }, i;
}(F)), U = function(o) {
  function i() {
    return o !== null && o.apply(this, arguments) || this;
  }
  return p(i, o), i.prototype.load = function(t) {
    o.prototype.load.call(this, t), t.remoteIp = t.remoteIp || t.ip, this.url = typeof t.url == "string" ? t.url : "", this.method = typeof t.method == "string" ? t.method : "GET", this.status = typeof t.status == "number" ? t.status : 200, this.auth = typeof t.auth == "string" ? t.auth : "guest", this.remoteIp = typeof t.remoteIp == "string" ? t.remoteIp : "", this.userIp = typeof t.userIp == "string" ? t.userIp : "", this.referer = typeof t.referer == "string" ? t.referer : "", this.userAgent = typeof t.userAgent == "string" ? t.userAgent : "", this.meta = typeof t.meta == "object" && t.meta !== null ? t.meta : {};
  }, i;
}(g), Z = function(o) {
  function i() {
    return o !== null && o.apply(this, arguments) || this;
  }
  return p(i, o), i.prototype.getRequestsList = function(t, e, n) {
    return t === void 0 && (t = 1), e === void 0 && (e = 30), n === void 0 && (n = {}), n = Object.assign({ page: t, perPage: e }, n), this.client.send("/api/logs/requests", { method: "GET", params: n }).then(function(r) {
      var s = [];
      if (r != null && r.items) {
        r.items = (r == null ? void 0 : r.items) || [];
        for (var a = 0, l = r.items; a < l.length; a++) {
          var d = l[a];
          s.push(new U(d));
        }
      }
      return new G((r == null ? void 0 : r.page) || 1, (r == null ? void 0 : r.perPage) || 0, (r == null ? void 0 : r.totalItems) || 0, (r == null ? void 0 : r.totalPages) || 0, s);
    });
  }, i.prototype.getRequest = function(t, e) {
    return e === void 0 && (e = {}), this.client.send("/api/logs/requests/" + encodeURIComponent(t), { method: "GET", params: e }).then(function(n) {
      return new U(n);
    });
  }, i.prototype.getRequestsStats = function(t) {
    return t === void 0 && (t = {}), this.client.send("/api/logs/requests/stats", { method: "GET", params: t }).then(function(e) {
      return e;
    });
  }, i;
}(R), tt = function(o) {
  function i() {
    var t = o !== null && o.apply(this, arguments) || this;
    return t.clientId = "", t.eventSource = null, t.subscriptions = {}, t;
  }
  return p(i, o), i.prototype.subscribe = function(t, e) {
    var n;
    return y(this, void 0, void 0, function() {
      return m(this, function(r) {
        switch (r.label) {
          case 0:
            if (!t)
              throw new Error("subscription must be set.");
            return this.subscriptions[t] && ((n = this.eventSource) === null || n === void 0 || n.removeEventListener(t, this.subscriptions[t])), this.subscriptions[t] = function(s) {
              var a, l = s;
              try {
                a = JSON.parse(l == null ? void 0 : l.data);
              } catch {
              }
              e(a || {});
            }, this.eventSource ? [3, 1] : (this.connect(), [3, 3]);
          case 1:
            return this.clientId ? [4, this.submitSubscriptions()] : [3, 3];
          case 2:
            r.sent(), r.label = 3;
          case 3:
            return [2];
        }
      });
    });
  }, i.prototype.unsubscribe = function(t) {
    var e;
    return y(this, void 0, void 0, function() {
      return m(this, function(n) {
        switch (n.label) {
          case 0:
            if (t) {
              if (!this.subscriptions[t])
                return [2];
              (e = this.eventSource) === null || e === void 0 || e.removeEventListener(t, this.subscriptions[t]), delete this.subscriptions[t];
            } else
              this.removeSubscriptionListeners(), this.subscriptions = {};
            return this.clientId ? [4, this.submitSubscriptions()] : [3, 2];
          case 1:
            n.sent(), n.label = 2;
          case 2:
            return Object.keys(this.subscriptions).length || this.disconnect(), [2];
        }
      });
    });
  }, i.prototype.submitSubscriptions = function() {
    return y(this, void 0, void 0, function() {
      return m(this, function(t) {
        return this.addSubscriptionListeners(), [2, this.client.send("/api/realtime", { method: "POST", body: { clientId: this.clientId, subscriptions: Object.keys(this.subscriptions) }, params: { $autoCancel: !1 } }).then(function() {
          return !0;
        })];
      });
    });
  }, i.prototype.addSubscriptionListeners = function() {
    if (this.eventSource)
      for (var t in this.removeSubscriptionListeners(), this.subscriptions)
        this.eventSource.addEventListener(t, this.subscriptions[t]);
  }, i.prototype.removeSubscriptionListeners = function() {
    if (this.eventSource)
      for (var t in this.subscriptions)
        this.eventSource.removeEventListener(t, this.subscriptions[t]);
  }, i.prototype.connectHandler = function(t) {
    var e = t;
    this.clientId = e == null ? void 0 : e.lastEventId, this.submitSubscriptions();
  }, i.prototype.connect = function() {
    var t = this;
    this.disconnect(), this.eventSource = new EventSource(this.client.buildUrl("/api/realtime")), this.eventSource.addEventListener("PB_CONNECT", function(e) {
      return t.connectHandler(e);
    });
  }, i.prototype.disconnect = function() {
    var t, e, n = this;
    this.removeSubscriptionListeners(), (t = this.eventSource) === null || t === void 0 || t.removeEventListener("PB_CONNECT", function(r) {
      return n.connectHandler(r);
    }), (e = this.eventSource) === null || e === void 0 || e.close(), this.eventSource = null, this.clientId = "";
  }, i;
}(R), nt = function() {
  function o(i, t, e) {
    i === void 0 && (i = "/"), t === void 0 && (t = "en-US"), this.cancelControllers = {}, this.baseUrl = i, this.lang = t, this.authStore = e || new z(), this.admins = new K(this), this.users = new B(this), this.records = new Y(this), this.collections = new X(this), this.logs = new Z(this), this.settings = new H(this), this.realtime = new tt(this);
  }
  return Object.defineProperty(o.prototype, "AuthStore", { get: function() {
    return this.authStore;
  }, enumerable: !1, configurable: !0 }), Object.defineProperty(o.prototype, "Settings", { get: function() {
    return this.settings;
  }, enumerable: !1, configurable: !0 }), Object.defineProperty(o.prototype, "Admins", { get: function() {
    return this.admins;
  }, enumerable: !1, configurable: !0 }), Object.defineProperty(o.prototype, "Users", { get: function() {
    return this.users;
  }, enumerable: !1, configurable: !0 }), Object.defineProperty(o.prototype, "Collections", { get: function() {
    return this.collections;
  }, enumerable: !1, configurable: !0 }), Object.defineProperty(o.prototype, "Records", { get: function() {
    return this.records;
  }, enumerable: !1, configurable: !0 }), Object.defineProperty(o.prototype, "Logs", { get: function() {
    return this.logs;
  }, enumerable: !1, configurable: !0 }), Object.defineProperty(o.prototype, "Realtime", { get: function() {
    return this.realtime;
  }, enumerable: !1, configurable: !0 }), o.prototype.cancelRequest = function(i) {
    return this.cancelControllers[i] && (this.cancelControllers[i].abort(), delete this.cancelControllers[i]), this;
  }, o.prototype.cancelAllRequests = function() {
    for (var i in this.cancelControllers)
      this.cancelControllers[i].abort();
    return this.cancelControllers = {}, this;
  }, o.prototype.send = function(i, t) {
    var e, n, r, s, a, l, d, u, h;
    return y(this, void 0, void 0, function() {
      var c, f, C, j, w, I, D = this;
      return m(this, function(et) {
        return (c = Object.assign({ method: "GET" }, t)).body && c.body.constructor.name !== "FormData" && (typeof c.body != "string" && (c.body = JSON.stringify(c.body)), ((e = c == null ? void 0 : c.headers) === null || e === void 0 ? void 0 : e["Content-Type"]) === void 0 && (c.headers = Object.assign({}, c.headers, { "Content-Type": "application/json" }))), ((n = c == null ? void 0 : c.headers) === null || n === void 0 ? void 0 : n["Accept-Language"]) === void 0 && (c.headers = Object.assign({}, c.headers, { "Accept-Language": this.lang })), ((r = this.authStore) === null || r === void 0 ? void 0 : r.token) && ((s = c == null ? void 0 : c.headers) === null || s === void 0 ? void 0 : s.Authorization) === void 0 && (f = "Admin", ((a = this.authStore.model) === null || a === void 0 ? void 0 : a.verified) !== void 0 && (f = "User"), c.headers = Object.assign({}, c.headers, { Authorization: f + " " + this.authStore.token })), ((l = c.params) === null || l === void 0 ? void 0 : l.$autoCancel) !== !1 && (C = ((d = c.params) === null || d === void 0 ? void 0 : d.$cancelKey) || (c.method || "GET") + i, this.cancelRequest(C), j = new AbortController(), this.cancelControllers[C] = j, c.signal = j.signal), (u = c.params) === null || u === void 0 || delete u.$autoCancel, (h = c.params) === null || h === void 0 || delete h.$cancelKey, w = this.buildUrl(i), c.params !== void 0 && ((I = this.serializeQueryParams(c.params)) && (w += (w.includes("?") ? "&" : "?") + I), delete c.params), this.beforeSend && (c = Object.assign({}, this.beforeSend(w, c))), [2, fetch(w, c).then(function(v) {
          return y(D, void 0, void 0, function() {
            var b;
            return m(this, function(S) {
              switch (S.label) {
                case 0:
                  b = {}, S.label = 1;
                case 1:
                  return S.trys.push([1, 3, , 4]), [4, v.json()];
                case 2:
                  return b = S.sent(), [3, 4];
                case 3:
                  return S.sent(), [3, 4];
                case 4:
                  if (this.afterSend && (b = this.afterSend(v, b)), v.status >= 400)
                    throw new _({ url: v.url, status: v.status, data: b });
                  return [2, b];
              }
            });
          });
        }).catch(function(v) {
          throw new _(v);
        })];
      });
    });
  }, o.prototype.buildUrl = function(i) {
    var t = this.baseUrl + (this.baseUrl.endsWith("/") ? "" : "/");
    return i && (t += i.startsWith("/") ? i.substring(1) : i), t;
  }, o.prototype.serializeQueryParams = function(i) {
    var t = [];
    for (var e in i)
      if (i[e] !== null) {
        var n = i[e], r = encodeURIComponent(e);
        if (Array.isArray(n))
          for (var s = 0, a = n; s < a.length; s++) {
            var l = a[s];
            t.push(r + "=" + encodeURIComponent(l));
          }
        else
          n instanceof Date ? t.push(r + "=" + encodeURIComponent(n.toISOString())) : typeof n !== null && typeof n == "object" ? t.push(r + "=" + encodeURIComponent(JSON.stringify(n))) : t.push(r + "=" + encodeURIComponent(n));
      }
    return t.join("&");
  }, o;
}();
export {
  A as Admin,
  V as BaseAuthStore,
  _ as ClientResponseError,
  W as Collection,
  $ as ExternalAuth,
  z as LocalAuthStore,
  U as LogRequest,
  q as Record,
  Q as SchemaField,
  P as User,
  nt as default
};
