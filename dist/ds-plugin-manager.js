const v = (e, t) => {
  const i = e[t];
  return i ? typeof i == "function" ? i() : Promise.resolve(i) : new Promise((n, s) => {
    (typeof queueMicrotask == "function" ? queueMicrotask : setTimeout)(s.bind(null, new Error("Unknown variable dynamic import: " + t)));
  });
}, q = {
  link({
    id: e,
    crossOrigin: t,
    href: i,
    media: n,
    referrerPolicy: s,
    rel: o = "stylesheet",
    integrity: r,
    onSuccess: u = () => {
    },
    onError: l = () => {
    }
  }) {
    const [c, a] = this._exists(e, "link", "href", i);
    c.onerror = () => l(), c.onload = () => u(), c.id = e, c.rel = o, c.crossOrigin = t || null, n && (c.media = n), s && (c.referrerPolicy = s), r && (c.integrity = r), c.href = i, a || document.head.appendChild(c);
  },
  script({
    id: e,
    async: t,
    crossOrigin: i,
    defer: n,
    integrity: s,
    nonce: o,
    referrerPolicy: r,
    src: u,
    type: l = "text/javascript",
    nomodule: c,
    globalVars: a = [],
    onSuccess: y = () => {
    },
    onError: O = () => {
    }
  }) {
    const [h, P] = this._exists(e, "script", "src", u);
    h.onerror = () => O(), h.onload = () => {
      const f = {};
      for (let d = 0; d < a.length; d++) {
        const _ = a[d];
        f[_] = window[_];
      }
      y(f);
    }, h.id = e, h.type = l, h.async = t || null, h.crossOrigin = i || null, h.defer = n || null, s && (h.integrity = s), r && (h.referrerPolicy = r), h.nomodule = c || null, h.nonce = o || null, h.src = u, P || document.head.appendChild(h);
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
};
function m(e, t = []) {
  let i = {
    name: e.name,
    version: e.version
  };
  this.name = e.name, this.version = e.version, e.data && (i = { ...i, ...e.data });
  for (let n = 0; n < t.length; n++) {
    const s = t[n];
    s.use && s.use.includes(e.name) && (i[s.name] = s.value), s.name === "isDev" && s.value ? (i.isDev = !0, e.name !== "dsDevTool" && i.$action("dsDevTool/set", { _context: i, plugin: e })) : s.dispatch ? i[s.name] = s.value({
      name: e.name,
      version: e.version,
      dependencies: e.dependencies
    }) : i[s.name] = s.value;
  }
  if (e.dependencies && (this.dependencies = e.dependencies, i.dependencies = e.dependencies), e.methods) {
    const n = {};
    for (const s in e.methods)
      if (Object.hasOwnProperty.call(e.methods, s)) {
        const o = e.methods[s];
        i[s] = o, s.charAt(0) !== "_" && (n[s] = o.bind(i));
      }
    this.methods = n;
  }
  if (e.tokens) {
    const n = {};
    for (const s in e.tokens)
      if (Object.hasOwnProperty.call(e.tokens, s)) {
        const o = e.tokens[s];
        i[s] = o, n[s] = o.bind(i);
      }
    this.tokens = n;
  }
  if (e.components) {
    for (let n = 0; n < e.components.length; n++) {
      const s = e.components[n];
      s.lazy && (s.isLazy = !0);
    }
    this.components = e.components;
  }
  e.setup && (this.setup = e.setup.bind(i));
}
m.prototype.init = function(e) {
  if (this.setup)
    return this.setup(e);
};
const p = "dsManager", g = 1, k = {
  name: p,
  version: g,
  data: {
    _methods: {},
    _tokens: {},
    _components: {},
    buildId: "",
    additionalPlugins: {},
    plugins: {},
    pluginUseQueue: [],
    appBuildId: "",
    appPlugins: [],
    appAdditionalPlugins: [],
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
    additionalPlugins: i = [],
    isDev: n
  }) {
    this.buildId = e, this.context = [
      {
        name: "$action",
        dispatch: !0,
        value: this._action.bind(this)
      },
      {
        name: "$method",
        dispatch: !0,
        value: this._method.bind(this)
      },
      {
        name: "$resource",
        value: q
      },
      {
        name: "isDev",
        value: n
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
    for (const s in t)
      Object.prototype.hasOwnProperty.call(t, s) && this.use({}, { plugin: t[s] });
    for (let s = 0; s < i.length; s++) {
      const o = i[s];
      s === i.length - 1 && (o.lastItem = !0), this.use({}, o);
    }
    if (this._processQueue(), n)
      return {
        $method: this._method.bind(this)(),
        $action: this._action.bind(this)()
      };
  },
  methods: {
    use(e, { plugin: t, process: i }) {
      this._addOptions(t.name, t.options), this.plugins[t.name] = t, this.pluginUseQueue.push(t), this.queue[t.name] = [], this.depQueue[t.name] = [], i && this._processQueue();
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
    _action(e) {
      return (t, i, n = {}) => {
        this._callbackWhenAvailable(t, () => {
          const s = n.onSuccess, o = n.onError, r = this._methods[t](e, i);
          o && r instanceof Error ? o.method ? o.method({ ...o.params, results: r }) : o(r) : r instanceof Promise ? Promise.resolve(r).then((u) => {
            s && (s.method ? s.method({ ...s.params, results: u }) : s(u));
          }).catch((u) => {
            o && (o.method ? o.method({ ...o.params, results: u }) : o(u));
          }) : s && (s.method ? s.method({ ...s.params, results: r }) : s(r));
        });
      };
    },
    _actionExists(e) {
      return this._methods[e];
    },
    _add(e) {
      if (e.methods) {
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
        if (!this.isLoaded[t.plugin]) {
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
            v(/* @__PURE__ */ Object.assign({ "./plugins/ds-plugin-database.js": () => import("./ds-plugin-database.363af340.js"), "./plugins/ds-plugin-parse.js": () => import("./ds-plugin-parse.924b8708.js"), "./plugins/ds-plugin-template.js": () => import("./ds-plugin-template.3bc1d71c.js"), "./plugins/ds-plugin-utilities.js": () => import("./ds-plugin-utilities.84c17b1f.js") }), `./plugins/${o.import}.js`).then(({ default: r }) => {
              r.dependencies && this._installDependencies(e, r.dependencies);
              const u = new m(r, this.context);
              this._add(u), this._setup(u, o.setup).then(() => n(`Setup import ${e}`)).catch((l) => s(l));
            }).catch((r) => s(r));
          else
            return this.initialising[e] = !1, n(`Lazy loading ${e}`);
        else {
          let r;
          if (this.setupOnRequestQueue[e] ? r = this.setupOnRequestQueue[e] : (r = new m(t, this.context), this._add(r)), o.setupOnRequest && !i)
            return this.setupOnRequestQueue[e] = r, this.initialising[e] = !1, n();
          r.dependencies && this._installDependencies(e, r.dependencies), this._setup(r, o.setup).then(() => n(e)).catch((u) => s(u));
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
    _method(e) {
      return (t, i) => {
        try {
          if (this._methods[t])
            return this._methods[t](e, i);
          throw new Error('Method "' + t + '" does not exist');
        } catch (n) {
          console.error(t, n);
        }
      };
    },
    _setup(e, t = {}) {
      return new Promise((i, n) => {
        const s = this.depQueue[e.name];
        Promise.all(s).then(() => {
          const o = e.init(t);
          o instanceof Promise ? o.then(() => {
            this.isLoaded[e.name] = !0, this.initialising[e.name] = !1, delete this.setupOnRequestQueue[e.name], console.log("Plugin successfully async loaded: " + e.name), i(e.name);
          }).catch((r) => n(r)) : (this.isLoaded[e.name] = !0, this.initialising[e.name] = !1, console.log("Plugin successfully loaded: " + e.name), i(e.name));
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
