const y = (e, t) => {
  const i = e[t];
  return i ? typeof i == "function" ? i() : Promise.resolve(i) : new Promise((n, s) => {
    (typeof queueMicrotask == "function" ? queueMicrotask : setTimeout)(s.bind(null, new Error("Unknown variable dynamic import: " + t)));
  });
}, P = {
  link({
    id: e,
    crossOrigin: t,
    href: i,
    media: n,
    referrerPolicy: s,
    rel: o = "stylesheet",
    integrity: u,
    onSuccess: l = () => {
    },
    onError: c = () => {
    }
  }) {
    const [h, a] = this._exists(e, "link", "href", i);
    h.onerror = () => c(), h.onload = () => l(), h.id = e, h.rel = o, h.crossOrigin = t || null, n && (h.media = n), s && (h.referrerPolicy = s), u && (h.integrity = u), h.href = i, a || document.head.appendChild(h);
  },
  script({
    id: e,
    async: t,
    crossOrigin: i,
    defer: n,
    integrity: s,
    nonce: o,
    referrerPolicy: u,
    src: l,
    type: c = "text/javascript",
    nomodule: h,
    globalVars: a = [],
    onSuccess: _ = () => {
    },
    onError: g = () => {
    }
  }) {
    const [r, O] = this._exists(e, "script", "src", l);
    r.onerror = () => g(), r.onload = () => {
      const p = {};
      for (let d = 0; d < a.length; d++) {
        const m = a[d];
        p[m] = window[m];
      }
      _(p);
    }, r.id = e, r.type = c, r.async = t || null, r.crossOrigin = i || null, r.defer = n || null, s && (r.integrity = s), u && (r.referrerPolicy = u), r.nomodule = h || null, r.nonce = o || null, r.src = l, O || document.head.appendChild(r);
  },
  _exists(e, t, i, n) {
    let s = document.getElementById(e), o = !1;
    if (s) {
      if (s[i] === n)
        return;
      o = !0;
    } else
      s = document.createElement(t);
    return [s, o];
  }
}, f = "dsManager", q = 1, k = {
  name: f,
  version: q,
  data: {
    DsPlugin: () => {
    },
    _methods: {},
    _tokens: {},
    _components: {},
    buildId: 0,
    plugins: {},
    pluginUseQueue: [],
    depQueue: {},
    queue: {},
    isLoaded: {},
    initialising: {},
    setupOnRequest: {},
    setupOnRequestQueue: {},
    options: {},
    context: {},
    isDev: !1
  },
  setup({
    DsPlugin: e,
    plugins: t = {},
    isDev: i = !1
  }) {
    this.DsPlugin = e, this.context = [
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
        value: P
      },
      {
        name: "isDev",
        value: i
      },
      {
        name: "$token",
        value: this._token.bind(this),
        scope: ["dsToken"]
      },
      {
        name: "$component",
        value: this._component.bind(this),
        scope: ["dsComponent", "dsParse", "dsView"]
      }
    ], this.isDev = i, this.isLoaded[f] = !0;
    for (const n in t)
      if (Object.prototype.hasOwnProperty.call(t, n)) {
        const s = t[n];
        this._addOptions(s.name, s.options), this.plugins[s.name] = s, this.pluginUseQueue.push(s), this.queue[s.name] = [], this.depQueue[s.name] = [];
      }
    for (let n = 0; n < this.pluginUseQueue.length; n++) {
      const s = this.pluginUseQueue[n];
      if (!this._getQueue(s.name).length) {
        const u = this._install(s.name, s.plugin);
        this.queue[s.name] = [u];
      }
    }
    if (i)
      return {
        $method: this._method.bind(this),
        $action: this._action.bind(this)
      };
  },
  methods: {
    _action(e, t, i = {}) {
      this._callbackWhenAvailable(e, () => {
        const n = i.onSuccess, s = i.onError, o = this._methods[e](t);
        s && o instanceof Error ? s.method ? s.method({ ...s.params, results: o }) : s(o) : o instanceof Promise ? Promise.resolve(o).then((u) => {
          n && (n.method ? n.method({ ...n.params, results: u }) : n(u));
        }).catch((u) => {
          s && (s.method ? s.method({ ...s.params, results: u }) : s(u));
        }) : n && (n.method ? n.method({ ...n.params, results: o }) : n(o));
      });
    },
    _actionExists(e) {
      return this._methods[e];
    },
    _add(e) {
      if (this.buildId += e.version, e.methods) {
        for (const t in e.methods)
          if (Object.hasOwnProperty.call(e.methods, t)) {
            const i = e.methods[t];
            this._methods[`${e.name}/${t}`] = i;
          }
      }
      if (e.tokens) {
        for (const t in e.tokens)
          if (Object.hasOwnProperty.call(e.tokens, t)) {
            const i = e.tokens[t];
            this._tokens[`${e.name}/${t}`] = i;
          }
      }
      if (e.components)
        for (let t = 0; t < e.components.length; t++) {
          const i = e.components[t];
          this._components[i.name] = { ...i, plugin: e.name };
        }
    },
    _addOptions(e, t = {}) {
      this.setupOnRequest[e] = !!t.setupOnRequest, this.isLoaded[e] = !1, this.options[e] = t;
    },
    _component(e) {
      if (this._components[e]) {
        const t = this._components[e];
        if (!this.isLoaded[t.plugin] && this.setupOnRequestQueue[t.plugin]) {
          const i = t.plugin, n = this._getOptions(i), s = this.setupOnRequestQueue[i];
          this._setup(s, n.setup).catch((o) => console.error(o));
        }
        return t.isLazy && !t.loading && (t.loading = !0, t.lazy().then(() => {
          t.loading = !1;
        }).catch((i) => console.error(i))), t;
      }
    },
    _get(e) {
      return this.plugins[e] ? this.plugins[e].plugin : this.setupOnRequestQueue[e];
    },
    _callbackWhenAvailable(e, t) {
      const i = e.split("/")[0];
      if (this.isLoaded[i] && this._actionExists(e))
        return t();
      if (this.initialising[i]) {
        const n = this._getQueue(i);
        Promise.all(n).then(() => {
          this._actionExists(e) ? t() : console.error("action does not exist: " + e);
        });
      } else {
        const n = this._get(i), s = this._install(i, n, !0);
        this.queue[i].push(s), s.then(() => {
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
    _install(e, t, i = !1) {
      return new Promise((n, s) => {
        const o = this._getOptions(e);
        if (this.isLoaded[e] = !1, this.initialising[e] = !0, o.import)
          if (!o.setupOnRequest || i)
            y(/* @__PURE__ */ Object.assign({ "./plugins/ds-plugin-database.js": () => import("./ds-plugin-database.e55bb606.js"), "./plugins/ds-plugin-parse.js": () => import("./ds-plugin-parse.435f875a.js"), "./plugins/ds-plugin-template.js": () => import("./ds-plugin-template.5bfc34cc.js"), "./plugins/ds-plugin-utilities.js": () => import("./ds-plugin-utilities.e40685ea.js") }), `./plugins/${o.import}.js`).then(({ default: u }) => {
              u.dependencies && this._installDependencies(e, u.dependencies);
              const l = new this.DsPlugin(u, this.context, this.isDev);
              this._add(l), this._setup(l, o.setup).then(() => n(`Setup import ${e}`)).catch((c) => s(c));
            }).catch((u) => s(u));
          else
            return this.initialising[e] = !1, n(`Lazy loading ${e}`);
        else {
          let u;
          if (this.setupOnRequestQueue[e] ? u = this.setupOnRequestQueue[e] : (u = new this.DsPlugin(t, this.context, this.isDev), this._add(u)), o.setupOnRequest && !i)
            return this.setupOnRequestQueue[e] = u, this.initialising[e] = !1, n();
          u.dependencies && this._installDependencies(e, u.dependencies), this._setup(u, o.setup).then(() => n(e)).catch((l) => s(l));
        }
      });
    },
    _installDependencies(e, t) {
      for (let i = 0; i < t.length; i++) {
        const n = t[i];
        if (!this.isLoaded[n.name]) {
          const s = this._use({
            name: n.name,
            options: {
              setupOnRequest: !1
            }
          });
          this.depQueue[e].push(s);
        }
      }
    },
    _method(e, t) {
      try {
        if (this._methods[e])
          return this._methods[e](t);
        throw new Error('Method "' + e + '" does not exist');
      } catch (i) {
        console.error(e, i);
      }
    },
    _setup(e, t = {}) {
      return new Promise((i, n) => {
        const s = this.depQueue[e.name];
        Promise.all(s).then(() => {
          const o = e.init(t);
          o instanceof Promise ? o.then(() => {
            this.isLoaded[e.name] = !0, this.initialising[e.name] = !1, delete this.setupOnRequestQueue[e.name], console.log("Plugin successfully async loaded: " + e.name), i(e.name);
          }).catch((u) => n(u)) : (this.isLoaded[e.name] = !0, this.initialising[e.name] = !1, console.log("Plugin successfully loaded: " + e.name), i(e.name));
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
      const i = this._get(e), n = this._getQueue(e);
      let s = !1;
      if (!this.initialising[e] && (!this.setupOnRequest[e] || !t.setupOnRequest) && (s = !0), !n || s) {
        const o = this._install(e, i, s);
        return n.push(o), o;
      }
      return Promise.resolve();
    }
  }
};
export {
  k as default
};
