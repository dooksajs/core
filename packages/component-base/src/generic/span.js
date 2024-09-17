import { createComponent, extendComponent } from '@dooksa/create-component'
import {
  spacingMixin, displayMixin, flexMixin
} from '@dooksa/component-mixins'

const span = createComponent({
  id: 'span',
  tag: 'span'
}, [spacingMixin, flexMixin, displayMixin])

/**
 * @import {FlexMixin, SpacingMixin, DisplayMixin} from '@dooksa/component-mixins'
 * @import {ComponentExtend} from '@dooksa/create-component'
 */

/**
 * @typedef {Object} ComponentExtendSpan
 * @property {FlexMixin|SpacingMixin|DisplayMixin} options
 */

/**
 * @param {ComponentExtend|ComponentExtendSpan} options
 */
function extendSpan (options) {
  return extendComponent(span, options)
}

export {
  span,
  extendSpan
}
