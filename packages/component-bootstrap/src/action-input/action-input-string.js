import { createDiv } from '@dooksa/component-base'
import actionCardBodyLabelTextRequired from '../action-card/action-card-body-label-text-required.js'
import actionInputDataString from './action-input-data-string.js'

export default createDiv({
  metadata: { id: 'action-input-string' },
  children: [
    actionCardBodyLabelTextRequired,
    createDiv({
      children: [
        actionInputDataString
      ],
      options: {
        margin: [{
          direction: 'start',
          strength: '4'
        }]
      }
    })
  ]
})
