import { createComponent, extendComponent } from '@dooksa/create-component'
import {
  ariaDisabledMixin, displayMixin, flexMixin
} from '@dooksa/component-mixins'
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
 * @typedef {import('@dooksa/create-component').ComponentExtend} ComponentExtend
 * @typedef {import('../../mixins/aria/aria-disabled.js').AriaDisabledMixin} AriaDisabledMixin
 * @typedef {import('../../mixins/styles/flex.js').FlexMixin} FlexMixin
 * @typedef {import('../../mixins/styles/display.js').DisplayMixin} DisplayMixin
 * @typedef {import('./list-group-options.js').ExtendListGroupOptions} ExtendListGroupOptions
 */

/**
 * @typedef {Object} ExtendListGroupItem
 * @property {AriaDisabledMixin|ExtendListGroupOptions|DisplayMixin|FlexMixin} options
 */

/**
 * @param {ComponentExtend|ExtendListGroupItem} options
 */
export const createListGroupItem = function (options) {
  return extendComponent(listGroupItem, options)
}
