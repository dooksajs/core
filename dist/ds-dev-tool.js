const a = {
  name: "dsDevTool",
  version: 1,
  data: {
    items: {},
    plugins: [],
    keys: {}
  },
  methods: {
    set({ _context: s, plugin: t }) {
      this.items[t.name] = s, this.plugins.push(t.name), t.data && (this.keys[t.name + "/data"] = this._createKeys(t.data)), t.methods && (this.keys[t.name + "/methods"] = this._createKeys(t.data));
    },
    getPlugins() {
      return this.plugins;
    },
    getData(s) {
      const t = this.keys[s + "/data"] || [], e = {
        name: s,
        version: this.items[s].version
      };
      for (let i = 0; i < t.length; i++) {
        const r = t[i];
        e[r] = this.items[s][r];
      }
      return e;
    },
    getAll(s) {
      return this.items[s];
    },
    getItem({ name: s, id: t }) {
      if (this.items[s] && this.items[s][t])
        return this.items[s][t];
    },
    _createKeys(s) {
      const t = [];
      for (const e in s)
        Object.prototype.hasOwnProperty.call(s, e) && t.push(e);
      return t;
    }
  }
};
export {
  a as default
};
