const a = {
  name: "dsDevTool",
  version: 1,
  data: {
    items: {},
    plugins: [],
    keys: {}
  },
  methods: {
    set(s, { _context: e, plugin: t }) {
      this.items[t.name] = e, this.plugins.push(t.name), t.data && (this.keys[t.name + "/data"] = this._createKeys(t.data)), t.methods && (this.keys[t.name + "/methods"] = this._createKeys(t.data));
    },
    getPlugins() {
      return this.plugins;
    },
    getData(s, e) {
      const t = this.keys[e + "/data"] || [], o = {
        name: e,
        version: this.items[e].version
      };
      for (let i = 0; i < t.length; i++) {
        const r = t[i];
        o[r] = this.items[e][r];
      }
      return o;
    },
    getAll(s, e) {
      return this.items[e];
    },
    getItem(s, { name: e, id: t }) {
      if (this.items[e] && this.items[e][t])
        return this.items[e][t];
    },
    _createKeys(s) {
      const e = [];
      for (const t in s)
        Object.prototype.hasOwnProperty.call(s, t) && e.push(t);
      return e;
    }
  }
};
export {
  a as default
};
