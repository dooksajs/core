import { createMixin } from '@dooksa/create-component'

export default createMixin({
  metadata: {
    id: 'shadow'
  },
  data: {
    options: {
      rounded: {
        name: 'className',
        computedValues: {
          /**
           * Rounded
           * @param {number|'circle'|'pill'} strength
           * @returns {string}
           */
          all (strength) {
            if (strength) {
              return 'rounded-' + strength
            }

            return 'rounded'
          },
          /**
           * Rounded top
           * @param {number|'circle'|'pill'} strength
           * @returns {string}
           */
          top (strength) {
            if (strength) {
              return 'rounded-top' + strength
            }

            return 'rounded-top'
          },
          /**
           * Rounded end
           * @param {number|'circle'|'pill'} strength
           * @returns {string}
           */
          end (strength) {
            if (strength) {
              return 'rounded-end' + strength
            }

            return 'rounded-end'
          },
          /**
           * Rounded bottom
           * @param {number|'circle'|'pill'} strength
           * @returns {string}
           */
          bottom (strength) {
            if (strength) {
              return 'rounded-bottom' + strength
            }

            return 'rounded-bottom'
          },
          /**
           * Rounded start
           * @param {number|'circle'|'pill'} strength
           * @returns {string}
           */
          start (strength) {
            if (strength) {
              return 'rounded-start' + strength
            }

            return 'rounded-start'
          }
        }
      }
    }
  }
})
