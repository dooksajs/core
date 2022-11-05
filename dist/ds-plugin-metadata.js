const a = {
  name: "dsMetadata",
  version: 1,
  data: {
    appId: "",
    language: "default",
    theme: ""
  },
  methods: {
    getLang() {
      return this.language;
    },
    getTheme() {
      return this.theme;
    },
    setAppId(t, e) {
      this.appId = e;
    },
    setLang(t, e) {
      this.language = e;
    },
    setTheme(t, e) {
      this.theme = e;
    }
  }
};
export {
  a as default
};
