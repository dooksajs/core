import { extendDiv, extendText } from '@dooksa/component-base'
import {
  extendListGroupItemAction, extendIcon, extendCardTitle, extendCardText
} from '@dooksa/component-extra'

const headerText = extendText({
  events: [
    {
      on: 'component/create',
      actionId: 'action-editor-list-group-button-title'
    }
  ]
})

const header = extendCardTitle({
  children: [headerText]
})

const text = extendText({
  events: [
    {
      on: 'component/create',
      actionId: 'action-editor-list-group-button-description'
    }
  ]
})

const textContainer = extendCardText({
  children: [text]
})

const textColumn = extendDiv({
  children: [header, textContainer],
  options: {
    flexGrow: {
      size: '1'
    }
  }
})

const icon = extendIcon({
  events: [
    {
      on: 'component/create',
      actionId: 'action-editor-list-group-button-icon'
    }
  ]
})

const iconColumn = extendDiv({
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

export default extendListGroupItemAction({
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
