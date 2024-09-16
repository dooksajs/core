import {
  extendNav, extendNavLinkButton, extendNavItem
} from '@dooksa/component-extra'
import { extendText } from '@dooksa/component-base'

// Value tab
const textValue = extendText({
  options: {
    text: 'Value'
  }
})

const navLinkValue = extendNavLinkButton({
  children: [textValue]
})

const navItemValue = extendNavItem({
  children: [navLinkValue],
  options: {
    rolePresentation: true
  }
})

// Variable tab
const textVariable = extendText({
  options: {
    text: 'Variable'
  }
})

const navLinkVariable = extendNavLinkButton({
  children: [textVariable]
})

const navItemVariable = extendNavItem({
  children: [navLinkVariable],
  options: {
    rolePresentation: true
  }
})

// Action tab
const textAction = extendText({
  options: {
    text: 'Action'
  }
})

const navLinkAction = extendNavLinkButton({
  children: [textAction]
})

const navItemAction = extendNavItem({
  children: [navLinkAction],
  options: {
    rolePresentation: true
  }
})

export default extendNav({
  metadata: {
    id: 'action-tabs'
  },
  children: [navItemValue, navItemVariable, navItemAction],
  options: {
    roleTablist: true,
    tabs: 'tab'
  }
})
