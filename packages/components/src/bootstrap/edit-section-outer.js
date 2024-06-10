import { createComponent } from '@dooksa/create-component'
import { extendText } from '../text/text.js'
import { extendIcon } from '../icon/icon.js'
import { extendDiv } from '../base/div.js'
import { extendAnchor } from '../base/anchor.js'

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
    translate: 'middle',
    zIndex: '3'
  }
})

const editSectionOuterLink = createComponent({
  id: 'edit-section-outer-link',
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
  ],
  eventTypes: {
    click: true
  }
})

const editSectionOuter = extendDiv({
  metadata: {
    id: 'edit-section-outer'
  },
  children: [editSectionOuterLink],
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
  editSectionOuter,
  editSectionOuterLink
}

export default editSectionOuter
