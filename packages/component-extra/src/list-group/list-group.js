import { createComponent, extendComponent } from '@dooksa/create-component'
import { ariaDisabledMixin } from '@dooksa/component-mixins'
import listGroupOptions from './list-group-options.js'

export const listGroup = createComponent({
  id: 'list-group',
  tag: 'ul',
  allowedChildren: [],
  properties: [
    {
      name: 'className',
      value: 'list-group'
    }
  ],
  options: listGroupOptions
}, [ariaDisabledMixin])

/**
 * @typedef {import('@dooksa/create-component').ComponentExtend} ComponentExtend
 * @typedef {import('../../mixins/aria/aria-disabled.js').AriaDisabledMixin} AriaDisabledMixin
 * @typedef {import('./list-group-options.js').ExtendListGroupOptions} ExtendListGroupOptions
 */

/**
 * @typedef {Object} ExtendListGroup
 * @property {AriaDisabledMixin|ExtendListGroupOptions} options
 */

/**
 * @param {ComponentExtend|ExtendListGroup} options
 */
export const extendListGroup = function (options) {
  return extendComponent(listGroup, options)
}



