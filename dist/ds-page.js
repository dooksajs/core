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
      name: "dsView",
      version: 1
    },
    {
      name: "dsContent",
      version: 1
    },
    {
      name: "dsWidget",
      version: 1
    }
  ],
  data: {
    items: {},
    templates: {},
    entry: {}
  },
  setup({ dsPage: t }) {
    t && Promise.resolve(t).then((e) => {
      if (this.$method("dsMetadata/setTheme", e.app.theme), this.$method("dsMetadata/setAppId", e.app.id), this.set(e), e.foundPath && e.foundPath !== e.path)
        return this.$method("dsRouter/navigate", this._cleanPath(e.path));
      this._render(e.id);
    }).catch((e) => console.log(e));
  },
  methods: {
    getOneById({ dsPageId: t, expand: e }) {
      const i = {
        collection: "pages",
        id: t
      };
      return e && (i.options = { expand: e }), new Promise((o) => {
        this.$action(
          "dsDatabase/getOne",
          i,
          {
            onSuccess: (n) => o(n),
            onError: (n) => {
              console.error(n), o(n);
            }
          }
        );
      });
    },
    getOneByPath({ dsPagePath: t, expand: e }) {
      return new Promise((i, o) => {
        const n = `(path='${t}')`, a = {
          filter: n
        };
        e && (a.expand = e), this.$action(
          "dsDatabase/getList",
          {
            collection: "pages",
            options: a
          },
          {
            onSuccess: (d) => {
              const h = d;
              h.foundPath = d.path, i(h);
            },
            onError: (d) => {
              if (d.code === 404) {
                const h = e.split(",");
                let p = "page";
                for (let s = 0; s < h.length; s++)
                  p += ",page." + h[s];
                this.$action(
                  "dsDatabase/getList",
                  {
                    collection: "pagePaths",
                    options: {
                      filter: n,
                      expand: p
                    }
                  },
                  {
                    onSuccess: (s) => {
                      const m = s.items[0]["@expand"].page;
                      m.foundPath = s.path, i(m);
                    },
                    onError: (s) => {
                      console.error(s), o(s);
                    }
                  }
                );
              } else
                console.error(d), o(d);
            }
          }
        );
      });
    },
    updateDOM({ dsPagePrevId: t, dsPageNextId: e }) {
      const i = this.items[t], o = this.types[i.typesId], n = i.templateId || o.templateId, a = this.templates[n], d = this.items[e], h = this.types[d.typesId], p = d.templateId || h.templateId, s = this.templates[p], m = s.widgets.length, l = a.widgets.length, u = m > l ? m : l;
      for (let c = 0; c < u; c++) {
        const f = s.widgets[c], r = a.widgets[c];
        f ? this.$method("dsWidget/update", {
          dsViewId: this.$method("dsView/getRootViewId"),
          dsWidgetPrefixId: t,
          dsWidgetSectionId: r,
          dsWidgetNextPrefixId: e,
          dsWidgetNextSectionId: f
        }) : r && this.$method("dsWidget/remove", {
          dsWidgetSectionId: r,
          dsWidgetPrefixId: t
        });
      }
    },
    set(t) {
      this.$method("dsRouter/setPath", { pageId: t.id, path: this._cleanPath(t.path) }), t.actions && this.$method("dsAction/set", t.actions), t.parameters && (this.$method("dsParameter/set", t.parameters.items), this.$method("dsParameter/setUsedBy", t.parameters.usedBy)), t.components && this.$method("dsComponent/set", t.components), t.layouts && (t.layouts.items && this.$method("dsLayout/setItems", t.layouts.items), t.layouts.head && this.$method("dsLayout/setHead", t.layouts.head), t.layouts.modifiers && this.$method("dsLayout/setModifiers", t.layouts.modifiers)), t.content && (t.content.value && this.$method("dsContent/setValues", t.content.value), t.content.type && this.$method("dsContent/setTypes", t.content.type)), t.widgets && this.$method("dsWidget/set", { dsPageId: t.id, payload: t.widgets }), this._setItem(t.id, t.metadata), this._setTemplate(t.templates);
    },
    _cleanPath(t) {
      const e = t.split("/");
      return e.shift(), "/" + e.join("/");
    },
    _render(t) {
      const e = this.$method("dsView/getRootViewId"), i = this.$method("dsWidget/getEntry", t);
      for (let o = 0; o < i.length; o++) {
        const n = i[o];
        this.$method("dsWidget/create", {
          dsViewId: e,
          prefixId: t,
          dsWidgetSectionId: n
        });
      }
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
  y as default
};
