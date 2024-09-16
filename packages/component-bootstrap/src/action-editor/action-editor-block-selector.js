import {
  extendText, extendH2,
  extendDiv,
  extendButton
} from '@dooksa/component-base'
import {
  extendListGroupAction, extendCard, extendCardBody, extendCardHeader, extendCardText, extendCardTitle, extendIcon
} from '@dooksa/component-extra'

const cardText = extendText({
  options: {
    text: 'Action block are the building blocks for an action'
  }
})

const cardTitle = extendText({
  options: {
    text: 'Action block'
  }
})


const cardHeaderIcon = extendIcon({
  options: {
    icon: 'bi:collection-play-fill',
    margin: {
      strength: '2',
      direction: 'end'
    }
  }
})

const cardHeading = extendH2({
  children: [cardHeaderIcon, cardTitle]
})

const cardHeaderDivIcon = extendDiv({
  children: [cardText],
  options: {
    fontSize: '5'
  }
})

const cardHeaderText = extendDiv({
  children: [cardHeading, cardHeaderDivIcon]
})

const icon = extendIcon({
  options: {
    icon: 'mdi:application-braces'
  }
})

const iconBox = extendDiv({
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

const closeText = extendText({
  options: {
    text: 'Cancel'
  }
})

const closeIcon = extendIcon({
  options: {
    icon: 'mdi:close'
  }
})

const closeButton = extendButton({
  children: [closeIcon, closeText],
  options: {
    btnVariant: 'light'
  },
  events: [
    {
      on: 'node/click',
      actionId: 'action-editor-add-button-off'
    }
  ]
})

const closeContainer = extendDiv({
  children: [closeButton],
  options: {
    displayFlex: 'always',
    alignItems: {
      position: 'center'
    },
    margin: {
      direction: 'start',
      strength: 'auto'
    }
  }
})

const cardHeader = extendCardHeader({
  children: [iconBox, cardHeaderText, closeContainer],
  options: {
    color: 'success',
    position: 'relative',
    displayFlex: 'always'
  }
})

const cardBodyTitleText = extendText({
  options: {
    text: 'Select an action'
  }
})

const cardBodyTitle = extendCardTitle({
  children: [cardBodyTitleText]
})

const cardBodyTextText = extendText({
  options: {
    text: 'Choose an action below or filter the results by using the search'
  }
})

const cardBodyText = extendCardText({
  children: [cardBodyTextText]
})


const cardBody = extendCardBody({
  children: [cardBodyTitle, cardBodyText]
})

const listGroup = extendListGroupAction({
  options: {
    flush: true
  },
  events: [
    {
      on: 'component/mount',
      actionId: 'action-editor-list-group'
    }
  ]
})

export default extendCard({
  metadata: {
    id: 'action-editor-block-selector'
  },
  children: [cardHeader, cardBody, listGroup],
  options: {
    overflow: 'hidden',
    shadow: 'md'
  }
})
