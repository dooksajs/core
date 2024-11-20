import { createMixin } from '@dooksa/create-component'

/**
 * @import {Spacer} from '@dooksa/create-component'
 */

/**
 * @typedef {Object} HeadingMixin
 * @property {Spacer} [headingDisplay]
 * @property {boolean} [headingLead]
 * @property {Spacer} [heading]
 */

export default createMixin({
  metadata: {
    id: 'heading'
  },
  data: {
    options: {
      heading: {
        name: 'className',
        /**
         * Heading size
         * @param {Spacer} number
         * @returns {string}
         */
        computedValue (number) {
          return 'h' + number
        }
      },
      headingDisplay: {
        name: 'className',
        /**
         * Display size
         * @param {Spacer} number
         * @returns {string}
         */
        computedValue (number) {
          return 'display-' + number
        }
      },
      headingLead: {
        name: 'className',
        value: 'lead'
      }
    }
  }
})
