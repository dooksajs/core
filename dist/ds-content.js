const n = {
  name: "dsContent",
  version: 1,
  data: {
    value: {},
    type: {},
    attachedView: {}
  },
  methods: {
    attachView({ id: t, dsViewId: e }) {
      const s = this.attachedView[t] || [], h = this.getValue({ id: t });
      s.length ? s.indexOf(e) === -1 && s.push(e) : s.push(e), this.attachedView[t] = s, this.$method("dsView/attachContent", { id: e, dsContentId: t }), h && this.$method("dsView/updateValue", { id: e, value: h }), this.$method("dsEvent/emit", {
        id: e,
        on: "dsContent/attachView",
        payload: {
          dsContentId: t,
          dsViewId: e
        }
      });
    },
    getType(t) {
      return this.type[t];
    },
    getValue({ id: t, language: e }) {
      return e || (e = this.$method("dsMetadata/getLanguage")), this.value[t] ? this.value[t][e] ? this.value[t][e] : this.value[t][e] : "";
    },
    setTypes(t) {
      this.type = { ...this.type, ...t };
    },
    setValue({ id: t, value: e, language: s }) {
      s = s || this.$method("dsMetadata/getLanguage"), this.value[t] ? this.value[t][s] = e : this.value[t] = {
        [s]: e
      }, this.$method("dsEvent/emit", {
        id: t,
        on: "dsContent/setValue",
        payload: {
          dsContentId: t,
          dsContentValue: e,
          language: s
        }
      });
    },
    setValues(t) {
      this.value = { ...this.value, ...t };
    }
  }
};
export {
  n as default
};
