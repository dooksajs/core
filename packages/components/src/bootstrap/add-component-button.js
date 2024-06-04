import { createComponent, extendComponent } from '@dooksa/create-component'
import text from '../text/text.js'
import icon from '../icon/icon.js'
import divider from '../base/divider.js'
import eventTypeMouse from '../mixins/eventTypeMouse.js'
import button from '../button/button.js'
import horizontalRule from '../base/horizontal-rule.js'

const editText = extendComponent(text, {
  options: { text: 'Add widget' }
})

const btnIcon = extendComponent(icon, {
  options: {
    icon: 'mdi:plus-circle-outline',
    spacing: {
      name: 'margin',
      values: [1, 'e']
    }
  }
})

const btn = extendComponent(button, {
  children: [btnIcon, editText],
  options: {
    btnVariant: 'outlineSecondary'
  }
})

const middleDiv = extendComponent(divider, {
  children: [btn],
  options: {
    spacing: {
      name: 'padding',
      values: ['2', 'x']
    }
  }
})

const hr = extendComponent(horizontalRule, {
  options: {
    flexFill: {
      name: 'grow',
      value: '1'
    }
  }
})

export default createComponent({
  id: 'add-component-button',
  tag: 'div',
  children: [hr, middleDiv, hr],
  properties: [
    {
      name: 'className',
      value: 'd-flex my-2 align-items-center'
    },
    {
      name: 'href',
      value: '#add-component'
    }
  ]
})
