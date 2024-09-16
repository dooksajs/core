import {
  extendDiv,
  extendButton, extendSpan, extendH5, extendText, extendButtonGroup, extendIcon
} from '../../index.js'

const moveUpText = extendText({
  options: {
    text: 'Move up'
  }
})

const moveUpSpan = extendSpan({
  children: [moveUpText],
  options: {
    displayNone: 'always',
    displayInline: 'lg',
    margin: {
      strength: '1',
      direction: 'start'
    }
  }
})

const moveUpBtnIcon = extendIcon({
  options: {
    icon: 'fa-solid:chevron-up'
  }
})

const moveUpBtn = extendButton({
  children: [moveUpBtnIcon, moveUpSpan],
  options: {
    btnVariant: 'outlineSecondary'
  }
})

const moveDownBtnIcon = extendIcon({
  options: {
    icon: 'fa-solid:chevron-down'
  }
})

const moveDownText = extendText({
  options: {
    text: 'Move down'
  }
})

const moveDownSpan = extendSpan({
  children: [moveDownText],
  options: {
    displayNone: 'always',
    displayInline: 'lg',
    margin: {
      strength: '1',
      direction: 'start'
    }
  }
})

const moveDownBtn = extendButton({
  children: [moveDownBtnIcon, moveDownSpan],
  options: {
    btnVariant: 'outlineSecondary'
  }
})

const eventBtnIcon = extendIcon({
  options: {
    icon: 'mdi:gesture-touch-button',
    margin: {
      strength: '1',
      direction: 'end'
    }
  }
})

const eventText = extendText({
  options: {
    text: 'Events'
  }
})


const eventBtn = extendButton({
  children: [eventBtnIcon, eventText],
  options: {
    btnVariant: 'outlinePrimary'
  }
})


const removeBtnIcon = extendIcon({
  options: {
    icon: 'fa6-regular:trash-can',
    margin: {
      strength: '1',
      direction: 'end'
    }
  }
})

const removeText = extendText({
  options: {
    text: 'Remove'
  }
})

const removeSpan = extendSpan({
  children: [removeText],
  options: {
    displayNone: 'always',
    displayInline: 'lg'
  }
})


const removeBtn = extendButton({
  children: [removeBtnIcon, removeSpan],
  options: {
    btnVariant: 'outlineDanger'
  }
})

const btnGroup = extendButtonGroup({
  children: [moveUpBtn, moveDownBtn, eventBtn, removeBtn]
})

const headingText = extendText({
  options: {
    text: 'Component title'
  }
})
const heading = extendH5({
  children: [headingText],
  options: {
    displayFlex: 'always',
    alignItems: {
      position: 'center'
    },
    flexGrow: {
      size: 1
    },
    margin: {
      strength: '0'
    }
  }
})

const container = extendDiv({
  children: [heading, btnGroup],
  options: {
    displayFlex: 'always',
    alignItems: {
      position: 'center'
    }
  }
})

export default extendDiv({
  metadata: {
    id: 'modal-section-edit-item'
  },
  children: [container],
  options: {
    border: 'all',
    rounded: 'regular',
    padding: {
      strength: '3'
    }
  }
})
