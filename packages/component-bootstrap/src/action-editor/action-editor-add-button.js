import { createComponent } from '@dooksa/create-component'
import { createIcon } from '@dooksa/component-extra'
import {
  createDiv, createHr, createText, createLabel, createInputCheckboxButton
} from '@dooksa/component-base'

const editText = createText({
  options: {
    value: 'Add action block'
  }
})

const btnIcon = createIcon({
  options: {
    icon: 'mdi:plus-circle-outline',
    margin: [{
      strength: '1',
      direction: 'end'
    }]
  }
})

const label = createLabel({
  children: [btnIcon, editText],
  options: {
    formLabel: false,
    btn: true,
    btnVariant: 'outlineSecondary'
  },
  events: [
    {
      on: 'component/created',
      actionId: 'label-html-for'
    }
  ]
})

const inputCheckbox = createInputCheckboxButton({
  options: { ariaExpanded: 'false' },
  events: [
    {
      on: 'component/created',
      actionId: 'input-id'
    },
    {
      on: 'component/created',
      actionId: 'variable-root-id'
    },
    {
      on: 'node/checked',
      actionId: 'action-editor-block-selector-toggle'
    }
  ]
})

const middleDiv = createDiv({
  children: [inputCheckbox, label],
  options: {
    padding: [{
      strength: '2',
      direction: 'xAxis'
    }]
  }
})

const hr = createHr({
  options: {
    flexSize: [{
      type: 'grow',
      size: '1'
    }]
  }
})

export default createComponent({
  id: 'action-editor-add-button',
  tag: 'div',
  children: [hr, middleDiv, hr],
  properties: [
    {
      name: 'className',
      value: 'd-flex my-2 align-items-center'
    }
  ]
})
