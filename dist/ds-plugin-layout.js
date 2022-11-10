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
    getComponents(e, { instanceId: t, view: n = "default" }) {
      return this.components[n + t];
    },
    render(e, { id: t, sectionId: n, instanceId: o, view: s = "default", parentElementId: i = "appElement", prefixId: m, lang: c = "default" }) {
      let d = this.getComponents({}, { instanceId: o, view: s });
      if (d) {
        for (let h = 0; h < d.length; h++) {
          const g = d[h];
          this._attachComponent(d, g, n, o, s, i, m, c);
        }
        this.$method("dsWidget/attachItem", { type: "instance", id: o });
      } else {
        const h = this._getItem(t), g = this._getHead(t), l = this._getEvent(t);
        d = this._create(t, h, g, h, l, n, o, i, m, c, s);
        for (let _ = 0; _ < d.length; _++) {
          const r = d[_];
          this._attachComponent(d, r, n, o, s, i, m, c);
        }
        this._setComponents(o, d, s);
      }
    },
    setHead(e, t) {
      this.head = { ...this.head, ...t };
    },
    setModifiers(e, t) {
      this.modifiers = { ...this.modifiers, ...t };
    },
    setItems(e, t) {
      this.items = { ...this.items, ...t };
    },
    _attachComponent(e, t, n, o, s, i, m, c) {
      let d = i;
      if (t.elementId) {
        const h = isNaN(t.parentIndex) ? i : e[t.parentIndex].elementId;
        d = t.elementId, this.$method("dsElement/append", {
          parentId: h,
          childId: t.elementId
        });
      }
      if (Object.hasOwnProperty.call(t, "contentIndex")) {
        const h = this.$method("dsWidget/getContentItem", {
          sectionId: n,
          instanceId: o,
          prefixId: m,
          parentElementId: i,
          view: s,
          index: t.contentIndex
        });
        if (this.$method("dsElement/getType", h)[0] === "section") {
          const l = this.$method("dsElement/getValue", { id: h });
          this.$method("dsWidget/create", {
            id: n,
            parentElementId: i,
            prefixId: m,
            lang: c,
            view: s
          }), this.$method("dsWidget/setSectionParentId", { childId: l, parentId: n });
        } else
          this.$method("dsElement/attachContent", { contentId: h, elementId: d, lang: c });
        this.$method("dsWidget/attachItem", { type: "content", id: h });
      }
    },
    _create(e, t, n, o, s, i, m, c, d, h, g, l = [], _, r = 0) {
      let $ = [];
      if (!l.length) {
        for (let f = 0; f < t.length; f++)
          l.push(m + "_" + f.toString().padStart(4, "0"));
        _ = l;
      }
      for (let f = 0; f < n.length; f++) {
        const a = o[n[f]], u = {};
        let x = _[n[f]];
        if (Object.prototype.hasOwnProperty.call(a, "parentIndex") && (u.parentIndex = a.parentIndex), a.componentId) {
          const p = this.$method("dsWidget/getLayout", i + m + "_" + g), y = {
            id: a.componentId
          };
          this.modifiers[p] && this.modifiers[p][r] && (y.modifierId = this.modifiers[p][r]);
          const O = this.$method("dsComponent/get", y);
          if (O.textNode ? this.$method("dsElement/createNode", x) : this.$method("dsElement/createElement", { id: x, sectionId: i, instanceId: m, item: O }), s[r]) {
            const I = s[r];
            for (let C = 0; C < I.action.length; C++)
              this.$method("dsEvent/addListener", { id: x, name: I.on, item: I.action[C] });
          }
          u.elementId = x;
        } else
          x = c;
        if ($.push(u), a.children) {
          const p = this._getSibling(t, a.children, l), y = this._create(
            e,
            t,
            p.head,
            p.children,
            s,
            i,
            m,
            c,
            d,
            h,
            g,
            l,
            p.components,
            ++r
          );
          Object.hasOwnProperty.call(a, "contentIndex") && (u.contentIndex = a.contentIndex), $ = $.concat(y);
        } else
          Object.hasOwnProperty.call(a, "contentIndex") && (u.contentIndex = a.contentIndex);
        r++;
      }
      return $;
    },
    _setComponents(e, t, n) {
      this.components[n + e] = t;
    },
    _getHead(e) {
      return this.head[e] || [0];
    },
    _getEvent(e) {
      return this.event[e] || [];
    },
    _getItem(e) {
      return this.items[e];
    },
    _getSibling(e, t, n) {
      const o = {
        head: [],
        children: [],
        components: []
      };
      for (let s = 0; s < t.length; s++) {
        const i = t[s];
        o.components.push(n[i]), o.children.push(e[i]), o.head.push(s);
      }
      return o;
    }
  }
};
export {
  b as default
};
