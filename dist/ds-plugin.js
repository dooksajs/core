function m(e, n, c, s, o, t = "", r = "") {
  if (n == null) {
    const i = c.substring(0, c.length - s.length) + t + o + r;
    throw Error(`${e}: "${i}" contains ${n}`);
  }
}
function d(e, n, c = "", s = "") {
  try {
    let o = "";
    if (m(e, n, c, o, s), typeof n == "object") {
      let t = ".", r = "";
      Array.isArray(n) && (t = "[", r = "]");
      for (const i in n)
        if (Object.prototype.hasOwnProperty.call(n, i)) {
          const f = n[i], h = t + i + r;
          m(e, f, c, o, i, t, r), o += h, c += h, typeof f == "object" && d(e, f, c, i);
        }
    }
  } catch (o) {
    console.error(o);
  }
}
function a(e = "", n) {
  return new Proxy(n, {
    set(c, s, o) {
      return d(e, o, s), Reflect.set(...arguments);
    }
  });
}
function y(e, n = [], c) {
  let s = {
    name: e.name,
    version: e.version
  };
  this.name = e.name, this.version = e.version, e.data && (s = { ...s, ...e.data }), c && (s = a(e.name, s));
  for (let o = 0; o < n.length; o++) {
    const t = n[o];
    t.scope && t.scope.includes(e.name) && (s[t.name] = t.value), t.name === "isDev" && t.value ? (s.isDev = !0, e.name !== "dsDevTool" && s.$action("dsDevTool/set", { _context: s, plugin: e })) : s[t.name] = t.value;
  }
  if (e.dependencies && (this.dependencies = e.dependencies, s.dependencies = e.dependencies), e.methods) {
    const o = {};
    for (const t in e.methods)
      if (Object.hasOwnProperty.call(e.methods, t)) {
        const r = e.methods[t];
        s[t] = r, t.charAt(0) !== "_" && (o[t] = r.bind(s));
      }
    this.methods = o;
  }
  if (e.tokens) {
    const o = {};
    for (const t in e.tokens)
      if (Object.hasOwnProperty.call(e.tokens, t)) {
        const r = e.tokens[t];
        s[t] = r, o[t] = r.bind(s);
      }
    this.tokens = o;
  }
  if (e.components) {
    for (let o = 0; o < e.components.length; o++) {
      const t = e.components[o];
      t.lazy && (t.isLazy = !0);
    }
    this.components = e.components;
  }
  e.setup && (this.setup = e.setup.bind(s));
}
y.prototype.init = function(e) {
  if (this.setup)
    return this.setup(e);
};
export {
  y as default
};
