/**
 * @typedef {string} dsContentId - dsContent item id
 * @example
 * '_dc2JZQNbm0hh8mE9bE1FHF'
 */

/**
 * @typedef dsContentValue - Headless content value
 * @property {(string|number|Object.<string, (string|number)>)} dsContentValue - The value of content
 * @example <caption>Example of string value</caption>
 * 'Hello world!'
 * @example <caption>Example of number value</caption>
 * 100
 * @example <caption>Example of Object value</caption>
 * { href: 'http://example.com', target: '_blank', visited: 1 }
 */

/**
 * @typedef {string} dsContentLanguage - Content language in ISO 639-2 format
 * @example
 * 'en'
 */

/**
 * @typedef dsContentType - Headless content type
 * @property {Array.<string, boolean>} dsContentType - Array of the type and a boolean that determines if the content is permanent
 * @example
 * ['link', true]
 */

/**
 * Dooksa content management plugin
 * @namespace dsContent
 */
export default {
  name: 'dsContent',
  version: 1,
  data: {
    value: {},
    type: {},
    elements: {}
  },
  /** @lends dsContent.prototype */
  methods: {
    /**
     * Get content type
     * @param {string} id - Content id
     * @returns {dsContentType} An array that contains the content type and a boolean used to indicate if the content is permanent
     */
    getType (id) {
      return this.type[id]
    },
    /**
     * Get content value
     * @param {string} id - Content id
     * @param {dsContentLanguage} language - Language in ISO 639-2
     * @returns {dsContentValue}
     */
    getValue ({ id, language }) {
      if (!language) {
        language = this.$method('dsMetadata/getLanguage')
      }

      if (this.value[id]) {
        if (this.value[id][language]) {
          return this.value[id][language]
        }

        return this.value[id][language]
      }

      // ISSUE: this should throw an error
      return ''
    },
    /**
     * Set types
     * @param {dsContentType[]} types - A collection of types
     */
    setTypes (types) {
      this.type = { ...this.type, ...types }
    },
    /**
     * Set value
     * @param {string} id - Content id
     * @param {dsContentValue} value - The value of content
     * @param {string} language - The content language in ISO 639-2 format
     */
    setValue (id, value, language) {
      if (this.value[id]) {
        this.value[id][language] = value
      } else {
        this.value[id] = {
          [language]: value
        }
      }
    },
    /**
     * Set values
     * @param {dsContentValue[]} values - The collection dsContentValues
     */
    setValues (values) {
      this.value = { ...this.value, ...values }
    }
  }
}
