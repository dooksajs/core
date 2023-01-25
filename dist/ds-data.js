const h = {
  name: "dsData",
  version: 1,
  data: {
    "data/update/listeners": {
      private: !0,
      value: {},
      type: "object"
    },
    "data/delete/listeners": {
      private: !0,
      value: {},
      type: "object"
    },
    values: {
      private: !0,
      value: {},
      type: "object"
    },
    types: {
      private: !0,
      value: {},
      type: "object"
    },
    getters: {
      private: !0,
      value: {},
      type: "object"
    },
    setters: {
      private: !0,
      value: {},
      type: "object"
    }
  },
  methods: {
    add({ id: e, value: t, type: r }) {
      this.values[e] = t, this.types[e] = r, this["data/update/listeners"][e] = {}, this["data/delete/listeners"][e] = {};
    },
    addGetter({ id: e, item: t }) {
      this.getters[e] = t;
    },
    addListener({ id: e, on: t, key: r, payload: s }) {
      const i = this["data/" + t + "/listeners"];
      if (!i)
        throw new Error('Data event type does not exist: "' + t + '"');
      const a = i[e][r];
      a ? a.indexOf(s) !== -1 && a.push(s) : i[e][r] = [s];
    },
    addSetter({ id: e, item: t }) {
      this.setters[e] = t;
    },
    get({ id: e, name: t, query: r, onSuccess: s, onError: i } = {}) {
      const a = e + "/" + t;
      if (this.getters[a]) {
        const n = this.getters[a](r);
        return n instanceof Promise ? Promise.resolve(n).then((u) => s(u)).catch((u) => i(u)) : n;
      }
      return this._getValue(e, t, r, s, i);
    },
    set({ id: e, name: t, payload: r }) {
      const s = e + "/" + t;
      this.setters[s] ? this.setters[s](r) : this.values[e] && this._setValue(e, t, r);
    },
    _checkType(e, t) {
      const r = typeof t;
      if (this.types[e] === r || this.types[e] === "array" && Array.isArray(t))
        return !0;
    },
    _getValue(e, t, r) {
      if (this.values[e]) {
        const s = "_processGetter/" + this.types[e] + "/" + t;
        return this[s] ? this[s](e, r) : this.values[e];
      }
    },
    _onUpdate(e, t, r) {
      const s = this["data/update/listeners"][e][t];
      if (s)
        for (let i = 0; i < s.length; i++) {
          const a = s[i];
          a.action(a.arguments, r);
        }
    },
    _onDelete(e, t, r) {
      const s = this["data/delete/listeners"][e][t];
      if (s)
        for (let i = 0; i < s.length; i++) {
          const a = s[i];
          a.action(a.arguments, r);
        }
    },
    "_processGetter/object/keyValue"(e, t) {
      return this.values[e][t.key];
    },
    "_processSetter/object/keyValue"(e, t) {
      const r = this.values[e];
      r[t.key] && this._onUpdate(e, t.key, t.value), r[t.key] = t.value;
    },
    "_processSetter/object/merge"(e, t) {
      const r = this.values[e];
      for (const s in t)
        if (Object.hasOwnProperty.call(t, s)) {
          const i = t[s];
          r[s] && this._onUpdate(e, s, i), r[s] = i;
        }
    },
    _setValue(e, t, r) {
      if (this.types[e]) {
        const s = "_processSetter/" + this.types[e] + "/" + t;
        this[s] ? this[s](e, r) : this._checkType(r) && (this.values[e] = r);
      }
    }
  }
};
export {
  h as default
};
