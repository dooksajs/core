import { createComponent, extendComponent } from '@dooksa/create-component'
import {
  spacingMixin, displayMixin, flexMixin
} from '@dooksa/component-mixins'

export const h5 = createComponent({
  id: 'h5',
  tag: 'h5'
}, [spacingMixin, flexMixin, displayMixin])

/**
 * @typedef {import('@dooksa/create-component').ComponentExtend} ComponentExtend
 * @typedef {import('../mixins/styles/flex.js').FlexMixin} FlexMixin
 * @typedef {import('../mixins/styles/spacing.js').SpacingMixin} SpacingMixin
 * @typedef {import('../mixins/styles/display.js').DisplayMixin} DisplayMixin
 */

/**
 * @typedef {Object} ComponentExtendH5
 * @property {FlexMixin|SpacingMixin|DisplayMixin} options
 */

/**
 * @param {ComponentExtend|ComponentExtendH5} options
 */
export const extendH5 = function (options) {
  return extendComponent(h5, options)
}
