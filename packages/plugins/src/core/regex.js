import { createPlugin } from '@dooksa/create-plugin'

/**
 * @import {RegexPattern} from '@dooksa/types'
 */

export const regex = createPlugin('regex', {
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

export const {
  regexPattern
} = regex

export default regex
