import {
  extendAccordion, extendIcon, extendCard, extendCardHeader
} from '@dooksa/component-extra'
import {
  extendDiv, extendText, extendH2
} from '@dooksa/component-base'

const cardText = extendText({
  events: [
    {
      on: 'component/create',
      actionId: 'action-card-text'
    }
  ]
})

const cardTitle = extendText({
  events: [
    {
      on: 'component/create',
      actionId: 'action-card-title'
    }
  ]
})

const cardHeading = extendH2({
  children: [cardTitle]
})

const cardHeaderIcon = extendIcon({
  options: {
    margin: {
      strength: '2',
      direction: 'end'
    }
  },
  events: [
    {
      on: 'component/create',
      actionId: 'action-card-icon'
    }
  ]
})

const cardHeaderDivIcon = extendDiv({
  children: [cardHeaderIcon, cardText],
  options: {
    fontSize: '5'
  }
})

const cardHeaderDiv2 = extendDiv({
  children: [cardHeaderDivIcon, cardHeading]
})

const icon = extendIcon({
  options: {
    icon: 'mdi:plus-circle-outline'
  },
  events: [
    {
      on: 'component/mount',
      actionId: 'action-card-plugin-icon'
    }
  ]
})

const cardHeaderDiv = extendDiv({
  children: [icon],
  options: {
    rounded: 'regular',
    shadow: 'sm',
    fontSize: '3',
    displayFlex: 'always',
    backgroundColor: 'white',
    alignItems: {
      position: 'center'
    },
    justifyContent: {
      position: 'center'
    },
    margin: {
      strength: '2',
      direction: 'end'
    },
    border: 'all'
  }
})

const cardHeader = extendCardHeader({
  children: [cardHeaderDiv, cardHeaderDiv2],
  options: {
    position: 'relative',
    displayFlex: 'always'
  }
})

const accordion = extendAccordion({
  children: [],
  options: {
    flush: true
  },
  events: [
    {
      on: 'component/mount',
      actionId: 'action-card-accordion'
    }
  ]
})

export default extendCard({
  metadata: {
    id: 'action-card'
  },
  children: [cardHeader, accordion],
  options: {
    overflow: 'hidden',
    shadow: 'sm'
  }
})
