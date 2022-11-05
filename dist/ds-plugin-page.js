const y = {
  name: "dsPage",
  version: 1,
  dependencies: [
    {
      name: "dsRouter",
      version: 1
    },
    {
      name: "dsComponent",
      version: 1
    },
    {
      name: "dsLayout",
      version: 1
    },
    {
      name: "dsElement",
      version: 1
    },
    {
      name: "dsWidget",
      version: 1
    }
  ],
  data: {
    items: {},
    templates: {}
  },
  setup({ prefetchedPage: e }) {
    e && Promise.resolve(e).then((t) => {
      if (this.$method("dsMetadata/setTheme", t.app.theme), this.$method("dsMetadata/setAppId", t.app.id), this.set({}, t), t.foundPath && t.foundPath !== t.path)
        return this.$method("dsRouter/navigate", this._cleanPath(t.path));
      this._render(t.id);
    }).catch((t) => console.log(t));
  },
  methods: {
    getOneById(e, { id: t, expand: s }) {
      const i = {
        collection: "pages",
        id: t
      };
      return s && (i.options = { expand: s }), new Promise((d) => {
        this.$action(
          "dsDatabase/getOne",
          i,
          {
            onSuccess: (o) => d(o),
            onError: (o) => {
              console.error(o), d(o);
            }
          }
        );
      });
    },
    getOneByPath(e, { path: t, expand: s }) {
      return new Promise((i, d) => {
        const o = `(path='${t}')`, p = {
          filter: o
        };
        s && (p.expand = s), this.$action(
          "dsDatabase/getList",
          {
            collection: "pages",
            options: p
          },
          {
            onSuccess: (a) => {
              const h = a;
              h.foundPath = a.path, i(h);
            },
            onError: (a) => {
              if (a.code === 404) {
                const h = s.split(",");
                let c = "page";
                for (let n = 0; n < h.length; n++)
                  c += ",page." + h[n];
                this.$action(
                  "dsDatabase/getList",
                  {
                    collection: "pagePaths",
                    options: {
                      filter: o,
                      expand: c
                    }
                  },
                  {
                    onSuccess: (n) => {
                      const l = n.items[0]["@expand"].page;
                      l.foundPath = n.path, i(l);
                    },
                    onError: (n) => {
                      console.error(n), d(n);
                    }
                  }
                );
              } else
                console.error(a), d(a);
            }
          }
        );
      });
    },
    updateDOM(e, { prevId: t, nextId: s }) {
      const i = this.items[t], d = this.types[i.typesId], o = i.templateId || d.templateId, p = this.templates[o], a = this.items[s], h = this.types[a.typesId], c = a.templateId || h.templateId, n = this.templates[c], l = n.widgets.length, f = p.widgets.length, g = l > f ? l : f;
      for (let r = 0; r < g; r++) {
        const u = n.widgets[r], m = p.widgets[r];
        u ? this.$method("dsWidget/update", {
          parentElementId: "appElement",
          prevPrefixId: t,
          prevId: m,
          nextPrefixId: s,
          nextId: u
        }) : m && this.$method("dsWidget/remove", {
          sectionId: m,
          prefixId: t
        });
      }
    },
    set(e, t) {
      this.$method("dsRouter/setPath", { pageId: t.id, path: this._cleanPath(t.path) }), t.actions && (this.$action("dsAction/set", t.actions.items), this.$action("dsAction/setConditions", t.actions.conditions)), t.parameters && (this.$action("dsParameters/set", t.parameters.items), this.$action("dsParameters/setUsedBy", t.parameters.usedBy)), t.components && this.$method("dsComponent/set", t.components), t.layouts && (t.layouts.items && this.$method("dsLayout/setItems", t.layouts.items), t.layouts.head && this.$method("dsLayout/setHead", t.layouts.head), t.layouts.modifiers && this.$method("dsLayout/setModifiers", t.layouts.modifiers)), t.elements && (t.elements.value && this.$method("dsElement/setValues", t.elements.value), t.elements.attributes && this.$method("dsElement/setAttributes", t.elements.attributes), t.elements.type && this.$method("dsElement/setTypes", t.elements.type)), t.widgets && this.$method("dsWidget/set", { pageId: t.id, payload: t.widgets }), this._setItem(t.id, t.metadata), this._setTemplate(t.templates);
    },
    _cleanPath(e) {
      const t = e.split("/");
      return t.shift(), "/" + t.join("/");
    },
    _render(e) {
      const t = this.$method("dsWidget/getHead", e);
      for (let s = 0; s < t.length; s++)
        this.$method("dsWidget/create", {
          parentElementId: "appElement",
          prefixId: e,
          id: t[s]
        });
    },
    _setItem(e, t) {
      this.items[e] = t;
    },
    _setTemplate(e) {
      this.templates = { ...this.templates, ...e };
    }
  }
};
export {
  y as default
};
