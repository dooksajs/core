import { createDiv, createText } from '@dooksa/component-base'
import {
  createListGroupItemAction, createIcon, createCardTitle, createCardText
} from '@dooksa/component-extra'

const headerText = createText({
  events: [
    {
      on: 'component/beforeCreate',
      actionId: 'action-editor-list-group-button-title'
    }
  ]
})

const header = createCardTitle({
  children: [headerText]
})

const text = createText({
  events: [
    {
      on: 'component/beforeCreate',
      actionId: 'action-editor-list-group-button-description'
    }
  ]
})

const textContainer = createCardText({
  children: [text]
})

const textColumn = createDiv({
  children: [header, textContainer],
  options: {
    flexGrow: {
      size: '1'
    }
  }
})

const icon = createIcon({
  events: [
    {
      on: 'component/beforeCreate',
      actionId: 'action-editor-list-group-button-icon'
    }
  ]
})

const iconColumn = createDiv({
  children: [icon],
  options: {
    margin: {
      direction: 'top',
      strength: 1
    },
    padding: {
      strength: '2'
    },
    shadow: 'sm',
    border: 'all',
    rounded: 'regular',
    borderColor: 'dark',
    displayFlex: 'always',
    alignItems: {
      position: 'center'
    },
    fontSize: '2',
    justifyContent: {
      position: 'center'
    }
  }
})

export default createListGroupItemAction({
  metadata: {
    id: 'action-editor-block-selector-list-action'
  },
  children: [iconColumn, textColumn],
  options: {
    displayFlex: 'always',
    gap: '3'
  },
  events: [
    {
      on: 'node/click',
      actionId: 'action-editor-add-action'
    },
    {
      on: 'node/click',
      actionId: 'action-editor-add-button-off'
    }
  ]
})
