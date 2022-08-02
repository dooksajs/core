/**
 * Ds Plugin.
 * @module plugin
 */
export default {
  name: 'dsMetadata',
  version: 1,
  data: {
    appId: '',
    language: 'default',
    theme: ''
  },
  methods: {
    getLang () {
      return this.language
    },
    getTheme () {
      return this.theme
    },
    /**
     * Set the apps id
     * @param {string} id - appId
     */
    setAppId (context, id) {
      this.appId = id
    },
    /**
     * Set the apps language
     * @param {string} value - name of theme
     */
    setLang (context, value) {
      this.language = value
    },
    /**
     * Set the apps theme name
     * @param {string} value - name of theme
     */
    setTheme (context, value) {
      this.theme = value
    }
  }
}
