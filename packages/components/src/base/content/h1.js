import { createComponent, extendComponent } from '@dooksa/create-component'
import {
  spacingMixin, displayMixin, flexMixin
} from '@dooksa/components/mixins'

export const h1 = createComponent({
  id: 'h1',
  tag: 'h1'
}, [spacingMixin, flexMixin, displayMixin])

/**
 * @import {ComponentExtend} from '@dooksa/create-component'
 * @import {FlexMixin, SpacingMixin, DisplayMixin} from '@dooksa/components/mixins'
 */

/**
 * @typedef {Object} ExtendH1OptionMixin
 * @property {FlexMixin | SpacingMixin | DisplayMixin} [options]
 */

/**
 * @typedef {ComponentExtend & ExtendH1OptionMixin} ExtendH1
 */

/**
 * @param {ExtendH1} options -
 */
export const createH1 = function (options) {
  return extendComponent(h1, options)
}
