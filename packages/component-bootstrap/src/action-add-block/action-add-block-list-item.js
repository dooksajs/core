import {
  createDiv,
  createText
} from '@dooksa/component-base'
import {
  createListGroupItemAction,
  createIcon,
  createCardTitle,
  createCardText
} from '@dooksa/component-extra'

const headerText = createText({
  events: [
    {
      on: 'component/created',
      actionId: 'action-add-block-list-item-title'
    }
  ]
})
const header = createCardTitle({ children: [headerText] })
const text = createText({
  events: [
    {
      on: 'component/created',
      actionId: 'action-add-block-list-item-description'
    }
  ]
})
const textContainer = createCardText({ children: [text] })
const textColumn = createDiv({
  children: [header, textContainer],
  options: { flexGrow: { size: '1' } }
})
const icon = createIcon({
  events: [
    {
      on: 'component/created',
      actionId: 'action-add-block-list-item-icon'
    }
  ]
})
const iconColumn = createDiv({
  children: [icon],
  options: {
    margin: [{
      direction: 'top',
      strength: 1
    }],
    padding: [{ strength: '2' }],
    shadow: 'sm',
    border: 'all',
    rounded: 'regular',
    borderColor: 'dark',
    displayFlex: 'always',
    alignItems: { position: 'center' },
    fontSize: '2',
    justifyContent: { position: 'center' }
  }
})

export default createListGroupItemAction({
  metadata: { id: 'action-add-block-list-item' },
  children: [iconColumn, textColumn],
  options: {
    displayFlex: 'always',
    gap: '3'
  },
  events: [
    {
      on: 'node/click',
      actionId: 'action-add-block-insert-action'
    },
    {
      on: 'node/click',
      actionId: 'action-add-block-collapse'
    }
  ]
})
