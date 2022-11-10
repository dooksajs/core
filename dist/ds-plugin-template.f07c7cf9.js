const I = {
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
      id: a,
      entry: t,
      sectionId: i = this.$method("dsUtilities/generateId"),
      instanceId: s,
      groupId: g = this.$method("dsUtilities/generateId"),
      defaultContent: h,
      modifiers: u = {},
      view: c = "default",
      head: r = !1
    }) {
      let y = this.items[t] || this.items[this.entry[a]];
      return y ? this._constructor(a, t, y, i, s, g, h, u, c, r) : new Promise((p) => {
        this._fetch(a).then(() => {
          t = this.entry[a], y = this.items[t];
          const e = this._constructor(a, t, y, i, s, g, h, u, c, r);
          p(e);
        });
      });
    },
    _constructor(a, t, i, s, g, h, u, c, r, y) {
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
        const n = i.layouts[0], m = s + g + "_" + r, o = 0;
        if (i.elements[o]) {
          const [d, v] = this._createElements(i.elements[o], r, h, u, c), l = t + n;
          c[l] && (e.widgets.layout = { [m]: c[l] }), e.widgets.content[m] = d, e.elements = v;
        }
        if (i.events[o]) {
          const d = i.events[o];
          e.events = e.events || {};
          for (const v in d)
            if (Object.hasOwnProperty.call(d, v)) {
              const l = d[v], f = g + "_" + v.padStart(4, "0");
              e.events[f] ? e.events[f][l.on] = l.action : e.events[f] = {
                [l.on]: l.action
              };
            }
        }
        p = n, this.$method("dsWidget/setLoaded", { id: m, value: !0 });
      } else
        for (let n = 0; n < i.layouts.length; n++) {
          const m = i.layouts[n], o = {}, d = this.$method("dsUtilities/generateId"), v = s + d + "_default";
          if (i.elements && i.elements[n]) {
            const [l, f] = this._createElements(i.elements[n], r, h, u, c), w = t + m;
            c[w] && (e.widgets.layout || (e.widgets.layout = {}), e.widgets.layout[s + d + "_default"] = c[w]), e.widgets.content[v] = l, e.elements.value = { ...e.elements.value, ...f.value }, e.elements.type = { ...e.elements.type, ...f.type };
          }
          if (i.events[n]) {
            const l = i.events[n];
            e.events = e.events || {};
            for (const f in l)
              if (Object.hasOwnProperty.call(l, f)) {
                const w = l[f], $ = d + "_" + f.padStart(4, "0");
                e.events[$] ? e.events[$][w.on] = w.action : e.events[$] = {
                  [w.on]: w.action
                };
              }
          }
          o.default = { id: m }, e.widgets.items[s] ? e.widgets.items[s].push({ groupId: h, instanceId: d, layout: o }) : e.widgets.items[s] = [{ groupId: h, instanceId: d, layout: o }], this.$method("dsWidget/setLoaded", { id: v, value: !0 });
        }
      if (e.events && this.$method("dsEvent/set", e.events), e.elements && (e.elements.value && this.$method("dsElement/setValues", e.elements.value), e.elements.type && this.$method("dsElement/setTypes", e.elements.type)), e.widgets && (e.widgets.items && this.$method("dsWidget/setItems", e.widgets.items), e.widgets.layout && this.$method("dsWidget/setLayout", e.widgets.layout), e.widgets.content)) {
        const n = this.$method("dsRouter/getCurrentId");
        this.$method("dsWidget/setContent", { id: n, items: e.widgets.content });
      }
      return [s, p, e];
    },
    _createElements(a, t, i, s = [], g) {
      const h = [], u = {
        value: {},
        type: {}
      };
      for (let c = 0; c < a.length; c++) {
        const r = a[c], [y, p] = r.type;
        let e, n;
        if (s.length && p)
          for (let m = 0; m < s.length; m++) {
            const o = s[m], d = this.$method("dsElement/getType", o);
            if (y === d[0]) {
              e = o, s.splice(m, 1), n = !0;
              break;
            }
          }
        else
          e = this.$method("dsUtilities/generateId");
        if (h.push(e), !n)
          if (u.type[e] = [y, p], y === "section") {
            const m = {};
            for (let o = 0; o < r.value.length; o++) {
              const [d, v] = r.value[o], [l] = this.create({ entry: v, defaultContent: s, groupId: i, view: t, modifiers: g });
              m[d] = l;
            }
            u.value[e] = m;
          } else
            u.value[e] = r.value;
      }
      return [h, u, s];
    },
    _fetch(a) {
      return new Promise((t, i) => {
        this.$action(
          "dsDatabase/getOne",
          { collection: "widgetTemplates", id: a },
          {
            onSuccess: (s) => {
              this.set({ id: s.id, item: s }), t(s);
            },
            onError: (s) => {
              console.error(s), i(s);
            }
          }
        );
      });
    },
    set({ id: a, item: t }) {
      this.entry[a] = t.templateEntry, t.template && (this.items = { ...this.items, ...t.template }), t.modifiers && (this.modifiers[a] = t.modifiers), t.layouts && (this.$method("dsLayout/setItems", t.layouts.items), t.layouts.head && this.$method("dsLayout/setHead", t.layouts.head)), t.components && this.$method("dsComponent/set", t.components);
    }
  }
};
export {
  I as default
};
