import { extendText } from '../text/text.js'
import { extendIcon } from '../icon/icon.js'
import { extendDiv } from '../base/div.js'
import { extendModal } from '../modal/modal.js'
import { extendModalBody } from '../modal/modal-body.js'
import { extendModalDialog } from '../modal/modal-dialog.js'
import { extendModalContent } from '../modal/modal-content.js'
import { extendModalHeader } from '../modal/modal-header.js'
import { extendH2 } from '../base/h2.js'

const sectionText = extendText({
  options: { text: 'Section' }
})

const sectionTitle = extendText({
  options: { text: 'Manage' }
})

const sectionHeading = extendH2({
  children: [sectionTitle]
})

const sectionModalHeaderIcon = extendIcon({
  options: {
    icon: 'fa6-solid:bars-staggered'
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
    icon: 'mdi:plus-circle-outline',
    margin: {
      strength: '1',
      direction: 'end'
    }
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
      on: 'create',
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
