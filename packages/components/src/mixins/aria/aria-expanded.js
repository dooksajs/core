import { createMixin } from '@dooksa/create-component'

/**
 * @typedef {Object} AriaExpandedMixin
 * @property {'true'|'false'} [ariaExpanded] - {@link https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-expanded}
 */

export default createMixin({
  metadata: {
    id: 'aria-expanded'
  },
  data: {
    options: {
      ariaExpanded: {
        name: 'aria-expanded',
        values: {
          true: 'true',
          false: 'false'
        }
      }
    }
  }
})

