function c(e, a = []) {
  let s = {
    name: e.name,
    version: e.version
  };
  this.name = e.name, this.version = e.version, e.data && (s = { ...s, ...e.data });
  for (let o = 0; o < a.length; o++) {
    const t = a[o];
    t.use && t.use.includes(e.name) && (s[t.name] = t.value), t.name === "isDev" && t.value ? (s.isDev = !0, e.name !== "dsDevTool" && s.$action("dsDevTool/set", { _context: s, plugin: e })) : t.dispatch ? s[t.name] = t.value({
      name: e.name,
      version: e.version,
      dependencies: e.dependencies
    }) : s[t.name] = t.value;
  }
  if (e.dependencies && (this.dependencies = e.dependencies, s.dependencies = e.dependencies), e.methods) {
    const o = {};
    for (const t in e.methods)
      if (Object.hasOwnProperty.call(e.methods, t)) {
        const n = e.methods[t];
        s[t] = n, t.charAt(0) !== "_" && (o[t] = n.bind(s));
      }
    this.methods = o;
  }
  if (e.tokens) {
    const o = {};
    for (const t in e.tokens)
      if (Object.hasOwnProperty.call(e.tokens, t)) {
        const n = e.tokens[t];
        s[t] = n, o[t] = n.bind(s);
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
c.prototype.init = function(e) {
  if (this.setup)
    return this.setup(e);
};
export {
  c as default
};
