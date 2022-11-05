const m = {
  name: "dsEvent",
  version: 1,
  dependencies: [
    {
      name: "dsAction",
      version: 1
    }
  ],
  data: {
    handlers: {},
    items: {}
  },
  methods: {
    addListener(s, { id: e, on: t, action: i }) {
      this.items[e] ? this.items[e][t] ? this.items[e][t].push(i) : this.items[e][t] = [i] : this.items[e] = {
        [t]: [i]
      };
    },
    emit(s, { id: e, on: t, payload: i }) {
      const n = this.getListener({}, { id: e, on: t });
      for (let h = 0; h < n.length; h++)
        this.$method("dsAction/dispatch", { sequenceId: n[h], payload: i });
    },
    removeListener(s, { id: e, on: t, value: i }) {
      if (this.items[e] && this.items[e][t]) {
        const n = this.items[e][t], h = [];
        for (let r = 0; r < n.length; r++)
          n[r] !== i && h.push(n[r]);
        h.length ? this.items[e][t] = h : delete this.items[e][t];
      }
    },
    getListener(s, { id: e, on: t }) {
      return this.items[e] ? this.items[e][t] ? this.items[e][t] : [] : [];
    },
    getHandler(s) {
      return this.handler[s];
    },
    addHandler(s, e) {
      this.handler[s] = e;
    },
    removeHandler(s) {
      delete this.handler[s];
    },
    set(s, e) {
      this.items = { ...this.items, ...e };
    },
    _name(s, e) {
      return s + "/" + e;
    }
  }
};
export {
  m as default
};
