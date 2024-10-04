import {
  extendText,
  extendLabel
} from '@dooksa/component-base'
import { extendIcon } from '@dooksa/component-extra'

const icon = extendIcon({
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
const labelText = extendText({
  options: { text: '' },
  events: [
    {
      on: 'component/created',
      actionId: 'action-card-body-label-text'
    }
  ]
})
export default extendLabel({
  metadata: { id: 'action-card-body-label' },
  children: [icon, labelText],
  events: [
    {
      on: 'component/created',
      actionId: 'label-html-for'
    }
  ]
})
