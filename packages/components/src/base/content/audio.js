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
  eventTypeMediaMixin,
  eventTypeElementDragDropMixin,
  eventTypeTouchMixin
} from '@dooksa/components/mixins'

export const audio = createComponent({
  id: 'audio',
  tag: 'audio',
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
 *   EventTypeMediaMixin,
 *   EventTypeElementDragDropMixin,
 *   EventTypeTouchMixin
 * } from '@dooksa/components/mixins'
 * @import {ComponentExtend, ComponentEventOn} from '@dooksa/create-component'
 */

/**
 * @typedef {Object} ExtendAudioOptions
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
 * } [options]
 */

/**
 * @typedef {Object} ExtendAudioEvent
 * @property {EventTypeMediaMixin | EventTypeElementDragDropMixin | EventTypeTouchMixin | ComponentEventOn} on
 * @property {string} actionId
 */

/**
 * @typedef {Object} ExtendAudioEventMixin
 * @property {ExtendAudioEvent[]} [events]
 */

/**
 * @typedef {ComponentExtend & ExtendAudioOptions | ExtendAudioEventMixin} ExtendAudio
 */

/**
 * @param {ExtendAudio} options -
 */
export const createAudio = function (options) {
  return extendComponent(audio, options)
}
