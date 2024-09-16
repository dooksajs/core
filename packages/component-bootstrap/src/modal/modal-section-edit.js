import {
  extendDiv,
  extendModalHeader,
  extendModalContent,
  extendModalDialog,
  extendModalBody,
  extendModal,
  extendIcon,
  extendH2,
  extendText
} from '../../index.js'

const sectionText = extendText({
  options: {
    text: 'Section'
  }
})

const sectionTitle = extendText({
  options: {
    text: 'Manage'
  }
})

const sectionHeading = extendH2({
  children: [sectionTitle]
})

const sectionModalHeaderIcon = extendIcon({
  options: {
    icon: 'fa6-solid:bars-staggered',
    margin: {
      strength: '2',
      direction: 'end'
    }
  }
})

const sectionModalHeaderDivIcon = extendDiv({
  children: [sectionModalHeaderIcon, sectionText],
  options: {
    fontSize: '5'
  }
})

const sectionModalHeaderDiv2 = extendDiv({
  children: [sectionModalHeaderDivIcon, sectionHeading]
})

const icon = extendIcon({
  options: {
    icon: 'mdi:plus-circle-outline'
  }
})

const sectionModalHeaderDiv = extendDiv({
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

const sectionModalHeader = extendModalHeader({
  children: [sectionModalHeaderDiv, sectionModalHeaderDiv2],
  options: {
    backgroundColor: 'light',
    displayFlex: 'always'
  }
})

const sectionModalBody = extendModalBody({
  options: {
    displayFlex: 'always',
    flexDirectionColumn: 'always',
    gapRow: '2'
  },
  events: [
    {
      on: 'component/create',
      actionId: 'select-edit-modal-items'
    }
  ]
})

const sectionModalContent = extendModalContent({
  children: [sectionModalHeader, sectionModalBody],
  options: {
    shadow: 'lg'
  }
})

const sectionModalDialog = extendModalDialog({
  children: [sectionModalContent],
  options: {
    size: 'lg',
    fullscreen: 'md'
  }
})

export default extendModal({
  metadata: {
    id: 'modal-section-edit'
  },
  children: [sectionModalDialog],
  options: {
    ariaLabel: 'Section editor'
  }
})
