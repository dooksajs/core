import { createComponent, extendComponent } from '@dooksa/create-component'
import {
  backgroundMixin,
  borderMixin,
  displayMixin,
  fontMixin,
  positionMixin,
  sizingMixin,
  spacingMixin,
  textColorMixin
} from '@dooksa/components/mixins'

export const tbody = createComponent({
  id: 'tbody',
  tag: 'tbody'
}, [
  backgroundMixin,
  borderMixin,
  displayMixin,
  fontMixin,
  positionMixin,
  sizingMixin,
  spacingMixin,
  textColorMixin
])

/**
 * @import {ComponentExtend} from '@dooksa/create-component'
 * @import {
 *   BackgroundMixin,
 *   BorderMixin,
 *   DisplayMixin,
 *   FontMixin,
 *   PositionMixin,
 *   SizingMixin,
 *   SpacingMixin,
 *   TextColorMixin
 * } from '@dooksa/components/mixins'
 */

/**
 * @typedef {Object} ExtendTbodyOptionMixin
 * @property {BackgroundMixin
 * | BorderMixin
 * | DisplayMixin
 * | FontMixin
 * | PositionMixin
 * | SizingMixin
 * | SpacingMixin
 * | TextColorMixin} [options]
 */

/**
 * @typedef {ComponentExtend & ExtendTbodyOptionMixin} ExtendTbody
 */

/**
 * @param {ExtendTbody} options
 */
export const createTbody = function (options) {
  return extendComponent(tbody, options)
}
