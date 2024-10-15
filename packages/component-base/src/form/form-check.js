import { createComponent, extendComponent } from '@dooksa/create-component'
import { createLabel } from './label.js'
import { createInputCheckbox } from './input-checkbox.js'

const inputCheckbox = createInputCheckbox({
  events: [
    {
      on: 'component/created',
      actionId: 'input-label-id'
    }
  ]
})

const label = createLabel({
  events: [
    {
      on: 'component/created',
      actionId: 'input-label-id'
    }
  ]
})

export const formCheck = createComponent({
  id: 'form-check',
  tag: 'div',
  children: [inputCheckbox, label],
  properties: [
    {
      name: 'className',
      value: 'form-check'
    }
  ],
  options: {
    switch: {
      name: 'className',
      value: 'form-switch'
    },
    inline: {
      name: 'className',
      value: 'form-check-inline'
    },
    reverse: {
      name: 'className',
      value: 'form-check-reverse'
    }
  },
  events: [
    {
      on: 'component/created',
      actionId: 'create-id-for-input-label'
    }
  ]
})

/**
 * @import {ComponentExtend} from '@dooksa/create-component'
 */

/**
 * @typedef {Object} ExtendFormCheckOption
 * @property {boolean} [switch]
 * @property {boolean} [inline]
 * @property {boolean} [reverse]
 */

/**
 * @typedef {Object} ExtendFormCheckOptionMixin
 * @property {ExtendFormCheckOption} options
 */

/**
 * @typedef {ComponentExtend|ExtendFormCheckOptionMixin} ExtendFormCheck
 */

/**
 * @param {ExtendFormCheck} options
 */
export const createFormCheck = function (options) {
  return extendComponent(formCheck, options)
}
