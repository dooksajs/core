import { createComponent, extendComponent } from '@dooksa/create-component'
import { ariaDisabledMixin } from '@dooksa/components/mixins'
import listGroupOptions from './list-group-options.js'

export const listGroupAction = createComponent({
  id: 'list-group-action',
  tag: 'div',
  properties: [
    {
      name: 'className',
      value: 'list-group'
    }
  ],
  options: listGroupOptions
}, [ariaDisabledMixin])

/**
 * @import {ComponentExtend} from '@dooksa/create-component'
 * @import {AriaDisabledMixin} from '@dooksa/components/mixins'
 * @import {ExtendListGroupOptions} from './list-group-options.js'
 */

/**
 * @typedef {Object} ExtendListGroup
 * @property {AriaDisabledMixin|ExtendListGroupOptions} options
 */

/**
 * @param {ComponentExtend|ExtendListGroup} options
 */
export const createListGroupAction = function (options) {
  return extendComponent(listGroupAction, options)
}



