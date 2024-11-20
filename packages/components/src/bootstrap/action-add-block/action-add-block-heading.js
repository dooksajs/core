import {
  createSmall,
  createText
} from '@dooksa/components/base'
import {
  createAccordionHeader,
  createIcon
} from '@dooksa/components/extra'

const actionHeadingText = createText({ options: { value: 'Add action block ' } })
const actionSubHeadingText = createText({ options: { value: '- Expand to select action' } })
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
