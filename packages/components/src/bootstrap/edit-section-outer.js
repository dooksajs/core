import { createComponent, modifyComponent } from '@dooksa/create-component'
import { divider, icon, text } from '../index.js'

const editText = modifyComponent(text, {
  options: { text: 'Edit' }
})

const btnIcon = modifyComponent(icon, {
  options: { icon: 'bi:pencil-square' }
})

const btn = modifyComponent(divider, {
  children: [btnIcon, editText],
  options: {
    btnVariant: 'primary',
    btnSize: 'small'
  }
})

const div = modifyComponent(divider, {
  children: [btn],
  options: {
    position: 'absolute',
    inset: [
      {
        name: 'top',
        value: 0
      },
      {
        name: 'start',
        value: 50
      }
    ],
    translate: 'middle',
    level: {
      name: 'layer',
      value: '3'
    }
  }
})

export default createComponent({
  id: 'edit-section-outer',
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
