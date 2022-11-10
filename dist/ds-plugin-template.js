const _ = {
  name: "dsTemplate",
  version: 1,
  dependencies: [
    {
      name: "dsUtilities",
      version: 1
    }
  ],
  data: {
    entry: {},
    items: {},
    components: {},
    modifiers: {}
  },
  methods: {
    create({
      id: d,
      entry: t,
      sectionId: n = this.$method("dsUtilities/generateId"),
      instanceId: s,
      groupId: g = this.$method("dsUtilities/generateId"),
      defaultContent: r,
      modifiers: u = {},
      view: h = "default",
      head: m = !1
    }) {
      let y = this.items[t] || this.items[this.entry[d]];
      return y ? this._constructor(d, t, y, n, s, g, r, u, h, m) : new Promise((p) => {
        this._fetch(d).then(() => {
          t = this.entry[d], y = this.items[t];
          const e = this._constructor(d, t, y, n, s, g, r, u, h, m);
          p(e);
        });
      });
    },
    _constructor(d, t, n, s, g, r, u, h, m, y) {
      let p = "";
      const e = {
        layoutEntry: "",
        widgets: {
          items: {},
          content: {},
          layout: {}
        },
        elements: {
          value: {},
          type: {}
        }
      };
      if (y) {
        const i = n.layouts[0], c = s + g + "_" + m, o = 0;
        if (n.elements[o]) {
          const [l, f] = this._createElements(n.elements[o], m, r, u, h), a = t + i;
          h[a] && (e.widgets.layout = { [c]: h[a] }), e.widgets.content[c] = l, e.elements = f;
        }
        if (n.events[o]) {
          const l = n.events[o];
          e.events = e.events || {};
          for (const f in l)
            if (Object.hasOwnProperty.call(l, f)) {
              const a = l[f], v = g + "_" + f.padStart(4, "0");
              e.events[v] ? e.events[v][a.on] = a.action : e.events[v] = {
                [a.on]: a.action
              };
            }
        }
        p = i, this.$method("dsWidget/setLoaded", { id: c, value: !0 });
      } else
        for (let i = 0; i < n.layouts.length; i++) {
          const c = n.layouts[i], o = {}, l = this.$method("dsUtilities/generateId"), f = s + l + "_default";
          if (n.elements && n.elements[i]) {
            const [a, v] = this._createElements(n.elements[i], m, r, u, h), w = t + c;
            h[w] && (e.widgets.layout || (e.widgets.layout = {}), e.widgets.layout[s + l + "_default"] = h[w]), e.widgets.content[f] = a, e.elements.value = { ...e.elements.value, ...v.value }, e.elements.type = { ...e.elements.type, ...v.type };
          }
          if (n.events[i]) {
            const a = n.events[i];
            e.events = e.events || {};
            for (const v in a)
              if (Object.hasOwnProperty.call(a, v)) {
                const w = a[v], $ = l + "_" + v.padStart(4, "0");
                e.events[$] ? e.events[$][w.on] = w.action : e.events[$] = {
                  [w.on]: w.action
                };
              }
          }
          o.default = { id: c }, e.widgets.items[s] ? e.widgets.items[s].push({ groupId: r, instanceId: l, layout: o }) : e.widgets.items[s] = [{ groupId: r, instanceId: l, layout: o }], this.$method("dsWidget/setLoaded", { id: f, value: !0 });
        }
      if (e.events && this.$method("dsEvent/set", e.events), e.elements && (e.elements.value && this.$method("dsElement/setValues", e.elements.value), e.elements.type && this.$method("dsElement/setTypes", e.elements.type)), e.widgets && (e.widgets.items && this.$method("dsWidget/setItems", e.widgets.items), e.widgets.layout && this.$method("dsWidget/setLayout", e.widgets.layout), e.widgets.content)) {
        const i = this.$method("dsRouter/getCurrentId");
        this.$method("dsWidget/setContent", { id: i, items: e.widgets.content });
      }
      return [s, p, e];
    },
    _createElements(d, t, n, s = [], g) {
      const r = [], u = {
        value: {},
        type: {}
      };
      for (let h = 0; h < d.length; h++) {
        const m = d[h], [y, p] = m.type;
        let e, i;
        if (s.length && p)
          for (let c = 0; c < s.length; c++) {
            const o = s[c], l = this.$method("dsElement/getType", o);
            if (y === l[0]) {
              e = o, s.splice(c, 1), i = !0;
              break;
            }
          }
        else
          e = this.$method("dsUtilities/generateId");
        if (r.push(e), !i)
          if (u.type[e] = [y, p], y === "section") {
            const c = {};
            for (let o = 0; o < m.value.length; o++) {
              const [l, f] = m.value[o], [a] = this.create({ entry: f, defaultContent: s, groupId: n, view: t, modifiers: g });
              c[l] = a;
            }
            u.value[e] = c;
          } else
            u.value[e] = m.value;
      }
      return [r, u, s];
    },
    _fetch(d) {
      return new Promise((t, n) => {
        this.$action(
          "dsDatabase/getOne",
          { collection: "widgetTemplates", id: d },
          {
            onSuccess: (s) => {
              this.set({ id: s.id, item: s }), t(s);
            },
            onError: (s) => {
              console.error(s), n(s);
            }
          }
        );
      });
    },
    set({ id: d, item: t }) {
      this.entry[d] = t.templateEntry, t.template && (this.items = { ...this.items, ...t.template }), t.modifiers && (this.modifiers[d] = t.modifiers), t.layouts && (this.$method("dsLayout/setItems", t.layouts.items), t.layouts.head && this.$method("dsLayout/setHead", t.layouts.head)), t.components && this.$method("dsComponent/set", t.components);
    }
  }
};
export {
  _ as default
};
