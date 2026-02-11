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
  mediaMixin,
  dimensionMixin,
  eventTypeMediaMixin,
  eventTypeElementDragDropMixin,
  eventTypeTouchMixin
} from '@dooksa/components/mixins'

export const video = createComponent({
  id: 'video',
  tag: 'video',
  options: {
    src: { name: 'src' }
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
  mediaMixin,
  dimensionMixin,
  eventTypeMediaMixin,
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
 *   MediaMixin,
 *   DimensionMixin,
 *   EventTypeMediaMixin,
 *   EventTypeElementDragDropMixin,
 *   EventTypeTouchMixin
 * } from '@dooksa/components/mixins'
 * @import {ComponentExtend, ComponentEventOn} from '@dooksa/create-component'
 */

/**
 * @typedef {Object} ExtendVideoOptions
 * @property {string} [src]
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
 *   | MediaMixin
 *   | DimensionMixin
 * } [options]
 */

/**
 * @typedef {Object} ExtendVideoEvent
 * @property {EventTypeMediaMixin | EventTypeElementDragDropMixin | EventTypeTouchMixin | ComponentEventOn} on
 * @property {string} actionId
 */

/**
 * @typedef {Object} ExtendVideoEventMixin
 * @property {ExtendVideoEvent[]} [events]
 */

/**
 * @typedef {ComponentExtend & ExtendVideoOptions | ExtendVideoEventMixin} ExtendVideo
 */

/**
 * @param {ExtendVideo} options -
 */
export const createVideo = function (options) {
  return extendComponent(video, options)
}
