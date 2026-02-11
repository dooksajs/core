import { createComponent, extendComponent } from '@dooksa/create-component'
import {
  backgroundMixin,
  borderMixin,
  buttonMixin,
  containerMixin,
  displayMixin,
  flexMixin,
  fontMixin,
  gapMixin,
  insetMixin,
  positionMixin,
  roundedMixin,
  shadowMixin,
  spacingMixin,
  translateMixin,
  zIndexMixin,
  eventTypeMouseMixin,
  eventTypeElementDragDropMixin,
  eventTypeTouchMixin
} from '@dooksa/components/mixins'

export const q = createComponent({
  id: 'q',
  tag: 'q',
  options: {
    cite: {
      name: 'cite'
    }
  }
}, [
  backgroundMixin,
  borderMixin,
  buttonMixin,
  containerMixin,
  displayMixin,
  flexMixin,
  fontMixin,
  gapMixin,
  insetMixin,
  positionMixin,
  roundedMixin,
  shadowMixin,
  spacingMixin,
  translateMixin,
  zIndexMixin,
  eventTypeMouseMixin,
  eventTypeElementDragDropMixin,
  eventTypeTouchMixin
])

/**
 * @import {
 *   FlexMixin,
 *   BackgroundMixin,
 *   PositionMixin,
 *   SpacingMixin,
 *   ZIndexMixin,
 *   InsetMixin,
 *   TransformTranslateMixin,
 *   ButtonMixin,
 *   DisplayMixin,
 *   ShadowMixin,
 *   RoundedMixin,
 *   FontMixin,
 *   BorderMixin,
 *   GapMixin,
 *   ContainerMixin,
 *   EventTypeMouseMixin,
 *   EventTypeElementDragDropMixin,
 *   EventTypeTouchMixin
 * } from '@dooksa/components/mixins'
 * @import {ComponentExtend, ComponentEventOn} from '@dooksa/create-component'
 */

/**
 * @typedef {Object} ExtendQOptions
 * @property {string} [cite]
 * @property {FontMixin
 *   | RoundedMixin
 *   | ShadowMixin
 *   | BackgroundMixin
 *   | FlexMixin
 *   | PositionMixin
 *   | SpacingMixin
 *   | ZIndexMixin
 *   | InsetMixin
 *   | TransformTranslateMixin
 *   | ButtonMixin
 *   | DisplayMixin
 *   | BorderMixin
 *   | GapMixin
 *   | ContainerMixin
 * } [options]
 */

/**
 * @typedef {Object} ExtendQEvent
 * @property {EventTypeMouseMixin | EventTypeElementDragDropMixin | EventTypeTouchMixin | ComponentEventOn} on
 * @property {string} actionId
 */

/**
 * @typedef {Object} ExtendQEventMixin
 * @property {ExtendQEvent[]} [events]
 */

/**
 * @typedef {ComponentExtend
 *   & ExtendQOptions
 *   | ExtendQEventMixin
 * } ExtendQ
 */

/**
 * @param {ExtendQ} options -
 */
export const createQ = function (options) {
  return extendComponent(q, options)
}
