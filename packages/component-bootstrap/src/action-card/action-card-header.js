import {
  createDiv,
  createH2,
  createText
} from '@dooksa/component-base'
import {
  createCardHeader, createIcon
} from '@dooksa/component-extra'

const cardText = createText({
  events: [
    {
      on: 'component/created',
      actionId: 'action-card-title'
    }
  ]
})
const cardTitle = createText({
  events: [
    {
      on: 'component/created',
      actionId: 'action-card-description'
    }
  ]
})

const cardHeading = createH2({ children: [cardTitle] })
const cardHeaderIcon = createIcon({
  options: {
    margin: [{
      strength: '2',
      direction: 'end'
    }]
  },
  events: [
    {
      on: 'component/created',
      actionId: 'action-card-icon'
    }
  ]
})
const cardHeaderDivIcon = createDiv({
  children: [cardHeaderIcon, cardText],
  options: { fontSize: '5' }
})
const cardHeaderDiv2 = createDiv({ children: [cardHeaderDivIcon, cardHeading] })
const icon = createIcon({
  options: { icon: 'mdi:plus-circle-outline' },
  events: [
    {
      on: 'component/created',
      actionId: 'action-card-plugin-icon'
    }
  ]
})
const cardHeaderDiv = createDiv({
  children: [icon],
  options: {
    rounded: 'regular',
    shadow: 'sm',
    fontSize: '1',
    display: [{ type: 'flex' }],
    backgroundColor: 'white',
    alignItems: [{ position: 'center' }],
    justifyContent: [{ position: 'center' }],
    margin: [{
      strength: '3',
      direction: 'end'
    }],
    padding: [{
      strength: '3',
      direction: 'xAxis'
    }],
    border: 'all'
  }
})

export default createCardHeader({
  children: [cardHeaderDiv, cardHeaderDiv2],
  options: {
    position: 'relative',
    display: [{ type: 'flex' }]
  }
})
