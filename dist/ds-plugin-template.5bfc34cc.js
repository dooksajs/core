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
      id: c,
      entry: e,
      sectionId: o = this.$method("dsUtilities/generateId"),
      instanceId: s,
      groupId: v = this.$method("dsUtilities/generateId"),
      defaultContent: u,
      modifiers: m = {},
      view: r = "default",
      head: h = !1
    }) {
      let g = this.items[e] || this.items[this.entry[c]];
      return g ? this._constructor(c, e, g, o, s, v, u, m, r, h) : new Promise((w) => {
        this._fetch(c).then(() => {
          e = this.entry[c], g = this.items[e];
          const t = this._constructor(c, e, g, o, s, v, u, m, r, h);
          w(t);
        });
      });
    },
    _constructor(c, e, o, s, v, u, m, r, h, g) {
      let w = "";
      const t = {
        layoutEntry: "",
        widgets: {
          items: {},
          content: {},
          layout: {}
        },
        content: {
          value: {},
          type: {}
        }
      };
      if (g) {
        const n = o.layouts[0], a = s + v + "_" + h, i = 0;
        if (o.content[i]) {
          const [d, y] = this._createContent(o.content[i], h, u, m, r), l = e + n;
          r[l] && (t.widgets.layout = { [a]: r[l] }), t.widgets.content[a] = d, t.content = y;
        }
        if (o.events[i]) {
          const d = o.events[i];
          t.events = t.events || {};
          for (const y in d)
            if (Object.hasOwnProperty.call(d, y)) {
              const l = d[y], p = v + "_" + y.padStart(4, "0");
              for (const f in l)
                if (Object.hasOwnProperty.call(l, f)) {
                  const $ = l[f];
                  t.events[p + "_" + f] = $;
                }
            }
        }
        w = n, this.$method("dsWidget/setLoaded", { id: a, value: !0 });
      } else
        for (let n = 0; n < o.layouts.length; n++) {
          const a = o.layouts[n], i = {}, d = this.$method("dsUtilities/generateId"), y = s + d + "_default";
          if (o.content && o.content[n]) {
            const [l, p] = this._createContent(o.content[n], h, u, m, r), f = e + a;
            r[f] && (t.widgets.layout || (t.widgets.layout = {}), t.widgets.layout[s + d + "_default"] = r[f]), t.widgets.content[y] = l, t.content.value = { ...t.content.value, ...p.value }, t.content.type = { ...t.content.type, ...p.type };
          }
          if (o.events[n]) {
            const l = o.events[n];
            t.events = t.events || {};
            for (const p in l)
              if (Object.hasOwnProperty.call(l, p)) {
                const f = l[p], $ = d + "_" + p.padStart(4, "0") + "_" + f.on;
                t.events[$] = f.action;
              }
          }
          i.default = { id: a }, t.widgets.sections[s] ? t.widgets.sections[s].push({ groupId: u, instanceId: d, layout: i }) : t.widgets.sections[s] = [{ groupId: u, instanceId: d, layout: i }], this.$method("dsWidget/setLoaded", { id: y, value: !0 });
        }
      if (t.events && this.$method("dsEvent/set", t.events), t.content && (t.content.value && this.$method("dsContent/setValues", t.content.value), t.content.type && this.$method("dsContent/setTypes", t.content.type)), t.widgets && (t.widgets.sections && this.$method("dsWidget/setSection", t.widgets.sections), t.widgets.layout && this.$method("dsWidget/setLayout", t.widgets.layout), t.widgets.content)) {
        const n = this.$method("dsRouter/getCurrentId");
        this.$method("dsWidget/setContent", { dsPageId: n, items: t.widgets.content });
      }
      return [s, w, t];
    },
    _createContent(c, e, o, s = [], v) {
      const u = [], m = {
        value: {},
        type: {}
      };
      for (let r = 0; r < c.length; r++) {
        const h = c[r], [g, w] = h.type;
        let t, n;
        if (s.length && w)
          for (let a = 0; a < s.length; a++) {
            const i = s[a], d = this.$method("dsContent/getType", i);
            if (g === d[0]) {
              t = i, s.splice(a, 1), n = !0;
              break;
            }
          }
        else
          t = this.$method("dsUtilities/generateId");
        if (u.push(t), !n)
          if (m.type[t] = [g, w], g === "section") {
            const a = {};
            for (let i = 0; i < h.value.length; i++) {
              const [d, y] = h.value[i], [l] = this.create({ entry: y, defaultContent: s, groupId: o, view: e, modifiers: v });
              a[d] = l;
            }
            m.value[t] = a;
          } else
            m.value[t] = h.value;
      }
      return [u, m, s];
    },
    _fetch(c) {
      return new Promise((e, o) => {
        this.$action(
          "dsDatabase/getOne",
          { collection: "widgetTemplates", id: c },
          {
            onSuccess: (s) => {
              this.set({ id: s.id, item: s }), e(s);
            },
            onError: (s) => {
              console.error(s), o(s);
            }
          }
        );
      });
    },
    set({ id: c, item: e }) {
      this.entry[c] = e.templateEntry, e.template && (this.items = { ...this.items, ...e.template }), e.modifiers && (this.modifiers[c] = e.modifiers), e.layouts && (this.$method("dsLayout/setItems", e.layouts.items), e.layouts.head && this.$method("dsLayout/setHead", e.layouts.head)), e.components && this.$method("dsComponent/set", e.components);
    }
  }
};
export {
  _ as default
};
