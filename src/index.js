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
    /**
     * Attach content to a view item
     * @param {Object} param
     * @param {dsContentId} param.dsContentId - dsContent id
     * @param {dsViewId} param.dsViewId - dsView id
     */
    attachView ({ dsContentId, dsViewId }) {
      const attached = this.attachedView[dsContentId] || []
      const dsContentValue = this.getValue({ dsContentId })

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
      this.attachedView[dsContentId] = attached
      // Attach content to view item
      this.$method('dsView/attachContent', { dsViewId, dsContentId })

      if (dsContentValue) {
        this.$method('dsView/updateValue', { dsViewId, dsContentValue })
      }

      // emit on mount event
      this.$method('dsEvent/emit', {
        dsEventId: dsViewId,
        dsEventOn: 'dsContent/attachView',
        payload: {
          dsContentId,
          dsViewId
        }
      })
    },
    /**
     * Detach content from view item
     * @param {Object} param
     * @param {dsContentId} param.dsContentId - dsContent id
     * @param {dsViewId} param.dsViewId - dsView id
     */
    detachView ({ dsContentId, dsViewId }) {
      const attached = this.attachedView[dsContentId] || []

      // Check if item exists
      if (attached.length) {
        const index = attached.indexOf(dsViewId)

        if (index > -1) {
          attached.splice(index, 1)
        }
      }

      // Update attached view
      this.attachedView[dsContentId] = attached
      // detach content from view item
      this.$method('dsView/detachContent', dsViewId)

      // emit on mount event
      this.$method('dsEvent/emit', {
        dsEventId: dsViewId,
        dsEventOn: 'dsContent/detachView',
        payload: {
          dsContentId,
          dsViewId
        }
      })
    },
    /**
     * Get content type
     * @param {dsContentId} id - Content id
     * @returns {dsContentType} An array that contains the content type and a boolean used to indicate if the content is permanent
     */
    getType (dsContentId) {
      return this.type[dsContentId]
    },
    /**
     * Get content value
     * @param {string} dsContentId - Content id
     * @param {language} language - Language in ISO 639-2
     * @returns {dsContentValue}
     */
    getValue ({ dsContentId, language }) {
      if (!language) {
        language = this.$method('dsMetadata/getLanguage')
      }

      if (this.value[dsContentId]) {
        if (this.value[dsContentId][language]) {
          return this.value[dsContentId][language]
        }

        return this.value[dsContentId][language]
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
    setValue ({ dsContentId, dsContentValue, language }) {
      language = language || this.$method('dsMetadata/getLanguage')

      if (this.value[dsContentId]) {
        this.value[dsContentId][language] = dsContentValue
      } else {
        this.value[dsContentId] = {
          [language]: dsContentValue
        }
      }

      this.$method('dsEvent/emit', {
        dsEventId: dsContentId,
        dsEventOn: 'dsContent/setValue',
        payload: {
          dsContentId,
          dsContentValue,
          language
        }
      })
    },
    /**
     * Set values
     * @param {dsContentValue[]} values - The collection dsContentValues
     */
    setValues (dsContentValues) {
      this.value = { ...this.value, ...dsContentValues }
    }
  }
}
