import { createComponent, extendComponent } from '@dooksa/create-component'
import { ariaDisabledMixin } from '../mixins/index.js'
import listGroupOptions from './list-group-options.js'

const listGroupAction = createComponent({
  id: 'list-group-action',
  tag: 'div',
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
 * @typedef {import('../mixins/aria/aria-disabled.js').AriaDisabledMixin} AriaDisabledMixin
 * @typedef {import('./list-group-options.js').ExtendListGroupOptions} ExtendListGroupOptions
 */

/**
 * @typedef {Object} ExtendListGroup
 * @property {AriaDisabledMixin|ExtendListGroupOptions} options
 */

/**
 * @param {ComponentExtend|ExtendListGroup} options
 */
function extendListGroupAction (options) {
  return extendComponent(listGroupAction, options)
}

export {
  listGroupAction,
  extendListGroupAction
}

export default listGroupAction



