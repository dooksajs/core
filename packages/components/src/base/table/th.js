import { createComponent, extendComponent } from '@dooksa/create-component'
import {
  backgroundMixin,
  borderMixin,
  displayMixin,
  fontMixin,
  gapMixin,
  positionMixin,
  roundedMixin,
  shadowMixin,
  sizingMixin,
  spacingMixin,
  tableCellMixin,
  tableHeaderMixin,
  textColorMixin
} from '@dooksa/components/mixins'

export const th = createComponent({
  id: 'th',
  tag: 'th'
}, [
  backgroundMixin,
  borderMixin,
  displayMixin,
  fontMixin,
  gapMixin,
  positionMixin,
  roundedMixin,
  shadowMixin,
  sizingMixin,
  spacingMixin,
  tableCellMixin,
  tableHeaderMixin,
  textColorMixin
])

/**
 * @import {ComponentExtend} from '@dooksa/create-component'
 * @import {
 *   BackgroundMixin,
 *   BorderMixin,
 *   DisplayMixin,
 *   FontMixin,
 *   GapMixin,
 *   PositionMixin,
 *   RoundedMixin,
 *   ShadowMixin,
 *   SizingMixin,
 *   SpacingMixin,
 *   TableCellMixin,
 *   TableHeaderMixin,
 *   TextColorMixin
 * } from '@dooksa/components/mixins'
 */

/**
 * @typedef {Object} ExtendThOptionMixin
 * @property {BackgroundMixin
 * | BorderMixin
 * | DisplayMixin
 * | FontMixin
 * | GapMixin
 * | PositionMixin
 * | RoundedMixin
 * | ShadowMixin
 * | SizingMixin
 * | SpacingMixin
 * | TableCellMixin
 * | TableHeaderMixin
 * | TextColorMixin} [options]
 */

/**
 * @typedef {ComponentExtend & ExtendThOptionMixin} ExtendTh
 */

/**
 * @param {ExtendTh} options
 */
export const createTh = function (options) {
  return extendComponent(th, options)
}
