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
    getComponents({ instanceId: t, view: e = "default" }) {
      return this.components[e + t];
    },
    render({ id: t, sectionId: e, instanceId: n, view: h = "default", parentElementId: s = "appElement", prefixId: o, lang: m = "default" }) {
      let i = this.getComponents({ instanceId: n, view: h });
      if (i) {
        for (let a = 0; a < i.length; a++) {
          const d = i[a];
          this._attachComponent(i, d, e, n, h, s, o, m);
        }
        this.$method("dsWidget/attachItem", { type: "instance", id: n });
      } else {
        const a = this._getItem(t), d = this._getHead(t), p = this._getEvent(t);
        i = this._create(t, a, d, a, p, e, n, s, o, m, h);
        for (let l = 0; l < i.length; l++) {
          const $ = i[l];
          this._attachComponent(i, $, e, n, h, s, o, m);
        }
        this._setComponents(n, i, h);
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
    _attachComponent(t, e, n, h, s, o, m, i) {
      let a = o;
      if (e.elementId) {
        const d = isNaN(e.parentIndex) ? o : t[e.parentIndex].elementId;
        a = e.elementId, this.$method("dsElement/append", {
          parentId: d,
          childId: e.elementId
        });
      }
      if (Object.hasOwnProperty.call(e, "contentIndex")) {
        const d = this.$method("dsWidget/getContentItem", {
          sectionId: n,
          instanceId: h,
          prefixId: m,
          parentElementId: o,
          view: s,
          index: e.contentIndex
        });
        if (this.$method("dsElement/getType", d)[0] === "section") {
          const l = this.$method("dsElement/getDataValue", { id: d });
          this.$method("dsWidget/create", {
            id: n,
            parentElementId: o,
            prefixId: m,
            lang: i,
            view: s
          }), this.$method("dsWidget/setSectionParentId", { childId: l, parentId: n });
        } else
          this.$method("dsElement/attachContent", { contentId: d, elementId: a, lang: i });
        this.$method("dsWidget/attachItem", { type: "content", id: d });
      }
    },
    _create(t, e, n, h, s, o, m, i, a, d, p, l = [], $, g = 0) {
      let y = [];
      if (!l.length) {
        for (let r = 0; r < e.length; r++)
          l.push(m + "_" + r.toString().padStart(4, "0"));
        $ = l;
      }
      for (let r = 0; r < n.length; r++) {
        const c = h[n[r]], _ = {};
        let u = $[n[r]];
        if (Object.prototype.hasOwnProperty.call(c, "parentIndex") && (_.parentIndex = c.parentIndex), c.componentId) {
          const f = this.$method("dsWidget/getLayout", o + m + "_" + p), I = {
            id: c.componentId
          };
          this.modifiers[f] && this.modifiers[f][g] && (I.modifierId = this.modifiers[f][g]);
          const O = this.$method("dsComponent/get", I);
          if (O.textNode ? this.$method("dsElement/createNode", u) : this.$method("dsElement/createElement", { id: u, sectionId: o, instanceId: m, item: O }), s[g]) {
            const x = s[g];
            for (let C = 0; C < x.action.length; C++)
              this.$method("dsEvent/addListener", { id: u, name: x.on, item: x.action[C] });
          }
          _.elementId = u;
        } else
          u = i;
        if (y.push(_), c.children) {
          const f = this._getSibling(e, c.children, l), I = this._create(
            t,
            e,
            f.head,
            f.children,
            s,
            o,
            m,
            i,
            a,
            d,
            p,
            l,
            f.components,
            ++g
          );
          Object.hasOwnProperty.call(c, "contentIndex") && (_.contentIndex = c.contentIndex), y = y.concat(I);
        } else
          Object.hasOwnProperty.call(c, "contentIndex") && (_.contentIndex = c.contentIndex);
        g++;
      }
      return y;
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
      const h = {
        head: [],
        children: [],
        components: []
      };
      for (let s = 0; s < e.length; s++) {
        const o = e[s];
        h.components.push(n[o]), h.children.push(t[o]), h.head.push(s);
      }
      return h;
    }
  }
};
export {
  b as default
};
