import { createComponent, extendComponent } from '@dooksa/create-component'
import {
  spacingMixin, displayMixin, flexMixin
} from '@dooksa/component-mixins'

export const h6 = createComponent({
  id: 'h6',
  tag: 'h6'
}, [spacingMixin, flexMixin, displayMixin])

/**
 * @typedef {import('@dooksa/create-component').ComponentExtend} ComponentExtend
 * @typedef {import('../mixins/styles/flex.js').FlexMixin} FlexMixin
 * @typedef {import('../mixins/styles/spacing.js').SpacingMixin} SpacingMixin
 * @typedef {import('../mixins/styles/display.js').DisplayMixin} DisplayMixin
 */

/**
 * @typedef {Object} ComponentExtendH6
 * @property {FlexMixin|SpacingMixin|DisplayMixin} options
 */

/**
 * @param {ComponentExtend|ComponentExtendH6} options
 */
export const extendH6 = function (options) {
  return extendComponent(h6, options)
}
