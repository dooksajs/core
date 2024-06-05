import { createMixin } from '@dooksa/create-component'

export default createMixin({
  metadata: {
    id: 'zIndex'
  },
  data: {
    options: {
      zIndex: {
        name: 'className',
        /**
         * Z-index
         * @param {number|'n1'} strength
         * @returns {string}
         */
        computedValue (strength) {
          return 'z-' + strength
        }
      }
    },
    styles: [
      {
        name: 'z-index',
        type: 'number'
      }
    ]
  }
})
