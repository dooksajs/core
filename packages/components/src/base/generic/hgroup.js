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

export const hgroup = createComponent({
  id: 'hgroup',
  tag: 'hgroup'
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
 * @typedef {Object} ExtendHgroupOptions
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
 * @typedef {Object} ExtendHgroupEvent
 * @property {EventTypeMouseMixin | EventTypeElementDragDropMixin | EventTypeTouchMixin | ComponentEventOn} on
 * @property {string} actionId
 */

/**
 * @typedef {Object} ExtendHgroupEventMixin
 * @property {ExtendHgroupEvent[]} [events]
 */

/**
 * @typedef {ComponentExtend
 *   & ExtendHgroupOptions
 *   | ExtendHgroupEventMixin
 * } ExtendHgroup
 */

/**
 * @param {ExtendHgroup} options -
 */
export const createHgroup = function (options) {
  return extendComponent(hgroup, options)
}
