const s = {
  name: "dsComponent",
  version: 1,
  data: {
    items: {}
  },
  methods: {
    get(n, { id: e, modifierId: i }) {
      const t = this.items[e];
      if (t.id === "text")
        return {
          textNode: !0
        };
      const o = this.$component(t.id);
      if (document.createElement(t.id).constructor.name !== "HTMLUnknownElement" || o.isLazy)
        return {
          tag: t.id,
          attributes: t.attributes
        };
    },
    set(n, e) {
      this.items = { ...this.items, ...e };
    }
  }
};
export {
  s as default
};
