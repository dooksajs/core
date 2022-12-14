const s = {
  name: "dsContent",
  version: 1,
  data: {
    value: {},
    type: {},
    attachedView: {}
  },
  methods: {
    attachView({ dsContentId: t, dsViewId: e }) {
      const h = this.attachedView[t] || [], i = this.getValue({ dsContentId: t });
      h.length ? h.indexOf(e) === -1 && h.push(e) : h.push(e), this.attachedView[t] = h, this.$method("dsView/attachContent", { dsViewId: e, dsContentId: t }), i && this.$method("dsView/updateValue", { dsViewId: e, dsContentId: t }), this.$method("dsEvent/emit", {
        dsEventId: e,
        dsEventOn: "dsContent/attachView",
        payload: {
          dsContentId: t,
          dsViewId: e
        }
      });
    },
    detachView({ dsContentId: t, dsViewId: e }) {
      const h = this.attachedView[t] || [];
      if (h.length) {
        const i = h.indexOf(e);
        i > -1 && h.splice(i, 1);
      }
      this.attachedView[t] = h, this.$method("dsView/detachContent", e), this.$method("dsEvent/emit", {
        dsEventId: e,
        dsEventOn: "dsContent/detachView",
        payload: {
          dsContentId: t,
          dsViewId: e
        }
      });
    },
    getType(t) {
      return this.type[t];
    },
    getValue({ dsContentId: t, language: e }) {
      return e || (e = this.$method("dsMetadata/getLanguage")), this.value[t] ? this.value[t][e] ? this.value[t][e] : this.value[t][e] : "";
    },
    setTypes(t) {
      this.type = { ...this.type, ...t };
    },
    setValue({ dsContentId: t, dsContentValue: e, language: h }) {
      h = h || this.$method("dsMetadata/getLanguage"), this.value[t] ? this.value[t][h] = e : this.value[t] = {
        [h]: e
      }, this.$method("dsEvent/emit", {
        dsEventId: t,
        dsEventOn: "dsContent/setValue",
        payload: {
          dsContentId: t,
          dsContentValue: e,
          language: h
        }
      });
    },
    setValues(t) {
      this.value = { ...this.value, ...t };
    }
  }
};
export {
  s as default
};
