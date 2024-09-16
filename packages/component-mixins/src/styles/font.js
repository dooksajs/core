import { createMixin } from '@dooksa/create-component'

/**
 * @typedef {Object} FontMixin
 * @property {'1'|'2'|'3'|'4'|'5'|'6'} [fontSize]
 * @property {'bold'|'bolder'|'semibold'|'medium'|'normal'|'light'|'lighter'} [fontWeight]
 * @property {'italic'|'normal'} [fontItalic]
 * @property {boolean} [fontReset]
 * @property {boolean} [fontMonospace]
 */

export default createMixin({
  metadata: {
    id: 'font'
  },
  data: {
    options: {
      fontSize: {
        name: 'className',
        /**
         * Font size
         * @param {number} number
         * @returns {string}
         */
        computedValue (number) {
          return 'fs-' + number
        }
      },
      fontWeight: {
        name: 'className',
        values: {
          bold: 'fw-bold',
          bolder: 'fw-bolder',
          semibold: 'fw-semibold',
          medium: 'fw-medium',
          normal: 'fw-normal',
          light: 'fw-light',
          lighter: 'fw-lighter'
        }
      },
      fontItalic: {
        name: 'className',
        values: {
          italic: 'fst-italic',
          normal: 'fst-normal'
        }
      },
      fontReset: {
        name: 'className',
        value: 'text-reset'
      },
      fontMonospace: {
        name: 'className',
        value: 'font-monospace'
      }
    }
  }
})
