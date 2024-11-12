import createPlugin from '@dooksa/create-plugin'

/**
 * @typedef {Object} RegexPattern
 * @property {string} pattern - The text of the regular expression. This can also be another RegExp object.
 * @property {string} flags - If specified, flags is a string that contains the flags to add. Alternatively, if a RegExp object is supplied for the pattern, the flags string will replace any of that object's flags (and lastIndex will be reset to 0).
 */

const regex = createPlugin('regex', {
  metadata: {
    title: 'Regular expression',
    description: 'Used for matching text with a pattern.',
    icon: 'mdi:regex'
  },
  actions: {
    pattern: {
      metadata: {
        title: 'Regular expression pattern',
        description: 'Regular expressions are patterns used to match character combinations in strings. ',
        icon: 'mdi:regex'
      },
      /**
       * @param {RegexPattern} param
       */
      method ({ pattern, flags }) {
        return new RegExp(pattern, flags)
      }
    }
  }
})

const regexReplace = regex.actions.pattern

export {
  regexReplace
}

export default regex
