import { createComponent, extendComponent } from '@dooksa/create-component'
import {
  eventTypeMouseMixin,
  focusRingMixin,
  nameMixin,
  shadowMixin,
  eventTypeDetailsMixin,
  eventTypeElementDragDropMixin,
  eventTypeTouchMixin
} from '@dooksa/components/mixins'

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
  eventTypes: { 'node/toggle': true }
}, [
  nameMixin,
  shadowMixin,
  focusRingMixin,
  eventTypeMouseMixin,
  eventTypeDetailsMixin,
  eventTypeElementDragDropMixin,
  eventTypeTouchMixin
])

/**
 * @import {ComponentExtend, ComponentEventOn} from '@dooksa/create-component'
 * @import {NameMixin, ShadowMixin, FocusRingMixin, EventTypeMouseMixin, EventTypeDetailsMixin, EventTypeElementDragDropMixin, EventTypeTouchMixin} from '#mixins'
 */

/**
 * @typedef {Object} ExtendDetailsOption
 * @property {boolean} [open] - This Boolean attribute indicates whether the details — that is, the contents of the <details> element — are currently visible.
 */

/**
 * @typedef {Object} ExtendDetailsOptionMixin
 * @property {ExtendDetailsOption | NameMixin | ShadowMixin | FocusRingMixin} [options]
 */

/**
 * @typedef {Object} ExtendDetailsEvent
 * @property {EventTypeDetailsMixin | EventTypeMouseMixin | EventTypeElementDragDropMixin | EventTypeTouchMixin | ComponentEventOn} on
 * @property {string} actionId
 */

/**
 * @typedef {Object} ExtendDetailsEventMixin
 * @property {ExtendDetailsEvent[]} [events]
 */

/**
 * @typedef {ComponentExtend & ExtendDetailsOptionMixin | ExtendDetailsEventMixin} ExtendDetails
 */

/**
 * @param {ExtendDetails} options -
 */
export const createDetails = function (options) {
  return extendComponent(details, options)
}
