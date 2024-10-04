import {
  extendDiv,
  extendH2,
  extendText
} from '@dooksa/component-base'
import {
  extendCardHeader, extendIcon
} from '@dooksa/component-extra'

const cardText = extendText({
  events: [
    {
      on: 'component/created',
      actionId: 'action-card-title'
    }
  ]
})
const cardTitle = extendText({
  events: [
    {
      on: 'component/created',
      actionId: 'action-card-description'
    }
  ]
})

const cardHeading = extendH2({ children: [cardTitle] })
const cardHeaderIcon = extendIcon({
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
const cardHeaderDivIcon = extendDiv({
  children: [cardHeaderIcon, cardText],
  options: { fontSize: '5' }
})
const cardHeaderDiv2 = extendDiv({ children: [cardHeaderDivIcon, cardHeading] })
const icon = extendIcon({
  options: { icon: 'mdi:plus-circle-outline' },
  events: [
    {
      on: 'component/created',
      actionId: 'action-card-plugin-icon'
    }
  ]
})
const cardHeaderDiv = extendDiv({
  children: [icon],
  options: {
    rounded: 'regular',
    shadow: 'sm',
    fontSize: '1',
    displayFlex: 'always',
    backgroundColor: 'white',
    alignItems: { position: 'center' },
    justifyContent: { position: 'center' },
    margin: [{
      strength: '2',
      direction: 'end'
    }],
    padding: {
      strength: '3',
      direction: 'xAxis'
    },
    border: 'all'
  }
})

export default extendCardHeader({
  children: [cardHeaderDiv, cardHeaderDiv2],
  options: {
    position: 'relative',
    displayFlex: 'always'
  }
})
