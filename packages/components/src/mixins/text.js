import { createMixin } from '@dooksa/create-component'

export default createMixin({
  metadata: {
    id: 'text'
  },
  data: {
    options: {
      textAlign: {
        name: 'className',
        computedValues: {
          /**
           * Text start
           * @param {'sm'|'md'|'lg'|'xl'|'xxl'} [breakpoint]
           * @returns {string}
           */
          start (breakpoint) {
            if (breakpoint) {
              return 'text-' + breakpoint + '-start'
            }

            return 'text-start'
          },
          /**
           * Text center
           * @param {'sm'|'md'|'lg'|'xl'|'xxl'} [breakpoint]
           * @returns {string}
           */
          center (breakpoint) {
            if (breakpoint) {
              return 'text-' + breakpoint + '-center'
            }

            return 'text-center'
          },
          /**
           * Text end
           * @param {'sm'|'md'|'lg'|'xl'|'xxl'} [breakpoint]
           * @returns {string}
           */
          end (breakpoint) {
            if (breakpoint) {
              return 'text-' + breakpoint + '-end'
            }

            return 'text-end'
          }
        }
      },
      textWrap: {
        name: 'className',
        values: {
          wrap: 'text-wrap',
          nowrap: 'text-nowrap'
        }
      },
      textBreak: {
        name: 'className',
        value: 'text-break'
      },
      textTransform: {
        name: 'className',
        values: {
          lowercase: 'text-lowercase',
          uppercase: 'text-lowercase',
          capitalize: 'text-capitalize'
        }
      },
      textDecoration: {
        name: 'className',
        values: {
          underline: 'text-decoration-underline',
          lineThrough: 'text-decoration-line-through',
          none: 'text-decoration-none'
        }
      }
    }
  }
})
