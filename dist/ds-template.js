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
      id: a,
      entry: e,
      sectionId: n = this.$method("dsUtilities/generateId"),
      instanceId: s,
      groupId: m = this.$method("dsUtilities/generateId"),
      defaultContent: u,
      modifiers: y = {},
      view: h = "default",
      head: r = !1
    }) {
      let f = this.items[e] || this.items[this.entry[a]];
      return f ? this._constructor(a, e, f, n, s, m, u, y, h, r) : new Promise((w) => {
        this._fetch(a).then(() => {
          e = this.entry[a], f = this.items[e];
          const t = this._constructor(a, e, f, n, s, m, u, y, h, r);
          w(t);
        });
      });
    },
    _constructor(a, e, n, s, m, u, y, h, r, f) {
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
      if (f) {
        const o = n.layouts[0], d = s + m + "_" + r, i = 0;
        if (n.content[i]) {
          const [c, g] = this._createContent(n.content[i], r, u, y, h), l = e + o;
          h[l] && (t.widgets.layout = { [d]: h[l] }), t.widgets.content[d] = c, t.content = g;
        }
        if (n.events[i]) {
          const c = n.events[i];
          t.events = t.events || {};
          for (const g in c)
            if (Object.hasOwnProperty.call(c, g)) {
              const l = c[g], p = m + "_" + g.padStart(4, "0");
              for (const v in l)
                if (Object.hasOwnProperty.call(l, v)) {
                  const $ = l[v];
                  t.events[p + "_" + v] = $;
                }
            }
        }
        w = o, this.$method("dsWidget/setLoaded", { id: d, value: !0 });
      } else
        for (let o = 0; o < n.layouts.length; o++) {
          const d = n.layouts[o], i = {}, c = this.$method("dsUtilities/generateId"), g = s + c + "_default";
          if (n.content && n.content[o]) {
            const [l, p] = this._createContent(n.content[o], r, u, y, h), v = e + d;
            h[v] && (t.widgets.layout || (t.widgets.layout = {}), t.widgets.layout[s + c + "_default"] = h[v]), t.widgets.content[g] = l, t.content.value = { ...t.content.value, ...p.value }, t.content.type = { ...t.content.type, ...p.type };
          }
          if (n.events[o]) {
            const l = n.events[o];
            t.events = t.events || {};
            for (const p in l)
              if (Object.hasOwnProperty.call(l, p)) {
                const v = l[p], $ = c + "_" + p.padStart(4, "0") + "_" + v.on;
                t.events[$] = v.action;
              }
          }
          i.default = { id: d }, t.widgets.sections[s] ? t.widgets.sections[s].push({ groupId: u, instanceId: c, layout: i }) : t.widgets.sections[s] = [{ groupId: u, instanceId: c, layout: i }], this.$method("dsWidget/setLoaded", { id: g, value: !0 });
        }
      if (t.events && this.$method("dsEvent/set", t.events), t.content && (t.content.value && this.$method("dsContent/setValues", t.content.value), t.content.type && this.$method("dsContent/setTypes", t.content.type)), t.widgets && (t.widgets.sections && this.$method("dsWidget/setSection", t.widgets.sections), t.widgets.layout && this.$method("dsWidget/setLayout", t.widgets.layout), t.widgets.content)) {
        const o = this.$method("dsRouter/getCurrentId");
        this.$method("dsWidget/setContent", { dsPageId: o, items: t.widgets.content });
      }
      return [s, w, t];
    },
    _createContent(a, e, n, s = [], m) {
      const u = [], y = {
        value: {},
        type: {}
      };
      for (let h = 0; h < a.length; h++) {
        const r = a[h], [f, w] = r.type;
        let t, o;
        if (s.length && w)
          for (let d = 0; d < s.length; d++) {
            const i = s[d], c = this.$method("dsContent/getType", i);
            if (f === c[0]) {
              t = i, s.splice(d, 1), o = !0;
              break;
            }
          }
        else
          t = this.$method("dsUtilities/generateId");
        if (u.push(t), !o)
          if (y.type[t] = [f, w], f === "section") {
            const d = {};
            for (let i = 0; i < r.value.length; i++) {
              const [c, g] = r.value[i], [l] = this.create({ entry: g, defaultContent: s, groupId: n, view: e, modifiers: m });
              d[c] = l;
            }
            y.value[t] = d;
          } else
            y.value[t] = r.value;
      }
      return [u, y, s];
    },
    _fetch(a) {
      return new Promise((e, n) => {
        this.$action(
          "dsDatabase/getOne",
          { collection: "widgetTemplates", id: a },
          {
            onSuccess: (s) => {
              this.set({ id: s.id, item: s }), e(s);
            },
            onError: (s) => {
              console.error(s), n(s);
            }
          }
        );
      });
    },
    set({ id: a, item: e }) {
      this.entry[a] = e.templateEntry, e.template && (this.items = { ...this.items, ...e.template }), e.modifiers && (this.modifiers[a] = e.modifiers), e.layouts && (this.$method("dsLayout/setItems", e.layouts.items), e.layouts.head && this.$method("dsLayout/setHead", e.layouts.head)), e.components && this.$method("dsComponent/set", e.components);
    }
  }
};
export {
  _ as default
};
