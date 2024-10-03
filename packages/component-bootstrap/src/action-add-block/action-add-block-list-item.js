import {
  extendDiv,
  extendText
} from '@dooksa/component-base'
import {
  extendListGroupItemAction,
  extendIcon,
  extendCardTitle,
  extendCardText
} from '@dooksa/component-extra'

const headerText = extendText({
  events: [
    {
      on: 'component/created',
      actionId: 'action-add-block-list-item-title'
    }
  ]
})
const header = extendCardTitle({ children: [headerText] })
const text = extendText({
  events: [
    {
      on: 'component/created',
      actionId: 'action-add-block-list-item-description'
    }
  ]
})
const textContainer = extendCardText({ children: [text] })
const textColumn = extendDiv({
  children: [header, textContainer],
  options: { flexGrow: { size: '1' } }
})
const icon = extendIcon({
  events: [
    {
      on: 'component/created',
      actionId: 'action-add-block-list-item-icon'
    }
  ]
})
const iconColumn = extendDiv({
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

export default extendListGroupItemAction({
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
