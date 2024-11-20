import createPlugin from '@dooksa/create-plugin'

/**
 * @typedef {Object} StringReplace
 * @property {string} value - Target string
 * @property {string} pattern - Can be a string or regular expression
 * @property {string} replacement - String that will replace what matches the pattern
 */

export const string = createPlugin('string', {
  metadata: {
    title: 'String',
    description: 'Manipulate a sequence of characters.',
    icon: 'mdi:code-string'
  },
  actions: {
    replace: {
      metadata: {
        title: 'Replace string',
        description: 'The replace method returns a new string with one, some, or all matches of a pattern replaced by a replacement.',
        icon: 'mdi:find-replace'
      },
      /**
       * @param {StringReplace} param
       */
      method ({ value, pattern, replacement }) {
        return value.replace(pattern, replacement)
      }
    }
  }
})

export const { stringReplace } = string
export default string
