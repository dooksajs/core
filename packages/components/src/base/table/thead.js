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

export const thead = createComponent({
  id: 'thead',
  tag: 'thead'
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
 * @typedef {Object} ExtendTheadOptionMixin
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
 * @typedef {ComponentExtend & ExtendTheadOptionMixin} ExtendThead
 */

/**
 * @param {ExtendThead} options
 */
export const createThead = function (options) {
  return extendComponent(thead, options)
}
