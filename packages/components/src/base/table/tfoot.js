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

export const tfoot = createComponent({
  id: 'tfoot',
  tag: 'tfoot'
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
 * @typedef {Object} ExtendTfootOptionMixin
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
 * @typedef {ComponentExtend & ExtendTfootOptionMixin} ExtendTfoot
 */

/**
 * @param {ExtendTfoot} options -
 */
export const createTfoot = function (options) {
  return extendComponent(tfoot, options)
}
