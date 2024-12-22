import { createComponent, extendComponent } from '@dooksa/create-component'
import {
  ariaDisabledMixin, displayMixin, flexMixin
} from '@dooksa/components/mixins'
import listGroupItemOptions from './list-group-item-options.js'

export const listGroupItem = createComponent({
  id: 'list-group-item',
  tag: 'li',
  allowedChildren: [],
  properties: [
    {
      name: 'className',
      value: 'list-group-item'
    }
  ],
  options: listGroupItemOptions
}, [ariaDisabledMixin, displayMixin, flexMixin])

/**
 * @import {ComponentExtend} from '@dooksa/create-component'
 * @import {AriaDisabledMixin, FlexMixin, DisplayMixin} from '#mixins'
 * @import {ExtendListGroupOptions} from './list-group-options.js'
 */

/**
 * @typedef {Object} ExtendListGroupItem
 * @property {AriaDisabledMixin | ExtendListGroupOptions | DisplayMixin|FlexMixin} [options]
 */

/**
 * @param {ComponentExtend & ExtendListGroupItem} options
 */
export const createListGroupItem = function (options) {
  return extendComponent(listGroupItem, options)
}
