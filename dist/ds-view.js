const u = {
  name: "dsView",
  version: 1,
  data: {
    rootViewId: "",
    attributes: {},
    content: {},
    handlers: {},
    nodes: {},
    parentNode: {}
  },
  setup({ rootElementId: e = "root" }) {
    const t = document.getElementById(e);
    if (!t)
      throw new Error("Could not find root element: ", t);
    this.rootViewId = "appElement", this.createElement({
      dsViewId: this.rootViewId,
      dsComponent: {
        tag: "div"
      }
    });
    const o = this.get(this.rootViewId);
    t.parentElement.replaceChild(o, t);
  },
  methods: {
    append({ dsViewId: e, dsViewParentId: t }) {
      const o = this.get(t), n = this.get(e);
      o.appendChild(n), this.$method("dsEvent/emit", {
        dsEventId: e,
        dsEventOn: "dsView/mount",
        payload: {
          dsViewParentId: t,
          dsViewId: e
        }
      }), this._setParent(e, t);
    },
    attachContent({ dsViewId: e, dsContentId: t }) {
      this.content[e] = t;
    },
    createElement({ dsViewId: e, dsComponent: t, dsWidgetSectionId: o, dsWidgetInstanceId: n }) {
      const i = document.createElement(t.tag);
      this.isDev && (i.id = e), i.dsViewId = e, this._set(e, i), t.attributes && this._setAttributes(e, t.attributes);
      const s = this.$component(i.tagName.toLowerCase());
      if (s && s.events)
        for (let r = 0; r < s.events.length; r++) {
          const a = s.events[r], h = (l) => {
            this.$method("dsEvent/emit", {
              dsEventId: e,
              dsEventOn: a,
              payload: {
                dsViewId: e,
                dsContentId: this._getContent(e),
                dsWidgetInstanceId: n,
                dsWidgetSectionId: o,
                event: l
              }
            });
          };
          i.addEventListener(a, h), this._setHander(e, h);
        }
    },
    createNode(e) {
      const t = document.createTextNode("");
      t.dsViewId = e, this._set(e, t);
    },
    get(e) {
      return this.nodes[e];
    },
    getParent(e) {
      return this.parentNode[e];
    },
    getValue(e) {
      const t = this.get(e), o = t.nodeName.toLowerCase(), n = this.$component(o);
      if (n && n.get) {
        if (n.get.type)
          return this[`_getValueBy/${n.get.type}`](t, n.get.value);
        let i;
        for (let s = 0; s < n.getter.length; s++) {
          const r = n.get[s], a = this[`_getValueBy/${r.type}`](t, r.value);
          i = { ...i, ...a };
        }
        return i;
      }
    },
    getRootViewId() {
      return this.rootViewId;
    },
    remove(e) {
      const t = this.get(e);
      t && (delete this.content[e], this._unmount(e), this._removeHanders(e), t.remove());
    },
    removeChildren(e) {
      const t = this.get(e);
      if (t && t.lastChild) {
        for (; t.lastChild; )
          this._unmount(t.lastChild.dsViewId), this._removeHanders(t.lastChild.dsViewId), t.removeChild(t.lastChild);
        this.$method("dsEvent/emit", {
          dsEventId: e,
          dsEventOn: "dsView/removeChildren",
          payload: { dsViewId: e }
        });
      }
    },
    replace({ dsViewParentId: e, dsViewId: t, prevDsViewId: o, childIndex: n }) {
      const i = this.get(t);
      let s, r;
      o ? (s = this.get(o), r = s.parentElement) : isNaN(n) || (r = this.get(e), s = r.childNodes[n]), s && (s.replaceWidth(i), this._unmount(s.dsViewId), this.$method("dsEvent/emit", {
        dsEventId: t,
        dsEventOn: "dsView/mount",
        payload: {
          dsViewId: t
        }
      }), this._setParent(t, r.dsViewId));
    },
    updateValue({ dsViewId: e, dsContentValue: t, language: o }) {
      const n = this.get(e), i = n.nodeName.toLowerCase();
      if (i === "#text") {
        if (t.token)
          return this.$method("dsToken/textContent", { instanceId: e, text: t.text, updateText: n.textContent });
        n.textContent = t.text;
        return;
      }
      const s = this.$component(i);
      if (s && s.setter) {
        if (s.setter.type)
          return this[`_setValueBy/${s.setter.type}`](n, s.setter.value, t);
        for (let r = 0; r < s.setter.length; r++) {
          const a = s.setter[r];
          this[`_setValueBy/${a.type}`](n, a.value, t);
        }
      }
    },
    _getContent(e) {
      return this.content[e];
    },
    "_getValueBy/attribute"(e, t) {
      if (typeof t == "string")
        return e.getAttribute(t);
      const o = {};
      for (let n = 0; n < t.length; n++) {
        const { name: i, key: s } = t[n];
        o[s] = e.getAttribute(i);
      }
      return o;
    },
    "_getValueBy/getter"(e, t) {
      if (typeof t == "string")
        return e.__lookupGetter__(t) ? e[t] : "";
      {
        const o = {};
        for (let n = 0; n < t.length; n++) {
          const { name: i, key: s } = t[n];
          e.__lookupGetter__(t) ? o[s] = e[i] : o[s] = "";
        }
        return o;
      }
    },
    _removeHanders(e) {
      delete this.handlers[e];
    },
    _set(e, t) {
      this.nodes[e] = t;
    },
    _setAttributes(e, t) {
      const o = this.get(e);
      for (const n in t)
        Object.prototype.hasOwnProperty.call(t, n) && o.setAttribute(n, t[n]);
    },
    _setHander(e, t) {
      this.handlers[e] ? this.handlers[e].push(t) : this.handlers[e] = [t];
    },
    _setParent(e, t) {
      this.parentNode[t] = e;
    },
    "_setValueBy/attribute"(e, t, o) {
      if (typeof t == "string")
        return e.setAttribute(t, o);
      for (let n = 0; n < t.length; n++) {
        const { name: i, key: s } = t[n];
        e.setAttribute(i, o[s]);
      }
    },
    "_setValueBy/setter"(e, t, o) {
      if (typeof t == "string")
        e.__lookupSetter__(t) && (e[t] = o);
      else
        for (let n = 0; n < t.length; n++) {
          const { name: i, key: s } = t[n];
          e.__lookupSetter__(i) && (e[i] = o[s]);
        }
    },
    _unmount(e) {
      this.$method("dsEvent/emit", {
        dsEventId: e,
        dsEventOn: "dsView/unmount",
        payload: { dsViewId: e }
      }), this._setParent(e, "");
    }
  }
};
export {
  u as default
};
