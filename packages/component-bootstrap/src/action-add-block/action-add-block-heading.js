import {
  createSmall,
  createText
} from '@dooksa/component-base'
import {
  createAccordionHeader,
  createIcon
} from '@dooksa/component-extra'

const actionHeadingText = createText({ options: { text: 'Add action block ' } })
const actionSubHeadingText = createText({ options: { text: '- Expand to select action' } })
const actionSubHeading = createSmall({
  children: [actionSubHeadingText],
  options: { textColor: 'secondary' }
})

const actionHeadingIcon = createIcon({
  options: {
    margin: [{
      direction: 'end',
      strength: '1'
    }],
    icon: 'material-symbols:code-blocks'
  }
})

export default createAccordionHeader({
  children: [
    actionHeadingIcon,
    actionHeadingText,
    actionSubHeading
  ]
})
