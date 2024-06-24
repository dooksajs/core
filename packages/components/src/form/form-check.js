import { createComponent, extendComponent } from '@dooksa/create-component'
import { extendLabel } from './label.js'
import { extendInputCheckbox } from './input-checkbox.js'

const inputCheckbox = extendInputCheckbox({
  events: [
    {
      on: 'component/mount',
      actionId: 'input-label-id'
    }
  ]
})

const label = extendLabel({
  events: [
    {
      on: 'component/mount',
      actionId: 'input-label-id'
    }
  ]
})

const formCheck = createComponent({
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
      on: 'component/mount',
      actionId: 'create-id-for-input-label'
    }
  ]
})

/**
 * @typedef {import('@dooksa/create-component').ComponentExtend} ComponentExtend
 */

/**
 * @typedef {Object} ComponentExtendFormCheckOptions
 * @property {boolean} [switch]
 * @property {boolean} [inline]
 * @property {boolean} [reverse]
 */

/**
 * @typedef {Object} ComponentExtendFormCheck
 * @property {ComponentExtendFormCheckOptions} options
 */

/**
 * @param {ComponentExtend|ComponentExtendFormCheck} options
 */
function extendFormCheck (options) {
  return extendComponent(formCheck, options)
}

export {
  formCheck,
  extendFormCheck
}

export default formCheck
