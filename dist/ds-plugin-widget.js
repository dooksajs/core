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
    create(n, { id: t, parentElementId: e, prefixId: s, lang: i }) {
      const [o, c] = this._getItems(t, s);
      let h = this._getSectionView(c);
      for (let d = 0; d < o.length; d++) {
        const m = o[d];
        h = this._getInstanceView(h, m.layout), this._createInstance(c, m.instanceId, m.groupId, m.layout, h, e, s, i);
      }
      this.attachItem({}, { type: "section", id: c });
    },
    insert(n, { id: t, index: e, item: s }) {
      if (this.items[t]) {
        s.groupId = this.$method("dsUtilities/generateId"), s.instanceId = this.$method("dsUtilities/generateId"), Number.isNaN(e) ? this.items[t].push(s) : this.items[t].splice(e, 0, s);
        let i = this._getSectionView(t);
        i = this._getInstanceView(i, s.layout);
        const o = this.$method("dsRouter/getCurrentId");
        this._createInstance(t, s.instanceId, s.groupId, s.layout, i, "appElement", o);
      }
    },
    setSectionParentId(n, { childId: t, parentId: e }) {
      this.sectionParents[t] = e;
    },
    getSectionParentId(n, t) {
      return this.sectionParents[t];
    },
    _getSectionView(n) {
      return this.view[n] || "default";
    },
    _getInstanceView(n, t) {
      return t[n] ? n : "default";
    },
    setLayout(n, t) {
      this.layout = { ...this.layout, ...t };
    },
    getLayout(n, t) {
      return this.layout[t];
    },
    getHead(n, t) {
      return this.head[t];
    },
    set(n, { pageId: t, payload: e }) {
      e.items && this.setItems({}, e.items), e.content && this.setContent({}, { id: t, items: e.content }), e.loaded && (this.loaded = { ...this.loaded, ...e.loaded }), e.head && (this.head = { ...this.head, ...e.head }), e.layout && (this.layout = { ...this.layout, ...e.layout }), e.templates && (this.templates = { ...this.templates, ...e.templates });
    },
    setLoaded(n, { id: t, value: e }) {
      this.loaded[t] = e;
    },
    _templateExists(n, t, e, s) {
      let i = n + t + "_" + s;
      return !this.loaded[i] && !e[s] && (i = n + t + "_default", s = "default"), !!this.loaded[i];
    },
    _loadTemplate(n, t, e, s, i, o, c) {
      const d = this._getContent(i)[n + "_" + t + "_default"] || [], m = this.templates[s[o].modifierId];
      this.$action("dsTemplate/create", {
        id: s[o].templateId,
        sectionId: n,
        instanceId: t,
        groupId: e,
        defaultContent: d,
        modifiers: m,
        view: o,
        head: !0
      }, {
        onSuccess: (r) => {
          c(r[1]);
        },
        onError: (r) => console.log(r)
      });
    },
    _createInstance(n, t, e, s, i, o, c, h) {
      if (this._getAttachedItem("instance", t))
        return;
      this._templateExists(n, t, s, i) ? this._renderLayout(s[i].id, n, t, c, h, i, o) : this._loadTemplate(n, t, e, s, c, i, (m) => {
        this._renderLayout(m, n, t, c, h, i, o);
      });
    },
    _renderLayout(n, t, e, s, i, o, c) {
      this.$method("dsLayout/render", {
        id: n,
        sectionId: t,
        instanceId: e,
        prefixId: s,
        lang: i,
        view: o,
        parentElementId: c
      }), this.$method("dsWidget/attachItem", { type: "instance", id: e });
    },
    _getAttachedItem(n, t) {
      return this.attached[n][t];
    },
    attachItem(n, { type: t, id: e }) {
      this.attached[t][e] = !0;
    },
    _detachItem(n, t) {
      this.attached[n][t] && (this.attached[n][t] = !1);
    },
    _getLayoutId(n, t, e = "default") {
      const s = this.items[n] || [];
      for (let i = 0; i < s.length; i++) {
        const o = s[i];
        if (o.instanceId === t)
          return o.layout[e] || o.layout.default;
      }
    },
    update(n, { parentElementId: t, prevId: e, prevPrefixId: s, nextId: i, nextPrefixId: o }) {
      const c = this.$method("dsMetadata/getLang"), h = this._getContent(o), d = this._getRenderQueue(h);
      for (let l = 0; l < d.content.length; l++) {
        const [a, u, g, I] = d.content[l], p = this.getContentItem({}, { sectionId: s, instanceId: u, parentElementId: t, index: g }), x = this.$method("dsElement/getType", I), S = this._getLayoutId(a, u), V = this.$method("dsLayout/getComponents", { id: S.id, sectionId: a, instanceId: u });
        let $ = "";
        for (let _ = 0; _ < V.length; _++)
          if (V[_].contentIndex === g) {
            $ = u + "_" + _.toString().padStart(4, "0");
            break;
          }
        if (x[0] === "section") {
          const _ = this.$method("dsElement/getValue", { id: p, lang: c });
          this.remove({}, { sectionId: _, prefixId: s });
          const w = this.$method("dsElement/getValue", { id: I, lang: c });
          this.create({}, { id: w, parentElementId: $, prefixId: "", lang: c });
        } else
          this.$method("dsElement/detachContent", { contentId: p, elementId: $ }), this.$method("dsElement/attachContent", { contentId: I, elementId: $ });
        this._detachItem("content", p);
      }
      const [m, r] = this._getItems(e, s), [E, C] = this._getItems(i, o), L = E.length > m.length ? E.length : m.length, f = [], y = [];
      for (let l = 0; l < L; l++) {
        const a = m[l], u = E[l];
        let g = this._getSectionView(r);
        if (u) {
          const I = this._getSectionView(C);
          if (a) {
            g = this._getInstanceView(g, a.layout);
            const p = a.layout[g];
            y.push({
              sectionId: r,
              instanceId: a.instanceId,
              layout: p,
              view: g
            }), f.push({
              instanceId: u.instanceId,
              groupId: u.groupId,
              parentElementId: t,
              layout: u.layout,
              view: I
            });
          } else
            f.push({
              sectionId: C,
              instanceId: u.instanceId,
              parentElementId: t,
              layout: u.layout,
              view: I
            });
        } else {
          g = this._getInstanceView(g, a.layout);
          const I = a.layout[g];
          y.push({ sectionId: r, instanceId: a.instanceId, layout: I, view: g });
        }
      }
      if (y.length) {
        for (let l = 0; l < y.length; l++) {
          const a = y[l];
          this._detachInstance(a.sectionId, a.instanceId, a.layout.id, a.view, s);
        }
        this._detachItem("section", r);
      }
      if (f.length) {
        this.attachItem({}, { type: "section", id: C });
        for (let l = 0; l < f.length; l++) {
          const a = f[l], u = a.layout[a.view] ? a.view : "default";
          this._createInstance(C, a.instanceId, a.groupId, a.layout, u, a.parentElementId, o, c);
        }
      }
    },
    getContentItem(n, { sectionId: t, instanceId: e, prefixId: s, parentElementId: i, index: o, view: c }) {
      c || (c = this._getSectionView(t));
      const h = t + e + "_" + c;
      if (this.content[s] && this.content[s][h])
        return this.content[s][h][o];
      {
        const d = this.items[t].find((r) => r.instanceId === e);
        if (!d.layout[c])
          return this.getContentItem({}, { sectionId: t, instanceId: e, prefixId: s, parentElementId: i, index: o, view: "default", head: !1 });
        if (this._templateExists(t, e, d.layout, c))
          this._loadTemplate(t, e, d.groupId, d.layout, s, c, () => this.getContentItem({}, { sectionId: t, instanceId: e, prefixId: s, parentElementId: i, index: o, head: !1 }));
        else
          return this.getContentItem({}, { sectionId: t, instanceId: e, prefixId: s, parentElementId: i, index: o, head: !1 });
      }
    },
    _getContent(n) {
      return this.content[n];
    },
    _detachInstance(n, t, e, s, i) {
      const o = this.$method("dsLayout/getComponents", {
        instanceId: t,
        view: s
      });
      for (let c = 0; c < o.length; c++) {
        const h = o[c];
        if (Object.prototype.hasOwnProperty.call(h, "contentIndex")) {
          const d = this.getContentItem({}, { sectionId: n, instanceId: t, prefixId: i, index: h.contentIndex });
          if (this.$method("dsElement/getType", d)[0] === "section") {
            const r = this.$method("dsElement/getValue", { id: d });
            this.remove({}, { sectionId: r, prefixId: i });
          } else
            this.$method("dsElement/detachContent", { contentId: d, elementId: h.elementId });
          this._detachItem("content", d);
        }
        h.elementId && this.$method("dsElement/detachElement", h.elementId);
      }
      this._detachItem("instance", t);
    },
    remove(n, { sectionId: t, prefixId: e = "" }) {
      const [s, i] = this._getItems(t, e);
      let o = this._getSectionView(i);
      for (let c = 0; c < s.length; c++) {
        const h = s[c];
        let d = h.layout[o];
        h.layout[o] || (d = h.layout.default, o = "default"), this._detachInstance(i, h.instanceId, d.id, o, e);
      }
      this._detachItem("section", t);
    },
    setItems(n, t) {
      this.items = { ...this.items, ...t };
    },
    setContent(n, { id: t, items: e }) {
      this.content[t] = { ...this.content[t], ...e };
    },
    _getRenderQueue(n) {
      const t = {
        section: {},
        instance: {},
        content: []
      };
      for (const e in n)
        if (Object.prototype.hasOwnProperty.bind(n, e)) {
          const s = e.slice(0, 23);
          if (!this.attached.section[s])
            t.section[s] = !0;
          else {
            const i = e.slice(23, 46);
            if (!this.attached.instance[i])
              t.instance[i] = !0;
            else
              for (let o = 0; o < n[e].length; o++) {
                const c = n[e][o];
                this.attached.content[c] || t.content.push([s, i, o, c]);
              }
          }
        }
      return t;
    },
    _getItemByInstanceId(n, t, e) {
      const [s, i] = this._getItems(n, t);
      for (let o = 0; o < s.length; o++)
        if (s[o].instanceId === e)
          return [s[o], i];
    },
    _getItems(n, t) {
      const e = t + "_" + n;
      return this.items[e] ? [this.items[e], e, !0] : [this.items[n] || [], n, !1];
    }
  }
};
export {
  v as default
};
