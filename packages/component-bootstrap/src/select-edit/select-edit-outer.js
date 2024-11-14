import { createComponent } from '@dooksa/create-component'
import { createText, createDiv } from '@dooksa/component-base'
import { createIcon } from '@dooksa/component-extra'

const editText = createText({ options: { value: 'Edit' } })

const btnIcon = createIcon({
  options: {
    icon: 'bi:pencil-square',
    margin: [{
      strength: '1',
      direction: 'end'
    }]
  }
})

const btn = createDiv({
  children: [btnIcon, editText],
  options: {
    btn: true,
    btnVariant: 'primary',
    btnSize: 'sm'
  }
})

const div = createDiv({
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
  eventTypes: { click: true }
})

const selectEditOuter = createDiv({
  metadata: { id: 'select-edit-outer' },
  children: [selectEditOuterLink],
  options: { position: 'relative' },
  events: [
    {
      on: 'component/beforeCreate',
      actionId: 'select-edit-add-component'
    }
  ]
})

export {
  selectEditOuter,
  selectEditOuterLink
}
