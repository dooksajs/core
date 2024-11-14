import {
  createText,
  createLabel
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
  events: [
    {
      on: 'component/created',
      actionId: 'action-card-body-label-text'
    }
  ]
})
export default createLabel({
  metadata: { id: 'action-card-body-label' },
  children: [icon, labelText],
  events: [
    {
      on: 'component/created',
      actionId: 'label-html-for'
    }
  ]
})
