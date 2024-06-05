import { createMixin } from '@dooksa/create-component'

export default createMixin({
  metadata: {
    id: 'flex'
  },
  data: {
    options: {
      flex: {
        name: 'className',
        computedValues: {
          /**
           * Flex
           * @param {'sm'|'md'|'lg'|'xl'|'xxl'} [breakpoint]
           * @returns {string}
           */
          block (breakpoint) {
            if (breakpoint) {
              return 'd-' + breakpoint + '-flex'
            }

            return 'd-flex'
          },
          /**
           * Inline flex
           * @param {'sm'|'md'|'lg'|'xl'|'xxl'} [breakpoint]
           * @returns {string}
           */
          inline (breakpoint) {
            if (breakpoint) {
              return 'd-inline-' + breakpoint + '-flex'
            }

            return 'd-inline-flex'
          }
        }
      },
      flexDirection: {
        name: 'className',
        computedValues: {
          /**
           * Flex direction row
           * @param {'sm'|'md'|'lg'|'xl'|'xxl'} [breakpoint]
           * @returns {string}
           */
          row (breakpoint) {
            if (breakpoint) {
              return 'flex-' + breakpoint + '-row'
            }

            return 'flex-row'
          },
          /**
           * Flex direction row reverse
           * @param {'sm'|'md'|'lg'|'xl'|'xxl'} [breakpoint]
           * @returns {string}
           */
          rowReverse (breakpoint) {
            if (breakpoint) {
              return 'flex-' + breakpoint + '-row-reverse'
            }

            return 'flex-row-reverse'
          },
          /**
           * Flex direction column
           * @param {'sm'|'md'|'lg'|'xl'|'xxl'} [breakpoint]
           * @returns {string}
           */
          column (breakpoint) {
            if (breakpoint) {
              return 'flex-' + breakpoint + '-column'
            }

            return 'flex-column'
          },
          /**
           * Flex direction column reverse
           * @param {'sm'|'md'|'lg'|'xl'|'xxl'} [breakpoint]
           * @returns {string}
           */
          columnReverse (breakpoint) {
            if (breakpoint) {
              return 'flex-' + breakpoint + '-column-reverse'
            }

            return 'flex-column-reverse'
          }
        }
      },
      flexAlign: {
        name: 'className',
        computedValues: {
          /**
           * Justify content
           * @param {'start'|'end'|'center'|'between'|'around'|'evenly'} position
           * @param {'sm'|'md'|'lg'|'xl'|'xxl'} [breakpoint]
           * @returns {string}
           */
          justifyContent (position, breakpoint) {
            if (breakpoint) {
              return 'justify-content-' + breakpoint + '-' + position
            }

            return 'justify-content-' + position
          },
          /**
           * Align items
           * @param {'start'|'end'|'center'|'between'|'around'|'stretch'} position
           * @param {'sm'|'md'|'lg'|'xl'|'xxl'} [breakpoint]
           * @returns {string}
           */
          alignContent (position, breakpoint) {
            if (breakpoint) {
              return 'align-content-' + breakpoint + '-' + position
            }

            return 'align-content-' + position
          },
          /**
           * Align items
           * @param {'start'|'end'|'center'|'baseline'|'stretch'} position
           * @param {'sm'|'md'|'lg'|'xl'|'xxl'} [breakpoint]
           * @returns {string}
           */
          alignItems (position, breakpoint) {
            if (breakpoint) {
              return 'align-items-' + breakpoint + '-' + position
            }

            return 'align-items-' + position
          },
          /**
           * Align self
           * @param {'start'|'end'|'center'|'baseline'|'stretch'} position
           * @param {'sm'|'md'|'lg'|'xl'|'xxl'} [breakpoint]
           * @returns {string}
           */
          alignSelf (position, breakpoint) {
            if (breakpoint) {
              return 'align-self-' + breakpoint + '-' + position
            }

            return 'align-self-' + position
          }
        }
      },
      flexFill: {
        name: 'className',
        computedValues: {
          /**
           * Fill
           * @param {'sm'|'md'|'lg'|'xl'|'xxl'} [breakpoint]
           * @returns {string}
           */
          fill (breakpoint) {
            if (breakpoint) {
              return 'flex-' + breakpoint + '-fill'
            }

            return 'flex-fill'
          },
          /**
           * Grow
           * @param {'0'|'1'} size
           * @param {'sm'|'md'|'lg'|'xl'|'xxl'} [breakpoint]
           * @returns {string}
           */
          grow (size, breakpoint) {
            if (breakpoint) {
              return 'flex-' + breakpoint + '-grow-' + size
            }

            return 'flex-grow-' + size
          },
          /**
           * Grow
           * @param {'0'|'1'} size
           * @param {'sm'|'md'|'lg'|'xl'|'xxl'} [breakpoint]
           * @returns {string}
           */
          shrink (size, breakpoint) {
            if (breakpoint) {
              return 'flex-' + breakpoint + '-shrink-' + size
            }

            return 'flex-shrink-' + size
          }
        }
      },
      flexWrap: {
        name: 'className',
        computedValues: {
          /**
           * Wrap
           * @param {'sm'|'md'|'lg'|'xl'|'xxl'} [breakpoint]
           * @returns {string}
           */
          wrap (breakpoint) {
            if (breakpoint) {
              return 'flex-' + breakpoint + '-wrap'
            }

            return 'flex-warp'
          },
          /**
           * Wrap reverse
           * @param {'sm'|'md'|'lg'|'xl'|'xxl'} [breakpoint]
           * @returns {string}
           */
          wrapReverse (breakpoint) {
            if (breakpoint) {
              return 'flex-' + breakpoint + '-wrap-reverse'
            }

            return 'flex-wrap-reverse'
          },
          /**
           * No wrap
           * @param {'sm'|'md'|'lg'|'xl'|'xxl'} [breakpoint]
           * @returns {string}
           */
          nowrap (breakpoint) {
            if (breakpoint) {
              return 'flex-' + breakpoint + '-nowrap'
            }

            return 'flex-nowrap'
          },
          /**
           * No wrap reverse
           * @param {'sm'|'md'|'lg'|'xl'|'xxl'} [breakpoint]
           * @returns {string}
           */
          nowrapReverse (breakpoint) {
            if (breakpoint) {
              return 'flex-' + breakpoint + '-nowrap-reverse'
            }

            return 'flex-nowrap-reverse'
          }
        }
      },
      order: {
        name: 'className',
        computedValues: {
          /**
           * Wrap
           * @param {number|'first'|'last'} position
           * @param {'sm'|'md'|'lg'|'xl'|'xxl'} [breakpoint]
           * @returns {string}
           */
          value (position, breakpoint) {
            if (breakpoint) {
              return 'order-' + breakpoint + '-' + position
            }

            return 'order-' + position
          }
        }
      }
    }
  }
})
