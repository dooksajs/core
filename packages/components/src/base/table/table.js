import { createComponent, extendComponent } from '@dooksa/create-component'
import {
  backgroundMixin,
  borderMixin,
  displayMixin,
  fontMixin,
  positionMixin,
  roundedMixin,
  shadowMixin,
  sizingMixin,
  spacingMixin,
  textColorMixin
} from '@dooksa/components/mixins'

export const table = createComponent({
  id: 'table',
  tag: 'table'
}, [
  backgroundMixin,
  borderMixin,
  displayMixin,
  fontMixin,
  positionMixin,
  roundedMixin,
  shadowMixin,
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
 *   RoundedMixin,
 *   ShadowMixin,
 *   SizingMixin,
 *   SpacingMixin,
 *   TextColorMixin
 * } from '@dooksa/components/mixins'
 */

/**
 * @typedef {Object} ExtendTableOptionMixin
 * @property {BackgroundMixin
 * | BorderMixin
 * | DisplayMixin
 * | FontMixin
 * | PositionMixin
 * | RoundedMixin
 * | ShadowMixin
 * | SizingMixin
 * | SpacingMixin
 * | TextColorMixin} [options]
 */

/**
 * @typedef {ComponentExtend & ExtendTableOptionMixin} ExtendTable
 */

/**
 * @param {ExtendTable} options
 */
export const createTable = function (options) {
  return extendComponent(table, options)
}
