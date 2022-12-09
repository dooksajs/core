const l = {
  name: "dsEvent",
  version: 1,
  dependencies: [
    {
      name: "dsAction",
      version: 1
    }
  ],
  data: {
    listeners: {}
  },
  methods: {
    addListener({ dsEventId: e, dsEventOn: s, dsActionId: r }) {
      const t = this._id(e, s);
      this.listeners[t] ? this.listeners[t].push(r) : this.listeners[t] = [r];
    },
    emit({ dsEventId: e, dsEventOn: s, payload: r }) {
      const t = this._id(e, s), i = this._getListener(t);
      for (let n = 0; n < i.length; n++) {
        const h = i[n];
        this.$method("dsAction/dispatch", { dsActionId: h, payload: r });
      }
    },
    removeListener({ dsEventId: e, dsEventOn: s, dsActionId: r }) {
      const t = this._id(e, s), i = this._getListener(t);
      if (i.length) {
        const n = [];
        for (let h = 0; h < i.length; h++)
          i[h] !== r && n.push(i[h]);
        n.length ? this.listeners[t] = n : delete this.listeners[t];
      }
    },
    set(e) {
      this.listeners = { ...this.listeners, ...e };
    },
    _getListener(e) {
      var s;
      return (s = this.listeners[e]) != null ? s : [];
    },
    _id(e, s) {
      return e + "_" + s;
    }
  }
};
export {
  l as default
};
