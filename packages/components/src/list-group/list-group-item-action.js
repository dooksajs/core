import { createComponent, extendComponent } from '@dooksa/create-component'
import { ariaCurrentMixin, ariaDisabledMixin, displayMixin, flexMixin, gapMixin } from '../mixins/index.js'
import listGroupItemOptions from './list-group-item-options.js'

const listGroupItemAction = createComponent({
  id: 'list-group-item-action',
  tag: 'button',
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
}, [ariaCurrentMixin, ariaDisabledMixin, displayMixin, flexMixin, gapMixin])

/**
 * @typedef {import('@dooksa/create-component').ComponentExtend} ComponentExtend
 * @typedef {import('../mixins/aria/aria-current.js').AriaCurrentMixin} AriaCurrentMixin
 * @typedef {import('../mixins/styles/flex.js').FlexMixin} FlexMixin
 * @typedef {import('../mixins/styles/display.js').DisplayMixin} DisplayMixin
 * @typedef {import('../mixins/styles/gap.js').GapMixin} GapMixin
 * @typedef {import('./list-group-options.js').ExtendListGroupOptions} ExtendListGroupOptions
 */

/**
 * @typedef {Object} ExtendListGroupItemActionOption
 * @property {boolean} [disabled]
 */

/**
 * @typedef {Object} ExtendListGroupItemAction
 * @property {ExtendListGroupItemActionOption|
 * ExtendListGroupOptions|
 * DisplayMixin|
 * FlexMixin|
 * AriaCurrentMixin|
 * GapMixin} options
 */

/**
 * @param {ComponentExtend|ExtendListGroupItemAction} options
 */
function extendListGroupItemAction (options) {
  return extendComponent(listGroupItemAction, options)
}

export {
  listGroupItemAction,
  extendListGroupItemAction
}
