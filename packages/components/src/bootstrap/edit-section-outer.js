import { createComponent, extendComponent } from '@dooksa/create-component'
import { divider, icon, text } from '../index.js'
import eventTypeMouse from '../mixins/eventTypeMouse.js'

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
    btn: 'btn',
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
}, [eventTypeMouse])
