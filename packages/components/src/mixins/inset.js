import { createMixin } from '@dooksa/create-component'

/**
 * @TODO Need to expose these values
 */
const positionValues = {
  '0': true,
  '50': true,
  '100': true
}

export default createMixin({
  metadata: {
    id: 'inset'
  },
  data: {
    options: {
      inset: {
        name: 'className',
        computedValues: {
          /**
           * Top
           * @param {number} strength
           * @returns {string}
           */
          top (strength) {
            if (!positionValues[strength]) {
              throw Error('Top position value out of range:' + strength)
            }

            return 'top-' + strength
          },
          /**
           * Top
           * @param {number} strength
           * @returns {string}
           */
          bottom (strength) {
            if (!positionValues[strength]) {
              throw Error('Top position value out of range:' + strength)
            }

            return 'bottom-' + strength
          },
          /**
           * Top
           * @param {number} strength
           * @returns {string}
           */
          end (strength) {
            if (!positionValues[strength]) {
              throw Error('Top position value out of range:' + strength)
            }

            return 'end-' + strength
          },
          /**
           * Top
           * @param {number} strength
           * @returns {string}
           */
          start (strength) {
            if (!positionValues[strength]) {
              throw Error('Top position value out of range:' + strength)
            }

            return 'start-' + strength
          }
        }
      }
    },
    styles: [
      {
        name: 'top',
        type: 'units'
      },
      {
        name: 'bottom',
        type: 'units'
      },
      {
        name: 'left',
        type: 'units'
      },
      {
        name: 'right',
        type: 'units'
      }
    ]
  }
})
