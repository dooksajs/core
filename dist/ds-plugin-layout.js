const E = {
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
    getComponents(e, { instanceId: t, view: h = "default" }) {
      return this.components[h + t];
    },
    render(e, { id: t, sectionId: h, instanceId: i, view: s = "default", parentElementId: n = "appElement", prefixId: m, lang: l = "default" }) {
      let d = this.getComponents({}, { instanceId: i, view: s });
      if (d) {
        for (let o = 0; o < d.length; o++) {
          const g = d[o];
          this._attachComponent(d, g, h, i, s, n, m, l);
        }
        this.$method("dsWidget/attachItem", { type: "instance", id: i });
      } else {
        const o = this._getItem(t), g = this._getHead(t), r = this._getEvent(t);
        d = this._create(t, o, g, o, r, h, i, n, m, l, s);
        for (let _ = 0; _ < d.length; _++) {
          const p = d[_];
          this._attachComponent(d, p, h, i, s, n, m, l);
        }
        this._setComponents(i, d, s);
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
    _attachComponent(e, t, h, i, s, n, m, l) {
      let d = n;
      if (t.elementId) {
        const o = isNaN(t.parentIndex) ? n : e[t.parentIndex].elementId;
        d = t.elementId, this.$method("dsElement/append", {
          parentId: o,
          childId: t.elementId
        });
      }
      if (Object.hasOwnProperty.call(t, "contentIndex")) {
        const o = this.$method("dsWidget/getContentItem", {
          sectionId: h,
          instanceId: i,
          prefixId: m,
          parentElementId: n,
          view: s,
          index: t.contentIndex
        });
        if (this.$method("dsElement/getType", o)[0] === "section") {
          const r = this.$method("dsElement/getValue", { id: o });
          this.$method("dsWidget/create", {
            id: r,
            parentElementId: n,
            prefixId: m,
            lang: l,
            view: s
          });
        } else
          this.$method("dsElement/attachContent", { contentId: o, elementId: d, lang: l });
        this.$method("dsWidget/attachItem", { type: "content", id: o });
      }
    },
    _create(e, t, h, i, s, n, m, l, d, o, g, r = [], _, p = 0) {
      let C = [];
      if (!r.length) {
        for (let f = 0; f < t.length; f++)
          r.push(m + "_" + f.toString().padStart(4, "0"));
        _ = r;
      }
      for (let f = 0; f < h.length; f++) {
        const c = i[h[f]], u = {};
        let $ = _[h[f]];
        if (Object.prototype.hasOwnProperty.call(c, "parentIndex") && (u.parentIndex = c.parentIndex), c.componentId) {
          const a = this.$method("dsWidget/getLayout", n + m + "_" + g), x = {
            id: c.componentId
          };
          this.modifiers[a] && this.modifiers[a][p] && (x.modifierId = this.modifiers[a][p]);
          const y = this.$method("dsComponent/get", x);
          if (y.textNode ? this.$method("dsElement/createNode", $) : this.$method("dsElement/createElement", { id: $, sectionId: n, instanceId: m, item: y }), s[p]) {
            const I = s[p];
            for (let W = 0; W < I.action.length; W++)
              this.$method("dsEvent/addListener", { id: $, name: I.on, item: I.action[W] });
          }
          u.elementId = $;
        } else
          $ = l;
        if (C.push(u), c.children) {
          const a = this._getSibling(t, c.children, r), x = this._create(
            e,
            t,
            a.head,
            a.children,
            s,
            n,
            m,
            l,
            d,
            o,
            g,
            r,
            a.components,
            ++p
          );
          if (Object.hasOwnProperty.call(c, "contentIndex")) {
            const y = this.$method("dsWidget/getContentItem", {
              sectionId: n,
              instanceId: m,
              prefixId: d,
              parentElementId: l,
              index: c.contentIndex
            });
            u.contentIndex = c.contentIndex, this.$method("dsElement/attachContent", { contentId: y, elementId: $, lang: o }), this.$method("dsWidget/attachItem", { type: "content", id: y });
          }
          C = C.concat(x);
        } else if (Object.hasOwnProperty.call(c, "contentIndex")) {
          const a = this.$method("dsWidget/getContentItem", {
            sectionId: n,
            instanceId: m,
            prefixId: d,
            parentElementId: l,
            index: c.contentIndex
          });
          if (u.contentIndex = c.contentIndex, this.$method("dsElement/getType", a)[0] === "section") {
            const y = this.$method("dsElement/getValue", { id: a });
            this.$method("dsWidget/create", {
              id: y,
              parentElementId: $,
              prefixId: d,
              lang: o,
              view: g
            }), this.$method("dsWidget/setSectionParentId", { childId: y, parentId: n });
          } else
            this.$method("dsElement/attachContent", { contentId: a, elementId: $, lang: o });
          this.$method("dsWidget/attachItem", { type: "content", id: a });
        }
        p++;
      }
      return C;
    },
    _setComponents(e, t, h) {
      this.components[h + e] = t;
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
    _getSibling(e, t, h) {
      const i = {
        head: [],
        children: [],
        components: []
      };
      for (let s = 0; s < t.length; s++) {
        const n = t[s];
        i.components.push(h[n]), i.children.push(e[n]), i.head.push(s);
      }
      return i;
    }
  }
};
export {
  E as default
};
