import {
  extendSmall,
  extendText
} from '@dooksa/component-base'
import {
  extendAccordionHeader,
  extendIcon
} from '@dooksa/component-extra'

const actionHeadingText = extendText({ options: { text: 'Add action block ' } })
const actionSubHeadingText = extendText({ options: { text: '- Expand to select action' } })
const actionSubHeading = extendSmall({
  children: [actionSubHeadingText],
  options: { textColor: 'secondary' }
})

const actionHeadingIcon = extendIcon({
  options: {
    margin: [{
      direction: 'end',
      strength: '1'
    }],
    icon: 'material-symbols:code-blocks'
  }
})

export default extendAccordionHeader({
  children: [
    actionHeadingIcon,
    actionHeadingText,
    actionSubHeading
  ]
})
