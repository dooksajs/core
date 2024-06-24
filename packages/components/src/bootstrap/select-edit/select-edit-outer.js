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
    start: '50',
    transformTranslate: 'middle',
    zIndex: '3'
  }
})

const selectEditOuterLink = createComponent({
  id: 'select-edit-outer-link',
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
      on: 'node/click',
      actionId: 'select-edit-modal'
    }
  ],
  eventTypes: {
    click: true
  }
})

const selectEditOuter = extendDiv({
  metadata: {
    id: 'select-edit-outer'
  },
  children: [selectEditOuterLink],
  options: {
    position: 'relative'
  },
  events: [
    {
      on: 'component/create',
      actionId: 'select-edit-add-component'
    }
  ]
})

export {
  selectEditOuter,
  selectEditOuterLink
}
