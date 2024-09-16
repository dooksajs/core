import { createComponent } from '@dooksa/create-component'
import { extendIcon } from '@dooksa/component-extra'
import {
  extendDiv, extendHr, extendText, extendLabel, extendInputCheckboxButton
} from '@dooksa/component-base'

const editText = extendText({
  options: {
    text: 'Add action block'
  }
})

const btnIcon = extendIcon({
  options: {
    icon: 'mdi:plus-circle-outline',
    margin: {
      strength: '1',
      direction: 'end'
    }
  }
})

const label = extendLabel({
  children: [btnIcon, editText],
  options: {
    formLabel: false,
    btn: true,
    btnVariant: 'outlineSecondary'
  },
  events: [
    {
      on: 'component/mount',
      actionId: 'label-html-for'
    }
  ]
})

const inputCheckbox = extendInputCheckboxButton({
  options: {
    ariaExpanded: 'false'
  },
  events: [
    {
      on: 'component/mount',
      actionId: 'input-id'
    },
    {
      on: 'component/mount',
      actionId: 'action-value-content-id'
    },
    {
      on: 'component/mount',
      actionId: 'action-value-root-id'
    },
    {
      on: 'node/checked',
      actionId: 'action-editor-block-selector-toggle'
    }
  ]
})

const middleDiv = extendDiv({
  children: [inputCheckbox, label],
  options: {
    padding: {
      strength: '2',
      direction: 'xAxis'
    }
  }
})

const hr = extendHr({
  options: {
    flexGrow: {
      size: '1'
    }
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
  ],
  events: [
    {
      on: 'component/mount',
      actionId: 'set-action-input-id'
    }
  ]
})
