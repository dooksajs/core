import { createComponent, extendComponent } from '@dooksa/create-component'
import {
  ariaCurrentMixin, ariaDisabledMixin, displayMixin, flexMixin
} from '@dooksa/components/mixins'
import listGroupItemOptions from './list-group-item-options.js'

export const listGroupItemActionLink = createComponent({
  id: 'list-group-item-action-link',
  tag: 'a',
  allowedChildren: [],
  properties: [
    {
      name: 'className',
      value: 'list-group'
    }
  ],
  options: {
    ...listGroupItemOptions,
    disabled: {
      name: 'disabled',
      value: true
    }
  }
}, [ariaDisabledMixin, ariaCurrentMixin, ariaDisabledMixin, displayMixin, flexMixin])

/**
 * @import {ComponentExtend} from '@dooksa/create-component'
 * @import {AriaCurrentMixin, AriaDisabledMixin, FlexMixin, DisplayMixin} from '#mixins'
 * @import {ExtendListGroupOptions} from './list-group-options.js'
 */

/**
 * @typedef {Object} ExtendListGroupItemActionOption
 * @property {boolean} [disabled]
 */

/**
 * @typedef {Object} ExtendListGroupItemAction
 * @property {ExtendListGroupItemActionOption
 *   | AriaDisabledMixin
 *   | ExtendListGroupOptions
 *   | DisplayMixin
 *   | FlexMixin
 *   | AriaCurrentMixin
 * } [options]
 */

/**
 * @param {ComponentExtend & ExtendListGroupItemAction} options
 */
export const createListGroupItemActionLink = function (options) {
  return extendComponent(listGroupItemActionLink, options)
}
