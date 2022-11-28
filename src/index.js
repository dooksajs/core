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
    attachedView: {}
  },
  /** @lends dsContent */
  methods: {
    attachView ({ id, dsViewId }) {
      const attached = this.attachedView[id] || []
      const value = this.getValue({ id })

      // Check if item exists
      if (attached.length) {
        const index = attached.indexOf(dsViewId)

        if (index === -1) {
          attached.push(dsViewId)
        }
      } else {
        attached.push(dsViewId)
      }

      // Update attached view
      this.attachedView[id] = attached
      // Attach content to view item
      this.$method('dsView/attachContent', { id: dsViewId, dsContentId: id })

      if (value) {
        this.$method('dsView/updateValue', { id: dsViewId, value })
      }

      // emit on mount event
      this.$method('dsEvent/emit', {
        id: dsViewId,
        on: 'dsContent/attachView',
        payload: {
          dsContentId: id,
          dsViewId
        }
      })
    },
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
     * @param {dsContentId} id - Content id
     * @param {dsContentValue} value - The value of content
     * @param {string} language - The content language in ISO 639-2 format
     */
    setValue ({ id, value, language }) {
      language = language || this.$method('dsMetadata/getLanguage')

      if (this.value[id]) {
        this.value[id][language] = value
      } else {
        this.value[id] = {
          [language]: value
        }
      }

      this.$method('dsEvent/emit', {
        id,
        on: 'dsContent/setValue',
        payload: {
          dsContentId: id,
          dsContentValue: value,
          language
        }
      })
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
