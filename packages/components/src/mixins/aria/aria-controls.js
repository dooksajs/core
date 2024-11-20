import { createMixin } from '@dooksa/create-component'

/**
 * @typedef {Object} AriaControlsMixin
 * @property {string} [ariaControls] - {@link https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-controls}
 */

export default createMixin({
  metadata: {
    id: 'aria-controls'
  },
  data: {
    options: {
      ariaControls: {
        name: 'aria-controls'
      }
    }
  }
})

