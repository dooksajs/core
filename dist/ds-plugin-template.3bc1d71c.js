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
    create(v, {
      id: i,
      entry: t,
      sectionId: s = this.$method("dsUtilities/generateId"),
      instanceId: p,
      groupId: h = this.$method("dsUtilities/generateId"),
      defaultContent: u,
      modifiers: m = {},
      view: r = "default",
      head: f = !1
    }) {
      let c = this.items[t] || this.items[this.entry[i]];
      return c ? this._constructor(i, t, c, s, p, h, u, m, r, f) : new Promise((e) => {
        this._fetch(i).then(() => {
          t = this.entry[i], c = this.items[t];
          const n = this._constructor(i, t, c, s, p, h, u, m, r, f);
          e(n);
        });
      });
    },
    _constructor(v, i, t, s, p, h, u, m, r, f) {
      let c = "";
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
      if (f) {
        const n = t.layouts[0], a = s + p + "_" + r, o = 0;
        if (t.elements[o]) {
          const [d, y] = this._createElements(t.elements[o], r, h, u, m), l = i + n;
          m[l] && (e.widgets.layout = { [a]: m[l] }), e.widgets.content[a] = d, e.elements = y;
        }
        if (t.events[o]) {
          const d = t.events[o];
          e.events = e.events || {};
          for (const y in d)
            if (Object.hasOwnProperty.call(d, y)) {
              const l = d[y], g = p + "_" + y.padStart(4, "0");
              e.events[g] ? e.events[g][l.on] = l.action : e.events[g] = {
                [l.on]: l.action
              };
            }
        }
        c = n, this.$method("dsWidget/setLoaded", { id: a, value: !0 });
      } else
        for (let n = 0; n < t.layouts.length; n++) {
          const a = t.layouts[n], o = {}, d = this.$method("dsUtilities/generateId"), y = s + d + "_default";
          if (t.elements && t.elements[n]) {
            const [l, g] = this._createElements(t.elements[n], r, h, u, m), w = i + a;
            m[w] && (e.widgets.layout || (e.widgets.layout = {}), e.widgets.layout[s + d + "_default"] = m[w]), e.widgets.content[y] = l, e.elements.value = { ...e.elements.value, ...g.value }, e.elements.type = { ...e.elements.type, ...g.type };
          }
          if (t.events[n]) {
            const l = t.events[n];
            e.events = e.events || {};
            for (const g in l)
              if (Object.hasOwnProperty.call(l, g)) {
                const w = l[g], $ = d + "_" + g.padStart(4, "0");
                e.events[$] ? e.events[$][w.on] = w.action : e.events[$] = {
                  [w.on]: w.action
                };
              }
          }
          o.default = { id: a }, e.widgets.items[s] ? e.widgets.items[s].push({ groupId: h, instanceId: d, layout: o }) : e.widgets.items[s] = [{ groupId: h, instanceId: d, layout: o }], this.$method("dsWidget/setLoaded", { id: y, value: !0 });
        }
      if (e.events && this.$method("dsEvent/set", e.events), e.elements && (e.elements.value && this.$method("dsElement/setValues", e.elements.value), e.elements.type && this.$method("dsElement/setTypes", e.elements.type)), e.widgets && (e.widgets.items && this.$method("dsWidget/setItems", e.widgets.items), e.widgets.layout && this.$method("dsWidget/setLayout", e.widgets.layout), e.widgets.content)) {
        const n = this.$method("dsRouter/getCurrentId");
        this.$method("dsWidget/setContent", { id: n, items: e.widgets.content });
      }
      return [s, c, e];
    },
    _createElements(v, i, t, s = [], p) {
      const h = [], u = {
        value: {},
        type: {}
      };
      for (let m = 0; m < v.length; m++) {
        const r = v[m], [f, c] = r.type;
        let e, n;
        if (s.length && c)
          for (let a = 0; a < s.length; a++) {
            const o = s[a], d = this.$method("dsElement/getType", o);
            if (f === d[0]) {
              e = o, s.splice(a, 1), n = !0;
              break;
            }
          }
        else
          e = this.$method("dsUtilities/generateId");
        if (h.push(e), !n)
          if (u.type[e] = [f, c], f === "section") {
            const a = {};
            for (let o = 0; o < r.value.length; o++) {
              const [d, y] = r.value[o], [l] = this.create({}, { entry: y, defaultContent: s, groupId: t, view: i, modifiers: p });
              a[d] = l;
            }
            u.value[e] = a;
          } else
            u.value[e] = r.value;
      }
      return [h, u, s];
    },
    _fetch(v) {
      return new Promise((i, t) => {
        this.$action(
          "dsDatabase/getOne",
          { collection: "widgetTemplates", id: v },
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
    set(v, { id: i, item: t }) {
      this.entry[i] = t.templateEntry, t.template && (this.items = { ...this.items, ...t.template }), t.modifiers && (this.modifiers[i] = t.modifiers), t.layouts && (this.$method("dsLayout/setItems", t.layouts.items), t.layouts.head && this.$method("dsLayout/setHead", t.layouts.head)), t.components && this.$method("dsComponent/set", t.components);
    }
  }
};
export {
  I as default
};
