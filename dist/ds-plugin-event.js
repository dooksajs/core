const n = {
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
    addListener({ id: e, on: t, action: s }) {
      this.items[e] ? this.items[e][t] ? this.items[e][t].push(s) : this.items[e][t] = [s] : this.items[e] = {
        [t]: [s]
      };
    },
    emit({ id: e, on: t, payload: s }) {
      const h = this.getListener({ id: e, on: t });
      for (let i = 0; i < h.length; i++)
        this.$method("dsAction/dispatch", { sequenceId: h[i], payload: s });
    },
    removeListener({ id: e, on: t, value: s }) {
      if (this.items[e] && this.items[e][t]) {
        const h = this.items[e][t], i = [];
        for (let r = 0; r < h.length; r++)
          h[r] !== s && i.push(h[r]);
        i.length ? this.items[e][t] = i : delete this.items[e][t];
      }
    },
    getListener({ id: e, on: t }) {
      return this.items[e] ? this.items[e][t] ? this.items[e][t] : [] : [];
    },
    getHandler(e) {
      return this.handler[e];
    },
    addHandler(e, t) {
      this.handler[e] = t;
    },
    removeHandler(e) {
      delete this.handler[e];
    },
    set(e) {
      this.items = { ...this.items, ...e };
    },
    _name(e, t) {
      return e + "/" + t;
    }
  }
};
export {
  n as default
};
