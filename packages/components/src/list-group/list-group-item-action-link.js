import { createComponent, extendComponent } from '@dooksa/create-component'
import { ariaCurrentMixin, ariaDisabledMixin, displayMixin, flexMixin } from '../mixins/index.js'
import listGroupItemOptions from './list-group-item-options.js'

const listGroupItemActionLink = createComponent({
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
 * @typedef {import('@dooksa/create-component').ComponentExtend} ComponentExtend
 * @typedef {import('../mixins/aria/aria-current.js').AriaCurrentMixin} AriaCurrentMixin
 * @typedef {import('../mixins/aria/aria-disabled.js').AriaDisabledMixin} AriaDisabledMixin
 * @typedef {import('../mixins/styles/flex.js').FlexMixin} FlexMixin
 * @typedef {import('../mixins/styles/display.js').DisplayMixin} DisplayMixin
 * @typedef {import('./list-group-options.js').ExtendListGroupOptions} ExtendListGroupOptions
 */

/**
 * @typedef {Object} ExtendListGroupItemActionOption
 * @property {boolean} [disabled]
 */

/**
 * @typedef {Object} ExtendListGroupItemAction
 * @property {ExtendListGroupItemActionOption|
 * AriaDisabledMixin|
 * ExtendListGroupOptions|
 * DisplayMixin|
 * FlexMixin|
 * AriaCurrentMixin} options
 */

/**
 * @param {ComponentExtend|ExtendListGroupItemAction} options
 */
function extendListGroupItemActionLink (options) {
  return extendComponent(listGroupItemActionLink, options)
}

export {
  listGroupItemActionLink,
  extendListGroupItemActionLink
}
