import {
  createButton,
  createDiv,
  createH2,
  createText
} from '@dooksa/component-base'
import {
  createCard,
  createCardBody,
  createCardHeader,
  createCardText,
  createCardTitle,
  createIcon,
  createListGroupAction
} from '@dooksa/component-extra'

const cardText = createText({
  options: {
    text: 'Action block are the building blocks for an action'
  }
})

const cardTitle = createText({
  options: {
    text: 'Action block'
  }
})

const cardHeaderIcon = createIcon({
  options: {
    icon: 'bi:collection-play-fill',
    margin: {
      strength: '2',
      direction: 'end'
    }
  }
})

const cardHeading = createH2({
  children: [cardHeaderIcon, cardTitle]
})

const cardHeaderDivIcon = createDiv({
  children: [cardText],
  options: {
    fontSize: '5'
  }
})

const cardHeaderText = createDiv({
  children: [cardHeading, cardHeaderDivIcon]
})

const icon = createIcon({
  options: {
    icon: 'mdi:application-braces'
  }
})

const iconBox = createDiv({
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

const closeText = createText({
  options: {
    text: 'Cancel'
  }
})

const closeIcon = createIcon({
  options: {
    icon: 'mdi:close'
  }
})

const closeButton = createButton({
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

const closeContainer = createDiv({
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

const cardHeader = createCardHeader({
  children: [iconBox, cardHeaderText, closeContainer],
  options: {
    color: 'success',
    position: 'relative',
    displayFlex: 'always'
  }
})

const cardBodyTitleText = createText({
  options: {
    text: 'Select an action'
  }
})

const cardBodyTitle = createCardTitle({
  children: [cardBodyTitleText]
})

const cardBodyTextText = createText({
  options: {
    text: 'Choose an action below or filter the results by using the search'
  }
})

const cardBodyText = createCardText({
  children: [cardBodyTextText]
})


const cardBody = createCardBody({
  children: [cardBodyTitle, cardBodyText]
})

const listGroup = createListGroupAction({
  options: {
    flush: true
  },
  events: [
    {
      on: 'component/created',
      actionId: 'action-editor-list-group'
    }
  ]
})

export default createCard({
  metadata: {
    id: 'action-editor-block-selector'
  },
  children: [cardHeader, cardBody, listGroup],
  options: {
    overflow: 'hidden',
    shadow: 'md'
  }
})
