import { createMixin } from '@dooksa/create-component'

/**
 * @typedef {Object} FormControlMixin
 * @property {boolean} [formControl]
 * @property {'lg'|'sm'} [formControlSize]
 * @property {boolean} [formControlPlaintext]
 */

export default createMixin({
  metadata: {
    id: 'form-control'
  },
  data: {
    options: {
      formControl: {
        name: 'className',
        value: 'form-control'
      },
      formControlSize: {
        name: 'className',
        /**
         * Form control size
         * @param {'lg'|'sm'} breakpoint
         * @returns {string}
         */
        computedValue (breakpoint) {
          return 'form-control-' + breakpoint
        }
      },
      formControlPlaintext: {
        name: 'className',
        value: 'form-control-plaintext'
      }
    }
  }
})
