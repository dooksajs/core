import {
  createNav, createNavLinkButton, createNavItem
} from '@dooksa/components/extra'
import { createText } from '@dooksa/components/base'

// Value tab
const textValue = createText({
  options: {
    value: 'Value'
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
    value: 'Variable'
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
    value: 'Action'
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
