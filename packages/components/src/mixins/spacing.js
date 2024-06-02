import { createMixin } from '@dooksa/create-component'

export default createMixin({
  metadata: {
    id: 'spacing'
  },
  data: {
    options: {
      spacing: {
        name: 'className',
        computedValues: {
          /**
           * Margin
           * @param {number|'auto'} strength
           * @param {'e'|'s'|'t'|'b'|'x'|'y'|''} [direction='']
           * @returns {string}
           */
          margin (strength, direction = '') {
            return 'm' + direction + '-' + strength
          },
          /**
           * Padding
           * @param {number} strength
           * @param {'e'|'s'|'t'|'b'|'x'|'y'|''} [direction='']
           * @returns {string}
           */
          padding (strength, direction = '') {
            return 'p' + direction + '-' + strength
          }
        }
      }
    },
    styles: [
      {
        name: 'margin',
        type: 'units'
      },
      {
        name: 'padding',
        type: 'units'
      }
    ]
  }
})
