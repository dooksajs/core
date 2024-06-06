import { createComponent, extendComponent } from '@dooksa/create-component'
import { extendText } from '../text/text.js'
import { extendIcon } from '../icon/icon.js'
import { extendDiv } from '../base/div.js'
import { extendButton } from '../button/button.js'
import { extendHr } from '../base/hr.js'

const editText = extendText({
  options: { text: 'Add component' },
  events: [
    {
      on: 'click',
      actionId: 'add-component'
    }
  ]
})

const btnIcon = extendIcon({
  options: {
    icon: 'mdi:plus-circle-outline',
    margin: {
      strength: '1',
      direction: 'end'
    }
  }
})

const btn = extendButton({
  children: [btnIcon, editText],
  options: {
    btnVariant: 'outlineSecondary'
  }
})

const middleDiv = extendDiv({
  children: [btn],
  options: {
    padding: {
      strength: '2',
      direction: 'xAxis'
    }
  }
})

const hr = extendHr({
  options: {
    flexGrow: {
      size: '1'
    }
  }
})

export default createComponent({
  id: 'add-component-button',
  tag: 'div',
  children: [hr, middleDiv, hr],
  properties: [
    {
      name: 'className',
      value: 'd-flex my-2 align-items-center'
    }
  ]
})
