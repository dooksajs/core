const b = {
  name: "dsLayout",
  version: 1,
  data: {
    metadata: {},
    event: {},
    items: {},
    head: {},
    components: {},
    modifiers: {}
  },
  methods: {
    getComponents({ dsWidgetInstanceId: t, dsWidgetView: e = "default" }) {
      return this.components[e + t];
    },
    render({ dsLayoutId: t, dsWidgetSectionId: e, dsWidgetInstanceId: n, dsWidgetView: i = "default", dsViewId: s = "appElement", dsWidgetPrefixId: o, language: d = "default" }) {
      let h = this.getComponents({ dsWidgetInstanceId: n, dsWidgetView: i });
      if (h)
        for (let a = 0; a < h.length; a++) {
          const c = h[a];
          this._attachComponent(h, c, e, n, i, s, o, d);
        }
      else {
        const a = this._getItem(t), c = this._getHead(t), _ = this._getEvent(t);
        h = this._create(t, a, c, a, _, e, n, s, o, d, i);
        for (let m = 0; m < h.length; m++) {
          const $ = h[m];
          this._attachComponent(h, $, e, n, i, s, o, d);
        }
        this._setComponents(n, h, i);
      }
    },
    setHead(t) {
      this.head = { ...this.head, ...t };
    },
    setModifiers(t) {
      this.modifiers = { ...this.modifiers, ...t };
    },
    setItems(t) {
      this.items = { ...this.items, ...t };
    },
    _attachComponent(t, e, n, i, s, o, d, h) {
      let a = o;
      if (e.viewId && (o = isNaN(e.parentIndex) ? o : t[e.parentIndex].viewId, a = e.viewId, this.$method("dsView/append", {
        dsViewId: e.viewId,
        dsViewParentId: o
      })), !isNaN(e.contentIndex)) {
        const c = this.$method("dsWidget/getContentItem", {
          dsWidgetSectionId: n,
          dsWidgetInstanceId: i,
          dsWidgetPrefixId: d,
          dsViewId: o,
          dsWidgetView: s,
          contentIndex: e.contentIndex
        });
        if (this.$method("dsContent/getType", c)[0] === "section") {
          const m = this.$method("dsContent/getValue", c);
          this.$method("dsWidget/create", {
            dsWidgetSectionId: n,
            dsViewId: o,
            dsWidgetPrefixId: d,
            language: h,
            dsWidgetView: s
          }), this.$method("dsWidget/setSectionParentId", { dsWidgetSectionId: m, dsWidgetSectionParentId: n });
        } else
          this.$method("dsContent/attachView", { dsContentId: c, dsViewId: a });
        this.$method("dsWidget/attach", { type: "content", id: c });
      }
    },
    _create(t, e, n, i, s, o, d, h, a, c, _, m = [], $, f = 0) {
      let v = [];
      if (!m.length) {
        for (let r = 0; r < e.length; r++)
          m.push(d + "_" + r.toString().padStart(4, "0"));
        $ = m;
      }
      for (let r = 0; r < n.length; r++) {
        const l = i[n[r]], g = {};
        let C = $[n[r]];
        if (Object.prototype.hasOwnProperty.call(l, "parentIndex") && (g.parentIndex = l.parentIndex), l.componentId) {
          const p = this.$method("dsWidget/getLayout", o + d + "_" + _), u = {
            dsComponentId: l.componentId
          };
          this.modifiers[p] && this.modifiers[p][f] && (u.dsComponentModifierId = this.modifiers[p][f]);
          const I = this.$method("dsComponent/get", u);
          if (I.textNode ? this.$method("dsView/createNode", C) : this.$method("dsView/createElement", {
            dsViewId: C,
            dsWidgetSectionId: o,
            dsWidgetInstanceId: d,
            dsComponent: I
          }), s[f]) {
            const x = s[f];
            for (let y = 0; y < x.action.length; y++)
              this.$method("dsEvent/addListener", { id: C, name: x.on, dsActionId: x.action[y] });
          }
          g.viewId = C;
        } else
          C = h;
        if (v.push(g), l.children) {
          const p = this._getSibling(e, l.children, m), u = this._create(
            t,
            e,
            p.head,
            p.children,
            s,
            o,
            d,
            h,
            a,
            c,
            _,
            m,
            p.components,
            ++f
          );
          Object.hasOwnProperty.call(l, "contentIndex") && (g.contentIndex = l.contentIndex), v = v.concat(u);
        } else
          Object.hasOwnProperty.call(l, "contentIndex") && (g.contentIndex = l.contentIndex);
        f++;
      }
      return v;
    },
    _setComponents(t, e, n) {
      this.components[n + t] = e;
    },
    _getHead(t) {
      return this.head[t] || [0];
    },
    _getEvent(t) {
      return this.event[t] || [];
    },
    _getItem(t) {
      return this.items[t];
    },
    _getSibling(t, e, n) {
      const i = {
        head: [],
        children: [],
        components: []
      };
      for (let s = 0; s < e.length; s++) {
        const o = e[s];
        i.components.push(n[o]), i.children.push(t[o]), i.head.push(s);
      }
      return i;
    }
  }
};
export {
  b as default
};
