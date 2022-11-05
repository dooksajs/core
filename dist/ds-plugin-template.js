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
    create(g, {
      id: i,
      entry: t,
      sectionId: s = this.$method("dsUtilities/generateId"),
      instanceId: p,
      groupId: m = this.$method("dsUtilities/generateId"),
      defaultContent: r,
      modifiers: c = {},
      view: h = "default",
      head: v = !1
    }) {
      let u = this.items[t] || this.items[this.entry[i]];
      return u ? this._constructor(i, t, u, s, p, m, r, c, h, v) : new Promise((e) => {
        this._fetch(i).then(() => {
          t = this.entry[i], u = this.items[t];
          const n = this._constructor(i, t, u, s, p, m, r, c, h, v);
          e(n);
        });
      });
    },
    _constructor(g, i, t, s, p, m, r, c, h, v) {
      let u = "";
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
      if (v) {
        const n = t.layouts[0], d = s + p + "_" + h, o = 0;
        if (t.elements[o]) {
          const [l, y] = this._createElements(t.elements[o], h, m, r, c), a = i + n;
          c[a] && (e.widgets.layout = { [d]: c[a] }), e.widgets.content[d] = l, e.elements = y;
        }
        if (t.events[o]) {
          const l = t.events[o];
          e.events = e.events || {};
          for (const y in l)
            if (Object.hasOwnProperty.call(l, y)) {
              const a = l[y], f = p + "_" + y.padStart(4, "0");
              e.events[f] ? e.events[f][a.on] = a.action : e.events[f] = {
                [a.on]: a.action
              };
            }
        }
        u = n, this.$method("dsWidget/setLoaded", { id: d, value: !0 });
      } else
        for (let n = 0; n < t.layouts.length; n++) {
          const d = t.layouts[n], o = {}, l = this.$method("dsUtilities/generateId"), y = s + l + "_default";
          if (t.elements && t.elements[n]) {
            const [a, f] = this._createElements(t.elements[n], h, m, r, c), w = i + d;
            c[w] && (e.widgets.layout || (e.widgets.layout = {}), e.widgets.layout[s + l + "_default"] = c[w]), e.widgets.content[y] = a, e.elements.value = { ...e.elements.value, ...f.value }, e.elements.type = { ...e.elements.type, ...f.type };
          }
          if (t.events[n]) {
            const a = t.events[n];
            e.events = e.events || {};
            for (const f in a)
              if (Object.hasOwnProperty.call(a, f)) {
                const w = a[f], $ = l + "_" + f.padStart(4, "0");
                e.events[$] ? e.events[$][w.on] = w.action : e.events[$] = {
                  [w.on]: w.action
                };
              }
          }
          o.default = { id: d }, e.widgets.items[s] ? e.widgets.items[s].push({ groupId: m, instanceId: l, layout: o }) : e.widgets.items[s] = [{ groupId: m, instanceId: l, layout: o }], this.$method("dsWidget/setLoaded", { id: y, value: !0 });
        }
      if (e.events && this.$method("dsEvent/set", e.events), e.elements && (e.elements.value && this.$method("dsElement/setValues", e.elements.value), e.elements.type && this.$method("dsElement/setTypes", e.elements.type)), e.widgets && (e.widgets.items && this.$method("dsWidget/setItems", e.widgets.items), e.widgets.layout && this.$method("dsWidget/setLayout", e.widgets.layout), e.widgets.content)) {
        const n = this.$method("dsRouter/getCurrentId");
        this.$method("dsWidget/setContent", { id: n, items: e.widgets.content });
      }
      return [s, u, e];
    },
    _createElements(g, i, t, s = [], p) {
      const m = [], r = {
        value: {},
        type: {}
      };
      for (let c = 0; c < g.length; c++) {
        const h = g[c], [v, u] = h.type;
        let e, n;
        if (s.length && u)
          for (let d = 0; d < s.length; d++) {
            const o = s[d], l = this.$method("dsElement/getType", o);
            if (v === l[0]) {
              e = o, s.splice(d, 1), n = !0;
              break;
            }
          }
        else
          e = this.$method("dsUtilities/generateId");
        if (m.push(e), !n)
          if (r.type[e] = [v, u], v === "section") {
            const d = {};
            for (let o = 0; o < h.value.length; o++) {
              const [l, y] = h.value[o], [a] = this.create({}, { entry: y, defaultContent: s, groupId: t, view: i, modifiers: p });
              d[l] = a;
            }
            r.value[e] = d;
          } else
            r.value[e] = h.value;
      }
      return [m, r, s];
    },
    _fetch(g) {
      return new Promise((i, t) => {
        this.$action(
          "dsDatabase/getOne",
          { collection: "widgetTemplates", id: g },
          {
            onSuccess: (s) => {
              this.set({}, { id: s.id, item: s }), i(s);
            },
            onError: (s) => {
              console.error(s), t(s);
            }
          }
        );
      });
    },
    set(g, { id: i, item: t }) {
      this.entry[i] = t.templateEntry, t.template && (this.items = { ...this.items, ...t.template }), t.modifiers && (this.modifiers[i] = t.modifiers), t.layouts && (this.$method("dsLayout/setItems", t.layouts.items), t.layouts.head && this.$method("dsLayout/setHead", t.layouts.head)), t.components && this.$method("dsComponent/set", t.components);
    }
  }
};
export {
  _ as default
};
