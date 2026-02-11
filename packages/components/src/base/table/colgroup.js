import { createComponent, extendComponent } from '@dooksa/create-component'
import {
  backgroundMixin,
  borderMixin,
  displayMixin,
  sizingMixin,
  spacingMixin,
  tableColMixin
} from '@dooksa/components/mixins'

export const colgroup = createComponent({
  id: 'colgroup',
  tag: 'colgroup'
}, [
  backgroundMixin,
  borderMixin,
  displayMixin,
  sizingMixin,
  spacingMixin,
  tableColMixin
])

/**
 * @import {ComponentExtend} from '@dooksa/create-component'
 * @import {
 *   BackgroundMixin,
 *   BorderMixin,
 *   DisplayMixin,
 *   SizingMixin,
 *   SpacingMixin,
 *   TableColMixin
 * } from '@dooksa/components/mixins'
 */

/**
 * @typedef {Object} ExtendColgroupOptionMixin
 * @property {BackgroundMixin | BorderMixin | DisplayMixin | SizingMixin | SpacingMixin | TableColMixin} [options]
 */

/**
 * @typedef {ComponentExtend & ExtendColgroupOptionMixin} ExtendColgroup
 */

/**
 * @param {ExtendColgroup} options -
 */
export const createColgroup = function (options) {
  return extendComponent(colgroup, options)
}
