const o = {
  name: "dsComponent",
  version: 1,
  data: {
    items: {}
  },
  methods: {
    get({ id: e, modifierId: i }) {
      const t = this.items[e];
      if (t.id === "text")
        return {
          textNode: !0
        };
      const n = this.$component(t.id);
      if (document.createElement(t.id).constructor.name !== "HTMLUnknownElement" || n.isLazy)
        return {
          tag: t.id,
          attributes: t.attributes
        };
    },
    set(e) {
      this.items = { ...this.items, ...e };
    }
  }
};
export {
  o as default
};
