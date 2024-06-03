import { createComponent, extendComponent } from '@dooksa/create-component'
import text from '../text/text.js'
import icon from '../icon/icon.js'
import divider from '../base/divider.js'

const editText = extendComponent(text, {
  options: { text: 'Edit' }
})

const btnIcon = extendComponent(icon, {
  options: {
    icon: 'bi:pencil-square',
    spacing: {
      name: 'margin',
      values: [1, 'e']
    }
  }
})

const btn = extendComponent(divider, {
  children: [btnIcon, editText],
  options: {
    btnVariant: 'primary',
    btnSize: 'small'
  }
})

const div = extendComponent(divider, {
  children: [btn],
  options: {
    position: 'absolute',
    inset: [
      {
        name: 'top',
        value: 0
      },
      {
        name: 'end',
        value: 0
      }
    ]
  }
})

export default createComponent({
  id: 'edit-section-inner',
  tag: 'a',
  children: [div],
  properties: [
    {
      name: 'className',
      value: 'select-area select-area-lg'
    },
    {
      name: 'href',
      value: '#open-section-editor'
    }
  ],
  events: [
    {
      on: 'click',
      actionId: 'open-section-editor'
    }
  ]
})
