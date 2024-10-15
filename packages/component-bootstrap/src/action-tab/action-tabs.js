import {
  createNav, createNavLinkButton, createNavItem
} from '@dooksa/component-extra'
import { createText } from '@dooksa/component-base'

// Value tab
const textValue = createText({
  options: {
    text: 'Value'
  }
})

const navLinkValue = createNavLinkButton({
  children: [textValue]
})

const navItemValue = createNavItem({
  children: [navLinkValue],
  options: {
    rolePresentation: true
  }
})

// Variable tab
const textVariable = createText({
  options: {
    text: 'Variable'
  }
})

const navLinkVariable = createNavLinkButton({
  children: [textVariable]
})

const navItemVariable = createNavItem({
  children: [navLinkVariable],
  options: {
    rolePresentation: true
  }
})

// Action tab
const textAction = createText({
  options: {
    text: 'Action'
  }
})

const navLinkAction = createNavLinkButton({
  children: [textAction]
})

const navItemAction = createNavItem({
  children: [navLinkAction],
  options: {
    rolePresentation: true
  }
})

export default createNav({
  metadata: {
    id: 'action-tabs'
  },
  children: [navItemValue, navItemVariable, navItemAction],
  options: {
    roleTablist: true,
    tabs: 'tab'
  }
})
