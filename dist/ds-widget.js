const C = {
  name: "dsWidget",
  version: 1,
  dependencies: [
    {
      name: "dsView",
      version: 1
    },
    {
      name: "dsContent",
      version: 1
    }
  ],
  data: {
    entry: {},
    content: {},
    loaded: {},
    view: {},
    templates: {},
    layout: {},
    sections: {},
    sectionParent: {},
    sectionView: {},
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
    attach({ type: t, id: e }) {
      this.attached[t][e] = !0;
    },
    create({ dsWidgetSectionId: t, dsViewId: e, prefixId: s, language: o }) {
      const [n, i] = this._getSections(t, s);
      let c = this._getSectionView(i);
      this.sectionView[t] = e;
      for (let a = 0; a < n.length; a++) {
        const r = n[a];
        c = this._getInstanceView(c, r.layout), this._createInstance(i, r.instanceId, r.groupId, r.layout, c, e, s, o);
      }
      this.attach({ type: "section", id: i });
    },
    getContentItem({ dsWidgetSectionId: t, dsWidgetInstanceId: e, dsWidgetPrefixId: s, contentIndex: o, dsWidgetView: n }) {
      n || (n = this._getSectionView(t));
      const i = t + e + "_" + n;
      if (this.content[s] && this.content[s][i])
        return this.content[s][i][o];
      {
        const c = this.sections[t].find((r) => r.instanceId === e);
        if (!c.layout[n])
          return this.getContentItem({ dsWidgetSectionId: t, dsWidgetInstanceId: e, dsWidgetPrefixId: s, contentIndex: o, view: "default", head: !1 });
        if (this._templateExists(t, e, c.layout, n))
          this._loadTemplate(t, e, c.groupId, c.layout, s, n, () => this.getContentItem({ dsWidgetSectionId: t, dsWidgetInstanceId: e, dsWidgetPrefixId: s, contentIndex: o, head: !1 }));
        else
          return this.getContentItem({ dsWidgetSectionId: t, dsWidgetInstanceId: e, dsWidgetPrefixId: s, contentIndex: o, head: !1 });
      }
    },
    getEntry(t) {
      return this.entry[t];
    },
    getLayout(t) {
      return this.layout[t];
    },
    getSectionParentId(t) {
      return this.sectionParent[t];
    },
    insert({ dsWidgetSectionId: t, dsWidgetItem: e, index: s }) {
      if (this.sections[t]) {
        e.groupId = this.$method("dsUtilities/generateId"), e.instanceId = this.$method("dsUtilities/generateId"), Number.isNaN(s) ? this.sections[t].push(e) : this.sections[t].splice(s, 0, e);
        let o = this._getSectionView(t);
        o = this._getInstanceView(o, e.layout);
        const n = this.$method("dsRouter/getCurrentId"), i = this.sectionView[t];
        this._createInstance(t, e.instanceId, e.groupId, e.layout, o, i, n);
      }
    },
    remove({ dsWidgetSectionId: t, dsWidgetPrefixId: e = "" }) {
      const [s, o] = this._getSections(t, e);
      let n = this._getSectionView(o);
      for (let i = 0; i < s.length; i++) {
        const c = s[i];
        let a = c.layout[n];
        c.layout[n] || (a = c.layout.default, n = "default"), this._detachInstance(o, c.instanceId, a.id, n, e);
      }
      this._detachItem("section", t);
    },
    set({ dsPageId: t, payload: e }) {
      e.sections && this.setSections(e.sections), e.content && this.setContent({ dsPageId: t, items: e.content }), e.loaded && (this.loaded = { ...this.loaded, ...e.loaded }), e.entry && (this.entry = { ...this.entry, ...e.entry }), e.layout && (this.layout = { ...this.layout, ...e.layout }), e.templates && (this.templates = { ...this.templates, ...e.templates });
    },
    setContent({ dsPageId: t, items: e }) {
      this.content[t] = { ...this.content[t], ...e };
    },
    setSections(t) {
      this.sections = { ...this.sections, ...t };
    },
    setLayout(t) {
      this.layout = { ...this.layout, ...t };
    },
    setLoaded({ id: t, value: e }) {
      this.loaded[t] = e;
    },
    setSectionParentId({ dsWidgetSectionId: t, dsWidgetSectionParentId: e }) {
      this.sectionParent[t] = e;
    },
    update({ dsWidgetSectionId: t, dsWidgetPrefixId: e, dsWidgetNextSectionId: s, dsWidgetNextPrefixId: o, dsViewId: n }) {
      const i = this.$method("dsMetadata/getLang");
      n || (n = this.sectionView[t] || this.$method("dsView/getRootViewId"));
      const [c, a] = this._getSections(t, e), [r, u] = this._getSections(s, o), f = r.length > c.length ? r.length : c.length, y = [], p = [];
      for (let l = 0; l < f; l++) {
        const h = c[l], m = r[l];
        let _ = this._getSectionView(a);
        if (m) {
          const w = this._getSectionView(u);
          if (h) {
            _ = this._getInstanceView(_, h.layout);
            const g = h.layout[_];
            p.push({
              sectionId: a,
              instanceId: h.instanceId,
              layout: g,
              view: _
            }), y.push({
              instanceId: m.instanceId,
              groupId: m.groupId,
              dsViewId: n,
              layout: m.layout,
              view: w
            });
          } else
            y.push({
              sectionId: u,
              instanceId: m.instanceId,
              dsViewId: n,
              layout: m.layout,
              view: w
            });
        } else {
          _ = this._getInstanceView(_, h.layout);
          const w = h.layout[_];
          p.push({ sectionId: a, instanceId: h.instanceId, layout: w, view: _ });
        }
      }
      if (p.length) {
        for (let l = 0; l < p.length; l++) {
          const h = p[l];
          this._detachInstance(h.sectionId, h.instanceId, h.layout.id, h.view, e);
        }
        this._detachItem("section", a);
      }
      if (y.length) {
        this.attach({ type: "section", id: u });
        for (let l = 0; l < y.length; l++) {
          const h = y[l], m = h.layout[h.view] ? h.view : "default";
          this._createInstance(u, h.instanceId, h.groupId, h.layout, m, h.dsViewId, o, i);
        }
      }
    },
    _createInstance(t, e, s, o, n, i, c, a) {
      if (this._getAttached("instance", e))
        return;
      this._templateExists(t, e, o, n) ? this._renderLayout(o[n].id, t, e, c, a, n, i) : this._loadTemplate(t, e, s, o, c, n, (u) => {
        this._renderLayout(u, t, e, c, a, n, i);
      });
    },
    _detachInstance(t, e, s, o, n) {
      const i = this.$method("dsLayout/getComponents", {
        dsWidgetInstanceId: e,
        dsWidgetView: o
      });
      for (let c = 0; c < i.length; c++) {
        const a = i[c];
        if (Object.prototype.hasOwnProperty.call(a, "contentIndex")) {
          const r = this.getContentItem({ dsWidgetSectionId: t, dsWidgetInstanceId: e, dsWidgetPrefixId: n, contentIndex: a.contentIndex });
          if (this.$method("dsContent/getType", r)[0] === "section") {
            const f = this.$method("dsContent/getValue", { dsContentId: r });
            this.remove({ dsWidgetSectionId: f, dsWidgetPrefixId: n });
          }
          this._detachItem("content", r);
        }
        a.dsViewId && this.$method("dsView/remove", a.dsViewId);
      }
      this._detachItem("instance", e);
    },
    _getAttached(t, e) {
      return this.attached[t][e];
    },
    _detachItem(t, e) {
      this.attached[t][e] && (this.attached[t][e] = !1);
    },
    _getLayoutId(t, e, s = "default") {
      const o = this.sections[t] || [];
      for (let n = 0; n < o.length; n++) {
        const i = o[n];
        if (i.instanceId === e)
          return i.layout[s] || i.layout.default;
      }
    },
    _getContent(t) {
      return this.content[t];
    },
    _getRenderQueue(t) {
      const e = {
        section: {},
        instance: {},
        content: []
      };
      for (const s in t)
        if (Object.prototype.hasOwnProperty.bind(t, s)) {
          const o = s.slice(0, 23);
          if (!this.attached.section[o])
            e.section[o] = !0;
          else {
            const n = s.slice(23, 46);
            if (!this.attached.instance[n])
              e.instance[n] = !0;
            else
              for (let i = 0; i < t[s].length; i++) {
                const c = t[s][i];
                this.attached.content[c] || e.content.push([o, n, i, c]);
              }
          }
        }
      return e;
    },
    _getItemByInstanceId(t, e, s) {
      const [o, n] = this._getSections(t, e);
      for (let i = 0; i < o.length; i++)
        if (o[i].instanceId === s)
          return [o[i], n];
    },
    _getSections(t, e) {
      const s = e + "_" + t;
      return this.sections[s] ? [this.sections[s], s, !0] : [this.sections[t] || [], t, !1];
    },
    _getSectionView(t) {
      return this.view[t] || "default";
    },
    _getInstanceView(t, e) {
      return e[t] ? t : "default";
    },
    _loadTemplate(t, e, s, o, n, i, c) {
      const r = this._getContent(n)[t + "_" + e + "_default"] || [], u = this.templates[o[i].modifierId];
      this.$action("dsTemplate/create", {
        id: o[i].templateId,
        sectionId: t,
        instanceId: e,
        groupId: s,
        defaultContent: r,
        modifiers: u,
        view: i,
        head: !0
      }, {
        onSuccess: (f) => {
          c(f[1]);
        },
        onError: (f) => console.log(f)
      });
    },
    _renderLayout(t, e, s, o, n, i, c) {
      this.$method("dsLayout/render", {
        dsLayoutId: t,
        dsWidgetSectionId: e,
        dsWidgetInstanceId: s,
        dsWidgetPrefixId: o,
        lang: n,
        view: i,
        dsViewId: c
      }), this.attach({ type: "instance", id: s });
    },
    _templateExists(t, e, s, o) {
      let n = t + e + "_" + o;
      return !this.loaded[n] && !s[o] && (n = t + e + "_default", o = "default"), !!this.loaded[n];
    }
  }
};
export {
  C as default
};
