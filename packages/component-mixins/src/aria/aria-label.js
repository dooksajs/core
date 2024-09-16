import { createMixin } from '@dooksa/create-component'

/**
 * @typedef {Object} AriaLabelMixin
 * @property {string} [ariaLabel] - The aria-label attribute defines a string value that labels an interactive element. {@link https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-label}
 * @property {string} [ariaLabelled] - The aria-labelledby attribute identifies the element (or elements) that labels the element it is applied to. {@link https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-labelled}
 */

export default createMixin({
  metadata: {
    id: 'aria-label'
  },
  data: {
    options: {
      ariaLabel: {
        name: 'aria-label'
      },
      ariaLabelled: {
        name: 'aria-labelled'
      }
    }
  }
})

