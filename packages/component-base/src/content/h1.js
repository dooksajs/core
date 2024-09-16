import { createComponent, extendComponent } from '@dooksa/create-component'
import {
  spacingMixin, displayMixin, flexMixin
} from '@dooksa/component-mixins'

export const h1 = createComponent({
  id: 'h1',
  tag: 'h1'
}, [spacingMixin, flexMixin, displayMixin])

/**
 * @typedef {import('@dooksa/create-component').ComponentExtend} ComponentExtend
 * @typedef {import('../mixins/styles/flex.js').FlexMixin} FlexMixin
 * @typedef {import('../mixins/styles/spacing.js').SpacingMixin} SpacingMixin
 * @typedef {import('../mixins/styles/display.js').DisplayMixin} DisplayMixin
 */

/**
 * @typedef {Object} ComponentExtendH1
 * @property {FlexMixin|SpacingMixin|DisplayMixin} options
 */

/**
 * @param {ComponentExtend|ComponentExtendH1} options
 */
export const extendH1 = function (options) {
  return extendComponent(h1, options)
}
