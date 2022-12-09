const t = {
  name: "dsMetadata",
  version: 1,
  data: {
    appId: "",
    language: "default",
    theme: ""
  },
  methods: {
    getLanguage() {
      return this.language;
    },
    getTheme() {
      return this.theme;
    },
    setAppId(e) {
      this.appId = e;
    },
    setLanguage(e) {
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
