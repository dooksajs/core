import { createComponent, extendComponent } from '@dooksa/create-component'
import { eventTypeMouseMixin, focusRingMixin, nameMixin, shadowMixin } from '@dooksa/component-mixins'

export const details = createComponent({
  id: 'details',
  tag: 'details',
  options: {
    open: {
      name: 'open',
      values: {
        true: true,
        false: false
      }
    }
  },
  eventTypes: {
    'node/toggle': true
  },
}, [nameMixin, shadowMixin, focusRingMixin, eventTypeMouseMixin])

/**
 * @import {ComponentExtend} from '@dooksa/create-component'
 * @import {NameMixin, ShadowMixin, FocusRingMixin} from '@dooksa/component-mixins'
 */

/**
 * @typedef {Object} ExtendDetailsOption
 * @property {boolean} [open] - This Boolean attribute indicates whether the details — that is, the contents of the <details> element — are currently visible.
 */

/**
 * @typedef {Object} ExtendDetailsOptionMixin
 * @property {ExtendDetailsOption|NameMixin|ShadowMixin|FocusRingMixin} options
 */

/**
 * @typedef {ComponentExtend|ExtendDetailsOptionMixin} ExtendDetails
 */

/**
 * @param {ExtendDetails} options
 */
export const extendDetails = function (options) {
  return extendComponent(details, options)
}
