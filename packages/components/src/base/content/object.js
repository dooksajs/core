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
  dimensionMixin,
  eventTypeMouseMixin,
  eventTypeElementDragDropMixin,
  eventTypeTouchMixin
} from '@dooksa/components/mixins'

export const object = createComponent({
  id: 'object',
  tag: 'object',
  options: {
    data: { name: 'data' },
    type: { name: 'type' },
    name: { name: 'name' },
    usemap: { name: 'usemap' },
    form: { name: 'form' }
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
  dimensionMixin,
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
 *   DimensionMixin,
 *   EventTypeMouseMixin,
 *   EventTypeElementDragDropMixin,
 *   EventTypeTouchMixin
 * } from '@dooksa/components/mixins'
 * @import {ComponentExtend, ComponentEventOn} from '@dooksa/create-component'
 */

/**
 * @typedef {Object} ExtendObjectOptions
 * @property {string} [data]
 * @property {string} [type]
 * @property {string} [name]
 * @property {string} [usemap]
 * @property {string} [form]
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
 *   | DimensionMixin
 * } [options]
 */

/**
 * @typedef {Object} ExtendObjectEvent
 * @property {EventTypeMouseMixin | EventTypeElementDragDropMixin | EventTypeTouchMixin | ComponentEventOn} on
 * @property {string} actionId
 */

/**
 * @typedef {Object} ExtendObjectEventMixin
 * @property {ExtendObjectEvent[]} [events]
 */

/**
 * @typedef {ComponentExtend
 *   & ExtendObjectOptions
 *   | ExtendObjectEventMixin
 * } ExtendObject
 */

/**
 * @param {ExtendObject} options -
 */
export const createObject = function (options) {
  return extendComponent(object, options)
}
