import { createMixin } from '@dooksa/create-component'

export default createMixin({
  metadata: {
    id: 'level'
  },
  data: {
    options: {
      level: {
        name: 'className',
        computedValues: {
          /**
           * Z-index
           * @param {number|'n1'} strength
           * @returns {string}
           */
          layer (strength) {
            return 'z-' + strength
          }
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
