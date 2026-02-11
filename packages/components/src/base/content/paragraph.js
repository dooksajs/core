import { spacingMixin, textMixin, headingMixin } from '@dooksa/components/mixins'
import { createComponent, extendComponent } from '@dooksa/create-component'

export const paragraph = createComponent({
  id: 'paragraph',
  tag: 'p'
}, [spacingMixin, textMixin, headingMixin])

/**
 * @import {ComponentExtend} from '@dooksa/create-component'
 * @import {HeadingMixin, TextMixin, SpacingMixin} from '@dooksa/components/mixins'
 */

/**
 * @typedef {Object} ExtendParagraphOptionMixin
 * @property {SpacingMixin | TextMixin | HeadingMixin} [options]
 */

/**
 * @typedef {ComponentExtend & ExtendParagraphOptionMixin} ExtendParagraph
 */

/**
 * @param {ExtendParagraph} options -
 */
export const createParagraph = function (options) {
  return extendComponent(paragraph, options)
}
