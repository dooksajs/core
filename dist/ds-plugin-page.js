const g = {
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
  setup({ prefetchedPage: t }) {
    t && Promise.resolve(t).then((e) => {
      if (this.$method("dsMetadata/setTheme", e.app.theme), this.$method("dsMetadata/setAppId", e.app.id), this.set(e), e.foundPath && e.foundPath !== e.path)
        return this.$method("dsRouter/navigate", this._cleanPath(e.path));
      this._render(e.id);
    }).catch((e) => console.log(e));
  },
  methods: {
    getOneById({ id: t, expand: e }) {
      const s = {
        collection: "pages",
        id: t
      };
      return e && (s.options = { expand: e }), new Promise((d) => {
        this.$action(
          "dsDatabase/getOne",
          s,
          {
            onSuccess: (o) => d(o),
            onError: (o) => {
              console.error(o), d(o);
            }
          }
        );
      });
    },
    getOneByPath({ path: t, expand: e }) {
      return new Promise((s, d) => {
        const o = `(path='${t}')`, h = {
          filter: o
        };
        e && (h.expand = e), this.$action(
          "dsDatabase/getList",
          {
            collection: "pages",
            options: h
          },
          {
            onSuccess: (a) => {
              const i = a;
              i.foundPath = a.path, s(i);
            },
            onError: (a) => {
              if (a.code === 404) {
                const i = e.split(",");
                let l = "page";
                for (let n = 0; n < i.length; n++)
                  l += ",page." + i[n];
                this.$action(
                  "dsDatabase/getList",
                  {
                    collection: "pagePaths",
                    options: {
                      filter: o,
                      expand: l
                    }
                  },
                  {
                    onSuccess: (n) => {
                      const p = n.items[0]["@expand"].page;
                      p.foundPath = n.path, s(p);
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
    updateDOM({ prevId: t, nextId: e }) {
      const s = this.items[t], d = this.types[s.typesId], o = s.templateId || d.templateId, h = this.templates[o], a = this.items[e], i = this.types[a.typesId], l = a.templateId || i.templateId, n = this.templates[l], p = n.widgets.length, c = h.widgets.length, u = p > c ? p : c;
      for (let r = 0; r < u; r++) {
        const f = n.widgets[r], m = h.widgets[r];
        f ? this.$method("dsWidget/update", {
          parentElementId: "appElement",
          prevPrefixId: t,
          prevId: m,
          nextPrefixId: e,
          nextId: f
        }) : m && this.$method("dsWidget/remove", {
          sectionId: m,
          prefixId: t
        });
      }
    },
    set(t) {
      this.$method("dsRouter/setPath", { pageId: t.id, path: this._cleanPath(t.path) }), t.actions && (this.$method("dsAction/set", t.actions.items), this.$method("dsAction/setConditions", t.actions.conditions)), t.parameters && (this.$method("dsParameter/set", t.parameters.items), this.$method("dsParameter/setUsedBy", t.parameters.usedBy)), t.components && this.$method("dsComponent/set", t.components), t.layouts && (t.layouts.items && this.$method("dsLayout/setItems", t.layouts.items), t.layouts.head && this.$method("dsLayout/setHead", t.layouts.head), t.layouts.modifiers && this.$method("dsLayout/setModifiers", t.layouts.modifiers)), t.elements && (t.elements.value && this.$method("dsElement/setValues", t.elements.value), t.elements.attributes && this.$method("dsElement/setAttributes", t.elements.attributes), t.elements.type && this.$method("dsElement/setTypes", t.elements.type)), t.widgets && this.$method("dsWidget/set", { pageId: t.id, payload: t.widgets }), this._setItem(t.id, t.metadata), this._setTemplate(t.templates);
    },
    _cleanPath(t) {
      const e = t.split("/");
      return e.shift(), "/" + e.join("/");
    },
    _render(t) {
      const e = this.$method("dsWidget/getHead", t);
      for (let s = 0; s < e.length; s++)
        this.$method("dsWidget/create", {
          parentElementId: "appElement",
          prefixId: t,
          id: e[s]
        });
    },
    _setItem(t, e) {
      this.items[t] = e;
    },
    _setTemplate(t) {
      this.templates = { ...this.templates, ...t };
    }
  }
};
export {
  g as default
};
