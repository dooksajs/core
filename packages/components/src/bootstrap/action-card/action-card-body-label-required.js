import {
  createText,
  createLabel,
  createSpan
} from '@dooksa/components/base'
import { createIcon } from '@dooksa/components/extra'

const icon = createIcon({
  options: {
    margin: [{
      direction: 'end',
      strength: '2'
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
  options: { value: '' },
  events: [
    {
      on: 'component/created',
      actionId: 'action-card-body-label-text'
    }
  ]
})
const labelStarText = createText({ options: { value: ' *' } })
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
