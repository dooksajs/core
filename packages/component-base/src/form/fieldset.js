import { createComponent, extendComponent } from '@dooksa/create-component'
import { borderMixin, displayMixin, gapMixin, idMixin, roundedMixin, spacingMixin } from '@dooksa/component-mixins'

export const fieldset = createComponent({
  id: 'fieldset',
  tag: 'fieldset',
  type: 'element',
  options: {
    name: {
      name: 'name',
      replace: true
    },
    disabled: {
      name: 'disabled',
      values: {
        true: true,
        false: false
      }
    },
    form: {
      name: 'form',
      replace: true
    }
  }
}, [idMixin, displayMixin, borderMixin, spacingMixin, roundedMixin, gapMixin])

/**
 * @import {IdMixin, SpacingMixin, BorderMixin, RoundedMixin, DisplayMixin, GapMixin} from '@dooksa/component-mixins'
 * @import  {ComponentExtend} from '@dooksa/create-component'
 */

/**
 * @typedef {Object} ExtendFieldsetOption
 * @property {boolean} [disabled] - If this Boolean attribute is set, all form controls that are descendants of the <fieldset>, are disabled, meaning they are not editable and won't be submitted along with the <form>.
 * @property {string} [id]
 * @property {string} [name] - The name associated with the group.
 * @property {string} [form] - This attribute takes the value of the id attribute of a <form> element you want the <fieldset> to be part of, even if it is not inside the form.
 */

/**
 * @typedef {Object} ExtendFieldsetOptionMixin
 * @property {ExtendFieldsetOption|IdMixin|SpacingMixin|BorderMixin|RoundedMixin|DisplayMixin|GapMixin} options
 */

/**
 * @typedef {ComponentExtend|ExtendFieldsetOptionMixin} ExtendFieldset
 */

/**
 * @param {ExtendFieldset} options
 */
export const createFieldset = function (options) {
  return extendComponent(fieldset, options)
}
