const v = {
  name: "dsWidget",
  version: 1,
  dependencies: [
    {
      name: "dsElement",
      version: 1
    }
  ],
  data: {
    head: {},
    items: {},
    content: {},
    loaded: {},
    view: {},
    templates: {},
    layout: {},
    sectionParents: {},
    attached: {
      section: {},
      instance: {},
      content: {}
    },
    render: {
      section: {},
      instance: {},
      content: []
    }
  },
  methods: {
    create({ id: t, parentElementId: e, prefixId: n, lang: o }) {
      const [s, i] = this._getItems(t, n);
      let h = this._getSectionView(i);
      for (let a = 0; a < s.length; a++) {
        const d = s[a];
        h = this._getInstanceView(h, d.layout), this._createInstance(i, d.instanceId, d.groupId, d.layout, h, e, n, o);
      }
      this.attachItem({ type: "section", id: i });
    },
    insert({ id: t, index: e, item: n }) {
      if (this.items[t]) {
        n.groupId = this.$method("dsUtilities/generateId"), n.instanceId = this.$method("dsUtilities/generateId"), Number.isNaN(e) ? this.items[t].push(n) : this.items[t].splice(e, 0, n);
        let o = this._getSectionView(t);
        o = this._getInstanceView(o, n.layout);
        const s = this.$method("dsRouter/getCurrentId");
        this._createInstance(t, n.instanceId, n.groupId, n.layout, o, "appElement", s);
      }
    },
    setSectionParentId({ childId: t, parentId: e }) {
      this.sectionParents[t] = e;
    },
    getSectionParentId(t) {
      return this.sectionParents[t];
    },
    _getSectionView(t) {
      return this.view[t] || "default";
    },
    _getInstanceView(t, e) {
      return e[t] ? t : "default";
    },
    setLayout(t) {
      this.layout = { ...this.layout, ...t };
    },
    getLayout(t) {
      return this.layout[t];
    },
    getHead(t) {
      return this.head[t];
    },
    set({ pageId: t, payload: e }) {
      e.items && this.setItems(e.items), e.content && this.setContent({ id: t, items: e.content }), e.loaded && (this.loaded = { ...this.loaded, ...e.loaded }), e.head && (this.head = { ...this.head, ...e.head }), e.layout && (this.layout = { ...this.layout, ...e.layout }), e.templates && (this.templates = { ...this.templates, ...e.templates });
    },
    setLoaded({ id: t, value: e }) {
      this.loaded[t] = e;
    },
    _templateExists(t, e, n, o) {
      let s = t + e + "_" + o;
      return !this.loaded[s] && !n[o] && (s = t + e + "_default", o = "default"), !!this.loaded[s];
    },
    _loadTemplate(t, e, n, o, s, i, h) {
      const d = this._getContent(s)[t + "_" + e + "_default"] || [], u = this.templates[o[i].modifierId];
      this.$action("dsTemplate/create", {
        id: o[i].templateId,
        sectionId: t,
        instanceId: e,
        groupId: n,
        defaultContent: d,
        modifiers: u,
        view: i,
        head: !0
      }, {
        onSuccess: (g) => {
          h(g[1]);
        },
        onError: (g) => console.log(g)
      });
    },
    _createInstance(t, e, n, o, s, i, h, a) {
      if (this._getAttachedItem("instance", e))
        return;
      this._templateExists(t, e, o, s) ? this._renderLayout(o[s].id, t, e, h, a, s, i) : this._loadTemplate(t, e, n, o, h, s, (u) => {
        this._renderLayout(u, t, e, h, a, s, i);
      });
    },
    _renderLayout(t, e, n, o, s, i, h) {
      this.$method("dsLayout/render", {
        id: t,
        sectionId: e,
        instanceId: n,
        prefixId: o,
        lang: s,
        view: i,
        parentElementId: h
      }), this.$method("dsWidget/attachItem", { type: "instance", id: n });
    },
    _getAttachedItem(t, e) {
      return this.attached[t][e];
    },
    attachItem({ type: t, id: e }) {
      this.attached[t][e] = !0;
    },
    _detachItem(t, e) {
      this.attached[t][e] && (this.attached[t][e] = !1);
    },
    _getLayoutId(t, e, n = "default") {
      const o = this.items[t] || [];
      for (let s = 0; s < o.length; s++) {
        const i = o[s];
        if (i.instanceId === e)
          return i.layout[n] || i.layout.default;
      }
    },
    update({ parentElementId: t, prevId: e, prevPrefixId: n, nextId: o, nextPrefixId: s }) {
      const i = this.$method("dsMetadata/getLang"), h = this._getContent(s), a = this._getRenderQueue(h);
      for (let l = 0; l < a.content.length; l++) {
        const [c, m, r, I] = a.content[l], p = this.getContentItem({ sectionId: n, instanceId: m, parentElementId: t, index: r }), L = this.$method("dsElement/getType", I), S = this._getLayoutId(c, m), E = this.$method("dsLayout/getComponents", { id: S.id, sectionId: c, instanceId: m });
        let $ = "";
        for (let _ = 0; _ < E.length; _++)
          if (E[_].contentIndex === r) {
            $ = m + "_" + _.toString().padStart(4, "0");
            break;
          }
        if (L[0] === "section") {
          const _ = this.$method("dsElement/getValue", { id: p, lang: i });
          this.remove({ sectionId: _, prefixId: n });
          const V = this.$method("dsElement/getValue", { id: I, lang: i });
          this.create({ id: V, parentElementId: $, prefixId: "", lang: i });
        } else
          this.$method("dsElement/detachContent", { contentId: p, elementId: $ }), this.$method("dsElement/attachContent", { contentId: I, elementId: $ });
        this._detachItem("content", p);
      }
      const [d, u] = this._getItems(e, n), [g, C] = this._getItems(o, s), w = g.length > d.length ? g.length : d.length, f = [], y = [];
      for (let l = 0; l < w; l++) {
        const c = d[l], m = g[l];
        let r = this._getSectionView(u);
        if (m) {
          const I = this._getSectionView(C);
          if (c) {
            r = this._getInstanceView(r, c.layout);
            const p = c.layout[r];
            y.push({
              sectionId: u,
              instanceId: c.instanceId,
              layout: p,
              view: r
            }), f.push({
              instanceId: m.instanceId,
              groupId: m.groupId,
              parentElementId: t,
              layout: m.layout,
              view: I
            });
          } else
            f.push({
              sectionId: C,
              instanceId: m.instanceId,
              parentElementId: t,
              layout: m.layout,
              view: I
            });
        } else {
          r = this._getInstanceView(r, c.layout);
          const I = c.layout[r];
          y.push({ sectionId: u, instanceId: c.instanceId, layout: I, view: r });
        }
      }
      if (y.length) {
        for (let l = 0; l < y.length; l++) {
          const c = y[l];
          this._detachInstance(c.sectionId, c.instanceId, c.layout.id, c.view, n);
        }
        this._detachItem("section", u);
      }
      if (f.length) {
        this.attachItem({ type: "section", id: C });
        for (let l = 0; l < f.length; l++) {
          const c = f[l], m = c.layout[c.view] ? c.view : "default";
          this._createInstance(C, c.instanceId, c.groupId, c.layout, m, c.parentElementId, s, i);
        }
      }
    },
    getContentItem({ sectionId: t, instanceId: e, prefixId: n, parentElementId: o, index: s, view: i }) {
      i || (i = this._getSectionView(t));
      const h = t + e + "_" + i;
      if (this.content[n] && this.content[n][h])
        return this.content[n][h][s];
      {
        const a = this.items[t].find((u) => u.instanceId === e);
        if (!a.layout[i])
          return this.getContentItem({ sectionId: t, instanceId: e, prefixId: n, parentElementId: o, index: s, view: "default", head: !1 });
        if (this._templateExists(t, e, a.layout, i))
          this._loadTemplate(t, e, a.groupId, a.layout, n, i, () => this.getContentItem({ sectionId: t, instanceId: e, prefixId: n, parentElementId: o, index: s, head: !1 }));
        else
          return this.getContentItem({ sectionId: t, instanceId: e, prefixId: n, parentElementId: o, index: s, head: !1 });
      }
    },
    _getContent(t) {
      return this.content[t];
    },
    _detachInstance(t, e, n, o, s) {
      const i = this.$method("dsLayout/getComponents", {
        instanceId: e,
        view: o
      });
      for (let h = 0; h < i.length; h++) {
        const a = i[h];
        if (Object.prototype.hasOwnProperty.call(a, "contentIndex")) {
          const d = this.getContentItem({ sectionId: t, instanceId: e, prefixId: s, index: a.contentIndex });
          if (this.$method("dsElement/getType", d)[0] === "section") {
            const g = this.$method("dsElement/getValue", { id: d });
            this.remove({ sectionId: g, prefixId: s });
          } else
            this.$method("dsElement/detachContent", { contentId: d, elementId: a.elementId });
          this._detachItem("content", d);
        }
        a.elementId && this.$method("dsElement/detachElement", a.elementId);
      }
      this._detachItem("instance", e);
    },
    remove({ sectionId: t, prefixId: e = "" }) {
      const [n, o] = this._getItems(t, e);
      let s = this._getSectionView(o);
      for (let i = 0; i < n.length; i++) {
        const h = n[i];
        let a = h.layout[s];
        h.layout[s] || (a = h.layout.default, s = "default"), this._detachInstance(o, h.instanceId, a.id, s, e);
      }
      this._detachItem("section", t);
    },
    setItems(t) {
      this.items = { ...this.items, ...t };
    },
    setContent({ id: t, items: e }) {
      this.content[t] = { ...this.content[t], ...e };
    },
    _getRenderQueue(t) {
      const e = {
        section: {},
        instance: {},
        content: []
      };
      for (const n in t)
        if (Object.prototype.hasOwnProperty.bind(t, n)) {
          const o = n.slice(0, 23);
          if (!this.attached.section[o])
            e.section[o] = !0;
          else {
            const s = n.slice(23, 46);
            if (!this.attached.instance[s])
              e.instance[s] = !0;
            else
              for (let i = 0; i < t[n].length; i++) {
                const h = t[n][i];
                this.attached.content[h] || e.content.push([o, s, i, h]);
              }
          }
        }
      return e;
    },
    _getItemByInstanceId(t, e, n) {
      const [o, s] = this._getItems(t, e);
      for (let i = 0; i < o.length; i++)
        if (o[i].instanceId === n)
          return [o[i], s];
    },
    _getItems(t, e) {
      const n = e + "_" + t;
      return this.items[n] ? [this.items[n], n, !0] : [this.items[t] || [], t, !1];
    }
  }
};
export {
  v as default
};
