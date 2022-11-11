const q = (e, t) => {
  const s = e[t];
  return s ? typeof s == "function" ? s() : Promise.resolve(s) : new Promise((n, i) => {
    (typeof queueMicrotask == "function" ? queueMicrotask : setTimeout)(i.bind(null, new Error("Unknown variable dynamic import: " + t)));
  });
}, k = {
  link({
    id: e,
    crossOrigin: t,
    href: s,
    media: n,
    referrerPolicy: i,
    rel: o = "stylesheet",
    integrity: u,
    onSuccess: c = () => {
    },
    onError: l = () => {
    }
  }) {
    const [h, a] = this._exists(e, "link", "href", s);
    h.onerror = () => l(), h.onload = () => c(), h.id = e, h.rel = o, h.crossOrigin = t || null, n && (h.media = n), i && (h.referrerPolicy = i), u && (h.integrity = u), h.href = s, a || document.head.appendChild(h);
  },
  script({
    id: e,
    async: t,
    crossOrigin: s,
    defer: n,
    integrity: i,
    nonce: o,
    referrerPolicy: u,
    src: c,
    type: l = "text/javascript",
    nomodule: h,
    globalVars: a = [],
    onSuccess: y = () => {
    },
    onError: O = () => {
    }
  }) {
    const [r, P] = this._exists(e, "script", "src", c);
    r.onerror = () => O(), r.onload = () => {
      const f = {};
      for (let d = 0; d < a.length; d++) {
        const _ = a[d];
        f[_] = window[_];
      }
      y(f);
    }, r.id = e, r.type = l, r.async = t || null, r.crossOrigin = s || null, r.defer = n || null, i && (r.integrity = i), u && (r.referrerPolicy = u), r.nomodule = h || null, r.nonce = o || null, r.src = c, P || document.head.appendChild(r);
  },
  _exists(e, t, s, n) {
    let i = document.getElementById(e), o = !1;
    if (i) {
      if (i[s] === n)
        return;
      o = !0;
    } else
      i = document.createElement(t);
    return [i, o];
  }
};
function m(e, t = []) {
  let s = {
    name: e.name,
    version: e.version
  };
  this.name = e.name, this.version = e.version, e.data && (s = { ...s, ...e.data });
  for (let n = 0; n < t.length; n++) {
    const i = t[n];
    i.use && i.use.includes(e.name) && (s[i.name] = i.value), i.name === "isDev" && i.value ? (s.isDev = !0, e.name !== "dsDevTool" && s.$action("dsDevTool/set", { _context: s, plugin: e })) : s[i.name] = i.value;
  }
  if (e.dependencies && (this.dependencies = e.dependencies, s.dependencies = e.dependencies), e.methods) {
    const n = {};
    for (const i in e.methods)
      if (Object.hasOwnProperty.call(e.methods, i)) {
        const o = e.methods[i];
        s[i] = o, i.charAt(0) !== "_" && (n[i] = o.bind(s));
      }
    this.methods = n;
  }
  if (e.tokens) {
    const n = {};
    for (const i in e.tokens)
      if (Object.hasOwnProperty.call(e.tokens, i)) {
        const o = e.tokens[i];
        s[i] = o, n[i] = o.bind(s);
      }
    this.tokens = n;
  }
  if (e.components) {
    for (let n = 0; n < e.components.length; n++) {
      const i = e.components[n];
      i.lazy && (i.isLazy = !0);
    }
    this.components = e.components;
  }
  e.setup && (this.setup = e.setup.bind(s));
}
m.prototype.init = function(e) {
  if (this.setup)
    return this.setup(e);
};
const p = "dsManager", g = 1, v = {
  name: p,
  version: g,
  data: {
    _methods: {},
    _tokens: {},
    _components: {},
    buildId: "",
    plugins: {},
    pluginUseQueue: [],
    appBuildId: "",
    depQueue: {},
    queue: {},
    isLoaded: {},
    initialising: {},
    setupOnRequest: {},
    setupOnRequestQueue: {},
    options: {},
    context: {}
  },
  setup({
    buildId: e,
    plugins: t = {},
    isDev: s
  }) {
    this.buildId = e, this.context = [
      {
        name: "$action",
        value: this._action.bind(this)
      },
      {
        name: "$method",
        value: this._method.bind(this)
      },
      {
        name: "$resource",
        value: k
      },
      {
        name: "isDev",
        value: s
      },
      {
        name: "$token",
        value: this._token.bind(this),
        use: ["dsToken"]
      },
      {
        name: "$component",
        value: this._component.bind(this),
        use: ["dsComponent", "dsParse", "dsElement"]
      }
    ], this._add({
      name: p,
      version: g,
      methods: {
        use: this.use
      }
    }), this.isLoaded[p] = !0;
    for (const n in t)
      Object.prototype.hasOwnProperty.call(t, n) && this.use({ plugin: t[n] });
    if (this._processQueue(), s)
      return {
        $method: this._method.bind(this),
        $action: this._action.bind(this)
      };
  },
  methods: {
    use({ plugin: e, process: t }) {
      this._addOptions(e.name, e.options), this.plugins[e.name] = e, this.pluginUseQueue.push(e), this.queue[e.name] = [], this.depQueue[e.name] = [], t && this._processQueue();
    },
    _processQueue() {
      for (let e = 0; e < this.pluginUseQueue.length; e++) {
        const t = this.pluginUseQueue[e];
        if (!this._getQueue(t.name).length) {
          const n = this._install(t.name, t.plugin);
          this.queue[t.name] = [n];
        }
      }
    },
    _action(e, t, s = {}) {
      this._callbackWhenAvailable(e, () => {
        const n = s.onSuccess, i = s.onError, o = this._methods[e](t);
        i && o instanceof Error ? i.method ? i.method({ ...i.params, results: o }) : i(o) : o instanceof Promise ? Promise.resolve(o).then((u) => {
          n && (n.method ? n.method({ ...n.params, results: u }) : n(u));
        }).catch((u) => {
          i && (i.method ? i.method({ ...i.params, results: u }) : i(u));
        }) : n && (n.method ? n.method({ ...n.params, results: o }) : n(o));
      });
    },
    _actionExists(e) {
      return this._methods[e];
    },
    _add(e) {
      if (e.methods) {
        for (const t in e.methods)
          if (Object.hasOwnProperty.call(e.methods, t)) {
            const s = e.methods[t];
            this._methods[`${e.name}/${t}`] = s;
          }
      }
      if (e.tokens) {
        for (const t in e.tokens)
          if (Object.hasOwnProperty.call(e.tokens, t)) {
            const s = e.tokens[t];
            this._tokens[`${e.name}/${t}`] = s;
          }
      }
      if (e.components)
        for (let t = 0; t < e.components.length; t++) {
          const s = e.components[t];
          this._components[s.name] = { ...s, plugin: e.name };
        }
    },
    _addOptions(e, t = {}) {
      this.setupOnRequest[e] = !!t.setupOnRequest, this.isLoaded[e] = !1, this.options[e] = t;
    },
    _component(e) {
      if (this._components[e]) {
        const t = this._components[e];
        if (!this.isLoaded[t.plugin] && this.setupOnRequestQueue[t.plugin]) {
          const s = t.plugin, n = this._getOptions(s), i = this.setupOnRequestQueue[s];
          this._setup(i, n.setup).catch((o) => console.error(o));
        }
        return t.isLazy && !t.loading && (t.loading = !0, t.lazy().then(() => {
          t.loading = !1;
        }).catch((s) => console.error(s))), t;
      }
    },
    _get(e) {
      return this.plugins[e] ? this.plugins[e].plugin : this.setupOnRequestQueue[e];
    },
    _callbackWhenAvailable(e, t) {
      const s = e.split("/")[0];
      if (this.isLoaded[s] && this._actionExists(e))
        return t();
      if (this.initialising[s]) {
        const n = this._getQueue(s);
        Promise.all(n).then(() => {
          this._actionExists(e) ? t() : console.error("action does not exist: " + e);
        });
      } else {
        const n = this._get(s), i = this._install(s, n, !0);
        this.queue[s].push(i), i.then(() => {
          this._actionExists(e) ? t() : console.error("action does not exist: " + e);
        }).catch((o) => console.error(o));
      }
    },
    _getQueue(e) {
      return this.queue[e] || [];
    },
    _getOptions(e) {
      return this.options[e] || {};
    },
    _install(e, t, s = !1) {
      return new Promise((n, i) => {
        const o = this._getOptions(e);
        if (this.isLoaded[e] = !1, this.initialising[e] = !0, o.import)
          if (!o.setupOnRequest || s)
            q(/* @__PURE__ */ Object.assign({ "./plugins/ds-plugin-database.js": () => import("./ds-plugin-database.69286ba1.js"), "./plugins/ds-plugin-parse.js": () => import("./ds-plugin-parse.3000a30c.js"), "./plugins/ds-plugin-template.js": () => import("./ds-plugin-template.f07c7cf9.js"), "./plugins/ds-plugin-utilities.js": () => import("./ds-plugin-utilities.84c17b1f.js") }), `./plugins/${o.import}.js`).then(({ default: u }) => {
              u.dependencies && this._installDependencies(e, u.dependencies);
              const c = new m(u, this.context);
              this._add(c), this._setup(c, o.setup).then(() => n(`Setup import ${e}`)).catch((l) => i(l));
            }).catch((u) => i(u));
          else
            return this.initialising[e] = !1, n(`Lazy loading ${e}`);
        else {
          let u;
          if (this.setupOnRequestQueue[e] ? u = this.setupOnRequestQueue[e] : (u = new m(t, this.context), this._add(u)), o.setupOnRequest && !s)
            return this.setupOnRequestQueue[e] = u, this.initialising[e] = !1, n();
          u.dependencies && this._installDependencies(e, u.dependencies), this._setup(u, o.setup).then(() => n(e)).catch((c) => i(c));
        }
      });
    },
    _installDependencies(e, t) {
      for (let s = 0; s < t.length; s++) {
        const n = t[s];
        if (!this.isLoaded[n.name]) {
          const i = this._use({
            name: n.name,
            options: {
              setupOnRequest: !1
            }
          });
          this.depQueue[e].push(i);
        }
      }
    },
    _method(e, t) {
      try {
        if (this._methods[e])
          return this._methods[e](t);
        throw new Error('Method "' + e + '" does not exist');
      } catch (s) {
        console.error(e, s);
      }
    },
    _setup(e, t = {}) {
      return new Promise((s, n) => {
        const i = this.depQueue[e.name];
        Promise.all(i).then(() => {
          const o = e.init(t);
          o instanceof Promise ? o.then(() => {
            this.isLoaded[e.name] = !0, this.initialising[e.name] = !1, delete this.setupOnRequestQueue[e.name], console.log("Plugin successfully async loaded: " + e.name), s(e.name);
          }).catch((u) => n(u)) : (this.isLoaded[e.name] = !0, this.initialising[e.name] = !1, console.log("Plugin successfully loaded: " + e.name), s(e.name));
        }).catch((o) => n(o));
      });
    },
    _token(e, t) {
      if (this._tokens[e])
        return this._tokens[e](t);
    },
    _use({ name: e, options: t = {} }) {
      if (this.isLoaded[e])
        return Promise.resolve();
      const s = this._get(e), n = this._getQueue(e);
      let i = !1;
      if (!this.initialising[e] && (!this.setupOnRequest[e] || !t.setupOnRequest) && (i = !0), !n || i) {
        const o = this._install(e, s, i);
        return n.push(o), o;
      }
      return Promise.resolve();
    }
  }
};
export {
  v as default
};
