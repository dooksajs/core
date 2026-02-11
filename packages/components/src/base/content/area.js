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

export const area = createComponent({
  id: 'area',
  tag: 'area',
  options: {
    alt: { name: 'alt' },
    coords: { name: 'coords' },
    shape: {
      name: 'shape',
      values: {
        default: 'default',
        rect: 'rect',
        circle: 'circle',
        poly: 'poly'
      }
    },
    href: { name: 'href' },
    target: {
      name: 'target',
      values: {
        _self: '_self',
        _blank: '_blank',
        _parent: '_parent',
        _top: '_top'
      }
    },
    download: { name: 'download' },
    rel: { name: 'rel' }
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
 * @typedef {Object} ExtendAreaOptions
 * @property {string} [alt]
 * @property {string} [coords]
 * @property {'default'|'rect'|'circle'|'poly'} [shape]
 * @property {string} [href]
 * @property {'_self'|'_blank'|'_parent'|'_top'} [target]
 * @property {string} [download]
 * @property {string} [rel]
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
 * @typedef {Object} ExtendAreaEvent
 * @property {EventTypeMouseMixin | EventTypeElementDragDropMixin | EventTypeTouchMixin | ComponentEventOn} on
 * @property {string} actionId
 */

/**
 * @typedef {Object} ExtendAreaEventMixin
 * @property {ExtendAreaEvent[]} [events]
 */

/**
 * @typedef {ComponentExtend
 *   & ExtendAreaOptions
 *   | ExtendAreaEventMixin
 * } ExtendArea
 */

/**
 * @param {ExtendArea} options -
 */
export const createArea = function (options) {
  return extendComponent(area, options)
}
