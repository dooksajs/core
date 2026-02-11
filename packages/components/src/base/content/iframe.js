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

export const iframe = createComponent({
  id: 'iframe',
  tag: 'iframe',
  options: {
    src: { name: 'src' },
    srcdoc: { name: 'srcdoc' },
    name: { name: 'name' },
    sandbox: { name: 'sandbox' },
    allow: { name: 'allow' },
    allowFullscreen: {
      name: 'allowfullscreen',
      values: {
        true: true,
        false: false
      }
    },
    loading: {
      name: 'loading',
      values: {
        lazy: 'lazy',
        eager: 'eager'
      }
    },
    referrerPolicy: {
      name: 'referrerpolicy',
      values: {
        'no-referrer': 'no-referrer',
        'no-referrer-when-downgrade': 'no-referrer-when-downgrade',
        origin: 'origin',
        'origin-when-cross-origin': 'origin-when-cross-origin',
        'same-origin': 'same-origin',
        'strict-origin': 'strict-origin',
        'strict-origin-when-cross-origin': 'strict-origin-when-cross-origin',
        'unsafe-url': 'unsafe-url'
      }
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
 * @typedef {Object} ExtendIframeOptions
 * @property {string} [src]
 * @property {string} [srcdoc]
 * @property {string} [name]
 * @property {string} [sandbox]
 * @property {string} [allow]
 * @property {boolean} [allowFullscreen]
 * @property {'lazy'|'eager'} [loading]
 * @property {'no-referrer'|'no-referrer-when-downgrade'|'origin'|'origin-when-cross-origin'|'same-origin'|'strict-origin'|'strict-origin-when-cross-origin'|'unsafe-url'} [referrerPolicy]
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
 * @typedef {Object} ExtendIframeEvent
 * @property {EventTypeMouseMixin | EventTypeElementDragDropMixin | EventTypeTouchMixin | ComponentEventOn} on
 * @property {string} actionId
 */

/**
 * @typedef {Object} ExtendIframeEventMixin
 * @property {ExtendIframeEvent[]} [events]
 */

/**
 * @typedef {ComponentExtend
 *   & ExtendIframeOptions
 *   | ExtendIframeEventMixin
 * } ExtendIframe
 */

/**
 * @param {ExtendIframe} options -
 */
export const createIframe = function (options) {
  return extendComponent(iframe, options)
}
