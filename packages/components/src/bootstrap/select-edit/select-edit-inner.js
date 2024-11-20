import { createComponent } from '@dooksa/create-component'
import { createText, createDiv } from '@dooksa/components/base'
import { createIcon } from '@dooksa/components/extra'

const editText = createText({
  options: {
    value: 'Edit'
  }
})

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
      on: 'node/click',
      actionId: 'select-edit-modal'
    }
  ],
  eventTypes: {
    'node/click': true
  }
})


const selectEditInner = createDiv({
  metadata: {
    id: 'select-edit-inner'
  },
  children: [selectEditInnerLink],
  options: {
    position: 'relative'
  },
  events: [
    {
      on: 'component/beforeCreate',
      actionId: 'select-edit-add-component'
    }
  ]
})

export {
  selectEditInner,
  selectEditInnerLink
}

