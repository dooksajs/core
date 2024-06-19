import { createComponent } from '@dooksa/create-component'
import { extendText } from '../../text/text.js'
import { extendIcon } from '../../icon/icon.js'
import { extendDiv } from '../../base/div.js'

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

const selectEditInnerLink = createComponent({
  id: 'select-edit-inner-link',
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
      actionId: 'select-edit-modal'
    }
  ],
  eventTypes: {
    click: true
  }
})


const selectEditInner = extendDiv({
  metadata: {
    id: 'select-edit-inner'
  },
  children: [selectEditInnerLink],
  options: {
    position: 'relative'
  },
  events: [
    {
      on: 'create',
      actionId: 'select-edit-add-component'
    }
  ]
})

export {
  selectEditInner,
  selectEditInnerLink
}

