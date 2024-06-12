import { createComponent } from '@dooksa/create-component'
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

const editSectionInnerLink = createComponent({
  id: 'edit-section-inner-link',
  tag: 'a',
  children: [div],
  properties: [
    {
      name: 'className',
      value: 'select-area'
    },
    {
      name: 'href',
      value: '#open-section-editor'
    }
  ],
  events: [
    {
      on: 'click',
      actionId: 'edit-section-modal'
    }
  ],
  eventTypes: {
    click: true
  }
})


const editSectionInner = extendDiv({
  metadata: {
    id: 'edit-section-inner'
  },
  children: [editSectionInnerLink],
  options: {
    position: 'relative'
  },
  events: [
    {
      on: 'created',
      actionId: 'edit-section-add-component'
    }
  ]
})

export {
  editSectionInner,
  editSectionInnerLink
}

