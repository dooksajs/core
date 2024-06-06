import { createComponent, extendComponent } from '@dooksa/create-component'
import { extendText } from '../text/text.js'
import { extendIcon } from '../icon/icon.js'
import { extendDiv } from '../base/div.js'
import eventTypeMouse from '../mixins/event-type-mouse.js'

const editText = extendText({
  options: { text: 'Edit' }
})

const btnIcon = extendIcon({
  options: {
    icon: 'bi:pencil-square',
    margin: {
      strength: '1',
      direction: 'end'
    }
  }
})

const btn = extendDiv({
  children: [btnIcon, editText],
  options: {
    btn: true,
    btnVariant: 'primary',
    btnSize: 'sm'
  }
})

const div = extendDiv({
  children: [btn],
  options: {
    position: 'absolute',
    top: '0',
    end: '0'
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
      actionId: 'component-add'
    }
  ]
}, [eventTypeMouse])
