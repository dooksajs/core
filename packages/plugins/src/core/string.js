import { createPlugin } from '@dooksa/create-plugin'

/**
 * @import {StringReplace} from '@dooksa/types'
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
       * @param {StringReplace} param - Replacement parameters
       */
      method ({ value, pattern, replacement }) {
        return value.replace(pattern, replacement)
      }
    }
  }
})

export const { stringReplace } = string
export default string
