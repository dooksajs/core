import { createMixin } from '@dooksa/create-component'

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
