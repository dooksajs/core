import {
  createText,
  createSpan,
  createDiv
} from '@dooksa/component-base'
import { createIcon } from '@dooksa/component-extra'

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
export default createDiv({
  metadata: { id: 'action-card-body-label-text-required' },
  children: [icon, labelText, labelStar],
  options: {
    margin: [{
      direction: 'bottom',
      strength: '2'
    }]
  }
})
