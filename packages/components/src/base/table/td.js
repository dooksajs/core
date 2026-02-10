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
  textColorMixin
} from '@dooksa/components/mixins'

export const td = createComponent({
  id: 'td',
  tag: 'td'
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
 *   TextColorMixin
 * } from '@dooksa/components/mixins'
 */

/**
 * @typedef {Object} ExtendTdOptionMixin
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
 * | TextColorMixin} [options]
 */

/**
 * @typedef {ComponentExtend & ExtendTdOptionMixin} ExtendTd
 */

/**
 * @param {ExtendTd} options
 */
export const createTd = function (options) {
  return extendComponent(td, options)
}
