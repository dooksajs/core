import { createComponent, extendComponent } from '@dooksa/create-component'
import { borderMixin, displayMixin, floatMixin, fontMixin, idMixin, roundedMixin, sizingMixin, spacingMixin } from '@dooksa/components/mixins'

export const legend = createComponent({
  id: 'legend',
  tag: 'legend',
  type: 'element'
}, [idMixin, fontMixin, displayMixin, borderMixin, spacingMixin, roundedMixin, floatMixin, sizingMixin])

/**
 * @import {IdMixin, SpacingMixin, BorderMixin, RoundedMixin, DisplayMixin, FloatMixin, SizingMixin, FontMixin} from '@dooksa/components/mixins'
 * @import  {ComponentExtend} from '@dooksa/create-component'
 */

/**
 * @typedef {Object} ExtendLegendOption
 * @property {boolean} [disabled] - If this Boolean attribute is set, all form controls that are descendants of the <fieldset>, are disabled, meaning they are not editable and won't be submitted along with the <form>.
 * @property {string} [id]
 * @property {string} [name] - The name associated with the group.
 * @property {string} [form] - This attribute takes the value of the id attribute of a <form> element you want the <fieldset> to be part of, even if it is not inside the form.
 */

/**
 * @typedef {Object} ExtendLegendOptionMixin
 * @property {ExtendLegendOption|IdMixin|SpacingMixin|BorderMixin|RoundedMixin|DisplayMixin|FloatMixin|SizingMixin|FontMixin} options
 */

/**
 * @typedef {ComponentExtend|ExtendLegendOptionMixin} ExtendLegend
 */

/**
 * @param {ExtendLegend} options
 */
export const createLegend = function (options) {
  return extendComponent(legend, options)
}
