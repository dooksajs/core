import definePlugin from '../definePlugin.js'

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
export default definePlugin({
  name: 'dsContent',
  version: 1,
  data: {
    items: {
      schema: {
        type: 'collection',
        suffixId () {
          return this.$getDataValue('dsMetadata/language').item
        },
        items: {
          type: 'object'
        }
      }
    }
  }
})
