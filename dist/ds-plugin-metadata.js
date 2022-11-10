const t = {
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
    setAppId(e) {
      this.appId = e;
    },
    setLang(e) {
      this.language = e;
    },
    setTheme(e) {
      this.theme = e;
    }
  }
};
export {
  t as default
};
