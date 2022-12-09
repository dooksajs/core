const i = {
  name: "dsComponent",
  version: 1,
  data: {
    items: {}
  },
  components: [
    {
      name: "button",
      type: "button",
      events: ["click"]
    },
    {
      name: "a",
      type: "link",
      set: {
        type: "attribute",
        value: "href"
      },
      get: {
        type: "attribute",
        value: "href"
      },
      events: ["click", "hover"]
    },
    {
      name: "img",
      type: "image",
      set: {
        type: "attribute",
        value: [
          {
            name: "src",
            key: "src"
          },
          {
            name: "alt",
            key: "alt"
          }
        ]
      },
      get: {
        type: "attribute",
        value: [
          {
            name: "src",
            key: "src"
          },
          {
            name: "alt",
            key: "alt"
          }
        ]
      },
      events: ["click"]
    },
    {
      name: "div",
      type: "html",
      set: {
        type: "setter",
        value: "innerHTML"
      },
      events: ["click"]
    },
    {
      name: "input",
      type: "text",
      events: ["input"],
      get: {
        type: "getter",
        value: "value"
      },
      set: {
        type: "setter",
        value: "value"
      }
    },
    {
      name: "#text",
      type: "text",
      get: {
        type: "getter",
        value: [
          {
            name: "textContent",
            key: "text"
          }
        ]
      }
    },
    {
      name: "iconify-icon",
      lazy: () => import("./iconify-icon.f0a3399f.js"),
      set: [{
        type: "attribute",
        value: "icon"
      }],
      get: [{
        type: "attribute",
        value: "icon"
      }]
    }
  ],
  methods: {
    get({ dsComponentId: t, dsComponentModifierId: a }) {
      const e = this.items[t];
      if (e.id === "text")
        return {
          textNode: !0
        };
      const n = this.$component(e.id);
      if (document.createElement(e.id).constructor.name !== "HTMLUnknownElement" || n.isLazy)
        return {
          tag: e.id,
          attributes: e.attributes
        };
    },
    set(t) {
      this.items = { ...this.items, ...t };
    }
  }
};
export {
  i as default
};
