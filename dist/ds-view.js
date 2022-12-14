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
  setup({ rootElementId: t = "root" }) {
    const e = document.getElementById(t);
    if (!e)
      throw new Error("Could not find root element: ", e);
    this.rootViewId = "appElement", this.createElement({
      dsViewId: this.rootViewId,
      dsComponent: {
        tag: "div"
      }
    });
    const o = this.get(this.rootViewId);
    e.parentElement.replaceChild(o, e);
  },
  methods: {
    append({ dsViewId: t, dsViewParentId: e }) {
      const o = this.get(e), n = this.get(t);
      o.appendChild(n), this.$method("dsEvent/emit", {
        dsEventId: t,
        dsEventOn: "dsView/mount",
        payload: {
          dsViewParentId: e,
          dsViewId: t
        }
      }), this._setParent(t, e);
    },
    attachContent({ dsViewId: t, dsContentId: e }) {
      this.content[t] = e;
    },
    createElement({ dsViewId: t, dsComponent: e, dsWidgetSectionId: o, dsWidgetInstanceId: n }) {
      const i = document.createElement(e.tag);
      this.isDev && (i.id = t), i.dsViewId = t, this._set(t, i), e.attributes && this._setAttributes(t, e.attributes);
      const s = this.$component(i.tagName.toLowerCase());
      if (s && s.events)
        for (let r = 0; r < s.events.length; r++) {
          const a = s.events[r], l = (h) => {
            this.$method("dsEvent/emit", {
              dsEventId: t,
              dsEventOn: a,
              payload: {
                dsViewId: t,
                dsContentId: this._getContent(t),
                dsWidgetInstanceId: n,
                dsWidgetSectionId: o,
                event: h
              }
            });
          };
          i.addEventListener(a, l), this._setHander(t, l);
        }
    },
    createNode(t) {
      const e = document.createTextNode("");
      e.dsViewId = t, this._set(t, e);
    },
    get(t) {
      return this.nodes[t];
    },
    getParent(t) {
      return this.parentNode[t];
    },
    getValue(t) {
      const e = this.get(t), o = e.nodeName.toLowerCase(), n = this.$component(o);
      if (n && n.get) {
        if (n.get.type)
          return this[`_getValueBy/${n.get.type}`](e, n.get.value);
        let i;
        for (let s = 0; s < n.getter.length; s++) {
          const r = n.get[s], a = this[`_getValueBy/${r.type}`](e, r.value);
          i = { ...i, ...a };
        }
        return i;
      }
    },
    getRootViewId() {
      return this.rootViewId;
    },
    remove(t) {
      const e = this.get(t);
      e && (delete this.content[t], this._unmount(t), this._removeHanders(t), e.remove());
    },
    removeChildren(t) {
      const e = this.get(t);
      if (e && e.lastChild) {
        for (; e.lastChild; )
          this._unmount(e.lastChild.dsViewId), this._removeHanders(e.lastChild.dsViewId), e.removeChild(e.lastChild);
        this.$method("dsEvent/emit", {
          dsEventId: t,
          dsEventOn: "dsView/removeChildren",
          payload: { dsViewId: t }
        });
      }
    },
    replace({ dsViewParentId: t, dsViewId: e, prevDsViewId: o, childIndex: n }) {
      const i = this.get(e);
      let s, r;
      o ? (s = this.get(o), r = s.parentElement) : isNaN(n) || (r = this.get(t), s = r.childNodes[n]), s && (s.replaceWidth(i), this._unmount(s.dsViewId), this.$method("dsEvent/emit", {
        dsEventId: e,
        dsEventOn: "dsView/mount",
        payload: {
          dsViewId: e
        }
      }), this._setParent(e, r.dsViewId));
    },
    updateValue({ dsViewId: t, dsContentId: e, language: o }) {
      const n = this.get(t), i = n.nodeName.toLowerCase(), s = this.$method("dsContent/getValue", { dsContentId: e });
      if (i === "#text") {
        if (s.token)
          return this.$method("dsToken/textContent", {
            instanceId: t,
            text: s.text,
            updateText: (a) => {
              n.textContent = a;
            }
          });
        n.textContent = s.text;
        return;
      }
      const r = this.$component(i);
      if (r && r.setter) {
        if (r.setter.type)
          return this[`_setValueBy/${r.setter.type}`](n, r.setter.value, s);
        for (let a = 0; a < r.setter.length; a++) {
          const l = r.setter[a];
          this[`_setValueBy/${l.type}`](n, l.value, s);
        }
      }
    },
    _getContent(t) {
      return this.content[t];
    },
    "_getValueBy/attribute"(t, e) {
      if (typeof e == "string")
        return t.getAttribute(e);
      const o = {};
      for (let n = 0; n < e.length; n++) {
        const { name: i, key: s } = e[n];
        o[s] = t.getAttribute(i);
      }
      return o;
    },
    "_getValueBy/getter"(t, e) {
      if (typeof e == "string")
        return t.__lookupGetter__(e) ? t[e] : "";
      {
        const o = {};
        for (let n = 0; n < e.length; n++) {
          const { name: i, key: s } = e[n];
          t.__lookupGetter__(e) ? o[s] = t[i] : o[s] = "";
        }
        return o;
      }
    },
    _removeHanders(t) {
      delete this.handlers[t];
    },
    _set(t, e) {
      this.nodes[t] = e;
    },
    _setAttributes(t, e) {
      const o = this.get(t);
      for (const n in e)
        Object.prototype.hasOwnProperty.call(e, n) && o.setAttribute(n, e[n]);
    },
    _setHander(t, e) {
      this.handlers[t] ? this.handlers[t].push(e) : this.handlers[t] = [e];
    },
    _setParent(t, e) {
      this.parentNode[e] = t;
    },
    "_setValueBy/attribute"(t, e, o) {
      if (typeof e == "string")
        return t.setAttribute(e, o);
      for (let n = 0; n < e.length; n++) {
        const { name: i, key: s } = e[n];
        t.setAttribute(i, o[s]);
      }
    },
    "_setValueBy/setter"(t, e, o) {
      if (typeof e == "string")
        t.__lookupSetter__(e) && (t[e] = o);
      else
        for (let n = 0; n < e.length; n++) {
          const { name: i, key: s } = e[n];
          t.__lookupSetter__(i) && (t[i] = o[s]);
        }
    },
    _unmount(t) {
      this.$method("dsEvent/emit", {
        dsEventId: t,
        dsEventOn: "dsView/unmount",
        payload: { dsViewId: t }
      }), this._setParent(t, "");
    }
  }
};
export {
  u as default
};
