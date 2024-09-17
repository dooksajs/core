import { spacingMixin, textMixin, headingMixin } from '@dooksa/component-mixins'
import { createComponent, extendComponent } from '@dooksa/create-component'

export const paragraph = createComponent({
  id: 'paragraph',
  tag: 'p',
}, [spacingMixin, textMixin, headingMixin])

/** 
 * @import {ComponentExtend} from '@dooksa/create-component'
 * @import {HeadingMixin, TextMixin, SpacingMixin} from '@dooksa/component-mixins'
 */

/**
 * @typedef {Object} ComponentExtendParagraph
 * @property {SpacingMixin|TextMixin|HeadingMixin} options
 */

/**
 * @param {ComponentExtend|ComponentExtendParagraph} options
 */
export const extendParagraph = function (options) {
  return extendComponent(paragraph, options)
}
