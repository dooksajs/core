import { createComponent, extendComponent } from '@dooksa/create-component'
import {
  ariaCurrentMixin,
  ariaDisabledMixin,
  displayMixin,
  eventTypeMouseMixin,
  flexMixin,
  gapMixin
} from '@dooksa/components/mixins'
import listGroupItemOptions from './list-group-item-options.js'

export const listGroupItemAction = createComponent({
  id: 'list-group-item-action',
  tag: 'button',
  allowedChildren: [],
  properties: [
    {
      name: 'className',
      value: 'list-group-item list-group-item-action'
    }
  ],
  options: {
    ...listGroupItemOptions,
    disabled: {
      name: 'disabled',
      value: true
    }
  }
}, [ariaCurrentMixin, ariaDisabledMixin, displayMixin, flexMixin, gapMixin, eventTypeMouseMixin])

/**
 * @import {ComponentExtend} from '@dooksa/create-component'
 * @import {AriaCurrentMixin, FlexMixin, DisplayMixin, GapMixin} from '#mixins'
 * @import {ExtendListGroupOptions} from './list-group-options.js'
 */

/**
 * @typedef {Object} ExtendListGroupItemActionOption
 * @property {boolean} [disabled]
 */

/**
 * @typedef {Object} ExtendListGroupItemAction
 * @property {ExtendListGroupItemActionOption
 *   | ExtendListGroupOptions
 *   | DisplayMixin
 *   | FlexMixin
 *   | AriaCurrentMixin
 *   | GapMixin
 * } [options]
 */

/**
 * @param {ComponentExtend & ExtendListGroupItemAction} options -
 */
export const createListGroupItemAction = function (options) {
  return extendComponent(listGroupItemAction, options)
}
