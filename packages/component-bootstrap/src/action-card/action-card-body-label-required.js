import {
  createText,
  createLabel,
  createSpan
} from '@dooksa/component-base'
import { createIcon } from '@dooksa/component-extra'

const icon = createIcon({
  options: {
    margin: [{
      direction: 'end',
      strength: '1'
    }]
  },
  events: [
    {
      on: 'component/created',
      actionId: 'action-card-body-label-icon'
    }
  ]
})
const labelText = createText({
  options: { text: '' },
  events: [
    {
      on: 'component/created',
      actionId: 'action-card-body-label-text'
    }
  ]
})
const labelStarText = createText({ options: { text: ' *' } })
const labelStar = createSpan({
  children: [labelStarText],
  options: { textColor: 'danger' }
})
export default createLabel({
  metadata: { id: 'action-card-body-label-required' },
  children: [icon, labelText, labelStar],
  events: [
    {
      on: 'component/created',
      actionId: 'label-html-for'
    }
  ]
})
